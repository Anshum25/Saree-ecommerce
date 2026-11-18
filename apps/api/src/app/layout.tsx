import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "JAIISHA — Commerce API",
  description: "Catalogue, enquiry, review and newsletter endpoints for the JAIISHA storefront.",
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en-IN">
      <body
        style={{
          margin: 0,
          background: "#1c0f15",
          color: "#f6efe4",
          fontFamily:
            "ui-monospace, SFMono-Regular, Menlo, Consolas, 'Liberation Mono', monospace",
          lineHeight: 1.65,
        }}
      >
        {children}
      </body>
    </html>
  );
}
