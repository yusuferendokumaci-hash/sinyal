import { NextResponse } from 'next/server';
import { matches as mockMatches, Match } from '@/lib/mock-data';
import { generatePredictions } from '@/lib/predictions';
import { generateDailyPick, calculateCoupon } from '@/lib/coupon';
import { getMarketName, getOptionName } from '@/lib/i18n';

export const dynamic = 'force-dynamic';

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';

async function sendReply(chatId: number, text: string) {
  await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: 'HTML',
      disable_web_page_preview: true,
    }),
  });
}

export async function POST(request: Request) {
  if (!BOT_TOKEN) return NextResponse.json({ ok: true });

  try {
    const body = await request.json();
    const message = body.message;
    if (!message?.text) return NextResponse.json({ ok: true });

    const chatId = message.chat.id;
    const text = message.text.trim().toLowerCase();
    const userName = message.from?.first_name || 'Dostum';

    // Get matches (mock for now, API when available)
    const matches = mockMatches;

    if (text === '/start') {
      await sendReply(chatId,
        `Merhaba ${userName}! ⚡\n\n` +
        `<b>SINYAL</b> - AI Futbol Tahmin Botu\n\n` +
        `Kullanabilecegi komutlar:\n` +
        `/tahmin - Gunun mac tahminleri\n` +
        `/kupon - Gunun en iyi kuponu\n` +
        `/canli - Canli maclar\n` +
        `/hakkinda - Bot hakkinda\n\n` +
        `🌐 Web: sinyal.vercel.app`
      );
    }

    else if (text === '/tahmin') {
      let msg = `⚽ <b>GUNUN MACLARI</b>\n\n`;

      for (const match of matches.slice(0, 6)) {
        const pred = generatePredictions(match);
        const conf = pred.mainPrediction.confidence;
        const isBanko = conf >= 70;

        msg += `${isBanko ? '🔥 BANKO ' : '⚽ '}<b>${match.homeTeam.name} vs ${match.awayTeam.name}</b>\n`;
        msg += `🏆 ${match.league} | ⏰ ${match.kickoff}\n`;
        msg += `🎯 ${pred.mainPrediction.label}\n`;
        msg += `📈 %${conf} | ${pred.mainPrediction.odds}x\n\n`;
      }

      msg += `🌐 Detay: sinyal.vercel.app`;
      await sendReply(chatId, msg);
    }

    else if (text === '/kupon') {
      const picks = generateDailyPick(matches);
      const coupon = calculateCoupon(picks);

      let msg = `⚡ <b>GUNUN KUPONU</b>\n\n`;

      if (picks.length > 0) {
        picks.forEach((pick, i) => {
          const matchData = matches.find(m => m.id === pick.matchId);
          const home = matchData?.homeTeam.name || '?';
          const away = matchData?.awayTeam.name || '?';
          msg += `${i + 1}️⃣ <b>${home} vs ${away}</b>\n`;
          msg += `   📊 ${getMarketName('tr', pick.marketLabel)} → <b>${getOptionName('tr', pick.optionName)}</b>\n`;
          msg += `   📈 %${pick.probability} | <b>${pick.odds}x</b>\n\n`;
        });

        msg += `━━━━━━━━━━━━━━━━\n`;
        msg += `💰 Toplam Oran: <b>${coupon.totalOdds}x</b>\n`;
        msg += `🎯 Birlesik: <b>%${coupon.totalProbability}</b>`;
      } else {
        msg += `Bugun icin uygun kupon bulunamadi.`;
      }

      await sendReply(chatId, msg);
    }

    else if (text === '/canli') {
      await sendReply(chatId,
        `⚽ <b>CANLI MACLAR</b>\n\n` +
        `Canli mac bilgileri icin sitemizi ziyaret edin:\n` +
        `🌐 sinyal.vercel.app\n\n` +
        `Header'daki LIVE butonuna tiklayarak canli skorlari gorebilirsiniz.`
      );
    }

    else if (text === '/hakkinda') {
      await sendReply(chatId,
        `ℹ️ <b>SINYAL Hakkinda</b>\n\n` +
        `SINYAL, yapay zeka destekli futbol tahmin platformudur.\n\n` +
        `🔬 Dixon-Coles + Poisson istatistik modeli\n` +
        `📊 25+ lig, gercek bahisci oranlari\n` +
        `🎯 Banko tahminler ve gunun kuponu\n` +
        `🔄 Gercek zamanli canli skor takibi\n\n` +
        `📱 Telegram: @sinyaltahminleri\n` +
        `🌐 Web: sinyal.vercel.app\n\n` +
        `<i>Bu bot bilgi amaclidir. Bahis kararlari size aittir.</i>`
      );
    }

    else {
      await sendReply(chatId,
        `Komutu anlamadim. Kullanabilecegin komutlar:\n\n` +
        `/tahmin - Gunun tahminleri\n` +
        `/kupon - Gunun kuponu\n` +
        `/canli - Canli maclar\n` +
        `/hakkinda - Bot hakkinda`
      );
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: true });
  }
}
