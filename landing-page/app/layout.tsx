import type { Metadata, Viewport } from "next";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: "Dream X Store - Custom Clothing & Fashion",
  description: "Dream X Store - Custom Clothing & Fashion ecommerce platform",
  icons: {
    icon: "https://i.postimg.cc/15mjf5Cn/Instagram-post-1.png",
    shortcut: "https://i.postimg.cc/15mjf5Cn/Instagram-post-1.png",
    apple: "https://i.postimg.cc/15mjf5Cn/Instagram-post-1.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link
          rel="preconnect"
          href="https://fonts.googleapis.com"
        />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
