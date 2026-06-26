"use client";
import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { MOCK_CASES } from "@/lib/mock-data";
import { loadOverrides, saveOverride } from "@/lib/case-overrides";
import { Case } from "@/types";
import { cn, INDUSTRY_COLOR, RESULT_COLOR, SERVICE_COLOR } from "@/lib/utils";
import { Check, ExternalLink, FileText, FolderOpen, Pencil, X } from "lucide-react";
import Link from "next/link";

function useCaseWithOverride(c: Case): Case {
  const [merged, setMerged] = useState<Case>(c);
  const refresh = useCallback(() => {
    const overrides = loadOverrides();
    const ov = overrides[c.id];
    setMerged({ ...c, ...(ov?.drive_url ? { drive_url: ov.drive_url } : {}), ...(ov?.reference_url ? { reference_url: ov.reference_url } : {}) });
  }, [c]);

  useEffect(() => {
    refresh();
    window.addEventListener("case_overrides_updated", refresh);
    return () => window.removeEventListener("case_overrides_updated", refresh);
  }, [refresh]);

  return merged;
}

function DriveUrlEditor({ caseId, current, onClose }: { caseId: string; current: string; onClose: () => void }) {
  const [value, setValue] = useState(current);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    saveOverride({ case_id: caseId, drive_url: value.trim() });
    setSaved(true);
    setTimeout(() => { setSaved(false); onClose(); }, 1000);
  };

  return (
    <div className="border border-blue-200 bg-blue-50 rounded-xl p-3 space-y-2">
      <p className="text-xs font-bold text-blue-700">Drive フォルダURLを設定</p>
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="https://drive.google.com/drive/folders/..."
        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-200"
      />
      <div className="flex gap-2">
        <button
          onClick={handleSave}
          disabled={!value.trim()}
          className="flex items-center gap-1 bg-blue-600 text-white text-xs px-3 py-1.5 rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium"
        >
          {saved ? <><Check className="w-3 h-3" />保存済み</> : "保存"}
        </button>
        <button onClick={onClose} className="text-xs text-gray-500 hover:text-gray-700 px-2">キャンセル</button>
      </div>
    </div>
  );
}

function CaseDetail({ c, onClose }: { c: Case; onClose: () => void }) {
  const merged = useCaseWithOverride(c);
  const [editingDrive, setEditingDrive] = useState(false);

  return (
    <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl"
        onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <p className="font-bold text-gray-900 text-sm leading-snug pr-4">{merged.title}</p>
          <button onClick={onClose}><X className="w-5 h-5 text-gray-400 hover:text-gray-600" /></button>
        </div>
        <div className="p-6 space-y-5">
          <div className="flex flex-wrap gap-2">
            <span className={cn("text-xs px-2 py-1 rounded-full font-medium", INDUSTRY_COLOR[merged.industry])}>{merged.industry}</span>
            {merged.services.map((s) => (
              <span key={s} className={cn("text-xs px-2 py-1 rounded-full", SERVICE_COLOR[s])}>{s}</span>
            ))}
            <span className={cn("text-xs px-2 py-1 rounded-full font-medium", RESULT_COLOR[merged.result])}>{merged.result}</span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-indigo-50 rounded-xl p-3">
              <p className="text-xs text-indigo-500 font-semibold">KPI成果</p>
              <p className="text-sm font-bold text-indigo-700 mt-1">{merged.kpi}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-xs text-gray-500 font-semibold">実施期間</p>
              <p className="text-sm font-medium text-gray-700 mt-1">{merged.period}</p>
            </div>
          </div>

          {[
            { label: "背景・課題", text: merged.background },
            { label: "戦略・施策", text: merged.strategy },
            { label: "概要", text: merged.summary },
          ].map(({ label, text }) => (
            <div key={label}>
              <p className="text-xs font-bold text-gray-500 mb-1">{label}</p>
              <p className="text-sm text-gray-700 leading-relaxed">{text}</p>
            </div>
          ))}

          <div>
            <p className="text-xs font-bold text-gray-500 mb-2">タグ</p>
            <div className="flex flex-wrap gap-1.5">
              {merged.tags.map((t) => (
                <span key={t} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{t}</span>
              ))}
            </div>
          </div>

          {/* 参照リンク */}
          <div className="border border-gray-200 rounded-xl p-4 space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold text-gray-500">📎 参照資料・リンク</p>
              {!editingDrive && (
                <button
                  onClick={() => setEditingDrive(true)}
                  className="flex items-center gap-1 text-xs text-gray-400 hover:text-blue-600 transition-colors"
                >
                  <Pencil className="w-3 h-3" />Drive URLを{merged.drive_url ? "編集" : "追加"}
                </button>
              )}
            </div>
            {merged.reference_url && (
              <a href={merged.reference_url} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-800 hover:underline">
                <ExternalLink className="w-4 h-4 flex-shrink-0" />
                <span>事例・実績ページを見る</span>
              </a>
            )}
            {merged.drive_url && !editingDrive && (
              <a href={merged.drive_url} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 hover:underline">
                <FolderOpen className="w-4 h-4 flex-shrink-0" />
                <span>Drive資料フォルダを開く</span>
              </a>
            )}
            {editingDrive && (
              <DriveUrlEditor
                caseId={merged.id}
                current={merged.drive_url ?? ""}
                onClose={() => setEditingDrive(false)}
              />
            )}
            {!merged.reference_url && !merged.drive_url && !editingDrive && (
              <p className="text-xs text-gray-400">提案書・資料は「<a href="/learn" className="text-indigo-500 hover:underline">資料登録</a>」からPDFをアップロードして紐付けできます</p>
            )}
          </div>

          <Link href={`/draft?case=${merged.id}`}
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
