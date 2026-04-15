# Research Slot · 科研老虎机

A peer-review lottery apparatus rendered as a 1970s academic broadside.
Pull the brass lever — three anonymous reviewers decide your paper's fate.

> A satire game for anyone who has ever submitted to NeurIPS, ICLR, ACL, CVPR …

![Made with React](https://img.shields.io/badge/React-19-61dafb?logo=react)
![Vite](https://img.shields.io/badge/Vite-6-646cff?logo=vite)
![TypeScript](https://img.shields.io/badge/TS-5-3178c6?logo=typescript)

## Mechanic

- **Reel 1** rolls a venue (CCF 2026 + community-reputation tiered: god / top / mid / meme).
- **Reels 2–4** roll three independent reviewers, each with matched emoji + comment + rating.
- The meta-reviewer's verdict is the average of the submitted scores; ~12% of reviewers don't show up at all (`REVIEW MISSING`).
- ★ **Wish mode**: whisper a wish to the apparatus.

## Stack

- React 19 + Vite 6 + TypeScript
- Zustand (persisted)
- framer-motion (true scrolling reels with deceleration easing)
- Tailwind CSS (riso-print palette: paper / oxblood / forest / mustard / navy)
- i18next (zh-CN / en)
- Web Audio API (synthesized SFX, no audio assets)

## Run

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Contributing

Adding your own field takes **one JSON file** — see [`CONTRIBUTING.md`](CONTRIBUTING.md).

## License

Apache 2, with apologies to Reviewer 2.
