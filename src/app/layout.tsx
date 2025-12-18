import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import { authOptions } from "@/auth";
import { getServerSession } from "next-auth";
import { Toaster } from "react-hot-toast";
import SessionProviderWrapper from "@/components/SessionProviderWrapper";
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Prime Flix | Admin Panel",
  description:
    "Manage products, orders, users, and settings with ease in the DarkSale E-commerce Admin Panel.",
  keywords:
    "Admin Panel, E-commerce, Dashboard, Product Management, Orders, Users",
  authors: [
    { name: "Kamlesh Sahani", url: "https://github.com/kamlesh-Sahani" },
  ],
  creator: "Kamlesh Sahani",
  publisher: "DarkSale Team",
  metadataBase: new URL("https://your-admin-panel-url.com"),
  openGraph: {
    title: "DarkSale Admin Panel",
    description:
      "An advanced admin panel to manage your e-commerce store seamlessly.",
    url: "https://your-admin-panel-url.com",
    type: "website",
    siteName: "DarkSale Admin",
    images: [
      {
        url: "https://your-admin-panel-url.com/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "DarkSale Admin Panel",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@yourtwitterhandle",
    creator: "@kamlesh_sahani",
    title: "DarkSale Admin Panel",
    description:
      "A powerful admin dashboard for managing e-commerce products and orders.",
    images: ["https://your-admin-panel-url.com/og-image.jpg"],
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession(authOptions);
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <div className="flex w-full h-full">
          <SessionProviderWrapper session={session}>
            <Sidebar />
            <div className="flex-1 p-6 overflow-auto h-screen pt-6 max-sm:p-1">
              {children}
            </div>
          </SessionProviderWrapper>
        </div>
        <Toaster />
      </body>
    </html>
  );
}
