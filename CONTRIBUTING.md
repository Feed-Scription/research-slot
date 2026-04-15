# Contributing · 贡献指南

Thanks for thinking about adding your field to Research Slot.
谢谢你愿意把自己学科加进这台装置。

Adding a new discipline takes **one file** — no TypeScript, no i18n
keys scattered across the repo. If you can fill in a JSON template,
you can ship a pack.

往里加一个新学科**只需要改一个文件**——不用碰 TypeScript、不用分散地
改 i18n。照着 JSON 模板填就行。

## 加一个学科 · Add a discipline pack

### 1. Copy the template · 复制模板

```bash
cp src/data/packs/_example.json src/data/packs/<your-field>.json
```

文件名 = 你希望的 pack slug，全小写加连字符。例：`physics.json`、
`econ.json`、`neuroscience.json`。前缀 `_` 的文件会被构建忽略，
所以模板本身不会出现在页面上。

### 2. Fill in the JSON · 填内容

```json
{
  "id": "physics",
  "defaultEnabled": false,
  "name": {
    "zh-CN": "物理 / 天体",
    "en": "Physics / Astro"
  },
  "description": {
    "zh-CN": "APS、Nature Physics、PRL 等物理与天体方向的顶刊顶会。",
    "en": "APS venues, Nature Physics, PRL and related."
  },
  "venues": [
    { "name": "Physical Review Letters", "tier": "god" },
    { "name": "Nature Physics", "tier": "god" },
    { "name": "Physical Review X", "tier": "top" },
    { "name": "arXiv.org", "tier": "meme" }
  ]
}
```

**字段说明**：

| 字段 | 含义 |
|---|---|
| `id` | 全局唯一 slug，和文件名相同 |
| `defaultEnabled` | 默认是否开启。新贡献的 pack 建议填 `false`，用户主动订阅 |
| `hidden` *(可选)* | 如果你想先把草稿留在仓库但不显示，填 `true` |
| `name.zh-CN` / `name.en` | pack 的显示名（中英必填） |
| `description.*` | 一两句话描述 |
| `venues[].name` | 期刊/会议名（保持原文，不翻译） |
| `venues[].tier` | 稀有度：`god` / `top` / `mid` / `meme`（下面解释） |

### 3. Tier 评级原则

| Tier | 视觉 | 含义 |
|---|---|---|
| `god` | 金色 · 夯 | 领域的头号 venue（影响力 / h5-index / 社区公认 #1） |
| `top` | 森林绿 · 顶级 | 主流顶会顶刊 |
| `mid` | 海军蓝 · NPC | 正经 venue 但非头部 |
| `meme` | 墨灰 · 拉完了 | 非同行评审 / 玩梗 venue（arXiv、workshop、SIGBOVIK 等） |

拿不准的时候参考 `cs-ai.json` 的分布——8 god / 17 top / 11 mid / 4 meme
是一个比较合理的骨架。

### 4. 本地预览 · Preview locally

```bash
npm install
npm run dev
```

在右侧 **订阅内容包 / Subscribed Packs** 面板里勾上你新加的 pack，
拉手柄验证 venue 会随机出现即可。

### 5. 提交 PR

```bash
git checkout -b pack/<your-field>
git add src/data/packs/<your-field>.json
git commit -m "feat(pack): add <your-field>"
git push origin pack/<your-field>
```

然后在 GitHub 开 PR。Maintainer 合并后，自动构建会把你的 pack 带上
下次发布。

## 不是加学科的贡献 · Other contributions

- **评语**：编辑 `src/i18n/locales/zh-CN.json` + `en.json` 里的
  `commentsByRating`，两个 locale 条数要一致，并同步更新
  `src/data/comments.ts` 里的 `COMMENT_COUNTS`。
- **UI / 动效**：组件在 `src/components/`，样式在 `src/index.css`
  + `tailwind.config.js`。
- **音效**：PNG/WAV/MP3 放 `public/sounds/`，在 `src/utils/sound.ts`
  里 `sfx` 对象上暴露。

Open issues and discussions welcome — especially if you think a whole
new sibling game should live under `platform.feedscription.com`.
