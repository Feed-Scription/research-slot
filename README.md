# 🕹️ Research Slot · 科研老虎机

<p align="center">
  <img src="./.github/assets/screenshot.png" alt="Research Slot Screenshot" width="720">
</p>

<p align="center">
  A peer-review lottery apparatus rendered as a 1970s academic broadside.<br>
  Pull the brass lever — three anonymous reviewers decide your paper's fate.
</p>

<p align="center">
  <a href="https://feed-scription.github.io/research-slot/" target="_blank"><strong>🎰 Try it online</strong></a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-19-61dafb?logo=react" alt="React 19">
  <img src="https://img.shields.io/badge/Vite-6-646cff?logo=vite" alt="Vite 6">
  <img src="https://img.shields.io/badge/TS-5-3178c6?logo=typescript" alt="TypeScript">
</p>

> A satire game for anyone who has ever submitted to NeurIPS, ICLR, ACL, CVPR …

---

## 🎰 How It Works

1. **Reel 1 — Venue**  
   Spins a venue from the CCF 2026 directory plus community tiers: **god / top / mid / meme**.

2. **Reels 2–4 — Reviewers**  
   Three independent reviewers roll in, each with a matched **emoji + comment + rating**.
   - ~12% of reviewers never show up (`REVIEW MISSING`).
   - Submitted scores are averaged to get a "natural" verdict.

3. **Meta-Reviewer Verdict**  
   The final decision collapses to three outcomes: **Best Paper / Accept / Reject**.  
   But watch out — the meta-reviewer has a ~12% chance to override the panel out of personal bias.

4. **★ Wish Mode**  
   Whisper a wish to the apparatus for a 95% accept rate and top-tier venues only.

---

## 🛠 Tech Stack

- **React 19** + **Vite 6** + **TypeScript**
- **Zustand** (persisted game state)
- **Framer Motion** (physics-based reel scrolling)
- **Tailwind CSS** (riso-print palette: paper / oxblood / forest / mustard / navy)
- **i18next** (zh-CN / en)
- **Web Audio API** (synthesized SFX, zero audio assets)

---

## 💻 Development

```bash
npm install
npm run dev
```

Build for production:

```bash
npm run build
```

---

## 🤝 Contributing

We welcome new venue packs and reviewer comments!

### 📦 Add a new venue pack

Edit `src/data/venues.ts`:

- Create a new `VenuePack` object (follow the `CS_AI_PACK` example).
- Add it to `ALL_PACKS`.
- Add i18n entries in `src/i18n/locales/zh-CN.json` and `en.json` under `packs.{your-id}.name` and `description`.

### 💬 Add reviewer comments

Edit `src/i18n/locales/zh-CN.json` and `en.json`:

- Find `commentsByRating`.
- Append new strings to the matching rating pool (`best`, `strong_accept`, `weak_accept`, `borderline`, `weak_reject`, `strong_reject`).

Keep both language files in sync.

---

## 📜 License

Apache 2, with apologies to Reviewer 2.
