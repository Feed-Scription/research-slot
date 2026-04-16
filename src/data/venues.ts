export type Tier = 'god' | 'top' | 'mid' | 'meme';
export type Locale = 'zh-CN' | 'en';

export interface Venue {
  /** 会议/期刊名称（专有名词，不翻译） */
  name: string;
  tier: Tier;
}

/** JSON 文件里的 pack 结构（src/data/packs/*.json）。 */
export interface PackJSON {
  id: string;
  defaultEnabled?: boolean;
  /** 如果 true，装载后不出现在 ALL_PACKS（供未发布的草稿 pack 保留在仓库中）。 */
  hidden?: boolean;
  name: Record<Locale, string>;
  description: Record<Locale, string>;
  venues: Venue[];
  /**
   * 学科专属审稿梗（可选）。有的 tier 可以省略——省略的 fallback 到全局 i18n。
   * 两种语言下同一 tier 的数组长度应该一致。
   */
  commentsByRating?: Record<Locale, Partial<Record<string, string[]>>>;
}

export interface VenuePack extends PackJSON {
  defaultEnabled: boolean;
}

/**
 * 自动加载 src/data/packs/*.json。
 * Vite 构建时会把每个 JSON 文件静态打包进 bundle；新增一个学科只需要往
 * `src/data/packs/` 扔一个 JSON 文件（参考 _example.json），无需改任何 TS 代码。
 * 以 `_` 开头的文件名会被跳过（用于模板/草稿）。
 */
const packModules = import.meta.glob<PackJSON>('./packs/*.json', {
  eager: true,
  import: 'default',
});

function isHiddenFile(path: string): boolean {
  const base = path.split('/').pop() ?? '';
  return base.startsWith('_');
}

export const ALL_PACKS: VenuePack[] = Object.entries(packModules)
  .filter(([path, pack]) => !isHiddenFile(path) && !pack.hidden)
  .map(([, pack]) => ({
    ...pack,
    defaultEnabled: !!pack.defaultEnabled,
  }))
  // 稳定排序：defaultEnabled 靠前，再按 id 字母序
  .sort((a, b) => {
    if (a.defaultEnabled !== b.defaultEnabled) return a.defaultEnabled ? -1 : 1;
    return a.id.localeCompare(b.id);
  });

export function getActiveVenues(enabledPackIds: string[]): Venue[] {
  const ids = new Set(enabledPackIds);
  return ALL_PACKS.filter((p) => ids.has(p.id)).flatMap((p) => p.venues);
}

export function getDefaultEnabledPackIds(): string[] {
  return ALL_PACKS.filter((p) => p.defaultEnabled).map((p) => p.id);
}

export function getPackById(id: string): VenuePack | undefined {
  return ALL_PACKS.find((p) => p.id === id);
}
