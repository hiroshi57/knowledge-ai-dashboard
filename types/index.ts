export type Industry = "不動産" | "EC・通販" | "教育" | "美容・健康" | "BtoB製造" | "飲食" | "医療" | "金融";
export type ServiceType = "SEO" | "リスティング広告" | "SNS運用" | "コンテンツ制作" | "ブランディング" | "CRM" | "動画制作";
export type Result = "大幅改善" | "改善" | "横ばい" | "未計測";

export type Case = {
  id: string;
  title: string;
  client_name: string;
  industry: Industry;
  services: ServiceType[];
  summary: string;
  background: string;
  strategy: string;
  result: Result;
  kpi: string;         // 例: "CVR +38%"
  period: string;      // 例: "2024-04 〜 2025-03"
  tags: string[];
  created_at: string;
  relevance_score?: number; // 検索時のスコア 0-100
};

export type DraftSection = {
  title: string;
  content: string;
};

export type ProposalDraft = {
  id: string;
  case_ids: string[];
  client_input: string;
  industry: Industry | "";
  services: ServiceType[];
  sections: DraftSection[];
  created_at: string;
};
