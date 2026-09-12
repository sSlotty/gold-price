import { LogoMark } from "./logo";
import {
  METALS,
  PRICE_MODES,
  formatUpdatedAt,
  money,
  number,
  signedMoney,
  signedPercent,
  toThaiDate,
  type Metal,
  type PriceMode,
  type Row,
  type Totals,
} from "@/lib/gold";

/** Hidden on screen; this is the whole page when printed or saved to PDF. */
export function PrintReport({
  rows,
  totals,
  metal,
  mode,
  updatedAt,
  printedAt,
}: {
  rows: Row[];
  totals: Totals;
  metal: Metal;
  mode: PriceMode;
  updatedAt: string | null;
  /** Stamped when printing actually starts, never during render. */
  printedAt: string | null;
}) {
  const up = totals.profit >= 0;

  return (
    <section className="print-only" aria-hidden="true">
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: "16pt",
          borderBottom: "1.5pt solid var(--gold)",
          paddingBottom: "10pt",
        }}
      >
        <div>
          <p
            style={{
              margin: 0,
              display: "flex",
              alignItems: "center",
              gap: "5pt",
              color: "var(--gold)",
              fontWeight: 700,
              fontSize: "13pt",
            }}
          >
            <LogoMark />
            Aurum
          </p>
          <h1 style={{ margin: "6pt 0 2pt", fontSize: "16pt" }}>
            รายงานสรุปการลงทุนทองคำ
          </h1>
          <p style={{ margin: 0, color: "var(--fg-muted)", fontSize: "9pt" }}>
            {METALS[metal].label} · {PRICE_MODES[mode].label}
          </p>
        </div>
        <div style={{ textAlign: "right", fontSize: "8.5pt", color: "var(--fg-muted)" }}>
          <p style={{ margin: 0 }}>ออกรายงาน {formatUpdatedAt(printedAt)}</p>
          <p style={{ margin: 0 }}>ราคาอัปเดต {formatUpdatedAt(updatedAt)}</p>
          <p style={{ margin: 0 }}>แหล่งข้อมูล: สมาคมค้าทองคำ</p>
        </div>
      </header>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "8pt",
          margin: "14pt 0",
        }}
      >
        {[
          { label: "เงินต้นรวม", value: money(totals.principal), color: "var(--fg)" },
          { label: "มูลค่าปัจจุบัน", value: money(totals.value), color: "var(--fg)" },
          {
            label: up ? "กำไร" : "ขาดทุน",
            value: `${signedMoney(totals.profit)} (${signedPercent(totals.profitPercent)})`,
            color: up ? "var(--pos)" : "var(--neg)",
          },
        ].map((tile) => (
          <div
            key={tile.label}
            style={{
              border: "0.5pt solid var(--border)",
              borderTop: `2pt solid ${tile.color}`,
              borderRadius: "3pt",
              padding: "7pt 9pt",
            }}
          >
            <p style={{ margin: 0, fontSize: "8pt", color: "var(--fg-muted)" }}>
              {tile.label}
            </p>
            <p
              style={{
                margin: "3pt 0 0",
                fontSize: "12pt",
                fontWeight: 600,
                color: tile.color,
              }}
            >
              {tile.value}
            </p>
          </div>
        ))}
      </div>

      <table className="print-table" style={{ fontSize: "8.5pt" }}>
        <thead>
          <tr style={{ background: "var(--surface-2, #f4f2ee)" }}>
            {["วันที่ซื้อ", "เงินต้น", "ราคาอ้างอิง", "น้ำหนัก", "มูลค่าวันนี้", "กำไร/ขาดทุน"].map(
              (header, index) => (
                <th
                  key={header}
                  scope="col"
                  style={{
                    padding: "5pt 6pt",
                    borderBottom: "0.75pt solid var(--border)",
                    textAlign: index === 0 ? "left" : "right",
                    fontSize: "8pt",
                  }}
                >
                  {header}
                </th>
              ),
            )}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const cells = [
              row.date ? toThaiDate(row.date) : "—",
              money(row.amount),
              row.price ? money(row.price) : "ไม่พบราคา",
              row.price ? number(row.weight) : "—",
              row.price ? money(row.net) : "—",
            ];
            return (
              <tr key={row.id}>
                {cells.map((cell, index) => (
                  <td
                    key={index}
                    style={{
                      padding: "5pt 6pt",
                      borderBottom: "0.5pt solid var(--border)",
                      textAlign: index === 0 ? "left" : "right",
                      fontVariantNumeric: "tabular-nums",
                    }}
                  >
                    {cell}
                  </td>
                ))}
                <td
                  style={{
                    padding: "5pt 6pt",
                    borderBottom: "0.5pt solid var(--border)",
                    textAlign: "right",
                    fontVariantNumeric: "tabular-nums",
                    color: row.price
                      ? row.profit >= 0
                        ? "var(--pos)"
                        : "var(--neg)"
                      : "var(--fg-muted)",
                  }}
                >
                  {row.price
                    ? `${row.profit >= 0 ? "กำไร " : "ขาดทุน "}${signedMoney(row.profit)}`
                    : "—"}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <p style={{ marginTop: "12pt", fontSize: "7.5pt", color: "var(--fg-muted)" }}>
        หมายเหตุ: มูลค่าปัจจุบันคำนวณจากราคาทองที่ระบบดึงล่าสุด ณ เวลาที่สร้างรายงาน
        และหักค่าธรรมเนียม/ค่ากำเหน็จตามที่ระบุไว้ในหน้าคำนวณ
        ตัวเลขนี้เป็นการประมาณการเพื่อใช้อ้างอิงเท่านั้น
      </p>
    </section>
  );
}
