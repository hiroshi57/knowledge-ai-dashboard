// ログインを許可するユーザーの定義。
// ① 会社ドメイン (@digitalidentity.co.jp) のアドレスは全員ログイン可能。
// ② それ以外（共有先SIなど）は下記 ALLOWED_USERS に明示的に登録されたアドレスのみ許可。
// ここに該当しないアドレスはログインできません。
export type AllowedUser = { email: string; name: string };

// 会社ドメイン（このドメインの社員は全員ログイン可能）
export const COMPANY_DOMAINS = ["digitalidentity.co.jp"];

// 会社ドメイン以外で個別に許可するアカウント（共有先SIなど）
export const ALLOWED_USERS: AllowedUser[] = [
  // ── 共有先（SI）レビュー用アカウント ──
  { email: "review1@si-partner.co.jp", name: "SIレビュー担当1" },
  { email: "review2@si-partner.co.jp", name: "SIレビュー担当2" },
];

/** メールアドレスの local 部分から表示名を生成（例: hiroshi.takizawa → Hiroshi Takizawa） */
function nameFromEmail(email: string): string {
  const local = email.split("@")[0] || email;
  return local
    .split(/[._-]+/)
    .filter(Boolean)
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join(" ");
}

/**
 * メールアドレスから許可ユーザーを検索（大文字小文字・前後空白は無視）。
 * 会社ドメインなら自動で許可し、表示名をメールから生成する。
 * 許可されない場合は undefined を返す。
 */
export function findAllowedUser(email: string): AllowedUser | undefined {
  const norm = email.trim().toLowerCase();
  if (!norm.includes("@")) return undefined;

  // ① 明示的に登録されたアカウント
  const explicit = ALLOWED_USERS.find((u) => u.email.toLowerCase() === norm);
  if (explicit) return explicit;

  // ② 会社ドメインのアドレス
  const domain = norm.split("@")[1] || "";
  if (COMPANY_DOMAINS.includes(domain)) {
    return { email: norm, name: nameFromEmail(norm) };
  }

  return undefined;
}
