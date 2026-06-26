"use client";
import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { MOCK_CASES } from "@/lib/mock-data";
import { Case } from "@/types";
import { cn, INDUSTRY_COLOR, RESULT_COLOR, SERVICE_COLOR } from "@/lib/utils";
import { ExternalLink, FileText, FolderOpen, X } from "lucide-react";
import Link from "next/link";

function CaseDetail({ c, onClose }: { c: Case; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl"
        onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <p className="font-bold text-gray-900 text-sm leading-snug pr-4">{c.title}</p>
          <button onClick={onClose}><X className="w-5 h-5 text-gray-400 hover:text-gray-600" /></button>
        </div>
        <div className="p-6 space-y-5">
          <div className="flex flex-wrap gap-2">
            <span className={cn("text-xs px-2 py-1 rounded-full font-medium", INDUSTRY_COLOR[c.industry])}>{c.industry}</span>
            {c.services.map((s) => (
              <span key={s} className={cn("text-xs px-2 py-1 rounded-full", SERVICE_COLOR[s])}>{s}</span>
            ))}
            <span className={cn("text-xs px-2 py-1 rounded-full font-medium", RESULT_COLOR[c.result])}>{c.result}</span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-indigo-50 rounded-xl p-3">
              <p className="text-xs text-indigo-500 font-semibold">KPI成果</p>
              <p className="text-sm font-bold text-indigo-700 mt-1">{c.kpi}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-xs text-gray-500 font-semibold">実施期間</p>
              <p className="text-sm font-medium text-gray-700 mt-1">{c.period}</p>
            </div>
          </div>

          {[
            { label: "背景・課題", text: c.background },
            { label: "戦略・施策", text: c.strategy },
            { label: "概要", text: c.summary },
          ].map(({ label, text }) => (
            <div key={label}>
              <p className="text-xs font-bold text-gray-500 mb-1">{label}</p>
              <p className="text-sm text-gray-700 leading-relaxed">{text}</p>
            </div>
          ))}

          <div>
            <p className="text-xs font-bold text-gray-500 mb-2">タグ</p>
            <div className="flex flex-wrap gap-1.5">
              {c.tags.map((t) => (
                <span key={t} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{t}</span>
              ))}
            </div>
          </div>

          {/* 参照リンク */}
          {(c.reference_url || c.drive_url) && (
            <div className="border border-gray-200 rounded-xl p-4 space-y-2">
              <p className="text-xs font-bold text-gray-500">📎 参照資料・リンク</p>
              {c.reference_url && (
                <a href={c.reference_url} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-800 hover:underline">
                  <ExternalLink className="w-4 h-4 flex-shrink-0" />
                  <span>事例・実績ページを見る</span>
                </a>
              )}
              {c.drive_url && (
                <a href={c.drive_url} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 hover:underline">
                  <FolderOpen className="w-4 h-4 flex-shrink-0" />
                  <span>Drive資料フォルダを開く</span>
                </a>
              )}
            </div>
          )}
          {!c.reference_url && !c.drive_url && (
            <div className="border border-dashed border-gray-200 rounded-xl p-3 text-center">
              <p className="text-xs text-gray-400">提案書・資料は「<a href="/learn" className="text-indigo-500 hover:underline">資料登録</a>」からPDFをアップロードして紐付けできます</p>
            </div>
          )}

          <Link href={`/draft?case=${c.id}`}
            className="flex items-center justify-center gap-2 bg-indigo-600 text-white text-sm font-semibold py-3 rounded-xl hover:bg-indigo-700 transition-colors">
            <FileText className="w-4 h-4" />この事例で提案書を作成
          </Link>
        </div>
      </div>
    </div>
  );
}

function CasesContent() {
  const params = useSearchParams();
  const [selected, setSelected] = useState<Case | null>(
    MOCK_CASES.find((c) => c.id === params.get("id")) ?? null
  );

  return (
    <div className="space-y-5 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">事例一覧</h1>
        <p className="text-gray-500 text-sm mt-1">全{MOCK_CASES.length}件の過去事例</p>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {MOCK_CASES.map((c) => (
          <button key={c.id} onClick={() => setSelected(c)}
            className="bg-white border rounded-xl p-4 text-left hover:shadow-md transition-shadow space-y-2 w-full">
            <div className="flex items-start justify-between gap-2">
              <p className="font-semibold text-sm text-gray-800 leading-snug">{c.title}</p>
              <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0", RESULT_COLOR[c.result])}>
                {c.result}
              </span>
            </div>
            <div className="flex flex-wrap gap-1">
              <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium", INDUSTRY_COLOR[c.industry])}>
                {c.industry}
              </span>
              {c.services.map((s) => (
                <span key={s} className={cn("text-xs px-2 py-0.5 rounded-full", SERVICE_COLOR[s])}>{s}</span>
              ))}
            </div>
            <div className="flex items-center justify-between">
              <p className="text-xs text-gray-500">{c.client_name} · {c.period}</p>
              <p className="text-xs font-bold text-indigo-600">{c.kpi}</p>
            </div>
          </button>
        ))}
      </div>

      {selected && <CaseDetail c={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}

export default function CasesPage() {
  return (
    <Suspense>
      <CasesContent />
    </Suspense>
  );
}
