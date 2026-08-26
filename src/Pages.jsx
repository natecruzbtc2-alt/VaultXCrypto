import { useApp } from "./AppContext";
import { C, S, btn, globalCSS } from "./theme";

// ─── SHARED NAV ───────────────────────────────────────────────────────────────
function PageNav() {
  const { setView } = useApp();
  return (
    <nav style={S.nav}>
      <div style={{ display:"flex", alignItems:"center", gap:10, cursor:"pointer" }} onClick={() => setView("landing")}>
        <img src="/logo.png" style={{ width:36, height:36, borderRadius:10, objectFit:"cover" }} alt="VaultX" onError={e=>{e.target.style.display="none";}}/>
        <span style={{ fontSize:17, fontWeight:800, textTransform:"uppercase", letterSpacing:"-.5px", color:C.text }}>VaultXcrypto</span>
      </div>
      <div style={{ display:"flex", gap:12 }}>
        <button style={{ ...btn("ghost"), padding:"7px 16px", fontSize:13 }} onClick={() => setView("login")}>Sign In</button>
        <button style={{ ...btn(), padding:"7px 16px", fontSize:13 }} onClick={() => setView("register")}>Get Started</button>
      </div>
    </nav>
  );
}

// ─── FOOTER ───────────────────────────────────────────────────────────────────
export function Footer() {
  const { setView } = useApp();

  const navigate = (page) => {
    const map = {
      // platform links → go to register if not logged in
      "trade":"register", "portfolio":"register", "staking":"register",
      "markets":"register", "wallet":"register",
      // company links
      "about":"about", "contact":"contact",
      "privacy":"privacy", "terms":"terms",
      "privacy-policy":"privacy", "terms-of-service":"terms",
      "cookie-policy":"terms", "cookies":"terms",
      // support links
      "help":"contact", "security":"contact",
      "fees":"contact", "status":"contact", "report":"contact",
    };
    setView(map[page] || "landing");
  };

  return (
    <footer style={{ background:"#04030a", borderTop:`1px solid ${C.border2}`, padding:"48px 24px 24px", marginTop:60 }}>
      <div style={{ maxWidth:1140, margin:"0 auto" }}>
        <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr 1fr 1fr", gap:40, marginBottom:40 }}>
          {/* Brand */}
          <div>
            <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:16 }}>
              <img src="/logo.png" style={{ width:36, height:36, borderRadius:10, objectFit:"cover" }} alt="VaultX" onError={e=>{e.target.style.display="none";}}/>
              <span style={{ fontSize:17, fontWeight:800, color:C.text, textTransform:"uppercase", letterSpacing:"-.5px" }}>VaultXcrypto</span>
            </div>
            <p style={{ fontSize:13, color:C.text3, lineHeight:1.8, maxWidth:280 }}>
              VaultX Ltd is a UK-registered cryptocurrency trading and portfolio management platform providing secure, real-time access to global crypto markets.
            </p>
            <div style={{ marginTop:16, fontSize:12, color:C.text3, lineHeight:1.9 }}>
              <div>🏢 VaultX Ltd — Registered in England & Wales</div>
              <div>📍 71-75 Shelton Street, London, WC2H 9JQ</div>
              <div style={{cursor:"pointer"}} onClick={() => { if(window.Tawk_API && window.Tawk_API.maximize) { window.Tawk_API.maximize(); } else { window.open('https://tawk.to/chat/6a2e5fe88b30661d42bef351/1jr2id950', '_blank'); } }}>💬 Live Chat Support</div>
              <div>🔢 Company No. 14782341</div>
            </div>
          </div>

          {/* Platform */}
          <div>
            <div style={{ fontSize:12, fontWeight:700, color:C.text, marginBottom:16, textTransform:"uppercase", letterSpacing:".08em" }}>Platform</div>
            {[["Trading","trade"],["Portfolio","portfolio"],["Staking","staking"],["Live Markets","markets"],["Wallet","wallet"]].map(([l,p]) => (
              <div key={l} style={{ marginBottom:10 }}>
                <span style={{ fontSize:13, color:C.text3, cursor:"pointer" }}
                  onMouseEnter={e=>e.target.style.color=C.purple3} onMouseLeave={e=>e.target.style.color=C.text3}
                  onClick={() => navigate(p)}>{l}</span>
              </div>
            ))}
          </div>

          {/* Company */}
          <div>
            <div style={{ fontSize:12, fontWeight:700, color:C.text, marginBottom:16, textTransform:"uppercase", letterSpacing:".08em" }}>Company</div>
            {[["About Us","about"],["Contact Us","contact"],["Privacy Policy","privacy"],["Terms of Service","terms"],["Cookie Policy","cookies"]].map(([l,p]) => (
              <div key={l} style={{ marginBottom:10 }}>
                <span style={{ fontSize:13, color:C.text3, cursor:"pointer" }}
                  onMouseEnter={e=>e.target.style.color=C.purple3} onMouseLeave={e=>e.target.style.color=C.text3}
                  onClick={() => navigate(p)}>{l}</span>
              </div>
            ))}
          </div>

          {/* Support */}
          <div>
            <div style={{ fontSize:12, fontWeight:700, color:C.text, marginBottom:16, textTransform:"uppercase", letterSpacing:".08em" }}>Support</div>
            {[["Help Centre","help"],["Security","security"],["Fees & Limits","fees"],["Platform Status","status"],["Report Issue","contact"]].map(([l,p]) => (
              <div key={l} style={{ marginBottom:10 }}>
                <span style={{ fontSize:13, color:C.text3, cursor:"pointer" }}
                  onMouseEnter={e=>e.target.style.color=C.purple3} onMouseLeave={e=>e.target.style.color=C.text3}
                  onClick={() => navigate(p)}>{l}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom bar */}
        <div style={{ borderTop:`1px solid ${C.border2}`, paddingTop:24, display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:12 }}>
          <div style={{ fontSize:12, color:C.text3 }}>
            © {new Date().getFullYear()} VaultX Ltd. All rights reserved. Registered in England & Wales. Company No. 14782341
          </div>
          <div style={{ display:"flex", gap:20 }}>
            {[["Privacy Policy","privacy"],["Terms of Service","terms"],["Cookies","cookies"]].map(([l,p]) => (
              <span key={l} style={{ fontSize:12, color:C.text3, cursor:"pointer" }}
                onMouseEnter={e=>e.target.style.color=C.purple3} onMouseLeave={e=>e.target.style.color=C.text3}
                onClick={() => navigate(p)}>{l}</span>
            ))}
          </div>
        </div>

        <div style={{ marginTop:16, fontSize:11, color:C.text3, lineHeight:1.7, opacity:.7 }}>
          ⚠️ Cryptocurrency trading involves significant risk. The value of cryptocurrencies can go up or down and you may lose your entire investment.
          VaultX Ltd is not a regulated financial advisor. Please ensure you understand the risks before trading.
        </div>
      </div>
    </footer>
  );
}

// ─── ABOUT PAGE ───────────────────────────────────────────────────────────────
export function AboutPage() {
  const { setView } = useApp();
  return (
    <div style={S.app}>
      <style>{globalCSS}</style>
      <PageNav />
      <div style={{ maxWidth:900, margin:"0 auto", padding:"60px 24px 0" }}>
        <div style={{ textAlign:"center", marginBottom:56 }}>
          <div style={{ fontSize:11, color:C.purple3, textTransform:"uppercase", letterSpacing:".1em", marginBottom:12 }}>About Us</div>
          <h1 style={{ fontSize:42, fontWeight:800, color:C.text, letterSpacing:"-1.5px", marginBottom:16 }}>
            Building the future of<br/>
            <span style={{ background:`linear-gradient(135deg,${C.purple},${C.purple3})`, WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>
              crypto finance
            </span>
          </h1>
          <p style={{ fontSize:16, color:C.text3, lineHeight:1.8, maxWidth:600, margin:"0 auto" }}>
            VaultX Ltd is a London-based cryptocurrency platform dedicated to making professional-grade trading accessible to everyone.
          </p>
        </div>

        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:16, marginBottom:48 }}>
          {[["2022","Founded"],["50,000+","Active Users"],["$2.4B+","Volume Traded"],["99.9%","Uptime SLA"]].map(([v,l]) => (
            <div key={l} style={{ ...S.card, textAlign:"center" }}>
              <div style={{ fontSize:28, fontWeight:800, color:C.purple3, marginBottom:6 }}>{v}</div>
              <div style={{ fontSize:13, color:C.text3 }}>{l}</div>
            </div>
          ))}
        </div>

        <div style={{ ...S.card, marginBottom:20 }}>
          <div style={{ fontSize:20, fontWeight:700, color:C.text, marginBottom:14 }}>Our Mission</div>
          <p style={{ fontSize:14, color:C.text2, lineHeight:1.9 }}>
            At VaultX, we believe everyone deserves access to the same financial tools previously reserved for institutional investors.
            Our platform combines cutting-edge technology with an intuitive interface to deliver a world-class trading experience —
            whether you're making your first crypto purchase or managing a multi-asset portfolio worth millions.
          </p>
        </div>

        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginBottom:24 }}>
          {[
            { icon:"🔐", title:"Bank-Grade Security", desc:"Multi-sig wallets, cold storage, 2FA and insurance backed vaults protect your assets 24/7." },
            { icon:"⚡", title:"Instant Settlements",  desc:"Sub-second trades with deep liquidity across 200+ trading pairs worldwide." },
            { icon:"🌍", title:"Global Access",        desc:"Serving clients across Europe and beyond, available 24/7 with multilingual support." },
            { icon:"📊", title:"Transparency",         desc:"Clear fee structures, honest reporting and full audit trails for every single transaction." },
          ].map((item,i) => (
            <div key={i} style={S.scard}>
              <div style={{ fontSize:28, marginBottom:10 }}>{item.icon}</div>
              <div style={{ fontWeight:700, color:C.text, marginBottom:8 }}>{item.title}</div>
              <div style={{ fontSize:13, color:C.text3, lineHeight:1.7 }}>{item.desc}</div>
            </div>
          ))}
        </div>

        <div style={{ ...S.card, marginBottom:40 }}>
          <div style={{ fontSize:20, fontWeight:700, color:C.text, marginBottom:16 }}>Company Information</div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
            {[
              ["Company Name","VaultX Ltd"],
              ["Registration Number","14782341"],
              ["Registered Country","England & Wales, United Kingdom"],
              ["Registered Address","71-75 Shelton Street, London, WC2H 9JQ"],
              ["Founded","2022"],
              ["Support Email","support@vaultx-crypto.com"],
            ].map(([label,value]) => (
              <div key={label} style={{ padding:"12px 16px", background:`rgba(255,200,0,.04)`, borderRadius:10 }}>
                <div style={{ fontSize:11, color:C.text3, textTransform:"uppercase", letterSpacing:".06em", marginBottom:4 }}>{label}</div>
                <div style={{ fontSize:13, fontWeight:600, color:C.text }}>{value}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ textAlign:"center", marginBottom:60 }}>
          <button style={{ ...btn(), padding:"13px 32px", fontSize:15 }} onClick={() => setView("register")}>Start Trading Today →</button>
        </div>
      </div>
      <Footer />
    </div>
  );
}

// ─── CONTACT PAGE ─────────────────────────────────────────────────────────────
export function ContactPage() {
  const { setView, showToast } = useApp();
  return (
    <div style={S.app}>
      <style>{globalCSS}</style>
      <PageNav />
      <div style={{ maxWidth:800, margin:"0 auto", padding:"60px 24px 0" }}>
        <div style={{ textAlign:"center", marginBottom:48 }}>
          <div style={{ fontSize:11, color:C.purple3, textTransform:"uppercase", letterSpacing:".1em", marginBottom:12 }}>Contact Us</div>
          <h1 style={{ fontSize:40, fontWeight:800, color:C.text, letterSpacing:"-1.5px", marginBottom:14 }}>We're here to help</h1>
          <p style={{ fontSize:15, color:C.text3, lineHeight:1.8 }}>Our support team is available 24/7. Reach out via any channel below.</p>
        </div>

        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:16, marginBottom:40 }}>
          {[
            { icon:"💬", title:"Live Chat",        value:"Available 24/7",             desc:"Instant response via chat" },
            { icon:"💬", title:"Live Chat",        value:"Available 24/7",          desc:"Click the chat button" },
            { icon:"📍", title:"Office",           value:"London, UK",              desc:"71-75 Shelton Street, WC2H 9JQ" },
          ].map((item,i) => (
            <div key={i} style={{ ...S.card, textAlign:"center" }}>
              <div style={{ fontSize:32, marginBottom:12 }}>{item.icon}</div>
              <div style={{ fontWeight:700, color:C.text, marginBottom:6 }}>{item.title}</div>
              <div style={{ fontSize:13, color:C.purple3, fontWeight:600, marginBottom:4 }}>{item.value}</div>
              <div style={{ fontSize:12, color:C.text3 }}>{item.desc}</div>
            </div>
          ))}
        </div>

        <div style={{ ...S.card, marginBottom:60 }}>
          <div style={{ fontSize:18, fontWeight:700, color:C.text, marginBottom:20 }}>Send us a message</div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14, marginBottom:14 }}>
            <div><label style={S.label}>Full Name</label><input style={S.inp} placeholder="John Smith"/></div>
            <div><label style={S.label}>Email Address</label><input style={S.inp} type="email" placeholder="you@email.com"/></div>
          </div>
          <div style={{ marginBottom:14 }}>
            <label style={S.label}>Subject</label>
            <select style={S.sel}>
              {["Account Support","Deposit / Withdrawal","Technical Issue","Security Concern","General Inquiry","Partnership"].map(o=><option key={o}>{o}</option>)}
            </select>
          </div>
          <div style={{ marginBottom:20 }}>
            <label style={S.label}>Message</label>
            <textarea style={{ ...S.inp, height:120, resize:"vertical" }} placeholder="Describe your issue in detail…"/>
          </div>
          <button style={{ ...btn("success"), padding:"12px 28px", fontSize:14 }}
            onClick={() => { if(window.Tawk_API && window.Tawk_API.maximize) { window.Tawk_API.maximize(); } else { window.open('https://tawk.to/chat/6a2e5fe88b30661d42bef351/1jr2id950', '_blank'); } }}>
            💬 Start Live Chat →
          </button>
        </div>
      </div>
      <Footer />
    </div>
  );
}

// ─── TERMS PAGE ───────────────────────────────────────────────────────────────
export function TermsPage() {
  const { setView } = useApp();
  return (
    <div style={S.app}>
      <style>{globalCSS}</style>
      <PageNav />
      <div style={{ maxWidth:800, margin:"0 auto", padding:"60px 24px 0" }}>
        <h1 style={{ fontSize:36, fontWeight:800, color:C.text, marginBottom:8 }}>Terms of Service</h1>
        <div style={{ fontSize:13, color:C.text3, marginBottom:40 }}>Last updated: January 1, 2024 · VaultX Ltd</div>
        {[
          ["1. Acceptance of Terms","By accessing or using VaultX platform, you agree to be bound by these Terms of Service. If you do not agree, please do not use our services. VaultX Ltd reserves the right to modify these terms at any time with reasonable notice."],
          ["2. Eligibility","You must be at least 18 years of age to use our platform. By using VaultX, you represent that you are of legal age and have the legal capacity to enter into these terms. Our services are not available in jurisdictions where cryptocurrency trading is prohibited."],
          ["3. Account Registration","You are responsible for maintaining the confidentiality of your account credentials. You agree to notify us immediately of any unauthorised use. VaultX Ltd is not liable for losses resulting from unauthorised account access."],
          ["4. Trading & Transactions","All trades are executed at market prices. VaultX does not guarantee execution at any specific price. Cryptocurrency markets are volatile and prices can change rapidly. You acknowledge and accept all risks associated with cryptocurrency trading."],
          ["5. Fees","VaultX charges a trading fee of 0.10% per transaction. Withdrawal fees vary by network and cryptocurrency. All fees are displayed before you confirm any transaction. We reserve the right to modify fees with 30 days notice."],
          ["6. Risk Disclosure","Cryptocurrency trading involves significant financial risk. Values can decrease substantially or become worthless. Past performance is not indicative of future results. Never invest more than you can afford to lose. VaultX Ltd is not a financial advisor."],
          ["7. Prohibited Activities","You agree not to use our platform for money laundering, fraud, or any illegal activity. You agree not to attempt to manipulate markets or interfere with our systems. Violations may result in immediate account termination and reporting to authorities."],
          ["8. Privacy","Your use of VaultX is governed by our Privacy Policy. We collect and process personal data in accordance with UK GDPR and the Data Protection Act 2018."],
          ["9. Limitation of Liability","VaultX Ltd shall not be liable for any indirect, incidental, or consequential damages. Our total liability shall not exceed fees paid by you in the 12 months preceding the claim."],
          ["10. Governing Law","These terms are governed by the laws of England and Wales. Any disputes shall be subject to the exclusive jurisdiction of the courts of England and Wales."],
          ["11. Contact","For questions: support@vaultx-crypto.com or VaultX Ltd, 71-75 Shelton Street, London, WC2H 9JQ, United Kingdom."],
        ].map(([title,content]) => (
          <div key={title} style={{ marginBottom:28 }}>
            <div style={{ fontSize:16, fontWeight:700, color:C.text, marginBottom:10 }}>{title}</div>
            <p style={{ fontSize:14, color:C.text2, lineHeight:1.9 }}>{content}</p>
          </div>
        ))}
        <div style={{ marginBottom:60 }}>
          <button style={{ ...btn("ghost"), padding:"10px 20px" }} onClick={() => setView("landing")}>← Back to Home</button>
        </div>
      </div>
      <Footer />
    </div>
  );
}

// ─── PRIVACY PAGE ─────────────────────────────────────────────────────────────
export function PrivacyPage() {
  const { setView } = useApp();
  return (
    <div style={S.app}>
      <style>{globalCSS}</style>
      <PageNav />
      <div style={{ maxWidth:800, margin:"0 auto", padding:"60px 24px 0" }}>
        <h1 style={{ fontSize:36, fontWeight:800, color:C.text, marginBottom:8 }}>Privacy Policy</h1>
        <div style={{ fontSize:13, color:C.text3, marginBottom:40 }}>Last updated: January 1, 2024 · VaultX Ltd</div>
        {[
          ["1. Who We Are","VaultX Ltd is registered in England and Wales (Company No. 14782341) at 71-75 Shelton Street, London, WC2H 9JQ. We are the data controller for personal information we process about you."],
          ["2. Information We Collect","We collect information you provide when registering (name, email, password), transaction data, device and browser information, IP addresses, and usage analytics. We may also collect identity verification documents as required by law."],
          ["3. How We Use Your Information","We use your personal data to provide and improve our services, process transactions, comply with legal obligations, prevent fraud, and communicate with you about your account and our services."],
          ["4. Legal Basis for Processing","We process your data on the basis of contract performance, legal obligation (KYC/AML compliance), legitimate interests (fraud prevention, security), and consent where applicable."],
          ["5. Data Retention","We retain your personal data for as long as your account is active and for 7 years after account closure, as required by UK financial regulations. Transaction records are kept for 10 years."],
          ["6. Your Rights","Under UK GDPR, you have the right to access, rectify, erase, restrict processing, data portability, and object to processing of your personal data. Contact us at support@vaultx-crypto.com."],
          ["7. Data Security","We use industry-standard encryption (AES-256), secure servers, and strict access controls to protect your data. We conduct regular security audits and penetration testing."],
          ["8. Cookies","We use essential cookies for platform functionality and analytics cookies to improve our service. You can control cookie preferences through your browser settings."],
          ["9. Third Parties","We do not sell your personal data. We may share data with payment processors, identity verification services, and regulatory authorities when required by law."],
          ["10. Contact","For privacy queries: support@vaultx-crypto.com or VaultX Ltd, 71-75 Shelton Street, London, WC2H 9JQ."],
        ].map(([title,content]) => (
          <div key={title} style={{ marginBottom:28 }}>
            <div style={{ fontSize:16, fontWeight:700, color:C.text, marginBottom:10 }}>{title}</div>
            <p style={{ fontSize:14, color:C.text2, lineHeight:1.9 }}>{content}</p>
          </div>
        ))}
        <div style={{ marginBottom:60 }}>
          <button style={{ ...btn("ghost"), padding:"10px 20px" }} onClick={() => setView("landing")}>← Back to Home</button>
        </div>
      </div>
      <Footer />
    </div>
  );
}
