export type Industry =
  | "金融・保険"
  | "不動産"
  | "EC・通販"
  | "旅行・ホテル"
  | "BtoB・SaaS"
  | "通信・IT"
  | "自動車"
  | "その他";

export type ServiceType =
  | "SEO"
  | "運用型広告"
  | "コンテンツマーケティング"
  | "SNS運用"
  | "CRO・LPO"
  | "Web制作"
  | "MA"
  | "DXコンサルティング"
  | "クリエイティブ制作"
  | "LLMO/AIO"
  | "調査・リサーチ";

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
  kpi: string;
  period: string;
  tags: string[];
  created_at: string;
  relevance_score?: number;
};

export type KnowledgeDoc = {
  id: string;
  title: string;
  content: string;
  summary: string;
  source: "upload" | "paste" | "gdrive";
  file_type: string;
  tags: string[];
  created_at: string;
};

export type ProposalDraft = {
  id: string;
  case_ids: string[];
  client_input: string;
  industry: Industry | "";
  services: ServiceType[];
  sections: { title: string; content: string }[];
  created_at: string;
};
