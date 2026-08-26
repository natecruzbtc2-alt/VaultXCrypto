import { useState, useCallback } from "react";
import { useApp, usePrices, COINS, BASE_PRICES, fmt, fmtCrypto } from "./AppContext";
import { C, S, btn } from "./theme";
import { CoinIcon } from "./components";

export function Modals() {
  const { modal, setModal } = useApp();
  if (!modal) return null;
  const close = () => setModal(null);
  if (modal === "deposit")            return <DepositModal close={close} />;
  if (modal === "send")               return <SendModal close={close} />;
  if (modal?.type === "userDetail")   return <UserDetailModal close={close} />;
  if (modal?.type === "fundUser")     return <FundModal close={close} />;
  if (modal?.type === "assignWallet") return <AssignWalletModal close={close} />;
  return null;
}

// ─── DEPOSIT MODAL ────────────────────────────────────────────────────────────
function DepositModal({ close }) {
  const { showToast, getUserWallet, user } = useApp();
  const wallet = getUserWallet(user?.email);

  return (
    <div style={S.modal} onClick={close}>
      <div style={S.modalBox} onClick={e => e.stopPropagation()}>
        <div style={{ fontSize: 20, fontWeight: 800, color: C.text, marginBottom: 6 }}>Deposit Funds</div>
        <div style={{ fontSize: 13, color: C.text3, marginBottom: 20 }}>
          {wallet ? "Your assigned deposit address is ready." : "Contact support to receive your deposit address."}
        </div>

        {wallet ? (
          <>
            {/* Payment Link Button - shows if deposit_link is set */}
            {wallet.deposit_link && (
              <div style={{ background:"linear-gradient(135deg,rgba(34,197,94,.08),rgba(34,197,94,.03))", border:"1px solid rgba(34,197,94,.25)", borderRadius:14, padding:20, marginBottom:16, textAlign:"center" }}>
                <div style={{ fontSize:13, color:C.text3, marginBottom:10 }}>💳 Quick deposit via secure payment link</div>
                <a href={wallet.deposit_link} target="_blank" rel="noopener noreferrer"
                  style={{ display:"inline-flex", alignItems:"center", gap:8, background:"linear-gradient(135deg,#15803d,#22c55e)", color:"#fff", padding:"13px 32px", borderRadius:10, fontWeight:700, fontSize:15, textDecoration:"none", boxShadow:"0 4px 20px rgba(34,197,94,.3)" }}>
                  💳 Deposit Now
                </a>
                <div style={{ fontSize:11, color:C.text3, marginTop:10 }}>Secure · Encrypted · Instant</div>
              </div>
            )}

            <div style={{ background: `rgba(34,197,94,.06)`, border: `1px solid rgba(34,197,94,.2)`, borderRadius: 14, padding: 20, marginBottom: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                <CoinIcon sym={wallet.coin} size={28} />
                <div>
                  <div style={{ fontWeight: 700, color: C.text, fontSize: 15 }}>{wallet.walletName || wallet.coin + " Deposit Wallet"}</div>
                  <div style={{ fontSize: 12, color: C.text3 }}>Network: {wallet.network}</div>
                </div>
              </div>
              <div style={{ fontSize: 11, color: C.text3, textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 6 }}>Deposit Address</div>
              <div style={{ fontFamily: "monospace", fontSize: 12, color: C.text, wordBreak: "break-all", lineHeight: 1.8, background: `rgba(255,200,0,.06)`, padding: "12px 16px", borderRadius: 10, border: `1px solid ${C.border}` }}>
                {wallet.address}
              </div>
              {wallet.fee && (
                <div style={{ marginTop: 10, fontSize: 12, color: C.gold }}>
                  ⚠️ Deposit fee applies: {wallet.fee}
                </div>
              )}
            </div>
            <div style={{ fontSize: 12, color: C.text3, lineHeight: 1.8, marginBottom: 16 }}>
              ⚠️ Only send <strong style={{ color: C.text }}>{wallet.coin}</strong> via <strong style={{ color: C.text }}>{wallet.network}</strong> to this address.
              Sending the wrong asset or using a different network may result in <strong style={{ color: C.red }}>permanent loss of funds</strong>.
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button style={{ ...btn("success"), flex: 1, padding: "12px" }}
                onClick={() => { navigator.clipboard?.writeText(wallet.address); showToast("Address copied to clipboard!", "success"); }}>
                📋 Copy Address
              </button>
              <button style={{ ...btn("ghost"), flex: 1, padding: "12px" }} onClick={close}>Close</button>
            </div>
          </>
        ) : (
          <>
            <div style={{ background: `rgba(255,200,0,.06)`, border: `1px solid ${C.border}`, borderRadius: 14, padding: 20, marginBottom: 20 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 10 }}>🔐 How deposits work</div>
              <div style={{ fontSize: 13, color: C.text2, lineHeight: 1.8 }}>
                For security and compliance, deposit wallets are assigned per-client by our team.
                Contact support with your desired coin and network — you'll receive a dedicated wallet address within minutes.
              </div>
            </div>
            <div style={{ ...S.scard, marginBottom: 20, fontSize: 13 }}>
              <div style={{ color: C.text3, marginBottom: 4 }}>Support Email</div>
              <div style={{ color: C.purple3, fontWeight: 600 }}>💬 Live chat available 24/7 — click below</div>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button style={{ ...btn("success"), flex: 1, padding: "12px" }}
                onClick={() => { if(window.Tawk_API && window.Tawk_API.maximize) { window.Tawk_API.maximize(); } else { window.open('https://tawk.to/chat/6a2e5fe88b30661d42bef351/1jr2id950', '_blank'); } showToast("Opening live chat…", "info"); }}>
                💬 Live Chat
              </button>
              <button style={{ ...btn("ghost"), flex: 1, padding: "12px" }} onClick={close}>Close</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ─── SEND / WITHDRAW MODAL ────────────────────────────────────────────────────
function SendModal({ close }) {
  const { user, updateUser, addTx, setPending, showAlert, showToast, hasPendingFees, getUserFeeReqs } = useApp();
  const prices = usePrices();
  const [address, setAddress] = useState("");
  const [coin,    setCoin]    = useState("BTC");
  const [amount,  setAmount]  = useState("");
  const [network, setNetwork] = useState("ERC-20 (Ethereum)");

  const pendingFees  = getUserFeeReqs(user?.email);
  const feesBlocking = pendingFees.length > 0;

  const doSend = useCallback(() => {
    if (feesBlocking) { showAlert("⚠️ Pay outstanding fees before withdrawing"); return; }
    if (!address.trim()) { showAlert("Enter recipient wallet address"); return; }
    const amt = Number(amount);
    if (!amt || amt <= 0) { showAlert("Enter a valid amount"); return; }
    if (amt > (user?.balance || 0)) { showAlert(`Insufficient balance. Available: $${fmt(user?.balance || 0)}`); return; }

    const price = prices[coin]?.price || 1;
    const qty   = +(amt / price).toFixed(8);
    const txId  = `WR${Date.now()}`;

    // Add to admin pending list for approval
    setPending(prev => [{
      id: txId,
      user: user.email,
      user_email: user.email,
      type: "Withdrawal",
      coin,
      amount: qty,
      usd: amt,
      fee: 1.2,
      submitted: new Date().toLocaleString(),
      network,
      address,
      status: "Pending",
    }, ...prev]);

    // Log in user transaction history as pending
    addTx(user.email, {
      id: txId, type: "Withdrawal", symbol: coin,
      amount: qty, value: amt, fee: 1.2,
      status: "Pending", date: new Date().toLocaleDateString(),
      notes: `To: ${address.slice(0,16)}… | Network: ${network} | Awaiting admin approval`,
    });

    showToast(`✅ Withdrawal of $${fmt(amt)} submitted. Awaiting admin approval.`, "success");
    close();
  }, [feesBlocking, address, amount, coin, network, prices, user, setPending, addTx, showAlert, showToast, close]);

  return (
    <div style={S.modal} onClick={close}>
      <div style={S.modalBox} onClick={e => e.stopPropagation()}>
        <div style={{ fontSize: 20, fontWeight: 800, color: C.text, marginBottom: 6 }}>Withdraw Crypto</div>
        <div style={{ fontSize: 13, color: C.text3, marginBottom: 20 }}>Transfer crypto to your external wallet</div>

        {feesBlocking && (
          <div style={{ background: "rgba(239,68,68,.08)", border: "1px solid rgba(239,68,68,.3)", borderRadius: 10, padding: "12px 14px", marginBottom: 16, fontSize: 13, color: C.red }}>
            🔒 You have {pendingFees.length} outstanding fee{pendingFees.length > 1 ? "s" : ""}. Pay all fees in your dashboard to unlock withdrawals.
          </div>
        )}

        <div style={{ marginBottom: 14 }}>
          <label style={S.label}>Recipient Wallet Address</label>
          <input style={S.inp} value={address} onChange={e => setAddress(e.target.value)} placeholder="0x… or bc1q… or T…" autoFocus />
        </div>
        <div style={{ ...S.g2, marginBottom: 14 }}>
          <div>
            <label style={S.label}>Coin</label>
            <select style={S.sel} value={coin} onChange={e => setCoin(e.target.value)}>
              {COINS.map(c => <option key={c.sym} value={c.sym}>{c.sym}</option>)}
            </select>
          </div>
          <div>
            <label style={S.label}>Network</label>
            <select style={S.sel} value={network} onChange={e => setNetwork(e.target.value)}>
              {["ERC-20 (Ethereum)", "BEP-20 (BSC)", "TRC-20 (TRON)", "Native BTC", "Native SOL", "Polygon"].map(n => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={S.label}>Amount (USD)</label>
          <input style={S.inp} type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00" onKeyDown={e => e.key === "Enter" && doSend()} />
        </div>
        {amount && Number(amount) > 0 && (
          <div style={{ ...S.scard, marginBottom: 16, fontSize: 13 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
              <span style={{ color: C.text3 }}>You withdraw</span>
              <strong style={{ color: C.text }}>{fmtCrypto(Number(amount) / (prices[coin]?.price || 1), coin)} {coin}</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
              <span style={{ color: C.text3 }}>Network fee</span>
              <span style={{ color: C.gold }}>~$1.20</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: C.text3 }}>Available balance</span>
              <span style={{ color: C.green }}>${fmt(user?.balance || 0)}</span>
            </div>
          </div>
        )}
        <div style={{ display: "flex", gap: 10 }}>
          <button style={{ ...btn("ghost"), flex: 1, padding: "12px" }} onClick={close}>Cancel</button>
          <button style={{ ...btn(feesBlocking ? "ghost" : "success"), flex: 1, padding: "12px" }} onClick={doSend}>
            {feesBlocking ? "🔒 Locked" : "Submit Withdrawal →"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── USER DETAIL MODAL ────────────────────────────────────────────────────────
function UserDetailModal({ close }) {
  const { modal, setModal, showToast, getUserWallet } = useApp();
  const wallet = getUserWallet(modal.user?.email);
  return (
    <div style={S.modal} onClick={close}>
      <div style={S.modalBox} onClick={e => e.stopPropagation()}>
        <div style={{ fontSize: 20, fontWeight: 800, color: C.text, marginBottom: 18 }}>Client Detail</div>
        <div style={{ ...S.scard, marginBottom: 18 }}>
          {[
            ["Name",       modal.user?.name],
            ["Email",      modal.user?.email],
            ["Cash Balance", "$" + fmt(modal.user?.balance)],
            ["Portfolio",  "$" + fmt(modal.user?.portfolio)],
            ["Holdings",   (modal.user?.holdings?.length || 0) + " assets"],
            ["Tier",       modal.user?.tier],
            ["Status",     modal.user?.status],
            ["Joined",     modal.user?.joined],
            ["Wallet",     wallet ? wallet.coin + " (" + wallet.network + ")" : "Not assigned"],
          ].map(([l, v]) => (
            <div key={l} style={{ ...S.rowsb, padding: "10px 0", borderBottom: `1px solid ${C.border2}` }}>
              <span style={{ color: C.text3, fontSize: 13 }}>{l}</span>
              <span style={{ color: C.text, fontWeight: 600, fontSize: 13 }}>{v}</span>
            </div>
          ))}
        </div>
        <div style={{ ...S.g2, marginBottom: 14 }}>
          <button style={{ ...btn("success"), justifyContent: "center", padding: "11px" }} onClick={() => setModal({ type: "fundUser", user: modal.user })}>+ Fund Account</button>
          <button style={{ ...btn("primary"), justifyContent: "center", padding: "11px" }} onClick={() => setModal({ type: "assignWallet", user: modal.user })}>🏦 Assign Wallet</button>
        </div>
        <button style={{ ...btn("ghost"), width: "100%", padding: "11px" }} onClick={close}>Close</button>
      </div>
    </div>
  );
}

// ─── FUND USER MODAL ──────────────────────────────────────────────────────────
function FundModal({ close }) {
  const { modal, users, setUsers, user, setUser, addTx, showToast } = useApp();
  const [amt,  setAmt]  = useState("");
  const [coin, setCoin] = useState("BTC");

  const doFund = useCallback(() => {
    const amount = Number(amt);
    if (!amount || amount <= 0) { showToast("Enter a valid amount", "info"); return; }
    const idx = users.findIndex(u => u.email === modal.user.email);
    if (idx === -1) return;

    const coinPrice = BASE_PRICES[coin] || 1;
    const qty = +(amount / coinPrice).toFixed(8);

    // Add crypto to holdings
    const existingHoldings = [...(users[idx].holdings || [])];
    const holdingIdx = existingHoldings.findIndex(h => h.sym === coin);
    if (holdingIdx !== -1) {
      const old = existingHoldings[holdingIdx];
      const newQty = +(old.qty + qty).toFixed(8);
      const newAvg = ((old.qty * (old.avgBuy||coinPrice)) + (qty * coinPrice)) / newQty;
      existingHoldings[holdingIdx] = { ...old, qty: newQty, avgBuy: +newAvg.toFixed(2) };
    } else {
      existingHoldings.push({ sym: coin, qty, avgBuy: +coinPrice.toFixed(2) });
    }

    const updated = [...users];
    updated[idx] = {
      ...updated[idx],
      balance:   +(updated[idx].balance + amount).toFixed(2),
      portfolio: +(updated[idx].portfolio + amount).toFixed(2),
      holdings:  existingHoldings,
    };
    setUsers(updated);
    if (user && user.email === modal.user.email) setUser(updated[idx]);
    addTx(modal.user.email, {
      id: `DP${Date.now()}`, type: "Deposit", symbol: coin,
      amount: +(amount / (BASE_PRICES[coin] || 1)).toFixed(8),
      value: amount, fee: +(amount * .001).toFixed(2),
      status: "Completed", date: new Date().toLocaleDateString(),
      notes: "Credited by admin",
    });
    showToast(`✅ $${fmt(amount)} credited to ${modal.user.name}`, "success");
    close();
  }, [amt, coin, users, user, setUsers, setUser, addTx, showToast, modal, close]);

  return (
    <div style={S.modal} onClick={close}>
      <div style={S.modalBox} onClick={e => e.stopPropagation()}>
        <div style={{ fontSize: 20, fontWeight: 800, color: C.text, marginBottom: 6 }}>Fund Account</div>
        <div style={{ fontSize: 13, color: C.text3, marginBottom: 20 }}>
          Credit funds to <strong style={{ color: C.purple3 }}>{modal.user?.name}</strong>
          <span style={{ color: C.text3 }}> · Current balance: ${fmt(modal.user?.balance)}</span>
        </div>
        <div style={{ marginBottom: 14 }}>
          <label style={S.label}>Coin</label>
          <select style={S.sel} value={coin} onChange={e => setCoin(e.target.value)}>
            {COINS.map(c => <option key={c.sym} value={c.sym}>{c.sym} — {c.name}</option>)}
          </select>
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={S.label}>Amount (USD)</label>
          <input type="number" style={S.inp} value={amt} onChange={e => setAmt(e.target.value)} placeholder="1000.00" autoFocus onKeyDown={e => e.key === "Enter" && doFund()} />
        </div>
        {amt && Number(amt) > 0 && (
          <div style={{ ...S.scard, marginBottom: 16, fontSize: 13, color: C.text2 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
              <span>Crypto equivalent</span>
              <strong style={{ color: C.text }}>{(Number(amt) / (BASE_PRICES[coin] || 1)).toFixed(8)} {coin}</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>New balance</span>
              <strong style={{ color: C.green }}>${fmt((modal.user?.balance || 0) + Number(amt))}</strong>
            </div>
          </div>
        )}
        <div style={{ display: "flex", gap: 10 }}>
          <button style={{ ...btn("ghost"), flex: 1, padding: "12px" }} onClick={close}>Cancel</button>
          <button style={{ ...btn("success"), flex: 1, padding: "12px" }} onClick={doFund}>Credit Funds</button>
        </div>
      </div>
    </div>
  );
}

// ─── ASSIGN WALLET MODAL ──────────────────────────────────────────────────────
function AssignWalletModal({ close }) {
  const { modal, assignWallet, getUserWallet, showAlert } = useApp();
  const existing = getUserWallet(modal.user?.email);
  const [form, setForm] = useState({
    coin:         existing?.coin         || "BTC",
    address:      existing?.address      || "",
    network:      existing?.network      || "Native BTC",
    walletName:   existing?.walletName   || "",
    fee:          existing?.fee          || "",
    deposit_link: existing?.deposit_link || "",
  });

  const doAssign = useCallback(() => {
    if (!form.address && !form.deposit_link) { showAlert("Enter a wallet address or payment link"); return; }
    assignWallet(modal.user.email, {
      coin:         form.coin,
      address:      form.address,
      network:      form.network,
      walletName:   form.walletName || form.coin + " Wallet",
      fee:          form.fee,
      deposit_link: form.deposit_link,
      assignedAt:   new Date().toLocaleString(),
    });
    close();
  }, [form, modal, assignWallet, showAlert, close]);

  return (
    <div style={S.modal} onClick={close}>
      <div style={S.modalBox} onClick={e => e.stopPropagation()}>
        <div style={{ fontSize: 20, fontWeight: 800, color: C.text, marginBottom: 6 }}>
          {existing ? "Update" : "Assign"} Deposit Wallet
        </div>
        <div style={{ fontSize: 13, color: C.text3, marginBottom: 20 }}>
          For <strong style={{ color: C.purple3 }}>{modal.user?.name}</strong>
        </div>
        <div style={{ ...S.g2, marginBottom: 14 }}>
          <div>
            <label style={S.label}>Coin</label>
            <select style={S.sel} value={form.coin} onChange={e => setForm(f => ({ ...f, coin: e.target.value }))}>
              {["BTC","ETH","USDT","BNB","SOL","XRP","ADA","DOGE"].map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label style={S.label}>Network</label>
            <select style={S.sel} value={form.network} onChange={e => setForm(f => ({ ...f, network: e.target.value }))}>
              {["Native BTC","ERC-20 (Ethereum)","BEP-20 (BSC)","TRC-20 (TRON)","Native SOL","Polygon (MATIC)","Avalanche","Arbitrum"].map(n => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
        </div>
        <div style={{ marginBottom: 14 }}>
          <label style={S.label}>Wallet Address</label>
          <input style={S.inp} value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} placeholder="bc1q… or 0x… or T…" autoFocus />
        </div>
        <div style={{ ...S.g2, marginBottom: 14 }}>
          <div>
            <label style={S.label}>Wallet Name</label>
            <input style={S.inp} value={form.walletName} onChange={e => setForm(f => ({ ...f, walletName: e.target.value }))} placeholder="e.g. BTC Cold Storage" />
          </div>
          <div>
            <label style={S.label}>Deposit Fee (optional)</label>
            <input style={S.inp} value={form.fee} onChange={e => setForm(f => ({ ...f, fee: e.target.value }))} placeholder="e.g. 0.001 BTC or 1%" />
          </div>
        </div>

        {/* DEPOSIT LINK */}
        <div style={{ marginBottom: 16 }}>
          <label style={S.label}>💳 Payment Link (optional)</label>
          <input style={{ ...S.inp, borderColor: form.deposit_link ? "rgba(34,197,94,.4)" : "" }}
            value={form.deposit_link}
            onChange={e => setForm(f => ({ ...f, deposit_link: e.target.value }))}
            placeholder="https://app.payfastandeasy.com/payment?token=..." />
          <div style={{ fontSize: 11, color: C.text3, marginTop: 5 }}>
            If set, client sees a green "💳 Deposit Now" button that opens this link
          </div>
        </div>

        {/* PREVIEW */}
        {(form.address || form.deposit_link) && (
          <div style={{ ...S.scard, marginBottom: 16, fontSize: 13 }}>
            <div style={{ color: C.text3, marginBottom: 6, fontSize: 11, textTransform: "uppercase" }}>Client will see:</div>
            {form.deposit_link && (
              <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8 }}>
                <span style={{ background:"rgba(34,197,94,.15)", color:"#22c55e", border:"1px solid rgba(34,197,94,.3)", padding:"5px 14px", borderRadius:8, fontSize:12, fontWeight:700 }}>💳 Deposit Now</span>
                <span style={{ fontSize:11, color:C.text3 }}>→ opens payment link</span>
              </div>
            )}
            {form.address && (
              <div style={{ fontFamily: "monospace", color: C.text, wordBreak: "break-all", fontSize:11 }}>{form.address}</div>
            )}
          </div>
        )}

        <div style={{ display: "flex", gap: 10 }}>
          <button style={{ ...btn("ghost"), flex: 1, padding: "12px" }} onClick={close}>Cancel</button>
          <button style={{ ...btn("success"), flex: 1, padding: "12px" }} onClick={doAssign}>
            🏦 {existing ? "Update" : "Assign"} Wallet
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── TOAST ────────────────────────────────────────────────────────────────────
export function Toast() {
  const { toast } = useApp();
  if (!toast) return null;
  return (
    <div style={{
      position: "fixed", bottom: 24, right: 24, zIndex: 9999,
      background: "#0d0a1a", border: `1px solid rgba(138,43,226,.4)`,
      borderRadius: 14, padding: "14px 20px", fontSize: 13, color: C.text,
      display: "flex", alignItems: "center", gap: 10, minWidth: 280, maxWidth: 420,
      boxShadow: `0 8px 40px rgba(0,0,0,.6), 0 0 0 1px rgba(255,200,0,.15)`,
      animation: "slideUp .2s ease",
    }}>
      <style>{`@keyframes slideUp{from{transform:translateY(20px);opacity:0}to{transform:translateY(0);opacity:1}}`}</style>
      <span style={{ fontSize: 18, flexShrink: 0 }}>
        {toast.type === "success" ? "✅" : toast.type === "info" ? "💜" : "⚠️"}
      </span>
      <span style={{ lineHeight: 1.5 }}>{toast.msg}</span>
    </div>
  );
}
