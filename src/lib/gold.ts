export type Entry = { id: string; date: string; amount: string };
export type GoldPrice = { buy: number; sell: number };
export type PriceMode = "sell" | "buy";
export type Metal = "bar" | "jewelry" | "fine";

export const METALS: Record<
  Metal,
  { short: string; purity: string; label: string; factor: number }
> = {
  bar: { short: "ทองแท่ง", purity: "96.5%", label: "ทองคำแท่ง 96.5%", factor: 1 },
  jewelry: { short: "รูปพรรณ", purity: "96.5%", label: "ทองรูปพรรณ 96.5%", factor: 1 },
  fine: { short: "บริสุทธิ์", purity: "99.99%", label: "ทองคำ 99.99%", factor: 99.99 / 96.5 },
};

export const PRICE_MODES: Record<PriceMode, { label: string; hint: string }> = {
  sell: { label: "ราคาขายออก", hint: "ราคาที่ร้านทองขายให้เรา" },
  buy: { label: "ราคารับซื้อ", hint: "ราคาที่ร้านทองรับซื้อคืน" },
};

export const BANGKOK = "Asia/Bangkok";
export const STORAGE_KEY = "aurum.entries.v2";
export const LEGACY_STORAGE_KEY = "aurum-entries";

/* ── Formatting ─────────────────────────────────────────────────────────── */

const baht = new Intl.NumberFormat("th-TH", {
  style: "currency",
  currency: "THB",
  maximumFractionDigits: 2,
});
const bahtWhole = new Intl.NumberFormat("th-TH", {
  style: "currency",
  currency: "THB",
  maximumFractionDigits: 0,
});
const decimal = new Intl.NumberFormat("th-TH", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export const money = (value: number) => baht.format(value);
export const moneyWhole = (value: number) => bahtWhole.format(value);
export const number = (value: number) => decimal.format(value);
export const signedMoney = (value: number) =>
  `${value >= 0 ? "+" : "−"}${baht.format(Math.abs(value))}`;
export const signedPercent = (value: number) =>
  `${value >= 0 ? "+" : "−"}${Math.abs(value).toFixed(2)}%`;

/* ── Dates ──────────────────────────────────────────────────────────────────
   Entries store an ISO (Gregorian) date so the native date picker can own the
   input. Thai users read Buddhist years, so everything user-facing converts. */

const isoParts = (date: Date) => {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: BANGKOK,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const get = (type: string) => parts.find((part) => part.type === type)?.value ?? "";
  return { year: get("year"), month: get("month"), day: get("day") };
};

/** Today in Bangkok as `YYYY-MM-DD`. */
export const todayIso = () => {
  const { year, month, day } = isoParts(new Date());
  return `${year}-${month}-${day}`;
};

export const isValidIsoDate = (value: string) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
};

/** `2026-01-21` → `21/01/2569` (Buddhist era), for display. */
export const toThaiDate = (iso: string) => {
  if (!isValidIsoDate(iso)) return "—";
  const [year, month, day] = iso.split("-");
  return `${day}/${month}/${Number(year) + 543}`;
};

/** `2026-01-21` → `21/1/2026`, the shape the price API expects. */
export const toApiDate = (iso: string) => {
  const [year, month, day] = iso.split("-").map(Number);
  return `${day}/${month}/${year}`;
};

/** Accepts `21/01/2569`, `21-1-69`, `2026-01-21` → ISO, or `""` when unparseable. */
export const parseLooseDate = (value: string): string => {
  const text = value.trim().replaceAll("-", "/");
  if (/^\d{4}\/\d{1,2}\/\d{1,2}$/.test(text)) {
    const [year, month, day] = text.split("/").map(Number);
    const iso = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return isValidIsoDate(iso) ? iso : "";
  }
  const match = text.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2}|\d{4})$/);
  if (!match) return "";
  const day = Number(match[1]);
  const month = Number(match[2]);
  let year = Number(match[3]);
  if (year < 100) year += 2500; // two-digit Buddhist year, e.g. 69 → 2569
  if (year >= 2400) year -= 543; // Buddhist era → Gregorian
  const iso = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  return isValidIsoDate(iso) ? iso : "";
};

/* ── Plain-text entry lines ─────────────────────────────────────────────────
   One shared definition of the `date : amount` line, used by both the import
   parser and the export writer so a round trip is lossless by construction. */

/**
 * Splits one pasted line into its date and amount halves.
 *
 * An explicit delimiter wins, and only the *first* one counts — a later comma
 * is a thousands separator inside the amount, not a separator. Falling back to
 * whitespace keeps `21/01/2569 91558.15` working.
 */
export const splitEntryLine = (line: string): [string, string] => {
  const text = line.trim();
  const explicit = text.match(/^(.*?)\s*[:;\t,]\s*(.*)$/);
  if (explicit) return [explicit[1], explicit[2]];
  const spaced = text.match(/^(.*?)\s+(.*)$/);
  return spaced ? [spaced[1], spaced[2]] : [text, ""];
};

/** The canonical export line: `21/01/2569 : 91558.15`. */
export const toEntryLine = (entry: Entry) =>
  `${toThaiDate(entry.date)} : ${entry.amount.replaceAll(",", "").trim()}`;

/** True when an entry carries enough to survive a round trip through text. */
export const isExportable = (entry: Entry) =>
  isValidIsoDate(entry.date) && parseAmount(entry.amount) > 0;

export const toEntriesText = (entries: Entry[]) =>
  entries.filter(isExportable).map(toEntryLine).join("\n");

export const formatUpdatedAt = (value: string | null) =>
  value
    ? new Intl.DateTimeFormat("th-TH-u-nu-latn", {
        timeZone: BANGKOK,
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }).format(new Date(value)) + " น."
    : "—";

/* ── Calculation ────────────────────────────────────────────────────────── */

export const parseAmount = (value: string) =>
  Number(value.replaceAll(",", "").trim()) || 0;

export type EntryIssue = "date" | "amount" | null;

export const entryIssue = (entry: Entry): EntryIssue => {
  if (entry.date && !isValidIsoDate(entry.date)) return "date";
  if (entry.date && entry.date > todayIso()) return "date";
  if (entry.amount.trim() && parseAmount(entry.amount) <= 0) return "amount";
  return null;
};

export type Row = Omit<Entry, "amount"> & {
  index: number;
  /** Purchase amount in THB, parsed from the raw input. */
  amount: number;
  /** Reference price per baht-weight on the purchase date, or null if unknown. */
  price: number | null;
  /** Weight purchased, in baht-gold (BG). */
  weight: number;
  /** Value of that weight at today's price, before fees. */
  value: number;
  fee: number;
  net: number;
  profit: number;
  profitPercent: number;
};

export type Totals = {
  principal: number;
  value: number;
  weight: number;
  fees: number;
  profit: number;
  profitPercent: number;
  priced: number;
  unpriced: number;
};

export const buildRows = (options: {
  entries: Entry[];
  current: GoldPrice | null;
  historical: Record<string, GoldPrice | null>;
  mode: PriceMode;
  metal: Metal;
  feePercent: number;
  makingFee: number;
}): Row[] => {
  const { entries, current, historical, mode, metal, feePercent, makingFee } = options;
  const factor = METALS[metal].factor;
  const today = todayIso();
  const currentPrice = current ? current[mode] * factor : 0;

  return entries.map((entry, index) => {
    const amount = parseAmount(entry.amount);
    const source =
      entry.date === today && current ? current : historical[toApiDate(entry.date)];
    const base = source?.[mode] ?? null;
    const price = base ? base * factor : null;
    const weight = price ? amount / price : 0;
    const value = weight * currentPrice;
    const fee = (amount * feePercent) / 100 + makingFee;
    const net = value - fee;
    const profit = price ? net - amount : 0;
    return {
      ...entry,
      index,
      amount,
      price,
      weight,
      value,
      fee,
      net,
      profit,
      profitPercent: amount ? (profit / amount) * 100 : 0,
    };
  });
};

export const buildTotals = (rows: Row[]): Totals => {
  const priced = rows.filter((row) => row.price !== null);
  const principal = priced.reduce((sum, row) => sum + row.amount, 0);
  const value = priced.reduce((sum, row) => sum + row.net, 0);
  const profit = value - principal;
  return {
    principal,
    value,
    weight: priced.reduce((sum, row) => sum + row.weight, 0),
    fees: priced.reduce((sum, row) => sum + row.fee, 0),
    profit,
    profitPercent: principal ? (profit / principal) * 100 : 0,
    priced: priced.length,
    unpriced: rows.length - priced.length,
  };
};

export const newEntry = (date = "", amount = ""): Entry => ({
  id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
  date,
  amount,
});

/** Reads either the v2 (ISO) or the legacy Buddhist-date shape. */
export const migrateEntries = (raw: unknown): Entry[] | null => {
  if (!Array.isArray(raw)) return null;
  const entries = raw.flatMap((item): Entry[] => {
    if (!item || typeof item !== "object") return [];
    const { id, date, amount } = item as {
      id?: unknown;
      date?: unknown;
      amount?: unknown;
    };
    const rawDate = typeof date === "string" ? date : "";
    const entry = newEntry(
      isValidIsoDate(rawDate) ? rawDate : parseLooseDate(rawDate),
      typeof amount === "string" ? amount : String(amount ?? ""),
    );
    // The id is the row's React key, and this runs on every read — including
    // after every keystroke. Minting a fresh one would remount the row's
    // inputs and drop focus mid-edit, so keep whatever was stored and only
    // generate for legacy rows that never had one.
    return [typeof id === "string" && id ? { ...entry, id } : entry];
  });
  return entries.length ? entries : null;
};

export const toCsv = (rows: Row[]) => {
  const header = [
    "วันที่ซื้อ",
    "เงินต้น (บาท)",
    "ราคาอ้างอิง (บาท/บาททอง)",
    "น้ำหนัก (บาททอง)",
    "มูลค่าปัจจุบัน (บาท)",
    "ค่าธรรมเนียม (บาท)",
    "กำไร/ขาดทุน (บาท)",
  ];
  const body = rows.map((row) => [
    toThaiDate(row.date),
    row.amount.toFixed(2),
    row.price?.toFixed(2) ?? "",
    row.price ? row.weight.toFixed(4) : "",
    row.price ? row.net.toFixed(2) : "",
    row.fee.toFixed(2),
    row.price ? row.profit.toFixed(2) : "",
  ]);
  return [header, ...body]
    .map((line) =>
      line.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(","),
    )
    .join("\r\n");
};
