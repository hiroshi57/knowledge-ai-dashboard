"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { BookOpen, Brain, FileText, LayoutDashboard, LogOut, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { getUser, clearUser } from "@/lib/auth";
import { useEffect, useState } from "react";

const NAV = [
  { href: "/",       label: "ダッシュボード",  icon: LayoutDashboard },
  { href: "/search", label: "事例・文書検索",  icon: Search },
  { href: "/draft",  label: "提案書ドラフト",  icon: FileText },
  { href: "/cases",  label: "事例一覧",        icon: BookOpen },
  { href: "/learn",  label: "資料登録",        icon: Brain },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    const u = getUser();
    if (u) {
      const name = u.name || u.email.split("@")[0].split(/[._-]+/).map((p: string) => p.charAt(0).toUpperCase() + p.slice(1)).join(" ");
      setUserName(name);
      setUserEmail(u.email);
    }
  }, []);

  function handleLogout() {
    clearUser();
    router.replace("/login");
  }

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

      {/* ユーザー情報 */}
      <div className="mt-auto pt-4 border-t mx-1">
        <div className="flex items-center gap-2 px-2 py-2 rounded-lg">
          <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold flex-shrink-0">
            {userName.charAt(0) || "?"}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-gray-800 truncate">{userName || "未ログイン"}</p>
            <p className="text-xs text-gray-400 truncate">{userEmail}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors mt-1"
        >
          <LogOut className="w-3.5 h-3.5" />
          ログアウト
        </button>
      </div>
    </aside>
  );
}
