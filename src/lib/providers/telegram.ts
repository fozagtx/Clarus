import { formatTelegramAlert } from "@/lib/engine/execution";
import type { EvaluationResult } from "@/lib/engine/types";

export async function dispatchTelegramAlert(result: EvaluationResult): Promise<boolean> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId || !result.execution) return false;

  const body = {
    chat_id: chatId,
    text: formatTelegramAlert(result.token, result.execution),
    parse_mode: "Markdown",
    disable_web_page_preview: true,
    reply_markup: {
      inline_keyboard: [
        [
          { text: "Open Wallet & Verify Trade", url: result.execution.jupiterUrl },
          { text: "Binance Web3", url: result.execution.binanceWeb3Url },
        ],
      ],
    },
  };

  const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  return res.ok;
}
