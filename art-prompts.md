# 科研老虎机 美术资产规格 (v1)

> **美术风格**：Chibi 3D 卡通（Pixar / Fortnite-Lite 质感，圆润、光泽塑料感、柔和 rim light）
> **共同 DNA（所有资产共享这段）**：
>
> ```
> chibi 3D cartoon style, glossy plastic material with soft highlights,
> rounded chubby shapes, soft rim light, studio three-point lighting,
> pastel purple + magenta + gold palette, Pixar / Fortnite-Lite aesthetic,
> game asset, crisp edges, high detail, 4k --ar 1:1 --style raw --v 7
> ```
>
> **负面词**（每个 Prompt 都挂）：
> `realistic photo, gritty, horror, text, watermark, logo, blurry, low quality, dark background, stock photo`

---

## 一、工具分工建议

| 资产类型 | 首选工具 | 备选 | 原因 |
|---|---|---|---|
| 机柜主体 / 拉杆 / 机身 | **Midjourney v7** | Flux + LoRA | 造型和材质感最强 |
| UI 图标 / 按钮 / 指示灯 | **Recraft V3** | Ideogram | 可直接出 SVG，一致性好 |
| 稀有度光效粒子贴图 | **Flux + LoRA** | MJ | 透明底粒子批量变体 |
| 角色吉祥物（审稿人小人 / 导师小人 若要加） | **Nano Banana (Gemini)** | Flux + LoRA | 同角色多表情一致性最强 |
| 中奖艺术字（"BEST PAPER!" "REJECT!"） | **Ideogram 3.0** | - | 带文字图标无对手 |

**一致性锚点（sref）**：先用 MJ 跑 20 张定调图，挑 2 张清晰、代表性的，之后所有资产都挂 `--sref <url1> <url2>` 保视觉 DNA。

---

## 二、必做资产（MVP 10 件）

### 1. 机柜正面主视觉 `cabinet-front.png`
- 用途：目前 CSS 已实现渐变+描边作占位。有了这张图可替代卡通背景。
- 尺寸：1536 × 1536 透明底 PNG
- Prompt:
  ```
  chibi 3D slot machine cabinet, front view, symmetric composition,
  deep purple + magenta body with gold trim, rounded chunky shape,
  three big square reel windows on the front, a big red ball lever on the right,
  marquee sign on top glowing hot pink, bulb lights around the frame,
  isolated on transparent background, game UI asset,
  {{共同 DNA}} --ar 1:1
  ```

### 2. 顶部灯带 Marquee `marquee.png`
- 用途：替换头部渐变条
- 尺寸：1920 × 480 透明底 PNG
- Prompt:
  ```
  long horizontal slot machine marquee sign, hot pink neon,
  rounded rectangle shape, golden trim, a row of glowing yellow bulbs
  along top and bottom edges, no text inside,
  isolated on transparent background,
  {{共同 DNA}} --ar 4:1
  ```

### 3. 滚轮窗口外框 `reel-frame.png`
- 用途：九宫格缩放的窗口装饰
- 尺寸：512 × 640 PNG，标注九宫格 slice 区域（中间 40% × 40% 为可拉伸区）
- Prompt:
  ```
  ornate slot machine reel window frame, deep purple plastic body,
  thick gold border, small golden rivets at corners, empty black interior,
  rounded rectangle, shiny plastic highlight, isolated,
  {{共同 DNA}} --ar 4:5
  ```

### 4. 拉杆 `lever.png`
- 用途：替换当前 CSS 的球头拉杆（可替换成带底座的整条拉杆）
- 尺寸：512 × 1280 透明底 PNG（纵向）
- 生产 2 帧：`lever-up.png` / `lever-down.png`，用 Nano Banana 从 up 编辑到 down 保持一致
- Prompt (up 状态):
  ```
  chibi 3D slot machine lever in upright position, glossy red sphere
  handle on top, chrome metallic shaft, rounded black metal base,
  rim light, isolated on transparent background, side view,
  {{共同 DNA}} --ar 2:5
  ```

### 5. SPIN 按钮 `btn-spin.png`
- 尺寸：512 × 512 PNG
- Prompt:
  ```
  big round golden casino button, skeuomorphic chibi 3D style,
  "SPIN" indentation (or leave blank, text added in code),
  glossy yellow-to-orange gradient, thick dark brown border,
  subtle inner shadow, isolated on transparent background,
  top-down view,
  {{共同 DNA}} --ar 1:1
  ```

### 6-8. 稀有度光效（3 套）`burst-{legendary,epic,rare}.png`
- 用途：中奖动画底图（overlay + multiply/screen 混合）
- 尺寸：1536 × 1536 透明底 PNG
- 共同结构：从中心向外辐射光线 + 粒子爆炸
- Legendary Prompt:
  ```
  explosive golden light burst from center, radiating rays,
  falling gold coins and stars particles, warm yellow-gold tones,
  chibi 3D render, transparent background, VFX game asset,
  {{共同 DNA}} --ar 1:1
  ```
- Epic Prompt:
  ```
  purple magic burst from center, floating magical sparkles and runes,
  deep violet to lilac gradient, chibi 3D render, transparent background,
  VFX game asset, {{共同 DNA}} --ar 1:1
  ```
- Rare Prompt:
  ```
  cyan crystal shard burst from center, icy blue sparkles,
  clean elegant glow, chibi 3D render, transparent background,
  VFX game asset, {{共同 DNA}} --ar 1:1
  ```

### 9. "诅咒"负面光效 `burst-cursed.png`
- Prompt:
  ```
  dark red toxic smoke cloud with skull particles and dripping green slime,
  chibi 3D render, stylized not horror, slightly humorous,
  transparent background, VFX game asset,
  {{共同 DNA}} --ar 1:1
  ```

### 10. Favicon / Logo `icon.png`
- 尺寸：1024 × 1024
- Prompt:
  ```
  tiny chibi 3D slot machine icon, deep purple and gold,
  centered composition, chunky rounded silhouette,
  isolated on transparent background, app icon style,
  {{共同 DNA}} --ar 1:1
  ```

---

## 三、可选扩展（Nice-to-have）

| 资产 | 说明 | 工具 |
|---|---|---|
| 币粒 `coin.png` | 拉杆成功后掉落的金币 | MJ |
| 背景幕布 `bg-curtain.jpg` | 替换当前径向渐变 | MJ（--ar 16:9） |
| 6 种 Rating 印章 `stamp-*.png` | "Best Paper" / "Reject" 橡皮章风格 | **Ideogram**（带文字） |
| Emoji 替换版大贴纸 `emoji-*.png` | 给 VIBE 滚轮做专属表情，取代系统 Emoji | Nano Banana |
| 审稿人角色 `reviewer-{neutral,angry,happy}.png` | 未来加"审稿人登场"剧情用 | Nano Banana |

---

## 四、生产流程（建议）

1. **Day 0.5**：用 MJ 生 20 张机柜/机身/拉杆定调图 → 挑 2 张做 sref URL（上传到 imgur 或 Discord）
2. **Day 1**：按 MVP 清单 1–10 批量出图，每个资产跑 8-16 张变体，人工挑 1 张
3. **Day 1.5**：`rembg` 抠透明底 → `Real-ESRGAN` 4x → Photopea 修残边
4. **Day 2**：塞进 `src/assets/images/`，在组件里替换 CSS 占位

---

## 五、命名规范

```
src/assets/images/
├── cabinet-front.png
├── marquee.png
├── reel-frame.png           # 九宫格可拉伸
├── lever-up.png
├── lever-down.png
├── btn-spin.png
├── burst-legendary.png
├── burst-epic.png
├── burst-rare.png
├── burst-cursed.png
└── icon.png
```

所有透明底 PNG，命名全小写 + 中划线，尺寸为 2 的幂或双数。

---

## 六、落地清单（给生成/采购同学）

- [ ] 先跑 20 张定调图，Discord/Slack 发出来挑 2 张做 sref
- [ ] 按清单 1–10 出图，提交到 `art-candidates/` 子目录
- [ ] 抠透明底、放大、修残边
- [ ] 重命名按规范，放进 `src/assets/images/`
- [ ] 在代码里替换占位（我在组件里用 CSS 渐变/Tailwind 做的占位，有图后直接 `<img>` 替换即可）
