import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { Industry, Result, ServiceType } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const INDUSTRY_COLOR: Record<Industry, string> = {
  "不動産":    "bg-blue-100 text-blue-700",
  "EC・通販":  "bg-orange-100 text-orange-700",
  "教育":      "bg-green-100 text-green-700",
  "美容・健康": "bg-pink-100 text-pink-700",
  "BtoB製造":  "bg-gray-100 text-gray-700",
  "飲食":      "bg-amber-100 text-amber-700",
  "医療":      "bg-red-100 text-red-700",
  "金融":      "bg-indigo-100 text-indigo-700",
};

export const SERVICE_COLOR: Record<ServiceType, string> = {
  "SEO":          "bg-emerald-100 text-emerald-700",
  "リスティング広告": "bg-yellow-100 text-yellow-700",
  "SNS運用":      "bg-purple-100 text-purple-700",
  "コンテンツ制作": "bg-teal-100 text-teal-700",
  "ブランディング": "bg-rose-100 text-rose-700",
  "CRM":          "bg-cyan-100 text-cyan-700",
  "動画制作":     "bg-violet-100 text-violet-700",
};

export const RESULT_COLOR: Record<Result, string> = {
  "大幅改善": "bg-green-100 text-green-700",
  "改善":     "bg-blue-100 text-blue-700",
  "横ばい":   "bg-gray-100 text-gray-500",
  "未計測":   "bg-yellow-100 text-yellow-600",
};

// シンプルな全文検索スコアリング
export function calcRelevance(query: string, caseItem: { title: string; summary: string; tags: string[]; industry: string; services: string[] }): number {
  if (!query.trim()) return 100;
  const words = query.toLowerCase().split(/[\s　]+/);
  const target = [caseItem.title, caseItem.summary, ...caseItem.tags, caseItem.industry, ...caseItem.services]
    .join(" ").toLowerCase();
  const matched = words.filter((w) => target.includes(w)).length;
  return Math.round((matched / words.length) * 100);
}
