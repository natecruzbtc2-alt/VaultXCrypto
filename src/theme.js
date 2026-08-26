export const C = {
  bg:"#0a0a0a", bg2:"#111111", bg3:"#1a1a1a",
  card:"rgba(255,200,0,.04)", border:"rgba(255,200,0,.18)", border2:"rgba(255,200,0,.08)",
  purple:"#ffc800", purple2:"#e6b400", purple3:"#ffd633", accent:"#ffaa00",
  text:"#ffffff", text2:"#c8c8c8", text3:"#707070",
  green:"#22c55e", red:"#ef4444", gold:"#ffc800",
  red3:"#ffc800",
};

export const S = {
  app:  { fontFamily:"'DM Sans',system-ui,sans-serif", background:"#0a0a0a", color:C.text, minHeight:"100vh", fontSize:14, lineHeight:1.5 },
  nav:  { background:"rgba(10,10,10,.92)", backdropFilter:"blur(24px)", borderBottom:`1px solid ${C.border}`, padding:"0 24px", height:62, display:"flex", alignItems:"center", justifyContent:"space-between", position:"sticky", top:0, zIndex:100 },
  logo: { display:"flex", alignItems:"center", gap:10, fontSize:17, fontWeight:800, letterSpacing:"-.5px", cursor:"pointer", textTransform:"uppercase", color:C.text },
  logoMark: { width:38, height:38, background:`linear-gradient(135deg,#e6b400,#ffd633)`, borderRadius:10, display:"flex", alignItems:"center", justifyContent:"center", fontSize:14, fontWeight:900, color:"#0a0a0a", boxShadow:`0 0 28px rgba(255,200,0,.5)` },
  ticker: { background:"rgba(17,17,17,.9)", borderBottom:`1px solid ${C.border2}`, padding:"7px 0", overflow:"hidden", whiteSpace:"nowrap" },
  card: { background:`linear-gradient(160deg,rgba(255,200,0,.06),rgba(255,200,0,.01))`, border:`1px solid ${C.border}`, borderRadius:16, padding:20, boxShadow:`0 4px 30px rgba(0,0,0,.5), inset 0 1px 0 rgba(255,200,0,.1)` },
  scard: { background:`rgba(255,200,0,.04)`, border:`1px solid ${C.border2}`, borderRadius:12, padding:16 },
  sidebar: { width:220, background:"rgba(10,10,10,.8)", borderRight:`1px solid ${C.border2}`, padding:"16px 10px", display:"flex", flexDirection:"column", gap:3, flexShrink:0 },
  sitem: (act) => ({ display:"flex", alignItems:"center", gap:10, padding:"10px 14px", borderRadius:8, cursor:"pointer", fontSize:13, color:act?"#0a0a0a":C.text2, background:act?`#ffc800`:"transparent", fontWeight:act?700:400, border:"none", borderLeft:act?"3px solid #ffc800":"3px solid transparent", width:"100%", textAlign:"left", fontFamily:"inherit", transition:"all .15s" }),
  hd:   { fontSize:22, fontWeight:700, marginBottom:4, color:C.text },
  sub:  { fontSize:13, color:C.text3, marginBottom:20 },
  label:{ fontSize:11, color:C.text3, textTransform:"uppercase", letterSpacing:".06em", marginBottom:6, display:"block" },
  inp:  { background:`rgba(255,255,255,.05)`, border:`1px solid rgba(255,200,0,.2)`, color:C.text, padding:"11px 14px", borderRadius:10, fontSize:14, width:"100%", fontFamily:"inherit", outline:"none", boxSizing:"border-box", transition:"border-color .15s" },
  sel:  { background:`#111111`, border:`1px solid rgba(255,200,0,.2)`, color:C.text, padding:"11px 14px", borderRadius:10, fontSize:14, width:"100%", fontFamily:"inherit", outline:"none", boxSizing:"border-box", cursor:"pointer" },
  tag:  (c) => ({ display:"inline-flex", alignItems:"center", padding:"3px 10px", borderRadius:6, fontSize:11, fontWeight:600,
    background: c==="green"?"rgba(34,197,94,.12)":c==="red"?"rgba(239,68,68,.12)":c==="yellow"?"rgba(255,200,0,.14)":c==="purple"?"rgba(255,200,0,.14)":"rgba(255,255,255,.06)",
    color: c==="green"?C.green:c==="red"?C.red:c==="yellow"?C.gold:c==="purple"?C.gold:C.text2,
    whiteSpace:"nowrap",
  }),
  tbl:  { width:"100%", borderCollapse:"collapse" },
  th:   { padding:"10px 16px", textAlign:"left", fontSize:11, color:C.text3, textTransform:"uppercase", letterSpacing:".06em", fontWeight:500, borderBottom:`1px solid ${C.border2}`, background:`rgba(255,200,0,.03)`, whiteSpace:"nowrap" },
  td:   { padding:"13px 16px", fontSize:13, borderBottom:`1px solid ${C.border2}`, color:C.text2, verticalAlign:"middle" },
  authBox: { background:`linear-gradient(160deg,#141414,#0a0a0a)`, border:`1px solid ${C.border}`, borderRadius:20, padding:36, width:440, maxWidth:"95vw", boxShadow:`0 20px 80px rgba(0,0,0,.7), 0 0 60px rgba(255,200,0,.08)` },
  modal:   { position:"fixed", inset:0, background:"rgba(0,0,0,.85)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:200, backdropFilter:"blur(8px)" },
  modalBox:{ background:`linear-gradient(160deg,#161616,#0d0d0d)`, border:`1px solid ${C.border}`, borderRadius:20, padding:30, width:460, maxWidth:"95vw", boxShadow:`0 20px 80px rgba(0,0,0,.7)` },
  g2: { display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 },
  g3: { display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:14 },
  g4: { display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14 },
  row:  { display:"flex", alignItems:"center", gap:8 },
  rowsb:{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:8, flexWrap:"wrap" },
  ldot: { width:7, height:7, borderRadius:"50%", background:C.green, display:"inline-block", marginRight:5, boxShadow:`0 0 6px ${C.green}` },
};

export const btn = (v="primary") => ({
  cursor:"pointer", fontFamily:"'DM Sans',system-ui,sans-serif", fontSize:13, fontWeight:700, borderRadius:10,
  padding:"10px 20px", border:"none", display:"inline-flex", alignItems:"center", justifyContent:"center", gap:8,
  background:
    v==="primary" ? `linear-gradient(135deg,#e6b400,#ffd633)` :
    v==="danger"  ? `linear-gradient(135deg,#b91c1c,#ef4444)` :
    v==="success" ? `linear-gradient(135deg,#15803d,#22c55e)` :
    v==="ghost"   ? `rgba(255,200,0,.08)` : `rgba(255,200,0,.08)`,
  color: v==="primary" ? "#0a0a0a" : v==="ghost" ? C.text2 : "#fff",
  outline: v==="ghost" ? `1px solid rgba(255,200,0,.25)` : "none",
  boxShadow: v==="primary" ? `0 4px 24px rgba(255,200,0,.4)` : v==="success" ? `0 4px 16px rgba(34,197,94,.2)` : "none",
  transition:"filter .15s,transform .1s",
  minHeight:38, whiteSpace:"nowrap", userSelect:"none",
});

export const globalCSS = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;0,9..40,800&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html, body, #root { height: 100%; background: #0a0a0a; }
  body { overflow-x: hidden; }
  select { appearance: none; -webkit-appearance: none; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%23707070' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 12px center; padding-right: 36px !important; }
  option { background: #111111 !important; color: #ffffff !important; padding: 8px; }
  input[type=number]::-webkit-inner-spin-button, input[type=number]::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
  input:focus, select:focus, textarea:focus { border-color: #ffc800 !important; box-shadow: 0 0 0 3px rgba(255,200,0,.15) !important; outline: none !important; }
  button:hover { filter: brightness(1.1); }
  button:active { transform: scale(.97); }
  ::-webkit-scrollbar { width: 5px; height: 5px; }
  ::-webkit-scrollbar-track { background: #0a0a0a; }
  ::-webkit-scrollbar-thumb { background: rgba(255,200,0,.3); border-radius: 10px; }
  tr:hover td { background: rgba(255,200,0,.03) !important; transition: background .1s; }
  .vx-glow { animation: vxGlow 3s ease-in-out infinite alternate; }
  @keyframes vxGlow { from { box-shadow: 0 0 20px rgba(255,200,0,.3); } to { box-shadow: 0 0 40px rgba(255,200,0,.6); } }
  @media(max-width:768px){
    .vx-sidebar { display:none !important; }
    .vx-dash-body { flex-direction:column !important; }
    .vx-dash-main { padding:16px !important; padding-bottom:72px !important; }
    .vx-ticker { display:none !important; }
    .hide-mobile { display:none !important; }
    .vx-mobile-nav { display:flex !important; }
  }
  .vx-mobile-nav {
    display:none; position:fixed; bottom:0; left:0; right:0;
    background:rgba(10,10,10,.95); border-top:1px solid rgba(255,200,0,.12);
    padding:8px 4px 12px; z-index:50; justify-content:space-around; align-items:center;
    backdrop-filter:blur(20px);
  }
  .vx-mobile-nav-btn {
    display:flex; flex-direction:column; align-items:center; gap:3px;
    padding:6px 10px; border-radius:8px; border:none; background:none;
    color:#505050; font-size:10px; font-family:inherit; cursor:pointer; font-weight:500; min-width:52px;
  }
  .vx-mobile-nav-btn.active { color:#ffc800; }
  .vx-mobile-nav-btn .icon { font-size:20px; line-height:1; }
`;
