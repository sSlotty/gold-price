# Aurum — เครื่องคำนวณมูลค่าทองคำ

A Thai gold portfolio calculator. You enter the **money you spent** and the **date you bought**, and it works backwards through the historical spot price from the Gold Traders Association of Thailand to figure out how much gold that bought — then values that weight at today's price.

Most gold calculators ask for the weight. Thai buyers usually remember the baht amount on the receipt, not the น้ำหนัก, so this one starts from the number people actually have.

Everything runs client-side. Entries live in `localStorage` and never leave the browser.

---

## Features

- **Work backwards from a purchase amount** — enter `฿91,558.15` on `21/01/2569`, get weight, current value and P&L
- **Buddhist-era dates** — native date picker, capped at today, with the พ.ศ. equivalent shown inline
- **Three metal types** — ทองแท่ง 96.5%, ทองรูปพรรณ 96.5%, ทองคำ 99.99% (purity-adjusted)
- **Fees** — an optional percentage of principal plus a flat ค่ากำเหน็จ per entry
- **Export** — CSV (Excel-safe, BOM-prefixed) and a purpose-built A4 print/PDF report
- **Bulk import** — paste `date : amount` lines, with a live preview of what parsed
- **Light / dark / system** themes, applied before first paint
- **Undo** on delete and clear-all

## Running it

```bash
npm install
npm run dev
```

Open <http://localhost:3000>.

| Script | |
|---|---|
| `npm run dev` | dev server (Turbopack) |
| `npm run build` | production build |
| `npm start` | serve the production build |
| `npm run lint` | ESLint |

Requires Node 20+. No environment variables, no database, no API keys.

## How it works

```
src/
├── app/
│   ├── api/gold-price/route.ts   scrapes goldtraders.or.th, caches per-date
│   ├── layout.tsx                fonts, metadata, pre-paint theme script
│   ├── page.tsx                  renders <GoldCalculator />
│   └── globals.css               design tokens, base layer, print stylesheet
├── lib/
│   ├── gold.ts                   types, date/currency formatting, all maths
│   └── local-store.ts            localStorage as a useSyncExternalStore source
├── hooks/                        use-entries, use-gold-prices, use-theme
└── components/                   presentational; state lives in gold-calculator
```

**Prices** come from `classic.goldtraders.or.th`, which publishes HTML rather than an API, so `route.ts` strips tags and regexes the figures out. Historical dates are cached for 15 minutes and the current price for 5, via Next's `revalidate`. The route accepts `D/M/YYYY` in Gregorian years and converts to พ.ศ. for the upstream query.

**Dates** are stored as ISO (`2026-01-21`) so the native picker owns the input, and converted to พ.ศ. only for display. Entries saved by earlier versions under the Buddhist-date format migrate automatically on read.

**Storage keys** — `aurum.entries.v2` (entries), `aurum.theme` (theme). Reads go through `useSyncExternalStore`, so the store is also the source of truth for cross-tab sync.

## Design system

Colour lives entirely in CSS custom properties in `globals.css`, mapped into Tailwind via `@theme inline`. Retheming means editing that one block.

Roles are kept separate on purpose: `--accent` drives interactive chrome (buttons, focus, selection), `--gold` is reserved for brand identity and the metal itself, and `--pos`/`--neg` are status colours for profit and loss.

Two rules the tokens are held to:

1. **Contrast is measured, not eyeballed.** Every text role clears WCAG AA (4.5:1) against every surface it can land on — including the deepest stop of the background gradient. Control borders clear 3:1. Verified in both themes.
2. **Profit and loss never rest on hue alone.** They always carry a sign, a directional arrow and the word กำไร/ขาดทุน, so they survive red/green colour blindness and greyscale printing.

Type is set at 15px/1.65 — Thai script needs the leading for tone marks to stay legible. Tabular figures are used in table columns only; display numbers use proportional figures.

## Known limitations

- **Today's rate is sell-only.** The upstream homepage parse returns `buy: 0` for the current price, so selecting **ราคารับซื้อ** (buy) values the whole portfolio at zero. Historical buy prices parse correctly — it is only today's figure that is missing. Fix belongs in `parsePrice` in `route.ts`.
- **The price source is scraped, not contracted.** Any markup change upstream breaks parsing; the UI degrades to an error state with a retry rather than showing stale numbers as current.
- **Weekend and holiday dates** have no published price, so those entries show ไม่พบราคา and are excluded from totals.
- **ทองรูปพรรณ uses the same 96.5% spot price as ทองแท่ง.** Real jewellery pricing carries a shop markup that this does not model — use the ค่ากำเหน็จ field to approximate it.
- Figures are **estimates for reference only**, not financial advice.

## Built with

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS v4 · IBM Plex Sans Thai

Price data courtesy of [สมาคมค้าทองคำ](https://www.goldtraders.or.th) — the Gold Traders Association of Thailand.
