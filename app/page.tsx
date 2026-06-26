import Link from "next/link";
import { MOCK_CASES } from "@/lib/mock-data";
import { INDUSTRY_COLOR, RESULT_COLOR, SERVICE_COLOR } from "@/lib/utils";
import { ArrowRight, BookOpen, FileText, Search, TrendingUp } from "lucide-react";

export default function DashboardPage() {
  const recent = MOCK_CASES.slice(0, 3);
  const byIndustry = MOCK_CASES.reduce((acc, c) => {
    acc[c.industry] = (acc[c.industry] ?? 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const bigWins = MOCK_CASES.filter((c) => c.result === "大幅改善");

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">ナレッジAIサーチ</h1>
        <p className="text-gray-500 text-sm mt-1">過去の成功事例をAIが即検索。提案書ドラフトを自動生成します。</p>
      </div>

      {/* クイックアクション */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { href: "/search", icon: Search,   label: "事例を検索する",  desc: "業種・サービス・KWで絞り込み",  color: "text-indigo-600", bg: "bg-indigo-50" },
          { href: "/draft",  icon: FileText,  label: "提案書を生成する", desc: "事例から自動ドラフト作成",       color: "text-emerald-600", bg: "bg-emerald-50" },
          { href: "/cases",  icon: BookOpen,  label: "事例一覧を見る",  desc: `全${MOCK_CASES.length}件の事例データ`, color: "text-purple-600", bg: "bg-purple-50" },
        ].map(({ href, icon: Icon, label, desc, color, bg }) => (
          <Link key={href} href={href}
            className="bg-white border rounded-xl p-4 flex items-start gap-3 hover:shadow-md transition-shadow group">
            <div className={`${bg} ${color} w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0`}>
              <Icon className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className={`font-semibold text-sm ${color}`}>{label}</p>
              <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
            </div>
            <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 mt-1 transition-colors flex-shrink-0" />
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* 業種別事例数 */}
        <div className="bg-white border rounded-xl p-4 space-y-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-indigo-500" />
            <p className="font-semibold text-sm text-gray-700">業種別事例数</p>
          </div>
          <div className="space-y-2">
            {Object.entries(byIndustry).sort((a, b) => b[1] - a[1]).map(([industry, count]) => (
              <div key={industry} className="flex items-center gap-3">
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium w-24 text-center flex-shrink-0 ${INDUSTRY_COLOR[industry as keyof typeof INDUSTRY_COLOR] ?? "bg-gray-100 text-gray-600"}`}>
                  {industry}
                </span>
                <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-400 rounded-full"
                    style={{ width: `${(count / MOCK_CASES.length) * 100}%` }} />
                </div>
                <span className="text-xs text-gray-400 w-4 text-right">{count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 大幅改善事例 */}
        <div className="bg-white border rounded-xl p-4 space-y-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-500" />
            <p className="font-semibold text-sm text-gray-700">🏆 大幅改善事例</p>
          </div>
          <div className="space-y-2">
            {bigWins.map((c) => (
              <div key={c.id} className="border border-emerald-100 rounded-lg px-3 py-2 bg-emerald-50">
                <p className="text-xs font-semibold text-gray-800 leading-snug">{c.title}</p>
                <p className="text-xs text-emerald-600 mt-0.5 font-medium">{c.kpi}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 最近の事例 */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="font-semibold text-sm text-gray-700">最近追加された事例</p>
          <Link href="/cases" className="text-xs text-indigo-600 hover:underline">すべて見る →</Link>
        </div>
        <div className="space-y-3">
          {recent.map((c) => (
            <div key={c.id} className="bg-white border rounded-xl p-4 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <p className="font-semibold text-sm text-gray-800 leading-snug">{c.title}</p>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${RESULT_COLOR[c.result]}`}>
                  {c.result}
                </span>
              </div>
              <div className="flex flex-wrap gap-1">
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${INDUSTRY_COLOR[c.industry]}`}>{c.industry}</span>
                {c.services.map((s) => (
                  <span key={s} className={`text-xs px-2 py-0.5 rounded-full ${SERVICE_COLOR[s]}`}>{s}</span>
                ))}
              </div>
              <p className="text-xs text-gray-500 leading-relaxed">{c.summary}</p>
              <p className="text-xs font-semibold text-indigo-600">{c.kpi}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
