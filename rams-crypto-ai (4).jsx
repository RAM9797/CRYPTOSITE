import { useState, useCallback, useEffect, useRef } from "react";

// ═══════════════════════════════════════════════════════════════
// STRICT COLOR SYSTEM  ─  ONLY these 4 values are used anywhere
// ═══════════════════════════════════════════════════════════════
const RED    = "#DC2626";
const YELLOW = "#D97706";   // amber-yellow  (lighter variant in dark: #FBBF24)
const GREEN  = "#16A34A";   // (lighter in dark: #22C55E)
const WHITE  = "#FFFFFF";
const BLACK  = "#0F0F0F";

// Light theme — background is PURE WHITE, no tints
const LT = {
  bg:      WHITE,        // PURE WHITE — no exceptions
  card:    WHITE,
  sidebar: WHITE,
  header:  WHITE,
  border:  "#E5E7EB",    // neutral light gray border (no color tint)
  text:    BLACK,
  muted:   "#6B7280",
  dim:     "#D1D5DB",
  buy:     GREEN,
  sell:    RED,
  hold:    YELLOW,
  red:     RED,
  yellow:  YELLOW,
};

// Dark theme — activated only by user toggle
const DK = {
  bg:      BLACK,
  card:    "#1A1A1A",
  sidebar: "#141414",
  header:  "#0F0F0F",
  border:  "#2A2A2A",
  text:    WHITE,
  muted:   "#9CA3AF",
  dim:     "#374151",
  buy:     "#22C55E",
  sell:    "#EF4444",
  hold:    "#FBBF24",
  red:     "#EF4444",
  yellow:  "#FBBF24",
};

// ═══════════════════════════════════════════════════════════════
// DATA
// ═══════════════════════════════════════════════════════════════
const COINS = [
  { id:"bitcoin",   ticker:"BTC",  name:"Bitcoin",   logo:"₿", price:70730.58, change_24h:-1.90, change_7d:4.2,  change_30d:-7.5,  market_cap:1414672644441, volume:31858677142, action:"HOLD", confidence:62, risk:"Medium",      bullish_score:52, bearish_score:48, sentiment:"Neutral", trend:"Consolidation",   rsi:52, macd:"Neutral",  ma_50:72604, ma_200:80200, support:65000,  resistance:74000,  catalysts:["ETF inflows $700M in March","Geopolitical safe-haven demand","Parabolic SAR support holding"], summary:"Bitcoin is trading at $70,730, down ~1.9% on the day after rejection near $71,600. Price sits in a consolidation zone between $65K support and $74K resistance. RSI neutral at 52. Below its 200-day EMA (~$80,200), signaling macro-level pressure. Fear & Greed at 18 (Extreme Fear). Hold pending clearer directional confirmation.", news_sentiment:0.52, last_updated:Date.now()-120000 },
  { id:"ethereum",  ticker:"ETH",  name:"Ethereum",  logo:"Ξ", price:2020.00,  change_24h:2.12,  change_7d:-3.8, change_30d:-18.4, market_cap:243000000000,  volume:11200000000, action:"HOLD", confidence:56, risk:"Medium-High", bullish_score:45, bearish_score:55, sentiment:"Neutral", trend:"Sideways",        rsi:47, macd:"Neutral",  ma_50:2380,  ma_200:2890,  support:1800,   resistance:2380,   catalysts:["ETF net outflows slowing","Layer-2 activity steady","Pectra upgrade anticipation"], summary:"ETH trades near $2,020, down significantly from its 2025 ATH of ~$4,897. Price is below both the 50-day (~$2,380) and 200-day (~$2,890) MAs. Short-term bounce of +2% today but macro trend remains under pressure. Wait for reclaim of $2,380 before re-entry.", news_sentiment:0.46, last_updated:Date.now()-180000 },
  { id:"solana",    ticker:"SOL",  name:"Solana",    logo:"◎", price:85.01,    change_24h:2.42,  change_7d:-6.1, change_30d:-22.3, market_cap:50106022843,   volume:4659719267,  action:"HOLD", confidence:58, risk:"High",        bullish_score:50, bearish_score:50, sentiment:"Neutral", trend:"Sideways",        rsi:46, macd:"Neutral",  ma_50:105,   ma_200:145,   support:75,     resistance:105,    catalysts:["DePIN ecosystem growing","Meme coin activity elevated","DEX volume competitive"], summary:"SOL at $85, recovering modestly (+2.4%) but well below its 50-day ($105) and 200-day ($145) MAs. Support at $75 is critical. Hold and monitor for reclaim of $105 before considering re-entry.", news_sentiment:0.51, last_updated:Date.now()-90000 },
  { id:"xrp",       ticker:"XRP",  name:"XRP",       logo:"✕", price:1.3700,   change_24h:2.43,  change_7d:-5.2, change_30d:-28.4, market_cap:79200000000,   volume:3800000000,  action:"HOLD", confidence:55, risk:"High",        bullish_score:48, bearish_score:52, sentiment:"Neutral", trend:"Sideways",        rsi:44, macd:"Neutral",  ma_50:1.85,  ma_200:2.10,  support:1.20,   resistance:1.85,   catalysts:["XRP Ledger named top gainer","Ripple ODL expansion","Regulatory clarity improving"], summary:"XRP at $1.37, significantly off its early-2026 highs near $2.40. Trading below both MAs with neutral RSI. XRP Ledger Ecosystem named a top gainer today. Support at $1.20 must hold.", news_sentiment:0.50, last_updated:Date.now()-240000 },
  { id:"cardano",   ticker:"ADA",  name:"Cardano",   logo:"₳", price:0.2580,   change_24h:-4.09, change_7d:-11.2,change_30d:-34.1, market_cap:9865899375,    volume:633569669,   action:"SELL", confidence:74, risk:"High",        bullish_score:26, bearish_score:74, sentiment:"Bearish", trend:"Downtrend",       rsi:32, macd:"Bearish",  ma_50:0.38,  ma_200:0.52,  support:0.22,   resistance:0.38,   catalysts:["Down 34% in 30 days","Below all key moving averages","Weak developer activity"], summary:"ADA is in a confirmed downtrend at $0.258, down 34% over 30 days. Trading well below both the 50-day ($0.38) and 200-day ($0.52) MAs. RSI at 32, approaching oversold but no reversal catalyst. SELL maintained until price reclaims $0.38.", news_sentiment:0.27, last_updated:Date.now()-150000 },
  { id:"dogecoin",  ticker:"DOGE", name:"Dogecoin",  logo:"Ð", price:0.0921,   change_24h:4.90,  change_7d:-8.3, change_30d:-31.2, market_cap:14944611961,   volume:2082764065,  action:"SELL", confidence:67, risk:"Very High",    bullish_score:33, bearish_score:67, sentiment:"Bearish", trend:"Downtrend",       rsi:36, macd:"Bearish",  ma_50:0.132, ma_200:0.165, support:0.075,  resistance:0.132,  catalysts:["Down 31% in 30 days","Social volume declining","Below key MAs"], summary:"DOGE bounced +4.9% today but remains in a structural downtrend at $0.092, down 31% over the past month. The bounce is likely a relief rally. SELL/avoid at current levels.", news_sentiment:0.34, last_updated:Date.now()-60000 },
  { id:"chainlink", ticker:"LINK", name:"Chainlink", logo:"⬡", price:8.90,     change_24h:1.60,  change_7d:-4.2, change_30d:-19.8, market_cap:5800000000,    volume:380000000,   action:"HOLD", confidence:60, risk:"Medium-High", bullish_score:46, bearish_score:54, sentiment:"Neutral", trend:"Sideways",        rsi:45, macd:"Neutral",  ma_50:11.20, ma_200:13.80, support:7.50,   resistance:11.20,  catalysts:["CCIP enterprise adoption growing","DeFi oracle demand stable","Correlated with BTC recovery"], summary:"LINK at $8.90, modestly positive today (+1.6%) but down ~20% over 30 days. Below both major MAs. Neutral RSI at 45. Support at $7.50 must hold. Wait for reclaim of $11.20 before BUY signal.", news_sentiment:0.48, last_updated:Date.now()-200000 },
  { id:"polkadot",  ticker:"DOT",  name:"Polkadot",  logo:"●", price:4.20,     change_24h:-5.62, change_7d:-13.8,change_30d:-38.5, market_cap:6500000000,    volume:290000000,   action:"SELL", confidence:76, risk:"High",        bullish_score:22, bearish_score:78, sentiment:"Bearish", trend:"Strong Downtrend",rsi:28, macd:"Bearish",  ma_50:6.80,  ma_200:8.40,  support:3.80,   resistance:6.80,   catalysts:["Down 38% in 30 days","Parachain usage declining","Competition from Solana/ETH L2s"], summary:"DOT at $4.20 is in a strong downtrend, down 38% over 30 days and trading far below its 50-day ($6.80) and 200-day ($8.40) MAs. RSI at 28. SELL signal maintained.", news_sentiment:0.24, last_updated:Date.now()-300000 },
];

const NEWS = [
  {id:1,title:"Bitcoin Holds $70K as Parabolic SAR Support Remains Intact",    coin:"BTC", sentiment:"neutral", time:"1h ago",  source:"CryptoBasic"},
  {id:2,title:"BTC ETF Inflows Reach $700M in March Despite Macro Headwinds",  coin:"BTC", sentiment:"positive",time:"2h ago",  source:"CoinDesk"},
  {id:3,title:"Fear & Greed Index at 18 — Extreme Fear Grips Crypto Market",   coin:null,  sentiment:"negative",time:"3h ago",  source:"Alternative.me"},
  {id:4,title:"XRP Ledger Ecosystem Named Top Gainer Today on CoinGecko",       coin:"XRP", sentiment:"positive",time:"4h ago",  source:"CoinGecko"},
  {id:5,title:"Cardano Down 34% in 30 Days — Bears Remain in Full Control",     coin:"ADA", sentiment:"negative",time:"5h ago",  source:"Messari"},
  {id:6,title:"Polkadot Slides to $4.20, Down 38% in a Month",                 coin:"DOT", sentiment:"negative",time:"6h ago",  source:"The Block"},
  {id:7,title:"Geopolitical Tensions Drive Safe-Haven Flows Into Bitcoin",      coin:"BTC", sentiment:"positive",time:"7h ago",  source:"TradingEconomics"},
  {id:8,title:"Total Crypto Market Cap at $2.48T — Down 5.45% in 24 Hours",    coin:null,  sentiment:"negative",time:"8h ago",  source:"CoinGecko"},
  {id:9,title:"Solana DEX Volume Holds Strong Despite SOL Price Correction",    coin:"SOL", sentiment:"neutral", time:"9h ago",  source:"DeFiLlama"},
  {id:10,title:"Ethereum Pectra Upgrade Anticipation Provides Floor at $1,800", coin:"ETH", sentiment:"neutral", time:"10h ago", source:"Decrypt"},
];

// ═══════════════════════════════════════════════════════════════
// UTILITIES
// ═══════════════════════════════════════════════════════════════
const fmtN = (n,d=2) => n?.toLocaleString("en-US",{minimumFractionDigits:d,maximumFractionDigits:d});
const fmtP = p => p>=1000?`$${fmtN(p)}`:p>=1?`$${fmtN(p,3)}`:`$${fmtN(p,4)}`;
const fmtM = n => n>=1e12?`$${fmtN(n/1e12,2)}T`:n>=1e9?`$${fmtN(n/1e9,2)}B`:`$${fmtN(n/1e6,2)}M`;
const timeAgo = ts => { const s=Math.floor((Date.now()-ts)/1000); return s<60?`${s}s`:s<3600?`${Math.floor(s/60)}m`:`${Math.floor(s/3600)}h`; };
const sigColor = (action,T) => action==="BUY"?T.buy:action==="SELL"?T.sell:T.hold;

// ═══════════════════════════════════════════════════════════════
// GLOBAL STYLES — re-injected when theme changes
// ═══════════════════════════════════════════════════════════════
function Styles({T}) {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap');

      *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

      html, body {
        background: ${T.bg};
        color: ${T.text};
        font-family: 'Syne', sans-serif;
        transition: background 0.3s ease, color 0.3s ease;
      }

      ::-webkit-scrollbar { width: 4px; height: 4px; }
      ::-webkit-scrollbar-track { background: ${T.bg}; }
      ::-webkit-scrollbar-thumb { background: ${T.dim}; border-radius: 2px; }

      .mono { font-family: 'JetBrains Mono', monospace; }

      /* ── keyframes ── */
      @keyframes ticker-move { from { transform: translateX(0); } to { transform: translateX(-50%); } }
      @keyframes blink-dot   { 0%,100%{opacity:1} 50%{opacity:0.2} }
      @keyframes slide-up    { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
      @keyframes fade-in     { from{opacity:0} to{opacity:1} }
      @keyframes logo-pulse  { 0%,100%{box-shadow:0 0 0 0 ${RED}50} 50%{box-shadow:0 0 0 8px ${RED}00} }
      @keyframes flash-up    { 0%{background:${GREEN}28} 100%{background:transparent} }
      @keyframes flash-dn    { 0%{background:${RED}28}   100%{background:transparent} }

      .anim-slide   { animation: slide-up  0.32s ease forwards; }
      .anim-fade    { animation: fade-in   0.25s ease forwards; }
      .row-flash-up { animation: flash-up  0.8s  ease forwards; }
      .row-flash-dn { animation: flash-dn  0.8s  ease forwards; }

      /* ── CARD ── */
      .card {
        background: ${T.card};
        border: 1px solid ${T.border};
        border-radius: 12px;
        transition: background 0.3s ease, border-color 0.2s ease;
      }
      .card:hover { border-color: ${RED}; }

      /* ── SIGNAL BADGES ── */
      .sig-badge {
        display: inline-flex; align-items: center; gap: 4px;
        padding: 3px 11px; border-radius: 6px;
        font-family: 'JetBrains Mono', monospace;
        font-size: 11px; font-weight: 600; letter-spacing: 0.8px;
      }
      .sig-BUY  { color: ${T.buy};  background: ${T.buy}18;  border: 1px solid ${T.buy}44;  }
      .sig-SELL { color: ${T.sell}; background: ${T.sell}18; border: 1px solid ${T.sell}44; }
      .sig-HOLD { color: ${T.hold}; background: ${T.hold}18; border: 1px solid ${T.hold}44; }

      /* ── NAV ITEMS ── */
      .nav-item {
        display: flex; align-items: center; gap: 10px;
        padding: 9px 12px; border-radius: 8px; cursor: pointer;
        font-size: 13px; font-weight: 600; color: ${T.muted};
        border: 1px solid transparent; transition: all 0.18s ease;
      }
      .nav-item:hover  { background: ${T.border}; color: ${T.text}; }
      .nav-item.active { background: ${RED}12; color: ${RED}; border-color: ${RED}30; }

      /* ── TABS ── */
      .tab-btn {
        padding: 7px 15px; border-radius: 7px; cursor: pointer;
        font-family: 'Syne', sans-serif; font-size: 12px; font-weight: 700;
        border: 1px solid transparent; background: transparent; color: ${T.muted};
        transition: all 0.18s ease;
      }
      .tab-btn.active   { background: ${RED}12; color: ${RED}; border-color: ${RED}30; }
      .tab-btn:hover:not(.active) { background: ${T.border}; color: ${T.text}; }

      /* ── COIN TABLE ROWS ── */
      .coin-row {
        display: grid;
        grid-template-columns: 40px 150px 110px 72px 80px 80px 88px 92px 92px 64px;
        align-items: center; padding: 11px 16px;
        border-radius: 9px; cursor: pointer;
        border: 1px solid transparent; gap: 6px; transition: all 0.17s ease;
      }
      .coin-row:hover { background: ${RED}08; border-color: ${RED}22; }

      /* ── CHANGE COLORS — only green and red ── */
      .ch-up { color: ${T.buy};  font-family:'JetBrains Mono',monospace; font-size:12px; font-weight:600; }
      .ch-dn { color: ${T.sell}; font-family:'JetBrains Mono',monospace; font-size:12px; font-weight:600; }

      /* ── RISK LABELS — only green/yellow/red ── */
      .risk-Very-High  { color: ${T.sell}; font-family:'JetBrains Mono',monospace; font-size:11px; font-weight:600; }
      .risk-High       { color: ${T.sell}; font-family:'JetBrains Mono',monospace; font-size:11px; font-weight:600; }
      .risk-Medium-High{ color: ${T.hold}; font-family:'JetBrains Mono',monospace; font-size:11px; font-weight:600; }
      .risk-Medium     { color: ${T.hold}; font-family:'JetBrains Mono',monospace; font-size:11px; font-weight:600; }
      .risk-Low        { color: ${T.buy};  font-family:'JetBrains Mono',monospace; font-size:11px; font-weight:600; }

      /* ── CONFIDENCE BAR ── */
      .conf-track { height: 5px; border-radius: 3px; background: ${T.border}; overflow: hidden; }
      .conf-fill  { height: 100%; border-radius: 3px; transition: width 0.9s ease; }

      /* ── INDICATOR ROWS ── */
      .ind-row { display:flex; justify-content:space-between; align-items:center; padding: 9px 0; border-bottom: 1px solid ${T.border}; }
      .ind-row:last-child { border-bottom: none; }

      /* ── NEWS CARDS ── */
      .news-card { padding:13px 15px; border-radius:9px; background:${T.card}; border:1px solid ${T.border}; transition:border-color 0.18s; cursor:pointer; }
      .news-card:hover { border-color: ${RED}; }
      .news-pos { border-left: 3px solid ${T.buy};  }
      .news-neg { border-left: 3px solid ${T.sell}; }
      .news-neu { border-left: 3px solid ${T.hold}; }

      /* ── SEARCH INPUT ── */
      .search-inp {
        background: ${T.card}; border: 1px solid ${T.border}; border-radius: 8px;
        padding: 8px 13px 8px 33px; font-family: 'Syne', sans-serif;
        font-size: 13px; color: ${T.text}; outline: none; width: 210px; transition: all 0.2s;
      }
      .search-inp:focus { border-color: ${RED}; width: 245px; }
      .search-inp::placeholder { color: ${T.muted}; }

      /* ── PRIMARY BUTTON — Red only ── */
      .btn-red {
        background: ${RED}; color: ${WHITE}; border: none; border-radius: 8px;
        padding: 8px 17px; font-family: 'Syne', sans-serif; font-weight: 700;
        font-size: 12px; cursor: pointer; transition: opacity 0.18s;
      }
      .btn-red:hover { opacity: 0.82; }

      /* ── DARK MODE TOGGLE ── */
      .toggle-btn {
        display: flex; align-items: center; gap: 6px; padding: 7px 14px; border-radius: 8px;
        cursor: pointer; font-family: 'Syne', sans-serif; font-weight: 700; font-size: 12px;
        border: 1.5px solid ${T.border}; background: transparent; color: ${T.text};
        transition: all 0.2s ease;
      }
      .toggle-btn:hover { border-color: ${RED}; color: ${RED}; }

      /* ── LIVE DOT — green only ── */
      .live-dot {
        width: 7px; height: 7px; border-radius: 50%;
        background: ${T.buy}; box-shadow: 0 0 5px ${T.buy};
        animation: blink-dot 2s infinite;
      }

      /* ── TICKER ── */
      .ticker-track { display: inline-flex; white-space: nowrap; animation: ticker-move 32s linear infinite; }
      .ticker-track:hover { animation-play-state: paused; }

      /* ── SPARKLINE ── */
      .spark { display: flex; align-items: flex-end; gap: 2px; height: 30px; }
      .spark-bar { width: 4px; border-radius: 2px; min-height: 3px; }

      /* ── PROGRESS RING ── */
      .ring-svg circle { transition: stroke-dashoffset 0.9s ease; }

      /* ── RESPONSIVE ── */
      @media(max-width:900px) {
        .coin-row { grid-template-columns: 38px 130px 100px 68px; }
        .hide-md { display: none !important; }
      }
      @media(max-width:600px) {
        .coin-row { grid-template-columns: 36px 1fr 90px 68px; padding: 10px 10px; }
        .hide-sm { display: none !important; }
        .sidebar  { display: none !important; }
        .main-col { margin-left: 0 !important; }
        .top-bar  { padding: 0 12px !important; }
      }
    `}</style>
  );
}

// ═══════════════════════════════════════════════════════════════
// SMALL REUSABLE ATOMS
// ═══════════════════════════════════════════════════════════════

// Change percentage — only green or red
function Chg({v}) {
  const n = parseFloat(v);
  if (v == null || isNaN(n)) return <span className="ch-up">—</span>;
  return <span className={n>=0?"ch-up":"ch-dn"}>{n>=0?"+":""}{n.toFixed(2)}%</span>;
}

// BUY / SELL / HOLD badge
function SigBadge({action, large}) {
  const arrow = action==="BUY"?"▲":action==="SELL"?"▼":"◉";
  return (
    <span className={`sig-badge sig-${action}`}
      style={large?{padding:"7px 18px",fontSize:13,borderRadius:8}:{}}>
      {arrow} {action}
    </span>
  );
}

// Risk label
function RiskLabel({r}) {
  const cls = `risk-${r?.replace(/ /g,"-")}`;
  return <span className={cls}>{r}</span>;
}

// Circular progress ring — only uses allowed colors passed in
function Ring({score, size=58, color, T}) {
  const r = (size-8)/2;
  const c = 2*Math.PI*r;
  const d = c*(score/100);
  return (
    <div style={{width:size,height:size,position:"relative",display:"flex",alignItems:"center",justifyContent:"center"}}>
      <svg width={size} height={size} className="ring-svg"
        style={{position:"absolute",top:0,left:0,transform:"rotate(-90deg)"}}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={T.border} strokeWidth="4"/>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth="4"
          strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c-d}/>
      </svg>
      <span className="mono" style={{fontSize:size>52?13:11,fontWeight:700,color}}>{score}%</span>
    </div>
  );
}

// Sparkline bars — only green or red
function Spark({positive, T}) {
  const vals = positive
    ? [28,38,32,50,44,58,54,66,62,76]
    : [76,66,62,50,55,42,38,34,26,22];
  const color = positive ? T.buy : T.sell;
  return (
    <div className="spark">
      {vals.map((h,i) => (
        <div key={i} className="spark-bar"
          style={{height:`${h}%`, background:color, opacity: 0.3+i*0.07}}/>
      ))}
    </div>
  );
}

// Confidence bar
function ConfBar({value, color}) {
  return (
    <div className="conf-track" style={{width:"100%"}}>
      <div className="conf-fill" style={{width:`${value}%`, background:color}}/>
    </div>
  );
}

// Bull/Bear sentiment split bar — green + red only
function SentBar({bull, bear, T}) {
  return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
        <span className="mono" style={{fontSize:11,color:T.buy, fontWeight:600}}>▲ {bull}%</span>
        <span className="mono" style={{fontSize:11,color:T.sell,fontWeight:600}}>▼ {bear}%</span>
      </div>
      <div style={{height:5,borderRadius:3,overflow:"hidden",display:"flex"}}>
        <div style={{width:`${bull}%`,background:T.buy, borderRadius:"3px 0 0 3px"}}/>
        <div style={{width:`${bear}%`,background:T.sell,borderRadius:"0 3px 3px 0"}}/>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// LOGO  —  Yellow-to-Red gradient square  +  Red/Yellow text
// ═══════════════════════════════════════════════════════════════
function Logo() {
  return (
    <div style={{display:"flex",alignItems:"center",gap:10}}>
      {/* Icon: Solid Yellow background, Red "C" letter */}
      <div style={{
        width:38, height:38, borderRadius:10, flexShrink:0,
        background:YELLOW,
        display:"flex", alignItems:"center", justifyContent:"center",
        fontFamily:"'Syne',sans-serif", fontSize:22, fontWeight:800, color:WHITE,
        animation:"logo-pulse 2.4s ease infinite",
      }}>C</div>
      {/* Text: both lines in Yellow */}
      <div>
        <div style={{fontFamily:"'Syne',sans-serif",fontSize:13,fontWeight:800,
                     letterSpacing:0.4,lineHeight:1.2,color:YELLOW}}>CRYPTOSITE</div>
        <div style={{fontFamily:"'Syne',sans-serif",fontSize:10,fontWeight:700,
                     letterSpacing:2,color:YELLOW}}>.AI</div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// TICKER BAR
// ═══════════════════════════════════════════════════════════════
function TickerBar({T}) {
  return (
    <div style={{overflow:"hidden",borderBottom:`1px solid ${T.border}`,padding:"7px 0",background:T.bg}}>
      <div className="ticker-track">
        {[...COINS,...COINS].map((c,i) => (
          <span key={i} style={{display:"inline-flex",alignItems:"center",gap:8,padding:"0 24px",fontSize:12}}>
            <span className="mono" style={{fontWeight:700,color:T.text}}>{c.ticker}</span>
            <span className="mono" style={{color:T.text}}>{fmtP(c.price)}</span>
            <Chg v={c.change_24h}/>
            <span style={{color:T.dim}}>·</span>
          </span>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// SIDEBAR
// ═══════════════════════════════════════════════════════════════
function Sidebar({page, setPage, T, coins}) {
  const nav = [
    {id:"dashboard", icon:"⊞", label:"Dashboard"},
    {id:"buy",       icon:"▲", label:"BUY List"},
    {id:"sell",      icon:"▼", label:"SELL List"},
    {id:"hold",      icon:"◉", label:"HOLD List"},
    {id:"news",      icon:"◈", label:"News & Research"},
    {id:"watchlist", icon:"☆", label:"Watchlist"},
  ];
  const buys  = coins.filter(c=>c.action==="BUY").length;
  const sells = coins.filter(c=>c.action==="SELL").length;

  return (
    <div className="sidebar" style={{
      position:"fixed",left:0,top:0,bottom:0,width:220,
      background:T.sidebar, borderRight:`1px solid ${T.border}`,
      display:"flex", flexDirection:"column", zIndex:100,
      padding:"16px 10px", transition:"background 0.3s ease",
    }}>
      {/* Logo */}
      <div style={{padding:"6px 10px 20px", borderBottom:`1px solid ${T.border}`}}>
        <Logo/>
      </div>

      {/* Nav links */}
      <nav style={{flex:1, paddingTop:12, display:"flex", flexDirection:"column", gap:2}}>
        {nav.map(n => (
          <div key={n.id} className={`nav-item ${page===n.id?"active":""}`}
               onClick={()=>setPage(n.id)}>
            <span style={{fontSize:14,width:18,textAlign:"center",flexShrink:0}}>{n.icon}</span>
            <span>{n.label}</span>
            {/* badge count — only green/red */}
            {n.id==="buy"  && <span style={{marginLeft:"auto",fontSize:10,fontWeight:700,
              background:`${T.buy}18`,color:T.buy,padding:"1px 6px",borderRadius:4}}>{buys}</span>}
            {n.id==="sell" && <span style={{marginLeft:"auto",fontSize:10,fontWeight:700,
              background:`${T.sell}18`,color:T.sell,padding:"1px 6px",borderRadius:4}}>{sells}</span>}
          </div>
        ))}
      </nav>

      {/* Disclaimer — yellow only */}
      <div style={{padding:"10px 12px",border:`1px solid ${T.hold}44`,borderRadius:8,marginTop:"auto"}}>
        <div style={{fontSize:10,color:T.hold,fontWeight:700,marginBottom:3,letterSpacing:0.5}}>
          ⚠ DISCLAIMER
        </div>
        <div style={{fontSize:10,color:T.muted,lineHeight:1.5}}>
          AI analysis only. Not financial advice. Always DYOR.
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// HEADER
// ═══════════════════════════════════════════════════════════════
function Header({setPage, T, dark, setDark, status, source, lastSync, onRefresh}) {
  const [q, setQ] = useState("");
  const syncLabel = status==="loading" ? "Fetching…"
                  : status==="error"   ? "Offline"
                  : lastSync ? `${Math.floor((Date.now()-lastSync)/1000)}s ago` : "Live";
  const syncColor = status==="error" ? T.sell : T.buy;
  return (
    <div className="top-bar" style={{
      position:"sticky", top:0, zIndex:50,
      background:T.header, borderBottom:`1px solid ${T.border}`,
      display:"flex", alignItems:"center", justifyContent:"space-between",
      padding:"0 24px", height:56, transition:"background 0.3s ease",
    }}>
      {/* Left */}
      <div style={{display:"flex",alignItems:"center",gap:10}}>
        <span className="live-dot"/>
        <span style={{fontSize:11,color:T.muted,fontWeight:700,letterSpacing:0.5}}>
          {status==="live" ? "LIVE" : status==="loading" ? "LOADING" : "OFFLINE"}
        </span>
        <span style={{color:T.dim}}>|</span>
        <span style={{fontSize:11,color:T.muted}}>
          {status==="live" ? source : status==="loading" ? "Connecting…" : "Reconnecting…"}
        </span>
      </div>

      {/* Center — search */}
      <div style={{position:"relative"}}>
        <span style={{position:"absolute",left:10,top:"50%",transform:"translateY(-50%)",
                      fontSize:13,color:T.muted}}>⌕</span>
        <input className="search-inp" placeholder="Search coins…"
               value={q} onChange={e=>setQ(e.target.value)}/>
      </div>

      {/* Right */}
      <div style={{display:"flex",alignItems:"center",gap:9}}>
        <span style={{fontSize:11,color:T.muted}}>
          Sync: <span className="mono" style={{color:syncColor}}>{syncLabel}</span>
        </span>
        {/* Manual refresh */}
        <button onClick={onRefresh} title="Refresh prices"
          style={{background:"none",border:`1px solid ${T.border}`,borderRadius:7,
                  color:T.muted,padding:"6px 10px",cursor:"pointer",fontSize:13,
                  transition:"all .18s"}}
          onMouseEnter={e=>e.target.style.borderColor=RED}
          onMouseLeave={e=>e.target.style.borderColor=T.border}>
          ↻
        </button>
        <button className="toggle-btn" onClick={()=>setDark(d=>!d)}>
          <span style={{fontSize:14}}>{dark?"☀":"🌙"}</span>
          {dark?"Light Mode":"Dark Mode"}
        </button>
        <button className="btn-red" onClick={()=>setPage("watchlist")}>+ Watchlist</button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// STATS ROW
// ═══════════════════════════════════════════════════════════════
function StatsRow({coins, T}) {
  const buys  = COINS.filter(c=>c.action==="BUY").length;
  const sells = COINS.filter(c=>c.action==="SELL").length;
  const holds = COINS.filter(c=>c.action==="HOLD").length;
  const avg   = Math.round(COINS.reduce((a,b)=>a+b.confidence,0)/COINS.length);
  const stats = [
    {label:"Total Signals",  val:COINS.length, sub:"coins tracked",   color:T.text},
    {label:"BUY Signals",    val:buys,          sub:"opportunities",   color:T.buy },
    {label:"SELL Signals",   val:sells,         sub:"avoid / exit",    color:T.sell},
    {label:"HOLD Signals",   val:holds,         sub:"wait & watch",    color:T.hold},
    {label:"Avg Confidence", val:`${avg}%`,     sub:"AI accuracy",     color:RED   },
  ];
  return (
    <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:11,marginBottom:20}}>
      {stats.map((s,i) => (
        <div key={i} className="card anim-slide" style={{padding:"15px 16px",animationDelay:`${i*0.05}s`}}>
          <div style={{fontSize:10,color:T.muted,fontWeight:700,letterSpacing:0.7,marginBottom:7}}>
            {s.label.toUpperCase()}
          </div>
          <div className="mono" style={{fontSize:26,fontWeight:800,color:s.color,lineHeight:1}}>{s.val}</div>
          <div style={{fontSize:11,color:T.muted,marginTop:5}}>{s.sub}</div>
        </div>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// COIN TABLE ROW
// ═══════════════════════════════════════════════════════════════
function CoinRow({coin, onClick, idx, T, flashRef}) {
  const ac        = sigColor(coin.action, T);
  const flash     = flashRef?.current?.[coin.id];
  const flashClass = flash === "up" ? "row-flash-up" : flash === "down" ? "row-flash-dn" : "";
  const priceColor = flash === "up" ? GREEN : flash === "down" ? RED : T.text;
  return (
    <div className={`coin-row anim-slide ${flashClass}`} style={{animationDelay:`${idx*0.03}s`}} onClick={onClick}>
      {/* icon */}
      <div style={{display:"flex",justifyContent:"center"}}>
        <div style={{width:32,height:32,borderRadius:8,
                     background:`${RED}10`, border:`1px solid ${RED}30`,
                     display:"flex",alignItems:"center",justifyContent:"center",
                     fontSize:14,color:RED,fontWeight:800}}>
          {coin.logo}
        </div>
      </div>
      {/* name */}
      <div>
        <div style={{fontWeight:700,fontSize:13,color:T.text}}>{coin.name}</div>
        <div className="mono" style={{fontSize:11,color:T.muted}}>{coin.ticker}</div>
      </div>
      {/* price — color flashes green/red on change */}
      <div>
        <div className="mono" style={{fontWeight:600,fontSize:13,color:priceColor,transition:"color 0.3s"}}>{fmtP(coin.price)}</div>
        <Chg v={coin.change_24h}/>
      </div>
      {/* 7d */}
      <div className="hide-md"><Chg v={coin.change_7d}/></div>
      {/* mktcap */}
      <div className="hide-md">
        <span className="mono" style={{fontSize:11,color:T.muted}}>{fmtM(coin.market_cap)}</span>
      </div>
      {/* sentiment */}
      <div className="hide-md">
        <span style={{fontSize:11,fontWeight:600,
          color:coin.sentiment==="Bullish"?T.buy:coin.sentiment==="Bearish"?T.sell:T.hold}}>
          {coin.sentiment==="Bullish"?"▲":coin.sentiment==="Bearish"?"▼":"◉"} {coin.sentiment}
        </span>
      </div>
      {/* sparkline */}
      <div className="hide-md"><Spark positive={coin.change_7d>=0} T={T}/></div>
      {/* ring */}
      <div className="hide-md"><Ring score={coin.confidence} size={44} color={ac} T={T}/></div>
      {/* badge */}
      <div><SigBadge action={coin.action}/></div>
      {/* updated */}
      <div className="hide-md">
        <span style={{fontSize:11,color:T.dim}}>{timeAgo(coin.last_updated)}ago</span>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// COIN TABLE
// ═══════════════════════════════════════════════════════════════
function CoinTable({coins, onCoin, T, flashRef}) {
  const hdrs = ["","Coin","Price","7D","Mkt Cap","Sentiment","Trend","Conf","Signal","Updated"];
  return (
    <div className="card" style={{overflow:"hidden"}}>
      <div style={{
        display:"grid",
        gridTemplateColumns:"40px 150px 110px 72px 80px 80px 88px 92px 92px 64px",
        padding:"9px 16px", borderBottom:`1px solid ${T.border}`, gap:6,
      }}>
        {hdrs.map((h,i) => (
          <div key={i} className={`mono ${i>=3?"hide-md":""} ${i>=7?"hide-sm":""}`}
               style={{fontSize:9,color:T.muted,fontWeight:700,letterSpacing:0.7}}>
            {h.toUpperCase()}
          </div>
        ))}
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:1,padding:"5px"}}>
        {coins.map((c,i) => <CoinRow key={c.id} coin={c} idx={i} onClick={()=>onCoin(c)} T={T} flashRef={flashRef}/>)}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// DASHBOARD PAGE
// ═══════════════════════════════════════════════════════════════
function Dashboard({coins, onCoin, T, flashRef}) {
  const [tab, setTab] = useState("all");
  const filtered = tab==="all" ? coins : coins.filter(c=>c.action===tab.toUpperCase());
  return (
    <div>
      <StatsRow coins={coins} T={T}/>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",
                   marginBottom:13,flexWrap:"wrap",gap:9}}>
        <h2 style={{fontSize:16,fontWeight:800,color:T.text}}>Market Signals</h2>
        <div style={{display:"flex",gap:5}}>
          {["all","buy","sell","hold"].map(t => (
            <button key={t} className={`tab-btn ${tab===t?"active":""}`} onClick={()=>setTab(t)}>
              {t.toUpperCase()}
            </button>
          ))}
        </div>
      </div>
      <CoinTable coins={filtered} onCoin={onCoin} T={T} flashRef={flashRef}/>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// COIN DETAIL PAGE
// ═══════════════════════════════════════════════════════════════
function CoinDetail({coin, onBack, T}) {
  if(!coin) return null;
  const ac = sigColor(coin.action, T);
  const sc = coin.sentiment==="Bullish"?T.buy:coin.sentiment==="Bearish"?T.sell:T.hold;

  return (
    <div className="anim-fade">
      <button onClick={onBack} style={{
        background:"none", border:`1px solid ${T.border}`, borderRadius:7,
        color:T.muted, padding:"7px 13px", cursor:"pointer",
        fontFamily:"'Syne',sans-serif", fontSize:12, marginBottom:16,
      }}>← Back</button>

      {/* Hero card */}
      <div className="card" style={{padding:24,marginBottom:14}}>
        <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",
                     flexWrap:"wrap",gap:12}}>
          <div style={{display:"flex",alignItems:"center",gap:14}}>
            <div style={{width:54,height:54,borderRadius:12,
                         background:`${RED}12`, border:`2px solid ${RED}30`,
                         display:"flex",alignItems:"center",justifyContent:"center",
                         fontSize:26,color:RED,fontWeight:800}}>
              {coin.logo}
            </div>
            <div>
              <div style={{fontSize:20,fontWeight:800,color:T.text}}>{coin.name}</div>
              <div className="mono" style={{fontSize:12,color:T.muted}}>{coin.ticker} / USD</div>
            </div>
          </div>
          <div style={{textAlign:"right"}}>
            <div className="mono" style={{fontSize:30,fontWeight:800,color:T.text}}>{fmtP(coin.price)}</div>
            <Chg v={coin.change_24h}/>
            <span className="mono" style={{fontSize:10,color:T.muted,marginLeft:6}}>24h</span>
          </div>
        </div>

        {/* Recommendation banner */}
        <div style={{
          marginTop:20, padding:"14px 20px",
          background:`${ac}0D`, border:`1px solid ${ac}30`, borderRadius:10,
          display:"flex", alignItems:"center", gap:16, flexWrap:"wrap",
        }}>
          <div>
            <div style={{fontSize:9,color:T.muted,fontWeight:700,letterSpacing:0.7,marginBottom:5}}>
              AI RECOMMENDATION
            </div>
            <SigBadge action={coin.action} large/>
          </div>
          <div style={{flex:1,minWidth:160}}>
            <div style={{fontSize:9,color:T.muted,fontWeight:700,letterSpacing:0.7,marginBottom:5}}>
              CONFIDENCE {coin.confidence}%
            </div>
            <ConfBar value={coin.confidence} color={ac}/>
          </div>
          <div>
            <div style={{fontSize:9,color:T.muted,fontWeight:700,letterSpacing:0.7}}>OUTLOOK</div>
            <div style={{marginTop:4,fontSize:14,fontWeight:700,color:sc}}>
              {coin.sentiment==="Bullish"?"▲":coin.sentiment==="Bearish"?"▼":"◉"} {coin.sentiment}
            </div>
          </div>
          <div>
            <div style={{fontSize:9,color:T.muted,fontWeight:700,letterSpacing:0.7}}>RISK</div>
            <div style={{marginTop:4}}><RiskLabel r={coin.risk}/></div>
          </div>
          <div style={{fontSize:11,color:T.muted}}>
            Updated <span className="mono" style={{color:RED}}>{timeAgo(coin.last_updated)}ago</span>
          </div>
        </div>
      </div>

      {/* Grid row 1 */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12,marginBottom:12}}>
        <div className="card" style={{padding:16}}>
          <div style={{fontSize:9,color:T.muted,fontWeight:700,letterSpacing:0.7,marginBottom:11}}>PERFORMANCE</div>
          {[["24H",coin.change_24h],["7D",coin.change_7d],["30D",coin.change_30d]].map(([k,v])=>(
            <div key={k} style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
              <span style={{fontSize:12,color:T.muted}}>{k}</span><Chg v={v}/>
            </div>
          ))}
        </div>
        <div className="card" style={{padding:16}}>
          <div style={{fontSize:9,color:T.muted,fontWeight:700,letterSpacing:0.7,marginBottom:11}}>MARKET DATA</div>
          {[["Mkt Cap",fmtM(coin.market_cap)],["24H Vol",fmtM(coin.volume)],["Trend",coin.trend]].map(([k,v])=>(
            <div key={k} style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
              <span style={{fontSize:12,color:T.muted}}>{k}</span>
              <span className="mono" style={{fontSize:12,color:T.text}}>{v}</span>
            </div>
          ))}
        </div>
        <div className="card" style={{padding:16}}>
          <div style={{fontSize:9,color:T.muted,fontWeight:700,letterSpacing:0.7,marginBottom:11}}>SENTIMENT</div>
          <SentBar bull={coin.bullish_score} bear={coin.bearish_score} T={T}/>
          <div style={{marginTop:14,display:"flex",justifyContent:"center"}}>
            <Ring score={coin.confidence} size={56} color={ac} T={T}/>
          </div>
        </div>
      </div>

      {/* Grid row 2 */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:12}}>
        <div className="card" style={{padding:16}}>
          <div style={{fontSize:9,color:T.muted,fontWeight:700,letterSpacing:0.7,marginBottom:11}}>TECHNICAL INDICATORS</div>
          {[
            ["RSI (14)",   coin.rsi,             coin.rsi>70?T.sell:coin.rsi<30?T.buy:T.hold],
            ["MACD",       coin.macd,            coin.macd.includes("Bullish")?T.buy:coin.macd.includes("Bearish")?T.sell:T.hold],
            ["50-day MA",  fmtP(coin.ma_50),     T.text],
            ["200-day MA", fmtP(coin.ma_200),    T.text],
            ["Support",    fmtP(coin.support),   T.buy],
            ["Resistance", fmtP(coin.resistance),T.sell],
          ].map(([lbl,val,col])=>(
            <div key={lbl} className="ind-row">
              <span style={{fontSize:12,color:T.muted}}>{lbl}</span>
              <span className="mono" style={{fontSize:12,color:col,fontWeight:600}}>{val}</span>
            </div>
          ))}
        </div>
        <div className="card" style={{padding:16}}>
          <div style={{fontSize:9,color:T.muted,fontWeight:700,letterSpacing:0.7,marginBottom:11}}>AI SUMMARY</div>
          <p style={{fontSize:12,color:T.muted,lineHeight:1.7,marginBottom:13}}>{coin.summary}</p>
          <div style={{fontSize:9,color:T.muted,fontWeight:700,letterSpacing:0.7,marginBottom:8}}>CATALYSTS</div>
          {coin.catalysts.map((cat,i)=>(
            <div key={i} style={{display:"flex",alignItems:"center",gap:7,marginBottom:6}}>
              <span style={{color:ac,fontSize:9}}>●</span>
              <span style={{fontSize:12,color:T.text}}>{cat}</span>
            </div>
          ))}
        </div>
      </div>

      {/* News sentiment */}
      <div className="card" style={{padding:16}}>
        <div style={{fontSize:9,color:T.muted,fontWeight:700,letterSpacing:0.7,marginBottom:12}}>NEWS SENTIMENT</div>
        <div style={{display:"flex",alignItems:"center",gap:16}}>
          <Ring
            score={Math.round(coin.news_sentiment*100)} size={62}
            color={coin.news_sentiment>0.6?T.buy:coin.news_sentiment<0.4?T.sell:T.hold}
            T={T}/>
          <div style={{flex:1}}>
            <div style={{fontSize:13,fontWeight:700,color:T.text,marginBottom:5}}>
              {coin.news_sentiment>0.6?"Positive":coin.news_sentiment<0.4?"Negative":"Mixed"} News Flow
            </div>
            <div style={{fontSize:12,color:T.muted,lineHeight:1.6}}>
              {NEWS.filter(n=>n.coin===coin.ticker).map(n=>n.title).join(" · ")||"No recent news found."}
            </div>
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      <div style={{marginTop:12,padding:"10px 13px",
                   background:`${T.hold}0E`,border:`1px solid ${T.hold}30`,borderRadius:8}}>
        <span style={{fontSize:11,color:T.hold,fontWeight:700}}>⚠ DISCLAIMER: </span>
        <span style={{fontSize:11,color:T.muted}}>
          AI-generated analysis for educational purposes only. Not financial advice.
          Crypto investments carry high risk. Always DYOR.
        </span>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// SIGNAL LIST (BUY / SELL / HOLD)
// ═══════════════════════════════════════════════════════════════
function SignalList({action, coins, onCoin, T}) {
  const ac = sigColor(action, T);
  const filtered = coins.filter(c=>c.action===action);
  const desc = {
    BUY:  "Coins with aligned bullish technicals, positive sentiment, and upward momentum.",
    SELL: "Coins with bearish breakdowns, negative sentiment, or deteriorating fundamentals.",
    HOLD: "Mixed signals — wait for clearer directional confirmation before entering.",
  };
  return (
    <div className="anim-fade">
      <div style={{marginBottom:20}}>
        <div style={{display:"flex",alignItems:"center",gap:11,marginBottom:5}}>
          <SigBadge action={action} large/>
          <span style={{fontSize:19,fontWeight:800,color:T.text}}>{action} Signals</span>
          <span className="mono" style={{fontSize:13,color:ac}}>({filtered.length})</span>
        </div>
        <p style={{fontSize:13,color:T.muted}}>{desc[action]}</p>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(285px,1fr))",gap:12}}>
        {filtered.map((coin,i) => (
          <div key={coin.id} className="card anim-slide"
               style={{padding:16,cursor:"pointer",animationDelay:`${i*0.06}s`}}
               onClick={()=>onCoin(coin)}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:13}}>
              <div style={{display:"flex",alignItems:"center",gap:9}}>
                <div style={{width:36,height:36,borderRadius:8,
                             background:`${RED}10`,border:`1px solid ${RED}30`,
                             display:"flex",alignItems:"center",justifyContent:"center",
                             fontSize:16,color:RED,fontWeight:800}}>
                  {coin.logo}
                </div>
                <div>
                  <div style={{fontWeight:700,fontSize:13,color:T.text}}>{coin.name}</div>
                  <div className="mono" style={{fontSize:11,color:T.muted}}>{coin.ticker}</div>
                </div>
              </div>
              <Ring score={coin.confidence} size={44} color={ac} T={T}/>
            </div>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:10}}>
              <span className="mono" style={{fontSize:14,fontWeight:700,color:T.text}}>{fmtP(coin.price)}</span>
              <Chg v={coin.change_24h}/>
            </div>
            <SentBar bull={coin.bullish_score} bear={coin.bearish_score} T={T}/>
            <p style={{fontSize:11,color:T.muted,marginTop:9,lineHeight:1.6}}>
              {coin.summary.slice(0,90)}…
            </p>
            <div style={{marginTop:9,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <RiskLabel r={coin.risk}/>
              <span style={{fontSize:11,color:T.dim}}>{timeAgo(coin.last_updated)}ago</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// NEWS PAGE
// ═══════════════════════════════════════════════════════════════
function NewsPage({T}) {
  const pos = NEWS.filter(n=>n.sentiment==="positive").length;
  const neg = NEWS.filter(n=>n.sentiment==="negative").length;
  const neu = NEWS.filter(n=>n.sentiment==="neutral").length;
  return (
    <div className="anim-fade">
      <div style={{marginBottom:20}}>
        <h2 style={{fontSize:19,fontWeight:800,color:T.text,marginBottom:4}}>News & Research</h2>
        <p style={{fontSize:13,color:T.muted}}>AI-analyzed headlines. Sentiment scored in real time.</p>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(320px,1fr))",gap:10}}>
        {NEWS.map((n,i) => (
          <div key={n.id}
               className={`news-card ${n.sentiment==="positive"?"news-pos":n.sentiment==="negative"?"news-neg":"news-neu"} anim-slide`}
               style={{animationDelay:`${i*0.04}s`}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
              <span style={{fontSize:9,color:T.muted,fontWeight:700,letterSpacing:0.7}}>
                {n.source.toUpperCase()}
              </span>
              <span style={{fontSize:9,color:T.muted}}>{n.time}</span>
            </div>
            <div style={{fontSize:13,fontWeight:600,lineHeight:1.5,color:T.text,marginBottom:8}}>
              {n.title}
            </div>
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              {n.coin && (
                <span className="mono" style={{fontSize:10,background:`${T.sell}12`,
                  color:T.sell,padding:"2px 6px",borderRadius:4}}>
                  {n.coin}
                </span>
              )}
              <span style={{fontSize:10,fontWeight:700,
                color:n.sentiment==="positive"?T.buy:n.sentiment==="negative"?T.sell:T.hold}}>
                {n.sentiment==="positive"?"▲ BULLISH":n.sentiment==="negative"?"▼ BEARISH":"◉ NEUTRAL"}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="card" style={{padding:20,marginTop:20}}>
        <div style={{fontSize:13,fontWeight:700,color:T.text,marginBottom:13}}>AI Research Summary</div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:11}}>
          {[
            {label:"Positive",count:pos,color:T.buy },
            {label:"Negative",count:neg,color:T.sell},
            {label:"Neutral", count:neu,color:T.hold},
          ].map((s,i) => (
            <div key={i} style={{padding:"12px 14px",
                                  background:`${s.color}0E`,border:`1px solid ${s.color}28`,borderRadius:8}}>
              <div className="mono" style={{fontSize:24,fontWeight:800,color:s.color}}>{s.count}</div>
              <div style={{fontSize:11,color:T.muted,marginTop:3}}>{s.label} Headlines</div>
            </div>
          ))}
        </div>
        <p style={{fontSize:12,color:T.muted,marginTop:13,lineHeight:1.7}}>
          Overall sentiment is <strong style={{color:T.sell}}>cautious</strong>. Fear &amp; Greed at Extreme Fear (18).
          Watch Bitcoin's $65K support. Polkadot and Cardano carry the most downside risk.
        </p>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// WATCHLIST PAGE
// ═══════════════════════════════════════════════════════════════
function WatchlistPage({coins, onCoin, T}) {
  const [watching, setW] = useState(["bitcoin","ethereum","solana"]);
  const toggle = id => setW(w => w.includes(id) ? w.filter(x=>x!==id) : [...w,id]);

  return (
    <div className="anim-fade">
      <div style={{marginBottom:20}}>
        <h2 style={{fontSize:19,fontWeight:800,color:T.text,marginBottom:4}}>Watchlist</h2>
        <p style={{fontSize:13,color:T.muted}}>Track your coins. Get AI signal alerts.</p>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:13}}>
        {/* Watching */}
        <div className="card" style={{padding:17}}>
          <div style={{fontSize:9,color:T.muted,fontWeight:700,letterSpacing:0.7,marginBottom:13}}>
            WATCHING
          </div>
          {COINS.filter(c=>watching.includes(c.id)).map(coin => (
            <div key={coin.id}
                 style={{display:"flex",alignItems:"center",gap:9,padding:"9px 0",
                         borderBottom:`1px solid ${T.border}`,cursor:"pointer"}}
                 onClick={()=>onCoin(coin)}>
              <div style={{width:30,height:30,borderRadius:7,
                           background:`${RED}10`,border:`1px solid ${RED}30`,
                           display:"flex",alignItems:"center",justifyContent:"center",
                           fontSize:13,color:RED,fontWeight:800}}>
                {coin.logo}
              </div>
              <div style={{flex:1}}>
                <div style={{fontWeight:700,fontSize:12,color:T.text}}>{coin.name}</div>
                <div className="mono" style={{fontSize:10,color:T.muted}}>{fmtP(coin.price)}</div>
              </div>
              <SigBadge action={coin.action}/>
              <button onClick={e=>{e.stopPropagation();toggle(coin.id);}}
                style={{background:"none",border:`1px solid ${T.border}`,borderRadius:5,
                        color:T.sell,padding:"3px 6px",cursor:"pointer",fontSize:11}}>
                ✕
              </button>
            </div>
          ))}
        </div>

        {/* Add coins */}
        <div className="card" style={{padding:17}}>
          <div style={{fontSize:9,color:T.muted,fontWeight:700,letterSpacing:0.7,marginBottom:13}}>
            ADD COIN
          </div>
          {COINS.filter(c=>!watching.includes(c.id)).map(coin => (
            <div key={coin.id}
                 style={{display:"flex",alignItems:"center",gap:9,padding:"9px 0",
                         borderBottom:`1px solid ${T.border}`}}>
              <div style={{width:30,height:30,borderRadius:7,
                           background:`${RED}10`,border:`1px solid ${RED}30`,
                           display:"flex",alignItems:"center",justifyContent:"center",
                           fontSize:13,color:RED,fontWeight:800}}>
                {coin.logo}
              </div>
              <div style={{flex:1}}>
                <div style={{fontWeight:700,fontSize:12,color:T.text}}>{coin.name}</div>
                <div className="mono" style={{fontSize:10,color:T.muted}}>{fmtP(coin.price)}</div>
              </div>
              <button onClick={()=>toggle(coin.id)}
                style={{background:`${RED}0E`,border:`1px solid ${RED}38`,borderRadius:6,
                        color:RED,padding:"4px 9px",cursor:"pointer",fontSize:11,
                        fontFamily:"'Syne',sans-serif",fontWeight:700}}>
                + Watch
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// LIVE PRICE HOOK — TRUE 1-SECOND UPDATES
//
// Primary:  Binance @miniTicker stream (pushes every 1000ms guaranteed)
// Fallback: CoinCap WebSocket (every trade)
// Last:     CoinGecko REST via proxy (every 5s poll)
//
// No API key needed for any of these.
// ═══════════════════════════════════════════════════════════════

// Binance !miniTicker@arr — single stream, ALL symbols, pushes every 1 second
// We filter to just our 8 coins client-side
const BINANCE_WS_URL = "wss://stream.binance.com:9443/ws/!miniTicker@arr";

const BINANCE_MAP = {
  BTCUSDT:  "bitcoin",
  ETHUSDT:  "ethereum",
  SOLUSDT:  "solana",
  XRPUSDT:  "xrp",
  ADAUSDT:  "cardano",
  DOGEUSDT: "dogecoin",
  LINKUSDT: "chainlink",
  DOTUSDT:  "polkadot",
};

// CoinCap WebSocket — fires on every trade
const COINCAP_WS_URL = `wss://ws.coincap.io/prices?assets=${COINS.map(c=>c.id).join(",")}`;

// CoinGecko REST last resort
const GECKO_IDS   = COINS.map(c=>c.id).join(",");
const GECKO_URL   = `https://api.coingecko.com/api/v3/simple/price?ids=${GECKO_IDS}&vs_currencies=usd&include_24hr_change=true&include_market_cap=true&include_24hr_vol=true`;
const GECKO_PROXY = `https://api.allorigins.win/get?url=${encodeURIComponent(GECKO_URL)}`;

function useLivePrices() {
  const [coins,    setCoins]    = useState(COINS);
  const [status,   setStatus]   = useState("loading");
  const [source,   setSource]   = useState("—");
  const [lastSync, setLastSync] = useState(null);

  const wsRef       = useRef(null);
  const reconnRef   = useRef(null);
  const retriesRef  = useRef(0);
  const prevRef     = useRef({});      // { coinId: price } — for flash direction
  const flashRef    = useRef({});      // { coinId: "up"|"down" } — current flash state
  const geckoTimer  = useRef(null);

  // ── Apply price patches & track flash direction ─────────────────
  const mergePatch = useCallback((patches) => {
    // Record prev prices and set flash direction
    Object.entries(patches).forEach(([id, p]) => {
      const prev = prevRef.current[id];
      const next = p.price;
      if (prev != null && next != null && next !== prev) {
        flashRef.current[id] = next > prev ? "up" : "down";
        // Clear flash after 800ms
        setTimeout(() => { delete flashRef.current[id]; }, 800);
      }
      if (next != null) prevRef.current[id] = next;
    });

    setCoins(prev => prev.map(c => {
      const p = patches[c.id];
      if (!p) return c;
      return { ...c, ...p, last_updated: Date.now() };
    }));
    setLastSync(new Date());
  }, []);

  // ── 1. Binance !miniTicker@arr — guaranteed 1s push ─────────────
  const connectBinance = useCallback(() => {
    clearTimeout(reconnRef.current);
    if (wsRef.current) { wsRef.current.onclose = null; wsRef.current.close(); }

    setStatus("loading");
    setSource("Binance WS");

    const ws = new WebSocket(BINANCE_WS_URL);
    wsRef.current = ws;

    ws.onopen = () => {
      retriesRef.current = 0;
      setStatus("live");
      setSource("Binance WS");
    };

    ws.onmessage = (evt) => {
      try {
        // !miniTicker@arr sends array of ALL symbols every 1 second
        const arr = JSON.parse(evt.data);
        if (!Array.isArray(arr)) return;
        const patches = {};
        arr.forEach(t => {
          const id = BINANCE_MAP[t.s];
          if (!id) return;
          patches[id] = {
            price:      parseFloat(t.c),   // c = close/last price
            change_24h: parseFloat(t.P),   // P = price change percent
            volume:     parseFloat(t.q),   // q = total traded quote asset volume
            high:       parseFloat(t.h),   // h = high price
            low:        parseFloat(t.l),   // l = low price
          };
        });
        if (Object.keys(patches).length) mergePatch(patches);
      } catch { /* ignore bad frames */ }
    };

    ws.onerror = () => { setStatus("error"); };

    ws.onclose = () => {
      retriesRef.current++;
      setStatus("error");
      if (retriesRef.current <= 3) {
        // Retry Binance with backoff
        reconnRef.current = setTimeout(connectBinance, retriesRef.current * 2000);
      } else {
        // Binance failing — try CoinCap
        connectCoinCap();
      }
    };
  }, [mergePatch]);

  // ── 2. CoinCap WebSocket fallback ───────────────────────────────
  const connectCoinCap = useCallback(() => {
    clearTimeout(reconnRef.current);
    if (wsRef.current) { wsRef.current.onclose = null; wsRef.current.close(); }

    setStatus("loading");
    setSource("CoinCap WS");

    const ws = new WebSocket(COINCAP_WS_URL);
    wsRef.current = ws;
    let ccRetries = 0;

    ws.onopen = () => {
      retriesRef.current = 0;
      setStatus("live");
      setSource("CoinCap WS");
    };

    ws.onmessage = (evt) => {
      try {
        // { bitcoin: "70421.12", ethereum: "2077.45", ... }
        const data = JSON.parse(evt.data);
        const patches = {};
        Object.entries(data).forEach(([id, priceStr]) => {
          const price = parseFloat(priceStr);
          if (!isNaN(price)) patches[id] = { price };
        });
        if (Object.keys(patches).length) mergePatch(patches);
      } catch { /* ignore */ }
    };

    ws.onerror = () => { setStatus("error"); };

    ws.onclose = () => {
      ccRetries++;
      setStatus("error");
      if (ccRetries <= 3) {
        reconnRef.current = setTimeout(connectCoinCap, ccRetries * 2000);
      } else {
        // Both WS dead — fall back to REST polling
        startGeckoPolling();
      }
    };
  }, [mergePatch]);

  // ── 3. CoinGecko REST — 5s polling last resort ──────────────────
  const startGeckoPolling = useCallback(() => {
    clearTimeout(geckoTimer.current);
    setSource("CoinGecko REST");

    const poll = async () => {
      try {
        let data = null;

        // Try direct first
        try {
          const r = await fetch(GECKO_URL, { cache:"no-store", signal: AbortSignal.timeout(4000) });
          if (r.ok) data = await r.json();
        } catch { /* fall through */ }

        // Proxy fallback
        if (!data) {
          const r = await fetch(GECKO_PROXY, { cache:"no-store", signal: AbortSignal.timeout(8000) });
          if (r.ok) {
            const w = await r.json();
            data = JSON.parse(w.contents);
          }
        }

        if (data && typeof data === "object") {
          const patches = {};
          Object.entries(data).forEach(([id, d]) => {
            patches[id] = {
              price:      d.usd,
              change_24h: d.usd_24h_change,
              volume:     d.usd_24h_vol,
              market_cap: d.usd_market_cap,
            };
          });
          mergePatch(patches);
          setStatus("live");
        }
      } catch { setStatus("error"); }

      geckoTimer.current = setTimeout(poll, 5000); // poll every 5s
    };

    poll();
  }, [mergePatch]);

  // ── Bootstrap ───────────────────────────────────────────────────
  useEffect(() => {
    connectBinance();
    return () => {
      clearTimeout(reconnRef.current);
      clearTimeout(geckoTimer.current);
      if (wsRef.current) { wsRef.current.onclose = null; wsRef.current.close(); }
    };
  }, [connectBinance]);

  // ── Manual refresh — reconnect from scratch ──────────────────────
  const refresh = useCallback(() => {
    retriesRef.current = 0;
    connectBinance();
  }, [connectBinance]);

  return { coins, status, source, lastSync, refresh, flashRef };
}

// ═══════════════════════════════════════════════════════════════
// AI CHATBOT  —  Floating chat bubble powered by Claude API
// Knows about all live coin data, signals, and prices
// Requires: VITE_ANTHROPIC_API_KEY in your .env file
// ═══════════════════════════════════════════════════════════════

function AIChatbot({ coins, T }) {
  const [open,     setOpen]     = useState(false);
  const [input,    setInput]    = useState("");
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Hi! I'm your CRYPTOSITE.AI assistant. Ask me anything about the market, coin signals, prices, or trading strategies! 🚀" }
  ]);
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
  const inputRef  = useRef(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  // Focus input when opened
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 100);
  }, [open]);

  // Build live market context to inject into every prompt
  const buildContext = () => {
    const lines = coins.map(c =>
      `${c.name} (${c.ticker}): Price $${c.price >= 1000
        ? c.price.toLocaleString("en-US", {minimumFractionDigits:2,maximumFractionDigits:2})
        : c.price >= 1 ? c.price.toFixed(3) : c.price.toFixed(5)
      }, 24h change ${c.change_24h >= 0 ? "+" : ""}${c.change_24h?.toFixed(2)}%, ` +
      `Signal: ${c.action}, Confidence: ${c.confidence}%, ` +
      `Sentiment: ${c.sentiment}, RSI: ${c.rsi}, Risk: ${c.risk}`
    ).join("\n");

    return `You are CRYPTOSITE.AI, an expert cryptocurrency analyst assistant embedded in a live crypto dashboard.

LIVE MARKET DATA (real-time):
${lines}

Market Context:
- Fear & Greed Index: 18 (Extreme Fear)
- Total Market Cap: ~$2.48T
- BUY signals: ${coins.filter(c=>c.action==="BUY").length}
- SELL signals: ${coins.filter(c=>c.action==="SELL").length}
- HOLD signals: ${coins.filter(c=>c.action==="HOLD").length}

You have access to live prices, technical indicators (RSI, MACD, moving averages), sentiment scores, and AI signals for each coin.
Answer concisely and helpfully. Always add a disclaimer that this is not financial advice.
Keep responses under 200 words unless the user asks for detail.`;
  };

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg = { role: "user", content: text };
    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setInput("");
    setLoading(true);

    try {
      const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY;
      if (!apiKey || apiKey === "your_anthropic_api_key_here") throw new Error("NO_KEY");

      // Build messages array for Claude API (skip system-like first assistant message)
      const apiMessages = newHistory
        .filter((_, i) => !(i === 0 && newHistory[0].role === "assistant"))
        .map(m => ({ role: m.role, content: m.content }));

      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type":      "application/json",
          "x-api-key":         apiKey,
          "anthropic-version": "2023-06-01",
          "anthropic-dangerous-direct-browser-access": "true",
        },
        body: JSON.stringify({
          model:      "claude-sonnet-4-20250514",
          max_tokens: 1024,
          system:     buildContext(),
          messages:   apiMessages,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error?.message || `HTTP ${res.status}`);
      }

      const data    = await res.json();
      const reply   = data.content?.[0]?.text || "Sorry, I couldn't get a response.";
      setMessages(prev => [...prev, { role: "assistant", content: reply }]);

    } catch (err) {
      let msg = "";
      if (!import.meta.env.VITE_ANTHROPIC_API_KEY || import.meta.env.VITE_ANTHROPIC_API_KEY === "your_anthropic_api_key_here") {
        msg = "⚠️ API key not set.\n\n1. Open the .env file\n2. Replace 'your_anthropic_api_key_here' with your key from console.anthropic.com\n3. Restart npm run dev";
      } else if (err.message?.includes("401")) {
        msg = "⚠️ Invalid API key — check VITE_ANTHROPIC_API_KEY in your .env file.";
      } else if (err.message?.includes("403")) {
        msg = "⚠️ API access denied. Make sure your Anthropic account has credits.";
      } else if (err.message?.includes("429")) {
        msg = "⚠️ Rate limit hit. Wait a moment and try again.";
      } else if (err.message?.includes("Failed to fetch") || err.message?.includes("NetworkError")) {
        msg = "⚠️ Network error. Check your internet connection.";
      } else {
        msg = `⚠️ Error: ${err.message || "Unknown error"}`;
      }
      setMessages(prev => [...prev, { role: "assistant", content: msg }]);
    } finally {
      setLoading(false);
    }
  };

  const onKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
  };

  // Quick prompt suggestions
  const suggestions = [
    "Which coin should I buy now?",
    "What's the BTC outlook?",
    "Explain the SELL signals",
    "What is RSI?",
  ];

  return (
    <>
      {/* ── Floating chat button ── */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          position:    "fixed",
          bottom:      28,
          right:       28,
          width:       54,
          height:      54,
          borderRadius:"50%",
          background:  RED,
          color:       WHITE,
          border:      "none",
          cursor:      "pointer",
          fontSize:    22,
          display:     "flex",
          alignItems:  "center",
          justifyContent:"center",
          boxShadow:   `0 4px 20px ${RED}55`,
          zIndex:      1000,
          transition:  "transform 0.2s ease, box-shadow 0.2s ease",
        }}
        onMouseEnter={e => { e.currentTarget.style.transform="scale(1.1)"; e.currentTarget.style.boxShadow=`0 6px 28px ${RED}77`; }}
        onMouseLeave={e => { e.currentTarget.style.transform="scale(1)";   e.currentTarget.style.boxShadow=`0 4px 20px ${RED}55`; }}
        title="Ask AI"
      >
        {open ? "✕" : "✦"}
      </button>

      {/* ── Chat window ── */}
      {open && (
        <div style={{
          position:    "fixed",
          bottom:      94,
          right:       28,
          width:       380,
          height:      520,
          background:  T.card,
          border:      `1px solid ${T.border}`,
          borderRadius:16,
          boxShadow:   "0 8px 40px rgba(0,0,0,0.18)",
          display:     "flex",
          flexDirection:"column",
          zIndex:      999,
          overflow:    "hidden",
        }}>

          {/* Header */}
          <div style={{
            padding:        "14px 16px",
            borderBottom:   `1px solid ${T.border}`,
            display:        "flex",
            alignItems:     "center",
            gap:            10,
            background:     T.card,
            flexShrink:     0,
          }}>
            <div style={{
              width:36, height:36, borderRadius:10,
              background: RED,
              display:"flex", alignItems:"center", justifyContent:"center",
              fontSize:16, color:WHITE, fontWeight:700, flexShrink:0,
            }}>✦</div>
            <div style={{flex:1}}>
              <div style={{fontSize:13, fontWeight:700, color:T.text}}>CRYPTOSITE AI</div>
              <div style={{fontSize:11, color:GREEN}}>● Online · Knows live prices</div>
            </div>
            <button onClick={() => setMessages([messages[0]])}
              style={{background:"none", border:`1px solid ${T.border}`, borderRadius:6,
                      color:T.muted, padding:"3px 8px", cursor:"pointer", fontSize:11}}>
              Clear
            </button>
          </div>

          {/* Messages */}
          <div style={{
            flex:     1,
            overflowY:"auto",
            padding:  "14px 14px 8px",
            display:  "flex",
            flexDirection:"column",
            gap:      10,
          }}>
            {messages.map((m, i) => (
              <div key={i} style={{
                display:   "flex",
                justifyContent: m.role === "user" ? "flex-end" : "flex-start",
              }}>
                <div style={{
                  maxWidth:    "82%",
                  padding:     "9px 13px",
                  borderRadius: m.role === "user" ? "12px 12px 2px 12px" : "12px 12px 12px 2px",
                  background:  m.role === "user" ? RED : T.bg,
                  color:       m.role === "user" ? WHITE : T.text,
                  fontSize:    13,
                  lineHeight:  1.55,
                  border:      m.role === "user" ? "none" : `1px solid ${T.border}`,
                  whiteSpace:  "pre-wrap",
                  wordBreak:   "break-word",
                }}>
                  {m.content}
                </div>
              </div>
            ))}

            {/* Loading dots */}
            {loading && (
              <div style={{display:"flex", justifyContent:"flex-start"}}>
                <div style={{
                  padding:"9px 14px", borderRadius:"12px 12px 12px 2px",
                  background:T.bg, border:`1px solid ${T.border}`,
                  display:"flex", gap:5, alignItems:"center",
                }}>
                  {[0,1,2].map(i => (
                    <div key={i} style={{
                      width:7, height:7, borderRadius:"50%", background:RED,
                      animation:`dot-bounce 1.2s ${i*0.2}s infinite ease-in-out`,
                    }}/>
                  ))}
                </div>
              </div>
            )}
            <div ref={bottomRef}/>
          </div>

          {/* Suggestions — only show when 1 message */}
          {messages.length === 1 && (
            <div style={{
              padding:   "0 12px 8px",
              display:   "flex",
              flexWrap:  "wrap",
              gap:       6,
              flexShrink:0,
            }}>
              {suggestions.map((s, i) => (
                <button key={i} onClick={() => { setInput(s); setTimeout(()=>inputRef.current?.focus(),50); }}
                  style={{
                    padding:    "5px 10px",
                    borderRadius:20,
                    border:     `1px solid ${T.border}`,
                    background: T.bg,
                    color:      T.muted,
                    fontSize:   11,
                    cursor:     "pointer",
                    transition: "all 0.15s",
                  }}
                  onMouseEnter={e=>{e.currentTarget.style.borderColor=RED;e.currentTarget.style.color=RED;}}
                  onMouseLeave={e=>{e.currentTarget.style.borderColor=T.border;e.currentTarget.style.color=T.muted;}}>
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div style={{
            padding:      "10px 12px",
            borderTop:    `1px solid ${T.border}`,
            display:      "flex",
            gap:          8,
            flexShrink:   0,
            background:   T.card,
          }}>
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={onKey}
              placeholder="Ask about any coin, signal or strategy…"
              rows={1}
              style={{
                flex:       1,
                resize:     "none",
                border:     `1px solid ${T.border}`,
                borderRadius:9,
                padding:    "9px 12px",
                fontSize:   13,
                fontFamily: "'Syne', sans-serif",
                color:      T.text,
                background: T.bg,
                outline:    "none",
                lineHeight: 1.4,
              }}
              onFocus={e  => e.target.style.borderColor = RED}
              onBlur={e   => e.target.style.borderColor = T.border}
            />
            <button
              onClick={send}
              disabled={!input.trim() || loading}
              style={{
                width:       40,
                height:      40,
                borderRadius:10,
                background:  (!input.trim() || loading) ? T.dim : RED,
                color:       WHITE,
                border:      "none",
                cursor:      (!input.trim() || loading) ? "not-allowed" : "pointer",
                fontSize:    18,
                display:     "flex",
                alignItems:  "center",
                justifyContent:"center",
                flexShrink:  0,
                transition:  "background 0.2s",
                alignSelf:   "flex-end",
              }}
            >
              ↑
            </button>
          </div>
        </div>
      )}

      {/* Bounce animation for loading dots */}
      <style>{`
        @keyframes dot-bounce {
          0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
          40%            { transform: scale(1.0); opacity: 1;   }
        }
      `}</style>
    </>
  );
}

// ═══════════════════════════════════════════════════════════════
// ROOT APP
// ═══════════════════════════════════════════════════════════════
export default function App() {
  const [page, setPage]   = useState("dashboard");
  const [coin, setCoin]   = useState(null);
  const [dark, setDark]   = useState(false);

  const { coins, status, source, lastSync, refresh, flashRef } = useLivePrices();
  const T = dark ? DK : LT;

  const goBack  = useCallback(()=>{ setCoin(null); setPage("dashboard"); },[]);
  const pickCoin= useCallback(c =>{ setCoin(c);    setPage("coin");       },[]);
  const navigate= useCallback(p =>{ setCoin(null); setPage(p);            },[]);

  const pickLive = useCallback(c => {
    const fresh = coins.find(x=>x.id===c.id) || c;
    setCoin(fresh); setPage("coin");
  }, [coins]);

  function CurrentPage() {
    if(page==="coin")      return <CoinDetail  coin={coin} onBack={goBack}    T={T}/>;
    if(page==="buy")       return <SignalList  action="BUY"  coins={coins} onCoin={pickLive} T={T}/>;
    if(page==="sell")      return <SignalList  action="SELL" coins={coins} onCoin={pickLive} T={T}/>;
    if(page==="hold")      return <SignalList  action="HOLD" coins={coins} onCoin={pickLive} T={T}/>;
    if(page==="news")      return <NewsPage    T={T}/>;
    if(page==="watchlist") return <WatchlistPage coins={coins} onCoin={pickLive} T={T}/>;
    return                        <Dashboard  coins={coins} onCoin={pickLive} T={T} flashRef={flashRef}/>;
  }

  return (
    <>
      <Styles T={T}/>
      <div style={{ minHeight:"100vh", background:T.bg, transition:"background 0.3s ease" }}>
        <Sidebar page={page} setPage={navigate} T={T} coins={coins}/>
        <div className="main-col" style={{ marginLeft:220, display:"flex", flexDirection:"column", minHeight:"100vh" }}>
          <TickerBar coins={coins} T={T}/>
          <Header setPage={navigate} T={T} dark={dark} setDark={setDark}
                  status={status} source={source} lastSync={lastSync} onRefresh={refresh}/>
          <main style={{ flex:1, padding:"24px" }}>
            <CurrentPage/>
          </main>
          <footer style={{ padding:"13px 24px", borderTop:`1px solid ${T.border}`,
                           display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <span style={{fontSize:11,color:T.muted}}>CRYPTOSITE.AI © 2026 · AI Analysis Engine</span>
            <span style={{fontSize:11,color:T.muted}}>⚠ Not financial advice · DYOR</span>
          </footer>
        </div>
      </div>

      {/* ── Floating AI Chatbot ── */}
      <AIChatbot coins={coins} T={T}/>
    </>
  );
}
