import { useState } from "react";

// ── Design tokens ─────────────────────────────────────────────────────────────
const C = {
  green:    "#1a6b3c",
  greenBg:  "#f0f7f3",
  greenPale:"#e3f2ea",
  red:      "#c0392b",
  redBg:    "#fdf2f1",
  amber:    "#b45309",
  amberBg:  "#fef9ee",
  gray50:   "#f9f8f6",
  gray100:  "#f0ede8",
  gray200:  "#e2ddd6",
  gray400:  "#a09890",
  gray600:  "#6b6460",
  gray800:  "#2c2724",
  white:    "#ffffff",
  gold:     "#c9a227",
  goldBg:   "#fdf8ec",
};

// ── Constants ─────────────────────────────────────────────────────────────────
const PAYOUTS       = [100,90,75,60,50,40,30,20,10,0,-10,-20,-40,-50,-60,-75,-90,-100];
const BONUS_PER     = 6;
const TOTAL_MEMBERS = 18;
const BONUS_TOTAL   = BONUS_PER * (TOTAL_MEMBERS - 1); // 102

// ── Mock tournaments ──────────────────────────────────────────────────────────
const TOURNAMENTS = [
  { id:"masters", name:"The Masters",               dates:"Apr 10–13, 2025", type:"major",     current:true,  winner:"" },
  { id:"players", name:"The Players Championship",  dates:"Mar 13–16, 2025", type:"signature", current:false, winner:"Rory McIlroy" },
  { id:"arnold",  name:"Arnold Palmer Invitational",dates:"Mar 6–9, 2025",   type:"signature", current:false, winner:"Ludvig Åberg" },
  { id:"genesis", name:"Genesis Invitational",      dates:"Feb 13–16, 2025", type:"signature", current:false, winner:"Hideki Matsuyama" },
  { id:"att",     name:"AT&T Pebble Beach Pro-Am",  dates:"Feb 6–9, 2025",   type:"signature", current:false, winner:"Justin Rose" },
];

// ── Season standings ──────────────────────────────────────────────────────────
// rank 1 = best (picks last), rank 18 = worst (picks first)
const SEASON_DATA = [
  { rank:1,  member:"Mike T.",  golfer:"S. Scheffler",  payout:906,  bonus:34,  net:940  },
  { rank:2,  member:"Sarah K.", golfer:"R. McIlroy",    payout:702,  bonus:18,  net:720  },
  { rank:3,  member:"Dave R.",  golfer:"X. Schauffele", payout:510,  bonus:0,   net:510  },
  { rank:4,  member:"Chris L.", golfer:"J. Rahm",       payout:280,  bonus:0,   net:280  },
  { rank:5,  member:"Tom W.",   golfer:"C. Morikawa",   payout:190,  bonus:0,   net:190  },
  { rank:6,  member:"Dan M.",   golfer:"B. DeChambeau", payout:110,  bonus:0,   net:110  },
  { rank:7,  member:"Steve H.", golfer:"J. Thomas",     payout:60,   bonus:0,   net:60   },
  { rank:8,  member:"Tony F.",  golfer:"S. Burns",      payout:20,   bonus:0,   net:20   },
  { rank:9,  member:"Jake M.",  golfer:"P. Cantlay",    payout:-30,  bonus:0,   net:-30  },
  { rank:10, member:"Jen W.",   golfer:"M. Homa",       payout:-60,  bonus:-12, net:-72  },
  { rank:11, member:"Brian P.", golfer:"V. Hovland",    payout:-80,  bonus:0,   net:-80  },
  { rank:12, member:"Kelly N.", golfer:"T. Hatton",     payout:-120, bonus:0,   net:-120 },
  { rank:13, member:"Alex R.",  golfer:"W. Clark",      payout:-200, bonus:-6,  net:-206 },
  { rank:14, member:"Matt G.",  golfer:"C. Young",      payout:-280, bonus:0,   net:-280 },
  { rank:15, member:"Rob K.",   golfer:"A. Scott",      payout:-310, bonus:-6,  net:-316 },
  { rank:16, member:"Paul D.",  golfer:"H. Matsuyama",  payout:-420, bonus:0,   net:-420 },
  { rank:17, member:"Eric B.",  golfer:"L. Åberg",      payout:-580, bonus:-12, net:-592 },
  { rank:18, member:"Phil S.",  golfer:"T. Fleetwood",  payout:-598, bonus:-22, net:-620 },
];

// Pick order = worst-to-best (rank 18 first, rank 1 last)
const PICK_ORDER = [...SEASON_DATA].sort((a,b) => b.rank - a.rank).map(r => r.member);

// ── Golfer odds (mock — will come from API, ordered best-to-worst odds) ───────
const GOLFER_ODDS = [
  { name:"Scottie Scheffler",   odds:"+350"   },
  { name:"Rory McIlroy",        odds:"+500"   },
  { name:"Xander Schauffele",   odds:"+800"   },
  { name:"Jon Rahm",            odds:"+900"   },
  { name:"Collin Morikawa",     odds:"+1000"  },
  { name:"Bryson DeChambeau",   odds:"+1200"  },
  { name:"Justin Thomas",       odds:"+1400"  },
  { name:"Sam Burns",           odds:"+1800"  },
  { name:"Patrick Cantlay",     odds:"+2000"  },
  { name:"Max Homa",            odds:"+2200"  },
  { name:"Viktor Hovland",      odds:"+2500"  },
  { name:"Ludvig Åberg",        odds:"+2800"  },
  { name:"Tommy Fleetwood",     odds:"+3000"  },
  { name:"Cameron Young",       odds:"+3200"  },
  { name:"Wyndham Clark",       odds:"+3500"  },
  { name:"Adam Scott",          odds:"+4000"  },
  { name:"Hideki Matsuyama",    odds:"+4500"  },
  { name:"Tony Finau",          odds:"+5000"  },
  { name:"Tyrrell Hatton",      odds:"+5500"  },
  { name:"Tom Kim",             odds:"+6000"  },
  { name:"Shane Lowry",         odds:"+6500"  },
  { name:"Russell Henley",      odds:"+7000"  },
  { name:"Min Woo Lee",         odds:"+8000"  },
  { name:"Sepp Straka",         odds:"+9000"  },
  { name:"Taylor Moore",        odds:"+10000" },
];

// ── Initial picks for current tournament ─────────────────────────────────────
// First 14 in PICK_ORDER have submitted; last 4 (Chris L., Dave R., Sarah K., Mike T.) haven't yet
const SUBMITTED = {
  "Phil S.":  "Tommy Fleetwood",
  "Eric B.":  "Ludvig Åberg",
  "Paul D.":  "Hideki Matsuyama",
  "Rob K.":   "Adam Scott",
  "Matt G.":  "Cameron Young",
  "Alex R.":  "Wyndham Clark",
  "Kelly N.": "Tyrrell Hatton",
  "Brian P.": "Viktor Hovland",
  "Jen W.":   "Max Homa",
  "Jake M.":  "Patrick Cantlay",
  "Tony F.":  "Sam Burns",
  "Steve H.": "Justin Thomas",
  "Dan M.":   "Bryson DeChambeau",
  "Tom W.":   "Collin Morikawa",
};

const INITIAL_PICKS = (() => {
  const p = {};
  PICK_ORDER.forEach(member => {
    p[member] = SUBMITTED[member]
      ? { golfer: SUBMITTED[member], locked: true  }
      : { golfer: "",                locked: false };
  });
  return p;
})();

// ── Week data ─────────────────────────────────────────────────────────────────
const WEEK_DATA = [
  { member:"Mike T.",   golfer:"S. Scheffler",  score:-18, today:-5, thru:"F",       r1:-4, r2:-7, r3:-5, r4:null, groupRank:1  },
  { member:"Sarah K.",  golfer:"R. McIlroy",    score:-12, today:-4, thru:"F",       r1:-3, r2:-5, r3:-4, r4:null, groupRank:2  },
  { member:"Dave R.",   golfer:"X. Schauffele", score:-9,  today:-3, thru:"F",       r1:-2, r2:-4, r3:-3, r4:null, groupRank:3  },
  { member:"Chris L.",  golfer:"J. Rahm",       score:-7,  today:0,  thru:"F",       r1:-1, r2:-3, r3:-3, r4:null, groupRank:4  },
  { member:"Tom W.",    golfer:"C. Morikawa",   score:-5,  today:0,  thru:"F",       r1:1,  r2:-3, r3:-3, r4:null, groupRank:5  },
  { member:"Dan M.",    golfer:"B. DeChambeau", score:-4,  today:-2, thru:"F",       r1:0,  r2:-2, r3:-2, r4:null, groupRank:6  },
  { member:"Steve H.",  golfer:"J. Thomas",     score:-3,  today:-1, thru:"F",       r1:1,  r2:-2, r3:-2, r4:null, groupRank:7  },
  { member:"Tony F.",   golfer:"S. Burns",      score:-2,  today:0,  thru:"F",       r1:0,  r2:-1, r3:-1, r4:null, groupRank:8  },
  { member:"Jake M.",   golfer:"P. Cantlay",    score:-2,  today:0,  thru:12,        r1:0,  r2:-1, r3:null,r4:null, groupRank:9  },
  { member:"Jen W.",    golfer:"M. Homa",       score:0,   today:0,  thru:"7:48 AM", r1:1,  r2:0,  r3:null,r4:null, groupRank:10 },
  { member:"Brian P.",  golfer:"V. Hovland",    score:0,   today:1,  thru:"8:02 AM", r1:1,  r2:0,  r3:null,r4:null, groupRank:11 },
  { member:"Kelly N.",  golfer:"T. Hatton",     score:1,   today:1,  thru:"8:15 AM", r1:1,  r2:0,  r3:null,r4:null, groupRank:12 },
  { member:"Alex R.",   golfer:"W. Clark",      score:2,   today:1,  thru:"F",       r1:1,  r2:1,  r3:1,  r4:null, groupRank:13 },
  { member:"Matt G.",   golfer:"C. Young",      score:3,   today:2,  thru:"F",       r1:1,  r2:1,  r3:2,  r4:null, groupRank:14 },
  { member:"Rob K.",    golfer:"A. Scott",      score:4,   today:3,  thru:"F",       r1:1,  r2:1,  r3:3,  r4:null, groupRank:15 },
  { member:"Paul D.",   golfer:"H. Matsuyama",  score:5,   today:3,  thru:"F",       r1:2,  r2:1,  r3:3,  r4:null, groupRank:16 },
  { member:"Eric B.",   golfer:"L. Åberg",      score:7,   today:4,  thru:"F",       r1:2,  r2:2,  r3:4,  r4:null, groupRank:17 },
  { member:"Phil S.",   golfer:"T. Fleetwood",  score:9,   today:5,  thru:"F",       r1:3,  r2:1,  r3:5,  r4:null, groupRank:18 },
];

// ── Helpers ───────────────────────────────────────────────────────────────────
const fmtScore  = v => { if (v===null||v===undefined) return "—"; if (v===0) return "E"; return v>0?`+${v}`:`${v}`; };
const fmtMoney  = v => { if (v===0) return "$0"; return v>0?`+$${v}`:`-$${Math.abs(v)}`; };
const scoreColor= v => { if (v===null||v===undefined) return C.gray400; if (v<0) return C.green; if (v>0) return C.red; return C.gray600; };
const moneyColor= v => v>0?C.green:v<0?C.red:C.gray600;
const rankStyle = r => {
  if (r===1) return { bg:C.goldBg,  text:C.gold,   bd:C.gold    };
  if (r===2) return { bg:C.gray100, text:C.gray600, bd:C.gray400 };
  if (r===3) return { bg:C.goldBg,  text:"#a07830", bd:"#c9a227" };
  if (r>=14) return { bg:C.redBg,   text:C.red,     bd:C.red     };
  return            { bg:C.gray100, text:C.gray600, bd:C.gray200 };
};

// ── Primitives ────────────────────────────────────────────────────────────────
const Badge = ({ type }) => {
  const m = {
    major:     { bg:C.amberBg, text:C.amber,   lbl:"Major"     },
    signature: { bg:"#eaf4ff", text:"#1a5fa8",  lbl:"Signature" },
    double:    { bg:C.greenBg, text:C.green,    lbl:"2× payout" },
  };
  const s = m[type];
  return <span style={{fontSize:11,fontWeight:700,padding:"3px 9px",borderRadius:20,background:s.bg,color:s.text,letterSpacing:"0.03em",textTransform:"uppercase"}}>{s.lbl}</span>;
};

const RankBadge = ({ rank }) => {
  const s = rankStyle(rank);
  return <span style={{width:26,height:26,borderRadius:"50%",display:"inline-flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,background:s.bg,color:s.text,border:`1px solid ${s.bd}`,flexShrink:0}}>{rank}</span>;
};

const StatCard = ({ label, value, vc }) => (
  <div style={{background:C.gray50,borderRadius:10,border:`1px solid ${C.gray200}`,padding:"12px 14px"}}>
    <div style={{fontSize:11,color:C.gray400,fontWeight:700,letterSpacing:"0.06em",textTransform:"uppercase",marginBottom:5}}>{label}</div>
    <div style={{fontSize:20,fontWeight:700,color:vc||C.gray800}}>{value}</div>
  </div>
);

const NB = ({ children, type="warning" }) => {
  const m = {
    warning:{ bg:C.amberBg, text:C.amber,   bd:"#f5d87a" },
    info:   { bg:"#eaf4ff", text:"#1a5fa8", bd:"#b3d4f5" },
    success:{ bg:C.greenBg, text:C.green,   bd:"#9dd4b5" },
    neutral:{ bg:C.gray50,  text:C.gray600, bd:C.gray200 },
  };
  const s = m[type];
  return <div style={{background:s.bg,color:s.text,border:`1px solid ${s.bd}`,borderRadius:8,padding:"8px 14px",fontSize:13,marginBottom:12}}>{children}</div>;
};

const TWrap = ({ children }) => (
  <div style={{overflowX:"auto",border:`1px solid ${C.gray200}`,borderRadius:10}}>{children}</div>
);

const TH = ({ children, al="right", w }) => (
  <th style={{fontSize:11,fontWeight:700,color:C.gray400,textAlign:al,padding:"8px 9px",borderBottom:`1px solid ${C.gray200}`,background:C.gray50,whiteSpace:"nowrap",letterSpacing:"0.05em",textTransform:"uppercase",width:w}}>{children}</th>
);

const TD = ({ children, al="right", style={} }) => (
  <td style={{padding:"8px 9px",textAlign:al,verticalAlign:"middle",fontSize:13,...style}}>{children}</td>
);

// ── This Week ─────────────────────────────────────────────────────────────────
const WeekTab = () => {
  const mul = 2;
  const wpt = true;

  return (
    <div>
      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12,flexWrap:"wrap"}}>
        <span style={{fontSize:18,fontWeight:700,color:C.gray800}}>The Masters</span>
        <Badge type="major"/><Badge type="double"/>
        <span style={{fontSize:12,color:C.gray400,marginLeft:"auto"}}>Round 3 · Live</span>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"repeat(4,minmax(0,1fr))",gap:10,marginBottom:12}}>
        <StatCard label="Players"      value="18"/>
        <StatCard label="Winner bonus" value={`$${BONUS_PER}/member`}/>
        <StatCard label="Top payout"   value={`+$${100*mul}`} vc={C.green}/>
        <StatCard label="Max loss"     value={`-$${100*mul}`} vc={C.red}/>
      </div>

      {wpt && (
        <NB type="warning">
          ★ Winner bonus triggered — Mike T. picked the tournament winner. All 17 others owe $6 each ($102 total).
        </NB>
      )}

      <TWrap>
        <table style={{width:"100%",borderCollapse:"collapse",minWidth:840}}>
          <thead>
            <tr>
              <TH al="center" w={40}>Pl.</TH>
              <TH al="left"   w={86}>Player</TH>
              <TH al="left"   w={118}>Pick</TH>
              <TH w={54}>Score</TH>
              <TH w={50}>Today</TH>
              <TH w={66}>Thru</TH>
              <TH w={44}>Rd 1</TH>
              <TH w={44}>Rd 2</TH>
              <TH w={44}>Rd 3</TH>
              <TH w={44}>Rd 4</TH>
              <TH w={74}>Earnings</TH>
              <TH w={62}>Bonus</TH>
            </tr>
          </thead>
          <tbody>
            {WEEK_DATA.map((row,i) => {
              const earn  = PAYOUTS[row.groupRank-1] * mul;
              const bonus = row.groupRank===1&&wpt ? BONUS_TOTAL : wpt ? -BONUS_PER : 0;
              return (
                <tr key={row.member} style={{borderBottom:i<WEEK_DATA.length-1?`1px solid ${C.gray100}`:"none",background:i%2===0?C.white:C.gray50}}>
                  <TD al="center"><RankBadge rank={row.groupRank}/></TD>
                  <TD al="left"><span style={{fontWeight:700,color:C.gray800}}>{row.member}</span></TD>
                  <TD al="left"><span style={{color:C.gray600,fontSize:12}}>{row.golfer}</span></TD>
                  <TD><span style={{fontWeight:700,color:scoreColor(row.score)}}>{fmtScore(row.score)}</span></TD>
                  <TD><span style={{color:scoreColor(row.today)}}>{fmtScore(row.today)}</span></TD>
                  <TD><span style={{color:typeof row.thru==="number"?C.green:C.gray400,fontSize:12}}>{row.thru}</span></TD>
                  {[row.r1,row.r2,row.r3,row.r4].map((rd,ri) => (
                    <TD key={ri}>
                      <span style={{fontSize:12,color:rd!==null?scoreColor(rd):C.gray200,fontWeight:rd!==null&&rd<0?700:400}}>
                        {rd!==null?fmtScore(rd):"—"}
                      </span>
                    </TD>
                  ))}
                  <TD><span style={{fontWeight:700,color:moneyColor(earn)}}>{fmtMoney(earn)}</span></TD>
                  <TD><span style={{fontWeight:700,color:bonus>0?C.gold:bonus<0?C.red:C.gray400}}>{bonus===0?"—":fmtMoney(bonus)}</span></TD>
                </tr>
              );
            })}
          </tbody>
        </table>
      </TWrap>
      <div style={{fontSize:11,color:C.gray400,marginTop:7}}>
        18 members · Rd 4 Sunday · 2× payouts (major) · Tiebreaker: lower final round wins
      </div>
    </div>
  );
};

// ── Season ────────────────────────────────────────────────────────────────────
const SeasonTab = () => (
  <div>
    <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12,flexWrap:"wrap"}}>
      <span style={{fontSize:18,fontWeight:700,color:C.gray800}}>2025 Season</span>
      <span style={{fontSize:12,color:C.gray400,marginLeft:"auto"}}>14 events · 4 majors · 10 signature</span>
    </div>

    <div style={{display:"grid",gridTemplateColumns:"repeat(4,minmax(0,1fr))",gap:10,marginBottom:12}}>
      <StatCard label="Events"    value="14"/>
      <StatCard label="Leader"    value="Mike T."/>
      <StatCard label="Best net"  value="+$940" vc={C.green}/>
      <StatCard label="Worst net" value="-$620" vc={C.red}/>
    </div>

    <NB type="info">
      Pick order this week runs <strong>worst-to-best</strong> — Phil S. picks 1st (#1), Mike T. picks last (#18).
    </NB>

    <TWrap>
      <table style={{width:"100%",borderCollapse:"collapse",minWidth:500}}>
        <thead>
          <tr>
            <TH al="center" w={40}>Pl.</TH>
            <TH al="left"   w={110}>Member</TH>
            <TH al="left"   w={140}>Best pick</TH>
            <TH w={80}>Payout</TH>
            <TH w={72}>Bonus</TH>
            <TH w={84}>Net</TH>
            <TH w={68}>Pick #</TH>
          </tr>
        </thead>
        <tbody>
          {SEASON_DATA.map((row,i) => {
            const pickNum = TOTAL_MEMBERS - row.rank + 1; // rank 1 → pick #18 (last), rank 18 → pick #1 (first)
            return (
              <tr key={row.member} style={{borderBottom:i<SEASON_DATA.length-1?`1px solid ${C.gray100}`:"none",background:i%2===0?C.white:C.gray50}}>
                <TD al="center"><RankBadge rank={row.rank}/></TD>
                <TD al="left"><span style={{fontWeight:700,color:C.gray800}}>{row.member}</span></TD>
                <TD al="left"><span style={{fontSize:12,color:C.gray400}}>{row.golfer}</span></TD>
                <TD><span style={{fontWeight:600,color:moneyColor(row.payout)}}>{fmtMoney(row.payout)}</span></TD>
                <TD><span style={{fontWeight:600,color:row.bonus>0?C.gold:row.bonus<0?C.red:C.gray400}}>{row.bonus===0?"—":fmtMoney(row.bonus)}</span></TD>
                <TD><span style={{fontWeight:700,fontSize:14,color:moneyColor(row.net)}}>{fmtMoney(row.net)}</span></TD>
                <TD>
                  <span style={{fontSize:12,color:C.gray400,background:C.gray100,padding:"2px 8px",borderRadius:20,fontWeight:700}}>
                    #{pickNum}
                  </span>
                </TD>
              </tr>
            );
          })}
        </tbody>
      </table>
    </TWrap>
    <div style={{fontSize:11,color:C.gray400,marginTop:7}}>
      Best pick = highest-earning single event · Bonus = winner bonuses net · Net = Payout + Bonus · Pick # = this week's draft position
    </div>
  </div>
);

// ── Payouts ───────────────────────────────────────────────────────────────────
const PayoutsTab = () => (
  <div>
    <div style={{fontSize:18,fontWeight:700,color:C.gray800,marginBottom:16}}>Payout structure</div>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:18}}>
      <div>
        <div style={{fontSize:11,fontWeight:700,color:C.gray400,letterSpacing:"0.07em",textTransform:"uppercase",marginBottom:8}}>Winnings</div>
        <div style={{display:"grid",gap:5}}>
          {PAYOUTS.slice(0,10).map((amt,i) => (
            <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"7px 12px",background:i===0?C.goldBg:C.gray50,borderRadius:7,border:`1px solid ${i===0?"#f5d87a":C.gray200}`}}>
              <span style={{fontSize:13,color:C.gray600}}>{i+1}{i===0?"st":i===1?"nd":i===2?"rd":"th"}</span>
              <span style={{fontWeight:700,color:amt>0?C.green:C.gray400}}>{fmtMoney(amt)}</span>
            </div>
          ))}
        </div>
      </div>
      <div>
        <div style={{fontSize:11,fontWeight:700,color:C.gray400,letterSpacing:"0.07em",textTransform:"uppercase",marginBottom:8}}>Losses</div>
        <div style={{display:"grid",gap:5}}>
          {PAYOUTS.slice(10).map((amt,i) => (
            <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"7px 12px",background:i===7?C.redBg:C.gray50,borderRadius:7,border:`1px solid ${i===7?"#f5b5b5":C.gray200}`}}>
              <span style={{fontSize:13,color:C.gray600}}>{i+11}th</span>
              <span style={{fontWeight:700,color:C.red}}>{fmtMoney(amt)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
    <NB type="warning"><strong>Winner bonus</strong> — 1st-place member who also picked the tournament winner collects ${BONUS_PER} from each other member (${BONUS_TOTAL} total).</NB>
    <NB type="success"><strong>Majors (4/year)</strong> — All payouts and losses doubled. Max win +$200, max loss −$200.</NB>
    <NB type="neutral"><strong>Tiebreaker</strong> — Same total score: lower final-round score takes the higher group position.</NB>
    <NB type="info"><strong>Pick order</strong> — Each week runs worst-to-best season standings. Last place picks first, first place picks last.</NB>
  </div>
);

// ── Admin ─────────────────────────────────────────────────────────────────────
const AdminTab = () => {
  const [selTourney,   setSelTourney]   = useState("masters");
  const [picks,        setPicks]        = useState(INITIAL_PICKS);
  const [savedMsg,     setSavedMsg]     = useState({});
  const [winner,       setWinner]       = useState("");
  const [winnerSaved,  setWinnerSaved]  = useState(false);
  const [eventType,    setEventType]    = useState("major");

  const tourney      = TOURNAMENTS.find(t => t.id === selTourney);
  const isHistorical = !tourney.current;

  // Set of golfer names already claimed
  const takenGolfers = new Set(
    Object.values(picks).map(p => p.golfer).filter(Boolean)
  );

  // First member in PICK_ORDER who hasn't submitted a pick yet
  const currentPickIdx = PICK_ORDER.findIndex(m => !picks[m]?.golfer);

  const flash = (key) => {
    setSavedMsg(p => ({...p,[key]:true}));
    setTimeout(() => setSavedMsg(p => ({...p,[key]:false})), 2000);
  };

  const savePick = (member, golferName) => {
    if (!golferName || takenGolfers.has(golferName)) return;
    setPicks(p => ({...p,[member]:{ golfer:golferName, locked:false }}));
    flash(member);
  };

  return (
    <div>
      {/* Tournament selector */}
      <div style={{marginBottom:22}}>
        <div style={{fontSize:14,fontWeight:700,color:C.gray800,marginBottom:10,paddingBottom:8,borderBottom:`1px solid ${C.gray200}`}}>
          Tournament
        </div>
        <div style={{display:"flex",alignItems:"center",gap:10,flexWrap:"wrap"}}>
          <label style={{fontSize:13,color:C.gray600}}>Viewing:</label>
          <select value={selTourney} onChange={e=>setSelTourney(e.target.value)}
            style={{fontSize:13,padding:"7px 10px",border:`1px solid ${C.gray200}`,borderRadius:8,background:C.white,color:C.gray800,minWidth:260,cursor:"pointer"}}>
            {TOURNAMENTS.map(t => (
              <option key={t.id} value={t.id}>{t.name} — {t.dates}{t.current?" (current)":""}</option>
            ))}
          </select>
        </div>

        {isHistorical ? (
          <div style={{marginTop:12,padding:"10px 14px",background:C.gray50,border:`1px solid ${C.gray200}`,borderRadius:8,fontSize:13,color:C.gray600}}>
            Completed · <strong style={{color:C.gray800}}>{tourney.name}</strong> · Winner: <strong style={{color:C.green}}>{tourney.winner}</strong>
          </div>
        ) : (
          <div style={{marginTop:14,display:"grid",gap:10}}>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
              <div>
                <label style={{fontSize:12,color:C.gray600,display:"block",marginBottom:4}}>Event type</label>
                <select value={eventType} onChange={e=>setEventType(e.target.value)}
                  style={{width:"100%",fontSize:13,padding:"7px 10px",border:`1px solid ${C.gray200}`,borderRadius:8,background:C.white,color:C.gray800}}>
                  <option value="signature">Signature event</option>
                  <option value="major">Major (2× payout)</option>
                </select>
              </div>
              <div>
                <label style={{fontSize:12,color:C.gray600,display:"block",marginBottom:4}}>Dates</label>
                <input type="text" readOnly value={tourney.dates}
                  style={{width:"100%",fontSize:13,padding:"7px 10px",border:`1px solid ${C.gray200}`,borderRadius:8,background:C.gray50,color:C.gray400}}/>
              </div>
            </div>
            <div style={{background:C.gray50,border:`1px solid ${C.gray200}`,borderRadius:8,padding:12}}>
              <div style={{display:"flex",alignItems:"center",gap:10,flexWrap:"wrap"}}>
                <label style={{fontSize:12,color:C.gray600,flexShrink:0}}>Tournament winner (set when final):</label>
                <input type="text" placeholder="e.g. Scottie Scheffler" value={winner}
                  onChange={e=>setWinner(e.target.value)}
                  style={{flex:1,minWidth:150,fontSize:13,padding:"6px 10px",border:`1px solid ${C.gray200}`,borderRadius:7,background:C.white,color:C.gray800}}/>
                <button
                  onClick={()=>{if(winner.trim()){setWinnerSaved(true);setTimeout(()=>setWinnerSaved(false),3000);}}}
                  style={{fontSize:13,padding:"6px 14px",borderRadius:7,border:`1px solid ${C.gray200}`,background:C.white,color:C.gray800,cursor:"pointer",fontWeight:700}}>
                  Set winner
                </button>
                {winnerSaved && <span style={{fontSize:11,color:C.green,fontWeight:700}}>Saved ✓</span>}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Member picks */}
      <div>
        <div style={{fontSize:14,fontWeight:700,color:C.gray800,marginBottom:10,paddingBottom:8,borderBottom:`1px solid ${C.gray200}`}}>
          Member picks — {tourney.name}
        </div>

        {isHistorical && <NB type="neutral">Completed event — picks are read-only.</NB>}

        {!isHistorical && (
          <NB type="info">
            Pick order: worst-to-best season standing. A member's pick slot only opens once all earlier picks are in.
          </NB>
        )}

        <div style={{display:"grid",gridTemplateColumns:"repeat(2,minmax(0,1fr))",gap:10}}>
          {PICK_ORDER.map((member, idx) => {
            const p          = picks[member] || { golfer:"", locked:false };
            const hasPick    = !!p.golfer;
            const isMyTurn   = !isHistorical && idx === currentPickIdx;
            const isFuture   = !isHistorical && idx > currentPickIdx && !hasPick;
            const isLocked   = p.locked || isHistorical;
            const isEditable = isMyTurn && !hasPick;
            const pickNum    = idx + 1;

            return (
              <div key={member} style={{
                background: C.white,
                border: `1px solid ${isMyTurn ? C.green : C.gray200}`,
                borderRadius: 8,
                padding: 12,
                opacity: isFuture ? 0.4 : 1,
                outline: isMyTurn ? `2px solid ${C.greenPale}` : "none",
              }}>
                {/* Card header */}
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:7}}>
                  <div style={{display:"flex",alignItems:"center",gap:7}}>
                    <span style={{fontSize:13,fontWeight:700,color:C.gray800}}>{member}</span>
                    <span style={{fontSize:11,color:C.gray400,background:C.gray100,padding:"1px 6px",borderRadius:20}}>
                      pick #{pickNum}
                    </span>
                  </div>
                  <div style={{display:"flex",gap:5}}>
                    {isLocked && !isHistorical && (
                      <span style={{fontSize:11,color:C.gray400,background:C.gray100,padding:"2px 7px",borderRadius:20,fontWeight:700}}>locked</span>
                    )}
                    {isMyTurn && (
                      <span style={{fontSize:11,color:C.green,background:C.greenBg,padding:"2px 7px",borderRadius:20,fontWeight:700,border:`1px solid ${C.greenPale}`}}>
                        on the clock
                      </span>
                    )}
                    {isFuture && (
                      <span style={{fontSize:11,color:C.gray400,background:C.gray100,padding:"2px 7px",borderRadius:20,fontWeight:700}}>
                        waiting
                      </span>
                    )}
                  </div>
                </div>

                {/* Current pick */}
                <div style={{fontSize:12,color:C.gray600,marginBottom:isEditable?8:0}}>
                  Pick: <strong style={{color:hasPick?C.gray800:C.gray400}}>
                    {p.golfer || (isFuture ? "not yet unlocked" : "no pick yet")}
                  </strong>
                </div>

                {/* Dropdown — only when it's their turn and no pick yet */}
                {isEditable && (
                  <div style={{marginTop:8}}>
                    <select
                      key={member}
                      defaultValue=""
                      onChange={e => { if (e.target.value) savePick(member, e.target.value); }}
                      style={{
                        width:"100%", fontSize:13, padding:"7px 9px",
                        border:`1px solid ${C.gray200}`, borderRadius:7,
                        background:C.white, color:C.gray800, cursor:"pointer",
                      }}
                    >
                      <option value="" disabled>Select golfer...</option>
                      {GOLFER_ODDS.map(g => {
                        const taken = takenGolfers.has(g.name);
                        return (
                          <option key={g.name} value={g.name} disabled={taken}
                            style={{color:taken?C.gray400:C.gray800}}>
                            {g.name} ({g.odds}){taken?" — taken":""}
                          </option>
                        );
                      })}
                    </select>
                    {savedMsg[member] && (
                      <div style={{fontSize:11,color:C.green,marginTop:5,fontWeight:700}}>Pick saved ✓</div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div style={{fontSize:11,color:C.gray400,marginTop:10}}>
          {Object.values(picks).filter(p=>p.golfer).length}/{TOTAL_MEMBERS} picks submitted ·
          Picks lock at tee time Thursday · Golfers sorted by odds (best first) · Taken golfers greyed out
        </div>
      </div>
    </div>
  );
};

// ── App shell ─────────────────────────────────────────────────────────────────
const TABS = [
  { id:"week",    label:"This week"    },
  { id:"season",  label:"Season"       },
  { id:"payouts", label:"Payout table" },
  { id:"admin",   label:"Admin"        },
];

export default function GolfPickem() {
  const [active, setActive] = useState("week");

  return (
    <div style={{maxWidth:900,margin:"0 auto",fontFamily:"'Georgia','Times New Roman',serif",color:C.gray800,padding:"0 0 40px"}}>
      <div style={{padding:"20px 0 16px",borderBottom:`1px solid ${C.gray200}`,marginBottom:20,display:"flex",alignItems:"baseline",justifyContent:"space-between"}}>
        <div>
          <div style={{fontSize:24,fontWeight:700,color:C.green,letterSpacing:"-0.5px"}}>⛳ Pick'em League</div>
          <div style={{fontSize:13,color:C.gray400,marginTop:2,fontFamily:"sans-serif"}}>2025 PGA Tour Season</div>
        </div>
        <div style={{fontSize:12,color:C.gray400,background:C.greenBg,padding:"4px 10px",borderRadius:20,fontFamily:"sans-serif",border:`1px solid ${C.greenPale}`}}>
          18 members
        </div>
      </div>

      <div style={{display:"flex",gap:4,marginBottom:22,borderBottom:`1px solid ${C.gray200}`,flexWrap:"wrap"}}>
        {TABS.map(tab => {
          const on = tab.id === active;
          return (
            <button key={tab.id} onClick={() => setActive(tab.id)} style={{
              padding:"8px 16px",fontSize:13,fontWeight:on?700:400,
              fontFamily:"sans-serif",cursor:"pointer",border:"none",background:"transparent",
              color:on?C.green:C.gray600,
              borderBottom:on?`2.5px solid ${C.green}`:"2.5px solid transparent",
              marginBottom:-1,borderRadius:0,
              marginLeft:tab.id==="admin"?"auto":0,
              transition:"color 0.15s",
            }}>
              {tab.label}
            </button>
          );
        })}
      </div>

      <div style={{fontFamily:"sans-serif"}}>
        {active==="week"    && <WeekTab/>}
        {active==="season"  && <SeasonTab/>}
        {active==="payouts" && <PayoutsTab/>}
        {active==="admin"   && <AdminTab/>}
      </div>
    </div>
  );
}
