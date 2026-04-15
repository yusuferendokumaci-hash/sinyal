import { NextResponse } from 'next/server';
import { fetchTodayFixtures } from '@/lib/api-football';
import { generatePredictions } from '@/lib/predictions';
import { generateDailyPick, calculateCoupon } from '@/lib/coupon';
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

export async function GET(request: Request) {
  // Simple auth check
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get('secret');
  if (secret !== 'sinyal2026') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!BOT_TOKEN || !CHANNEL_ID) {
    return NextResponse.json({ error: 'Telegram not configured' });
  }

  try {
    // Get today's matches
    let matches: Match[] = mockMatches;
    try {
      const apiMatches = await fetchTodayFixtures();
      if (apiMatches?.length) matches = apiMatches;
    } catch {}

    const now = new Date();
    const dateStr = now.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });

    // --- 1. Daily Pick message ---
    const picks = generateDailyPick(matches);
    const coupon = calculateCoupon(picks);

    let msg = `⚡ <b>SINYAL - GUNUN KUPONU</b>\n`;
    msg += `📅 ${dateStr}\n\n`;

    if (picks.length > 0) {
      picks.forEach((pick, i) => {
        const marketName = getMarketName('tr', pick.marketLabel);
        const optionName = getOptionName('tr', pick.optionName);
        msg += `${i + 1}️⃣ <b>${pick.matchLabel}</b>\n`;
        msg += `   📊 ${marketName} → <b>${optionName}</b>\n`;
        msg += `   📈 %${pick.probability} | Oran: <b>${pick.odds}x</b>\n\n`;
      });

      msg += `━━━━━━━━━━━━━━━━\n`;
      msg += `💰 Toplam Oran: <b>${coupon.totalOdds}x</b>\n`;
      msg += `🎯 Birlesik Olasilik: <b>%${coupon.totalProbability}</b>\n\n`;
    } else {
      msg += `Bugun icin uygun kupon bulunamadi.\n\n`;
    }

    // --- 2. All matches summary ---
    msg += `⚽ <b>GUNUN MACLARI (${matches.length} mac)</b>\n\n`;

    for (const match of matches.slice(0, 8)) {
      const pred = generatePredictions(match);
      const conf = pred.mainPrediction.confidence;
      const isBanko = conf >= 70;

      msg += `${isBanko ? '🔥' : '⚽'} <b>${match.homeTeam.name} vs ${match.awayTeam.name}</b>\n`;
      msg += `   🏆 ${match.league} | ⏰ ${match.kickoff}\n`;
      msg += `   🎯 ${pred.mainPrediction.label} (%${conf})`;
      if (pred.mainPrediction.odds) msg += ` | ${pred.mainPrediction.odds}x`;
      msg += `\n`;

      // Show 1X2 odds if available
      const m1x2 = pred.categories[0]?.markets[0];
      if (m1x2) {
        const opts = m1x2.options;
        const homeOdd = opts[0]?.bookmakerOdds?.toFixed(2) || `%${opts[0]?.probability}`;
        const drawOdd = opts[1]?.bookmakerOdds?.toFixed(2) || `%${opts[1]?.probability}`;
        const awayOdd = opts[2]?.bookmakerOdds?.toFixed(2) || `%${opts[2]?.probability}`;
        msg += `   1: ${homeOdd} | X: ${drawOdd} | 2: ${awayOdd}\n`;
      }
      msg += `\n`;
    }

    msg += `━━━━━━━━━━━━━━━━\n`;
    msg += `🤖 <i>SINYAL AI Tahmin Motoru</i>\n`;
    msg += `🌐 sinyal.vercel.app`;

    // Send message
    const result = await sendTelegram(msg);

    return NextResponse.json({
      success: result.ok,
      matchCount: matches.length,
      pickCount: picks.length,
    });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to send', details: String(err) });
  }
}
