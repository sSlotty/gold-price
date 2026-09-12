import { NextRequest, NextResponse } from "next/server";

const SOURCE = "https://classic.goldtraders.or.th";
const parsePrice = (html: string) => {
  const text = html.replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/\s+/g, " ");
  const historicalMatch = text.match(/ทองคำแท่ง 96\.5%\s+n\/a\s+([\d,]+\.\d{2})\s+([\d,]+\.\d{2})/);
  if (historicalMatch) return { buy: Number(historicalMatch[1].replaceAll(",", "")), sell: Number(historicalMatch[2].replaceAll(",", "")) };
  const currentMatch = text.match(/ทองคำแท่ง 96\.5%\s+ขายออก\s+([\d,]+\.\d{2})/);
  if (currentMatch) return { buy: 0, sell: Number(currentMatch[1].replaceAll(",", "")) };
  return null;
};

const buddhistDate = (value: string) => {
  const [day, month, year] = value.replaceAll("-", "/").split("/").map(Number);
  if (!day || !month || !year) return null;
  return { day, month, year: year < 2400 ? year + 543 : year };
};

export async function GET(request: NextRequest) {
  const dates = [...new Set((request.nextUrl.searchParams.get("dates") || "").split(",").map(value => value.trim()).filter(Boolean))];
  try {
    const results = await Promise.all(dates.map(async date => {
      const parsed = buddhistDate(date);
      if (!parsed) return [date, null] as const;
      const url = `${SOURCE}/DailyPrices_Print.aspx?as=${parsed.day}%2F${parsed.month}%2F${parsed.year}%200%3A00%3A00`;
      const response = await fetch(url, { next: { revalidate: 900 }, headers: { "User-Agent": "Aurum Gold Calculator/1.0" } });
      if (!response.ok) return [date, null] as const;
      return [date, parsePrice(await response.text())] as const;
    }));
    const currentResponse = await fetch(`${SOURCE}/`, { next: { revalidate: 300 }, headers: { "User-Agent": "Aurum Gold Calculator/1.0" } });
    const current = currentResponse.ok ? parsePrice(await currentResponse.text()) : null;
    return NextResponse.json({ current, historical: Object.fromEntries(results), updatedAt: new Date().toISOString(), source: SOURCE });
  } catch {
    return NextResponse.json({ error: "ไม่สามารถดึงราคาทองจากสมาคมค้าทองคำได้ในขณะนี้" }, { status: 502 });
  }
}
