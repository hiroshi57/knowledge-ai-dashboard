"use client";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { MOCK_CASES } from "@/lib/mock-data";
import { KnowledgeDoc, loadDocs } from "@/lib/knowledge-store";
import { Case, Industry, ServiceType } from "@/types";
import { cn, INDUSTRY_COLOR, SERVICE_COLOR } from "@/lib/utils";
import { Bot, Check, ChevronDown, ChevronUp, Copy, FileText, Sparkles } from "lucide-react";
import Link from "next/link";

const INDUSTRIES: Industry[] = ["不動産", "EC・通販", "教育", "美容・健康", "BtoB製造", "飲食", "医療", "金融"];
const SERVICES: ServiceType[] = ["SEO", "リスティング広告", "SNS運用", "コンテンツ制作", "ブランディング", "CRM", "動画制作"];

function generateDraft(
  client: string,
  industry: string,
  services: string[],
  relatedCases: Case[],
  relatedDocs: KnowledgeDoc[]
) {
  const caseRef = relatedCases[0];
  const kpi = caseRef?.kpi ?? "成果を最大化";
  const docRef = relatedDocs[0];

  const docContext = docRef
    ? `\n\n【参照ドキュメント: ${docRef.title}】\n${docRef.summary}`
    : "";

  return [
    {
      title: "① 現状認識と課題",
      content: `${client || "貴社"}は現在、${industry || "業界"}における競争環境の激化という課題を抱えておられると認識しております。特に${services.join("・")}の領域において、効果的な施策が求められている状況です。${docContext}`,
    },
    {
      title: "② 提案概要",
      content: `以下の施策を組み合わせた統合マーケティング戦略をご提案いたします。\n\n${services.map((s, i) => `${i + 1}. ${s}：専門チームによる高精度な運用・制作`).join("\n")}\n\n各施策を有機的に連携させることで、単独施策では得られない相乗効果を創出します。`,
    },
    {
      title: "③ 実績・参考事例",
      content: [
        ...relatedCases.slice(0, 2).map((c) =>
          `■ ${c.title}\n業種：${c.industry} / 施策：${c.services.join("・")}\n成果：${c.kpi}\n概要：${c.summary}`
        ),
        ...relatedDocs.slice(0, 1).map((d) =>
          `■ 社内ドキュメント参照：${d.title}\n${d.summary.slice(0, 150)}...`
        ),
      ].join("\n\n") || "弊社の豊富な実績をもとに、最適なアプローチをご提案いたします。",
    },
    {
      title: "④ 推奨施策・スケジュール",
      content: `【フェーズ1（1〜2ヶ月目）】現状分析・戦略設計\n・競合調査・ターゲット定義・KPI設定\n\n【フェーズ2（3〜4ヶ月目）】施策実装\n・${services[0] ?? "主要施策"}の立ち上げ・初期改善\n\n【フェーズ3（5ヶ月目〜）】最適化・拡大\n・データ分析に基づく継続改善・施策拡張`,
    },
    {
      title: "⑤ 期待成果・KPI",
      content: `過去の類似事例をもとに、以下の成果を目標として設定いたします。\n\n${caseRef ? `参考：${caseRef.kpi}（${caseRef.client_name}様 実績）` : ""}\n\n具体的なKPIは現状数値のヒアリング後に確定させていただきます。初期3ヶ月での基盤構築、6ヶ月での成果創出を想定しています。`,
    },
  ];
}

function DraftContent() {
  const params = useSearchParams();
  const preselectedCaseId = params.get("case");
  const preselectedDocId = params.get("doc");

  const [client, setClient] = useState("");
  const [industry, setIndustry] = useState<Industry | "">("");
  const [services, setServices] = useState<ServiceType[]>([]);
  const [generated, setGenerated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [draft, setDraft] = useState<{ title: string; content: string }[]>([]);
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);
  const [learnedDocs, setLearnedDocs] = useState<KnowledgeDoc[]>([]);

  useEffect(() => {
    setLearnedDocs(loadDocs());
    const handler = () => setLearnedDocs(loadDocs());
    window.addEventListener("knowledge_updated", handler);
    return () => window.removeEventListener("knowledge_updated", handler);
  }, []);

  useEffect(() => {
    if (preselectedCaseId) {
      const c = MOCK_CASES.find((c) => c.id === preselectedCaseId);
      if (c) { setIndustry(c.industry); setServices(c.services); }
    }
    if (preselectedDocId) {
      const d = learnedDocs.find((d) => d.id === preselectedDocId);
      if (d) {
        const foundTags = d.tags.filter((t): t is ServiceType =>
          (["SEO", "リスティング広告", "SNS運用", "コンテンツ制作", "ブランディング", "CRM", "動画制作"] as string[]).includes(t)
        );
        if (foundTags.length) setServices(foundTags);
      }
    }
  }, [preselectedCaseId, preselectedDocId, learnedDocs]);

  const relatedCases = MOCK_CASES.filter((c) =>
    c.industry === industry || c.services.some((s) => services.includes(s))
  ).slice(0, 3);

  const relatedDocs = learnedDocs.filter((d) =>
    d.tags.some((t) => services.includes(t as ServiceType)) ||
    (industry && d.content.includes(industry))
  ).slice(0, 2);

  const toggleService = (s: ServiceType) => {
    setServices((prev) => prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]);
  };

  const handleGenerate = () => {
    setLoading(true);
    setTimeout(() => {
      setDraft(generateDraft(client, industry, services, relatedCases, relatedDocs));
      setGenerated(true);
      setLoading(false);
      setOpenIdx(0);
    }, 1200);
  };

  const fullText = draft.map((d) => `## ${d.title}\n\n${d.content}`).join("\n\n---\n\n");

  const handleCopy = () => {
    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">提案書ドラフト生成</h1>
        <p className="text-gray-500 text-sm mt-1">条件を入力するとAIが過去事例＋学習済みドキュメントを参照してドラフトを自動作成します</p>
      </div>

      {/* 入力フォーム */}
      <div className="bg-white border rounded-xl p-5 space-y-4">
        <div className="space-y-1">
          <label className="text-xs font-semibold text-gray-600">クライアント名（任意）</label>
          <input value={client} onChange={(e) => setClient(e.target.value)}
            placeholder="例：株式会社〇〇"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200" />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-gray-600">業種</label>
          <div className="flex flex-wrap gap-2">
            {INDUSTRIES.map((i) => (
              <button key={i} onClick={() => setIndustry(industry === i ? "" : i)}
                className={cn("text-xs px-3 py-1.5 rounded-full border transition-colors font-medium",
                  industry === i ? `${INDUSTRY_COLOR[i]} border-current` : "border-gray-200 text-gray-500 hover:border-gray-400"
                )}>{i}</button>
            ))}
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-gray-600">提案施策（複数選択可）</label>
          <div className="flex flex-wrap gap-2">
            {SERVICES.map((s) => (
              <button key={s} onClick={() => toggleService(s)}
                className={cn("text-xs px-3 py-1.5 rounded-full border transition-colors font-medium",
                  services.includes(s)
                    ? "bg-indigo-100 text-indigo-700 border-indigo-300"
                    : "border-gray-200 text-gray-500 hover:border-gray-400"
                )}>{s}</button>
            ))}
          </div>
        </div>

        {/* 参照ソースプレビュー */}
        {(relatedCases.length > 0 || relatedDocs.length > 0) && (
          <div className="bg-indigo-50 border border-indigo-100 rounded-lg px-4 py-3 space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-indigo-700">
              <Bot className="w-3.5 h-3.5" />参照予定のソース
            </div>
            {relatedCases.map((c) => (
              <p key={c.id} className="text-xs text-indigo-600 pl-5">📊 事例: {c.title}</p>
            ))}
            {relatedDocs.map((d) => (
              <p key={d.id} className="text-xs text-indigo-600 pl-5">📄 ドキュメント: {d.title}</p>
            ))}
            {learnedDocs.length === 0 && (
              <Link href="/learn" className="block text-xs text-indigo-400 hover:text-indigo-600 pl-5 underline">
                + 学習ページでドキュメントを追加すると、より精度の高いドラフトが生成されます
              </Link>
            )}
          </div>
        )}

        <button onClick={handleGenerate}
          disabled={loading || (!industry && services.length === 0)}
          className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white text-sm font-semibold py-3 rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
          {loading ? <><span className="animate-spin">⟳</span>AI生成中...</>
            : <><Sparkles className="w-4 h-4" />提案書ドラフトを生成</>}
        </button>
      </div>

      {/* 生成結果 */}
      {generated && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-500" />
              <p className="font-semibold text-sm text-gray-700">生成されたドラフト</p>
            </div>
            <button onClick={handleCopy}
              className="flex items-center gap-1.5 text-xs text-gray-600 border border-gray-200 rounded-lg px-3 py-1.5 hover:bg-gray-50 transition-colors">
              {copied ? <><Check className="w-3.5 h-3.5 text-green-500" />コピー済み</> : <><Copy className="w-3.5 h-3.5" />全文コピー</>}
            </button>
          </div>

          {draft.map((section, idx) => (
            <div key={idx} className="bg-white border rounded-xl overflow-hidden">
              <button onClick={() => setOpenIdx(openIdx === idx ? null : idx)}
                className="w-full flex items-center justify-between px-5 py-3.5 text-left hover:bg-gray-50 transition-colors">
                <span className="font-semibold text-sm text-gray-800">{section.title}</span>
                {openIdx === idx ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
              </button>
              {openIdx === idx && (
                <div className="px-5 pb-4 border-t">
                  <p className="text-xs text-gray-600 leading-relaxed whitespace-pre-line pt-3">{section.content}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function DraftPage() {
  return <Suspense><DraftContent /></Suspense>;
}
