import { useState, useCallback } from "react";
import { useApp, usePrices, COINS, fmt, createHoldings, createStaking } from "./AppContext";
import { C, S, btn, globalCSS } from "./theme";
import { TickerBar, Spark } from "./components";
import CryptoBackground from "./CryptoBackground";
import { Footer } from "./Pages";

// ── LANDING ───────────────────────────────────────────────────────────────────
export function LandingPage() {
  const { setView } = useApp();
  const prices = usePrices();

  const features = [
    { icon:"📈", t:"Live Trading",        d:"Real-time charts with buy/sell orders across 8 major coins." },
    { icon:"🔐", t:"Bank-Grade Security", d:"Hashed passwords, anti-phishing codes and rate limiting." },
    { icon:"💼", t:"Portfolio Tracking",  d:"Full P&L, allocation breakdowns and transaction history." },
    { icon:"⚡", t:"Instant Execution",   d:"Orders execute at market price with 0.10% fee." },
    { icon:"🌍", t:"Global Access",       d:"Trade from anywhere. Mobile optimised." },
    { icon:"💬", t:"24/7 Live Support",   d:"Real agents available around the clock." },
  ];

  const testimonials = [
    { name:"James H.", loc:"London, UK",   text:"VaultX is the cleanest crypto platform I've used. Deposits are instant and support is exceptional.", stars:5 },
    { name:"Sarah M.", loc:"Toronto, CA",  text:"Made my first trade within 5 minutes of signing up. The interface is incredibly intuitive.", stars:5 },
    { name:"David K.", loc:"Sydney, AU",   text:"I've used Coinbase and Binance. VaultX beats them both on simplicity and customer service.", stars:5 },
  ];

  return (
    <div style={{ ...S.app, position:"relative", overflow:"hidden" }}>
      <CryptoBackground />
      <style>{globalCSS}</style>
      <div style={{ position:"relative", zIndex:1 }}>

        {/* NAV */}
        <nav style={S.nav}>
          <div style={S.logo}>
            <div style={S.logoMark}>V</div>
            <span>VaultX</span>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:8 }} className="hide-mobile">
            {["about","contact"].map(p => (
              <button key={p} onClick={() => setView(p)} style={{ background:"none", border:"none", color:C.text2, cursor:"pointer", fontSize:14, padding:"6px 14px", borderRadius:8, fontFamily:"inherit", textTransform:"capitalize", transition:"color .15s" }}
                onMouseEnter={e=>e.target.style.color=C.gold} onMouseLeave={e=>e.target.style.color=C.text2}>
                {p.charAt(0).toUpperCase()+p.slice(1)}
              </button>
            ))}
          </div>
          <div style={S.row}>
            <button style={{ ...btn("ghost"), padding:"8px 18px" }} onClick={() => setView("login")}>Sign In</button>
            <button style={{ ...btn("primary"), padding:"8px 18px" }} onClick={() => setView("register")}>Get Started</button>
          </div>
        </nav>

        <TickerBar />

        {/* HERO */}
        <section style={{ textAlign:"center", padding:"clamp(60px,8vw,120px) 24px clamp(40px,6vw,80px)", maxWidth:900, margin:"0 auto" }}>
          <div style={{ display:"inline-flex", alignItems:"center", gap:8, background:"rgba(255,200,0,.08)", border:"1px solid rgba(255,200,0,.2)", borderRadius:24, padding:"6px 18px", fontSize:12, color:C.gold, fontWeight:600, marginBottom:28, letterSpacing:".03em" }}>
            <span style={S.ldot}/>
            Live · Real-time prices · UK Regulated · FCA Registered
          </div>

          <h1 style={{ fontSize:"clamp(40px,7vw,82px)", fontWeight:800, letterSpacing:"-3px", lineHeight:1.02, marginBottom:20, color:"#fff" }}>
            Trade crypto<br/>
            <span style={{ background:"linear-gradient(135deg,#e6b400,#ffd633)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>
              like a professional.
            </span>
          </h1>

          <p style={{ fontSize:"clamp(15px,2.2vw,19px)", color:C.text2, maxWidth:560, margin:"0 auto 36px", lineHeight:1.75 }}>
            Real-time markets, portfolio management and instant transfers — the platform serious traders choose.
          </p>

          <div style={{ display:"flex", justifyContent:"center", gap:14, flexWrap:"wrap", marginBottom:20 }}>
            <button style={{ ...btn("primary"), padding:"14px 38px", fontSize:15, borderRadius:12 }} onClick={() => setView("register")}>
              Open Free Account →
            </button>
            <button style={{ ...btn("ghost"), padding:"14px 32px", fontSize:15, borderRadius:12 }} onClick={() => setView("login")}>
              Sign In
            </button>
          </div>

          <div style={{ display:"flex", justifyContent:"center", alignItems:"center", gap:20, flexWrap:"wrap" }}>
            {["🔒 No hidden fees","⚡ Instant execution","🏢 UK Regulated","💬 24/7 Support"].map((t,i) => (
              <span key={i} style={{ fontSize:12, color:C.text3 }}>{t}</span>
            ))}
          </div>
        </section>

        {/* STATS */}
        <section style={{ borderTop:`1px solid ${C.border2}`, borderBottom:`1px solid ${C.border2}`, background:"rgba(255,200,0,.02)" }}>
          <div style={{ maxWidth:1000, margin:"0 auto", display:"grid", gridTemplateColumns:"repeat(4,1fr)" }}>
            {[{v:"$2.4T",l:"Market Cap"},{v:"50K+",l:"Active Traders"},{v:"0.10%",l:"Trading Fee"},{v:"24/7",l:"Live Support"}].map((s,i) => (
              <div key={i} style={{ textAlign:"center", padding:"28px 20px", borderRight:i<3?`1px solid ${C.border2}`:"none" }}>
                <div style={{ fontSize:"clamp(26px,4vw,38px)", fontWeight:800, color:C.gold, letterSpacing:"-1px", marginBottom:4 }}>{s.v}</div>
                <div style={{ fontSize:13, color:C.text3 }}>{s.l}</div>
              </div>
            ))}
          </div>
        </section>

        {/* LIVE PRICES */}
        <section style={{ maxWidth:1100, margin:"72px auto", padding:"0 24px" }}>
          <div style={{ textAlign:"center", marginBottom:40 }}>
            <h2 style={{ fontSize:"clamp(24px,4vw,40px)", fontWeight:800, letterSpacing:"-1.5px", color:"#fff", marginBottom:10 }}>Live Markets</h2>
            <p style={{ fontSize:15, color:C.text2 }}>Prices update every 2.5 seconds</p>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(210px,1fr))", gap:12 }}>
            {COINS.slice(0,8).map(coin => {
              const p = prices[coin.sym] || { price:0, change:0, spark:[] };
              const up = p.change >= 0;
              return (
                <div key={coin.sym} style={{ ...S.card, cursor:"pointer", transition:"all .2s" }}
                  onClick={() => setView("register")}
                  onMouseEnter={e=>e.currentTarget.style.borderColor="rgba(255,200,0,.5)"}
                  onMouseLeave={e=>e.currentTarget.style.borderColor=C.border}>
                  <div style={{ ...S.rowsb, marginBottom:10 }}>
                    <div>
                      <div style={{ fontWeight:700, fontSize:15, color:"#fff" }}>{coin.sym}</div>
                      <div style={{ fontSize:11, color:C.text3 }}>{coin.name}</div>
                    </div>
                    <span style={{ ...S.tag(up?"green":"red"), fontSize:11 }}>{up?"+":""}{fmt(p.change)}%</span>
                  </div>
                  <div style={{ fontSize:19, fontWeight:700, color:"#fff", marginBottom:8 }}>
                    ${p.price<1?p.price.toFixed(4):fmt(p.price)}
                  </div>
                  <Spark data={p.spark} color={up?C.gold:C.red} w={130} h={32}/>
                </div>
              );
            })}
          </div>
        </section>

        {/* FEATURES */}
        <section style={{ maxWidth:1100, margin:"72px auto", padding:"0 24px" }}>
          <div style={{ textAlign:"center", marginBottom:48 }}>
            <h2 style={{ fontSize:"clamp(24px,4vw,40px)", fontWeight:800, letterSpacing:"-1.5px", color:"#fff", marginBottom:10 }}>Everything you need</h2>
            <p style={{ fontSize:15, color:C.text2 }}>Built for traders who demand speed, reliability and clarity.</p>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))", gap:14 }}>
            {features.map((f,i) => (
              <div key={i} style={{ ...S.card, transition:"all .2s" }}
                onMouseEnter={e=>{e.currentTarget.style.borderColor="rgba(255,200,0,.4)";}}
                onMouseLeave={e=>{e.currentTarget.style.borderColor=C.border;}}>
                <div style={{ fontSize:26, marginBottom:12 }}>{f.icon}</div>
                <div style={{ fontSize:15, fontWeight:700, color:"#fff", marginBottom:6 }}>{f.t}</div>
                <div style={{ fontSize:13, color:C.text2, lineHeight:1.7 }}>{f.d}</div>
              </div>
            ))}
          </div>
        </section>

        {/* TESTIMONIALS */}
        <section style={{ maxWidth:1100, margin:"72px auto", padding:"0 24px" }}>
          <div style={{ textAlign:"center", marginBottom:40 }}>
            <h2 style={{ fontSize:"clamp(24px,4vw,40px)", fontWeight:800, letterSpacing:"-1.5px", color:"#fff", marginBottom:10 }}>Trusted by traders worldwide</h2>
            <p style={{ fontSize:15, color:C.text2 }}>Join 50,000+ traders who chose VaultX</p>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))", gap:14 }}>
            {testimonials.map((t,i) => (
              <div key={i} style={{ ...S.card }}>
                <div style={{ display:"flex", gap:2, marginBottom:12 }}>
                  {"★★★★★".split("").map((_,j) => <span key={j} style={{ color:C.gold, fontSize:15 }}>★</span>)}
                </div>
                <p style={{ fontSize:14, color:C.text2, lineHeight:1.75, marginBottom:14, fontStyle:"italic" }}>"{t.text}"</p>
                <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                  <div style={{ width:34, height:34, borderRadius:"50%", background:`linear-gradient(135deg,#e6b400,#ffd633)`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, fontWeight:700, color:"#0a0a0a" }}>
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <div style={{ fontSize:13, fontWeight:600, color:"#fff" }}>{t.name}</div>
                    <div style={{ fontSize:11, color:C.text3 }}>{t.loc}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* BOTTOM CTA */}
        <section style={{ maxWidth:800, margin:"72px auto 100px", padding:"0 24px", textAlign:"center" }}>
          <div style={{ background:"linear-gradient(160deg,rgba(255,200,0,.07),rgba(255,200,0,.02))", border:`1px solid ${C.border}`, borderRadius:24, padding:"clamp(36px,6vw,64px) clamp(24px,5vw,64px)" }}>
            <h2 style={{ fontSize:"clamp(26px,5vw,48px)", fontWeight:800, letterSpacing:"-2px", color:"#fff", marginBottom:14, lineHeight:1.1 }}>
              Start trading today.<br/>
              <span style={{ background:"linear-gradient(135deg,#e6b400,#ffd633)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>It's free.</span>
            </h2>
            <p style={{ fontSize:15, color:C.text2, marginBottom:32, lineHeight:1.7 }}>Open your account in 60 seconds. No hidden fees, no minimum deposit.</p>
            <div style={{ display:"flex", justifyContent:"center", gap:12, flexWrap:"wrap" }}>
              <button style={{ ...btn("primary"), padding:"14px 40px", fontSize:15 }} onClick={() => setView("register")}>Open Free Account →</button>
              <button style={{ ...btn("ghost"), padding:"14px 28px", fontSize:15 }} onClick={() => setView("login")}>Sign In</button>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </div>
  );
}

// ── LOGIN ─────────────────────────────────────────────────────────────────────
export function LoginPage() {
  const { setView, showToast, showAlert, alert, setUser, setDashTab, loginUser, checkAdminCreds } = useApp();
  const [email,     setEmail]     = useState("");
  const [password,  setPassword]  = useState("");
  const [showPw,    setShowPw]    = useState(false);
  const [adminUser, setAdminUser] = useState("");
  const [adminPw,   setAdminPw]   = useState("");
  const [tab,       setTab]       = useState("client");

  const doLogin = useCallback(() => {
    if (!email.trim()) { showAlert("Please enter your email"); return; }
    if (!password)     { showAlert("Please enter your password"); return; }
    const result = loginUser(email.trim().toLowerCase(), password);
    if (!result.success) { showAlert(result.error || "Login failed"); return; }
    setUser(result.user);
    setView("dashboard");
    setDashTab("overview");
    showToast("Welcome back, " + (result.user.name||"").split(" ")[0] + "! 👋", "success");
  }, [email, password, loginUser, showAlert, showToast, setUser, setView, setDashTab]);

  const doAdminLogin = useCallback(() => {
    if (!checkAdminCreds(adminUser, adminPw)) { showAlert("Invalid admin credentials"); return; }
    setView("admin");
    showToast("Admin panel loaded", "success");
  }, [adminUser, adminPw, checkAdminCreds, showAlert, showToast, setView]);

  return (
    <div style={{ ...S.app, position:"relative", overflow:"hidden" }}>
      <CryptoBackground />
      <style>{globalCSS}</style>
      <div style={{ position:"relative", zIndex:1, minHeight:"100vh", display:"flex", flexDirection:"column" }}>
        <nav style={S.nav}>
          <div style={S.logo} onClick={() => setView("landing")}>
            <div style={S.logoMark}>V</div><span>VaultX</span>
          </div>
          <button style={{ ...btn("ghost"), padding:"8px 18px" }} onClick={() => setView("register")}>Create Account</button>
        </nav>
        <div style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", padding:"40px 20px" }}>
          <div style={{ width:"min(420px,100%)" }}>
            <div style={{ textAlign:"center", marginBottom:28 }}>
              <div style={{ ...S.logoMark, width:48, height:48, borderRadius:12, margin:"0 auto 14px", fontSize:20 }}>V</div>
              <h1 style={{ fontSize:22, fontWeight:700, letterSpacing:"-.5px", marginBottom:6 }}>Sign in to VaultX</h1>
              <p style={{ fontSize:13, color:C.text3 }}>Enter your credentials to continue</p>
            </div>

            {/* Tab switcher */}
            <div style={{ display:"flex", background:"rgba(255,200,0,.04)", border:`1px solid ${C.border2}`, borderRadius:12, padding:4, marginBottom:20 }}>
              {["client","admin"].map(t => (
                <button key={t} onClick={() => setTab(t)} style={{ flex:1, padding:"9px", border:"none", borderRadius:9, cursor:"pointer", fontFamily:"inherit", fontSize:13, fontWeight:600, transition:"all .15s",
                  background: tab===t ? "rgba(255,200,0,.12)" : "transparent",
                  color: tab===t ? C.gold : C.text3 }}>
                  {t==="client" ? "Client" : "Admin"}
                </button>
              ))}
            </div>

            {alert && <div style={{ background:"rgba(239,68,68,.1)", border:"1px solid rgba(239,68,68,.25)", borderRadius:10, padding:"10px 14px", fontSize:13, color:"#f87171", marginBottom:14 }}>{alert}</div>}

            <div style={{ ...S.card }}>
              {tab === "client" ? (
                <>
                  <div style={{ marginBottom:14 }}>
                    <label style={S.label}>Email address</label>
                    <input style={S.inp} type="email" placeholder="you@example.com" value={email} onChange={e=>setEmail(e.target.value)} onKeyDown={e=>e.key==="Enter"&&doLogin()} autoFocus/>
                  </div>
                  <div style={{ marginBottom:22 }}>
                    <label style={S.label}>Password</label>
                    <div style={{ position:"relative" }}>
                      <input style={{ ...S.inp, paddingRight:44 }} type={showPw?"text":"password"} placeholder="••••••••" value={password} onChange={e=>setPassword(e.target.value)} onKeyDown={e=>e.key==="Enter"&&doLogin()}/>
                      <button onClick={() => setShowPw(!showPw)} style={{ position:"absolute", right:12, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", color:C.text3, fontSize:16, padding:4 }}>
                        {showPw?"🙈":"👁"}
                      </button>
                    </div>
                  </div>
                  <button style={{ ...btn("primary"), width:"100%", padding:"13px", fontSize:14 }} onClick={doLogin}>Sign In →</button>
                  <div style={{ textAlign:"center", marginTop:16, fontSize:13, color:C.text3 }}>
                    Don't have an account?{" "}
                    <span style={{ color:C.gold, cursor:"pointer", fontWeight:600 }} onClick={() => setView("register")}>Create one</span>
                  </div>
                </>
              ) : (
                <>
                  <div style={{ marginBottom:14 }}>
                    <label style={S.label}>Admin Username</label>
                    <input style={S.inp} placeholder="admin" value={adminUser} onChange={e=>setAdminUser(e.target.value)} onKeyDown={e=>e.key==="Enter"&&doAdminLogin()}/>
                  </div>
                  <div style={{ marginBottom:22 }}>
                    <label style={S.label}>Admin Password</label>
                    <input style={S.inp} type="password" placeholder="••••••••" value={adminPw} onChange={e=>setAdminPw(e.target.value)} onKeyDown={e=>e.key==="Enter"&&doAdminLogin()}/>
                  </div>
                  <button style={{ ...btn("primary"), width:"100%", padding:"13px", fontSize:14 }} onClick={doAdminLogin}>Access Admin Panel →</button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── REGISTER ──────────────────────────────────────────────────────────────────
export function RegisterPage() {
  const { setView, users, registerUser, showToast, showAlert, alert } = useApp();
  const [name,     setName]     = useState("");
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [confirm,  setConfirm]  = useState("");
  const [showPw,   setShowPw]   = useState(false);
  const [agreed,   setAgreed]   = useState(false);
  const [saving,   setSaving]   = useState(false);

  const doRegister = useCallback(async () => {
    if (!name || !email || !password || !confirm) { showAlert("All fields required"); return; }
    if (password !== confirm)  { showAlert("Passwords don't match"); return; }
    if (password.length < 6)   { showAlert("Password must be at least 6 characters"); return; }
    if (!agreed)               { showAlert("Please accept the Terms of Service"); return; }
    if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) { showAlert("Email already registered"); return; }
    setSaving(true);
    const nu = {
      id: `U${String(users.length+1).padStart(4,"0")}`,
      name, email: email.toLowerCase().trim(), rawPassword: password,
      balance:0, portfolio:0,
      holdings: createHoldings(0), staking: createStaking(0),
      joined: new Date().toLocaleDateString(), verified:true, status:"Active", tier:"Basic",
    };
    const result = await registerUser(nu);
    setSaving(false);
    if (result.success) { showToast("Account created! Please sign in.", "success"); setView("login"); }
    else showAlert("Registration failed. Please try again.");
  }, [name, email, password, confirm, agreed, users, registerUser, showAlert, showToast, setView]);

  return (
    <div style={{ ...S.app, position:"relative", overflow:"hidden" }}>
      <CryptoBackground />
      <style>{globalCSS}</style>
      <div style={{ position:"relative", zIndex:1, minHeight:"100vh", display:"flex", flexDirection:"column" }}>
        <nav style={S.nav}>
          <div style={S.logo} onClick={() => setView("landing")}>
            <div style={S.logoMark}>V</div><span>VaultX</span>
          </div>
          <button style={{ ...btn("ghost"), padding:"8px 18px" }} onClick={() => setView("login")}>Sign In</button>
        </nav>
        <div style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", padding:"40px 20px" }}>
          <div style={{ width:"min(440px,100%)" }}>
            <div style={{ textAlign:"center", marginBottom:28 }}>
              <div style={{ ...S.logoMark, width:48, height:48, borderRadius:12, margin:"0 auto 14px", fontSize:20 }}>V</div>
              <h1 style={{ fontSize:22, fontWeight:700, letterSpacing:"-.5px", marginBottom:6 }}>Create your account</h1>
              <p style={{ fontSize:13, color:C.text3 }}>Start trading in under 60 seconds</p>
            </div>

            {alert && <div style={{ background:"rgba(239,68,68,.1)", border:"1px solid rgba(239,68,68,.25)", borderRadius:10, padding:"10px 14px", fontSize:13, color:"#f87171", marginBottom:14 }}>{alert}</div>}

            <div style={{ ...S.card }}>
              <div style={{ marginBottom:14 }}><label style={S.label}>Full Name</label><input style={S.inp} placeholder="John Smith" value={name} onChange={e=>setName(e.target.value)} autoFocus/></div>
              <div style={{ marginBottom:14 }}><label style={S.label}>Email address</label><input style={S.inp} type="email" placeholder="you@example.com" value={email} onChange={e=>setEmail(e.target.value)}/></div>
              <div style={{ marginBottom:14 }}>
                <label style={S.label}>Password</label>
                <div style={{ position:"relative" }}>
                  <input style={{ ...S.inp, paddingRight:44 }} type={showPw?"text":"password"} placeholder="Min. 6 characters" value={password} onChange={e=>setPassword(e.target.value)}/>
                  <button onClick={()=>setShowPw(!showPw)} style={{ position:"absolute", right:12, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", color:C.text3, fontSize:16, padding:4 }}>
                    {showPw?"🙈":"👁"}
                  </button>
                </div>
              </div>
              <div style={{ marginBottom:18 }}><label style={S.label}>Confirm Password</label><input style={S.inp} type="password" placeholder="Repeat password" value={confirm} onChange={e=>setConfirm(e.target.value)} onKeyDown={e=>e.key==="Enter"&&doRegister()}/></div>
              <div style={{ display:"flex", alignItems:"flex-start", gap:10, marginBottom:20, fontSize:13, color:C.text2 }}>
                <input type="checkbox" checked={agreed} onChange={e=>setAgreed(e.target.checked)} style={{ marginTop:2, accentColor:C.gold, flexShrink:0 }}/>
                <span>I agree to the <span style={{ color:C.gold, cursor:"pointer" }} onClick={()=>setView("terms")}>Terms of Service</span> and <span style={{ color:C.gold, cursor:"pointer" }} onClick={()=>setView("privacy")}>Privacy Policy</span></span>
              </div>
              <button style={{ ...btn("primary"), width:"100%", padding:"13px", fontSize:14, opacity:saving?.7:1 }} onClick={doRegister} disabled={saving}>
                {saving?"Creating Account…":"Create Free Account →"}
              </button>
              <div style={{ textAlign:"center", marginTop:16, fontSize:13, color:C.text3 }}>
                Already have an account?{" "}
                <span style={{ color:C.gold, cursor:"pointer", fontWeight:600 }} onClick={()=>setView("login")}>Sign in</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
