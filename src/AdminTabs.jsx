import { useState, useCallback, useEffect } from "react";
import { useApp, usePrices, COINS, BASE_PRICES, fmt, fmtCrypto, createHoldings, createStaking } from "./AppContext";
import { C, S, btn } from "./theme";
import { CoinIcon, Tag, EmptyState } from "./components";

// ─── EXCEL EXPORT ─────────────────────────────────────────────────────────────
function exportToExcel(deposits, companyName) {
  const fmtDate = s => {
    if (!s) return '';
    try { return new Date(s+'T00:00:00').toLocaleDateString('en-GB'); } catch(e) { return s; }
  };

  // Build CSV with BOM for Excel UTF-8
  const headers = ['#','Amount (USD)','Date','Method','Agent','Client','Closer','Company','Running Total'];
  let running = 0;
  const rows = [...deposits].reverse().map((d, i) => {
    running += d.amount;
    return [
      i + 1,
      d.amount,
      fmtDate(d.date),
      d.method,
      d.agent || '',
      d.client || '',
      d.closer || '',
      companyName || '',
      running.toFixed(2),
    ];
  }).reverse(); // back to newest first

  // Recalculate running total newest first for display
  let run2 = 0;
  const rev = [...deposits].reverse();
  const runMap = {};
  rev.forEach(d => { run2 += d.amount; runMap[d.id] = run2; });

  const finalRows = deposits.map((d, i) => [
    i + 1,
    d.amount,
    fmtDate(d.date),
    d.method,
    d.agent || '',
    d.client || '',
    d.closer || '',
    companyName || '',
    runMap[d.id]?.toFixed(2) || '',
  ]);

  const total = deposits.reduce((a, d) => a + d.amount, 0);
  const crypto = deposits.filter(d=>d.method==='Crypto').reduce((a,d)=>a+d.amount,0);
  const wire   = deposits.filter(d=>d.method==='Wire').reduce((a,d)=>a+d.amount,0);

  let csv = '\uFEFF'; // BOM for Excel
  // Title row
  if (companyName) csv += `${companyName} — Agent Deposit Report\n`;
  csv += `Exported: ${new Date().toLocaleString('en-GB')}\n\n`;
  // Headers
  csv += headers.map(h => `"${h}"`).join(',') + '\n';
  // Data rows
  finalRows.forEach(row => {
    csv += row.map(v => `"${v}"`).join(',') + '\n';
  });
  // Summary
  csv += `\n`;
  csv += `"SUMMARY"\n`;
  csv += `"Grand Total","$${total.toFixed(2)}"\n`;
  csv += `"Via Crypto","$${crypto.toFixed(2)}"\n`;
  csv += `"Via Wire","$${wire.toFixed(2)}"\n`;
  csv += `"Total Entries","${deposits.length}"\n`;

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = `${companyName||'VaultX'}_Deposits_${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ─── ADMIN USERS ──────────────────────────────────────────────────────────────
export function AdminUsers() {
  const { users, setUsers, setModal, showToast, showAlert, registerUser } = useApp();
  const [form, setForm] = useState({ name:"", email:"", password:"", tier:"Basic", balance:"" });
  const [saving, setSaving] = useState(false);

  const doAdd = useCallback(async () => {
    if (!form.name.trim())     { showAlert("Name is required"); return; }
    if (!form.email.trim())    { showAlert("Email is required"); return; }
    if (!form.password.trim()) { showAlert("Password is required"); return; }
    if (users.some(u => (u.email||"").toLowerCase() === form.email.toLowerCase())) {
      showAlert("Email already exists"); return;
    }
    setSaving(true);
    const initialBalance = Number(form.balance) || 0;
    const result = await registerUser({
      id:      `U${String(users.length+1).padStart(4,"0")}`,
      name:    form.name.trim(),
      email:   form.email.toLowerCase().trim(),
      rawPassword: form.password,
      balance:  initialBalance,
      portfolio: initialBalance,
      holdings: createHoldings(initialBalance),
      staking:  createStaking(0),
      joined:   new Date().toLocaleDateString(),
      verified: true,
      status:   "Active",
      tier:     form.tier,
    });
    setSaving(false);
    if (result.success) {
      setForm({ name:"", email:"", password:"", tier:"Basic", balance:"" });
      showToast("✅ Client added!", "success");
    } else {
      showAlert("❌ " + (result.error || "Failed to save. Check console."));
    }
  }, [form, users, registerUser, showAlert, showToast]);

  const totalEquity    = users.reduce((a,u) => a+u.balance, 0);
  const totalPortfolio = users.reduce((a,u) => a+u.portfolio, 0);

  return (
    <div>
      <div style={{ ...S.rowsb, marginBottom:22 }}>
        <div><div style={S.hd}>Users & Funds</div><div style={S.sub}>Manage all client accounts and balances</div></div>
        <button style={btn()} onClick={() => showToast("CSV export ready","success")}>Export CSV</button>
      </div>

      <div style={{ ...S.g4, marginBottom:22 }}>
        {[
          { l:"Total Clients",    v:users.length },
          { l:"Active",          v:users.filter(u=>u.status==="Active").length },
          { l:"Total Cash",      v:"$"+fmt(totalEquity) },
          { l:"Total Portfolio", v:"$"+fmt(totalPortfolio) },
        ].map((s,i) => (
          <div key={i} style={S.scard}>
            <div style={{ fontSize:10, color:C.text3, marginBottom:6, textTransform:"uppercase", letterSpacing:".06em" }}>{s.l}</div>
            <div style={{ fontSize:24, fontWeight:800, color:C.text }}>{s.v}</div>
          </div>
        ))}
      </div>

      {/* Add Client */}
      <div style={{ ...S.card, marginBottom:22 }}>
        <div style={{ fontSize:16, fontWeight:700, color:C.text, marginBottom:18 }}>Add New Client</div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:14, marginBottom:16 }}>
          <div>
            <label style={S.label}>Full Name</label>
            <input style={S.inp} autoComplete="off" name="client-name" value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} placeholder="Jane Doe"/>
          </div>
          <div>
            <label style={S.label}>Email</label>
            <input style={S.inp} autoComplete="off" name="client-email" type="text" value={form.email} onChange={e=>setForm(f=>({...f,email:e.target.value}))} placeholder="jane@email.com"/>
          </div>
          <div>
            <label style={S.label}>Password</label>
            <input style={S.inp} autoComplete="new-password" name="client-password" type="password" value={form.password} onChange={e=>setForm(f=>({...f,password:e.target.value}))} placeholder="••••••"/>
          </div>
          <div>
            <label style={S.label}>Initial Balance ($)</label>
            <input style={S.inp} autoComplete="off" name="client-balance" type="number" value={form.balance} onChange={e=>setForm(f=>({...f,balance:e.target.value}))} placeholder="0"/>
          </div>
          <div>
            <label style={S.label}>Tier</label>
            <select style={S.sel} value={form.tier} onChange={e=>setForm(f=>({...f,tier:e.target.value}))}>
              {["Basic","Pro","Elite"].map(t=><option key={t} value={t}>{t}</option>)}
            </select>
          </div>
        </div>
        <button style={{ ...btn("success"), padding:"11px 24px", fontSize:14, opacity:saving?.7:1 }} onClick={doAdd} disabled={saving}>
          {saving ? "⏳ Saving..." : "+ Add Client"}
        </button>
      </div>

      {/* Users Table */}
      <div style={S.card}>
        {users.length === 0 ? (
          <EmptyState icon="👥" text="No clients yet. Add one above." />
        ) : (
          <div style={{ overflowX:"auto" }}>
            <table style={S.tbl}>
              <thead><tr>{["ID","Name","Email","Cash Balance","Portfolio","Tier","Status","Joined","Actions"].map(h=><th key={h} style={S.th}>{h}</th>)}</tr></thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id}>
                    <td style={{ ...S.td, fontFamily:"monospace", color:C.text3, fontSize:11 }}>{u.id}</td>
                    <td style={{ ...S.td, fontWeight:700, color:C.text }}>{u.name}</td>
                    <td style={{ ...S.td, fontSize:12, color:C.text2 }}>{u.email}</td>
                    <td style={{ ...S.td, fontFamily:"monospace", color:C.green, fontWeight:700 }}>${fmt(u.balance)}</td>
                    <td style={{ ...S.td, fontFamily:"monospace" }}>${fmt(u.portfolio)}</td>
                    <td style={S.td}><Tag c={u.tier==="Elite"?"yellow":u.tier==="Pro"?"purple":""}>{u.tier}</Tag></td>
                    <td style={S.td}><Tag c={u.status==="Active"?"green":"red"}>{u.status}</Tag></td>
                    <td style={{ ...S.td, color:C.text3, fontSize:12 }}>{u.joined}</td>
                    <td style={S.td}>
                      <div style={S.row}>
                        <button style={{ ...btn("success"), padding:"4px 12px", fontSize:12 }} onClick={() => setModal({type:"fundUser", user:u})}>+ Fund</button>
                        <button style={{ ...btn("primary"), padding:"4px 12px", fontSize:12 }} onClick={() => setModal({type:"assignWallet", user:u})}>🏦 Wallet</button>
                        <button style={{ ...btn("ghost"), padding:"4px 12px", fontSize:12 }} onClick={() => setModal({type:"userDetail", user:u})}>View</button>
                        <button style={{ ...btn("danger"), padding:"4px 12px", fontSize:12 }} onClick={() => { setUsers(prev=>prev.filter(x=>x.id!==u.id)); showToast("Client removed","info"); }}>Remove</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── ADMIN DEPOSITS ───────────────────────────────────────────────────────────
export function AdminDeposits() {
  const { users, setUsers, setUser, user: currentUser, pending, setPending, addTx, showAlert, showToast, walletAssignments, assignWallet } = useApp();
  const [form, setForm] = useState({ user:"", coin:"BTC", amount:"", network:"ERC-20" });
  const pendingD = pending.filter(p => p.type === "Deposit");

  const doDeposit = useCallback(() => {
    const target = form.user;
    const amount = Number(form.amount);
    if (!target || !amount || amount <= 0) { showAlert("Select client and enter amount"); return; }
    const idx = users.findIndex(u => u.email === target);
    if (idx === -1) { showAlert("User not found"); return; }

    const coinPrice = BASE_PRICES[form.coin] || 1;
    const qty = +(amount / coinPrice).toFixed(8);

    // Add crypto to holdings
    const existingHoldings = [...(users[idx].holdings || [])];
    const holdingIdx = existingHoldings.findIndex(h => h.sym === form.coin);
    if (holdingIdx !== -1) {
      const old = existingHoldings[holdingIdx];
      const newQty = +(old.qty + qty).toFixed(8);
      const newAvg = ((old.qty * (old.avgBuy||coinPrice)) + (qty * coinPrice)) / newQty;
      existingHoldings[holdingIdx] = { ...old, qty: newQty, avgBuy: +newAvg.toFixed(2) };
    } else {
      existingHoldings.push({ sym: form.coin, qty, avgBuy: +coinPrice.toFixed(2) });
    }

    const updated = [...users];
    updated[idx] = {
      ...updated[idx],
      balance:   +(updated[idx].balance + amount).toFixed(2),
      portfolio: +(updated[idx].portfolio + amount).toFixed(2),
      holdings:  existingHoldings,
    };
    setUsers(updated);
    if (currentUser && currentUser.email === target) setUser(updated[idx]);

    const tx = {
      id: `DP${Date.now()}`, user: target, type:"Deposit", coin: form.coin,
      amount: qty, usd: amount, fee: +(amount*.001).toFixed(2),
      submitted: new Date().toLocaleString(), network: form.network, status:"Completed",
    };
    setPending(prev => [tx, ...prev]);
    addTx(target, {
      id: tx.id, type:"Deposit", symbol: form.coin,
      amount: qty, value: amount, fee: tx.fee,
      status:"Completed", date: new Date().toLocaleDateString(),
      notes: `Credited by admin. Network: ${form.network}`,
    });
    setForm({ user:"", coin:"BTC", amount:"", network:"ERC-20" });
    showToast(`✅ $${fmt(amount)} deposited to ${target}`, "success");
  }, [form, users, currentUser, setUsers, setUser, setPending, addTx, showAlert, showToast]);

  return (
    <div>
      <div style={S.hd}>Deposit Desk</div>
      <div style={S.sub}>Credit deposits directly to client accounts</div>

      <div style={{ display:"grid", gridTemplateColumns:"1.3fr 0.7fr", gap:20, marginBottom:22 }}>
        <div style={S.card}>
          <div style={{ fontSize:16, fontWeight:700, color:C.text, marginBottom:18 }}>Manual Vault Deposit</div>
          <div style={{ display:"grid", gap:14 }}>
            <div>
              <label style={S.label}>Client</label>
              <select style={S.sel} value={form.user} onChange={e=>setForm(f=>({...f,user:e.target.value}))}>
                <option value="">Select client…</option>
                {users.map(u=><option key={u.email} value={u.email}>{u.name} — {u.email} (${fmt(u.balance)})</option>)}
              </select>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
              <div>
                <label style={S.label}>Coin</label>
                <select style={S.sel} value={form.coin} onChange={e=>setForm(f=>({...f,coin:e.target.value}))}>
                  {COINS.map(c=><option key={c.sym} value={c.sym}>{c.sym}</option>)}
                </select>
              </div>
              <div>
                <label style={S.label}>Network</label>
                <select style={S.sel} value={form.network} onChange={e=>setForm(f=>({...f,network:e.target.value}))}>
                  {["ERC-20","BEP-20","TRC-20","Native BTC","Native SOL","Polygon"].map(n=><option key={n} value={n}>{n}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label style={S.label}>Amount (USD)</label>
              <input type="number" min="0" style={S.inp} placeholder="1000.00" value={form.amount} onChange={e=>setForm(f=>({...f,amount:e.target.value}))} onKeyDown={e=>e.key==="Enter"&&doDeposit()}/>
            </div>
            {form.amount && form.user && (
              <div style={{ ...S.scard, fontSize:13 }}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                  <span style={{ color:C.text3 }}>Crypto equivalent</span>
                  <strong style={{ color:C.text }}>{fmtCrypto(Number(form.amount)/(BASE_PRICES[form.coin]||1), form.coin)} {form.coin}</strong>
                </div>
              </div>
            )}
            <div style={{ display:"flex", gap:12 }}>
              <button style={{ ...btn("success"), flex:1, padding:"12px", fontSize:14 }} onClick={doDeposit}>Credit Deposit</button>
              <button style={{ ...btn("ghost"), padding:"12px 20px" }} onClick={()=>setForm({user:"",coin:"BTC",amount:"",network:"ERC-20"})}>Reset</button>
            </div>
          </div>
        </div>
        <div style={S.card}>
          <div style={{ fontSize:16, fontWeight:700, color:C.text, marginBottom:16 }}>Vault Health</div>
          <div style={{ display:"grid", gap:10 }}>
            {[
              { label:"Total Clients",   value: users.length },
              { label:"Total Cash",      value: "$"+fmt(users.reduce((a,u)=>a+u.balance,0)) },
              { label:"Total Portfolio", value: "$"+fmt(users.reduce((a,u)=>a+u.portfolio,0)) },
              { label:"Pending Deposits",value: pendingD.length },
              { label:"Wallet Assignments", value: Object.keys(walletAssignments||{}).length },
            ].map(item => (
              <div key={item.label} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"11px 14px", background:`rgba(255,200,0,.05)`, borderRadius:10 }}>
                <span style={{ color:C.text2, fontSize:13 }}>{item.label}</span>
                <strong style={{ color:C.text }}>{item.value}</strong>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Deposit Log */}
      <div style={S.card}>
        <div style={{ fontSize:16, fontWeight:700, color:C.text, marginBottom:16 }}>Deposit Log</div>
        <div style={{ overflowX:"auto" }}>
          <table style={S.tbl}>
            <thead><tr>{["TX ID","Client","Coin","Crypto Amount","USD Value","Fee","Network","Date","Status"].map(h=><th key={h} style={S.th}>{h}</th>)}</tr></thead>
            <tbody>
              {pendingD.length === 0 ? (
                <tr><td colSpan={9} style={{ ...S.td, textAlign:"center", color:C.text3, padding:"30px" }}>No deposits yet.</td></tr>
              ) : pendingD.map(tx => (
                <tr key={tx.id}>
                  <td style={{ ...S.td, fontFamily:"monospace", color:C.text3, fontSize:11 }}>{tx.id}</td>
                  <td style={{ ...S.td, fontSize:12 }}>{tx.user||tx.user_email}</td>
                  <td style={S.td}><div style={S.row}><CoinIcon sym={tx.coin} size={20}/><span style={{ fontWeight:700 }}>{tx.coin}</span></div></td>
                  <td style={{ ...S.td, fontFamily:"monospace" }}>{fmtCrypto(tx.amount, tx.coin)}</td>
                  <td style={{ ...S.td, fontFamily:"monospace", fontWeight:700, color:C.green }}>${fmt(tx.usd)}</td>
                  <td style={{ ...S.td, fontFamily:"monospace", color:C.text3 }}>${fmt(tx.fee)}</td>
                  <td style={{ ...S.td, fontSize:12 }}>{tx.network}</td>
                  <td style={{ ...S.td, fontSize:11, color:C.text3 }}>{tx.submitted}</td>
                  <td style={S.td}><Tag c="green">Completed</Tag></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── ADMIN WALLETS ────────────────────────────────────────────────────────────
export function AdminWallets() {
  const { users, walletAssignments, assignWallet, removeWallet, showToast, showAlert } = useApp();
  const [form, setForm] = useState({ user:"", coin:"BTC", address:"", network:"ERC-20 (Ethereum)", walletName:"", fee:"" });

  const doAssign = useCallback(() => {
    if (!form.user || !form.address || !form.coin) { showAlert("Select client, coin and enter wallet address"); return; }
    assignWallet(form.user, {
      coin:       form.coin,
      address:    form.address,
      network:    form.network,
      walletName: form.walletName || form.coin + " Wallet",
      fee:        form.fee,
      assignedAt: new Date().toLocaleString(),
    });
    setForm({ user:"", coin:"BTC", address:"", network:"ERC-20 (Ethereum)", walletName:"", fee:"" });
  }, [form, assignWallet, showAlert]);

  const assignedUsers = users.filter(u => walletAssignments[u.email]);
  const unassignedUsers = users.filter(u => !walletAssignments[u.email]);

  return (
    <div>
      <div style={S.hd}>Wallet Management</div>
      <div style={S.sub}>Assign deposit wallet addresses to clients</div>

      {/* Stats */}
      <div style={{ ...S.g3, marginBottom:22 }}>
        {[
          { l:"Total Clients",    v:users.length,           c:C.text },
          { l:"Wallets Assigned", v:assignedUsers.length,   c:C.green },
          { l:"Unassigned",       v:unassignedUsers.length, c:unassignedUsers.length>0?C.gold:C.green },
        ].map((s,i) => (
          <div key={i} style={S.scard}>
            <div style={{ fontSize:10, color:C.text3, marginBottom:6, textTransform:"uppercase", letterSpacing:".06em" }}>{s.l}</div>
            <div style={{ fontSize:24, fontWeight:800, color:s.c }}>{s.v}</div>
          </div>
        ))}
      </div>

      {/* Assign Form */}
      <div style={{ ...S.card, marginBottom:22 }}>
        <div style={{ fontSize:16, fontWeight:700, color:C.text, marginBottom:18 }}>Assign Deposit Wallet</div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:14, marginBottom:14 }}>
          <div>
            <label style={S.label}>Client</label>
            <select style={S.sel} value={form.user} onChange={e=>setForm(f=>({...f,user:e.target.value}))}>
              <option value="">Select client…</option>
              {users.map(u=>(
                <option key={u.email} value={u.email}>
                  {u.name} — {u.email} {walletAssignments[u.email]?"(has wallet)":""}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label style={S.label}>Coin</label>
            <select style={S.sel} value={form.coin} onChange={e=>setForm(f=>({...f,coin:e.target.value}))}>
              {COINS.map(c=><option key={c.sym} value={c.sym}>{c.sym} — {c.name}</option>)}
            </select>
          </div>
          <div>
            <label style={S.label}>Network</label>
            <select style={S.sel} value={form.network} onChange={e=>setForm(f=>({...f,network:e.target.value}))}>
              {["ERC-20 (Ethereum)","BEP-20 (BSC)","TRC-20 (TRON)","Native BTC","Native SOL","Native XRP","Polygon (MATIC)","Avalanche C-Chain","Arbitrum One"].map(n=><option key={n} value={n}>{n}</option>)}
            </select>
          </div>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr 1fr", gap:14, marginBottom:16 }}>
          <div>
            <label style={S.label}>Wallet Address</label>
            <input style={S.inp} value={form.address} onChange={e=>setForm(f=>({...f,address:e.target.value}))} placeholder="bc1q… or 0x… or T…"/>
          </div>
          <div>
            <label style={S.label}>Wallet Name (optional)</label>
            <input style={S.inp} value={form.walletName} onChange={e=>setForm(f=>({...f,walletName:e.target.value}))} placeholder="e.g. BTC Cold Storage"/>
          </div>
          <div>
            <label style={S.label}>Deposit Fee (optional)</label>
            <input style={S.inp} value={form.fee} onChange={e=>setForm(f=>({...f,fee:e.target.value}))} placeholder="e.g. 0.001 BTC"/>
          </div>
        </div>
        {form.address && (
          <div style={{ ...S.scard, marginBottom:14, fontSize:13 }}>
            <div style={{ color:C.text3, marginBottom:4 }}>Preview — client will see:</div>
            <div style={{ color:C.text, fontFamily:"monospace", wordBreak:"break-all" }}>{form.address}</div>
            <div style={{ color:C.text3, fontSize:11, marginTop:4 }}>Network: {form.network} · Coin: {form.coin}</div>
          </div>
        )}
        <button style={{ ...btn("success"), padding:"11px 24px", fontSize:14 }} onClick={doAssign}>
          🏦 Assign Wallet
        </button>
      </div>

      {/* Current Assignments */}
      <div style={S.card}>
        <div style={{ fontSize:16, fontWeight:700, color:C.text, marginBottom:16 }}>Current Wallet Assignments</div>
        {assignedUsers.length === 0 ? (
          <EmptyState icon="🏦" text="No wallets assigned yet. Use the form above to assign wallet addresses to clients." />
        ) : (
          <div style={{ overflowX:"auto" }}>
            <table style={S.tbl}>
              <thead><tr>{["Client","Email","Coin","Network","Wallet Address","Wallet Name","Fee","Assigned","Actions"].map(h=><th key={h} style={S.th}>{h}</th>)}</tr></thead>
              <tbody>
                {assignedUsers.map(u => {
                  const w = walletAssignments[u.email];
                  return (
                    <tr key={u.id}>
                      <td style={{ ...S.td, fontWeight:700, color:C.text }}>{u.name}</td>
                      <td style={{ ...S.td, fontSize:12, color:C.text2 }}>{u.email}</td>
                      <td style={S.td}><div style={S.row}><CoinIcon sym={w.coin} size={20}/><span style={{ fontWeight:700 }}>{w.coin}</span></div></td>
                      <td style={{ ...S.td, fontSize:12 }}>{w.network}</td>
                      <td style={{ ...S.td, fontFamily:"monospace", fontSize:11, maxWidth:160, overflow:"hidden", textOverflow:"ellipsis" }}>{w.address}</td>
                      <td style={{ ...S.td, fontSize:12 }}>{w.walletName||"—"}</td>
                      <td style={{ ...S.td, fontSize:12, color:C.gold }}>{w.fee||"—"}</td>
                      <td style={{ ...S.td, fontSize:11, color:C.text3 }}>{w.assignedAt}</td>
                      <td style={S.td}>
                        <div style={S.row}>
                          <button style={{ ...btn("ghost"), padding:"4px 12px", fontSize:12 }}
                            onClick={() => { navigator.clipboard?.writeText(w.address); showToast("Address copied!","success"); }}>
                            Copy
                          </button>
                          <button style={{ ...btn("danger"), padding:"4px 12px", fontSize:12 }}
                            onClick={() => { removeWallet(u.email); showToast("Wallet removed","info"); }}>
                            Remove
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Unassigned clients warning */}
      {unassignedUsers.length > 0 && (
        <div style={{ ...S.card, marginTop:18, border:"1px solid rgba(245,158,11,.25)" }}>
          <div style={{ fontSize:14, fontWeight:700, color:C.gold, marginBottom:10 }}>⚠️ Clients Without Wallet Assignment</div>
          <div style={{ fontSize:13, color:C.text3, marginBottom:12 }}>These clients don't have a deposit address assigned yet:</div>
          <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
            {unassignedUsers.map(u => (
              <span key={u.id} style={{ ...S.tag("yellow"), cursor:"pointer" }}
                onClick={() => setForm(f=>({...f,user:u.email}))}>
                {u.name}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── ADMIN WITHDRAWALS ────────────────────────────────────────────────────────
export function AdminWithdrawals() {
  const { users, pending, setPending, approveWithdrawal, showAlert, showToast } = useApp();
  const [form, setForm] = useState({ user:"", coin:"BTC", amount:"", network:"ERC-20" });

  const pendingW = pending.filter(p => p.type === "Withdrawal" || p.type === "Withdrawal Request");

  const doCreate = useCallback(() => {
    const target = form.user;
    const amount = Number(form.amount);
    if (!target||!amount||amount<=0) { showAlert("Select user and enter amount"); return; }
    const tx = {
      id: `WD${Date.now()}`, user: target, type:"Withdrawal",
      coin: form.coin,
      amount: +(amount/(BASE_PRICES[form.coin]||1)).toFixed(8),
      usd: amount, fee: +(amount*.0015).toFixed(2),
      submitted: new Date().toLocaleString(), network: form.network,
      status:"Pending",
    };
    setPending(prev=>[tx,...prev]);
    setForm({ user:"", coin:"BTC", amount:"", network:"ERC-20" });
    showToast("Withdrawal request created","success");
  }, [form, setPending, showAlert, showToast]);

  return (
    <div>
      <div style={S.hd}>Withdrawal Requests</div>
      <div style={S.sub}>Review, approve or reject client withdrawal requests</div>

      <div style={{ ...S.g3, marginBottom:22 }}>
        {[
          { l:"Pending Withdrawals", v:pendingW.length,                                              c:C.gold },
          { l:"Total Amount",        v:"$"+fmt(pendingW.reduce((a,b)=>a+b.usd,0)),                   c:C.text },
          { l:"Total Fees",          v:"$"+fmt(pendingW.reduce((a,b)=>a+(b.fee||0),0)),              c:C.green },
        ].map((s,i) => (
          <div key={i} style={{ ...S.scard, borderLeft:`3px solid ${s.c}` }}>
            <div style={{ fontSize:10, color:C.text3, marginBottom:6, textTransform:"uppercase" }}>{s.l}</div>
            <div style={{ fontSize:22, fontWeight:800, color:C.text }}>{s.v}</div>
          </div>
        ))}
      </div>

      {/* Create withdrawal */}
      <div style={{ ...S.card, marginBottom:22 }}>
        <div style={{ fontSize:16, fontWeight:700, color:C.text, marginBottom:18 }}>Create Withdrawal Request</div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14, marginBottom:16 }}>
          <div>
            <label style={S.label}>Client</label>
            <select style={S.sel} value={form.user} onChange={e=>setForm(f=>({...f,user:e.target.value}))}>
              <option value="">Select client…</option>
              {users.map(u=><option key={u.email} value={u.email}>{u.name} (${fmt(u.balance)})</option>)}
            </select>
          </div>
          <div>
            <label style={S.label}>Coin</label>
            <select style={S.sel} value={form.coin} onChange={e=>setForm(f=>({...f,coin:e.target.value}))}>
              {COINS.map(c=><option key={c.sym} value={c.sym}>{c.sym}</option>)}
            </select>
          </div>
          <div>
            <label style={S.label}>Network</label>
            <select style={S.sel} value={form.network} onChange={e=>setForm(f=>({...f,network:e.target.value}))}>
              {["ERC-20","BEP-20","TRC-20","Native BTC","Native SOL"].map(n=><option key={n} value={n}>{n}</option>)}
            </select>
          </div>
          <div>
            <label style={S.label}>Amount (USD)</label>
            <input type="number" min="0" style={S.inp} value={form.amount} onChange={e=>setForm(f=>({...f,amount:e.target.value}))} placeholder="1000" onKeyDown={e=>e.key==="Enter"&&doCreate()}/>
          </div>
        </div>
        <button style={{ ...btn("success"), padding:"11px 24px", fontSize:14 }} onClick={doCreate}>Create Request</button>
      </div>

      {/* Withdrawal table */}
      <div style={S.card}>
        <div style={{ overflowX:"auto" }}>
          <table style={S.tbl}>
            <thead><tr>{["TX ID","Client","Coin","Crypto Amount","USD","Fee","Network","Submitted","Status","Action"].map(h=><th key={h} style={S.th}>{h}</th>)}</tr></thead>
            <tbody>
              {pendingW.length === 0 ? (
                <tr><td colSpan={10} style={{ ...S.td, textAlign:"center", color:C.text3, padding:"30px" }}>No pending withdrawals.</td></tr>
              ) : pendingW.map(tx => (
                <tr key={tx.id}>
                  <td style={{ ...S.td, fontFamily:"monospace", color:C.text3, fontSize:11 }}>{tx.id}</td>
                  <td style={{ ...S.td, fontSize:12 }}>{tx.user||tx.user_email}</td>
                  <td style={S.td}><div style={S.row}><CoinIcon sym={tx.coin} size={20}/><span style={{ fontWeight:700 }}>{tx.coin}</span></div></td>
                  <td style={{ ...S.td, fontFamily:"monospace" }}>{fmtCrypto(tx.amount, tx.coin)}</td>
                  <td style={{ ...S.td, fontFamily:"monospace", fontWeight:700 }}>${fmt(tx.usd)}</td>
                  <td style={{ ...S.td, fontFamily:"monospace", color:C.gold }}>${fmt(tx.fee||0)}</td>
                  <td style={{ ...S.td, fontSize:12 }}>{tx.network}</td>
                  <td style={{ ...S.td, fontSize:11, color:C.text3 }}>{tx.submitted}</td>
                  <td style={S.td}><Tag c="yellow">Pending</Tag></td>
                  <td style={S.td}>
                    <div style={S.row}>
                      <button style={{ ...btn("success"), padding:"4px 12px", fontSize:12 }}
                        onClick={() => approveWithdrawal(tx.id)}>
                        ✓ Approve
                      </button>
                      <button style={{ ...btn("danger"), padding:"4px 12px", fontSize:12 }}
                        onClick={() => { setPending(prev=>prev.filter(t=>t.id!==tx.id)); showToast("Withdrawal rejected","info"); }}>
                        ✗ Reject
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── ADMIN PENDING ────────────────────────────────────────────────────────────
export function AdminPending() {
  const { pending, setPending, approveWithdrawal, showToast } = useApp();
  const pendingW = pending.filter(p=>p.type==="Withdrawal"||p.type==="Withdrawal Request");
  const pendingD = pending.filter(p=>p.type==="Deposit");

  return (
    <div>
      <div style={S.hd}>Pending Transactions</div>
      <div style={S.sub}>All transactions awaiting review or processing</div>
      <div style={{ ...S.g3, marginBottom:22 }}>
        {[
          { l:"Total Pending",  v:pending.length,  c:C.gold },
          { l:"Withdrawals",    v:pendingW.length,  c:C.red },
          { l:"Deposits",       v:pendingD.length,  c:C.green },
        ].map((s,i) => (
          <div key={i} style={{ ...S.scard, borderLeft:`3px solid ${s.c}` }}>
            <div style={{ fontSize:10, color:C.text3, marginBottom:6, textTransform:"uppercase" }}>{s.l}</div>
            <div style={{ fontSize:32, fontWeight:800, color:C.text }}>{s.v}</div>
          </div>
        ))}
      </div>
      <div style={S.card}>
        <div style={{ overflowX:"auto" }}>
          <table style={S.tbl}>
            <thead><tr>{["TX ID","Client","Type","Coin","Crypto","USD","Fee","Network","Submitted","Actions"].map(h=><th key={h} style={S.th}>{h}</th>)}</tr></thead>
            <tbody>
              {pending.length === 0 ? (
                <tr><td colSpan={10} style={{ ...S.td, textAlign:"center", color:C.text3, padding:"30px" }}>No pending transactions.</td></tr>
              ) : pending.map(tx => (
                <tr key={tx.id}>
                  <td style={{ ...S.td, fontFamily:"monospace", color:C.text3, fontSize:11 }}>{tx.id}</td>
                  <td style={{ ...S.td, fontSize:12 }}>{tx.user||tx.user_email}</td>
                  <td style={S.td}><Tag c={tx.type==="Deposit"?"green":"red"}>{tx.type}</Tag></td>
                  <td style={S.td}><div style={S.row}><CoinIcon sym={tx.coin} size={20}/><span style={{ fontWeight:700 }}>{tx.coin}</span></div></td>
                  <td style={{ ...S.td, fontFamily:"monospace" }}>{fmtCrypto(tx.amount, tx.coin)}</td>
                  <td style={{ ...S.td, fontFamily:"monospace" }}>${fmt(tx.usd)}</td>
                  <td style={{ ...S.td, fontFamily:"monospace", color:C.gold }}>${fmt(tx.fee||0)}</td>
                  <td style={{ ...S.td, fontSize:12 }}>{tx.network}</td>
                  <td style={{ ...S.td, fontSize:11, color:C.text3 }}>{tx.submitted}</td>
                  <td style={S.td}>
                    <div style={S.row}>
                      <button style={{ ...btn("success"), padding:"4px 12px", fontSize:12 }}
                        onClick={() => {
                          if (tx.type==="Withdrawal"||tx.type==="Withdrawal Request") approveWithdrawal(tx.id);
                          else { setPending(prev=>prev.filter(t=>t.id!==tx.id)); showToast("TX approved","success"); }
                        }}>Approve</button>
                      <button style={{ ...btn("danger"), padding:"4px 12px", fontSize:12 }}
                        onClick={() => { setPending(prev=>prev.filter(t=>t.id!==tx.id)); showToast("TX rejected","info"); }}>Reject</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── ADMIN FEES ───────────────────────────────────────────────────────────────
export function AdminFees() {
  const { users, feeReqs, setFeeReqs, pending, showAlert, showToast, confirmFeePaid } = useApp();
  const [form, setForm] = useState({ user:"", amount:"", reason:"Service fee", currency:"USD" });
  const rev = pending.reduce((a,b)=>a+(b.fee||0),0) * .6;

  const doCreate = useCallback(() => {
    const target = form.user;
    const amount = Number(form.amount);
    if (!target||!amount||amount<=0) { showAlert("Select client and enter amount"); return; }
    const req = {
      id: `FR${String(feeReqs.length+1).padStart(5,"0")}`,
      user: target, amount, reason: form.reason||"Service fee",
      currency: form.currency, created: new Date().toLocaleString(),
      status: "Pending",
    };
    setFeeReqs(prev=>[req,...prev]);
    setForm({ user:"", amount:"", reason:"Service fee", currency:"USD" });
    showToast(`✅ Fee request sent to ${target}. Client will see a notification in their dashboard.`, "success");
  }, [form, feeReqs, setFeeReqs, showAlert, showToast]);

  const paidFees    = feeReqs.filter(r=>r.status==="Paid");
  const pendingFees = feeReqs.filter(r=>r.status==="Pending");

  return (
    <div>
      <div style={{ ...S.rowsb, marginBottom:22 }}>
        <div><div style={S.hd}>Fee Collection</div><div style={S.sub}>Issue fee requests — clients see notifications and must pay before withdrawing</div></div>
        <button style={btn("success")} onClick={()=>showToast("Dashboard refreshed","success")}>Refresh</button>
      </div>

      <div style={{ ...S.g4, marginBottom:22 }}>
        {[
          { l:"Active Clients",    v:users.length,         c:"#ffc800", i:"👥" },
          { l:"Pending Fee Reqs",  v:pendingFees.length,   c:pendingFees.length>0?C.gold:C.green, i:"⏳" },
          { l:"Paid Fees",         v:paidFees.length,      c:C.green,   i:"✅" },
          { l:"Est. Platform Rev", v:"$"+fmt(rev),         c:C.gold,    i:"💰" },
        ].map((s,i) => (
          <div key={i} style={{ ...S.card, position:"relative", overflow:"hidden" }}>
            <div style={{ position:"absolute", top:14, right:16, fontSize:24 }}>{s.i}</div>
            <div style={{ fontSize:10, color:C.text3, textTransform:"uppercase", letterSpacing:".06em", marginBottom:10 }}>{s.l}</div>
            <div style={{ fontSize:24, fontWeight:800, color:s.c }}>{s.v}</div>
          </div>
        ))}
      </div>

      {/* How it works */}
      <div style={{ ...S.scard, marginBottom:22, background:"rgba(245,158,11,.06)", border:"1px solid rgba(245,158,11,.2)" }}>
        <div style={{ fontSize:14, fontWeight:700, color:C.gold, marginBottom:8 }}>ℹ️ How Fee Requests Work</div>
        <div style={{ fontSize:13, color:C.text2, lineHeight:1.7 }}>
          1. Create a fee request below and select the client.<br/>
          2. The client sees a <strong style={{ color:C.gold }}>⚠️ orange banner</strong> in their dashboard with the fee amount.<br/>
          3. Their <strong>withdrawals are blocked</strong> until the fee is settled.<br/>
          4. The client contacts support and sends payment to your wallet/wire details.<br/>
          5. Once you receive payment, click <strong style={{ color:C.green }}>"Mark as Paid"</strong> to unlock their withdrawals.
        </div>
      </div>

      {/* Create Fee Request */}
      <div style={{ ...S.card, marginBottom:22 }}>
        <div style={{ fontSize:16, fontWeight:700, color:C.text, marginBottom:18 }}>Create Fee Request</div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14, marginBottom:16 }}>
          <div>
            <label style={S.label}>Client</label>
            <select style={S.sel} value={form.user} onChange={e=>setForm(f=>({...f,user:e.target.value}))}>
              <option value="">Select client…</option>
              {users.map(u=>(
                <option key={u.email} value={u.email}>
                  {u.name} {pendingFees.some(r=>r.user===u.email)?"⚠️":""}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label style={S.label}>Amount</label>
            <input type="number" min="1" style={S.inp} value={form.amount} onChange={e=>setForm(f=>({...f,amount:e.target.value}))} placeholder="100"/>
          </div>
          <div>
            <label style={S.label}>Currency</label>
            <select style={S.sel} value={form.currency} onChange={e=>setForm(f=>({...f,currency:e.target.value}))}>
              {["USD","BTC","ETH","USDT"].map(c=><option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label style={S.label}>Reason</label>
            <input style={S.inp} value={form.reason} onChange={e=>setForm(f=>({...f,reason:e.target.value}))} placeholder="e.g. Tax compliance fee"/>
          </div>
        </div>
        <button style={{ ...btn("success"), padding:"11px 24px", fontSize:14 }} onClick={doCreate}>
          📨 Send Fee Request to Client
        </button>
      </div>

      {/* Fee Requests Table */}
      <div style={S.card}>
        <div style={{ fontSize:16, fontWeight:700, color:C.text, marginBottom:16 }}>All Fee Requests</div>
        <div style={{ overflowX:"auto" }}>
          <table style={S.tbl}>
            <thead><tr>{["Req ID","Client","Amount","Currency","Reason","Status","Created","Action"].map(h=><th key={h} style={S.th}>{h}</th>)}</tr></thead>
            <tbody>
              {feeReqs.length === 0 ? (
                <tr><td colSpan={8} style={{ ...S.td, textAlign:"center", color:C.text3, padding:"30px" }}>No fee requests yet.</td></tr>
              ) : feeReqs.map(r => (
                <tr key={r.id}>
                  <td style={{ ...S.td, fontFamily:"monospace", color:C.text3, fontSize:11 }}>{r.id}</td>
                  <td style={{ ...S.td, fontSize:12 }}>{r.user||r.user_email}</td>
                  <td style={{ ...S.td, fontFamily:"monospace", fontWeight:700 }}>{r.amount}</td>
                  <td style={{ ...S.td, fontFamily:"monospace" }}>{r.currency}</td>
                  <td style={S.td}>{r.reason}</td>
                  <td style={S.td}><Tag c={r.status==="Paid"?"green":"yellow"}>{r.status}</Tag></td>
                  <td style={{ ...S.td, color:C.text3, fontSize:12 }}>{r.created}</td>
                  <td style={S.td}>
                    <div style={S.row}>
                      {r.status !== "Paid" && (
                        <button style={{ ...btn("success"), padding:"4px 12px", fontSize:12 }}
                          onClick={() => confirmFeePaid(r.id)}>
                          ✓ Mark as Paid
                        </button>
                      )}
                      <button style={{ ...btn("danger"), padding:"4px 12px", fontSize:12 }}
                        onClick={() => { setFeeReqs(prev=>prev.filter(x=>x.id!==r.id)); showToast("Removed","info"); }}>
                        Remove
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── ADMIN MARKETS ────────────────────────────────────────────────────────────
export function AdminMarkets() {
  const prices = usePrices();
  return (
    <div>
      <div style={S.hd}>Live Markets</div>
      <div style={S.sub}><span style={S.ldot}/>Real-time prices across all pairs</div>
      <div style={S.card}>
        <div style={{ overflowX:"auto" }}>
          <table style={S.tbl}>
            <thead><tr>{["Asset","Price","24h Change","Bid","Ask","High","Low","Volume","Status"].map(h=><th key={h} style={S.th}>{h}</th>)}</tr></thead>
            <tbody>
              {COINS.map(coin => {
                const p = prices[coin.sym], up = p.change >= 0;
                return (
                  <tr key={coin.sym}>
                    <td style={S.td}>
                      <div style={S.row}><CoinIcon sym={coin.sym} size={26}/>
                        <div><div style={{ fontWeight:700, color:C.text }}>{coin.sym}</div><div style={{ fontSize:11, color:C.text3 }}>{coin.name}</div></div>
                      </div>
                    </td>
                    <td style={{ ...S.td, fontFamily:"monospace", fontWeight:700, color:C.text }}>${p.price<1?p.price.toFixed(4):fmt(p.price)}</td>
                    <td style={S.td}><span style={{ color:up?C.green:C.red, fontWeight:600 }}>{up?"+":""}{fmt(p.change)}%</span></td>
                    <td style={{ ...S.td, fontFamily:"monospace", color:C.green }}>${fmt(p.price*.999)}</td>
                    <td style={{ ...S.td, fontFamily:"monospace", color:C.red }}>${fmt(p.price*1.001)}</td>
                    <td style={{ ...S.td, fontFamily:"monospace", color:C.green }}>${fmt(p.high||p.price*1.03)}</td>
                    <td style={{ ...S.td, fontFamily:"monospace", color:C.red }}>${fmt(p.low||p.price*.97)}</td>
                    <td style={{ ...S.td, fontFamily:"monospace" }}>${fmt((p.vol||p.price*21000)/1000,1)}K</td>
                    <td style={S.td}><Tag c="green">Active</Tag></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── ADMIN SETTINGS ───────────────────────────────────────────────────────────
export function AdminSettings() {
  const { showToast } = useApp();
  return (
    <div>
      <div style={S.hd}>Platform Settings</div>
      <div style={S.sub}>Configure VaultXcrypto platform parameters</div>
      <div style={S.g2}>
        {[
          { title:"Trading", fields:[["Trading Fee (%)","0.10"],["Min Trade ($)","10"],["Max Trade ($)","100,000"],["Daily Withdrawal Limit ($)","50,000"]] },
          { title:"Security", fields:[["2FA Required","Enabled"],["KYC Level","Level 2"],["Session Timeout (min)","30"],["IP Whitelist","Disabled"]] },
          { title:"Email Notifications", fields:[["SMTP Host","smtp.sendgrid.net"],["From Email","noreply@vaultx-crypto.com"],["Deposit Alerts","Enabled"],["Fee Request Alerts","Enabled"]] },
          { title:"Network Fees", fields:[["BTC Network","0.0005 BTC"],["ETH Gas","Auto"],["BNB Fee","0.0005 BNB"],["SOL Fee","0.000025 SOL"]] },
        ].map((s,i) => (
          <div key={i} style={S.card}>
            <div style={{ fontSize:15, fontWeight:700, color:C.text, marginBottom:16 }}>{s.title}</div>
            {s.fields.map(([l,v]) => (
              <div key={l} style={{ marginBottom:14 }}>
                <label style={S.label}>{l}</label>
                <input style={S.inp} defaultValue={v}/>
              </div>
            ))}
            <button style={{ ...btn("success"), marginTop:6, padding:"10px 20px" }} onClick={()=>showToast("Settings saved!","success")}>Save Changes</button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── AGENT DEPOSIT BOARD ──────────────────────────────────────────────────────
export function AgentDepositBoard() {
  const { supabase, checkBoardCreds } = useApp();
  const [authed,        setAuthed]        = useState(false);
  const [username,      setUsername]      = useState("");
  const [password,      setPassword]      = useState("");
  const [err,           setErr]           = useState("");
  const [deposits,      setDeposits]      = useState([]);
  const [loading2,      setLoading2]      = useState(false);
  const [form,          setForm]          = useState({ amount:"", date:new Date().toISOString().split("T")[0], method:"Crypto", agent:"", client:"", closer:"" });
  const [toast,         setToast]         = useState("");
  const [editId,        setEditId]        = useState(null);  // null = add mode, id = edit mode
  const [companyName,   setCompanyName]   = useState(() => localStorage.getItem("vx_board_company") || "");
  const [companyTag,    setCompanyTag]    = useState(() => localStorage.getItem("vx_board_tag")     || "");
  const [editingBrand,  setEditingBrand]  = useState(false);

  // Load brand settings from Supabase when authed
  useEffect(() => {
    if (!authed || !supabase) return;
    supabase.from("vx_board_settings").select("*").then(({ data }) => {
      if (!data) return;
      data.forEach(row => {
        if (row.key === "company_name") { setCompanyName(row.value); localStorage.setItem("vx_board_company", row.value); }
        if (row.key === "company_tag")  { setCompanyTag(row.value);  localStorage.setItem("vx_board_tag",  row.value); }
      });
    });
  }, [authed, supabase]);

  // Load from Supabase when authed
  useEffect(() => {
    if (!authed || !supabase) return;
    setLoading2(true);
    supabase.from("vx_agent_deposits").select("*").order("id", { ascending:false })
      .then(({ data }) => { if (data) setDeposits(data); setLoading2(false); })
      .catch(() => setLoading2(false));

    // Realtime sync
    const ch = supabase.channel("vx_deposits_board")
      .on("postgres_changes", { event:"*", schema:"public", table:"vx_agent_deposits" }, () => {
        supabase.from("vx_agent_deposits").select("*").order("id", { ascending:false })
          .then(({ data }) => { if (data) setDeposits(data); });
      }).subscribe();
    return () => supabase.removeChannel(ch);
  }, [authed, supabase]);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(""), 3000); };

  const doLogin = () => {
    if (checkBoardCreds(username, password)) { setAuthed(true); setErr(""); }
    else setErr("Invalid credentials");
  };

  const addDeposit = async () => {
    const amt = parseFloat(form.amount);
    if (!amt || amt <= 0)    { showToast("⚠️ Enter a valid amount"); return; }
    if (!form.date)          { showToast("⚠️ Select a date"); return; }
    if (!form.agent.trim())  { showToast("⚠️ Enter agent name"); return; }
    if (!form.client.trim()) { showToast("⚠️ Enter client name"); return; }

    if (editId) {
      // ── EDIT MODE ────────────────────────────────────────────────────────
      const updated = { amount:amt, date:form.date, method:form.method, agent:form.agent.trim(), client:form.client.trim(), closer:form.closer.trim() };
      try {
        await supabase.from("vx_agent_deposits").update(updated).eq("id", editId);
        setDeposits(prev => prev.map(d => d.id === editId ? { ...d, ...updated } : d));
        showToast("✅ Deposit updated!");
        setEditId(null);
        setForm(f => ({ ...f, amount:"", agent:"", client:"", closer:"" }));
      } catch(e) { showToast("❌ Failed to update."); }
    } else {
      // ── ADD MODE ─────────────────────────────────────────────────────────
      const rec = { id:Date.now(), amount:amt, date:form.date, method:form.method, agent:form.agent.trim(), client:form.client.trim(), closer:form.closer.trim() };
      try {
        await supabase.from("vx_agent_deposits").insert(rec);
        setDeposits(prev => [rec, ...prev]);
        setForm(f => ({ ...f, amount:"", agent:"", client:"", closer:"" }));
        showToast("✅ Deposit logged — $" + fmt(amt));
        fireworks();
      } catch(e) { showToast("❌ Failed to save. Check connection."); }
    }
  };

  const startEdit = (d) => {
    setEditId(d.id);
    setForm({ amount:String(d.amount), date:d.date, method:d.method, agent:d.agent||"", client:d.client||"", closer:d.closer||"" });
    // scroll to form
    document.querySelector(".__vx_board_form")?.scrollIntoView({ behavior:"smooth", block:"start" });
  };

  const cancelEdit = () => {
    setEditId(null);
    setForm({ amount:"", date:new Date().toISOString().split("T")[0], method:"Crypto", agent:"", client:"", closer:"" });
  };

  const saveBrand = async () => {
    localStorage.setItem("vx_board_company", companyName);
    localStorage.setItem("vx_board_tag",     companyTag);
    setEditingBrand(false);
    showToast("✅ Brand saved!");
    // Sync to Supabase
    try {
      await supabase.from("vx_board_settings").upsert({ key:"company_name", value:companyName });
      await supabase.from("vx_board_settings").upsert({ key:"company_tag",  value:companyTag });
    } catch(e) { console.warn("Brand sync failed", e); }
  };

  const removeDeposit = async (id) => {
    if (!window.confirm("Remove this deposit?")) return;
    try {
      await supabase.from("vx_agent_deposits").delete().eq("id", id);
      setDeposits(prev => prev.filter(d => d.id !== id));
    } catch(e) { showToast("❌ Failed to delete."); }
  };

  const fireworks = () => {
    const colors = ["#ffc800","#ffd633","#fff","#f7931a","#22c55e","#60a5fa"];
    for (let i = 0; i < 60; i++) {
      const el = document.createElement("div");
      const size = 5 + Math.random() * 8;
      el.style.cssText = `position:fixed;top:-10px;left:${Math.random()*100}vw;width:${size}px;height:${size}px;background:${colors[Math.floor(Math.random()*colors.length)]};border-radius:${Math.random()>.5?"50%":"2px"};pointer-events:none;z-index:9999;animation:vxFall ${1.2+Math.random()*1.5}s linear ${Math.random()*.5}s forwards;`;
      document.body.appendChild(el);
      setTimeout(() => el.remove(), 3000);
    }
  };

  const fmtDate = s => {
    if (!s) return "";
    try { return new Date(s+"T00:00:00").toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"}); } catch(e){ return s; }
  };

  const rev = [...deposits].reverse();
  let run = 0;
  const runMap = {};
  rev.forEach(d => { run += d.amount; runMap[d.id] = run; });

  const total  = deposits.reduce((a,d) => a+d.amount, 0);
  const crypto = deposits.filter(d=>d.method==="Crypto").reduce((a,d)=>a+d.amount,0);
  const wire   = deposits.filter(d=>d.method==="Wire").reduce((a,d)=>a+d.amount,0);

  const styles = `@keyframes vxFall{0%{transform:translateY(0) rotate(0);opacity:1}100%{transform:translateY(100vh) rotate(600deg);opacity:0}}`;

  if (!authed) return (
    <div>
      <style>{styles}</style>
      <div style={{ maxWidth:400, margin:"60px auto", background:"linear-gradient(160deg,#1a1300,#0d0d0d)", border:"1.5px solid rgba(255,200,0,.3)", borderRadius:20, padding:36, boxShadow:"0 0 60px rgba(255,200,0,.1)" }}>
        <div style={{ textAlign:"center", marginBottom:28 }}>
          <div style={{ width:52, height:52, background:"#ffc800", borderRadius:14, display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, fontWeight:900, color:"#000", margin:"0 auto 14px", boxShadow:"0 0 28px rgba(255,200,0,.5)" }}>V</div>
          <div style={{ fontSize:18, fontWeight:800, color:C.text }}>Agent Deposit Board</div>
          <div style={{ fontSize:12, color:C.text3, marginTop:4 }}>Restricted access — agents only</div>
        </div>
        {err && <div style={{ background:"rgba(239,68,68,.1)", border:"1px solid rgba(239,68,68,.3)", borderRadius:10, padding:"10px 14px", fontSize:13, color:C.red, marginBottom:16, textAlign:"center" }}>{err}</div>}
        <div style={{ marginBottom:14 }}>
          <label style={S.label}>Username</label>
          <input style={S.inp} placeholder="Admin1" value={username} onChange={e=>setUsername(e.target.value)} onKeyDown={e=>e.key==="Enter"&&doLogin()} autoFocus />
        </div>
        <div style={{ marginBottom:24 }}>
          <label style={S.label}>Password</label>
          <input style={S.inp} type="password" placeholder="••••••••" value={password} onChange={e=>setPassword(e.target.value)} onKeyDown={e=>e.key==="Enter"&&doLogin()} />
        </div>
        <button style={{ ...btn("primary"), width:"100%", padding:"13px", fontSize:15 }} onClick={doLogin}>
          Enter Board →
        </button>
      </div>
    </div>
  );

  return (
    <div>
      <style>{styles}</style>

      {/* Toast */}
      {toast && <div style={{ position:"fixed", bottom:24, right:24, background:toast.startsWith("✅")?"#ffc800":"#ef4444", color:toast.startsWith("✅")?"#000":"#fff", padding:"12px 22px", borderRadius:12, fontSize:13, fontWeight:700, zIndex:9999, boxShadow:"0 8px 30px rgba(0,0,0,.4)" }}>{toast}</div>}

      {/* Brand Box */}
      {editingBrand ? (
        <div style={{ ...S.card, marginBottom:18, borderColor:"rgba(255,200,0,.3)" }}>
          <div style={{ fontSize:13, fontWeight:700, color:"#ffc800", marginBottom:14 }}>🏢 Company Brand</div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr auto auto", gap:12, alignItems:"flex-end" }}>
            <div>
              <label style={S.label}>Company Name</label>
              <input style={S.inp} placeholder="e.g. VaultX Ltd" value={companyName} onChange={e=>setCompanyName(e.target.value)} onKeyDown={e=>e.key==="Enter"&&saveBrand()}/>
            </div>
            <div>
              <label style={S.label}>Tagline (optional)</label>
              <input style={S.inp} placeholder="e.g. Elite Crypto Trading" value={companyTag} onChange={e=>setCompanyTag(e.target.value)} onKeyDown={e=>e.key==="Enter"&&saveBrand()}/>
            </div>
            <button style={{ ...btn("success"), padding:"10px 20px" }} onClick={saveBrand}>Save</button>
            <button style={{ ...btn("ghost"), padding:"10px 14px" }} onClick={() => setEditingBrand(false)}>Cancel</button>
          </div>
        </div>
      ) : companyName ? (
        <div style={{ marginBottom:18, display:"flex", alignItems:"center", gap:14 }}>
          <div style={{ background:"linear-gradient(135deg,#e6b400,#ffd633)", borderRadius:14, padding:"12px 24px" }}>
            <div style={{ fontSize:22, fontWeight:900, color:"#000", letterSpacing:"-.5px" }}>{companyName}</div>
            {companyTag && <div style={{ fontSize:12, color:"rgba(0,0,0,.65)", marginTop:2 }}>{companyTag}</div>}
          </div>
          <div style={{ fontSize:13, color:"#ffc800", fontStyle:"italic", opacity:.7 }}>Good Luck! 🍀</div>
          <button style={{ ...btn("ghost"), padding:"5px 12px", fontSize:11, marginLeft:"auto" }} onClick={() => setEditingBrand(true)}>✏️ Edit</button>
        </div>
      ) : (
        <button style={{ ...btn("ghost"), padding:"7px 16px", fontSize:12, marginBottom:14 }} onClick={() => setEditingBrand(true)}>🏢 Add Company Brand</button>
      )}

      {/* Header */}
      <div style={{ ...S.rowsb, marginBottom:22 }}>
        <div>
          <div style={{ ...S.hd, color:"#ffc800" }}>Agent Deposit Board</div>
          <div style={S.sub}>Log and track all agent deposits</div>
        </div>
        <button style={{ ...btn("ghost"), padding:"7px 16px", fontSize:12 }} onClick={() => setAuthed(false)}>🔒 Lock</button>
      </div>

      {/* Stats */}
      <div style={{ ...S.g4, marginBottom:22 }}>
        {[
          { l:"Grand Total",  v:"$"+fmt(total),  c:"#ffc800", i:"💰" },
          { l:"Entries",      v:deposits.length,  c:C.text,    i:"📋" },
          { l:"Via Crypto",   v:"$"+fmt(crypto),  c:"#f7931a", i:"₿"  },
          { l:"Via Wire",     v:"$"+fmt(wire),    c:"#60a5fa", i:"🏦" },
        ].map((s,i) => (
          <div key={i} style={{ ...S.card, position:"relative", overflow:"hidden", borderColor:"rgba(255,200,0,.2)" }}>
            <div style={{ position:"absolute", top:12, right:16, fontSize:22, opacity:.4 }}>{s.i}</div>
            <div style={{ fontSize:10, color:C.text3, textTransform:"uppercase", letterSpacing:".06em", marginBottom:8 }}>{s.l}</div>
            <div style={{ fontSize:24, fontWeight:800, color:s.c }}>{s.v}</div>
          </div>
        ))}
      </div>

      {/* Form */}
      <div className="__vx_board_form" style={{ ...S.card, marginBottom:22, borderColor:editId?"rgba(255,200,0,.5)":"rgba(255,200,0,.25)", background:editId?"linear-gradient(160deg,rgba(255,200,0,.09),rgba(0,0,0,0))":"linear-gradient(160deg,rgba(255,200,0,.06),rgba(0,0,0,0))" }}>
        <div style={{ ...S.rowsb, marginBottom:18 }}>
          <div style={{ fontSize:13, fontWeight:700, color:"#ffc800", textTransform:"uppercase", letterSpacing:".07em" }}>
            {editId ? "✏️ Edit Deposit" : "+ Log New Deposit"}
          </div>
          {editId && <button style={{ ...btn("ghost"), padding:"5px 14px", fontSize:12 }} onClick={cancelEdit}>Cancel Edit</button>}
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:14, marginBottom:16 }}>
          <div>
            <label style={S.label}>Amount (USD)</label>
            <input style={S.inp} type="number" placeholder="e.g. 25000" value={form.amount} onChange={e=>setForm(f=>({...f,amount:e.target.value}))} onKeyDown={e=>e.key==="Enter"&&addDeposit()} />
          </div>
          <div>
            <label style={S.label}>Deposit Date</label>
            <input style={S.inp} type="date" value={form.date} onChange={e=>setForm(f=>({...f,date:e.target.value}))} />
          </div>
          <div>
            <label style={S.label}>How Deposited</label>
            <select style={S.sel} value={form.method} onChange={e=>setForm(f=>({...f,method:e.target.value}))}>
              <option value="Crypto">₿ Crypto</option>
              <option value="Wire">🏦 Wire Transfer</option>
            </select>
          </div>
          <div>
            <label style={S.label}>Agent Name</label>
            <input style={S.inp} placeholder="e.g. Jane Smith" value={form.agent} onChange={e=>setForm(f=>({...f,agent:e.target.value}))} onKeyDown={e=>e.key==="Enter"&&addDeposit()} />
          </div>
          <div>
            <label style={S.label}>Client Name</label>
            <input style={S.inp} placeholder="e.g. John Doe" value={form.client} onChange={e=>setForm(f=>({...f,client:e.target.value}))} onKeyDown={e=>e.key==="Enter"&&addDeposit()} />
          </div>
          <div>
            <label style={S.label}>Closer Name</label>
            <input style={S.inp} placeholder="e.g. Mike Ross" value={form.closer} onChange={e=>setForm(f=>({...f,closer:e.target.value}))} onKeyDown={e=>e.key==="Enter"&&addDeposit()} />
          </div>
          <div>
            <label style={S.label}>Company Name</label>
            <input style={{ ...S.inp, borderColor:"rgba(255,200,0,.35)" }} placeholder="e.g. VaultX Ltd" value={companyName} onChange={e=>{ setCompanyName(e.target.value); localStorage.setItem("vx_board_company",e.target.value); }} onBlur={async(e)=>{ try{ await supabase.from("vx_board_settings").upsert({key:"company_name",value:e.target.value}); }catch(err){} }} />
          </div>
        </div>
        <div style={S.row}>
          <button style={{ ...btn("primary"), padding:"12px 32px", fontSize:14 }} onClick={addDeposit}>
            {editId ? "💾 Save Changes" : "+ Add Deposit"}
          </button>
          {editId
            ? <button style={{ ...btn("ghost"), padding:"12px 20px" }} onClick={cancelEdit}>Cancel</button>
            : <button style={{ ...btn("ghost"), padding:"12px 20px" }} onClick={() => setForm(f=>({...f,amount:"",agent:"",client:"",closer:""}))}>Clear</button>
          }
        </div>
      </div>

      {/* Table */}
      <div style={{ ...S.card, padding:0, overflow:"hidden", borderColor:"rgba(255,200,0,.15)" }}>
        <table style={S.tbl}>
          <thead>
            <tr>{["Amount","Date","Method","Agent","Client","Closer","Running Total","Delete"].map(h=><th key={h} style={S.th}>{h}</th>)}</tr>
          </thead>
          <tbody>
            {loading2 ? (
              <tr><td colSpan={7} style={{ ...S.td, textAlign:"center", padding:"40px", color:C.text3 }}>Loading deposits from cloud…</td></tr>
            ) : deposits.length === 0 ? (
              <tr><td colSpan={6} style={{ ...S.td, textAlign:"center", padding:"48px", color:C.text3 }}>
                <div style={{ fontSize:36, marginBottom:12, opacity:.3 }}>🏦</div>
                <div>No deposits logged yet. Add your first entry above.</div>
              </td></tr>
            ) : deposits.map(d => (
              <tr key={d.id}>
                <td style={{ ...S.td, fontSize:16, fontWeight:800, color:"#ffc800", fontFamily:"monospace" }}>${fmt(d.amount)}</td>
                <td style={{ ...S.td, fontSize:12, color:C.text2 }}>{fmtDate(d.date)}</td>
                <td style={S.td}>
                  <span style={{ display:"inline-flex", alignItems:"center", gap:5, padding:"4px 12px", borderRadius:20, fontSize:11, fontWeight:700,
                    background: d.method==="Crypto"?"rgba(255,200,0,.12)":"rgba(96,165,250,.12)",
                    color: d.method==="Crypto"?"#ffc800":"#60a5fa",
                    border: d.method==="Crypto"?"1px solid rgba(255,200,0,.3)":"1px solid rgba(96,165,250,.3)" }}>
                    {d.method==="Crypto"?"₿":"🏦"} {d.method}
                  </span>
                </td>
                <td style={{ ...S.td, fontWeight:600, color:C.text }}>{d.agent}</td>
                <td style={{ ...S.td, fontWeight:600, color:"#ffc800" }}>{d.client||"—"}</td>
                <td style={{ ...S.td, fontWeight:600, color:"#60a5fa" }}>{d.closer||"—"}</td>
                <td style={{ ...S.td, fontFamily:"monospace", color:C.text3 }}>${fmt(runMap[d.id])}</td>
                <td style={S.td}>
                  <div style={S.row}>
                    <button style={{ ...btn("ghost"), padding:"5px 12px", fontSize:12 }}
                      onClick={() => startEdit(d)}>
                      ✏️ Edit
                    </button>
                    <button style={{ ...btn("danger"), padding:"5px 12px", fontSize:12 }}
                      onClick={() => removeDeposit(d.id)}>
                      🗑 Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {deposits.length > 0 && (
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"16px 20px", background:"rgba(255,200,0,.04)", borderTop:"1px solid rgba(255,200,0,.15)", flexWrap:"wrap", gap:10 }}>
            <span style={{ fontSize:11, fontWeight:700, color:C.text3, textTransform:"uppercase", letterSpacing:".1em" }}>Grand Total</span>
            <div style={{ display:"flex", alignItems:"center", gap:12 }}>
              <span style={{ fontSize:24, fontWeight:800, color:"#ffc800", fontFamily:"monospace" }}>${fmt(total)}</span>
              <button style={{ ...btn("success"), padding:"8px 18px", fontSize:13 }} onClick={() => exportToExcel(deposits, companyName)}>
                📊 Export to Excel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── CRM ──────────────────────────────────────────────────────────────────────
const CRM_STATUSES = [
  { id:"New",          label:"New",           color:"#60a5fa", bg:"rgba(96,165,250,.12)"  },
  { id:"Call Again",   label:"Call Again",    color:"#a78bfa", bg:"rgba(167,139,250,.12)" },
  { id:"VM",           label:"VM",            color:"#fbbf24", bg:"rgba(251,191,36,.12)"  },
  { id:"NA",           label:"NA",            color:"#f87171", bg:"rgba(248,113,113,.12)" },
  { id:"In The Money", label:"💰 In The Money", color:"#ffc800", bg:"rgba(255,200,0,.15)"  },
];

function StatusBadge({ status }) {
  const s = CRM_STATUSES.find(x => x.id === status) || CRM_STATUSES[0];
  return (
    <span style={{ display:"inline-flex", alignItems:"center", padding:"3px 10px", borderRadius:20, fontSize:11, fontWeight:700, color:s.color, background:s.bg, border:`1px solid ${s.color}40`, whiteSpace:"nowrap" }}>
      {s.label}
    </span>
  );
}

function genSecurityCode() {
  const words = ["ALPHA","BRAVO","DELTA","ECHO","FOXTROT","GOLD","HOTEL","INDIA","JULIET","KILO","LIMA","NOVA","OSCAR","PAPA","QUEBEC","ROMEO","SIERRA","TANGO","ULTRA","VICTOR","WHISKEY","XRAY","YANKEE","ZULU","VAULT","PRIME","APEX","TITAN","NEXUS","OMEGA"];
  const nums = Math.floor(100 + Math.random() * 900);
  const word = words[Math.floor(Math.random() * words.length)];
  return `${word}-${nums}`;
}

export function AdminCRM() {
  const { supabase, showToast } = useApp();
  const [clients,    setClients]    = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [search,     setSearch]     = useState("");
  const [filterStat, setFilterStat] = useState("All");
  const [showForm,   setShowForm]   = useState(false);
  const [editClient, setEditClient] = useState(null);
  const [showImport, setShowImport] = useState(false);
  const [importRows, setImportRows] = useState([]);
  const [importing,  setImporting]  = useState(false);
  const [selected,   setSelected]   = useState(new Set());
  const [form, setForm] = useState({
    first_name:"", last_name:"", state:"", phone:"", email:"",
    status:"New R", deposit:"", balance:"", security_code:"", notes:"", agent:""
  });

  const CRM_STATUSES = [
    { id:"New R",        color:"#60a5fa", bg:"rgba(96,165,250,.12)"   },
    { id:"Call Again",   color:"#a78bfa", bg:"rgba(167,139,250,.12)"  },
    { id:"VM",           color:"#fbbf24", bg:"rgba(251,191,36,.12)"   },
    { id:"NA",           color:"#f87171", bg:"rgba(248,113,113,.12)"  },
    { id:"In The Money", color:"#ffc800", bg:"rgba(255,200,0,.18)"    },
  ];

  const StatusBadge = ({ status }) => {
    const s = CRM_STATUSES.find(x => x.id === status) || CRM_STATUSES[0];
    return (
      <span style={{ display:"inline-flex", alignItems:"center", padding:"3px 10px", borderRadius:20, fontSize:11, fontWeight:700, color:s.color, background:s.bg, border:`1px solid ${s.color}40`, whiteSpace:"nowrap" }}>
        {status === "In The Money" ? "💰 In The Money" : status}
      </span>
    );
  };

  const genCode = () => {
    const words = ["ALPHA","BRAVO","DELTA","FOXTROT","GOLD","HOTEL","JULIET","NOVA","OSCAR","ROMEO","SIERRA","TITAN","VAULT","PRIME","APEX","OMEGA","NEXUS","WHISKEY","ZULU","ECHO"];
    return words[Math.floor(Math.random()*words.length)] + "-" + Math.floor(100+Math.random()*900);
  };

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    if (!supabase) { setLoading(false); return; }
    const { data, error } = await supabase.from("vx_crm").select("*").order("created_at", { ascending:false });
    if (error) { console.error("CRM load error:", error); showToast("⚠️ CRM load failed: " + error.message, "info"); }
    if (data) setClients(data);
    setLoading(false);
  };

  const saveClient = async () => {
    if (!form.first_name.trim() && !form.last_name.trim()) {
      showToast("⚠️ First or last name required", "info"); return;
    }
    const now = new Date().toISOString();

    // Build clean record — only columns that exist in the table
    const buildRec = (id) => ({
      id:             id,
      first_name:     (form.first_name||"").trim(),
      last_name:      (form.last_name||"").trim(),
      phone:          (form.phone||"").trim(),
      email:          (form.email||"").trim(),
      status:         form.status || "New R",
      deposit:        parseFloat(form.deposit) || 0,
      balance:        parseFloat(form.balance) || 0,
      amount_deposited: parseFloat(form.deposit) || 0,
      security_code:  (form.security_code||"").trim() || genCode(),
      notes:          (form.notes||"").trim(),
      agent:          (form.agent||"").trim(),
      state:          (form.state||"").trim(),
      updated_at:     now,
    });

    if (editClient) {
      const rec = buildRec(editClient.id);
      setClients(prev => prev.map(c => c.id===editClient.id ? {...c,...rec} : c));
      const { error } = await supabase.from("vx_crm").update(rec).eq("id", editClient.id);
      if (error) {
        setClients(prev => prev.map(c => c.id===editClient.id ? editClient : c));
        showToast("❌ " + error.message, "info");
        console.error("CRM update:", error);
        return;
      }
      showToast("✅ Client updated", "success");
      await loadClients(); // reload fresh from Supabase
    } else {
      const newId = "CRM" + Date.now() + Math.random().toString(36).slice(2,6);
      const rec   = { ...buildRec(newId), created_at: now };
      setClients(prev => [rec, ...prev]);
      const { error } = await supabase.from("vx_crm").insert(rec);
      if (error) {
        setClients(prev => prev.filter(c => c.id !== newId));
        showToast("❌ " + error.message, "info");
        console.error("CRM insert:", error);
        return;
      }
      showToast("✅ Client added!", "success");
      await loadClients(); // reload fresh from Supabase
    }
    resetForm();
  };

  const deleteClient = async (id) => {
    if (!window.confirm("Delete this client?")) return;
    try {
      await supabase.from("vx_crm").delete().eq("id", id);
      setClients(prev => prev.filter(c => c.id !== id));
      setSelected(prev => { const n = new Set(prev); n.delete(id); return n; });
      showToast("Client deleted", "info");
    } catch(e) {}
  };

  const bulkDelete = async () => {
    if (selected.size === 0) return;
    if (!window.confirm(`Delete ${selected.size} selected client${selected.size>1?"s":""}? This cannot be undone.`)) return;
    const ids = Array.from(selected);
    try {
      await supabase.from("vx_crm").delete().in("id", ids);
      setClients(prev => prev.filter(c => !selected.has(c.id)));
      setSelected(new Set());
      showToast(`✅ Deleted ${ids.length} clients`, "success");
    } catch(e) { showToast("❌ Failed to delete", "info"); }
  };

  const toggleSelect = (id) => setSelected(prev => {
    const n = new Set(prev);
    n.has(id) ? n.delete(id) : n.add(id);
    return n;
  });

  const toggleSelectAll = () => {
    if (selected.size === filtered.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(filtered.map(c => c.id)));
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await supabase.from("vx_crm").update({ status, updated_at:new Date().toISOString() }).eq("id", id);
      setClients(prev => prev.map(c => c.id===id ? {...c,status} : c));
    } catch(e) {}
  };

  const startEdit = (c) => {
    setForm({
      first_name: c.first_name||"", last_name: c.last_name||"",
      state: c.state||"", phone: c.phone||"", email: c.email||"",
      status: c.status||"New R",
      deposit: c.deposit||c.amount_deposited||"",
      balance: c.balance||"",
      security_code: c.security_code||"", notes: c.notes||"", agent: c.agent||""
    });
    setEditClient(c);
    setShowForm(true);
  };

  const resetForm = () => {
    setForm({ first_name:"", last_name:"", state:"", phone:"", email:"", status:"New R", deposit:"", balance:"", security_code:"", notes:"", agent:"" });
    setEditClient(null);
    setShowForm(false);
  };

  // ── EXPORT ──────────────────────────────────────────────────────────────────
  const exportCSV = () => {
    let csv = "\uFEFF";
    csv += ["NAME","LAST NAME","STATE","NUMBER","EMAIL","STATUS","DEPOSIT","BALANCE","CODE"].map(h=>`"${h}"`).join(",") + "\n";
    filtered.forEach(c => {
      csv += [
        c.first_name, c.last_name, c.state||"", c.phone, c.email,
        c.status, c.deposit||c.amount_deposited||0, c.balance||0, c.security_code
      ].map(v=>`"${v||""}"`).join(",") + "\n";
    });
    const blob = new Blob([csv], { type:"text/csv;charset=utf-8;" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `VaultX_CRM_${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    showToast("✅ Exported","success");
  };

  // ── IMPORT ──────────────────────────────────────────────────────────────────
  const parseImportFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const raw = ev.target.result.replace(/^\uFEFF/, '');

      // Split into lines (handles \n and \r\n)
      const lines = raw.split(/\r?\n/);

      // Parse one CSV line respecting quoted fields
      const parseLine = (line) => {
        const cols = []; let cur = '', inQ = false;
        for (let i = 0; i < line.length; i++) {
          const ch = line[i];
          if (ch === '"') { inQ = !inQ; continue; }
          if (ch === ',' && !inQ) { cols.push(cur); cur = ''; continue; }
          cur += ch;
        }
        cols.push(cur);
        return cols.map(c => c.trim());
      };

      const cleanNum = v => {
        const n = parseFloat((v||'').replace(/[^0-9.-]/g, ''));
        return isNaN(n) ? 0 : n;
      };

      const mapStatus = s => {
        const map = {
          'new r': 'New R', 'new': 'New R',
          'no answer r': 'NA', 'na': 'NA',
          'vm': 'VM',
          'call again': 'Call Again', 'call again r': 'Call Again',
          'in the money': 'In The Money',
          'try from others': 'Call Again',
        };
        return map[(s||'').toLowerCase().trim()] || 'New R';
      };

      const clients = [];
      const seen = new Set(); // deduplicate by phone

      // SECTION 1: normal rows — line has 6+ filled columns
      // Col 0=junk, 1=NAME, 2=LAST, 3=STATE, 4=PHONE, 5=EMAIL, 6=STATUS, 7=DEPOSIT, 8=BALANCE, 9=CODE, 10=AGENT
      lines.forEach(line => {
        if (!line.trim()) return;
        const cols = parseLine(line);
        const filled = cols.filter(c => c.trim()).length;
        if (filled < 6) return; // skip wrapped/sparse rows

        const fn    = cols[1] || '';
        const ln    = cols[2] || '';
        const state = cols[3] || '';
        const phone = cols[4] || '';
        const email = cols[5] || '';

        // Validate: must have a real name (not a number, not an email, not a status word)
        const isRealName = fn && !/^\d+$/.test(fn) && !fn.includes('@') &&
          !['canada','united kingdom','new r','no answer r','call again r','vm','na'].includes(fn.toLowerCase());

        if (!isRealName && !ln) return;
        if (seen.has(phone + email)) return;
        seen.add(phone + email);

        clients.push({
          first_name: fn, last_name: ln, state,
          phone, email,
          status: mapStatus(cols[6]),
          deposit: cleanNum(cols[7]),
          balance: cleanNum(cols[8]),
          security_code: cols[9] || genCode(),
          agent: cols[10] || '',
          notes: '',
        });
      });

      // SECTION 2: wrapped rows — each value on its own line, other cols empty
      // Group by blank separators. Fields per client: CODE, NAME, LASTNAME, STATE, PHONE, EMAIL, STATUS, DEPOSIT, BALANCE, AGENT
      let vals = [];
      const flushWrapped = () => {
        if (vals.length < 6) { vals = []; return; }
        const fn = vals[1] || '', ln = vals[2] || '';
        const phone = vals[4] || '', email = vals[5] || '';
        const isRealName = fn && !/^\d+$/.test(fn) && !fn.includes('@') &&
          !['canada','united kingdom','new r','no answer r','call again r','vm','na'].includes(fn.toLowerCase());
        if (!isRealName || seen.has(phone + email)) { vals = []; return; }
        seen.add(phone + email);
        clients.push({
          security_code: vals[0] || genCode(),
          first_name: fn, last_name: ln,
          state: vals[3] || '',
          phone, email,
          status: mapStatus(vals[6]),
          deposit: cleanNum(vals[7] || '0'),
          balance: cleanNum(vals[8] || '0'),
          agent: vals[9] || '',
          notes: '',
        });
        vals = [];
      };

      lines.forEach(line => {
        const cols = parseLine(line);
        const filled = cols.filter(c => c.trim()).length;
        if (filled >= 6) return; // already handled above
        const v = (cols[0] || '').trim();
        if (!v) { if (vals.length) flushWrapped(); }
        else vals.push(v);
      });
      if (vals.length) flushWrapped();

      if (!clients.length) {
        showToast('No valid clients found. Check your file format.', 'info');
        return;
      }
      setImportRows(clients);
      setShowImport(true);
    };

    reader.onerror = () => showToast('Could not read file', 'info');
    reader.readAsText(file, 'UTF-8');
    e.target.value = '';
  };

    const confirmImport = async () => {
    setImporting(true);
    const now = new Date().toISOString();
    let ok=0, fail=0;
    for (const row of importRows) {
      try {
        await supabase.from("vx_crm").insert({
          id:`CRM${Date.now()}_${Math.random().toString(36).slice(2,5)}`,
          first_name:row.first_name, last_name:row.last_name,
          state:row.state, phone:row.phone, email:row.email,
          status:row.status,
          deposit:row.deposit, amount_deposited:row.deposit,
          balance:row.balance,
          security_code:row.security_code,
          agent:row.agent, notes:row.notes,
          created_at:now, updated_at:now,
        });
        ok++;
      } catch(e){ fail++; }
    }
    await loadClients();
    setImporting(false); setShowImport(false); setImportRows([]);
    showToast(`✅ Imported ${ok} clients${fail>0?` (${fail} failed)`:""}`, "success");
  };

  const filtered = clients.filter(c => {
    const q = search.toLowerCase();
    const matchSearch = !q || [c.first_name,c.last_name,c.phone,c.email,c.state,c.agent].some(v=>(v||"").toLowerCase().includes(q));
    const matchStatus = filterStat==="All" || c.status===filterStat;
    return matchSearch && matchStatus;
  });

  const totalDeposited = filtered.reduce((a,c)=>a+(c.deposit||c.amount_deposited||0),0);
  const totalBalance   = filtered.reduce((a,c)=>a+(c.balance||0),0);
  const statusCounts   = Object.fromEntries(["New R","Call Again","VM","NA","In The Money"].map(s=>[s,clients.filter(c=>c.status===s).length]));

  return (
    <div>
      {/* Header */}
      <div style={{ ...S.rowsb, marginBottom:18, flexWrap:"wrap", gap:12 }}>
        <div>
          <div style={S.hd}>CRM — Client Manager</div>
          <div style={S.sub}>{clients.length} clients · Total deposited: <strong style={{ color:"#ffc800" }}>${fmt(clients.reduce((a,c)=>a+(c.deposit||c.amount_deposited||0),0))}</strong></div>
        </div>
        <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
          <input id="crm-import" type="file" accept=".csv,.txt" style={{ display:"none" }} onChange={parseImportFile}/>
          <button style={{ ...btn("ghost"), padding:"9px 16px", fontSize:13 }} onClick={()=>document.getElementById("crm-import").click()}>📥 Import CSV</button>
          <button style={{ ...btn("ghost"), padding:"9px 16px", fontSize:13 }} onClick={exportCSV}>📊 Export CSV</button>
          <button style={{ ...btn("primary"), padding:"9px 18px", fontSize:13 }} onClick={()=>{ resetForm(); setShowForm(true); }}>+ Add Client</button>
        </div>
      </div>

      {/* Status filter tabs */}
      <div style={{ display:"flex", gap:6, marginBottom:14, flexWrap:"wrap" }}>
        <button style={{ ...btn(filterStat==="All"?"primary":"ghost"), padding:"6px 14px", fontSize:12 }} onClick={()=>setFilterStat("All")}>All ({clients.length})</button>
        {CRM_STATUSES.map(s => (
          <button key={s.id} style={{ padding:"6px 14px", borderRadius:8, border:`1px solid ${filterStat===s.id?s.color:"rgba(255,255,255,.08)"}`, background:filterStat===s.id?s.bg:"transparent", color:filterStat===s.id?s.color:C.text3, fontSize:12, fontWeight:600, cursor:"pointer", fontFamily:"inherit" }}
            onClick={()=>setFilterStat(s.id)}>
            {s.id==="In The Money"?"💰 In The Money":s.id} ({statusCounts[s.id]||0})
          </button>
        ))}
      </div>

      {/* Search */}
      <input style={{ ...S.inp, maxWidth:340, marginBottom:selected.size>0?10:16 }} placeholder="🔍 Search name, phone, email…" value={search} onChange={e=>setSearch(e.target.value)}/>

      {/* Bulk action bar */}
      {selected.size > 0 && (
        <div style={{ display:"flex", alignItems:"center", gap:12, padding:"10px 16px", background:"rgba(239,68,68,.08)", border:"1px solid rgba(239,68,68,.3)", borderRadius:10, marginBottom:16, flexWrap:"wrap" }}>
          <span style={{ fontSize:13, fontWeight:600, color:C.text }}>
            {selected.size} client{selected.size>1?"s":""} selected
          </span>
          <button style={{ ...btn("danger"), padding:"7px 18px", fontSize:13 }} onClick={bulkDelete}>
            🗑 Delete Selected
          </button>
          <button style={{ ...btn("ghost"), padding:"7px 14px", fontSize:12 }} onClick={() => setSelected(new Set())}>
            Clear selection
          </button>
        </div>
      )}

      {/* Add/Edit Form */}
      {showForm && (
        <div style={{ ...S.card, marginBottom:20, borderColor:editClient?"rgba(255,200,0,.5)":"rgba(255,200,0,.2)" }}>
          <div style={{ ...S.rowsb, marginBottom:16 }}>
            <span style={{ fontSize:14, fontWeight:700, color:"#ffc800" }}>{editClient?"✏️ Edit Client":"👤 New Client"}</span>
            <button style={{ ...btn("ghost"), padding:"5px 12px", fontSize:12 }} onClick={resetForm}>Cancel</button>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))", gap:12, marginBottom:12 }}>
            <div><label style={S.label}>First Name</label><input style={S.inp} value={form.first_name} onChange={e=>setForm(f=>({...f,first_name:e.target.value}))} placeholder="Christine"/></div>
            <div><label style={S.label}>Last Name</label><input style={S.inp} value={form.last_name} onChange={e=>setForm(f=>({...f,last_name:e.target.value}))} placeholder="Baker"/></div>
            <div><label style={S.label}>State / Country</label><input style={S.inp} value={form.state} onChange={e=>setForm(f=>({...f,state:e.target.value}))} placeholder="United Kingdom"/></div>
            <div><label style={S.label}>Phone Number</label><input style={S.inp} value={form.phone} onChange={e=>setForm(f=>({...f,phone:e.target.value}))} placeholder="447974759755"/></div>
            <div><label style={S.label}>Email</label><input style={S.inp} type="email" value={form.email} onChange={e=>setForm(f=>({...f,email:e.target.value}))} placeholder="email@example.com"/></div>
            <div>
              <label style={S.label}>Status</label>
              <select style={S.sel} value={form.status} onChange={e=>setForm(f=>({...f,status:e.target.value}))}>
                {CRM_STATUSES.map(s=><option key={s.id} value={s.id}>{s.id}</option>)}
              </select>
            </div>
            <div><label style={S.label}>Deposit ($)</label><input style={S.inp} type="number" value={form.deposit} onChange={e=>setForm(f=>({...f,deposit:e.target.value}))} placeholder="0.00"/></div>
            <div><label style={S.label}>Balance ($)</label><input style={S.inp} type="number" value={form.balance} onChange={e=>setForm(f=>({...f,balance:e.target.value}))} placeholder="0.00"/></div>
            <div>
              <label style={S.label}>Security Code</label>
              <div style={{ display:"flex", gap:6 }}>
                <input style={S.inp} value={form.security_code} onChange={e=>setForm(f=>({...f,security_code:e.target.value}))} placeholder="Auto"/>
                <button style={{ ...btn("ghost"), padding:"0 10px", fontSize:16, flexShrink:0 }} onClick={()=>setForm(f=>({...f,security_code:genCode()}))}>🔄</button>
              </div>
            </div>
            <div><label style={S.label}>Agent</label><input style={S.inp} value={form.agent} onChange={e=>setForm(f=>({...f,agent:e.target.value}))} placeholder="Agent name"/></div>
          </div>
          <div style={{ marginBottom:14 }}><label style={S.label}>Notes</label><textarea style={{ ...S.inp, minHeight:56, resize:"vertical" }} value={form.notes} onChange={e=>setForm(f=>({...f,notes:e.target.value}))} placeholder="Call notes…"/></div>
          <div style={S.row}>
            <button style={{ ...btn("primary"), padding:"10px 26px", fontSize:14 }} onClick={saveClient}>{editClient?"💾 Save Changes":"+ Add Client"}</button>
            <button style={{ ...btn("ghost"), padding:"10px 16px" }} onClick={resetForm}>Cancel</button>
          </div>
        </div>
      )}

      {/* Import Preview Modal */}
      {showImport && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.88)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:300, backdropFilter:"blur(8px)" }}>
          <div style={{ background:"#161616", border:"1px solid rgba(255,200,0,.3)", borderRadius:20, padding:28, width:"min(900px,96vw)", maxHeight:"88vh", display:"flex", flexDirection:"column" }}>
            <div style={{ ...S.rowsb, marginBottom:14 }}>
              <div><div style={{ fontSize:17, fontWeight:700, color:C.text }}>📥 Import Preview — {importRows.length} clients</div><div style={{ fontSize:12, color:C.text3, marginTop:3 }}>Review before importing to Supabase</div></div>
              <button style={{ background:"none", border:"none", color:C.text3, cursor:"pointer", fontSize:22 }} onClick={()=>{setShowImport(false);setImportRows([]);}}>×</button>
            </div>
            <div style={{ background:"rgba(255,200,0,.06)", border:"1px solid rgba(255,200,0,.18)", borderRadius:8, padding:"9px 14px", marginBottom:14, fontSize:12, color:C.text2 }}>
              ✅ Columns auto-detected. Missing security codes are auto-generated. Dollar signs and commas in amounts are handled automatically.
            </div>
            <div style={{ overflowY:"auto", flex:1, marginBottom:14 }}>
              <table style={{ ...S.tbl, fontSize:12 }}>
                <thead><tr>
                  {["#","NAME","LAST NAME","STATE","NUMBER","EMAIL","STATUS","DEPOSIT","BALANCE","CODE",""].map(h=>(
                    <th key={h} style={{ ...S.th, fontSize:10, background:"rgba(255,200,0,.08)", color:"#ffc800" }}>{h}</th>
                  ))}
                </tr></thead>
                <tbody>
                  {importRows.map((r,i)=>(
                    <tr key={i} style={{ background:i%2===0?"transparent":"rgba(255,255,255,.015)" }}>
                      <td style={{ ...S.td, color:C.text3, fontSize:11 }}>{i+1}</td>
                      <td style={{ ...S.td, fontWeight:700, color:C.text }}>{r.first_name||"—"}</td>
                      <td style={{ ...S.td, color:C.text }}>{r.last_name||"—"}</td>
                      <td style={{ ...S.td, fontSize:11, color:C.text2 }}>{r.state||"—"}</td>
                      <td style={{ ...S.td, fontFamily:"monospace", fontSize:11 }}>{r.phone||"—"}</td>
                      <td style={{ ...S.td, fontSize:11 }}>{r.email||"—"}</td>
                      <td style={S.td}><span style={{ fontSize:11, fontWeight:700, color:CRM_STATUSES.find(s=>s.id===r.status)?.color||"#aaa" }}>{r.status}</span></td>
                      <td style={{ ...S.td, fontFamily:"monospace", color:r.deposit>0?"#ffc800":C.text3, fontWeight:700 }}>{r.deposit>0?"$"+fmt(r.deposit):"—"}</td>
                      <td style={{ ...S.td, fontFamily:"monospace", color:r.balance>0?C.green:C.text3 }}>{r.balance>0?"$"+fmt(r.balance):"—"}</td>
                      <td style={{ ...S.td, fontFamily:"monospace", color:"#ffc800", fontSize:11, fontWeight:700 }}>{r.security_code}</td>
                      <td style={S.td}>
                        <button style={{ background:"none", border:"none", color:"#555", cursor:"pointer", fontSize:14, padding:"2px 6px" }}
                          onMouseEnter={e=>e.target.style.color="#ef4444"}
                          onMouseLeave={e=>e.target.style.color="#555"}
                          onClick={()=>setImportRows(prev=>prev.filter((_,idx)=>idx!==i))}
                          title="Remove this row">✕</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div style={{ ...S.rowsb, flexWrap:"wrap", gap:10 }}>
              <span style={{ fontSize:13, color:C.text3 }}>Ready to import <strong style={{ color:"#ffc800" }}>{importRows.length}</strong> clients</span>
              <div style={S.row}>
                <button style={{ ...btn("ghost"), padding:"10px 20px" }} onClick={()=>{setShowImport(false);setImportRows([]);}}>Cancel</button>
                <button style={{ ...btn("success"), padding:"10px 28px", fontSize:14, opacity:importing?.7:1 }} onClick={confirmImport} disabled={importing}>
                  {importing?`⏳ Importing… ${importRows.length}`:`✅ Import ${importRows.length} Clients`}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Table — Excel style */}
      <div style={{ ...S.card, padding:0, overflow:"hidden", borderColor:"rgba(255,200,0,.18)" }}>
        {/* Column headers — gold background like Excel */}
        <div style={{ overflowX:"auto", WebkitOverflowScrolling:"touch" }}>
          <table style={{ ...S.tbl, minWidth:1100 }}>
            <thead>
              <tr>
                <th style={{ ...S.th, width:40, background:"rgba(255,200,0,.12)", borderBottom:"2px solid rgba(255,200,0,.3)" }}>
                  <input type="checkbox" onChange={toggleSelectAll} checked={selected.size===filtered.length&&filtered.length>0}
                    style={{ cursor:"pointer", accentColor:"#ffc800", width:15, height:15 }}/>
                </th>
                {["NAME","LAST NAME","STATE","NUMBER","EMAIL","STATUS","DEPOSIT","BALANCE","CODE","ACTIONS"].map(h=>(
                  <th key={h} style={{ ...S.th, background:"rgba(255,200,0,.12)", color:"#ffc800", fontSize:11, fontWeight:700, letterSpacing:".08em", borderBottom:"2px solid rgba(255,200,0,.3)" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={11} style={{ ...S.td, textAlign:"center", padding:40, color:C.text3 }}>Loading CRM…</td></tr>
              ) : filtered.length===0 ? (
                <tr><td colSpan={11} style={{ ...S.td, textAlign:"center", padding:40, color:C.text3 }}>
                  {search||filterStat!=="All" ? "No clients match your filter." : "No clients yet — add one or import from CSV."}
                </td></tr>
              ) : filtered.map((c,i)=>{
                const isItm = c.status==="In The Money";
                const isSelected = selected.has(c.id);
                const rowBg = isSelected ? "rgba(255,200,0,.08)" : isItm ? "rgba(255,200,0,.06)" : i%2===0?"transparent":"rgba(255,255,255,.015)";
                return (
                  <tr key={c.id} style={{ background:rowBg, outline:isSelected?"1px solid rgba(255,200,0,.2)":"none" }}>
                    <td style={{ ...S.td, width:40, textAlign:"center" }}>
                      <input type="checkbox" checked={isSelected} onChange={()=>toggleSelect(c.id)}
                        style={{ cursor:"pointer", accentColor:"#ffc800", width:15, height:15 }}/>
                    </td>
                    <td style={{ ...S.td, fontWeight:700, color:isItm?"#ffc800":C.text }}>{c.first_name||"—"}</td>
                    <td style={{ ...S.td, color:C.text }}>{c.last_name||"—"}</td>
                    <td style={{ ...S.td, fontSize:12, color:C.text2 }}>{c.state||"—"}</td>
                    <td style={{ ...S.td, fontFamily:"monospace", fontSize:12 }}>{c.phone||"—"}</td>
                    <td style={{ ...S.td, fontSize:12 }}>{c.email||"—"}</td>
                    <td style={S.td}>
                      <select
                        value={c.status}
                        onChange={e=>updateStatus(c.id,e.target.value)}
                        style={{ background:"transparent", border:"none", cursor:"pointer", fontFamily:"inherit", fontSize:11, fontWeight:700, color:CRM_STATUSES.find(s=>s.id===c.status)?.color||C.text2, outline:"none", width:"100%" }}>
                        {CRM_STATUSES.map(s=><option key={s.id} value={s.id} style={{ background:"#111",color:"#fff" }}>{s.id}</option>)}
                      </select>
                    </td>
                    <td style={{ ...S.td, fontFamily:"monospace", fontWeight:700, color:(c.deposit||c.amount_deposited)>0?"#ffc800":C.text3 }}>
                      {(c.deposit||c.amount_deposited)>0 ? "$"+fmt(c.deposit||c.amount_deposited) : "—"}
                    </td>
                    <td style={{ ...S.td, fontFamily:"monospace", color:(c.balance)>0?C.green:C.text3 }}>
                      {c.balance>0 ? "$"+fmt(c.balance) : "—"}
                    </td>
                    <td style={{ ...S.td }}>
                      <div style={{ display:"flex", alignItems:"center", gap:5 }}>
                        <span style={{ fontFamily:"monospace", fontSize:12, color:"#ffc800", fontWeight:700, letterSpacing:1 }}>{c.security_code||"—"}</span>
                        {c.security_code && (
                          <button style={{ background:"none", border:"none", cursor:"pointer", color:C.text3, fontSize:11, padding:"1px 4px" }}
                            onClick={()=>{navigator.clipboard?.writeText(c.security_code);showToast("Code copied!","success");}}>📋</button>
                        )}
                      </div>
                    </td>
                    <td style={S.td}>
                      <div style={{ display:"flex", gap:5 }}>
                        <button style={{ ...btn("ghost"), padding:"5px 12px", fontSize:12 }} onClick={e=>{e.stopPropagation();startEdit(c);}}>✏️ Edit</button>
                        <button style={{ ...btn("danger"), padding:"5px 12px", fontSize:12 }} onClick={e=>{e.stopPropagation();deleteClient(c.id);}}>🗑 Del</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer totals */}
        {filtered.length>0 && (
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"12px 20px", background:"rgba(255,200,0,.06)", borderTop:"1px solid rgba(255,200,0,.15)", flexWrap:"wrap", gap:10 }}>
            <span style={{ fontSize:12, color:C.text3 }}>{filtered.length} of {clients.length} clients shown</span>
            <div style={{ display:"flex", gap:24 }}>
              <span style={{ fontSize:12, color:C.text3 }}>Deposit: <strong style={{ color:"#ffc800", fontFamily:"monospace" }}>${fmt(totalDeposited)}</strong></span>
              <span style={{ fontSize:12, color:C.text3 }}>Balance: <strong style={{ color:C.green, fontFamily:"monospace" }}>${fmt(totalBalance)}</strong></span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
