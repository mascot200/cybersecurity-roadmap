// Flat "sticker" style carousel: bright flat fills, thick ink outlines, hard offset shadows.
// Regenerate: NODE_PATH=$(npm root -g) node promo/build.js  (needs Playwright + Chromium, Inter and JetBrains Mono fonts)
const { chromium } = require('playwright');
const path = require('path');
const OUT = path.join(__dirname, 'carousel'); // single posts go one level up
const TOTAL = 10;
const REPO = 'github.com/mascot200/cybersecurity-roadmap';
const BY = 'By Ubong Eduok';
const C = { y: '#FFD84D', w: '#FFFFFF', b: '#6CC4FF', g: '#7EE39A', p: '#FF96B9', u: '#B9A2FF', o: '#FFA64D', k: '#121212' };

const css = `
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Inter', sans-serif; color: ${C.k}; background: ${C.y}; }
  .slide { width: 1080px; height: 1350px; padding: 64px 72px 60px; display: flex; flex-direction: column; position: relative; overflow: hidden; }
  .box { background: #fff; border: 4px solid ${C.k}; border-radius: 18px; box-shadow: 7px 7px 0 ${C.k}; }
  .pill { display: inline-block; white-space: nowrap; border: 3px solid ${C.k}; border-radius: 999px; padding: 8px 22px; font-weight: 800; font-size: 24px; background: #fff; box-shadow: 4px 4px 0 ${C.k}; }
  .pill.dark { background: ${C.k}; color: #fff; }
  .top, .bottom { display: flex; justify-content: space-between; align-items: center; }
  .bottom { margin-top: auto; }
  .swipe { font-weight: 800; font-size: 26px; }
  h1 { font-family: 'Inter Display','Inter',sans-serif; font-weight: 900; font-size: 128px; line-height: .95; letter-spacing: -0.045em; }
  h2 { font-family: 'Inter Display','Inter',sans-serif; font-weight: 900; font-size: 92px; line-height: .98; letter-spacing: -0.04em; margin-top: 64px; }
  .lead { font-size: 34px; font-weight: 700; line-height: 1.3; margin-top: 40px; max-width: 860px; }
  .small { font-size: 27px; font-weight: 600; line-height: 1.4; }
  .num { display: inline-flex; width: 48px; height: 48px; border: 3px solid ${C.k}; border-radius: 50%; align-items: center; justify-content: center; font-weight: 800; font-size: 24px; }
  .tag { display: inline-flex; min-width: 76px; height: 50px; padding: 0 12px; border: 3px solid ${C.k}; border-radius: 10px; align-items: center; justify-content: center; font-weight: 800; font-size: 24px; }
  .stepno { display: inline-block; border: 4px solid ${C.k}; border-radius: 14px; padding: 0 14px; margin-right: 18px; box-shadow: 5px 5px 0 ${C.k}; }
  .rows { display: flex; flex-direction: column; gap: 32px; margin-top: 60px; }
  .row { display: flex; align-items: center; gap: 26px; padding: 30px 28px; }
  .rt { font-size: 38px; font-weight: 800; letter-spacing: -0.01em; }
  .rd { font-size: 27px; font-weight: 500; margin-top: 6px; }
  .chips { display: flex; flex-wrap: wrap; gap: 24px 20px; margin-top: 52px; }
  .chip { border: 4px solid ${C.k}; border-radius: 999px; padding: 14px 30px; font-weight: 800; font-size: 34px; box-shadow: 5px 5px 0 ${C.k}; }
  .tiles { display: flex; gap: 20px; margin-top: 56px; }
  .tile { width: 132px; height: 132px; display: flex; align-items: center; justify-content: center; font-weight: 900; font-size: 30px; letter-spacing: -0.02em; text-align: center; line-height: 1.05; }
  .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 28px; margin-top: 52px; }
  .card { padding: 32px; min-height: 250px; }
  .card .rt { margin-top: 18px; font-size: 32px; }
  .stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-top: 40px; }
  .stat { padding: 24px 24px; }
  .stat b { display: block; font-size: 52px; font-weight: 900; letter-spacing: -0.03em; }
  .stat span { font-size: 22px; font-weight: 700; }
  .burst { position: absolute; }
  .burst text { font-family: 'Inter',sans-serif; font-weight: 900; }
  pre { font-family: 'JetBrains Mono', monospace; font-size: 23px; line-height: 1.8; padding: 32px 34px; white-space: pre; background: ${C.k}; color: #fff; }
  pre .c { color: #9CA3AF; } pre .s { color: ${C.y}; } pre .n { color: ${C.g}; font-weight: 700; } pre .r { color: ${C.p}; font-weight: 700; }
`;

// Starburst sticker, rotated slightly.
function burst(x, y, size, fill, label, fs, rot = -12) {
  const n = 18, R = size / 2, r = R * 0.8, pts = [];
  for (let i = 0; i < n * 2; i++) {
    const a = (Math.PI * i) / n, rr = i % 2 ? r : R;
    pts.push(`${(R + rr * Math.cos(a)).toFixed(1)},${(R + rr * Math.sin(a)).toFixed(1)}`);
  }
  return `<svg class="burst" style="left:${x}px;top:${y}px" width="${size}" height="${size}" viewBox="-6 -6 ${size + 12} ${size + 12}">
    <polygon points="${pts.join(' ')}" fill="${fill}" stroke="${C.k}" stroke-width="5" stroke-linejoin="round"/>
    <text x="${R}" y="${R}" text-anchor="middle" dominant-baseline="central" font-size="${fs}" transform="rotate(${rot} ${R} ${R})" fill="${C.k}">${label}</text></svg>`;
}

const frame = (n, bg, body, last = false) => `<!doctype html><html><head><meta charset="utf-8"><style>${css}</style></head>
<body><div class="slide" style="background:${bg}">
  <div class="top"><span class="pill">Cybersecurity Roadmap</span><span class="pill dark">${n} / ${TOTAL}</span></div>
  ${body}
  <div class="bottom"><span class="pill dark">${BY}</span>${last ? '' : '<span class="swipe">Swipe →</span>'}</div>
</div></body></html>`;

const levelSlide = (n, bg, step, title, items, tagColors) => frame(n, bg, `
  <h2>The path<br><span class="stepno" style="background:${C.y}">${step}/3</span>${title}</h2>
  <div class="rows">${items.map(([m, t, d], i) => `
    <div class="box row"><span class="tag" style="background:${tagColors[i % tagColors.length]}">${m}</span>
      <div><div class="rt">${t}</div><div class="rd">${d}</div></div></div>`).join('')}
  </div>`);

const tiles = [['OWASP', C.p], ['API', C.b], ['Docker', C.g], ['AWS', C.o], ['K8s', C.u], ['IaC', C.y]];

const slides = [
  frame(1, C.y, `
    ${burst(770, 990, 220, C.p, 'FREE', 50)}
    <h1 style="margin-top:120px;font-size:136px">Cybersecurity<br>Roadmap</h1>
    <div style="margin-top:44px"><span class="box" style="display:inline-block;padding:18px 34px;font-size:56px;font-weight:900;letter-spacing:-0.03em;transform:rotate(-2deg)">Developer → Security</span></div>
    <p class="lead">A free, hands-on, 12-month path from backend developer to application &amp; cloud security.</p>
    <div class="tiles">${tiles.map(([t, c]) => `<div class="box tile" style="background:${c};font-size:${t.length > 4 ? 26 : 32}px">${t}</div>`).join('')}</div>`),

  frame(2, C.w, `
    <h2>Don't just<br>find bugs.</h2>
    <p class="lead" style="margin-top:36px">Learn to build and run systems that are:</p>
    <div class="chips">
      <span class="chip" style="background:${C.p}">Secure by default</span>
      <span class="chip" style="background:${C.b}">Tested</span>
      <span class="chip" style="background:${C.g}">Least-privilege</span>
      <span class="chip" style="background:${C.o}">Monitored</span>
      <span class="chip" style="background:${C.u}">Automatically checked</span>
      <span class="chip" style="background:${C.y}">Recoverable</span>
      <span class="chip" style="background:${C.g}">Audit-ready</span>
    </div>
    <p class="small" style="margin-top:56px;max-width:860px">That's what an application &amp; cloud security engineer does. This roadmap trains exactly that.</p>`),

  frame(3, C.b, `
    <h2>Every week<br>comes with:</h2>
    <div class="grid">
      <div class="box card"><span class="num" style="background:${C.y}">1</span><div class="rt">A real-world scenario</div><div class="rd">Where it goes wrong in practice</div></div>
      <div class="box card"><span class="num" style="background:${C.g}">2</span><div class="rt">Diagrams</div><div class="rd">The mechanism, drawn</div></div>
      <div class="box card"><span class="num" style="background:${C.p}">3</span><div class="rt">A tested lab</div><div class="rd">Fix it, then prove the fix</div></div>
      <div class="box card"><span class="num" style="background:${C.o}">4</span><div class="rt">A drill</div><div class="rd">With answers, to check yourself</div></div>
    </div>
    <div class="stats">
      <div class="box stat"><b>3</b><span>Levels</span></div>
      <div class="box stat"><b>12</b><span>Months</span></div>
      <div class="box stat"><b>20+</b><span>Labs</span></div>
      <div class="box stat"><b>60+</b><span>Drills</span></div>
    </div>
    <p class="small" style="margin-top:26px">Plus a project at the end of every month.</p>`),

  levelSlide(4, C.g, 1, 'How it breaks', [
    ['M1', 'Security foundations', 'Linux, networking, TLS, threat modeling'],
    ['M2', 'Web app security', 'OWASP Top 10, SQLi, XSS, CSRF, sessions'],
    ['M3', 'API security', 'Tenant isolation, JWT & OAuth, rate limits'],
    ['M4', 'Advanced web', 'SSRF, file uploads, race conditions'],
  ], [C.y, C.p, C.b, C.u]),
  levelSlide(5, C.p, 2, 'Prevent it', [
    ['M5', 'Secure development', 'Code review, SAST, SCA, CI security gates'],
    ['M6', 'Containers & hosts', 'Non-root Docker, image scanning, SBOMs'],
    ['M7', 'Cloud foundations', 'AWS IAM, VPC, KMS encryption, CloudTrail'],
    ['M8', 'Infrastructure as code', 'Terraform, OIDC, secrets, state'],
  ], [C.y, C.g, C.b, C.u]),
  levelSlide(6, C.u, 3, 'Detect & ship', [
    ['M9', 'Advanced cloud', 'Attack paths, posture audits, Kubernetes'],
    ['M10', 'Detection & response', 'Logging, detection rules, incident response'],
    ['M11', 'Security assessment', 'Test plans, findings, CVSS, retesting'],
    ['M12', 'Capstone', 'One system, every control, evidence for each'],
  ], [C.y, C.g, C.p, C.o]),

  frame(7, C.o, `
    <h2>8 portfolio pieces.<br>1 growing system.</h2>
    <svg width="936" height="480" viewBox="0 0 936 480" style="margin-top:40px;overflow:visible">
      ${[C.y, C.g, C.b, C.p, C.u, C.y, C.g, C.p].map((c, i) => {
        const w = 100, gap = 16, x = i * (w + gap) + 4, h = 70 + i * 52, y = 472 - h;
        return `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${c}" stroke="${C.k}" stroke-width="5"/>
          <text x="${x + w / 2}" y="${y + 50}" text-anchor="middle" font-family="Inter" font-weight="900" font-size="40">${i + 1}</text>`;
      }).join('')}
      <line x1="${7 * 116 + 54}" y1="${472 - 434}" x2="${7 * 116 + 54}" y2="-40" stroke="${C.k}" stroke-width="5"/>
      <polygon points="${7 * 116 + 54},-40 ${7 * 116 + 100},-22 ${7 * 116 + 54},-4" fill="#FF5A5A" stroke="${C.k}" stroke-width="5" stroke-linejoin="round"/>
    </svg>
    <div class="box" style="margin-top:36px;padding:22px 26px;display:grid;grid-template-columns:1fr 1fr;gap:14px 24px">
      ${['Linux hardening', 'API security lab', 'Secure API template', 'Hardened containers', 'Secure IaC pipeline', 'Monitoring & IR', 'Full assessment', 'Capstone platform']
        .map((t, i) => `<div style="display:flex;align-items:center;gap:14px;font-size:26px;font-weight:700"><span class="tag" style="min-width:42px;height:38px;font-size:20px;background:${[C.y, C.g, C.b, C.p, C.u, C.y, C.g, C.p][i]}">${i + 1}</span>${t}</div>`).join('')}
    </div>`),

  frame(8, C.w, `
    <h2>How long<br>does it take?</h2>
    <div class="grid">
      <div class="box card" style="background:${C.y}"><div style="font-size:64px;font-weight:900;letter-spacing:-0.03em">12 months</div><div class="rd" style="font-size:26px;font-weight:600">at 8–12 hours a week</div></div>
      <div class="box card" style="background:${C.g}"><div style="font-size:64px;font-weight:900;letter-spacing:-0.03em">Your pace</div><div class="rd" style="font-size:26px;font-weight:600">move on when you can show the skill</div></div>
    </div>
    <p class="small" style="margin-top:52px;font-weight:800">Each level ends with a checkpoint:</p>
    <div class="rows" style="margin-top:28px;gap:28px">
      ${[['L1', 'After Month 4', C.g], ['L2', 'After Month 8', C.p], ['L3', 'After Month 12', C.u]].map(([l, t, c]) => `
      <div class="box row" style="padding:18px 24px"><span class="tag" style="background:${c}">${l}</span><div class="rt" style="font-size:30px">${t}</div>
        <div style="margin-left:auto;font-size:24px;font-weight:700">≥ 80% + a practical task</div></div>`).join('')}
    </div>`),

  frame(9, C.b, `
    <h2>A fix isn't done<br>until a test<br>proves it.</h2>
    <div class="box" style="margin-top:48px;overflow:hidden;padding:0">
<pre><span class="c">// Month 3 lab · who can see invoice #N?</span>
[<span class="s">'alice (Acme admin)'</span>, <span class="s">'get'</span>,    <span class="n">2</span>, <span class="n">200</span>],
[<span class="s">'alice (Acme admin)'</span>, <span class="s">'get'</span>,    <span class="n">3</span>, <span class="r">404</span>], <span class="c">// other tenant</span>
[<span class="s">'bob (Acme member)'</span>,  <span class="s">'get'</span>,    <span class="n">1</span>, <span class="r">404</span>], <span class="c">// colleague's</span>
[<span class="s">'bob (Acme member)'</span>,  <span class="s">'delete'</span>, <span class="n">2</span>, <span class="r">403</span>], <span class="c">// admin-only</span>
[<span class="s">'anonymous'</span>,          <span class="s">'get'</span>,    <span class="n">1</span>, <span class="r">401</span>],</pre></div>
    <p class="small" style="margin-top:40px">19 cases like these run against a real PostgreSQL database, on every push.</p>
    <div class="chips" style="margin-top:44px">
      <span class="chip" style="background:${C.g};font-size:28px">200 allowed</span>
      <span class="chip" style="background:${C.p};font-size:28px">404 not yours</span>
      <span class="chip" style="background:${C.o};font-size:28px">403 not allowed</span>
      <span class="chip" style="background:${C.y};font-size:28px">401 sign in</span>
    </div>`),

  frame(10, C.y, `
    ${burst(790, 170, 200, C.g, 'OPEN', 42, 12)}
    <h1 style="margin-top:230px;font-size:124px">Start today.<br>It's free.</h1>
    <div class="box" style="margin-top:80px;padding:26px 30px;background:${C.k};color:#fff">
      <div style="font-size:22px;font-weight:700;color:${C.y}">Get the roadmap</div>
      <div style="font-family:'JetBrains Mono',monospace;font-size:31px;font-weight:700;margin-top:8px;white-space:nowrap">${REPO}</div>
    </div>
    <div style="display:flex;gap:20px;margin-top:44px">
      <span class="chip" style="background:#fff;font-size:30px">Star it</span>
      <span class="chip" style="background:${C.p};font-size:30px">Fork it</span>
      <span class="chip" style="background:${C.g};font-size:30px">Start Month 1</span>
    </div>
    <p class="small" style="margin-top:64px;max-width:880px;font-size:30px">3 levels. 12 months. 20+ labs. From your first Linux permission to a full cloud security capstone.</p>`, true),
];

// Single images in the same style.
const single = (w, h, square) => `<!doctype html><html><head><meta charset="utf-8"><style>${css}
  .s { width:${w}px; height:${h}px; padding:${square ? '72px' : '56px 64px'}; position:relative; overflow:hidden; background:${C.y}; display:flex; flex-direction:column; }
</style></head><body><div class="s">
  ${square ? burst(700, 180, 240, C.p, 'FREE', 54) : burst(930, 330, 210, C.p, 'FREE', 48)}
  <h1 style="font-size:${square ? 124 : 84}px">${square ? 'Cybersecurity<br>Roadmap' : 'Cybersecurity Roadmap'}</h1>
  <div style="margin-top:${square ? 40 : 30}px"><span class="box" style="display:inline-block;padding:${square ? '16px 30px' : '12px 28px'};font-size:${square ? 54 : 46}px;font-weight:900;letter-spacing:-0.03em;transform:rotate(-2deg)">Developer → Security</span></div>
  <p class="lead" style="font-size:${square ? 34 : 28}px;margin-top:${square ? 36 : 26}px;max-width:${square ? 900 : 800}px">A free, hands-on path from backend developer to application &amp; cloud security.</p>
  <div class="tiles" style="margin-top:${square ? 44 : 26}px;gap:16px">${tiles.map(([t, c]) => `<div class="box tile" style="background:${c};width:${square ? 128 : 96}px;height:${square ? 128 : 96}px;font-size:${(t.length > 4 ? 24 : 30) * (square ? 1 : .8)}px">${t}</div>`).join('')}</div>
  <div style="display:flex;gap:22px;align-items:center;margin-top:auto">
    <span class="pill dark" style="font-size:${square ? 24 : 22}px;padding:12px 24px">${BY}</span>
    <span class="pill" style="font-size:${square ? 24 : 22}px;padding:12px 24px">${REPO}</span>
  </div>
</div></body></html>`;

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1080, height: 1350 } });
  const check = () => page.evaluate(() => {
    const s = document.querySelector('.slide, .s');
    const r = s.getBoundingClientRect();
    const bad = [...s.querySelectorAll('*')].filter(e => {
      const b = e.getBoundingClientRect();
      return b.width && (b.right > r.right - 20 || b.bottom > r.bottom - 10) && !e.closest('svg.burst');
    }).map(e => e.className || e.tagName);
    return bad.length ? 'OVERFLOW ' + [...new Set(bad)].slice(0, 4).join(',') : 'ok';
  });
  for (let i = 0; i < slides.length; i++) {
    await page.setContent(slides[i]); await page.evaluate(() => document.fonts.ready);
    const f = `slide-${String(i + 1).padStart(2, '0')}.png`;
    await page.screenshot({ path: path.join(OUT, f), clip: { x: 0, y: 0, width: 1080, height: 1350 } });
    console.log(f, await check());
  }
  for (const [w, h, sq, f] of [[1080, 1080, true, 'post-square.png'], [1200, 630, false, 'post-landscape.png']]) {
    await page.setViewportSize({ width: w, height: h });
    await page.setContent(single(w, h, sq)); await page.evaluate(() => document.fonts.ready);
    await page.screenshot({ path: path.join(__dirname, f), clip: { x: 0, y: 0, width: w, height: h } });
    console.log(f, await check());
  }
  await page.setViewportSize({ width: 1080, height: 1350 });
  const all = slides.map(s => s.match(/<div class="slide"[\s\S]*<\/div><\/body>/)[0].replace('</body>', '')).join('');
  await page.setContent(`<!doctype html><html><head><meta charset="utf-8"><style>${css} .slide{page-break-after:always}</style></head><body>${all}</body></html>`);
  await page.evaluate(() => document.fonts.ready);
  await page.pdf({ path: path.join(OUT, 'cybersecurity-roadmap-carousel.pdf'), width: '1080px', height: '1350px', printBackground: true, margin: { top: 0, right: 0, bottom: 0, left: 0 } });
  console.log('pdf ok');
  await browser.close();
})();
