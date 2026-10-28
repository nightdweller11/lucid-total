import { TOKENS } from './tokens.mjs';
export const CSS = TOKENS + String.raw`
/* ======== Lucid Total mocks v0.2 (2026-10-28): the operating system. Type scale 15 / 17 / 22 / 28 / 40; 13 px only for
   hover meta, axis ticks and the frame captions of the gallery, never as main text. ======== */
:root{--t1:15px;--t2:17px;--t3:22px;--t4:28px;--t5:40px}
[data-pt]{--ink18:color-mix(in srgb,var(--fg) 18%,transparent);--ink8:color-mix(in srgb,var(--fg) 8%,transparent);--ink14:color-mix(in srgb,var(--fg) 14%,transparent);--ink25:color-mix(in srgb,var(--fg) 25%,transparent);--ink45:color-mix(in srgb,var(--fg) 45%,transparent);--ink60:color-mix(in srgb,var(--fg) 60%,transparent)}
[data-pt="sky"]{--ink18:color-mix(in srgb,var(--fg) 16%,transparent)}
/* ---- page chrome (the gallery around the frames) ---- */
*{box-sizing:border-box}
html,body{margin:0}
body{font-family:var(--ui);background:var(--page);color:var(--fg);line-height:1.5;padding:0 16px 80px;-webkit-font-smoothing:antialiased}
body::before{content:"";position:fixed;inset:0;z-index:-1;background:linear-gradient(180deg,var(--page2),var(--page))}
a{color:var(--acc-ink)}
.wrap{max-width:1500px;margin:0 auto}
header.page{display:flex;flex-wrap:wrap;gap:16px 32px;align-items:flex-end;justify-content:space-between;padding:40px 0 12px}
header.page h1{font-family:var(--display);font-weight:600;font-size:clamp(28px,4vw,40px);margin:0;letter-spacing:-.02em;display:flex;align-items:center;gap:14px}
header.page p{margin:8px 0 0;color:var(--muted);max-width:76ch;font-size:15px}
nav.toc{display:flex;flex-wrap:wrap;gap:8px;padding:8px 0 16px}
nav.toc a{text-decoration:none;font-size:13px;padding:6px 12px;border-radius:999px;color:var(--fg);background:var(--g1);box-shadow:inset 0 1px 0 var(--gh)}
.lab{position:sticky;top:0;z-index:50;display:flex;flex-wrap:wrap;gap:8px 20px;padding:10px 16px;margin:0 0 16px;border-radius:22px;background:var(--g3);backdrop-filter:blur(22px) saturate(160%);-webkit-backdrop-filter:blur(22px) saturate(160%);box-shadow:0 10px 30px var(--shadow),inset 0 1px 0 var(--gh);font-size:13px}
.lab .grp{display:flex;align-items:center;gap:4px;flex-wrap:wrap}
.lab .grp>span{color:var(--muted);font-weight:700;margin-inline-end:4px;text-transform:uppercase;letter-spacing:.06em;font-size:11px}
.lab button{font:inherit;font-size:13px;padding:5px 12px;border-radius:999px;border:0;background:transparent;color:var(--fg);cursor:pointer;display:inline-flex;align-items:center;gap:6px}
.lab button .ic{width:14px;height:14px}
.lab button.on{background:var(--acc-fill);color:var(--on-acc)}
.lab button:focus-visible{outline:2px solid var(--acc);outline-offset:2px}
section.flow{padding:32px 0 8px}
section.flow>h2{font-family:var(--display);font-weight:600;font-size:22px;margin:0 0 6px;letter-spacing:-.01em}
section.flow>p{margin:0 0 20px;color:var(--muted);max-width:84ch;font-size:15px}
figure.fr{margin:0 0 48px;min-width:0}
figure.fr .fit{width:calc(var(--sw) * var(--fit,1));height:calc(var(--sh) * var(--fit,1));position:relative}
figure.fr .fit>.scr,figure.fr .fit>.pair{transform:scale(var(--fit,1));transform-origin:0 0;position:absolute;top:0;inset-inline-start:0}
[dir="rtl"] figure.fr .fit>.scr{transform-origin:100% 0}
figure.fr figcaption{font-size:13px;color:var(--muted);margin-top:12px;line-height:1.55;max-width:120ch}
figure.fr figcaption b{color:var(--fg);font-weight:600}
figure.fr figcaption .uc{display:inline-block;font-size:12px;padding:1px 8px;border-radius:999px;background:var(--g1);color:var(--fg);margin-inline-start:4px}
figure.fr figcaption .att{display:inline-flex;gap:10px;font-size:12px;padding:2px 10px;border-radius:999px;background:color-mix(in srgb,var(--ai) 14%,var(--g1));color:var(--fg);margin-inline-start:6px;font-variant-numeric:tabular-nums}
.pair{display:flex;gap:48px;align-items:flex-start}

/* ---- icons and marks ---- */
.ic{width:18px;height:18px;flex:none;stroke-width:1.9;vertical-align:middle}
i.ic{display:inline-block}
svg.mk{fill:none;stroke:none}
svg.mk path:not(.ring){stroke:none}
svg.mk.mono path,[data-hc="high"] svg.mk path{fill:currentColor}
[data-hc="high"] svg.mk rect.fillr{fill:currentColor}
[dir="rtl"] :is(.lucide-arrow-left,.lucide-arrow-right,.lucide-chevron-right,.lucide-chevron-left,.lucide-undo-2,.lucide-redo-2,.lucide-send,.lucide-reply,.lucide-corner-down-right,.lucide-move-right,.lucide-arrow-up-right){transform:scaleX(-1)}

/* ---- the screen ---- */
.scr{position:relative;flex:none;overflow:hidden;border-radius:30px;background:var(--ground);background-color:var(--ground-base);color:var(--fg);font-size:var(--t1);line-height:1.45;isolation:isolate;box-shadow:0 30px 80px var(--shadow)}
.scr.desk{width:1440px;height:900px}
.scr.phone{width:390px;height:844px;border-radius:50px;box-shadow:0 30px 80px var(--shadow),inset 0 0 0 1px var(--gl)}
.scr *{min-width:0}
.scr :focus-visible{outline:2px solid var(--acc);outline-offset:3px}
.stage{position:absolute;inset:0}
/* glass with depth: ground blobs come from the theme; surfaces carry an inner top highlight and a soft lift, never a frame */
.gl{background:var(--g1);border-radius:24px;box-shadow:inset 0 1px 0 var(--gh),0 14px 40px color-mix(in srgb,var(--shadow) 70%,transparent);backdrop-filter:blur(22px) saturate(160%);-webkit-backdrop-filter:blur(22px) saturate(160%)}
.gl.l2{background:var(--g2)}
.gl.l3{background:var(--g3);box-shadow:inset 0 1px 0 var(--gh),0 24px 60px var(--shadow)}
.gl.ai{background:color-mix(in srgb,var(--ai) 13%,var(--g1))}
.mut{color:var(--muted)}
.num{font-variant-numeric:tabular-nums}
.ttl{font-family:var(--display);font-weight:600;letter-spacing:-.012em;line-height:1.2}
.t2{font-size:var(--t2)}.t3{font-size:var(--t3)}.t4{font-size:var(--t4)}.t5{font-size:var(--t5)}
.meta{font-size:13px;color:var(--muted)}
.row{display:flex;align-items:center;gap:10px}
.col{display:flex;flex-direction:column;gap:10px}
.grow{flex:1}
.id{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:13px;color:var(--muted);direction:ltr;unicode-bidi:isolate;white-space:nowrap}

/* ---- the dock: five glyphs folded at the start edge (bottom on the phone), labels on hover only ---- */
.dock{position:absolute;inset-inline-start:16px;top:50%;transform:translateY(-50%);display:flex;flex-direction:column;gap:6px;padding:7px;border-radius:999px;background:var(--g2);backdrop-filter:blur(24px) saturate(160%);-webkit-backdrop-filter:blur(24px) saturate(160%);box-shadow:0 12px 36px var(--shadow),inset 0 1px 0 var(--gh);z-index:30}
.dock .d{width:40px;height:40px;border-radius:50%;display:grid;place-items:center;color:var(--muted);position:relative}
.dock .d .ic{width:20px;height:20px;stroke-width:1.8}
.dock .d.on{background:var(--g3);color:var(--fg);box-shadow:inset 0 1px 0 var(--gh),0 0 0 1.5px color-mix(in srgb,var(--acc) 65%,transparent)}
.dock .d.tk{color:var(--fg)}
.dock .d.tk .mk{width:22px;height:22px}
.dock .d .tip{position:absolute;inset-inline-start:52px;top:50%;transform:translateY(-50%);padding:6px 12px;border-radius:999px;background:var(--g3);box-shadow:0 8px 24px var(--shadow),inset 0 1px 0 var(--gh);font-size:var(--t1);color:var(--fg);white-space:nowrap;font-weight:500}
/* ---- Talk: the shell. Floating at the bottom centre, it never scrolls away ---- */
.talk{position:absolute;bottom:24px;left:50%;transform:translateX(-50%);width:560px;height:56px;border-radius:999px;display:flex;align-items:center;gap:10px;padding:0 9px 0 14px;background:var(--g3);backdrop-filter:blur(28px) saturate(170%);-webkit-backdrop-filter:blur(28px) saturate(170%);box-shadow:0 18px 48px var(--shadow),inset 0 1px 0 var(--gh),0 0 0 1px color-mix(in srgb,var(--ai) 26%,transparent);z-index:30}
[dir="rtl"] .talk{padding:0 14px 0 9px}
.talk .mk{width:26px;height:26px;flex:none}
.talk .q{flex:1;color:var(--muted);font-size:var(--t1);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.talk .q.said{color:var(--fg)}
.talk .tb{width:38px;height:38px;border-radius:50%;display:grid;place-items:center;color:var(--fg);background:var(--g1);box-shadow:inset 0 1px 0 var(--gh);flex:none}
.talk .tb .ic{width:18px;height:18px}
.talk .tb.slash{font-weight:600;font-size:15px;font-family:var(--ui);color:var(--muted)}
/* breadcrumb chip, top start */
.crumbc{position:absolute;top:24px;inset-inline-start:24px;display:flex;align-items:center;gap:8px;padding:7px 16px 7px 8px;border-radius:999px;background:var(--g2);box-shadow:inset 0 1px 0 var(--gh),0 8px 24px color-mix(in srgb,var(--shadow) 60%,transparent);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);font-size:var(--t1);z-index:30;white-space:nowrap}
[dir="rtl"] .crumbc{padding:7px 8px 7px 16px}
.crumbc .mk{width:22px;height:22px}
.crumbc .ic{width:14px;height:14px;color:var(--muted)}
.crumbc span{color:var(--muted)}.crumbc b{font-weight:600}
.tend{position:absolute;top:24px;inset-inline-end:24px;display:flex;gap:8px;z-index:30}
.chip{display:inline-flex;align-items:center;gap:7px;padding:7px 14px;border-radius:999px;background:var(--g2);box-shadow:inset 0 1px 0 var(--gh);font-size:var(--t1);color:var(--fg);white-space:nowrap;line-height:1.3;font-weight:500;backdrop-filter:blur(18px);-webkit-backdrop-filter:blur(18px)}
.chip .ic{width:16px;height:16px}
.chip.quiet{background:transparent;box-shadow:inset 0 0 0 1px var(--line2);backdrop-filter:none}
.chip.back .ic{color:var(--acc)}
.pill{display:inline-flex;align-items:center;justify-content:center;gap:7px;padding:9px 16px;border-radius:999px;font-weight:600;font-size:var(--t1);white-space:nowrap;background:var(--g2);color:var(--fg);box-shadow:inset 0 1px 0 var(--gh);line-height:1.2}
.pill .ic{width:16px;height:16px}
.pill.pri{background:var(--acc-fill);color:var(--on-acc);box-shadow:0 8px 20px color-mix(in srgb,var(--acc) 30%,transparent),inset 0 1px 0 rgba(255,255,255,.3)}
.pill.ai{background:color-mix(in srgb,var(--ai) 22%,var(--g2))}
.pill.ai .mk,.pill.ai .ic{color:var(--ai)}
[data-pt="sky"] .pill.ai .ic{color:var(--ai-ink)}
.pill.sm{padding:6px 12px;font-size:var(--t1)}
/* glyph discs (kind families) */
.g{--h:var(--ai);width:30px;height:30px;border-radius:50%;display:inline-grid;place-items:center;flex:none;background:color-mix(in srgb,var(--h) 22%,transparent);color:var(--h);box-shadow:inset 0 0 0 1px color-mix(in srgb,var(--h) 36%,transparent)}
.g .ic{width:16px;height:16px;stroke-width:2.1}
.g.sm{width:24px;height:24px}.g.sm .ic{width:13px;height:13px}
.g.lg{width:40px;height:40px}.g.lg .ic{width:20px;height:20px}
[data-pt="sky"] .g{color:color-mix(in srgb,var(--h) 66%,#000)}
.g .mk{width:18px;height:18px}
.f-sky{--h:var(--f-sky)}.f-heat{--h:var(--f-heat)}.f-warm{--h:var(--f-warm)}.f-lime{--h:var(--f-lime)}.f-rules{--h:var(--f-rules)}.f-gold{--h:var(--f-gold)}.f-sharp{--h:var(--f-sharp)}.f-violet{--h:var(--f-violet)}.f-drift{--h:var(--f-drift)}.f-slate{--h:var(--f-slate)}.f-lucid{--h:var(--ai)}.f-good{--h:var(--good)}.f-hold{--h:var(--hold-h)}.f-block{--h:var(--block-h)}.f-acc{--h:var(--acc)}
/* place hues (identity): family hues, assigned so neighbours differ */
.h-sky{--h:var(--f-sky)}.h-warm{--h:var(--f-warm)}.h-violet{--h:var(--f-violet)}.h-rules{--h:var(--f-rules)}.h-drift{--h:var(--f-drift)}.h-slate{--h:var(--f-slate)}.h-lime{--h:var(--f-lime)}.h-gold{--h:var(--f-gold)}.h-ai{--h:var(--ai)}
/* avatars and presence */
.av{width:24px;height:24px;border-radius:50%;display:inline-grid;place-items:center;font-weight:600;font-size:11px;color:var(--fg);background:var(--g3);flex:none;position:relative;box-shadow:0 0 0 2px var(--ground-base)}
.av.md{width:32px;height:32px;font-size:13px}.av.lg{width:40px;height:40px;font-size:15px}
.av.p1{background:color-mix(in srgb,var(--acc) 40%,var(--g3))}.av.p2{background:color-mix(in srgb,var(--f-warm) 38%,var(--g3))}.av.p3{background:color-mix(in srgb,var(--f-gold) 34%,var(--g3))}.av.p4{background:color-mix(in srgb,var(--f-lime) 34%,var(--g3))}
.av.ag{background:color-mix(in srgb,var(--ai) 34%,var(--g3));color:var(--fg)}
[data-pt="sky"] .av.ag{color:var(--ai-ink)}
.av.ag .ic{width:60%;height:60%}
.av.s-doing{box-shadow:0 0 0 2px var(--ground-base),0 0 0 4px var(--good)}
.av.s-wait{box-shadow:0 0 0 2px var(--ground-base),0 0 0 4px var(--hold-h)}
.av.s-stop{box-shadow:0 0 0 2px var(--ground-base),0 0 0 4px var(--block-h)}
.avs{display:inline-flex;gap:6px}

/* ---- the world ---- */
.world{position:absolute;overflow:visible}
.world svg.terrain{position:absolute;inset:0;width:100%;height:100%;display:block;overflow:visible}
[dir="rtl"] .world svg.terrain{transform:scaleX(-1)}
.world .ov{position:absolute;inset:0}
.at{position:absolute;transform:translate(-50%,-50%)}
[dir="rtl"] .at{transform:translate(50%,-50%)}
.at.tl{transform:none}
.coast{fill:color-mix(in srgb,var(--fg) 7%,transparent);stroke:color-mix(in srgb,var(--gh) 70%,transparent);stroke-width:1.2}
.shore{fill:none;stroke:color-mix(in srgb,var(--f-sky) 22%,transparent);stroke-width:16;filter:url(#feather)}
[data-pt="sky"] .coast{fill:rgba(255,255,255,.22);stroke:rgba(255,255,255,.95)}
[data-pt="sky"] .shore{stroke:rgba(120,170,255,.22)}
.plc{fill:color-mix(in srgb,var(--fg) 5%,transparent);stroke:color-mix(in srgb,var(--gh) 75%,transparent);stroke-width:1}
[data-pt="sky"] .plc{fill:rgba(255,255,255,.62);stroke:rgba(15,31,58,.16)}
.plc.focus{stroke:color-mix(in srgb,var(--h) 70%,transparent);stroke-width:1.6}
.sub{fill:none;stroke:color-mix(in srgb,var(--fg) 12%,transparent);stroke-width:1}
[data-pt="sky"] .sub{stroke:rgba(15,31,58,.1)}
[data-pt]{--lk:.1}[data-pt="sky"]{--lk:.55}
.light{fill:#fff;fill-opacity:calc(var(--lk) * var(--prog))}
.faded{opacity:.25}
.ambient{opacity:.5}
.heatg{mix-blend-mode:screen}
[data-pt="sky"] .heatg{mix-blend-mode:normal;opacity:.7}
.heatring{fill:none;stroke:var(--f-heat);stroke-opacity:.18;stroke-width:1.2}
.road{fill:none;stroke:var(--ink45);stroke-width:1.6;stroke-linecap:round}
.road.crit{stroke:var(--fg);stroke-opacity:.8;stroke-width:3}
.road.lit{stroke:var(--acc);stroke-opacity:1}
.road.tether{stroke:var(--ink45);stroke-dasharray:3 5;stroke-width:1.4}
.road.cut{stroke-dasharray:none}
.hull{fill:color-mix(in srgb,var(--f-lime) 10%,transparent);stroke:var(--f-lime);stroke-width:2;stroke-linejoin:round;stroke-opacity:.85}
.ghost{fill:none;stroke:var(--ai);stroke-opacity:.6;stroke-width:2;stroke-dasharray:7 6}
/* place marker: the landmark inside its ring, the name beneath */
.place{display:flex;flex-direction:column;align-items:center;gap:8px;text-align:center;--h:var(--f-sky)}
.place .md{position:relative;display:grid;place-items:center;flex:none}
.place .md svg.ring{position:absolute;inset:0}
.place .md .free{display:grid;place-items:center;filter:drop-shadow(0 2px 8px color-mix(in srgb,var(--shadow) 80%,transparent))}
.place .md .free svg.lm{stroke-width:2.2}
.place .md .free::after{content:"";position:absolute;left:24%;right:24%;bottom:22%;height:6px;border-radius:50%;background:radial-gradient(closest-side,color-mix(in srgb,var(--h) 30%,transparent),transparent)}
.place .md .disc{border-radius:50%;display:grid;place-items:center;background:color-mix(in srgb,var(--h) 10%,var(--g1));box-shadow:inset 0 1px 0 var(--gh),0 8px 22px color-mix(in srgb,var(--shadow) 60%,transparent);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px)}
.place .nm{font-family:var(--display);font-weight:600;font-size:var(--t2);letter-spacing:-.01em;white-space:nowrap;text-shadow:0 1px 10px var(--shadow);line-height:1.15}
.place.s .nm{font-size:var(--t1)}
.place.l.s .nm{font-size:var(--t1)}
.place.l .nm{font-size:var(--t3)}
.place .sj{font-size:var(--t1);color:var(--muted);max-width:280px;white-space:normal}
svg.lm{fill:none;stroke:color-mix(in srgb,var(--h) 80%,transparent);stroke-width:2;stroke-linecap:round;stroke-linejoin:round;overflow:visible}
svg.lm path{vector-effect:non-scaling-stroke}
[data-pt="sky"] svg.lm{stroke:color-mix(in srgb,var(--h) 80%,#0b1a3a)}
[data-hc="high"] svg.lm{stroke:var(--fg)}
.ring .trk{fill:none;stroke:var(--ink18)}
.place .ring .val{stroke:color-mix(in srgb,var(--h) 72%,#fff);filter:drop-shadow(0 0 5px color-mix(in srgb,var(--h) 70%,transparent))}
[data-pt="sky"] .place .ring .val{stroke:color-mix(in srgb,var(--h) 85%,#0b1a3a);filter:none}
[data-hc="high"] .place .ring .val{stroke:var(--fg);filter:none}
.place .ring .trk{stroke:color-mix(in srgb,var(--fg) 20%,transparent)}
.ring .val{fill:none;stroke:var(--h);stroke-linecap:round}
[data-pt="sky"] .ring .val{stroke:color-mix(in srgb,var(--h) 85%,#0b1a3a)}
.ring .tick{stroke:var(--fg);stroke-width:2;stroke-linecap:round;opacity:.85}
.ring .seg-met{stroke:var(--good)}.ring .seg-partly{stroke:var(--hold-h)}.ring .seg-open{stroke:var(--ink25)}
[data-hc="high"] .ring .val{stroke:var(--fg)}
/* flags: a banner in Rules indigo; material forks get a larger banner with a two-word label */
.flag{display:inline-flex;align-items:flex-start;gap:0;filter:drop-shadow(0 6px 14px var(--shadow))}
.flag .pole{width:2px;height:40px;border-radius:1px;background:var(--fg);opacity:.7}
.flag .ban{margin-top:2px;padding:6px 18px 6px 12px;background:var(--f-rules);color:#fff;font-weight:600;font-size:var(--t1);white-space:nowrap;clip-path:polygon(0 0,100% 0,calc(100% - 9px) 50%,100% 100%,0 100%);display:flex;align-items:center;gap:6px}
[dir="rtl"] .flag .ban{padding:6px 12px 6px 18px;clip-path:polygon(0 0,100% 0,100% 100%,0 100%,9px 50%)}
.flag .ban .ic{width:15px;height:15px}
[data-pt="sky"] .flag .ban{background:#4d5fd6}
.flag.sm .pole{height:22px}.flag.sm .ban{padding:0;width:16px;height:11px}
/* embassies at the coast */
.emb{display:flex;flex-direction:column;align-items:center;gap:6px}
.emb .e{width:40px;height:40px;border-radius:50%;display:grid;place-items:center;background:var(--g2);box-shadow:inset 0 1px 0 var(--gh),0 0 0 1.5px color-mix(in srgb,var(--f-slate) 55%,transparent),0 8px 20px var(--shadow);color:var(--f-slate)}
[data-pt="sky"] .emb .e{color:#4a5a73}
.emb .e .ic{width:19px;height:19px}
.emb .nm{font-size:var(--t1);color:var(--muted);white-space:nowrap}
.emb.wait .e{box-shadow:inset 0 1px 0 var(--gh),0 0 0 2px var(--hold-h),0 8px 20px var(--shadow)}
/* tooltip */
.tip{padding:10px 14px;border-radius:16px;background:var(--g3);box-shadow:0 14px 36px var(--shadow),inset 0 1px 0 var(--gh);font-size:var(--t1);white-space:nowrap;backdrop-filter:blur(22px);-webkit-backdrop-filter:blur(22px)}
.tip b{font-weight:600}
.tip .meta{display:block;margin-top:2px}
/* buildings: a facade in a rounded building with a 1 px edge; expected = ghost facade; the criteria ring in the top-end corner */
.bld{position:relative;border-radius:14px;padding:4px;background:var(--g2);box-shadow:inset 0 0 0 1px var(--gl),0 10px 26px color-mix(in srgb,var(--shadow) 80%,transparent);flex:none}
.bld .fc{border-radius:10px;overflow:hidden;aspect-ratio:4/3;display:block}
.bld.w16 .fc{aspect-ratio:16/10}
.bld .fc svg{width:100%;height:100%;display:block}
.bld::after{content:"";position:absolute;left:10%;right:10%;bottom:-12px;height:12px;border-radius:50%;background:radial-gradient(closest-side,color-mix(in srgb,var(--shadow) 90%,transparent),transparent);z-index:-1}
.bld.exp{background:transparent;box-shadow:none;outline:1.5px dashed var(--ink60);outline-offset:-1px}
.bld.exp .fc{opacity:.45}
.bld.exp::after{opacity:.4}
.bld .cr{position:absolute;top:-9px;inset-inline-end:-9px;width:22px;height:22px;border-radius:50%;background:var(--g3);box-shadow:0 3px 10px var(--shadow)}
.bld .cr svg{width:22px;height:22px;display:block}
.bld.kind{width:52px;height:52px;border-radius:16px;display:grid;place-items:center;padding:0}
.bld.kind::after{bottom:-10px}
.bld.done{box-shadow:inset 0 0 0 1.5px color-mix(in srgb,var(--good) 70%,transparent),0 10px 26px color-mix(in srgb,var(--shadow) 80%,transparent)}
.bld.lit{box-shadow:inset 0 0 0 2px var(--acc),0 14px 34px var(--shadow)}
.barrier{width:28px;height:28px;border-radius:50%;display:grid;place-items:center;background:var(--g3);color:var(--fg);box-shadow:0 0 0 1.5px var(--ink45),0 6px 14px var(--shadow)}
.barrier .ic{width:16px;height:16px}
.barrier.breach{background:var(--block-h);color:#fff;box-shadow:0 0 0 4px color-mix(in srgb,var(--block-h) 30%,transparent)}
.cont{display:inline-flex;align-items:center;gap:6px;font-size:var(--t1);font-weight:600;padding:6px 12px;border-radius:999px;background:color-mix(in srgb,var(--f-lime) 20%,var(--g2));box-shadow:inset 0 1px 0 var(--gh);white-space:nowrap}
.cont .ic{width:16px;height:16px}
/* needs-you cards: 320 x 200 */
.ny{width:320px;height:200px;padding:16px 16px 16px 16px;display:flex;flex-direction:column;gap:14px;border-radius:26px}
.ny .q{font-family:var(--display);font-weight:600;font-size:var(--t2);line-height:1.25;letter-spacing:-.01em}
.ny .vis{width:150px;height:96px;border-radius:14px;overflow:hidden;flex:none;position:relative;background:var(--g1);box-shadow:inset 0 0 0 1px var(--gl)}
.ny .vis svg{width:100%;height:100%;display:block}
.ny .opts{display:flex;flex-direction:column;gap:8px;flex:1;justify-content:center}
.ny .opts .pill{padding:9px 10px;font-size:var(--t1)}
/* horizon */
.hz-line{position:absolute;left:0;right:0;height:2px;background:linear-gradient(90deg,transparent,color-mix(in srgb,var(--gh) 90%,transparent) 20%,color-mix(in srgb,var(--mk-b) 70%,transparent) 50%,color-mix(in srgb,var(--gh) 90%,transparent) 80%,transparent)}
.hz-glow{position:absolute;left:0;right:0;height:180px;background:radial-gradient(60% 100% at 50% 100%,color-mix(in srgb,var(--mk-b) 18%,transparent),transparent 70%);pointer-events:none}
.goalr{display:flex;flex-direction:column;align-items:center;gap:10px;--h:var(--f-gold)}
.goalr .nm{font-size:var(--t1);font-weight:600;white-space:nowrap}
.since{display:inline-flex;align-items:center;gap:12px;padding:10px 18px;border-radius:999px;font-size:var(--t1);white-space:nowrap}
.since .ic{width:16px;height:16px;color:var(--muted)}
.since i.sep{width:4px;height:4px;border-radius:50%;background:var(--ink45);display:inline-block}
/* aspect panel docked at the end edge */
.aspect{position:absolute;top:88px;bottom:104px;inset-inline-end:24px;width:400px;padding:24px;display:flex;flex-direction:column;gap:28px;z-index:20}
.aspect .hd{display:flex;align-items:center;gap:10px}
.chart .say{font-size:var(--t2);font-weight:600;line-height:1.3;letter-spacing:-.005em}
.chart .now{display:flex;align-items:baseline;gap:8px;margin-top:6px}
.chart .now b{font-size:var(--t4);font-weight:600;letter-spacing:-.02em}
.chart svg{display:block;width:100%;overflow:visible}
.chart .ax{fill:var(--muted);font-size:13px;font-family:var(--ui);font-variant-numeric:tabular-nums}
.chart .lbl{fill:var(--fg);font-size:13px;font-family:var(--ui);font-weight:600}
.chart .grid{stroke:var(--line);stroke-width:1}
.chart .base{stroke:var(--line2);stroke-width:1}
/* chart colours (validated with the dataviz validator against the panel surfaces): Market series, Delivery ordinal ramp */
[data-pt]{--cv-mkt:#d79bff;--cv-p:#3aa6e6;--cv-d:#7fcdf7;--cv-n:#c9ebff}
[data-pt="sky"]{--cv-mkt:#a94ae6;--cv-p:#5fbdf0;--cv-d:#1c8fd6;--cv-n:#0b5d93}
[data-hc="high"]{--cv-mkt:var(--fg)}
[data-pt="deep"]{--ca1:#3fae9e;--ca2:#7fdccd;--ca3:#c4f6ee}[data-pt="aqua"]{--ca1:#a988ee;--ca2:#cdb4ff;--ca3:#efe6ff}[data-pt="sky"]{--ca1:#4cc2b2;--ca2:#0f9d8a;--ca3:#075a4f}
/* v0.2 kit: cut-outs, sheets, paths with stations, haze, strips, consequence panels */
.cut{position:relative;overflow:hidden;border-radius:18px;background:color-mix(in srgb,var(--fg) 4%,transparent);box-shadow:inset 0 0 0 1px var(--gl)}
.cut>.inner{position:absolute;left:0;top:0;width:1440px;height:900px;transform-origin:0 0}
.haze{position:absolute;inset:0;border-radius:inherit;pointer-events:none;background:radial-gradient(120% 90% at 50% 40%,transparent 30%,color-mix(in srgb,var(--fg) calc(var(--hz) * 1%),transparent) 100%);backdrop-filter:blur(calc(var(--hz) * .035px));-webkit-backdrop-filter:blur(calc(var(--hz) * .035px))}
.datec{display:inline-flex;align-items:center;gap:6px;padding:5px 12px;border-radius:999px;background:var(--g3);box-shadow:0 6px 16px var(--shadow),inset 0 1px 0 var(--gh);font-size:var(--t1);font-weight:600;white-space:nowrap;font-variant-numeric:tabular-nums}
.datec s{color:var(--muted);font-weight:500;text-decoration-thickness:1.5px}
.datec .ic{width:15px;height:15px;color:var(--muted)}
.datec.ai{box-shadow:0 6px 16px var(--shadow),inset 0 0 0 1.5px color-mix(in srgb,var(--ai) 70%,transparent)}
.strip{display:flex;align-items:center;gap:12px;flex-wrap:wrap;padding:12px 20px;border-radius:999px;font-size:var(--t1)}
.strip .ic{width:16px;height:16px;color:var(--muted)}
.strip i.sep{width:4px;height:4px;border-radius:50%;background:var(--ink45);display:inline-block}
.station{width:30px;height:30px;border-radius:50%;display:grid;place-items:center;background:var(--g2);box-shadow:inset 0 0 0 2px var(--ink25);color:var(--muted)}
.station .ic{width:15px;height:15px}
.station.done{background:color-mix(in srgb,var(--good) 26%,var(--g2));box-shadow:inset 0 0 0 2px var(--good);color:var(--fg)}
.station.now{width:40px;height:40px;background:var(--acc-fill);color:var(--on-acc);box-shadow:0 0 0 6px color-mix(in srgb,var(--acc) 25%,transparent),0 8px 20px var(--shadow)}
.station.ai.now{background:color-mix(in srgb,var(--ai) 80%,#000);color:#fff;box-shadow:0 0 0 6px color-mix(in srgb,var(--ai) 25%,transparent)}
.stlab{font-size:var(--t1);white-space:nowrap;color:var(--muted)}
.stlab.now{color:var(--fg);font-weight:600}
.conseq{width:300px;padding:18px;border-radius:24px;display:flex;flex-direction:column;gap:12px}
.conseq.lit{box-shadow:inset 0 0 0 2px var(--acc),0 0 0 6px color-mix(in srgb,var(--acc) 18%,transparent),0 20px 50px var(--shadow)}
.conf{display:flex;align-items:center;gap:8px;font-size:var(--t1);color:var(--muted)}
.conf .m{width:90px;height:6px;border-radius:3px;background:var(--ink18);position:relative;overflow:hidden}
.conf .m i{position:absolute;inset-block:0;inset-inline-start:0;border-radius:3px;background:var(--fg);opacity:.75}
.daci{display:flex;gap:14px;align-items:center;flex-wrap:wrap}
.daci .r{display:flex;align-items:center;gap:6px;font-size:13px;color:var(--muted)}
.daci .r b{color:var(--fg);font-weight:600;font-size:var(--t1)}
.cardx{border-radius:24px;padding:20px;display:flex;flex-direction:column;gap:12px}
.lbl2{font-size:13px;color:var(--muted);text-transform:uppercase;letter-spacing:.06em;font-weight:600}
.gauge{display:flex;flex-direction:column;align-items:center;gap:6px;text-align:center}
.tree{display:flex;flex-direction:column;gap:2px;font-size:var(--t1)}
.tree .tr{display:flex;align-items:center;gap:10px;padding:6px 14px;border-radius:14px}
.tree .tr.focus{background:var(--g2);box-shadow:inset 0 0 0 2px var(--acc)}
.tree .tr .lmx{width:16px;height:16px;flex:none}
.bubble{max-width:520px;padding:12px 16px;border-radius:22px;font-size:var(--t1);line-height:1.45}
.bubble.in{background:var(--g2);border-end-start-radius:8px;box-shadow:inset 0 1px 0 var(--gh)}
.bubble.out{background:var(--acc-fill);color:var(--on-acc);border-end-end-radius:8px;margin-inline-start:auto}
/* the horizon world: the company seen from above the horizon, ambient */
.tiltwrap{position:absolute;inset:0;opacity:.6;-webkit-mask-image:linear-gradient(180deg,transparent 0,transparent 52%,#000 64%);mask-image:linear-gradient(180deg,transparent 0,transparent 52%,#000 64%)}
.tilt{position:absolute;left:0;top:0;width:1440px;height:900px;transform-style:preserve-3d}
.tilt .world,.tilt .ov{transform-style:preserve-3d}
.tilt .at.pm{transform:translate(-50%,-78%) rotateX(calc(-1 * var(--tx)));transform-origin:50% 100%}
[dir="rtl"] .tilt .at.pm{transform:translate(50%,-78%) rotateX(calc(-1 * var(--tx)))}
.still{position:absolute;border-radius:28px;overflow:hidden}
.still .cap{position:absolute;left:0;right:0;bottom:18px;text-align:center}
/* instrument sheet (board) */
.sheet{position:absolute;border-radius:30px;padding:28px;display:flex;flex-direction:column;gap:20px;z-index:20}
.dim{position:absolute;inset:0;background:color-mix(in srgb,var(--ground-base) 45%,transparent);z-index:10}
.kcol{display:flex;flex-direction:column;gap:12px;min-width:0}
.kcol .kh{display:flex;align-items:center;gap:8px;font-weight:600;font-size:var(--t1);padding:0 4px}
.kcard{border-radius:18px;background:var(--g2);box-shadow:inset 0 1px 0 var(--gh);padding:10px;display:flex;gap:12px;align-items:center}
.kcard .th{width:64px;height:48px;border-radius:10px;overflow:hidden;flex:none;box-shadow:inset 0 0 0 1px var(--gl)}
.kcard .th svg{width:100%;height:100%;display:block}
.kcard .tt{font-size:var(--t1);font-weight:500;line-height:1.3}
.seg{display:inline-flex;padding:4px;border-radius:999px;background:var(--g1);box-shadow:inset 0 1px 0 var(--gh);gap:2px}
.seg>span{display:inline-flex;align-items:center;gap:6px;padding:6px 14px;border-radius:999px;font-size:var(--t1)}
.seg>span.on{background:var(--acc-fill);color:var(--on-acc);font-weight:600}
.seg>span .ic{width:16px;height:16px}
/* product view */
.pv[data-auto]{height:auto!important}
.pv{position:absolute;border-radius:32px;z-index:20;display:grid;gap:32px;padding:32px}
.cmp{position:relative;border-radius:22px;overflow:hidden;box-shadow:inset 0 0 0 1px var(--gl),0 18px 44px var(--shadow)}
.cmp .side{position:absolute;inset:0;display:grid;place-items:center}
.cmp .split{position:absolute;top:0;bottom:0;width:2px;background:#fff;box-shadow:0 0 0 1px rgba(0,0,0,.15),0 0 18px rgba(0,0,0,.35)}
.cmp .knob{position:absolute;top:50%;width:44px;height:44px;margin:-22px 0 0 -22px;border-radius:50%;background:#fff;color:#0b1a3a;display:grid;place-items:center;box-shadow:0 8px 20px rgba(0,0,0,.35)}
.cmp .knob .ic{width:20px;height:20px}
.cmp .tag{position:absolute;top:16px;padding:6px 12px;border-radius:999px;font-size:var(--t1);font-weight:600;background:rgba(10,20,45,.55);color:#fff;backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);display:inline-flex;gap:6px;align-items:center}
.cmp .tag .ic{width:15px;height:15px}
.diffmark{position:absolute;border-radius:14px;border:2px solid var(--hold-h);box-shadow:0 0 0 4px color-mix(in srgb,var(--hold-h) 25%,transparent)}
.line1{display:flex;gap:12px;align-items:flex-start;font-size:var(--t2);line-height:1.4}
.line1 .g{margin-top:-2px}
.ctx{display:flex;flex-wrap:wrap;gap:8px}
.ctx .chip{font-size:var(--t1)}
.say{display:flex;gap:12px;align-items:flex-start}
.say .bub{border-radius:20px;padding:10px 14px;background:var(--g1);box-shadow:inset 0 1px 0 var(--gh);font-size:var(--t1);line-height:1.45}
.say .bub.ai{background:color-mix(in srgb,var(--ai) 14%,var(--g1))}
.say .who{font-weight:600;margin-inline-end:6px}
.pop{position:absolute;width:300px;padding:16px;border-radius:20px;z-index:25;display:flex;flex-direction:column;gap:10px}
.pop::before{content:"";position:absolute;width:14px;height:14px;background:inherit;transform:rotate(45deg);border-radius:3px}
/* phone */
.phone .sb{position:absolute;top:0;left:0;right:0;display:flex;justify-content:space-between;align-items:center;padding:16px 30px 0;font-size:15px;font-weight:600;z-index:40}
.phone .sb .ic{width:16px;height:16px}
.phone .homebar{position:absolute;bottom:8px;left:50%;width:134px;height:5px;border-radius:3px;background:var(--fg);opacity:.55;transform:translateX(-50%);z-index:41}
.phone .dock{top:auto;bottom:26px;transform:none;inset-inline:12px;flex-direction:row;align-items:center;justify-content:space-between;padding:6px;gap:4px}
.phone .dock .d{width:40px;height:40px}
.phone .dock .talkp{flex:1;height:44px;border-radius:999px;display:flex;align-items:center;gap:8px;padding:0 6px 0 10px;background:var(--g3);box-shadow:inset 0 1px 0 var(--gh),0 0 0 1px color-mix(in srgb,var(--ai) 30%,transparent);color:var(--muted);font-size:var(--t1)}
[dir="rtl"] .phone .dock .talkp{padding:0 10px 0 6px}
.phone .dock .talkp .mk{width:22px;height:22px}
.phone .dock .talkp .tb{width:34px;height:34px;border-radius:50%;display:grid;place-items:center;background:var(--g1);color:var(--fg);margin-inline-start:auto}
.phone .crumbc{top:56px;inset-inline-start:16px}
/* high contrast */
[data-hc="high"] .scr *,[data-hc="high"] .scr,.scr[data-hc="high"] *{backdrop-filter:none!important;-webkit-backdrop-filter:none!important}
.scr[data-hc="high"] :is(.gl,.chip,.pill,.dock,.talk,.crumbc,.tip,.bld,.ny .vis,.emb .e){box-shadow:inset 0 0 0 1px var(--gl)!important}
.scr[data-hc="high"] .plc{fill:var(--g1);stroke:var(--gl);stroke-width:1.5}.scr[data-hc="high"] .coast{fill:none;stroke:var(--gl)}.scr[data-hc="high"] :is(.shore,.heatg,.wash,.light,.hz-glow){display:none}.scr[data-hc="high"] svg.lm{stroke:var(--fg)}.scr[data-hc="high"] .place .ring .val{stroke:var(--fg);filter:none}.scr[data-hc="high"] .sub{stroke:color-mix(in srgb,var(--fg) 28%,transparent)}.scr[data-hc="high"] .tiltwrap{opacity:.85}
[data-hc="high"] :is(.gl,.chip,.pill,.dock,.talk,.crumbc,.tip,.bld,.kcard,.seg,.emb .e,.place .md .disc,.ny .vis,.say .bub,.barrier){box-shadow:inset 0 0 0 1px var(--gl)!important}
[data-hc="high"] .pill.pri{box-shadow:inset 0 0 0 2px var(--fg)!important}
[data-hc="high"] .plc{fill:var(--g1);stroke:var(--gl);stroke-width:1.5}
[data-hc="high"] .coast{fill:none;stroke:var(--gl)}
[data-hc="high"] .shore,[data-hc="high"] .heatg,[data-hc="high"] .wash,[data-hc="high"] .light{display:none}
[data-hc="high"] .sub{stroke:color-mix(in srgb,var(--fg) 28%,transparent);stroke-width:.9}
[lang="he"],[lang="he"] .ttl,[lang="he"] .place .nm{font-family:var(--he)}
`;
