// 事例ごとの drive_url / reference_url をローカルで上書き保存する仕組み
// clients.md の Drive フォルダURLを紐付ける用途

export type CaseOverride = {
  case_id: string;
  drive_url?: string;
  reference_url?: string;
  memo?: string;
};

const KEY = "case_overrides";

export function loadOverrides(): Record<string, CaseOverride> {
  if (typeof window === "undefined") return {};
  try {
    const arr: CaseOverride[] = JSON.parse(localStorage.getItem(KEY) ?? "[]");
    return Object.fromEntries(arr.map((o) => [o.case_id, o]));
  } catch {
    return {};
  }
}

export function saveOverride(override: CaseOverride) {
  const all = loadOverrides();
  all[override.case_id] = { ...all[override.case_id], ...override };
  localStorage.setItem(KEY, JSON.stringify(Object.values(all)));
  window.dispatchEvent(new CustomEvent("case_overrides_updated"));
}

export function deleteOverride(case_id: string) {
  const all = loadOverrides();
  delete all[case_id];
  localStorage.setItem(KEY, JSON.stringify(Object.values(all)));
  window.dispatchEvent(new CustomEvent("case_overrides_updated"));
}
