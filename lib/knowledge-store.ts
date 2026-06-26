export type KnowledgeDoc = {
  id: string;
  title: string;
  content: string;         // フルテキスト
  summary: string;         // 先頭300字
  source: "upload" | "paste" | "gdrive";
  file_type: string;       // pdf / docx / txt / etc
  tags: string[];
  created_at: string;
};

const KEY = "knowledge_docs";

export function loadDocs(): KnowledgeDoc[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "[]");
  } catch {
    return [];
  }
}

export function saveDoc(doc: KnowledgeDoc) {
  const docs = loadDocs();
  const existing = docs.findIndex((d) => d.id === doc.id);
  if (existing >= 0) docs[existing] = doc;
  else docs.unshift(doc);
  localStorage.setItem(KEY, JSON.stringify(docs));
  window.dispatchEvent(new CustomEvent("knowledge_updated"));
}

export function deleteDoc(id: string) {
  const docs = loadDocs().filter((d) => d.id !== id);
  localStorage.setItem(KEY, JSON.stringify(docs));
  window.dispatchEvent(new CustomEvent("knowledge_updated"));
}

export function searchDocs(query: string): (KnowledgeDoc & { score: number })[] {
  if (!query.trim()) return loadDocs().map((d) => ({ ...d, score: 100 }));
  const words = query.toLowerCase().split(/[\s　]+/);
  return loadDocs()
    .map((d) => {
      const target = [d.title, d.content, ...d.tags].join(" ").toLowerCase();
      const matched = words.filter((w) => target.includes(w)).length;
      return { ...d, score: Math.round((matched / words.length) * 100) };
    })
    .filter((d) => d.score > 0)
    .sort((a, b) => b.score - a.score);
}
