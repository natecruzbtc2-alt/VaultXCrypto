import { useApp } from "./AppContext";
import { C, S, btn, globalCSS } from "./theme";
import CryptoBackground from "./CryptoBackground";
import { TickerMini } from "./components";
import { DashOverview, DashMarkets, DashWallet, DashPortfolio, DashTrading, DashHistory } from "./DashTabs";
import { AdminUsers, AdminDeposits, AdminWallets, AdminWithdrawals, AdminPending, AdminFees, AdminMarkets, AdminSettings, AgentDepositBoard, AdminCRM } from "./AdminTabs";

// ─── MOBILE BOTTOM NAV ────────────────────────────────────────────────────────
function MobileNav({ dashTab, setDashTab }) {
  const items = [
    { id:"overview",  icon:"⬡", label:"Home"      },
    { id:"markets",   icon:"◈", label:"Markets"   },
    { id:"wallet",    icon:"◎", label:"Wallet"    },
    { id:"portfolio", icon:"◑", label:"Portfolio" },
    { id:"history",   icon:"◫", label:"History"   },
  ];
  return (
    <div className="vx-mobile-nav">
      {items.map(it => (
        <button key={it.id} className={`vx-mobile-nav-btn${dashTab===it.id?" active":""}`} onClick={() => setDashTab(it.id)}>
          <span className="icon">{it.icon}</span>
          {it.label}
        </button>
      ))}
    </div>
  );
}

// ─── DASHBOARD ────────────────────────────────────────────────────────────────
export function Dashboard() {
  const { user, dashTab, setDashTab, setView, doLogout, getUserFeeReqs } = useApp();
  const pendingFees = getUserFeeReqs(user?.email);

  const navItems = [
    { id:"overview",  icon:"⬡", label:"Overview"  },
    { id:"markets",   icon:"◈", label:"Markets"   },
    { id:"wallet",    icon:"◎", label:"Wallet"    },
    { id:"portfolio", icon:"◑", label:"Portfolio" },
    { id:"trade",     icon:"◈", label:"Trade"      },
    { id:"history",   icon:"◫", label:"History"   },
  ];

  return (
    <div style={{ ...S.app, display:"flex", flexDirection:"column", height:"100vh", overflow:"hidden", position:"relative" }}>
      <CryptoBackground />
      <style>{globalCSS}</style>

      {/* Nav */}
      <nav style={S.nav} className="vx-nav">
        <div style={{ display:"flex", alignItems:"center", gap:10, cursor:"pointer" }} onClick={() => setView("landing")}>
          <img src="/logo.png" style={{ width:36, height:36, borderRadius:10, objectFit:"cover" }} alt="VaultX" onError={e=>{e.target.style.display="none";}}/>
          <span className="vx-logo-text" style={{ fontSize:17, fontWeight:800, textTransform:"uppercase", letterSpacing:"-.5px", color:C.text }}>VaultXcrypto</span>
        </div>
        <div className="vx-nav-mid"><TickerMini /></div>
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          {pendingFees.length > 0 && (
            <div style={{ background:"rgba(255,200,0,.15)", border:"1px solid rgba(255,200,0,.4)", borderRadius:8, padding:"5px 12px", fontSize:12, color:C.red3, cursor:"pointer" }}
              onClick={() => setDashTab("overview")}>
              ⚠️ {pendingFees.length} fee{pendingFees.length>1?"s":""}
            </div>
          )}
          <div style={{ display:"flex", alignItems:"center", gap:8, cursor:"pointer", padding:"6px 10px", borderRadius:8 }}
            onClick={() => setView("settings")}
            onMouseEnter={e=>e.currentTarget.style.background="rgba(255,200,0,.08)"}
            onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
            <div style={{ width:30, height:30, borderRadius:"50%", background:`linear-gradient(135deg,#e6b400,#ffd633)`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, fontWeight:700, color:"#000" }}>
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <span style={{ fontWeight:600, color:C.text, fontSize:13 }} className="hide-mobile">{user?.name?.split(" ")[0]}</span>
          </div>
          <button style={{ ...btn("ghost"), padding:"7px 16px", fontSize:12 }} onClick={doLogout}>Logout</button>
        </div>
      </nav>

      {/* Body */}
      <div style={{ display:"flex", flex:1, minHeight:0, overflow:"hidden" }} className="vx-dash-body">

        {/* Sidebar — hidden on mobile */}
        <div style={S.sidebar} className="vx-sidebar">
          {navItems.map(it => (
            <button key={it.id} style={S.sitem(dashTab===it.id)} onClick={() => setDashTab(it.id)}>
              <span style={{ fontSize:15, color:dashTab===it.id?"#000":C.text3 }}>{it.icon}</span>
              {it.label}
              {it.id==="overview" && pendingFees.length>0 && (
                <span style={{ marginLeft:"auto", background:"rgba(255,200,0,.3)", color:C.red3, borderRadius:10, fontSize:10, padding:"1px 7px", fontWeight:700 }}>
                  {pendingFees.length}
                </span>
              )}
            </button>
          ))}
          <div style={{ flex:1 }}/>
          <button style={{ ...S.sitem(false) }} onClick={() => setView("settings")}>
            <span style={{ fontSize:15 }}>⚙️</span> Settings
          </button>
          <button style={{ ...S.sitem(false) }} onClick={() => { if(window.Tawk_API&&window.Tawk_API.maximize){window.Tawk_API.maximize();}else{window.open('https://tawk.to/chat/6a2e5fe88b30661d42bef351/1jr2id950','_blank');} }}>
            <span style={{ fontSize:15 }}>💬</span> Live Support
          </button>
          <div style={{ padding:"14px 16px", background:`rgba(255,200,0,.1)`, border:`1px solid rgba(255,200,0,.2)`, borderRadius:12, marginTop:8 }}>
            <div style={{ fontSize:10, color:C.text3, marginBottom:5, textTransform:"uppercase", letterSpacing:".06em" }}>Balance</div>
            <div style={{ fontSize:18, fontWeight:800, color:C.gold }}>${(user?.balance||0).toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2})}</div>
            <div style={{ fontSize:11, color:C.text3, marginTop:4 }}>Portfolio: ${(user?.portfolio||0).toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2})}</div>
          </div>
        </div>

        {/* Main content */}
        <div style={{ flex:1, overflowY:"auto", padding:"20px 24px" }} className="vx-dash-main">
          {dashTab==="overview"  && <DashOverview />}
          {dashTab==="markets"   && <DashMarkets />}
          {dashTab==="wallet"    && <DashWallet />}
          {dashTab==="portfolio" && <DashPortfolio />}
          {dashTab==="trade"     && <DashTrading />}
          {dashTab==="history"   && <DashHistory />}
        </div>
      </div>

      {/* Mobile bottom nav */}
      <MobileNav dashTab={dashTab} setDashTab={setDashTab} />
    </div>
  );
}

// ─── ADMIN PANEL ──────────────────────────────────────────────────────────────
export function AdminPanel() {
  const { adminTab, setAdminTab, doLogout, setView, users, pending, feeReqs } = useApp();
  const pendingCount = pending.length;
  const feeCount     = feeReqs.filter(r=>r.status==="Pending").length;

  const navItems = [
    { id:"users",       icon:"👥", label:"Users & Funds",   badge:users.length },
    { id:"deposits",    icon:"📥", label:"Deposits"         },
    { id:"wallets",     icon:"🏦", label:"Wallets"          },
    { id:"withdrawals", icon:"📤", label:"Withdrawals",     badge:pending.filter(p=>p.type==="Withdrawal"||p.type==="Withdrawal Request").length },
    { id:"pending",     icon:"⏳", label:"Pending Tx",      badge:pendingCount },
    { id:"fees",        icon:"💰", label:"Fees",            badge:feeCount },
    { id:"markets",     icon:"📈", label:"Markets"          },
    { id:"crm",         icon:"🗂️", label:"CRM"              },
    { id:"board",       icon:"🏆", label:"Deposit Board"    },
    { id:"settings",    icon:"⚙️", label:"Settings"         },
  ];

  return (
    <div style={{ ...S.app, display:"flex", flexDirection:"column", height:"100vh", overflow:"hidden", position:"relative" }}>
      <CryptoBackground />
      <style>{globalCSS}</style>

      <nav style={{ ...S.nav, borderBottom:"1px solid rgba(255,200,0,.2)" }} className="vx-nav">
        <div style={{ display:"flex", alignItems:"center", gap:10, cursor:"pointer" }} onClick={() => setView("landing")}>
          <div style={{ width:36, height:36, background:"linear-gradient(135deg,#b91c1c,#dc2626)", borderRadius:10, display:"flex", alignItems:"center", justifyContent:"center", fontSize:14, fontWeight:900, color:"#fff" }}>AD</div>
          <span className="vx-logo-text" style={{ fontSize:17, fontWeight:800, textTransform:"uppercase", letterSpacing:"-.5px", color:C.text }}>VaultXcrypto</span>
          <span style={{ background:"rgba(232,0,13,.12)", color:"#ff6b70", border:"1px solid rgba(232,0,13,.25)", borderRadius:6, fontSize:11, fontWeight:700, padding:"3px 10px", marginLeft:6 }}>Admin</span>
        </div>
        <div style={{ display:"flex", gap:16, alignItems:"center", fontSize:12, color:C.text3 }}>
          {pendingCount>0 && <span style={{ color:C.red3 }} className="hide-mobile">⏳ {pendingCount} pending</span>}
          {feeCount>0 && <span style={{ color:C.green }} className="hide-mobile">💰 {feeCount} fees</span>}
          <button style={{ ...btn("ghost"), padding:"7px 16px", fontSize:12 }} onClick={doLogout}>Logout</button>
        </div>
      </nav>

      <div style={{ display:"flex", flex:1, minHeight:0, overflow:"hidden" }} className="vx-dash-body">
        {/* Sidebar */}
        <div style={S.sidebar} className="vx-sidebar">
          {navItems.map(it => (
            <button key={it.id} style={S.sitem(adminTab===it.id)} onClick={() => setAdminTab(it.id)}>
              <span style={{ fontSize:15 }}>{it.icon}</span>
              {it.label}
              {it.badge>0 && (
                <span style={{ marginLeft:"auto", background:adminTab===it.id?"rgba(0,0,0,.2)":"rgba(255,200,0,.15)", color:adminTab===it.id?"#000":C.gold, borderRadius:10, fontSize:10, padding:"1px 7px", fontWeight:700 }}>
                  {it.badge}
                </span>
              )}
            </button>
          ))}
        </div>

        <div style={{ flex:1, overflowY:"auto", padding:"24px 28px" }} className="vx-dash-main">
          {adminTab==="users"       && <AdminUsers />}
          {adminTab==="deposits"    && <AdminDeposits />}
          {adminTab==="wallets"     && <AdminWallets />}
          {adminTab==="withdrawals" && <AdminWithdrawals />}
          {adminTab==="pending"     && <AdminPending />}
          {adminTab==="fees"        && <AdminFees />}
          {adminTab==="markets"     && <AdminMarkets />}
          {adminTab==="crm"         && <AdminCRM />}
          {adminTab==="board"       && <AgentDepositBoard />}
          {adminTab==="settings"    && <AdminSettings />}
        </div>
      </div>
    </div>
  );
}
