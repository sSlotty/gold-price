"use client";

import { useEffect, useMemo, useState } from "react";
import { flushSync } from "react-dom";
import {
  METALS,
  PRICE_MODES,
  buildRows,
  buildTotals,
  toCsv,
  type Metal,
  type PriceMode,
} from "@/lib/gold";
import { useEntries } from "@/hooks/use-entries";
import { useGoldPrices } from "@/hooks/use-gold-prices";
import { Breakdown } from "./breakdown";
import { EntryEditor } from "./entry-editor";
import { IconDownload, IconPaste, IconPrint, IconTrash } from "./icons";
import { ImportDialog } from "./import-dialog";
import { PortfolioSummary } from "./portfolio-summary";
import { PrintReport } from "./print-report";
import { SiteHeader } from "./site-header";
import { Button, Card, Eyebrow, Field, SegmentedControl, inputClass } from "./ui";
import { UndoToast } from "./undo-toast";

export function GoldCalculator() {
  const {
    entries,
    update,
    add,
    remove,
    clear,
    replace,
    undo,
    undoLabel,
    dismissUndo,
  } = useEntries();

  const [metal, setMetal] = useState<Metal>("bar");
  const [mode, setMode] = useState<PriceMode>("sell");
  const [feePercent, setFeePercent] = useState("0");
  const [makingFee, setMakingFee] = useState("0");
  const [importOpen, setImportOpen] = useState(false);
  const [printedAt, setPrintedAt] = useState<string | null>(null);

  // `beforeprint` covers the toolbar button and ⌘P alike. flushSync guarantees
  // the stamp is in the DOM before the print dialog snapshots the page, and
  // keeps `new Date()` out of render — a static prerender would otherwise bake
  // in the build time and fail hydration.
  useEffect(() => {
    const stamp = () => flushSync(() => setPrintedAt(new Date().toISOString()));
    window.addEventListener("beforeprint", stamp);
    return () => window.removeEventListener("beforeprint", stamp);
  }, []);

  const isoDates = useMemo(
    () => [...new Set(entries.map((entry) => entry.date).filter(Boolean))],
    [entries],
  );
  const { current, historical, updatedAt, status, refresh } = useGoldPrices(isoDates);

  const rows = useMemo(
    () =>
      buildRows({
        entries,
        current,
        historical,
        mode,
        metal,
        feePercent: Number(feePercent) || 0,
        makingFee: Number(makingFee) || 0,
      }),
    [entries, current, historical, mode, metal, feePercent, makingFee],
  );
  const totals = useMemo(() => buildTotals(rows), [rows]);
  const livePrice = current ? current[mode] * METALS[metal].factor : null;

  const exportCsv = () => {
    const blob = new Blob(["﻿" + toCsv(rows)], {
      type: "text/csv;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `aurum-gold-report-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <SiteHeader
        price={livePrice}
        status={status}
        updatedAt={updatedAt}
        metal={metal}
        mode={mode}
        onRefresh={refresh}
      />

      <main id="main" className="mx-auto w-full max-w-6xl px-4 pt-8 pb-24 sm:px-6">
        <div className="screen-only mb-8 max-w-2xl">
          <Eyebrow>เครื่องคำนวณมูลค่าทองคำ</Eyebrow>
          <h1 className="mt-2 text-3xl leading-tight font-semibold tracking-tight sm:text-4xl">
            เงินที่ซื้อทองไว้ วันนี้มีมูลค่าเท่าไหร่
          </h1>
          <p className="mt-3 text-fg-muted">
            กรอกวันที่และจำนวนเงินที่คุณซื้อทอง ระบบจะเทียบกับราคาย้อนหลังของสมาคมค้าทองคำ
            แล้วคำนวณน้ำหนักและกำไรขาดทุนให้อัตโนมัติ ข้อมูลถูกเก็บไว้ในเครื่องของคุณเท่านั้น
          </p>
        </div>

        <div className="screen-only grid items-start gap-5 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
          <Card className="overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-4">
              <div>
                <Eyebrow>ขั้นที่ 1</Eyebrow>
                <h2 className="mt-1 text-lg font-semibold tracking-tight">
                  รายการซื้อทองของคุณ
                </h2>
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={() => setImportOpen(true)}>
                  <IconPaste />
                  นำเข้า
                </Button>
                <Button
                  size="sm"
                  variant="danger"
                  onClick={clear}
                  disabled={entries.length === 0}
                >
                  <IconTrash />
                  ล้างทั้งหมด
                </Button>
              </div>
            </div>

            <div className="space-y-5 px-5 py-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <SegmentedControl
                  name="metal"
                  label="ประเภททอง"
                  value={metal}
                  onChange={setMetal}
                  options={(Object.keys(METALS) as Metal[]).map((value) => ({
                    value,
                    label: METALS[value].short,
                    hint: METALS[value].purity,
                  }))}
                />
                <SegmentedControl
                  name="mode"
                  label="อ้างอิงราคา"
                  value={mode}
                  onChange={setMode}
                  options={(Object.keys(PRICE_MODES) as PriceMode[]).map((value) => ({
                    value,
                    label: PRICE_MODES[value].label,
                  }))}
                />
              </div>
              <p className="-mt-2 text-xs text-fg-subtle">{PRICE_MODES[mode].hint}</p>

              <EntryEditor
                entries={entries}
                rows={rows}
                onUpdate={update}
                onRemove={remove}
                onAdd={add}
              />

              {/* Advanced inputs stay collapsed — most people never change them. */}
              <details className="group rounded-lg border border-line">
                <summary className="flex cursor-pointer items-center justify-between gap-2 px-4 py-3 text-sm font-medium">
                  ค่าธรรมเนียมและค่ากำเหน็จ
                  <span
                    aria-hidden="true"
                    className="text-fg-subtle transition-transform group-open:rotate-180"
                  >
                    ⌄
                  </span>
                </summary>
                <div className="grid gap-4 border-t border-line px-4 py-4 sm:grid-cols-2">
                  <Field
                    htmlFor="fee-percent"
                    label="ค่าธรรมเนียม (%)"
                    hint="คิดเป็นเปอร์เซ็นต์ของเงินต้นแต่ละรายการ"
                  >
                    <input
                      id="fee-percent"
                      type="number"
                      min="0"
                      step="0.01"
                      inputMode="decimal"
                      value={feePercent}
                      onChange={(event) => setFeePercent(event.target.value)}
                      className={`${inputClass} nums-tabular text-end`}
                    />
                  </Field>
                  <Field
                    htmlFor="making-fee"
                    label="ค่ากำเหน็จ (บาท)"
                    hint="จำนวนคงที่ หักจากทุกรายการ"
                  >
                    <input
                      id="making-fee"
                      type="number"
                      min="0"
                      step="1"
                      inputMode="decimal"
                      value={makingFee}
                      onChange={(event) => setMakingFee(event.target.value)}
                      className={`${inputClass} nums-tabular text-end`}
                    />
                  </Field>
                </div>
              </details>
            </div>
          </Card>

          <div className="flex flex-col gap-4 lg:sticky lg:top-24">
            <PortfolioSummary totals={totals} metal={metal} status={status} />

            <Card className="px-5 py-4">
              <Eyebrow>ส่งออก</Eyebrow>
              <div className="mt-3 flex flex-wrap gap-2">
                <Button onClick={exportCsv} disabled={rows.length === 0}>
                  <IconDownload />
                  ดาวน์โหลด CSV
                </Button>
                <Button onClick={() => window.print()} disabled={rows.length === 0}>
                  <IconPrint />
                  พิมพ์ / PDF
                </Button>
              </div>
              <p className="mt-3 text-xs text-fg-subtle">
                ราคาอ้างอิงจากสมาคมค้าทองคำแห่งประเทศไทย
                ตัวเลขทั้งหมดเป็นการประมาณการเพื่อใช้อ้างอิงเท่านั้น
              </p>
            </Card>
          </div>
        </div>

        <div className="screen-only mt-5">
          <Breakdown rows={rows} totals={totals} />
        </div>

        <PrintReport
          rows={rows}
          totals={totals}
          metal={metal}
          mode={mode}
          updatedAt={updatedAt}
          printedAt={printedAt}
        />
      </main>

      <footer className="screen-only border-t border-line px-4 py-6 text-center text-xs text-fg-subtle sm:px-6">
        Aurum · ราคาทองอ้างอิงสมาคมค้าทองคำ · {METALS[metal].label} · มูลค่าแสดงเป็นเงินบาท
      </footer>

      <ImportDialog
        open={importOpen}
        onClose={() => setImportOpen(false)}
        onImport={replace}
      />
      <UndoToast
        label={undoLabel}
        onUndo={undo}
        onDismiss={dismissUndo}
      />
    </>
  );
}
