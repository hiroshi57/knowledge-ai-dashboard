"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, FileText, LayoutDashboard, Search } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/",        label: "ダッシュボード", icon: LayoutDashboard },
  { href: "/search",  label: "事例検索AI",     icon: Search },
  { href: "/draft",   label: "提案書ドラフト",  icon: FileText },
  { href: "/cases",   label: "事例一覧",        icon: BookOpen },
];

export default function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="w-56 bg-white border-r flex flex-col py-6 px-3 gap-1 flex-shrink-0">
      <div className="px-3 mb-6">
        <p className="text-xs font-bold text-indigo-600 tracking-widest">KNOWLEDGE AI</p>
        <p className="text-xs text-gray-400 mt-0.5">過去事例検索・提案書生成</p>
      </div>
      {NAV.map(({ href, label, icon: Icon }) => (
        <Link key={href} href={href}
          className={cn("flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
            pathname === href
              ? "bg-indigo-50 text-indigo-700"
              : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
          )}>
          <Icon className="w-4 h-4 flex-shrink-0" />
          {label}
        </Link>
      ))}
    </aside>
  );
}
