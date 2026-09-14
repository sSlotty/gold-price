import { NextRequest, NextResponse } from "next/server";

const SOURCE = "https://classic.goldtraders.or.th";

/**
 * One upstream request per distinct date plus one for the current price, against
 * a slow origin. The platform default (10s) can be tight for a portfolio with
 * many dates on a cold cache; `preferredRegion` is deprecated in Next 16, so the
 * deploy region is set in `vercel.json` instead.
 */
export const maxDuration = 30;

const UA = { "User-Agent": "Aurum Gold Calculator/1.0" };

/** `"71,450.00"` → 71450, `"n/a"` → null. */
const num = (value: string | undefined) => {
  if (!value) return null;
  const parsed = Number(value.replaceAll(",", ""));
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
};

const flatten = (html: string) =>
  html
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ");

const AMOUNT = String.raw`(n/a|[\d,]+\.\d{2})`;

/**
 * The two upstream pages publish the same figures in different shapes.
 *
 * Daily archive — a table of `ชนิดทอง | รับซื้อ กรัมละ | รับซื้อ บาทละ | ขาย บาทละ`:
 *   ทองคำแท่ง 96.5%    n/a       71,450.00  71,550.00
 *   ทองรูปพรรณ 96.5%   4,619.00  70,024.04  72,350.00
 *
 * Home page — today's announcement, inline:
 *   ทองคำแท่ง 96.5% ขายออก 67,600.00 รับซื้อ 67,400.00
 *   ทองรูปพรรณ 96.5% ขายออก 68,400.00
 *
 * The home page omits the jewellery buy-back price, so that one field is null
 * for today rather than guessed at.
 */
const priceFor = (text: string, label: string) => {
  const archive = text.match(
    new RegExp(`${label}\\s*96\\.5%\\s*${AMOUNT}\\s+${AMOUNT}\\s+${AMOUNT}`),
  );
  if (archive) {
    const buy = num(archive[2]);
    const sell = num(archive[3]);
    return buy || sell ? { buy, sell } : null;
  }

  const today = text.match(
    new RegExp(`${label}\\s*96\\.5%\\s*ขายออก\\s*${AMOUNT}(?:\\s*รับซื้อ\\s*${AMOUNT})?`),
  );
  if (today) {
    const sell = num(today[1]);
    const buy = num(today[2]);
    return buy || sell ? { buy, sell } : null;
  }

  return null;
};

const parsePrices = (html: string) => {
  const text = flatten(html);
  const bar = priceFor(text, "ทองคำแท่ง");
  const jewelry = priceFor(text, "ทองรูปพรรณ");
  return bar || jewelry ? { bar, jewelry } : null;
};

const buddhistDate = (value: string) => {
  const [day, month, year] = value.replaceAll("-", "/").split("/").map(Number);
  if (!day || !month || !year) return null;
  return { day, month, year: year < 2400 ? year + 543 : year };
};

export async function GET(request: NextRequest) {
  const dates = [
    ...new Set(
      (request.nextUrl.searchParams.get("dates") || "")
        .split(",")
        .map((value) => value.trim())
        .filter(Boolean),
    ),
  ];

  try {
    const results = await Promise.all(
      dates.map(async (date) => {
        const parsed = buddhistDate(date);
        if (!parsed) return [date, null] as const;
        const url = `${SOURCE}/DailyPrices_Print.aspx?as=${parsed.day}%2F${parsed.month}%2F${parsed.year}%200%3A00%3A00`;
        const response = await fetch(url, { next: { revalidate: 900 }, headers: UA });
        if (!response.ok) return [date, null] as const;
        return [date, parsePrices(await response.text())] as const;
      }),
    );

    const currentResponse = await fetch(`${SOURCE}/`, {
      next: { revalidate: 300 },
      headers: UA,
    });
    const current = currentResponse.ok ? parsePrices(await currentResponse.text()) : null;

    return NextResponse.json({
      current,
      historical: Object.fromEntries(results),
      updatedAt: new Date().toISOString(),
      source: SOURCE,
    });
  } catch {
    return NextResponse.json(
      { error: "ไม่สามารถดึงราคาทองจากสมาคมค้าทองคำได้ในขณะนี้" },
      { status: 502 },
    );
  }
}
