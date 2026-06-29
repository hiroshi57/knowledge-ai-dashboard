export type AuthUser = {
  email: string;
  name: string;
};

const KEY = "di_auth_user";

export function getUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  } catch {
    return null;
  }
}

export function setUser(user: AuthUser) {
  localStorage.setItem(KEY, JSON.stringify(user));
}

export function clearUser() {
  localStorage.removeItem(KEY);
}

/** メールから表示名を生成（例: taro.yamada@co.jp → 山田 太郎 風に名前が無ければIDを使う） */
export function displayInitial(user: AuthUser): string {
  return user.name.charAt(0).toUpperCase();
}
