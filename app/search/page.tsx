"use client";
import { useState, useMemo } from "react";
import { MOCK_CASES } from "@/lib/mock-data";
import { Industry, Result, ServiceType } from "@/types";
import { cn, INDUSTRY_COLOR, RESULT_COLOR, SERVICE_COLOR, calcRelevance } from "@/lib/utils";
import { Bot, FileText, Search, X } from "lucide-react";
import Link from "next/link";

const INDUSTRIES: Industry[] = ["不動産", "EC・通販", "教育", "美容・健康", "BtoB製造", "飲食", "医療", "金融"];
const SERVICES: ServiceType[] = ["SEO", "リスティング広告", "SNS運用", "コンテンツ制作", "ブランディング", "CRM", "動画制作"];
const RESULTS: Result[] = ["大幅改善", "改善", "横ばい", "未計測"];

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [selIndustry, setSelIndustry] = useState<Industry | "">("");
  const [selService, setSelService] = useState<ServiceType | "">("");
  const [selResult, setSelResult] = useState<Result | "">("");

  const results = useMemo(() => {
    return MOCK_CASES
      .filter((c) => {
        if (selIndustry && c.industry !== selIndustry) return false;
        if (selService && !c.services.includes(selService)) return false;
        if (selResult && c.result !== selResult) return false;
        return true;
      })
      .map((c) => ({ ...c, relevance_score: calcRelevance(query, c) }))
      .filter((c) => !query.trim() || c.relevance_score > 0)
      .sort((a, b) => b.relevance_score - a.relevance_score);
  }, [query, selIndustry, selService, selResult]);

  const hasFilter = query || selIndustry || selService || selResult;

  return (
    <div className="space-y-5 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">事例検索AI</h1>
        <p className="text-gray-500 text-sm mt-1">キーワード・業種・サービスで過去事例を即検索</p>
      </div>

      {/* 検索バー */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="例：不動産 SEO、ROAS改善、ナーチャリング..."
          className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white"
        />
        {query && (
          <button onClick={() => setQuery("")} className="absolute right-3.5 top-1/2 -translate-y-1/2">
            <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
          </button>
        )}
      </div>

      {/* フィルター */}
      <div className="flex flex-wrap gap-2">
        <select value={selIndustry} onChange={(e) => setSelIndustry(e.target.value as Industry | "")}
          className="text-xs border border-gray-300 rounded-lg px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-200">
          <option value="">業種：すべて</option>
          {INDUSTRIES.map((i) => <option key={i} value={i}>{i}</option>)}
        </select>
        <select value={selService} onChange={(e) => setSelService(e.target.value as ServiceType | "")}
          className="text-xs border border-gray-300 rounded-lg px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-200">
          <option value="">サービス：すべて</option>
          {SERVICES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={selResult} onChange={(e) => setSelResult(e.target.value as Result | "")}
          className="text-xs border border-gray-300 rounded-lg px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-200">
          <option value="">成果：すべて</option>
          {RESULTS.map((r) => <option key={r} value={r}>{r}</option>)}
        </select>
        {hasFilter && (
          <button onClick={() => { setQuery(""); setSelIndustry(""); setSelService(""); setSelResult(""); }}
            className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1 px-2">
            <X className="w-3 h-3" />クリア
          </button>
        )}
      </div>

      {/* AI検索ヒント */}
      {query && (
        <div className="flex items-start gap-2 bg-indigo-50 border border-indigo-100 rounded-xl px-4 py-3 text-xs text-indigo-700">
          <Bot className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>「{query}」に関連する事例を関連度順で表示しています。{results.length}件ヒット</span>
        </div>
      )}

      {/* 件数 */}
      <p className="text-xs text-gray-400">{results.length}件の事例</p>

      {/* 結果 */}
      <div className="space-y-3">
        {results.map((c) => (
          <div key={c.id} className="bg-white border rounded-xl p-4 space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-gray-800 leading-snug">{c.title}</p>
                <p className="text-xs text-gray-400 mt-0.5">{c.client_name} · {c.period}</p>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium", RESULT_COLOR[c.result])}>
                  {c.result}
                </span>
                {query && (
                  <span className="text-xs text-indigo-500 font-medium">関連度 {c.relevance_score}%</span>
                )}
              </div>
            </div>

            <div className="flex flex-wrap gap-1">
              <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium", INDUSTRY_COLOR[c.industry])}>
                {c.industry}
              </span>
              {c.services.map((s) => (
                <span key={s} className={cn("text-xs px-2 py-0.5 rounded-full", SERVICE_COLOR[s])}>{s}</span>
              ))}
            </div>

            <p className="text-xs text-gray-600 leading-relaxed">{c.summary}</p>
            <p className="text-xs font-bold text-indigo-600">{c.kpi}</p>

            <div className="flex gap-2 pt-1">
              <Link href={`/cases?id=${c.id}`}
                className="text-xs text-gray-600 border border-gray-200 rounded-lg px-3 py-1.5 hover:bg-gray-50 transition-colors">
                詳細を見る
              </Link>
              <Link href={`/draft?case=${c.id}`}
                className="flex items-center gap-1.5 text-xs text-white bg-indigo-600 rounded-lg px-3 py-1.5 hover:bg-indigo-700 transition-colors">
                <FileText className="w-3.5 h-3.5" />この事例で提案書を作成
              </Link>
            </div>
          </div>
        ))}
        {results.length === 0 && (
          <p className="text-gray-400 text-sm text-center py-8">該当する事例がありませんでした</p>
        )}
      </div>
    </div>
  );
}
