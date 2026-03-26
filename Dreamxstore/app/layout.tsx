import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "Dream X Store - Custom Clothing & Fashion",
  description: "Dream X Store - Custom Clothing & Fashion ecommerce platform",
  icons: {
    icon: "https://i.postimg.cc/Kv1zypB5/Frame-2.png",
    shortcut: "https://i.postimg.cc/Kv1zypB5/Frame-2.png",
    apple: "https://i.postimg.cc/Kv1zypB5/Frame-2.png",
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
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
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Bitcount+Prop+Single+Ink:wght@100..900&family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&family=IBM+Plex+Mono:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;1,100;1,200;1,300;1,400;1,500;1,600;1,700&family=Inconsolata:wght@200..900&family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&family=Iosevka+Charon+Mono:ital,wght@0,300;0,400;0,500;0,700;1,300;1,400;1,500;1,700&family=Jost:ital,wght@0,100..900;1,100..900&family=Manrope:wght@200..800&family=Outfit:wght@100..900&display=swap" rel="stylesheet" />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
