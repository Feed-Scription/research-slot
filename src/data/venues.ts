export type Tier = 'god' | 'top' | 'mid' | 'meme';

export interface Venue {
  /** 会议/期刊名称（专有名词，不翻译） */
  name: string;
  tier: Tier;
}

export interface VenuePack {
  /** 稳定 id（用于 i18n lookup `packs.{id}.name`/`description`） */
  id: string;
  defaultEnabled: boolean;
  venues: Venue[];
}

/**
 * 评级原则：
 *   - god   = CCF-A + 在子领域是头号（NeurIPS/ICML/ICLR/ACL/CVPR/TPAMI 等）
 *            ICLR 因 per-paper citation 全球最高（avg 217.74）也算 god。
 *   - top   = CCF-A 但不是子领域 #1，或 CCF-B 但社区共识公认顶（EMNLP/NAACL/ECCV 等）
 *   - mid   = CCF-B/C，正经会议但不强势
 *   - meme  = 不是同行评审 / 玩梗会议
 *
 * 数据源：CCF 2026 推荐目录 + ACL Crown 论文（arXiv 2512.04448）的引用统计。
 */
const CS_AI_PACK: VenuePack = {
  id: 'cs-ai',
  defaultEnabled: true,
  venues: [
    // ===== GOD（夯）=====
    { name: 'NeurIPS', tier: 'god' },
    { name: 'ICML', tier: 'god' },
    { name: 'ICLR', tier: 'god' },
    { name: 'ACL', tier: 'god' },
    { name: 'CVPR', tier: 'god' },
    { name: 'TPAMI', tier: 'god' },
    { name: 'IJCV', tier: 'god' },
    { name: 'JMLR', tier: 'god' },

    // ===== TOP（顶级）=====
    { name: 'AAAI', tier: 'top' },
    { name: 'IJCAI', tier: 'top' },
    { name: 'ICCV', tier: 'top' },
    { name: 'ECCV', tier: 'top' },
    { name: 'EMNLP', tier: 'top' },
    { name: 'NAACL', tier: 'top' },
    { name: 'KDD', tier: 'top' },
    { name: 'WWW', tier: 'top' },
    { name: 'SIGIR', tier: 'top' },
    { name: 'SIGGRAPH', tier: 'top' },
    { name: 'ACM MM', tier: 'top' },
    { name: 'OSDI', tier: 'top' },
    { name: 'SOSP', tier: 'top' },
    { name: 'MLSys', tier: 'top' },
    { name: 'SIGMOD', tier: 'top' },
    { name: 'VLDB', tier: 'top' },
    { name: 'TACL', tier: 'top' },

    // ===== MID（NPC）=====
    { name: 'COLING', tier: 'mid' },
    { name: 'EACL', tier: 'mid' },
    { name: 'COLT', tier: 'mid' },
    { name: 'UAI', tier: 'mid' },
    { name: 'WACV', tier: 'mid' },
    { name: 'BMVC', tier: 'mid' },
    { name: 'WSDM', tier: 'mid' },
    { name: 'CIKM', tier: 'mid' },
    { name: 'TMLR', tier: 'mid' },
    { name: 'Findings of ACL', tier: 'mid' },
    { name: 'Findings of EMNLP', tier: 'mid' },

    // ===== MEME（拉完了）=====
    { name: 'arXiv', tier: 'meme' },
    { name: 'Workshop', tier: 'meme' },
    { name: 'SIGBOVIK', tier: 'meme' },
    { name: 'OpenReview Public', tier: 'meme' },
  ],
};

/**
 * 生物 / 医学 DLC（暂时隐藏，未来发布时再加回 ALL_PACKS）
 */
const _BIO_MED_PACK: VenuePack = {
  id: 'bio-med',
  defaultEnabled: false,
  venues: [
    { name: 'Nature', tier: 'god' },
    { name: 'Science', tier: 'god' },
    { name: 'Cell', tier: 'god' },
    { name: 'NEJM', tier: 'god' },
    { name: 'Lancet', tier: 'top' },
    { name: 'Nature Methods', tier: 'top' },
    { name: 'PNAS', tier: 'top' },
  ],
};
void _BIO_MED_PACK; // 静态保留，避免 ts noUnused 报错

export const ALL_PACKS: VenuePack[] = [CS_AI_PACK];

export function getActiveVenues(enabledPackIds: string[]): Venue[] {
  const ids = new Set(enabledPackIds);
  return ALL_PACKS.filter((p) => ids.has(p.id)).flatMap((p) => p.venues);
}

export function getDefaultEnabledPackIds(): string[] {
  return ALL_PACKS.filter((p) => p.defaultEnabled).map((p) => p.id);
}
