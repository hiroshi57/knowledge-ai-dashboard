"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import { KnowledgeDoc, loadDocs, saveDoc, deleteDoc } from "@/lib/knowledge-store";
import { BookOpen, Check, CloudUpload, ExternalLink, FileText, Tag, Trash2, Upload } from "lucide-react";
import { cn } from "@/lib/utils";

// テキスト抽出（PDF/DOCX/TXT）
async function extractText(file: File): Promise<string> {
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";

  if (ext === "txt" || ext === "md") {
    return new Promise((res) => {
      const reader = new FileReader();
      reader.onload = (e) => res((e.target?.result as string) ?? "");
      reader.readAsText(file);
    });
  }

  if (ext === "docx") {
    const mammoth = await import("mammoth");
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    return result.value;
  }

  if (ext === "pdf") {
    const pdfjsLib = await import("pdfjs-dist");
    pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let text = "";
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      text += content.items.map((item) => ("str" in item ? item.str : "")).join(" ") + "\n";
    }
    return text;
  }

  return `[${ext}ファイル：テキスト抽出非対応]`;
}

function autoTags(text: string, filename: string): string[] {
  const keywords = ["SEO", "広告", "提案書", "事例", "リスティング", "SNS", "コンテンツ", "ブランディング", "CRM", "MA", "KPI", "CVR", "ROAS"];
  return keywords.filter((k) => text.includes(k) || filename.includes(k)).slice(0, 5);
}

export default function LearnPage() {
  const [docs, setDocs] = useState<KnowledgeDoc[]>([]);
  const [dragging, setDragging] = useState(false);
  const [processing, setProcessing] = useState<string | null>(null);
  const [pasteMode, setPasteMode] = useState(false);
  const [pasteTitle, setPasteTitle] = useState("");
  const [pasteText, setPasteText] = useState("");
  const [saved, setSaved] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const reload = useCallback(() => setDocs(loadDocs()), []);

  useEffect(() => {
    reload();
    window.addEventListener("knowledge_updated", reload);
    return () => window.removeEventListener("knowledge_updated", reload);
  }, [reload]);

  const processFile = async (file: File) => {
    setProcessing(file.name);
    try {
      const content = await extractText(file);
      const doc: KnowledgeDoc = {
        id: `doc_${Date.now()}_${Math.random().toString(36).slice(2)}`,
        title: file.name.replace(/\.[^.]+$/, ""),
        content,
        summary: content.slice(0, 300).trim(),
        source: "upload",
        file_type: file.name.split(".").pop()?.toLowerCase() ?? "unknown",
        tags: autoTags(content, file.name),
        created_at: new Date().toISOString(),
      };
      saveDoc(doc);
    } finally {
      setProcessing(null);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const files = Array.from(e.dataTransfer.files);
    for (const f of files) await processFile(f);
  };

  const handleFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    for (const f of files) await processFile(f);
  };

  const handlePasteSave = () => {
    if (!pasteTitle.trim() || !pasteText.trim()) return;
    const doc: KnowledgeDoc = {
      id: `doc_${Date.now()}`,
      title: pasteTitle.trim(),
      content: pasteText.trim(),
      summary: pasteText.trim().slice(0, 300),
      source: "paste",
      file_type: "text",
      tags: autoTags(pasteText, pasteTitle),
      created_at: new Date().toISOString(),
    };
    saveDoc(doc);
    setPasteTitle(""); setPasteText(""); setPasteMode(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">ナレッジ学習</h1>
        <p className="text-gray-500 text-sm mt-1">提案書・事例をアップロードしてAIに学習させます。検索・ドラフト生成に反映されます。</p>
      </div>

      {/* Google Drive連携 */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-4">
        <div className="bg-blue-100 text-blue-700 w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0">
          <CloudUpload className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <p className="font-semibold text-blue-800 text-sm">Google Drive から取り込む</p>
          <p className="text-xs text-blue-600 mt-1">社内共有ドライブの提案書・事例資料を検索・参照できます。Drive上でファイルを選択後、内容をコピーして「テキスト貼り付け」で登録してください。</p>
        </div>
        <a href="/gdrive-search.html" target="_blank" rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-xs text-white bg-blue-600 rounded-lg px-4 py-2.5 hover:bg-blue-700 transition-colors font-medium flex-shrink-0 whitespace-nowrap">
          <ExternalLink className="w-3.5 h-3.5" />Driveを開く
        </a>
      </div>

      {/* ファイルドロップゾーン */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileRef.current?.click()}
        className={cn(
          "border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors",
          dragging ? "border-indigo-400 bg-indigo-50" : "border-gray-300 hover:border-indigo-300 hover:bg-gray-50"
        )}
      >
        <input ref={fileRef} type="file" multiple accept=".pdf,.docx,.txt,.md" onChange={handleFiles} className="hidden" />
        <Upload className="w-8 h-8 text-gray-400 mx-auto mb-3" />
        <p className="font-semibold text-gray-700 text-sm">ファイルをドラッグ&ドロップ</p>
        <p className="text-xs text-gray-400 mt-1">PDF / Word（DOCX）/ テキスト（TXT・MD）対応</p>
        {processing && (
          <p className="text-xs text-indigo-600 mt-3 animate-pulse">⟳ 処理中: {processing}</p>
        )}
      </div>

      {/* テキスト貼り付け */}
      <div className="bg-white border rounded-xl overflow-hidden">
        <button onClick={() => setPasteMode(!pasteMode)}
          className="w-full flex items-center gap-3 px-5 py-3.5 text-left hover:bg-gray-50 transition-colors">
          <FileText className="w-4 h-4 text-gray-500" />
          <span className="font-semibold text-sm text-gray-700">テキストを貼り付けて登録</span>
          <span className="text-xs text-gray-400 ml-1">（Driveのファイル内容や議事録をコピペ）</span>
        </button>
        {pasteMode && (
          <div className="border-t px-5 pb-4 space-y-3 pt-3">
            <input value={pasteTitle} onChange={(e) => setPasteTitle(e.target.value)}
              placeholder="タイトル（例：株式会社〇〇 SEO提案書 2024年）"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200" />
            <textarea value={pasteText} onChange={(e) => setPasteText(e.target.value)}
              placeholder="ここに内容を貼り付けてください..."
              rows={6}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 resize-none" />
            <div className="flex gap-2">
              <button onClick={handlePasteSave}
                disabled={!pasteTitle.trim() || !pasteText.trim()}
                className="flex items-center gap-1.5 bg-indigo-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors font-medium">
                {saved ? <><Check className="w-4 h-4" />保存済み</> : <>保存してナレッジに追加</>}
              </button>
              <button onClick={() => setPasteMode(false)}
                className="text-sm text-gray-500 px-3 py-2 hover:text-gray-700">キャンセル</button>
            </div>
          </div>
        )}
      </div>

      {/* 学習済みドキュメント一覧 */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <BookOpen className="w-4 h-4 text-indigo-500" />
          <p className="font-semibold text-sm text-gray-700">学習済みドキュメント</p>
          <span className="text-xs text-gray-400">{docs.length}件</span>
        </div>

        {docs.length === 0 ? (
          <div className="bg-gray-50 border border-dashed border-gray-200 rounded-xl p-6 text-center">
            <p className="text-gray-400 text-sm">まだドキュメントが登録されていません</p>
            <p className="text-xs text-gray-300 mt-1">ファイルをドロップするか、テキストを貼り付けて追加してください</p>
          </div>
        ) : (
          <div className="space-y-2">
            {docs.map((doc) => (
              <div key={doc.id} className="bg-white border rounded-xl px-4 py-3 flex items-start gap-3">
                <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-bold",
                  doc.file_type === "pdf" ? "bg-red-100 text-red-600" :
                  doc.file_type === "docx" ? "bg-blue-100 text-blue-600" : "bg-gray-100 text-gray-500"
                )}>
                  {doc.file_type.toUpperCase().slice(0, 3)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-gray-800 truncate">{doc.title}</p>
                  <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{doc.summary}</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {doc.tags.map((t) => (
                      <span key={t} className="flex items-center gap-0.5 text-xs bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded-full">
                        <Tag className="w-2.5 h-2.5" />{t}
                      </span>
                    ))}
                    <span className={cn("text-xs px-1.5 py-0.5 rounded-full",
                      doc.source === "upload" ? "bg-green-50 text-green-600" :
                      doc.source === "gdrive" ? "bg-blue-50 text-blue-600" : "bg-gray-100 text-gray-500"
                    )}>
                      {doc.source === "upload" ? "📎 アップロード" : doc.source === "gdrive" ? "☁️ Drive" : "📋 貼り付け"}
                    </span>
                  </div>
                </div>
                <button onClick={() => { if (confirm("削除しますか？")) deleteDoc(doc.id); }}
                  className="text-gray-300 hover:text-red-500 transition-colors flex-shrink-0 mt-0.5">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
