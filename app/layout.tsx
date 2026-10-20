import type { Metadata, Viewport } from "next";
import { Barlow_Condensed } from "next/font/google";
import { CartProvider } from "@/components/cart/cart-provider";
import { SITE_URL } from "@/seo/metadata";
import "./globals.css";

/*
 * One web font file (SPEC §11 budget): Barlow Condensed 800 italic for display,
 * the heavy italic OzLED voice. Body text uses the system UI stack (0 bytes);
 * see docs/decisions.md.
 */
const display = Barlow_Condensed({
  subsets: ["latin"],
  weight: "800",
  style: "italic",
  variable: "--oz-font-display",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: "LED Vehicle Lights & Lighting Australia | OzLED", template: "%s | OzLED" },
  applicationName: "OzLED",
  icons: { icon: "/brand/favicon.png", apple: "/brand/favicon.png" },
  formatDetection: { telephone: false },
};

/** Zoom allowed: the live site's user-scalable=0 is an audit failure (SPEC §8.3). */
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0b0c0e",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en-AU" className={display.variable}>
      <body className="flex min-h-dvh flex-col antialiased">
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  );
}
