import { useState, useCallback } from "react";
import { useApp } from "./AppContext";
import { C, S, btn, globalCSS } from "./theme";

export function SettingsPage() {
  const { user, updateUser, setView, doLogout, showToast, showAlert, alert } = useApp();
  const [activeTab, setActiveTab] = useState("profile");

  // Profile form
  const [name,  setName]  = useState(user?.name  || "");
  const [email, setEmail] = useState(user?.email || "");

  // Password form
  const [currentPw,  setCurrentPw]  = useState("");
  const [newPw,      setNewPw]      = useState("");
  const [confirmPw,  setConfirmPw]  = useState("");

  const saveProfile = useCallback(() => {
    if (!name || !email) { showAlert("Name and email required"); return; }
    updateUser({ ...user, name, email });
    showToast("Profile updated successfully", "success");
  }, [name, email, user, updateUser, showAlert, showToast]);

  const changePassword = useCallback(() => {
    if (!currentPw || !newPw || !confirmPw) { showAlert("Fill in all fields"); return; }
    if (user.password && currentPw !== user.password) { showAlert("Current password is incorrect"); return; }
    if (newPw.length < 6) { showAlert("New password must be at least 6 characters"); return; }
    if (newPw !== confirmPw) { showAlert("New passwords don't match"); return; }
    updateUser({ ...user, password: newPw });
    setCurrentPw(""); setNewPw(""); setConfirmPw("");
    showToast("Password changed successfully", "success");
  }, [currentPw, newPw, confirmPw, user, updateUser, showAlert, showToast]);

  const tabs = [
    { id: "profile",  label: "👤 Profile"   },
    { id: "security", label: "🔐 Security"  },
    { id: "kyc",      label: "📋 Verification" },
    { id: "notifications", label: "🔔 Notifications" },
  ];

  return (
    <div style={{ ...S.app, display: "flex", flexDirection: "column", height: "100vh" }}>
      <style>{globalCSS}</style>
      <nav style={S.nav}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 17, fontWeight: 800, cursor: "pointer", textTransform: "uppercase", color: C.text }} onClick={() => setView("dashboard")}>
          <img src="/logo.png" style={{ width: 36, height: 36, borderRadius: 10, objectFit: "cover" }} alt="VaultX" onError={e => { e.target.style.display = "none"; }} />
          VaultXcrypto
        </div>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <button style={{ ...btn("ghost"), padding: "7px 16px", fontSize: 13 }} onClick={() => setView("dashboard")}>← Dashboard</button>
          <button style={{ ...btn("danger"), padding: "7px 16px", fontSize: 13 }} onClick={doLogout}>Logout</button>
        </div>
      </nav>

      <div style={{ flex: 1, overflowY: "auto" }}>
        <div style={{ maxWidth: 860, margin: "0 auto", padding: "40px 24px" }}>
          <div style={S.hd}>Account Settings</div>
          <div style={{ fontSize: 13, color: C.text3, marginBottom: 32 }}>Manage your profile, security and preferences</div>

          {/* Account summary card */}
          <div style={{ ...S.card, marginBottom: 28, display: "flex", alignItems: "center", gap: 20 }}>
            <div style={{ width: 64, height: 64, borderRadius: "50%", background: `linear-gradient(135deg,${C.purple2},${C.purple})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, fontWeight: 800, color: "#fff", flexShrink: 0 }}>
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 18, fontWeight: 700, color: C.text }}>{user?.name}</div>
              <div style={{ fontSize: 13, color: C.text3 }}>{user?.email}</div>
              <div style={{ marginTop: 6, display: "flex", gap: 8 }}>
                <span style={S.tag(user?.tier === "Elite" ? "yellow" : user?.tier === "Pro" ? "purple" : "")}>{user?.tier}</span>
                <span style={S.tag(user?.verified ? "green" : "yellow")}>{user?.verified ? "✓ Verified" : "Unverified"}</span>
                <span style={S.tag("purple")}>Member since {user?.joined}</span>
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 11, color: C.text3, marginBottom: 4, textTransform: "uppercase", letterSpacing: ".06em" }}>Portfolio Value</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: C.purple3 }}>${(user?.portfolio || 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}</div>
            </div>
          </div>

          {/* Tabs */}
          <div style={{ display: "flex", gap: 4, marginBottom: 24, background: `rgba(255,200,0,.05)`, borderRadius: 12, padding: 4 }}>
            {tabs.map(t => (
              <button key={t.id} style={{ flex: 1, padding: "9px 12px", borderRadius: 10, border: "none", cursor: "pointer", fontFamily: "inherit", fontSize: 13, fontWeight: activeTab === t.id ? 700 : 400, background: activeTab === t.id ? `rgba(255,200,0,.18)` : "transparent", color: activeTab === t.id ? C.text : C.text3, transition: "all .15s" }} onClick={() => setActiveTab(t.id)}>
                {t.label}
              </button>
            ))}
          </div>

          {alert && <div style={{ background: "rgba(239,68,68,.1)", border: "1px solid rgba(239,68,68,.3)", borderRadius: 10, padding: "10px 14px", fontSize: 13, color: C.red, marginBottom: 16 }}>{alert}</div>}

          {/* Profile Tab */}
          {activeTab === "profile" && (
            <div style={S.card}>
              <div style={{ fontSize: 16, fontWeight: 700, color: C.text, marginBottom: 20 }}>Profile Information</div>
              <div style={S.g2}>
                <div>
                  <label style={S.label}>Full Name</label>
                  <input style={S.inp} value={name} onChange={e => setName(e.target.value)} placeholder="Your full name" />
                </div>
                <div>
                  <label style={S.label}>Email Address</label>
                  <input style={S.inp} type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com" />
                </div>
              </div>
              <div style={{ marginTop: 16, display: "flex", gap: 12 }}>
                <button style={{ ...btn("success"), padding: "11px 24px" }} onClick={saveProfile}>Save Changes</button>
              </div>
            </div>
          )}

          {/* Security Tab */}
          {activeTab === "security" && (
            <div>
              <div style={{ ...S.card, marginBottom: 20 }}>
                <div style={{ fontSize: 16, fontWeight: 700, color: C.text, marginBottom: 20 }}>Change Password</div>
                <div style={{ maxWidth: 420 }}>
                  <div style={{ marginBottom: 14 }}>
                    <label style={S.label}>Current Password</label>
                    <input type="password" style={S.inp} value={currentPw} onChange={e => setCurrentPw(e.target.value)} placeholder="••••••••" />
                  </div>
                  <div style={{ marginBottom: 14 }}>
                    <label style={S.label}>New Password</label>
                    <input type="password" style={S.inp} value={newPw} onChange={e => setNewPw(e.target.value)} placeholder="Min 6 characters" />
                  </div>
                  <div style={{ marginBottom: 20 }}>
                    <label style={S.label}>Confirm New Password</label>
                    <input type="password" style={S.inp} value={confirmPw} onChange={e => setConfirmPw(e.target.value)} placeholder="Repeat new password" onKeyDown={e => e.key === "Enter" && changePassword()} />
                  </div>
                  <button style={{ ...btn("success"), padding: "11px 24px" }} onClick={changePassword}>Update Password</button>
                </div>
              </div>

              <div style={S.card}>
                <div style={{ fontSize: 16, fontWeight: 700, color: C.text, marginBottom: 16 }}>Security Overview</div>
                {[
                  { label: "Password", status: "Set", color: "green", action: "Change" },
                  { label: "Two-Factor Authentication", status: "Not enabled", color: "yellow", action: "Enable" },
                  { label: "Email Verification", status: user?.verified ? "Verified" : "Not verified", color: user?.verified ? "green" : "red", action: "Verify" },
                  { label: "Login Activity", status: "Last login: Today", color: "green", action: "View" },
                ].map((item, i) => (
                  <div key={i} style={{ ...S.rowsb, padding: "14px 0", borderBottom: i < 3 ? `1px solid ${C.border2}` : "none" }}>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: C.text }}>{item.label}</div>
                      <div style={{ fontSize: 12, color: C.text3, marginTop: 3 }}>{item.status}</div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <span style={S.tag(item.color)}>{item.status}</span>
                      <button style={{ ...btn("ghost"), padding: "5px 14px", fontSize: 12 }} onClick={() => showToast("Coming soon", "info")}>{item.action}</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* KYC Tab */}
          {activeTab === "kyc" && (
            <div style={S.card}>
              <div style={{ fontSize: 16, fontWeight: 700, color: C.text, marginBottom: 8 }}>Identity Verification</div>
              <div style={{ fontSize: 13, color: C.text3, marginBottom: 24 }}>Complete verification to unlock higher limits and full platform access.</div>

              {[
                { level: "Level 1", title: "Email Verified", desc: "Basic account access", status: user?.verified ? "Complete" : "Pending", limit: "$1,000/day" },
                { level: "Level 2", title: "Identity Verified", desc: "Government ID required", status: "Pending", limit: "$50,000/day" },
                { level: "Level 3", title: "Advanced Verification", desc: "Proof of address + enhanced due diligence", status: "Not started", limit: "Unlimited" },
              ].map((item, i) => (
                <div key={i} style={{ ...S.scard, marginBottom: 12, display: "flex", alignItems: "center", gap: 16 }}>
                  <div style={{ width: 44, height: 44, borderRadius: "50%", background: item.status === "Complete" ? "rgba(34,197,94,.15)" : `rgba(255,200,0,.08)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>
                    {item.status === "Complete" ? "✅" : "📋"}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{item.level} — {item.title}</div>
                    <div style={{ fontSize: 12, color: C.text3, marginTop: 2 }}>{item.desc} · Limit: {item.limit}</div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={S.tag(item.status === "Complete" ? "green" : item.status === "Pending" ? "yellow" : "")}>{item.status}</span>
                    {item.status !== "Complete" && <button style={{ ...btn("primary"), padding: "5px 14px", fontSize: 12 }} onClick={() => { if(window.Tawk_API && window.Tawk_API.maximize) { window.Tawk_API.maximize(); } else { window.open('https://tawk.to/chat/6a2e5fe88b30661d42bef351/1jr2id950', '_blank'); } }}>Start</button>}
                  </div>
                </div>
              ))}
              <div style={{ marginTop: 16, fontSize: 12, color: C.text3 }}>For KYC verification assistance, click the live chat button below or use the chat widget.</div>
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === "notifications" && (
            <div style={S.card}>
              <div style={{ fontSize: 16, fontWeight: 700, color: C.text, marginBottom: 20 }}>Notification Preferences</div>
              {[
                ["Email Notifications", "Receive important account updates via email", true],
                ["Trade Confirmations", "Email confirmation for every trade", true],
                ["Deposit Alerts", "Notify when funds are credited to your account", true],
                ["Withdrawal Alerts", "Notify when withdrawal is processed", true],
                ["Price Alerts", "Get notified when your target price is reached", false],
                ["Security Alerts", "Immediate alerts for suspicious activity", true],
                ["Marketing Emails", "News, updates and promotions from VaultX", false],
              ].map(([label, desc, defaultOn], i) => (
                <div key={i} style={{ ...S.rowsb, padding: "14px 0", borderBottom: i < 6 ? `1px solid ${C.border2}` : "none" }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: C.text }}>{label}</div>
                    <div style={{ fontSize: 12, color: C.text3, marginTop: 3 }}>{desc}</div>
                  </div>
                  <div style={{ width: 44, height: 24, borderRadius: 12, background: defaultOn ? `linear-gradient(135deg,${C.purple2},${C.purple})` : `rgba(255,255,255,.1)`, cursor: "pointer", position: "relative", flexShrink: 0, transition: "background .2s" }} onClick={() => showToast("Preference saved", "success")}>
                    <div style={{ position: "absolute", top: 2, left: defaultOn ? 22 : 2, width: 20, height: 20, borderRadius: "50%", background: "#fff", transition: "left .2s" }} />
                  </div>
                </div>
              ))}
              <button style={{ ...btn("success"), marginTop: 20, padding: "11px 24px" }} onClick={() => showToast("Notification preferences saved", "success")}>Save Preferences</button>
            </div>
          )}

          {/* Danger Zone */}
          <div style={{ ...S.card, marginTop: 24, border: "1px solid rgba(239,68,68,.2)" }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: C.red, marginBottom: 8 }}>Danger Zone</div>
            <div style={{ fontSize: 13, color: C.text3, marginBottom: 16 }}>These actions are irreversible. Please proceed with caution.</div>
            <div style={{ display: "flex", gap: 12 }}>
              <button style={{ ...btn("danger"), padding: "10px 20px" }} onClick={() => { if (window.confirm("Are you sure you want to log out of all devices?")) { doLogout(); } }}>
                Logout All Devices
              </button>
              <button style={{ ...btn("ghost"), padding: "10px 20px", outline: "1px solid rgba(239,68,68,.3)", color: C.red }} onClick={() => showToast("Please contact support to close your account", "info")}>
                Close Account
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
