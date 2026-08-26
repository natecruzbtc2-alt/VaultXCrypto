import { memo, useRef, useEffect } from "react";
import { usePrices, COINS, fmt } from "./AppContext";
import { C, S } from "./theme";

export const Spark = memo(({data,color,w=80,h=28})=>{
  if(!data||data.length<2)return null;
  const mn=Math.min(...data),mx=Math.max(...data),r=mx-mn||1;
  const pts=data.map((v,i)=>`${(i/(data.length-1))*w},${h-((v-mn)/r)*h}`).join(" ");
  const c=color||(data[data.length-1]>=data[0]?"#ffc800":"#ef4444");
  return(
    <svg width={w} height={h} style={{display:"block",overflow:"visible"}}>
      <polyline points={pts} fill="none" stroke={c} strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round"/>
    </svg>
  );
});

export const MiniChart = memo(({prices:ps,color})=>{
  const ref=useRef();
  useEffect(()=>{
    const c=ref.current;if(!c)return;
    const ctx=c.getContext("2d"),w=c.width,h=c.height;
    ctx.clearRect(0,0,w,h);
    if(!ps||ps.length<2)return;
    const mn=Math.min(...ps),mx=Math.max(...ps),r=mx-mn||1;
    ctx.beginPath();
    ps.forEach((p,i)=>{const x=(i/(ps.length-1))*w,y=h-2-((p-mn)/r)*(h-4);i===0?ctx.moveTo(x,y):ctx.lineTo(x,y);});
    ctx.strokeStyle=color;ctx.lineWidth=2;ctx.lineJoin="round";ctx.stroke();
    const grad=ctx.createLinearGradient(0,0,0,h);
    grad.addColorStop(0,color+"44");grad.addColorStop(1,color+"00");
    ctx.lineTo(w,h);ctx.lineTo(0,h);ctx.closePath();ctx.fillStyle=grad;ctx.fill();
  },[ps,color]);
  return <canvas ref={ref} width={200} height={60} style={{width:"100%",height:60}}/>;
});

export const TickerBar = memo(()=>{
  const prices=usePrices(),ref=useRef();
  useEffect(()=>{
    let x=0;
    const id=setInterval(()=>{
      x-=1;
      if(ref.current)ref.current.style.transform=`translateX(${x}px)`;
      if(Math.abs(x)>(ref.current?.scrollWidth||0)/2)x=0;
    },30);
    return()=>clearInterval(id);
  },[]);
  return(
    <div style={S.ticker}>
      <div ref={ref} style={{display:"inline-flex",willChange:"transform"}}>
        {[...COINS,...COINS,...COINS].map((c,i)=>{
          const p=prices[c.sym],up=(p?.change||0)>=0;
          return(
            <span key={i} style={{padding:"0 24px",fontSize:12,fontFamily:"monospace",color:up?"#ffc800":C.red}}>
              {c.sym}/USD &nbsp;
              <strong>${p?.price<1?p?.price?.toFixed(4):fmt(p?.price)}</strong>
              &nbsp;<span style={{opacity:.65}}>{up?"+":""}{fmt(p?.change)}%</span>
            </span>
          );
        })}
      </div>
    </div>
  );
});

export const TickerMini = memo(()=>{
  const prices=usePrices();
  return(
    <div style={{display:"flex",gap:20,overflow:"hidden",maxWidth:420}}>
      {COINS.slice(0,4).map(c=>{
        const p=prices[c.sym],up=(p?.change||0)>=0;
        return(
          <div key={c.sym} style={{fontSize:12,color:C.text3,whiteSpace:"nowrap"}}>
            <span style={{color:C.text,fontWeight:700}}>{c.sym}</span>{" "}
            <span style={{fontFamily:"monospace",color:up?"#ffc800":C.red}}>
              ${p?.price<1?p?.price?.toFixed(4):fmt(p?.price)}
            </span>
          </div>
        );
      })}
    </div>
  );
});

export const CoinIcon = memo(({sym,size=28})=>{
  const coin=COINS.find(c=>c.sym===sym)||COINS[0];
  return(
    <div style={{width:size,height:size,borderRadius:"50%",background:coin.bg,border:`1px solid ${coin.color}55`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:size*.3,fontWeight:800,color:coin.color,flexShrink:0}}>
      {sym.slice(0,3)}
    </div>
  );
});

export const Tag = ({c,children}) => <span style={S.tag(c)}>{children}</span>;

export const EmptyState = ({icon="📭",text}) => (
  <div style={{textAlign:"center",padding:"40px 20px",color:C.text3}}>
    <div style={{fontSize:36,marginBottom:10}}>{icon}</div>
    <div style={{fontSize:14}}>{text}</div>
  </div>
);
