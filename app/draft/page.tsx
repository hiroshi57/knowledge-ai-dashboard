"use client";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { MOCK_CASES } from "@/lib/mock-data";
import { KnowledgeDoc, loadDocs } from "@/lib/knowledge-store";
import { Case, Industry, ServiceType } from "@/types";
import { cn, INDUSTRY_COLOR, SERVICE_COLOR } from "@/lib/utils";
import { Bot, Check, ChevronDown, ChevronUp, Copy, Download, FileText, Sparkles } from "lucide-react";
import Link from "next/link";

const INDUSTRIES: Industry[] = ["金融・保険", "不動産", "EC・通販", "旅行・ホテル", "BtoB・SaaS", "通信・IT", "自動車", "その他"];
const SERVICES: ServiceType[] = ["SEO", "運用型広告", "コンテンツマーケティング", "SNS運用", "CRO・LPO", "Web制作", "MA", "DXコンサルティング", "クリエイティブ制作", "LLMO/AIO", "調査・リサーチ"];

// ─── サービス別の詳細テンプレート ───────────────────────────
const SERVICE_DETAIL: Record<string, { issue: string; approach: string; kpi: string }> = {
  "SEO": {
    issue: "自然検索流入の停滞・競合サイトへの順位逆転",
    approach: "技術SEO診断 → キーワード戦略再設計 → E-E-A-T対応コンテンツ制作 → 内部リンク最適化",
    kpi: "自然検索流入数 +30〜50%、指名検索クリック数 +20%",
  },
  "運用型広告": {
    issue: "CPAの高止まり・クリエイティブの疲弊・媒体効率の低下",
    approach: "媒体横断の予算配分最適化 → クリエイティブABテスト高速PDCA → 入札戦略の自動化",
    kpi: "CPA 前年比 -20〜40%、ROAS +30%",
  },
  "コンテンツマーケティング": {
    issue: "認知・教育コンテンツ不足によるリード質の低下",
    approach: "カスタマージャーニー設計 → ピラーページ×クラスターコンテンツ体系化 → 配信チャネル最適化",
    kpi: "オーガニック流入 +40%、リード獲得数 +25%",
  },
  "SNS運用": {
    issue: "エンゲージメント率の低迷・ブランド認知の広がらなさ",
    approach: "ターゲットインサイト分析 → コンテンツカレンダー設計 → UGC活用施策",
    kpi: "エンゲージメント率 2倍、フォロワー増加率 +30%/月",
  },
  "CRO・LPO": {
    issue: "流入に対してCVRが低く、広告費対効果が伸び悩んでいる",
    approach: "ユーザー行動分析（ヒートマップ・セッション録画）→ 仮説立案 → ABテスト設計・実施 → 勝ちパターン展開",
    kpi: "LP CVR +30〜100%、EFO改善によるフォーム完了率 +15%",
  },
  "MA": {
    issue: "獲得リードの放置・ナーチャリング不足による商談化率の低さ",
    approach: "リードスコアリング設計 → ステージ別シナリオ構築 → 広告連携でホットリードの自動アラート",
    kpi: "商談化率 +20%、リード対商談転換コスト -30%",
  },
  "Web制作": {
    issue: "サイト設計の老朽化・UXの不一致によるCV損失",
    approach: "情報設計（IA）再構築 → UXリサーチ → デザインシステム策定 → 継続的改善体制",
    kpi: "直帰率 -20%、CVR +25%、サイト表示速度 Core Web Vitals 改善",
  },
  "DXコンサルティング": {
    issue: "デジタル施策の断片化・部門間連携不足・データ活用基盤の欠如",
    approach: "現状診断（As-Is整理）→ To-Beロードマップ策定 → PoC設計 → 推進体制構築支援",
    kpi: "業務工数 -30%、データドリブン意思決定の仕組み化",
  },
  "クリエイティブ制作": {
    issue: "クリエイティブの訴求力不足・制作スピードと品質のジレンマ",
    approach: "ターゲットインサイト深掘り → メッセージアーキテクチャ設計 → 高速制作PDCA体制",
    kpi: "CTR +30〜120%、ブランドリフト調査スコア向上",
  },
  "LLMO/AIO": {
    issue: "生成AI検索（ChatGPT/Perplexity等）への非対応・AI時代の流入機会損失",
    approach: "AIクローラビリティ診断 → 構造化データ整備 → AI引用されやすいコンテンツ設計 → 効果モニタリング",
    kpi: "AI検索での言及頻度 可視化・改善、ブランド指名流入 +15%",
  },
  "調査・リサーチ": {
    issue: "意思決定の根拠となるデータ不足・顧客理解の主観的な状態",
    approach: "調査設計（定量/定性）→ フィールドワーク・インタビュー実施 → インサイト抽出 → 施策提言",
    kpi: "意思決定の根拠データ取得、顧客理解度スコア向上",
  },
};

const INDUSTRY_CONTEXT: Record<string, string> = {
  "金融・保険": "規制対応・信頼性訴求・複雑な商品説明のわかりやすさ",
  "不動産": "長期検討ファネル・物件情報の鮮度・エリア別SEO",
  "EC・通販": "購買サイクルの短縮・LTV向上・カート離脱対策",
  "旅行・ホテル": "季節性・比較サイト対策・体験訴求コンテンツ",
  "BtoB・SaaS": "長期商談サイクル・意思決定者への訴求・導入事例活用",
  "通信・IT": "スペック訴求とベネフィット訴求のバランス・乗り換え訴求",
  "自動車": "試乗・来店誘導・地域ターゲティング・ライフイベント起点",
  "その他": "ターゲット属性に合わせた最適なチャネル選定",
};

// ─── 骨子生成ロジック ───────────────────────────────────────
function generateDraft(
  client: string,
  industry: string,
  services: string[],
  challenge: string,
  relatedCases: Case[],
  relatedDocs: KnowledgeDoc[]
) {
  const clientName = client || "貴社";
  const industryCtx = INDUSTRY_CONTEXT[industry] || "業界特性に最適化した施策設計";
  const primaryService = services[0] ?? "デジタルマーケティング";
  const primaryDetail = SERVICE_DETAIL[primaryService];
  const topCase = relatedCases[0];
  const topCase2 = relatedCases[1];

  const serviceDetails = services.map((s) => SERVICE_DETAIL[s]).filter(Boolean);

  return [
    {
      title: "① エグゼクティブサマリー",
      content: [
        `【本提案の要旨】`,
        `${clientName}の${industry ? `${industry}市場における` : ""}デジタルマーケティング課題に対し、${services.join("・")}を中心とした統合施策をご提案します。`,
        ``,
        `【提案の核心】`,
        `・課題：${challenge || primaryDetail?.issue || "デジタル施策の効率・成果の最大化"}`,
        `・解決策：${primaryDetail?.approach?.split("→")[0]?.trim() || "戦略的なデジタル施策の統合"}`,
        `・期待成果：${primaryDetail?.kpi || "売上・CVの最大化"}`,
        ``,
        `【弊社が選ばれる理由】`,
        `・${industry}領域での${services[0]}実績を多数保有`,
        `・戦略立案〜実行〜改善を一気通貫で担当`,
        topCase ? `・直近類似事例：${topCase.client_name}様「${topCase.kpi}」を達成` : `・業種特化の専門チームが担当`,
      ].join("\n"),
    },
    {
      title: "② 現状課題の整理・診断",
      content: [
        `【${clientName}が直面している課題】`,
        `${challenge ? `■ ご要望の課題\n${challenge}\n` : ""}`,
        `■ ${industry || "業界"}における構造的な課題`,
        `${industryCtx}`,
        ``,
        `■ ${services.join("・")}領域の一般的な課題`,
        ...serviceDetails.slice(0, 2).map((d) => `・${d.issue}`),
        ``,
        `【課題の根本原因（仮説）】`,
        `1. 施策の点在化：各チャネルが独立して動いており、統合的な顧客体験が設計されていない`,
        `2. データ活用不足：取得データが分析・意思決定に活用されていない`,
        `3. PDCAサイクルの遅さ：改善の頻度・速度が競合に対して劣後している`,
        ``,
        `※ 詳細は初回ヒアリング（1〜2時間）にて確認・精査いたします`,
      ].join("\n"),
    },
    {
      title: "③ 提案戦略の全体像",
      content: [
        `【戦略の考え方】`,
        `${services.length > 1
          ? `${services.join("・")}を有機的に連携させ、「認知→検討→購買→継続」の各フェーズで最大の効果を創出します。`
          : `${primaryService}を核に置き、PDCAを高速で回しながら成果を積み上げます。`}`,
        ``,
        `【戦略ロジック】`,
        `┌─────────────────────────────────────────┐`,
        `│  認知・流入獲得  →  育成・転換  →  最適化・拡大  │`,
        `└─────────────────────────────────────────┘`,
        ...(services.length > 1 ? [
          ``,
          `▼ 各施策の役割分担`,
          ...services.map((s, i) => {
            const d = SERVICE_DETAIL[s];
            return `[${s}]  ${d?.approach?.split("→")[0]?.trim() || "施策実行"}`;
          }),
        ] : []),
        ``,
        `【他社との差別化ポイント】`,
        `・業種特化の専門知識と汎用的なデジタル技術の掛け合わせ`,
        `・戦略立案から運用・制作まで分断なく一気通貫で対応`,
        `・過去${MOCK_CASES.length}件以上の事例ナレッジをもとにした再現性の高いアプローチ`,
      ].join("\n"),
    },
    {
      title: "④ 施策詳細",
      content: services.map((s, i) => {
        const d = SERVICE_DETAIL[s];
        return [
          `【施策${i + 1}：${s}】`,
          `■ 課題認識`,
          `${d?.issue || "現状の非効率を改善し、成果を最大化"}`,
          ``,
          `■ 実施内容`,
          ...(d?.approach?.split("→").map((step, j) => `  STEP${j + 1}. ${step.trim()}`) ?? ["  詳細はヒアリング後に設計"]),
          ``,
          `■ 期待KPI`,
          `${d?.kpi || "成果指標はヒアリング後に設定"}`,
        ].join("\n");
      }).join("\n\n"),
    },
    {
      title: "⑤ 期待成果・KPI設計",
      content: [
        `【KPI設計の考え方】`,
        `「ビジネスKPI → マーケティングKPI → 施策KPI」の3層で管理します。`,
        ``,
        `■ ビジネスKPI（最終目標）`,
        `売上・リード数・契約数など、経営に直結する指標`,
        ``,
        `■ マーケティングKPI（中間指標）`,
        ...services.slice(0, 3).map((s) => `・${s}：${SERVICE_DETAIL[s]?.kpi || "指標設定"}`),
        ``,
        `■ 施策KPI（先行指標）`,
        `CTR・CVR・セッション数・エンゲージメント率など週次モニタリング指標`,
        ``,
        `【類似事例の実績参考値】`,
        ...(relatedCases.slice(0, 2).map((c) =>
          `・${c.client_name}（${c.industry}）：${c.kpi}`
        )),
        ``,
        `※ 具体数値は現状のベースライン確認後にコミット値として設定します`,
      ].join("\n"),
    },
    {
      title: "⑥ 実施スケジュール",
      content: [
        `【推奨フェーズ設計（6ヶ月）】`,
        ``,
        `▼ Phase 0（キックオフ：〜2週間）`,
        `  ・現状分析・課題確認ヒアリング`,
        `  ・KPI設定・ダッシュボード構築`,
        `  ・担当チーム編成・週次MTG設計`,
        ``,
        `▼ Phase 1（立ち上げ：1〜2ヶ月目）`,
        `  ・${services[0] ?? "主要施策"}の初期設定・稼働開始`,
        `  ・競合調査・ターゲット定義の精緻化`,
        services.length > 1 ? `  ・${services[1]}の設計・準備` : `  ・効果計測体制の整備`,
        ``,
        `▼ Phase 2（改善・拡大：3〜4ヶ月目）`,
        `  ・初期データに基づくPDCA実施`,
        `  ・クリエイティブ・コンテンツの増産`,
        services.length > 1 ? `  ・${services.slice(1).join("・")}との連携強化` : `  ・施策の横展開`,
        ``,
        `▼ Phase 3（最適化：5〜6ヶ月目）`,
        `  ・成果最大化に向けた予算・リソース最適配分`,
        `  ・次フェーズ計画の策定（半期〜年間ロードマップ）`,
        `  ・成果報告会・継続提案`,
        ``,
        `【レポーティング体制】`,
        `週次：施策KPI共有 / 月次：マーケKPI + 改善提案 / 四半期：ビジネスKPI評価`,
      ].join("\n"),
    },
    {
      title: "⑦ 参考事例・実績根拠",
      content: [
        `【類似業種・施策の実績】`,
        ...(relatedCases.slice(0, 3).map((c, i) => [
          ``,
          `■ 事例${i + 1}：${c.title}`,
          `  業種：${c.industry}　施策：${c.services.join("・")}`,
          `  課題：${c.background.slice(0, 60)}…`,
          `  施策：${c.strategy.slice(0, 60)}…`,
          `  成果：${c.kpi}`,
        ].join("\n"))),
        ...(relatedDocs.length > 0 ? [
          ``,
          `【社内ドキュメント参照】`,
          ...relatedDocs.map((d) => `  ・${d.title}：${d.summary.slice(0, 100)}…`),
        ] : []),
      ].join("\n"),
    },
    {
      title: "⑧ 費用感・次のステップ",
      content: [
        `【想定費用レンジ（参考）】`,
        `・スモールスタート：月額 30〜50万円（単一施策・小規模）`,
        `・標準プラン：月額 80〜150万円（複数施策・統合運用）`,
        `・フルサポート：月額 200万円〜（戦略立案〜全施策一括）`,
        ``,
        `※ 詳細はご状況ヒアリング後にお見積りします`,
        ``,
        `【次のステップ】`,
        `STEP1. ヒアリング実施（60〜90分）`,
        `  → 現状数値・課題・予算感・社内体制の確認`,
        ``,
        `STEP2. 詳細提案書の作成（1〜2週間）`,
        `  → KPIコミット値・詳細スケジュール・お見積り提出`,
        ``,
        `STEP3. キックオフ`,
        `  → 契約後、最短1週間で稼働開始`,
        ``,
        `【お問い合わせ】`,
        `Digital Identity株式会社`,
        `https://digitalidentity.co.jp/`,
      ].join("\n"),
    },
  ];
}

// ─── テキストDL ───────────────────────────────────────────
function downloadText(client: string, sections: { title: string; content: string }[]) {
  const date = new Date().toISOString().slice(0, 10);
  const filename = `提案書ドラフト_${client || "クライアント"}_${date}.txt`;
  const header = [
    "═".repeat(60),
    `提案書ドラフト`,
    `クライアント：${client || "（未入力）"}`,
    `作成日：${date}`,
    "═".repeat(60),
    "",
  ].join("\n");
  const body = sections.map((s) => [
    `${"─".repeat(60)}`,
    `${s.title}`,
    `${"─".repeat(60)}`,
    s.content,
    "",
  ].join("\n")).join("\n");
  const blob = new Blob([header + body], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

// ─── コンポーネント ───────────────────────────────────────
function DraftContent() {
  const params = useSearchParams();
  const preselectedCaseId = params.get("case");

  const [client, setClient] = useState("");
  const [industry, setIndustry] = useState<Industry | "">("");
  const [services, setServices] = useState<ServiceType[]>([]);
  const [challenge, setChallenge] = useState("");
  const [generated, setGenerated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [draft, setDraft] = useState<{ title: string; content: string }[]>([]);
  const [openIdx, setOpenIdx] = useState<number | null>(0);
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
  }, [preselectedCaseId]);

  const relatedCases = MOCK_CASES.filter((c) =>
    c.industry === industry || c.services.some((s) => services.includes(s))
  ).slice(0, 3);

  const relatedDocs = learnedDocs.filter((d) =>
    d.tags.some((t) => services.includes(t as ServiceType)) ||
    (industry && d.content.includes(industry))
  ).slice(0, 2);

  const toggleService = (s: ServiceType) =>
    setServices((prev) => prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]);

  const handleGenerate = () => {
    setLoading(true);
    setTimeout(() => {
      setDraft(generateDraft(client, industry, services, challenge, relatedCases, relatedDocs));
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
        <p className="text-gray-500 text-sm mt-1">条件を入力すると過去事例・社内ナレッジを参照した論理的な提案書骨子を生成します</p>
      </div>

      {/* 入力フォーム */}
      <div className="bg-white border rounded-xl p-5 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-600">クライアント名（任意）</label>
            <input value={client} onChange={(e) => setClient(e.target.value)}
              placeholder="例：株式会社〇〇"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-600">業種</label>
            <select value={industry} onChange={(e) => setIndustry(e.target.value as Industry | "")}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200">
              <option value="">業種を選択</option>
              {INDUSTRIES.map((i) => <option key={i} value={i}>{i}</option>)}
            </select>
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-gray-600">課題・背景（任意）</label>
          <textarea value={challenge} onChange={(e) => setChallenge(e.target.value)}
            placeholder="例：CPAが高止まりしており、広告効率の改善が急務。競合に比べ自然検索流入が少ない…"
            rows={2}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 resize-none" />
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
          <div className="bg-indigo-50 border border-indigo-100 rounded-lg px-4 py-3 space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-semibold text-indigo-700">
              <Bot className="w-3.5 h-3.5" />参照予定のソース（{relatedCases.length + relatedDocs.length}件）
            </div>
            {relatedCases.map((c) => (
              <p key={c.id} className="text-xs text-indigo-600 pl-5">📊 {c.title}（{c.kpi}）</p>
            ))}
            {relatedDocs.map((d) => (
              <p key={d.id} className="text-xs text-indigo-600 pl-5">📄 {d.title}</p>
            ))}
          </div>
        )}

        <button onClick={handleGenerate}
          disabled={loading || (!industry && services.length === 0)}
          className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white text-sm font-semibold py-3 rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
          {loading ? <><span className="animate-spin inline-block">⟳</span>AI生成中...</>
            : <><Sparkles className="w-4 h-4" />提案書ドラフトを生成（8セクション）</>}
        </button>
      </div>

      {/* 生成結果 */}
      {generated && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-500" />
              <p className="font-semibold text-sm text-gray-700">生成されたドラフト</p>
              <span className="text-xs text-gray-400">{draft.length}セクション</span>
            </div>
            <div className="flex gap-2">
              <button onClick={handleCopy}
                className="flex items-center gap-1.5 text-xs text-gray-600 border border-gray-200 rounded-lg px-3 py-1.5 hover:bg-gray-50 transition-colors">
                {copied ? <><Check className="w-3.5 h-3.5 text-green-500" />コピー済み</> : <><Copy className="w-3.5 h-3.5" />コピー</>}
              </button>
              <button onClick={() => downloadText(client, draft)}
                className="flex items-center gap-1.5 text-xs text-white bg-indigo-600 border border-indigo-600 rounded-lg px-3 py-1.5 hover:bg-indigo-700 transition-colors font-medium">
                <Download className="w-3.5 h-3.5" />TXTダウンロード
              </button>
            </div>
          </div>

          {draft.map((section, idx) => (
            <div key={idx} className="bg-white border rounded-xl overflow-hidden">
              <button onClick={() => setOpenIdx(openIdx === idx ? null : idx)}
                className="w-full flex items-center justify-between px-5 py-3.5 text-left hover:bg-gray-50 transition-colors">
                <span className="font-semibold text-sm text-gray-800">{section.title}</span>
                {openIdx === idx ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
              </button>
              {openIdx === idx && (
                <div className="px-5 pb-5 border-t">
                  <pre className="text-xs text-gray-700 leading-relaxed whitespace-pre-wrap pt-4 font-sans">{section.content}</pre>
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
