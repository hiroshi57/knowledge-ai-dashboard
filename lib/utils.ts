import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { Industry, Result, ServiceType } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const INDUSTRY_COLOR: Record<Industry, string> = {
  "金融・保険":  "bg-blue-100 text-blue-700",
  "不動産":      "bg-orange-100 text-orange-700",
  "EC・通販":    "bg-pink-100 text-pink-700",
  "旅行・ホテル": "bg-teal-100 text-teal-700",
  "BtoB・SaaS":  "bg-indigo-100 text-indigo-700",
  "通信・IT":    "bg-cyan-100 text-cyan-700",
  "自動車":      "bg-gray-100 text-gray-700",
  "その他":      "bg-slate-100 text-slate-600",
};

export const SERVICE_COLOR: Record<ServiceType, string> = {
  "SEO":              "bg-emerald-100 text-emerald-700",
  "運用型広告":        "bg-yellow-100 text-yellow-700",
  "コンテンツマーケティング": "bg-teal-100 text-teal-700",
  "SNS運用":          "bg-purple-100 text-purple-700",
  "CRO・LPO":         "bg-rose-100 text-rose-700",
  "Web制作":          "bg-blue-100 text-blue-700",
  "MA":               "bg-cyan-100 text-cyan-700",
  "DXコンサルティング": "bg-violet-100 text-violet-700",
  "クリエイティブ制作": "bg-orange-100 text-orange-700",
  "LLMO/AIO":         "bg-amber-100 text-amber-700",
  "調査・リサーチ":    "bg-lime-100 text-lime-700",
};

export const RESULT_COLOR: Record<Result, string> = {
  "大幅改善": "bg-green-100 text-green-700",
  "改善":     "bg-blue-100 text-blue-700",
  "横ばい":   "bg-gray-100 text-gray-500",
  "未計測":   "bg-yellow-100 text-yellow-600",
};

export function calcRelevance(
  query: string,
  caseItem: { title: string; summary: string; tags: string[]; industry: string; services: string[] }
): number {
  if (!query.trim()) return 100;
  const words = query.toLowerCase().split(/[\s　]+/);
  const target = [caseItem.title, caseItem.summary, ...caseItem.tags, caseItem.industry, ...caseItem.services]
    .join(" ").toLowerCase();
  const matched = words.filter((w) => target.includes(w)).length;
  return Math.round((matched / words.length) * 100);
}
