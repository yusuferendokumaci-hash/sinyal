import { NextResponse } from 'next/server';
import { fetchTodayFixtures } from '@/lib/api-football';
import { generatePredictions } from '@/lib/predictions';
import { generateDailyPick, calculateCoupon, probToOdds } from '@/lib/coupon';
import { matches as mockMatches, Match } from '@/lib/mock-data';
import { getMarketName, getOptionName } from '@/lib/i18n';

export const dynamic = 'force-dynamic';

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';
const CHANNEL_ID = process.env.TELEGRAM_CHANNEL_ID || '';

async function sendTelegram(text: string) {
  const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: CHANNEL_ID,
      text,
      parse_mode: 'HTML',
      disable_web_page_preview: true,
    }),
  });
  return res.json();
}

// Generate alternative coupon (different from main picks)
function generateAltCoupon(matches: Match[], mainPickIds: Set<string>) {
  const candidates: { match: Match; label: string; option: string; prob: number; odds: number }[] = [];

  for (const match of matches) {
    if (mainPickIds.has(match.id)) continue; // Skip matches already in main coupon
    let pred;
    try { pred = generatePredictions(match); } catch { continue; }

    for (const cat of pred.categories) {
      for (const market of cat.markets) {
        for (const opt of market.options) {
          const odds = opt.bookmakerOdds || probToOdds(opt.probability);
          if (odds >= 1.50 && odds <= 4.00 && opt.probability >= 40) {
            candidates.push({
              match,
              label: market.label,
              option: opt.name,
              prob: opt.probability,
              odds,
            });
          }
        }
      }
    }
  }

  candidates.sort((a, b) => (b.prob * b.odds) - (a.prob * a.odds));

  const selected: typeof candidates = [];
  const usedIds = new Set<string>();

  for (const c of candidates) {
    if (selected.length >= 3) break;
    if (usedIds.has(c.match.id)) continue;
    usedIds.add(c.match.id);
    selected.push(c);
  }

  return selected;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get('secret');
  if (secret !== 'sinyal2026') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!BOT_TOKEN || !CHANNEL_ID) {
    return NextResponse.json({ error: 'Telegram not configured' });
  }

  try {
    let matches: Match[] = mockMatches;
    try {
      const apiMatches = await fetchTodayFixtures();
      if (apiMatches?.length) matches = apiMatches;
    } catch {}

    const now = new Date();
    const dateStr = now.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
    const totalMatches = matches.length;

    // --- KUPON 1: Ana Kupon (en yuksek guven) ---
    const picks = generateDailyPick(matches);
    const coupon = calculateCoupon(picks);
    const mainPickIds = new Set(picks.map(p => p.matchId));

    let msg = `⚡⚡⚡ <b>SINYAL - ${dateStr.toUpperCase()}</b> ⚡⚡⚡\n`;
    msg += `━━━━━━━━━━━━━━━━━━━━\n\n`;

    // Kupon 1
    msg += `🏆 <b>KUPON 1 - ANA KUPON</b>\n`;
    msg += `💎 En yuksek guvenli tahminler\n\n`;

    if (picks.length > 0) {
      picks.forEach((pick, i) => {
        const matchData = matches.find(m => m.id === pick.matchId);
        const home = matchData?.homeTeam.name || '?';
        const away = matchData?.awayTeam.name || '?';
        const league = matchData?.league || '';
        const marketName = getMarketName('tr', pick.marketLabel);
        const optionName = getOptionName('tr', pick.optionName);

        msg += `${i + 1}. <b>${home} vs ${away}</b>\n`;
        msg += `   🏟 ${league}\n`;
        msg += `   ✅ ${marketName} → <b>${optionName}</b>\n`;
        msg += `   📊 %${pick.probability} | ⚡ <b>${pick.odds}x</b>\n\n`;
      });

      msg += `💰 Toplam Oran: <b>${coupon.totalOdds}x</b>\n`;
      msg += `🎯 Olasilik: <b>%${coupon.totalProbability}</b>\n`;
    }

    msg += `\n━━━━━━━━━━━━━━━━━━━━\n\n`;

    // --- KUPON 2: Alternatif Kupon ---
    const altPicks = generateAltCoupon(matches, mainPickIds);

    msg += `🔥 <b>KUPON 2 - ALTERNATIF</b>\n`;
    msg += `🎲 Yuksek oranli secimler\n\n`;

    if (altPicks.length > 0) {
      let altTotalOdds = 1;
      altPicks.forEach((pick, i) => {
        const marketName = getMarketName('tr', pick.label);
        const optionName = getOptionName('tr', pick.option);
        altTotalOdds *= pick.odds;

        msg += `${i + 1}. <b>${pick.match.homeTeam.name} vs ${pick.match.awayTeam.name}</b>\n`;
        msg += `   🏟 ${pick.match.league}\n`;
        msg += `   ✅ ${marketName} → <b>${optionName}</b>\n`;
        msg += `   📊 %${pick.prob} | ⚡ <b>${pick.odds}x</b>\n\n`;
      });

      msg += `💰 Toplam Oran: <b>${Math.round(altTotalOdds * 100) / 100}x</b>\n`;
    } else {
      msg += `Yeterli mac bulunamadi.\n`;
    }

    msg += `\n━━━━━━━━━━━━━━━━━━━━\n\n`;

    // --- Gunun maclari ozet (sadece 3-4 mac goster, gerisini merak ettir) ---
    const showCount = Math.min(3, totalMatches);
    const hiddenCount = totalMatches - showCount;

    msg += `⚽ <b>GUNUN MACLARI</b> (${totalMatches} mac)\n\n`;

    for (const match of matches.slice(0, showCount)) {
      let pred;
      try { pred = generatePredictions(match); } catch { continue; }
      const conf = pred.mainPrediction.confidence;
      const isBanko = conf >= 70;

      msg += `${isBanko ? '🔥' : '⚽'} <b>${match.homeTeam.name} vs ${match.awayTeam.name}</b>\n`;
      msg += `   ${match.league} | ${match.kickoff}\n\n`;
    }

    if (hiddenCount > 0) {
      msg += `👀 <b>+${hiddenCount} mac daha!</b>\n`;
      msg += `Tum tahminler, detayli analizler ve oranlar icin:\n\n`;
    }

    msg += `🌐 <b>sinyal-bay.vercel.app</b>\n\n`;
    msg += `📱 Instagram: @_sinyal_1\n`;
    msg += `🎵 TikTok: @sinyal695\n\n`;
    msg += `━━━━━━━━━━━━━━━━━━━━\n`;
    msg += `🤖 <i>SINYAL AI - Yapay Zeka Futbol Tahmin</i>`;

    const result = await sendTelegram(msg);

    return NextResponse.json({
      success: result.ok,
      matchCount: totalMatches,
      pickCount: picks.length,
      altPickCount: altPicks.length,
    });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to send', details: String(err) });
  }
}
