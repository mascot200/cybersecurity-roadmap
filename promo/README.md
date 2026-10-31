# Promo kit

Images and captions for sharing the roadmap on social media.

| File | Size | Use |
|---|---|---|
| `carousel/slide-01.png` … `slide-10.png` | 1080×1350 | Instagram, TikTok photo post, Facebook album |
| `carousel/cybersecurity-roadmap-carousel.pdf` | 10 pages | LinkedIn document post |
| `post-square.png` | 1080×1080 | Single post (Instagram, Facebook) |
| `post-landscape.png` | 1200×630 | X / Twitter, Facebook link post, LinkedIn single image |
| [`CAPTIONS.md`](CAPTIONS.md) | — | Captions per platform, plus alt text for every slide |
| `build.js` | — | Regenerates every image from HTML |

To change the text or colours, edit `build.js` and run:

```bash
NODE_PATH=$(npm root -g) node promo/build.js
```

It needs Playwright with Chromium, and the Inter and JetBrains Mono fonts. The script warns if any
text runs off a slide.
