import type { Metadata, Viewport } from "next";
import { IBM_Plex_Sans_Thai } from "next/font/google";
import { themeBootstrapScript } from "@/hooks/use-theme";
import "./globals.css";

const plexThai = IBM_Plex_Sans_Thai({
  variable: "--font-plex-thai",
  subsets: ["thai", "latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Aurum — คำนวณมูลค่าทองคำจากเงินที่ซื้อ",
    template: "%s · Aurum",
  },
  description:
    "คำนวณน้ำหนักทอง มูลค่าปัจจุบัน และกำไรขาดทุนจากเงินที่คุณซื้อทองไว้ อ้างอิงราคาย้อนหลังจากสมาคมค้าทองคำ",
  applicationName: "Aurum",
  openGraph: {
    title: "Aurum — คำนวณมูลค่าทองคำจากเงินที่ซื้อ",
    description:
      "เทียบเงินที่ซื้อทองไว้กับราคาทองวันนี้ พร้อมสรุปกำไรขาดทุนและส่งออกรายงาน",
    locale: "th_TH",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#faf9f7" },
    { media: "(prefers-color-scheme: dark)", color: "#121215" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // `data-theme` is written by the bootstrap script below before React
    // hydrates, so the attribute is deliberately excluded from the diff.
    <html
      lang="th"
      className={`${plexThai.variable} h-full`}
      suppressHydrationWarning
    >
      <head>
        {/* Applies the saved theme before first paint so there is no flash. */}
        <script dangerouslySetInnerHTML={{ __html: themeBootstrapScript }} />
      </head>
      <body className="flex min-h-full flex-col antialiased">{children}</body>
    </html>
  );
}
