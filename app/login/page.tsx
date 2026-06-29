"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { setUser } from "@/lib/auth";
import { findAllowedUser } from "@/lib/allowed-users";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimEmail = email.trim();

    if (!trimEmail.includes("@")) {
      setError("正しいメールアドレスの形式で入力してください");
      return;
    }

    const allowed = findAllowedUser(trimEmail);
    if (!allowed) {
      // 存在しない（許可されていない）アドレス
      setError("このメールアドレスは登録されていません。管理者にお問い合わせください。");
      window.alert("このメールアドレスは登録されていません。\n登録済みの会社メールアドレスでログインしてください。");
      return;
    }

    setUser({ email: allowed.email, name: allowed.name });
    router.replace("/");
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-sm border p-8 space-y-6">
        <div className="text-center space-y-1">
          <div className="w-12 h-12 bg-gray-900 rounded-xl mx-auto flex items-center justify-center">
            <span className="text-white font-bold text-lg">DI</span>
          </div>
          <h1 className="text-xl font-bold text-gray-900 mt-3">ログイン</h1>
          <p className="text-sm text-gray-500">登録済みの会社メールアドレスでログインしてください</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-700">メールアドレス</label>
            <input
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(""); }}
              placeholder="your.name@digitalidentity.co.jp"
              className="w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent"
              autoFocus
            />
          </div>
          {error && (
            <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              <svg className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /></svg>
              <p className="text-xs text-red-600">{error}</p>
            </div>
          )}
          <button
            type="submit"
            className="w-full bg-gray-900 text-white rounded-lg py-2.5 text-sm font-semibold hover:bg-gray-800 transition-colors"
          >
            ログイン
          </button>
        </form>

        <p className="text-xs text-gray-400 text-center leading-relaxed">
          登録されていないアドレスではログインできません。<br />
          アクセスが必要な場合は管理者へご連絡ください。
        </p>
      </div>
    </div>
  );
}
