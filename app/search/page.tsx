"use client";
import { useState, useMemo, useEffect } from "react";
import { MOCK_CASES } from "@/lib/mock-data";
import { KnowledgeDoc, loadDocs, searchDocs } from "@/lib/knowledge-store";
import { Industry, Result, ServiceType } from "@/types";
import { cn, INDUSTRY_COLOR, RESULT_COLOR, SERVICE_COLOR, calcRelevance } from "@/lib/utils";
import { Bot, BookOpen, FileText, Search, X } from "lucide-react";
import Link from "next/link";

const INDUSTRIES: Industry[] = ["金融・保険", "不動産", "EC・通販", "旅行・ホテル", "BtoB・SaaS", "通信・IT", "自動車", "その他"];
const SERVICES: ServiceType[] = ["SEO", "運用型広告", "コンテンツマーケティング", "SNS運用", "CRO・LPO", "Web制作", "MA", "DXコンサルティング", "クリエイティブ制作", "LLMO/AIO", "調査・リサーチ"];
const RESULTS: Result[] = ["大幅改善", "改善", "横ばい", "未計測"];

type Tab = "cases" | "docs";

export default function SearchPage() {
  const [tab, setTab] = useState<Tab>("cases");
  const [query, setQuery] = useState("");
  const [selIndustry, setSelIndustry] = useState<Industry | "">("");
  const [selService, setSelService] = useState<ServiceType | "">("");
  const [selResult, setSelResult] = useState<Result | "">("");
  const [learnedDocs, setLearnedDocs] = useState<KnowledgeDoc[]>([]);

  useEffect(() => {
    setLearnedDocs(loadDocs());
    const handler = () => setLearnedDocs(loadDocs());
    window.addEventListener("knowledge_updated", handler);
    return () => window.removeEventListener("knowledge_updated", handler);
  }, []);

  const caseResults = useMemo(() => {
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

  const docResults = useMemo(() => searchDocs(query), [query, learnedDocs]); // eslint-disable-line react-hooks/exhaustive-deps

  const hasFilter = query || selIndustry || selService || selResult;

  return (
    <div className="space-y-5 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">事例・ドキュメント検索</h1>
        <p className="text-gray-500 text-sm mt-1">過去事例と学習済みドキュメントを横断検索</p>
      </div>

      {/* 検索バー */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="例：不動産 SEO、ROAS改善、提案書 EC..."
          className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white"
        />
        {query && (
          <button onClick={() => setQuery("")} className="absolute right-3.5 top-1/2 -translate-y-1/2">
            <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
          </button>
        )}
      </div>

      {/* タブ */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
        <button onClick={() => setTab("cases")}
          className={cn("flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
            tab === "cases" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700")}>
          <BookOpen className="w-3.5 h-3.5" />事例DB
          <span className="text-xs text-gray-400">({caseResults.length})</span>
        </button>
        <button onClick={() => setTab("docs")}
          className={cn("flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
            tab === "docs" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700")}>
          <FileText className="w-3.5 h-3.5" />学習済みドキュメント
          <span className="text-xs text-gray-400">({docResults.length})</span>
        </button>
      </div>

      {/* 事例タブ：フィルター */}
      {tab === "cases" && (
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
      )}

      {/* AI検索ヒント */}
      {query && (
        <div className="flex items-start gap-2 bg-indigo-50 border border-indigo-100 rounded-xl px-4 py-3 text-xs text-indigo-700">
          <Bot className="w-4 h-4 flex-shrink-0 mt-0.5" />
          「{query}」で横断検索 — 事例DB {caseResults.length}件・ドキュメント {docResults.length}件ヒット
        </div>
      )}

      {/* 事例タブ */}
      {tab === "cases" && (
        <div className="space-y-3">
          {caseResults.map((c) => (
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
                  {query && <span className="text-xs text-indigo-500 font-medium">関連度 {c.relevance_score}%</span>}
                </div>
              </div>
              <div className="flex flex-wrap gap-1">
                <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium", INDUSTRY_COLOR[c.industry])}>{c.industry}</span>
                {c.services.map((s) => (
                  <span key={s} className={cn("text-xs px-2 py-0.5 rounded-full", SERVICE_COLOR[s])}>{s}</span>
                ))}
              </div>
              <p className="text-xs text-gray-600 leading-relaxed">{c.summary}</p>
              <p className="text-xs font-bold text-indigo-600">{c.kpi}</p>
              <div className="flex gap-2 pt-1">
                <Link href={`/draft?case=${c.id}`}
                  className="flex items-center gap-1.5 text-xs text-white bg-indigo-600 rounded-lg px-3 py-1.5 hover:bg-indigo-700 transition-colors">
                  <FileText className="w-3.5 h-3.5" />この事例で提案書を作成
                </Link>
              </div>
            </div>
          ))}
          {caseResults.length === 0 && <p className="text-gray-400 text-sm text-center py-8">該当する事例がありません</p>}
        </div>
      )}

      {/* ドキュメントタブ */}
      {tab === "docs" && (
        <div className="space-y-3">
          {docResults.length === 0 && learnedDocs.length === 0 && (
            <div className="text-center py-10 space-y-2">
              <p className="text-gray-400 text-sm">学習済みドキュメントがありません</p>
              <Link href="/learn" className="text-xs text-indigo-600 hover:underline">ナレッジ学習ページでファイルを登録する →</Link>
            </div>
          )}
          {docResults.length === 0 && learnedDocs.length > 0 && (
            <p className="text-gray-400 text-sm text-center py-8">「{query}」に一致するドキュメントがありません</p>
          )}
          {docResults.map((doc) => (
            <div key={doc.id} className="bg-white border rounded-xl p-4 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={cn("text-xs px-1.5 py-0.5 rounded font-bold",
                      doc.file_type === "pdf" ? "bg-red-100 text-red-600" :
                      doc.file_type === "docx" ? "bg-blue-100 text-blue-600" : "bg-gray-100 text-gray-500"
                    )}>{doc.file_type.toUpperCase()}</span>
                    <p className="font-semibold text-sm text-gray-800 truncate">{doc.title}</p>
                  </div>
                  <p className="text-xs text-gray-500 mt-1 leading-relaxed line-clamp-2">{doc.summary}</p>
                </div>
                {query && <span className="text-xs text-indigo-500 font-medium flex-shrink-0">関連度 {doc.score}%</span>}
              </div>
              <div className="flex flex-wrap gap-1">
                {doc.tags.map((t) => (
                  <span key={t} className="text-xs bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded-full">{t}</span>
                ))}
              </div>
              <div className="flex gap-2 pt-1">
                <Link href={`/draft?doc=${doc.id}`}
                  className="flex items-center gap-1.5 text-xs text-white bg-indigo-600 rounded-lg px-3 py-1.5 hover:bg-indigo-700 transition-colors">
                  <FileText className="w-3.5 h-3.5" />このドキュメントで提案書を作成
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
