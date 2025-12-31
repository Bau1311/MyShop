'use client';

import "./globals.css";
import { usePathname } from "next/navigation";

// Import ShopProvider
import { ShopProvider } from "./context/ShopContext";

// Import các thành phần
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const isAdminPage = pathname?.startsWith('/admin');

  return (
    <html lang="vi" suppressHydrationWarning>
      <head>
        <title>Shopee</title>
        <meta name="description" content="Frontend Shopee clone bằng Next.js + React" />
      </head>
      <body suppressHydrationWarning className="antialiased">
        <ShopProvider>
          {/* Only show Navbar for non-admin pages */}
          {!isAdminPage && <Navbar />}

          <main className={isAdminPage ? "" : "min-h-screen"}>
            {children}
          </main>

          {/* Only show Footer for non-admin pages */}
          {!isAdminPage && <Footer />}
        </ShopProvider>
      </body>
    </html>
  );
}