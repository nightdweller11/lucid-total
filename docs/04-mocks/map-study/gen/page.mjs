// Page and still chrome styles for the map study. Theme values come from tokens.mjs (copied from v0.1).
export const PAGE_CSS = String.raw`
/* study extensions: place family hues (identity only), alarms (failing or breached only) */
[data-pt]{--h-build:var(--f-sky);--h-market:var(--f-violet);--h-run:var(--f-lime);--h-govern:var(--f-rules);--amber:var(--hold-h);--coral:var(--block-h)}
[data-pt="deep"]{--terrain:#0b1c48;--terrain2:#12306f;--space:#040a1f;--paper:#0a1838;--ink-soft:rgba(226,235,255,.55);--glow:#bfe3ff;--road:#e6efff;--fog:rgba(190,210,255,.5);--city-ground:#132a62;--city-top:#2c4888;--city-left:#1d3574;--city-right:#122452;--street:#0a1838;--water:#06102e;--water2:#0b1d4c;--win:#eaf4ff;--win-off:rgba(8,18,48,.55);--pipe:#5fd0ff;--pipe-wall:#0b1a3f;--slab1:#081538;--slab2:#0b1f52;--lens:#081a44;--lens2:#0d2a66;--scope:#02060f;--membrane:#cfe4ff}
[data-pt="aqua"]{--terrain:#072631;--terrain2:#0b4352;--space:#03121a;--paper:#062430;--ink-soft:rgba(214,243,250,.55);--glow:#bff4ff;--road:#e6fbff;--fog:rgba(190,235,245,.5);--city-ground:#0e3c4a;--city-top:#205a68;--city-left:#164856;--city-right:#0b333e;--street:#04202a;--water:#03141b;--water2:#062a35;--win:#eafcff;--win-off:rgba(0,18,24,.55);--pipe:#5fe3ff;--pipe-wall:#04202a;--slab1:#041a22;--slab2:#06303b;--lens:#06262f;--lens2:#0b3d4a;--scope:#010a0d;--membrane:#cff6ff}
[data-pt="sky"]{--terrain:#f3f7ff;--terrain2:#dfe9fb;--space:#f4f6fb;--paper:#fbfcff;--ink-soft:rgba(15,31,58,.5);--glow:#1d64d8;--road:#1b2f63;--fog:rgba(255,255,255,.75);--city-ground:#e8effb;--city-top:#ffffff;--city-left:#dbe4f5;--city-right:#c3d1ea;--street:#c2cee3;--water:#d3e3f8;--water2:#b9cff0;--win:#2f7cf6;--win-off:rgba(30,60,120,.16);--pipe:#1a8fe0;--pipe-wall:#b9c7df;--slab1:#d5e0f3;--slab2:#e6edf9;--lens:#fdfdff;--lens2:#eef3fc;--scope:#d9e1ee;--membrane:#30476f}
*{box-sizing:border-box}
html,body{margin:0}
body{font-family:var(--ui);background:var(--page);color:var(--fg);line-height:1.45;padding:0 16px 64px;-webkit-font-smoothing:antialiased}
body::before{content:"";position:fixed;inset:0;z-index:-1;background:linear-gradient(180deg,var(--page2),var(--page))}
a{color:var(--acc-ink)}
.wrap{max-width:1480px;margin:0 auto}
header.page{padding:32px 0 8px}
header.page h1{font-family:var(--display);font-weight:600;font-size:clamp(24px,4vw,36px);margin:0;letter-spacing:-.02em;display:flex;align-items:center;gap:12px}
header.page p{margin:8px 0 0;color:var(--muted);max-width:86ch;font-size:14.5px}
.lab{position:sticky;top:0;z-index:50;display:flex;flex-wrap:wrap;gap:8px 18px;padding:10px 14px;margin:8px 0 14px;border-radius:20px;background:var(--g3);backdrop-filter:blur(22px) saturate(160%);-webkit-backdrop-filter:blur(22px) saturate(160%);box-shadow:0 10px 30px var(--shadow),inset 0 1px 0 var(--gh);font-size:13px}
.lab .grp{display:flex;align-items:center;gap:4px;flex-wrap:wrap}
.lab .grp>span{color:var(--muted);font-weight:700;margin-inline-end:4px;text-transform:uppercase;letter-spacing:.06em;font-size:10.5px}
.lab button{font:inherit;padding:6px 12px;border-radius:999px;border:0;background:transparent;color:var(--fg);cursor:pointer;display:inline-flex;align-items:center;gap:6px}
.lab button.on{background:var(--acc-fill);color:var(--on-acc)}
.lab button:focus-visible{outline:2px solid var(--acc);outline-offset:2px}
.lab .ic{width:15px;height:15px}
section.var{padding:18px 0 4px}
section.var[hidden]{display:none}
section.var>h2{font-family:var(--display);font-weight:600;font-size:24px;margin:0 0 4px;letter-spacing:-.01em}
section.var>p{margin:0 0 18px;color:var(--muted);max-width:92ch;font-size:14.5px}
figure.fr{margin:0 0 34px;min-width:0}
figure.fr .fit{width:100%;overflow:hidden;border-radius:28px}
figure.fr figcaption{font-size:13.5px;color:var(--muted);margin-top:8px;line-height:1.5;max-width:120ch}
figure.fr figcaption b{color:var(--fg);font-weight:600}
figure.fr figcaption .att{display:inline-block;font-size:12px;padding:1px 9px;border-radius:999px;background:var(--g1);color:var(--fg);margin-inline-start:6px;font-variant-numeric:tabular-nums}
.row{display:flex;flex-wrap:wrap;gap:28px;align-items:flex-start}
.ic{width:16px;height:16px;flex:none;stroke-width:1.9;vertical-align:middle}
svg.mk{fill:none;stroke:none}
svg.mk path:not(.ring){stroke:none}

/* ---- a still ---- */
.scr{position:relative;width:1440px;height:900px;border-radius:28px;overflow:hidden;background:var(--ground);background-color:var(--ground-base);color:var(--fg);isolation:isolate;flex:none;font-size:14px}
.scr.phone{width:390px;height:844px;border-radius:46px;box-shadow:0 0 0 10px #0b1020,0 0 0 11px rgba(255,255,255,.18)}
.scr>svg.world{position:absolute;inset:0;width:100%;height:100%;display:block}
.scr text{user-select:none}
.glass{background:var(--g2);backdrop-filter:blur(18px) saturate(150%);-webkit-backdrop-filter:blur(18px) saturate(150%);box-shadow:inset 0 1px 0 var(--gh),0 8px 24px var(--shadow)}
.crumb{position:absolute;top:22px;left:24px;display:flex;align-items:center;gap:6px;padding:7px 14px 7px 10px;border-radius:999px;font-size:13.5px;color:var(--muted);background:var(--g2);backdrop-filter:blur(18px);-webkit-backdrop-filter:blur(18px);box-shadow:inset 0 1px 0 var(--gh),0 6px 18px var(--shadow);z-index:5}
.crumb b{color:var(--fg);font-weight:600}
.crumb .ic{width:14px;height:14px}.crumb .tm{width:18px;height:18px}
.tr{position:absolute;top:22px;right:24px;display:flex;gap:8px;z-index:5}
.chip{display:inline-flex;align-items:center;gap:7px;padding:7px 13px;border-radius:999px;background:var(--g2);backdrop-filter:blur(18px);-webkit-backdrop-filter:blur(18px);box-shadow:inset 0 1px 0 var(--gh),0 6px 18px var(--shadow);font-size:13.5px;font-weight:500;white-space:nowrap}
.chip .ic{width:15px;height:15px}
.chip.on{background:var(--acc-fill);color:var(--on-acc)}
.dock{position:absolute;left:20px;top:50%;transform:translateY(-50%);display:flex;flex-direction:column;gap:6px;padding:8px;border-radius:999px;background:var(--g2);backdrop-filter:blur(18px);-webkit-backdrop-filter:blur(18px);box-shadow:inset 0 1px 0 var(--gh),0 8px 24px var(--shadow);z-index:5}
.dock .db{width:40px;height:40px;border-radius:50%;display:grid;place-items:center;color:var(--fg);opacity:.86}
.dock .db.on{background:var(--g3);opacity:1;box-shadow:inset 0 1px 0 var(--gh)}
.dock .ic{width:19px;height:19px}
.talk{position:absolute;bottom:22px;left:50%;transform:translateX(-50%);width:560px;height:52px;display:flex;align-items:center;gap:12px;padding:0 10px 0 16px;border-radius:999px;background:var(--g2);backdrop-filter:blur(22px);-webkit-backdrop-filter:blur(22px);box-shadow:inset 0 1px 0 var(--gh),0 10px 30px var(--shadow);font-size:14.5px;color:var(--muted);z-index:5}
.talk>span:first-of-type{flex:1}
.talk .tm{width:24px;height:24px}
.talk .tk{width:34px;height:34px;border-radius:50%;display:grid;place-items:center;background:var(--g3);color:var(--fg)}
.finding{position:absolute;top:76px;right:24px;width:300px;padding:16px 18px 16px;border-radius:22px;background:var(--g2);backdrop-filter:blur(22px);-webkit-backdrop-filter:blur(22px);box-shadow:inset 0 1px 0 var(--gh),0 12px 32px var(--shadow);z-index:5}
.finding.bl{top:auto;bottom:96px;left:96px;right:auto}
.finding.tl{top:76px;left:96px;right:auto}
.finding .fh{display:flex;align-items:center;gap:9px}
.finding .fh .ic{width:18px;height:18px;color:var(--acc)}
[data-pt="sky"] .finding .fh .ic{color:var(--acc-fill)}
.finding .fh b{font-family:var(--display);font-weight:600;font-size:17px;letter-spacing:-.01em}
.finding p{margin:8px 0 0;font-size:14px;line-height:1.45;color:var(--muted)}
.ramp{display:flex;align-items:center;gap:8px;margin-top:12px;font-size:12.5px;color:var(--muted)}
.ramp i{flex:1;height:8px;border-radius:4px}
.keys{display:flex;flex-wrap:wrap;gap:6px 14px;margin-top:12px;font-size:12.5px;color:var(--muted)}
.keys span{display:inline-flex;align-items:center;gap:6px}
.sw{display:inline-block;width:12px;height:12px;border-radius:50%}
.sw.line{width:18px;height:4px;border-radius:2px}
.sw.sq{border-radius:3px}
.mini{position:absolute;bottom:22px;right:24px;width:150px;height:96px;border-radius:18px;overflow:hidden;background:var(--g2);backdrop-filter:blur(18px);box-shadow:inset 0 1px 0 var(--gh),0 8px 24px var(--shadow);z-index:5}
.mini svg{width:100%;height:100%}
/* phone */
.phone .crumb{top:54px;left:16px;font-size:13px}
.phone .tr{top:54px;right:16px}
.phone .dock{left:50%;top:auto;bottom:18px;transform:translateX(-50%);flex-direction:row;gap:10px;padding:7px 12px}
.phone .dock .db{width:44px;height:44px}
.phone .talk{display:none}
.phone .status{position:absolute;top:16px;left:30px;right:30px;display:flex;justify-content:space-between;font-size:14px;font-weight:600;z-index:5}
.phone .finding{left:16px;right:16px;width:auto;top:auto;bottom:92px}
/* phone card over the world */
.pcard{position:absolute;left:16px;right:16px;bottom:96px;padding:16px 18px;border-radius:24px;background:var(--g3);backdrop-filter:blur(22px);-webkit-backdrop-filter:blur(22px);box-shadow:inset 0 1px 0 var(--gh),0 12px 32px var(--shadow);z-index:5}
.pcard .pc-h{display:flex;align-items:center;gap:10px}
.pcard .pc-h b{font-family:var(--display);font-weight:600;font-size:17px}
.pcard p{margin:8px 0 12px;font-size:14.5px;color:var(--muted);line-height:1.4}
.pcard .pills{display:flex;gap:8px}
.cont{z-index:5}
/* high contrast keeps the drawings legible: thicker edges */
[data-hc="high"] .scr .soft{opacity:.15!important}
`;
