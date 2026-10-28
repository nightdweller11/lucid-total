export const CSS = String.raw`
/* Lucid Total mocks v0.1 (2026-10-28). Lucid Glass tokens from Lucid Chat docs/10 §3 (final values after the contrast
   pass: dark-theme glass = tint flattened over the ground's own scrim) and docs/03-mocks (high contrast, --p-l3fb,
   --p-edge, --k-*, --mk-*). Every frame is a .pt scope; the lab bar sets data-pt / data-hc / data-dir / data-dev on
   #gallery, a frame with its own data-pt keeps it. */
:root{--display:"Sora",ui-sans-serif,system-ui,sans-serif;--ui:"Figtree",ui-sans-serif,system-ui,-apple-system,"Segoe UI",sans-serif;--he:"Heebo","Figtree",ui-sans-serif,system-ui,sans-serif}
/* ---- themes ---- */
[data-pt="deep"]{
  --ground:radial-gradient(60% 45% at 18% 8%,rgba(99,160,255,.46),transparent 60%),radial-gradient(50% 40% at 88% 28%,rgba(140,120,255,.45),transparent 60%),radial-gradient(70% 50% at 50% 100%,rgba(40,200,255,.17),transparent 60%),linear-gradient(160deg,#0a1636 0%,#102b6b 45%,#1a46a8 100%);
  --ground-base:#102b6b;--fg:#f2f6ff;--muted:rgba(226,235,255,.86);--line:rgba(255,255,255,.10);--line2:rgba(255,255,255,.16);
  --g1:rgba(60,78,122,.454);--g2:rgba(80,96,136,.533);--g3:rgba(81,96,136,.602);--l3fb:#374b7c;--edge:#9eaccb;
  --gl:rgba(255,255,255,.26);--gh:rgba(255,255,255,.38);
  --acc:#3d8bff;--acc-fill:#3375d6;--acc-ink:#dbe9ff;--on-acc:#fff;--seen:#7bb0ff;
  --ai:#5fe3cf;--ai-soft:rgba(95,227,207,.16);--ai-ink:#9af5e6;--on-ai:#04312a;
  --hold:#ffd88a;--hold-h:#ffc96b;--block:#ffcdd0;--block-h:#ff7d85;--good:#47d16c;--good-ink:#9be8b0;
  --f-sky:#4fc3ff;--f-heat:#ff8a3d;--f-warm:#ff6fae;--f-lime:#a3e635;--f-rules:#7a8cff;--f-gold:#ffd23f;--f-sharp:#ff5c7a;--f-violet:#c56cff;--f-drift:#b39dff;--f-slate:#a3b4cc;
  --k-on:#7fb2ff;--k-on-ink:#0b1a3a;--k-off:#e2ebff;--k-track:rgba(60,78,122,.454);
  --mk-a:#8dbaff;--mk-b:#aef8eb;--ink-dark:#0b1a3a;--shadow:rgba(2,8,30,.38);--page:#08122c;--page2:#0e1c40;color-scheme:dark}
[data-pt="aqua"]{
  --ground:radial-gradient(55% 40% at 15% 10%,rgba(34,211,238,.34),transparent 60%),radial-gradient(45% 35% at 90% 20%,rgba(236,72,153,.28),transparent 60%),radial-gradient(70% 50% at 50% 100%,rgba(99,102,241,.28),transparent 60%),linear-gradient(165deg,#07212b 0%,#0b4a5c 50%,#0b6577 100%);
  --ground-base:#0b4a5c;--fg:#eefcff;--muted:rgba(214,243,250,.86);--line:rgba(255,255,255,.10);--line2:rgba(255,255,255,.16);
  --g1:rgba(58,91,102,.445);--g2:rgba(70,101,111,.60);--g3:rgba(69,100,110,.693);--l3fb:#335c68;--edge:#95b7c0;
  --gl:rgba(255,255,255,.26);--gh:rgba(255,255,255,.38);
  --acc:#22b8f0;--acc-fill:#22b8f0;--acc-ink:#d9f5ff;--on-acc:#06202b;--seen:#22b8f0;
  --ai:#b58cff;--ai-soft:rgba(181,140,255,.18);--ai-ink:#e6d8ff;--on-ai:#1d0b3f;
  --hold:#ffd88a;--hold-h:#ffc96b;--block:#ffcdd0;--block-h:#ff7d85;--good:#47d16c;--good-ink:#9be8b0;
  --f-sky:#4fc3ff;--f-heat:#ff8a3d;--f-warm:#ff6fae;--f-lime:#a3e635;--f-rules:#7a8cff;--f-gold:#ffd23f;--f-sharp:#ff5c7a;--f-violet:#c56cff;--f-drift:#b39dff;--f-slate:#a3b4cc;
  --k-on:#3dc1f2;--k-on-ink:#0b1a3a;--k-off:#d6f3fa;--k-track:rgba(58,91,102,.445);
  --mk-a:#5cc4f5;--mk-b:#c0b1f6;--ink-dark:#0b1a3a;--shadow:rgba(0,12,18,.40);--page:#061a22;--page2:#0a2b36;color-scheme:dark}
[data-pt="sky"]{
  --ground:radial-gradient(55% 40% at 15% 8%,rgba(120,170,255,.32),transparent 60%),radial-gradient(45% 35% at 90% 25%,rgba(180,160,255,.30),transparent 60%),radial-gradient(70% 50% at 50% 100%,rgba(120,220,255,.32),transparent 60%),linear-gradient(160deg,#eaf2ff 0%,#f6f9ff 50%,#e6eefc 100%);
  --ground-base:#eef4ff;--fg:#0f1f3a;--muted:#435069;--line:rgba(20,50,100,.10);--line2:rgba(20,50,100,.16);
  --g1:rgba(255,255,255,.58);--g2:rgba(255,255,255,.80);--g3:rgba(255,255,255,.88);--l3fb:#fefeff;--edge:#7b8496;
  --gl:rgba(255,255,255,.95);--gh:#ffffff;
  --acc:#2f7cf6;--acc-fill:#2b72e2;--acc-ink:#0b3f9a;--on-acc:#fff;--seen:#2f7cf6;
  --ai:#0f9d8a;--ai-soft:rgba(15,157,138,.12);--ai-ink:#075a4f;--on-ai:#fff;
  --hold:#7d4a00;--hold-h:#c77f0a;--block:#ad2a31;--block-h:#d43c43;--good:#22a84a;--good-ink:#13692e;
  --f-sky:#1aa3e8;--f-heat:#f0722a;--f-warm:#e5528f;--f-lime:#7cb518;--f-rules:#5d6fe8;--f-gold:#e6b800;--f-sharp:#ea4c6c;--f-violet:#a94ae6;--f-drift:#8f7ae6;--f-slate:#6b7c93;
  --k-on:#2b72e3;--k-on-ink:#fff;--k-off:#435069;--k-track:rgba(255,255,255,.58);
  --mk-a:#005878;--mk-b:#584885;--ink-dark:#0b1a3a;--shadow:rgba(40,70,130,.18);--page:#e9f0fb;--page2:#f6f9ff;color-scheme:light}
/* high contrast: a variant of each theme (docs/10 §9): solid surfaces, flat two-stop ground, visible edges, 7:1 text */
[data-hc="high"][data-pt="deep"],[data-hc="high"] [data-pt="deep"]{--ground:linear-gradient(160deg,#050d24 0%,#0a1b45 100%);--ground-base:#0a1b45;--g1:#13234d;--g2:#1b2f63;--g3:#1b2f63;--gl:rgba(255,255,255,.62);--gh:rgba(255,255,255,.62);--fg:#fff;--muted:#fff;--line:rgba(255,255,255,.45);--line2:rgba(255,255,255,.62);--edge:#bfc6d6;--k-on:#96c0ff;--k-off:#fcfdff;--k-track:#32477a;--acc-fill:#1f5fc4;--ai-ink:#c2fff4;--hold:#ffe2a8;--block:#ffdfe1}
[data-hc="high"][data-pt="aqua"],[data-hc="high"] [data-pt="aqua"]{--ground:linear-gradient(165deg,#03151b 0%,#062e39 100%);--ground-base:#062e39;--g1:#0b2c36;--g2:#103a47;--g3:#103a47;--gl:rgba(255,255,255,.62);--gh:rgba(255,255,255,.62);--fg:#fff;--muted:#fff;--line:rgba(255,255,255,.45);--line2:rgba(255,255,255,.62);--edge:#c6d1d5;--k-on:#8cdaf7;--k-off:#fff;--k-track:#2e5a67;--ai-ink:#f0e8ff;--hold:#ffe2a8;--block:#ffdfe1}
[data-hc="high"][data-pt="sky"],[data-hc="high"] [data-pt="sky"]{--ground:linear-gradient(160deg,#f4f8ff 0%,#ffffff 100%);--ground-base:#fff;--g1:#fff;--g2:#fff;--g3:#fff;--gl:rgba(15,31,58,.6);--gh:rgba(15,31,58,.6);--fg:#0a1730;--muted:#24365a;--line:rgba(15,31,58,.45);--line2:rgba(15,31,58,.6);--edge:#5a6376;--k-on:#2055aa;--k-off:#3b465c;--k-track:#fdfeff;--acc-fill:#1f5fc4;--ai-ink:#04463d;--hold:#5c3600;--block:#8a1d23}

/* ---- page chrome ---- */
*{box-sizing:border-box}
html,body{margin:0}
body{font-family:var(--ui);background:var(--page);color:var(--fg);line-height:1.45;padding:0 16px 64px;-webkit-font-smoothing:antialiased}
body::before{content:"";position:fixed;inset:0;z-index:-1;background:linear-gradient(180deg,var(--page2),var(--page))}
a{color:var(--acc-ink)}
.wrap{max-width:1320px;margin:0 auto}
header.page{display:flex;flex-wrap:wrap;gap:16px 32px;align-items:flex-end;justify-content:space-between;padding:32px 0 10px}
header.page h1{font-family:var(--display);font-weight:600;font-size:clamp(26px,4vw,38px);margin:0;letter-spacing:-.02em;display:flex;align-items:center;gap:12px}
header.page p{margin:6px 0 0;color:var(--muted);max-width:70ch;font-size:14px}
nav.toc{display:flex;flex-wrap:wrap;gap:6px;padding:6px 0 14px}
nav.toc a{text-decoration:none;font-size:12.5px;padding:5px 11px;border-radius:999px;color:var(--fg);background:var(--g1);box-shadow:inset 0 1px 0 var(--gh)}
nav.toc a:hover,nav.toc a:focus-visible{background:var(--g2)}
.lab{position:sticky;top:0;z-index:50;display:flex;flex-wrap:wrap;gap:8px 18px;padding:10px 14px;margin:0 0 12px;border-radius:20px;background:var(--g3);backdrop-filter:blur(22px) saturate(160%);-webkit-backdrop-filter:blur(22px) saturate(160%);box-shadow:0 10px 30px var(--shadow),inset 0 1px 0 var(--gh);font-size:12.5px}
.lab .grp{display:flex;align-items:center;gap:4px;flex-wrap:wrap}
.lab .grp>span{color:var(--muted);font-weight:700;margin-inline-end:4px;text-transform:uppercase;letter-spacing:.06em;font-size:10.5px}
.lab button{font:inherit;font-size:12.5px;padding:5px 11px;border-radius:999px;border:0;background:transparent;color:var(--fg);cursor:pointer;display:inline-flex;align-items:center;gap:6px}
.lab button .ic{width:14px;height:14px}
.lab button.on{background:var(--acc-fill);color:var(--on-acc)}
.lab button:focus-visible{outline:2px solid var(--acc);outline-offset:2px}
section.flow{padding:26px 0 6px}
section.flow>h2{font-family:var(--display);font-weight:600;font-size:22px;margin:0 0 4px;letter-spacing:-.01em}
section.flow>p{margin:0 0 18px;color:var(--muted);max-width:80ch;font-size:14px}
figure.fr{margin:0 0 34px;min-width:0}
figure.fr .scroller{overflow-x:auto;padding:4px 2px 10px;border-radius:26px}
figure.fr figcaption{font-size:13px;color:var(--muted);margin-top:6px;line-height:1.5;max-width:110ch}
figure.fr figcaption b{color:var(--fg);font-weight:600}
figure.fr figcaption .uc{display:inline-block;font-size:11.5px;padding:1px 8px;border-radius:999px;background:var(--g1);color:var(--fg);margin-inline-start:4px}
.row2{display:flex;flex-wrap:wrap;gap:28px;align-items:flex-start}
.row2>figure.fr{flex:0 1 auto}

/* ---- icons ---- */
.ic{width:16px;height:16px;flex:none;stroke-width:1.9;vertical-align:middle}
i.ic{display:inline-block}
svg.mk{fill:none;stroke:none}
svg.mk path:not(.ring){stroke:none}
svg.mk.mono path,[data-hc="high"] svg.mk path{fill:currentColor}
[data-hc="high"] svg.mk rect.fillr{fill:currentColor}
[dir="rtl"] :is(.lucide-arrow-left,.lucide-arrow-right,.lucide-chevron-right,.lucide-chevron-left,.lucide-undo-2,.lucide-redo-2,.lucide-send,.lucide-send-horizontal,.lucide-reply,.lucide-forward,.lucide-log-in,.lucide-log-out,.lucide-panel-left-close,.lucide-panel-left-open,.lucide-move-right,.lucide-arrow-up-right,.lucide-corner-down-right,.lucide-list-collapse){transform:scaleX(-1)}

/* ---- the app frame (desktop 1280) ---- */
.app{--rail:220px;position:relative;width:1280px;height:800px;flex:none;border-radius:26px;overflow:hidden;background:var(--ground);background-color:var(--ground-base);color:var(--fg);font-size:13px;display:grid;grid-template-columns:var(--rail) minmax(0,1fr);box-shadow:0 24px 60px var(--shadow);isolation:isolate}
.app.tall{height:880px}.app.short{height:620px}.app.xs{height:520px}
.app.rc{--rail:64px}
.app *{min-width:0}
.app :focus-visible{outline:2px solid var(--acc);outline-offset:2px;border-radius:inherit}
.app .focus{outline:2px solid var(--acc);outline-offset:2px}
[data-hc="high"] .app .focus,[data-hc="high"] .app :focus-visible{outline:3px solid var(--fg)}
.rail{display:flex;flex-direction:column;gap:2px;padding:14px 10px 12px;background:color-mix(in srgb,var(--g1) 70%,transparent);box-shadow:inset -1px 0 0 var(--line)}
[dir="rtl"] .rail{box-shadow:inset 1px 0 0 var(--line)}
.rail .brand{display:flex;align-items:center;gap:10px;padding:2px 6px 14px}
.rail .brand .tile{width:36px;height:36px;border-radius:11px;display:grid;place-items:center;background:var(--g2);box-shadow:inset 0 1px 0 var(--gh),0 4px 14px var(--shadow);flex:none}
.rail .brand .tile svg{width:26px;height:26px}
.rail .brand b{font-family:var(--display);font-weight:600;font-size:15px;letter-spacing:-.01em;display:block;line-height:1.1;white-space:nowrap}
.rail .brand small{display:block;color:var(--muted);font-size:11px}
.ri{display:flex;align-items:center;gap:10px;padding:8px 10px;border-radius:999px;color:var(--fg);font-size:13px;font-weight:500;white-space:nowrap;text-decoration:none}
.ri .ic{width:18px;height:18px}
.ri .n{margin-inline-start:auto;font-size:11px;font-variant-numeric:tabular-nums;color:var(--muted)}
.ri .n.b{background:var(--acc-fill);color:var(--on-acc);border-radius:999px;padding:0 7px;line-height:18px;font-weight:600}
.ri.on{background:var(--g2);box-shadow:inset 0 1px 0 var(--gh);font-weight:600}
.ri.on .ic{color:var(--acc)}
[data-pt="sky"] .ri.on .ic{color:var(--acc-fill)}
.rail .sp{flex:1}
.rail .kh{font-size:10.5px;color:var(--muted);padding:6px 10px;display:flex;gap:6px;align-items:center}
.app.rc .rail .brand b,.app.rc .rail .brand small,.app.rc .ri .t,.app.rc .ri .n,.app.rc .rail .kh{display:none}
.app.rc .ri{justify-content:center;padding:9px}
.app.rc .rail .brand{justify-content:center;padding-inline:0}
.main{display:flex;flex-direction:column;min-height:0;position:relative}
.top{display:flex;align-items:center;gap:8px;padding:12px 16px 8px;flex:none}
.crumb{display:flex;align-items:center;gap:4px;font-size:12.5px;color:var(--muted);white-space:nowrap;overflow:hidden}
.crumb b{color:var(--fg);font-weight:600}
.crumb .ic{width:13px;height:13px;opacity:.8}
.top .grow{flex:1}
.chip{display:inline-flex;align-items:center;gap:6px;padding:5px 11px;border-radius:999px;background:var(--g2);box-shadow:inset 0 1px 0 var(--gh);font-size:12px;color:var(--fg);white-space:nowrap;line-height:1.35;font-weight:500}
.chip .ic{width:14px;height:14px}
.chip.sm{padding:2px 8px;font-size:11px;gap:4px}.chip.sm .ic{width:12px;height:12px}
.chip.on{background:var(--acc-fill);color:var(--on-acc);box-shadow:0 4px 12px var(--shadow)}
.chip.ai{background:color-mix(in srgb,var(--ai) 18%,var(--g1));color:var(--fg)}
.chip.ai .ic{color:var(--ai)}
[data-pt="sky"] .chip.ai .ic{color:var(--ai-ink)}
.chip.draft{background:color-mix(in srgb,var(--ai) 22%,var(--g1));box-shadow:inset 0 0 0 1.5px color-mix(in srgb,var(--ai) 70%,transparent)}
.chip.hold{background:color-mix(in srgb,var(--hold-h) 22%,var(--g1));color:var(--fg)}
.chip.hold .ic{color:var(--hold)}
.chip.block{background:color-mix(in srgb,var(--block-h) 22%,var(--g1))}
.chip.block .ic{color:var(--block)}
.chip.good .ic{color:var(--good)}
[data-pt="sky"] .chip.good .ic{color:var(--good-ink)}
.chip.ghost{background:transparent;box-shadow:inset 0 0 0 1px var(--line2)}
.chip.static{opacity:.45}
.search{display:flex;align-items:center;gap:8px;padding:7px 8px 7px 12px;border-radius:999px;background:var(--g1);box-shadow:inset 0 1px 0 var(--gh);color:var(--muted);font-size:12.5px;width:250px}
[dir="rtl"] .search{padding:7px 12px 7px 8px}
.search .k{margin-inline-start:auto}
.kbd{display:inline-flex;align-items:center;justify-content:center;min-width:20px;height:19px;padding:0 5px;border-radius:6px;font-size:10.5px;font-weight:600;background:var(--g2);box-shadow:inset 0 -1px 0 var(--line2);color:var(--fg);font-family:var(--ui);font-variant-numeric:tabular-nums}
.ib{width:34px;height:34px;border-radius:50%;display:grid;place-items:center;background:var(--g2);box-shadow:inset 0 1px 0 var(--gh);color:var(--fg);flex:none;position:relative}
.ib.sm{width:28px;height:28px}.ib.sm .ic{width:14px;height:14px}
.ib.clear{background:transparent;box-shadow:none}
.ib .dotb{position:absolute;top:-2px;inset-inline-end:-3px;min-width:16px;height:16px;border-radius:8px;background:var(--acc-fill);color:var(--on-acc);font-size:10px;font-weight:700;display:grid;place-items:center;padding:0 4px;font-variant-numeric:tabular-nums}
.av{width:28px;height:28px;border-radius:50%;display:inline-grid;place-items:center;font-weight:600;font-size:11.5px;color:var(--fg);background:var(--g2);flex:none;position:relative;box-shadow:inset 0 1px 0 var(--gh)}
.av.sm{width:22px;height:22px;font-size:10px}.av.xs{width:18px;height:18px;font-size:9px}.av.lg{width:44px;height:44px;font-size:16px}
.av.p1{background:color-mix(in srgb,var(--acc) 34%,var(--g2))}
.av.p2{background:color-mix(in srgb,var(--f-warm) 32%,var(--g2))}
.av.p3{background:color-mix(in srgb,var(--f-gold) 30%,var(--g2))}
.av.p4{background:color-mix(in srgb,var(--f-lime) 30%,var(--g2))}
.av.ag{background:color-mix(in srgb,var(--ai) 26%,var(--g2));color:var(--ai)}
[data-pt="sky"] .av.ag{color:var(--ai-ink)}
.av.ag .ic{width:58%;height:58%}
.av.r-doing{box-shadow:0 0 0 2px var(--good)}
.av.r-wait{box-shadow:0 0 0 2px var(--hold-h)}
.av.r-stuck{box-shadow:0 0 0 2px var(--block-h)}
.avs{display:inline-flex}.avs .av+.av{margin-inline-start:-7px}
.avs .av{box-shadow:0 0 0 2px var(--ground-base)}
.btn{display:inline-flex;align-items:center;justify-content:center;gap:7px;padding:7px 14px;border-radius:999px;font-weight:600;font-size:12.5px;white-space:nowrap;background:var(--g2);color:var(--fg);box-shadow:inset 0 1px 0 var(--gh);line-height:1.3;cursor:pointer}
.btn .ic{width:15px;height:15px}
.btn.pri{background:var(--acc-fill);color:var(--on-acc);box-shadow:0 6px 16px var(--shadow),inset 0 1px 0 rgba(255,255,255,.3)}
.btn.ai{background:color-mix(in srgb,var(--ai) 22%,var(--g2))}
.btn.ai .ic{color:var(--ai)}
[data-pt="sky"] .btn.ai .ic{color:var(--ai-ink)}
.btn.stop{background:color-mix(in srgb,var(--block-h) 24%,var(--g2))}
.btn.stop .ic{color:var(--block)}
.btn.sm{padding:4px 10px;font-size:11.5px;gap:5px}.btn.sm .ic{width:13px;height:13px}
.btn.ghost{background:transparent;box-shadow:inset 0 0 0 1px var(--line2)}
.btns{display:flex;flex-wrap:wrap;gap:8px;align-items:center}
/* glass panels */
.pn{background:var(--g1);border-radius:22px;box-shadow:inset 0 1px 0 var(--gh);backdrop-filter:blur(18px) saturate(160%);-webkit-backdrop-filter:blur(18px) saturate(160%)}
.pn.l2{background:var(--g2)}
.pn.l3{background:var(--g3);box-shadow:inset 0 1px 0 var(--gh),0 18px 50px var(--shadow)}
.pn.nb{backdrop-filter:none;-webkit-backdrop-filter:none}
.pn.ai{background:color-mix(in srgb,var(--ai) 14%,var(--g1))}
.pn.hold{background:color-mix(in srgb,var(--hold-h) 16%,var(--g1))}
.pn.block{background:color-mix(in srgb,var(--block-h) 16%,var(--g1))}
.pn.accr{box-shadow:inset 0 0 0 1.5px color-mix(in srgb,var(--acc) 70%,transparent),inset 0 2px 0 var(--gh)}
.pad{padding:14px 16px}
.ph{display:flex;align-items:center;gap:8px;font-weight:600;font-size:13px}
.ph h3,.h3{font-family:var(--display);font-weight:600;font-size:15px;margin:0;letter-spacing:-.005em}
.h2{font-family:var(--display);font-weight:600;font-size:20px;margin:0;letter-spacing:-.01em}
.mut{color:var(--muted)}
.sm{font-size:11.5px}
.xs{font-size:10.5px}
.num{font-variant-numeric:tabular-nums}
.b{font-weight:600}
.flex{display:flex;align-items:center;gap:8px}
.col{display:flex;flex-direction:column;gap:8px}
.sp{flex:1}
.wrapf{flex-wrap:wrap}
.nowrap{white-space:nowrap}
.ell{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.hr{height:1px;background:var(--line);margin:8px 0}
.code{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:11.5px;direction:ltr;unicode-bidi:isolate}
.id{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:11px;color:var(--muted);direction:ltr;unicode-bidi:isolate;white-space:nowrap}
.bar{height:6px;border-radius:3px;background:color-mix(in srgb,var(--fg) 14%,transparent);overflow:hidden;position:relative}
.bar>i{position:absolute;inset-block:0;inset-inline-start:0;border-radius:3px;background:var(--good)}
.bar>i.ai{background:var(--ai)}.bar>i.acc{background:var(--acc)}.bar>i.hold{background:var(--hold-h)}.bar>i.block{background:var(--block-h)}
.bar.lg{height:8px;border-radius:4px}
/* glyph discs: kind families (docs/10 §4a families) */
.g{--h:var(--ai);width:22px;height:22px;border-radius:50%;display:inline-grid;place-items:center;flex:none;background:color-mix(in srgb,var(--h) 24%,transparent);color:var(--h);box-shadow:inset 0 0 0 1px color-mix(in srgb,var(--h) 38%,transparent);vertical-align:middle}
.g .ic{width:13px;height:13px;stroke-width:2.1}
.g.sm{width:18px;height:18px}.g.sm .ic{width:11px;height:11px}
.g.lg{width:30px;height:30px}.g.lg .ic{width:17px;height:17px}
.g.xl{width:40px;height:40px}.g.xl .ic{width:21px;height:21px}
.g.solid{background:var(--h);color:var(--ink-dark);box-shadow:0 3px 10px color-mix(in srgb,var(--h) 35%,transparent)}
[data-pt="sky"] .g{color:color-mix(in srgb,var(--h) 66%,#000)}
[data-pt="sky"] .g.solid{color:#fff;background:color-mix(in srgb,var(--h) 88%,#000)}
.f-sky{--h:var(--f-sky)}.f-heat{--h:var(--f-heat)}.f-warm{--h:var(--f-warm)}.f-lime{--h:var(--f-lime)}.f-rules{--h:var(--f-rules)}.f-gold{--h:var(--f-gold)}.f-sharp{--h:var(--f-sharp)}.f-violet{--h:var(--f-violet)}.f-drift{--h:var(--f-drift)}.f-slate{--h:var(--f-slate)}.f-lucid{--h:var(--ai)}.f-good{--h:var(--good)}.f-hold{--h:var(--hold-h)}.f-block{--h:var(--block-h)}.f-acc{--h:var(--acc)}
.g.f-lucid svg.mk{width:15px;height:15px}
.g.sm.f-lucid svg.mk{width:12px;height:12px}
.g.lg.f-lucid svg.mk{width:20px;height:20px}
/* state / meaning glyphs (shape first, hue only for the four job meanings and done) */
.sg{display:inline-grid;place-items:center;width:18px;height:18px;flex:none;color:var(--fg);vertical-align:middle}
.sg .ic{width:15px;height:15px;stroke-width:2}
.sg.mut{color:var(--muted)}
.sg.good{color:var(--good)}.sg.hold{color:var(--hold-h)}.sg.block{color:var(--block-h)}.sg.ai{color:var(--ai)}.sg.acc{color:var(--acc)}.sg.rules{color:var(--f-rules)}.sg.gold{color:var(--f-gold)}.sg.slate{color:var(--f-slate)}
[data-pt="sky"] .sg.good{color:var(--good-ink)}[data-pt="sky"] .sg.hold{color:var(--hold)}[data-pt="sky"] .sg.block{color:var(--block)}[data-pt="sky"] .sg.ai{color:var(--ai-ink)}[data-pt="sky"] .sg.gold{color:#8a6d00}
.lbl{font-size:11px;color:var(--muted);font-weight:500}
.tag{display:inline-flex;align-items:center;gap:4px;font-size:11px;padding:1px 7px;border-radius:999px;background:color-mix(in srgb,var(--fg) 9%,transparent);white-space:nowrap}
.tag .ic{width:11px;height:11px}
.tag.ai{background:color-mix(in srgb,var(--ai) 20%,transparent);color:var(--ai-ink)}
.tag.hold{background:color-mix(in srgb,var(--hold-h) 22%,transparent);color:var(--hold)}
.tag.block{background:color-mix(in srgb,var(--block-h) 22%,transparent);color:var(--block)}
.tag.good{background:color-mix(in srgb,var(--good) 20%,transparent);color:var(--good-ink)}
.tag.acc{background:color-mix(in srgb,var(--acc) 22%,transparent);color:var(--acc-ink)}
/* dense tables: hairlines allowed here */
.tbl{width:100%;border-collapse:collapse;font-size:12.5px}
.tbl th{font-weight:600;font-size:11px;color:var(--muted);text-align:start;padding:7px 8px;border-bottom:1px solid var(--line2);white-space:nowrap;text-transform:uppercase;letter-spacing:.04em}
.tbl td{padding:7px 8px;border-bottom:1px solid var(--line);vertical-align:middle;white-space:nowrap}
.tbl tr.sel td{background:color-mix(in srgb,var(--acc) 14%,transparent)}
.tbl tr.dim td{opacity:.55}
.tbl td.t{white-space:normal;min-width:220px}
.tbl.dense td{padding:4px 8px}.tbl.dense th{padding:5px 8px}
.tbl td.tn{max-width:240px;overflow:hidden;text-overflow:ellipsis}
.tbl .cb{width:15px;height:15px;border-radius:5px;box-shadow:inset 0 0 0 1.5px var(--muted);display:inline-grid;place-items:center}
.tbl .cb.on{background:var(--acc-fill);box-shadow:none;color:var(--on-acc)}
.tbl .cb.on .ic{width:11px;height:11px;stroke-width:3}
.settings-row{display:flex;align-items:center;gap:10px;padding:10px 4px;border-bottom:1px solid var(--line)}
.settings-row:last-child{border-bottom:0}
/* toggles and segmented (docs/03-mocks --k-*) */
.tg{width:40px;height:24px;border-radius:12px;background:var(--k-track);box-shadow:inset 0 0 0 2px var(--k-off);position:relative;flex:none}
.tg::after{content:"";position:absolute;top:6px;inset-inline-start:6px;width:12px;height:12px;border-radius:50%;background:var(--k-off)}
.tg.on{background:var(--k-on);box-shadow:none}
.tg.on::after{inset-inline-start:auto;inset-inline-end:3px;top:3px;width:18px;height:18px;background:var(--k-on-ink)}
.seg{flex:none;display:inline-flex;padding:3px;border-radius:999px;background:var(--g1);box-shadow:inset 0 1px 0 var(--gh);gap:2px}
.seg>span{display:inline-flex;align-items:center;gap:5px;padding:4px 10px;border-radius:999px;font-size:12px;white-space:nowrap}
.seg>span .ic{width:13px;height:13px}
.seg>span.on{background:var(--acc-fill);color:var(--on-acc);font-weight:600}
/* board cards */
.card{border-radius:18px;background:var(--g1);box-shadow:inset 0 1px 0 var(--gh);padding:9px 11px;display:flex;flex-direction:column;gap:6px;font-size:12px;position:relative}
.card .t1{display:flex;align-items:center;gap:6px}
.card .tt{font-weight:600;font-size:12.5px;line-height:1.3}
.card .gr{display:flex;align-items:center;gap:4px}
.card .wl{font-size:11px;color:var(--ai-ink);display:flex;gap:5px;align-items:center;background:color-mix(in srgb,var(--ai) 12%,transparent);border-radius:999px;padding:2px 8px}
.card .wl .ic{width:12px;height:12px;color:var(--ai)}
.card.sel{box-shadow:inset 0 0 0 2px var(--acc),0 10px 30px var(--shadow)}
.card.dim{opacity:.38}
.card.lit{box-shadow:inset 0 0 0 1.5px color-mix(in srgb,var(--acc) 55%,transparent)}
.card.blk{box-shadow:inset 0 1px 0 var(--gh),inset 3px 0 0 var(--block-h)}
[dir="rtl"] .card.blk{box-shadow:inset 0 1px 0 var(--gh),inset -3px 0 0 var(--block-h)}
.crow{display:flex;align-items:center;gap:8px;padding:6px 10px;border-radius:14px;font-size:12px}
.crow:hover,.crow.sel{background:var(--g2)}
.crow .tt{font-weight:500;flex:1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
/* AI surfaces */
.aib{background:color-mix(in srgb,var(--ai) 15%,var(--g1));border-radius:20px;padding:10px 13px;box-shadow:inset 0 1px 0 var(--gh)}
.meb{background:color-mix(in srgb,var(--acc) 30%,var(--g1));border-radius:20px;padding:9px 13px;box-shadow:inset 0 1px 0 var(--gh);align-self:flex-end;max-width:80%}
.cite{display:inline-flex;align-items:center;gap:4px;font-size:11px;padding:1px 8px 1px 6px;border-radius:999px;background:color-mix(in srgb,var(--fg) 10%,transparent);white-space:nowrap;vertical-align:1px;font-weight:500}
.cite .ic{width:11px;height:11px}
.confirm{border-radius:22px;background:var(--g2);box-shadow:inset 0 0 0 1.5px color-mix(in srgb,var(--acc) 65%,transparent),inset 0 2px 0 var(--gh);padding:12px 14px;display:flex;flex-direction:column;gap:8px}
.kbdh{display:inline-flex;gap:4px;align-items:center;font-size:11px;color:var(--muted)}
.sheet{border-radius:28px 28px 0 0;background:var(--g3);box-shadow:0 -14px 40px var(--shadow),inset 0 1px 0 var(--gh);padding:10px 16px 16px;position:relative}
.sheet::before{content:"";display:block;width:38px;height:4px;border-radius:2px;background:var(--gl);margin:0 auto 10px}
.dlg{border-radius:28px;background:var(--g3);box-shadow:0 24px 70px var(--shadow),inset 0 1px 0 var(--gh);padding:18px}
.scrim{position:absolute;inset:0;background:color-mix(in srgb,#000 38%,transparent);z-index:5}
[data-pt="sky"] .scrim{background:color-mix(in srgb,#0f1f3a 24%,transparent)}
.field{border-radius:999px;background:var(--g2);padding:8px 14px;box-shadow:inset 0 1px 0 var(--gh);display:flex;align-items:center;gap:8px;font-size:12.5px}
.field.area{border-radius:18px;align-items:flex-start;min-height:70px}
.field.focus{box-shadow:0 0 0 2px var(--acc)}
.tabs{display:flex;gap:4px;align-items:center}
.tabs>span{display:inline-flex;gap:6px;align-items:center;padding:6px 12px;border-radius:999px;font-size:12.5px;font-weight:500;color:var(--muted);white-space:nowrap}
.tabs>span.on{background:var(--g2);color:var(--fg);box-shadow:inset 0 1px 0 var(--gh);font-weight:600}
.tabs>span .ic{width:14px;height:14px}
.tabs .n{font-size:10.5px;opacity:.8;font-variant-numeric:tabular-nums}
/* map */
.mapc{position:relative;overflow:hidden;border-radius:24px}
.mapc svg.terrain{position:absolute;inset:0;width:100%;height:100%;display:block}
[dir="rtl"] .mapc svg.terrain{transform:scaleX(-1)}
.mapc .ov{position:absolute;inset:0;pointer-events:none}
.mapc .ov>*{pointer-events:auto}
.ml{position:absolute;transform:translate(-50%,-50%)}
[dir="rtl"] .ml{transform:translate(50%,-50%)}
.ml.tl{transform:none}[dir="rtl"] .ml.tl{transform:none}
.cell{fill:color-mix(in srgb,var(--fg) 8%,transparent)}
.cell.c2{fill:color-mix(in srgb,var(--fg) 11%,transparent)}
.cell.me{fill:color-mix(in srgb,var(--fg) 13%,transparent)}
.cell.sub{fill:color-mix(in srgb,var(--fg) 9%,transparent)}
.cell.dim{fill:color-mix(in srgb,var(--fg) 4%,transparent)}
.cell.sel{fill:color-mix(in srgb,var(--acc) 18%,transparent);stroke:var(--acc);stroke-width:2}
.cellhi{fill:url(#hiGrad);pointer-events:none}
.cedge{fill:none;stroke:var(--gl);stroke-width:1;opacity:.55}
[data-hc="high"] .cedge{opacity:1;stroke-width:1.5}
[data-hc="high"] .cell{fill:var(--g1)}
[data-hc="high"] .cell.sub,[data-hc="high"] .cell.c2,[data-hc="high"] .cell.me{fill:var(--g2)}
.heat{fill:var(--f-heat);pointer-events:none}
[data-hc="high"] .heat{display:none}
.hull{fill:color-mix(in srgb,var(--f-lime) 13%,transparent);stroke:var(--f-lime);stroke-width:2.2;stroke-linejoin:round}
.hull.ghost{fill:none;stroke-dasharray:6 6}
.road{fill:none;stroke:color-mix(in srgb,var(--fg) 55%,transparent);stroke-width:2;stroke-linecap:round}
.road.crit{stroke:var(--fg);stroke-width:4}
.road.blk{stroke:var(--block-h);stroke-dasharray:6 5;stroke-width:2.4}
.road.lit{stroke:var(--acc);stroke-width:2.6}
.road.dim{opacity:.25}
.road.ext{stroke-dasharray:2 6;stroke-width:2.4}
.ghostcell{fill:none;stroke:var(--ai);stroke-width:2;stroke-dasharray:7 6}
.ghostarrow{fill:none;stroke:var(--ai);stroke-width:2;marker-end:url(#arrowAi)}
.front{fill:url(#hatch);opacity:.9}
.frontedge{fill:color-mix(in srgb,var(--f-sharp) 14%,transparent);stroke:color-mix(in srgb,var(--f-sharp) 55%,transparent);stroke-width:1.5;stroke-dasharray:3 4}
.hatchln{stroke:color-mix(in srgb,var(--f-sharp) 45%,transparent);stroke-width:2}
.reglabel{display:flex;flex-direction:column;align-items:center;gap:3px;text-align:center}
.reglabel .nm{font-family:var(--display);font-weight:600;font-size:15px;letter-spacing:-.01em;text-shadow:0 1px 8px var(--shadow);white-space:nowrap}
.reglabel .ru{display:inline-flex;align-items:center;gap:6px;padding:3px 9px;border-radius:999px;background:var(--g2);box-shadow:inset 0 1px 0 var(--gh);font-size:11px;white-space:nowrap;font-variant-numeric:tabular-nums}
.reglabel .ru .sg{width:14px;height:14px}.reglabel .ru .sg .ic{width:12px;height:12px}
.reglabel .ru i.sep{width:1px;height:10px;background:var(--line2);display:inline-block}
.reglabel.sm .nm{font-size:13px}
.reglabel.dim{opacity:.7}
.flag{display:inline-flex;align-items:center;gap:5px;padding:3px 9px 3px 4px;border-radius:999px;background:color-mix(in srgb,var(--f-rules) 26%,var(--g2));box-shadow:inset 0 1px 0 var(--gh),0 4px 12px var(--shadow);font-size:11px;font-weight:600;white-space:nowrap}
[dir="rtl"] .flag{padding:3px 4px 3px 9px}
.flag .g{width:20px;height:20px}
.flag.big{font-size:12px;padding:4px 11px 4px 4px}.flag.big .g{width:24px;height:24px}
.cl{display:inline-flex;align-items:center;border-radius:999px;background:var(--g2);box-shadow:inset 0 1px 0 var(--gh),0 3px 10px var(--shadow);font-size:11px;font-weight:600;overflow:hidden;font-variant-numeric:tabular-nums}
.cl>span{display:inline-flex;align-items:center;gap:3px;padding:2px 7px}
.cl>span+span{box-shadow:inset 1px 0 0 var(--line2)}
[dir="rtl"] .cl>span+span{box-shadow:inset -1px 0 0 var(--line2)}
.cl .sg{width:13px;height:13px}.cl .sg .ic{width:11px;height:11px}
.cont{display:inline-flex;align-items:center;gap:3px;font-size:11px;font-weight:600;padding:3px 8px;border-radius:999px;background:color-mix(in srgb,var(--f-lime) 26%,var(--g2));white-space:nowrap}
.cont .ic{width:13px;height:13px}
.presence{display:inline-flex;gap:3px}
.mtools{position:absolute;display:flex;flex-direction:column;gap:6px}
.mtools .ib{width:32px;height:32px}
.legend{position:absolute;border-radius:18px;background:var(--g2);box-shadow:inset 0 1px 0 var(--gh);padding:8px 10px;font-size:11px;display:grid;grid-template-columns:auto auto;gap:3px 12px}
.legend>span{display:flex;align-items:center;gap:5px;white-space:nowrap}
.legend .g{width:16px;height:16px}.legend .g .ic{width:10px;height:10px}
.legend .sg{width:15px;height:15px}.legend .sg .ic{width:12px;height:12px}
.goals{display:flex;gap:10px}
.goal{flex:1;display:flex;align-items:center;gap:10px;padding:8px 12px;border-radius:20px;background:var(--g1);box-shadow:inset 0 1px 0 var(--gh);min-width:0}
.goal .tx{flex:1;min-width:0}
.goal .tx b{display:block;font-size:12.5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.goal .tx small{display:flex;gap:6px;align-items:center;color:var(--muted);font-size:11px;white-space:nowrap}
.goal.sel{box-shadow:inset 0 0 0 2px var(--acc)}
.mini{position:absolute;width:150px;height:96px;border-radius:16px;background:var(--g2);box-shadow:inset 0 1px 0 var(--gh),0 6px 18px var(--shadow);overflow:hidden}
.mini svg{width:100%;height:100%}
.weather{display:inline-flex;align-items:center;gap:5px;padding:3px 9px 3px 4px;border-radius:999px;background:color-mix(in srgb,var(--f-sharp) 24%,var(--g2));font-size:11px;font-weight:600;white-space:nowrap}
.barrier{display:inline-grid;place-items:center;width:24px;height:24px;border-radius:50%;background:var(--block-h);color:#fff;box-shadow:0 0 0 3px color-mix(in srgb,var(--block-h) 30%,transparent)}
.barrier .ic{width:14px;height:14px;stroke-width:2.2}
[data-pt="sky"] .barrier{background:#c4333b}
/* phone frame */
.phone{width:390px;height:844px;flex:none;border-radius:44px;overflow:hidden;position:relative;background:var(--ground);background-color:var(--ground-base);color:var(--fg);font-size:14px;display:flex;flex-direction:column;box-shadow:0 24px 60px var(--shadow),inset 0 0 0 1px var(--gl);isolation:isolate}
.phone *{min-width:0}
.phone .sb{display:flex;justify-content:space-between;align-items:center;padding:14px 28px 4px;font-size:13px;font-weight:600;font-variant-numeric:tabular-nums;flex:none}
.phone .sb .ic{width:15px;height:15px}
.phone .ph-top{display:flex;align-items:center;gap:8px;padding:6px 14px 6px;flex:none}
.phone .ph-top .ttl{flex:1;min-width:0}
.phone .ph-top .ttl b{font-family:var(--display);font-weight:600;font-size:20px;display:block;letter-spacing:-.01em;line-height:1.2}
.phone .ph-top .ttl small{color:var(--muted);font-size:12px;display:block}
.phone .scrollb{flex:1;overflow:hidden;padding:0 12px 100px;display:flex;flex-direction:column;gap:10px}
.pnav{position:absolute;inset-inline:14px;bottom:22px;display:flex;justify-content:space-around;padding:7px 8px;border-radius:999px;background:var(--g3);box-shadow:0 12px 36px var(--shadow),inset 0 1px 0 var(--gh);backdrop-filter:blur(22px) saturate(160%);-webkit-backdrop-filter:blur(22px) saturate(160%);z-index:8}
.pnav>span{display:flex;flex-direction:column;align-items:center;gap:2px;font-size:10.5px;font-weight:500;padding:5px 10px;border-radius:999px;color:var(--muted);position:relative}
.pnav>span .ic{width:20px;height:20px}
.pnav>span.on{background:var(--g2);color:var(--fg);font-weight:600;box-shadow:inset 0 1px 0 var(--gh)}
.pnav>span.on .ic{color:var(--acc)}
[data-pt="sky"] .pnav>span.on .ic{color:var(--acc-fill)}
.pnav .dotb{position:absolute;top:0;inset-inline-end:4px;min-width:15px;height:15px;border-radius:8px;background:var(--acc-fill);color:var(--on-acc);font-size:9.5px;font-weight:700;display:grid;place-items:center;padding:0 3px}
.app .pnav{display:none}
.homebar{position:absolute;bottom:7px;left:50%;width:134px;height:5px;border-radius:3px;background:var(--fg);opacity:.55;transform:translateX(-50%);z-index:9}
/* RTL / Hebrew */
[lang="he"],[lang="he"] .h2,[lang="he"] .h3,[lang="he"] .reglabel .nm,[lang="he"] .rail .brand b{font-family:var(--he)}
/* high contrast: no blur, visible edges, underline links (docs/10 §9) */
[data-hc="high"] .app *,[data-hc="high"] .phone *,[data-hc="high"].app *,[data-hc="high"] .app,[data-hc="high"] .phone{backdrop-filter:none!important;-webkit-backdrop-filter:none!important}
[data-hc="high"] :is(.pn,.chip,.btn,.ib,.card,.field,.seg,.search,.goal,.legend,.mini,.reglabel .ru,.cl,.flag,.aib,.meb,.confirm,.sheet,.dlg,.pnav,.tabs>span.on,.ri.on,.tile,.cite,.tag,.kbd,.av,.crow.sel){box-shadow:inset 0 0 0 1px var(--gl)!important}
[data-hc="high"] .av.r-doing{box-shadow:0 0 0 2px var(--good)!important}[data-hc="high"] .av.r-wait{box-shadow:0 0 0 2px var(--hold-h)!important}[data-hc="high"] .av.r-stuck{box-shadow:0 0 0 2px var(--block-h)!important}
[data-hc="high"] .btn.pri,[data-hc="high"] .chip.on{box-shadow:inset 0 0 0 2px var(--fg)!important}
[data-hc="high"] .card.sel{box-shadow:inset 0 0 0 3px var(--fg)!important}
[data-hc="high"] a{text-decoration:underline}
/* ---- device: phone (the responsive web app at 390 px; dedicated phone frames are always phones) ---- */
#gallery[data-dev="phone"] .app{width:390px;height:844px;border-radius:44px;grid-template-columns:minmax(0,1fr)}
#gallery[data-dev="phone"] .app .rail{display:none}
#gallery[data-dev="phone"] .app .pnav{display:flex}
#gallery[data-dev="phone"] .app .top{flex-wrap:wrap;padding:46px 12px 6px}
#gallery[data-dev="phone"] .app .top .crumb{flex-basis:100%;order:5}
#gallery[data-dev="phone"] .app .top .search{width:34px;padding:0;justify-content:center;height:34px}
#gallery[data-dev="phone"] .app .top .search>:not(.ic):not(svg){display:none}
#gallery[data-dev="phone"] .app .hide-ph{display:none!important}
#gallery[data-dev="phone"] .app .split{display:flex!important;flex-direction:column;overflow:auto}
#gallery[data-dev="phone"] .app .split>*{width:auto!important;flex:none!important}
#gallery[data-dev="phone"] .app .zoomph{zoom:.36}
#gallery[data-dev="phone"] .app .hscroll{overflow-x:auto}
#gallery[data-dev="phone"] .app .content{padding-bottom:96px!important;overflow:hidden}
#gallery[data-dev="phone"] .app .content :is(.flex,.btns){flex-wrap:wrap}
#gallery[data-dev="phone"] .app .content .btns[style*="nowrap"]{flex-wrap:wrap!important}
#gallery[data-dev="phone"] .app .content [style*="grid-template-columns"]{grid-template-columns:minmax(0,1fr)!important}
#gallery[data-dev="phone"] .app .content .pn:has(table){overflow-x:auto!important}
#gallery[data-dev="phone"] .app .content [style*="width:"]:not(.bar):not(.av):not(.ib):not(.g){max-width:100%}
#gallery[data-dev="phone"] .app .content .h2{font-size:18px}
#gallery[data-dev="phone"] .app .content .tabs{overflow:hidden;flex-wrap:nowrap}
#gallery[data-dev="phone"] .app .scrim+div .dlg{width:auto!important;margin:0 12px}
`;
