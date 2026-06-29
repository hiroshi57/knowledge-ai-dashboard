import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import { AuthGuard } from "@/components/AuthGuard";

const geist = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ナレッジAIサーチ",
  description: "過去事例検索AI・提案書ドラフト自動生成",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja" className={`${geist.variable} h-full antialiased`}>
      <body className="h-full flex bg-gray-50">
        <AuthGuard>
          <Sidebar />
          <main className="flex-1 overflow-y-auto p-6">{children}</main>
        </AuthGuard>
      </body>
    </html>
  );
}
