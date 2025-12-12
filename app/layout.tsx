// app/layout.tsx

import type { Metadata } from "next";
import "./globals.css";

// Import ShopProvider
import { ShopProvider } from "./context/ShopContext"; 

// Import các thành phần
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

// Metadata trang
export const metadata: Metadata = {
  title: "Shopee",
  description: "Frontend Shopee clone bằng Next.js + React",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body suppressHydrationWarning className="antialiased"> 
        <ShopProvider>
          <Navbar />
          <main className="min-h-screen">{children}</main>
          <Footer />
        </ShopProvider>
      </body>
    </html>
  );
}