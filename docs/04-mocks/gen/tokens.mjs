export const TOKENS = String.raw`
/* Lucid Glass tokens, themes and high-contrast variants: copied unchanged from mocks v0.1 (gen/css.mjs), which took them from Lucid Chat docs/10 §3. */
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

`;
