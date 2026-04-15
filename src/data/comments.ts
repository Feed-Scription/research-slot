/**
 * 每档评级的评语数量（必须和 locale 文件 commentsByRating 里的数组长度对齐）。
 * 评语文本完全走 i18n。
 */
export const COMMENT_COUNTS = {
  best: 13,
  strong_accept: 12,
  weak_accept: 9,
  borderline: 13,
  weak_reject: 19,
  strong_reject: 24,
} as const;
