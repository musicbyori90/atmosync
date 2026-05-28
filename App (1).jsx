import { useState, useEffect, useRef } from 'react';

// ─── SUPABASE ─────────────────────────────────────────────────────────────────
const SUPABASE_URL = "https://blzdezdeuzxoirhlvfzn.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJsemRlemRldXp4b2lyaGx2ZnpuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk5MzY3MjIsImV4cCI6MjA5NTUxMjcyMn0.8Ewt69H0EhKklYHnfL7Qlz2Twv1O8tMKqfWtLhrMA8I";
const ADMIN_EMAIL = "musicbyori90@gmail.com";

const sb = {
  async signUp(email, password) {
    const r = await fetch(`${SUPABASE_URL}/auth/v1/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "apikey": SUPABASE_KEY },
      body: JSON.stringify({ email, password }),
    });
    return r.json();
  },
  async signIn(email, password) {
    const r = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "apikey": SUPABASE_KEY },
      body: JSON.stringify({ email, password }),
    });
    return r.json();
  },
  async insert(table, data, token) {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "apikey": SUPABASE_KEY, "Authorization": `Bearer ${token}`, "Prefer": "return=representation" },
      body: JSON.stringify(data),
    });
    return r.json();
  },
  async select(table, filter, token) {
    const q = filter ? `?${filter}` : "";
    const r = await fetch(`${SUPABASE_URL}/rest/v1/${table}${q}`, {
      headers: { "apikey": SUPABASE_KEY, "Authorization": `Bearer ${token || SUPABASE_KEY}` },
    });
    return r.json();
  },
  async uploadFile(bucket, path, file, token) {
    const r = await fetch(`${SUPABASE_URL}/storage/v1/object/${bucket}/${path}`, {
      method: "POST",
      headers: { "apikey": SUPABASE_KEY, "Authorization": `Bearer ${token}`, "Content-Type": file.type },
      body: file,
    });
    return `${SUPABASE_URL}/storage/v1/object/public/${bucket}/${path}`;
  },
};

// ─── THEME ────────────────────────────────────────────────────────────────────
const T = {
  bg: "#F0F4F5", surface: "#FFFFFF", card: "#FFFFFF", border: "#DCE6EA",
  accent: "#2A9D8F", accent2: "#E76F51", text: "#1C3040", muted: "#7A9BAD",
  font: "'Syne', sans-serif", body: "'DM Sans', sans-serif",
};

const HOTEL_ZONES = ["לובי", "מעלית", "מסדרונות", "חדר אוכל", "בר", "ספא", "בריכה", "חדרי כושר"];

const BUSINESS_TYPES = {
  "מסעדה":      { icon: "🍽️", color: "#FF6B35", plan: "starter", subtypes: ["אסייתית","איטלקית","ים תיכונית","בית קפה","סושי בר","מסעדת בשרים"] },
  "קמעונאות":   { icon: "🛍️", color: "#00C2FF", plan: "starter", subtypes: ["בוטיק אופנה","חנות ספרים","סופרמרקט","חנות מתנות","חנות ספורט"] },
  "ספא וטיפוח": { icon: "💆", color: "#B57BFF", plan: "pro",     subtypes: ["ספא יוקרתי","מספרה","סלון יופי","סטודיו יוגה","מכון כושר"] },
  "מלון":       { icon: "🏨", color: "#FFD166", plan: "enterprise", subtypes: ["מלון בוטיק","נופש כפרי","מלון עסקים","ריזורט","אירוח B&B"] },
  "בידור":      { icon: "🎭", color: "#FF4D8B", plan: "pro",     subtypes: ["בר/פאב","גלריית אמנות","חלל אירועים","קולנוע"] },
};

const PLANS = {
  starter:    { name: "Starter",    price: "₪99",  color: T.border,   label: "פלייליסט יחיד" },
  pro:        { name: "Pro",        price: "₪199", color: T.accent,   label: "פלייליסטים מרובים" },
  enterprise: { name: "Enterprise", price: "₪299", color: "#FFD166",  label: "אזורים מרובים" },
};

const GENRE_TAGS = ["Ambient","Acoustic","Jazz","Electronic","Chill","Lounge","World","Classical","Pop","Asian Fusion","Mediterranean"];
const MOOD_TAGS  = ["רגוע","אנרגטי","רומנטי","מקצועי","שמח","מיסטי","חגיגי","עדין"];
const ENERGY_LABELS = ["נמוך מאוד","נמוך","בינוני","בינוני-גבוה","גבוה","גבוה מאוד"];

// ─── HELPERS ──────────────────────────────────────────────────────────────────
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: ${T.bg}; color: ${T.text}; font-family: ${T.body}; direction: rtl; }
  ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-thumb { background: ${T.border}; border-radius: 2px; }
  input, select, button, textarea { font-family: ${T.body}; }
  input[type=range] { -webkit-appearance: none; height: 4px; border-radius: 2px; background: ${T.border}; cursor: pointer; }
  input[type=range]::-webkit-slider-thumb { -webkit-appearance: none; width: 16px; height: 16px; border-radius: 50%; cursor: pointer; }
  @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
  @keyframes pulse { 0%,100% { opacity:.5; transform:scale(1); } 50% { opacity:1; transform:scale(1.04); } }
  @keyframes wave { 0%,100% { transform:scaleY(.3); } 50% { transform:scaleY(1.5); } }
  @keyframes spin { to { transform:rotate(360deg); } }
  @keyframes glow { 0%,100% { box-shadow:0 4px 24px ${T.accent}22; } 50% { box-shadow:0 8px 32px ${T.accent}44; } }
  .fade-up { animation: fadeUp .45s ease both; }
  .card { background:${T.card}; border:1px solid ${T.border}; border-radius:16px; box-shadow:0 2px 12px rgba(0,0,0,0.06); }
  .btn-p { background:linear-gradient(135deg,${T.accent},#1f7a6e); border:none; border-radius:12px; color:#fff; font-weight:600; cursor:pointer; transition:all .2s; }
  .btn-p:hover { transform:translateY(-1px); box-shadow:0 6px 20px ${T.accent}44; }
  .btn-g { background:#fff; border:1.5px solid ${T.border}; border-radius:12px; color:${T.muted}; cursor:pointer; transition:all .2s; }
  .btn-g:hover { border-color:${T.accent}; color:${T.accent}; }
`;

async function generateSchedule(businessType, subtype, hours, tracks, zones) {
  const isHotel = businessType === "מלון";
  const zoneList = isHotel ? zones.join(", ") : "ראשי";
  const trackSample = tracks.slice(0, 20).map(t => `${t.name} (${t.genre}, energy:${t.energy}, mood:${t.mood_tags})`).join("\n");

  const prompt = `You are AtmoSync, an AI music scheduler for businesses.
Business: ${businessType} - ${subtype}
Hours: ${hours.open} to ${hours.close}
Zones: ${zoneList}
Available tracks sample:
${trackSample || "No tracks yet - create placeholder schedule"}

Create a daily schedule. ${isHotel ? `For EACH zone (${zoneList}), create time slots.` : "Create time slots for the main zone."}
Each slot: pick tracks or describe what kind of music fits.
Respond ONLY with JSON:
{
  "zones": [
    {
      "zone": "zone name",
      "slots": [
        {"timeFrom":"HH:MM","timeTo":"HH:MM","name":"Hebrew playlist name","mood":"Hebrew mood","energy":60,"color":"#hex","trackIds":[]}
      ]
    }
  ],
  "tagline": "short Hebrew tagline"
}`;

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 1500, messages: [{ role: "user", content: prompt }] }),
    });
    const data = await res.json();
    const text = data.content.map(i => i.text || "").join("");
    return JSON.parse(text.replace(/```json|```/g, "").trim());
  } catch {
    const makeSlots = (zone) => [
      { timeFrom: hours.open, timeTo: "12:00", name: "פתיחת יום", mood: "רגוע ומזמין", energy: 50, color: "#4ECDC4", trackIds: [] },
      { timeFrom: "12:00", timeTo: "17:00", name: "שעות שיא", mood: "אנרגטי", energy: 75, color: T.accent2, trackIds: [] },
      { timeFrom: "17:00", timeTo: hours.close, name: "שעות ערב", mood: "אווירתי", energy: 65, color: "#B57BFF", trackIds: [] },
    ];
    const zoneNames = isHotel ? zones : ["ראשי"];
    return {
      tagline: `מוזיקה מושלמת לכל שעה ב${subtype}`,
      zones: zoneNames.map(z => ({ zone: z, slots: makeSlots(z) })),
    };
  }
}

// ─── WAVE ─────────────────────────────────────────────────────────────────────
function Wave({ playing, color = T.accent, bars = 20, h = 24 }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 2, height: h }}>
      {Array.from({ length: bars }).map((_, i) => (
        <div key={i} style={{
          width: 3, borderRadius: 2, background: color, opacity: .6 + (i % 3) * .13,
          height: playing ? `${5 + Math.abs(Math.sin(i * .9)) * 10}px` : "3px",
          animation: playing ? `wave ${.5 + (i % 5) * .1}s ease-in-out ${i * .04}s infinite alternate` : "none",
          transition: "height .3s",
        }} />
      ))}
    </div>
  );
}

// ─── INPUT STYLE ──────────────────────────────────────────────────────────────
const inp = { background: T.surface, border: `1.5px solid ${T.border}`, borderRadius: 10, color: T.text, padding: "11px 13px", fontSize: 14, width: "100%", outline: "none", transition: "border .2s", colorScheme: "dark" };

// ═══════════════════════════════════════════════════════════════════════════════
// LANDING
// ═══════════════════════════════════════════════════════════════════════════════
function Landing({ onLogin, onSignup }) {
  return (
    <div style={{ minHeight: "100vh", background: T.bg }}>
      <nav style={{ position: "sticky", top: 0, zIndex: 100, background: `${T.surface}f0`, backdropFilter: "blur(20px)", borderBottom: `1px solid ${T.border}`, padding: "0 24px", height: 60, boxShadow: "0 2px 12px rgba(0,0,0,0.06)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Logo />
        <div style={{ display: "flex", gap: 10 }}>
          <button className="btn-g" onClick={onLogin} style={{ padding: "8px 16px", fontSize: 14 }}>כניסה</button>
          <button className="btn-p" onClick={onSignup} style={{ padding: "8px 16px", fontSize: 14 }}>התחל בחינם</button>
        </div>
      </nav>

      <div style={{ padding: "70px 24px 50px", maxWidth: 560, margin: "0 auto", textAlign: "center" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: `${T.accent}18`, border: `1px solid ${T.accent}44`, borderRadius: 20, padding: "5px 14px", marginBottom: 24, animation: "pulse 3s ease infinite" }}>
          <span style={{ color: T.accent, fontSize: 12, fontWeight: 600 }}>✦ מוזיקת AI ללא זכויות יוצרים</span>
        </div>
        <h1 style={{ fontFamily: T.font, fontSize: "clamp(32px,8vw,50px)", fontWeight: 800, lineHeight: 1.1, marginBottom: 18, color: T.text }}>
          האווירה הנכונה<br />
          <span style={{ background: `linear-gradient(135deg, ${T.accent}, ${T.accent2})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>בכל שעה, אוטומטית</span>
        </h1>
        <p style={{ color: T.muted, fontSize: 16, lineHeight: 1.7, marginBottom: 32 }}>
          פשוט תגיד לנו מה העסק שלך ומה שעות הפעילות -- AtmoSync יבנה את לוח המוזיקה היומי אוטומטית.
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap", marginBottom: 48 }}>
          <button className="btn-p" onClick={onSignup} style={{ padding: "13px 28px", fontSize: 15, borderRadius: 13 }}>התחל בחינם ←</button>
          <button className="btn-g" style={{ padding: "13px 22px", fontSize: 15 }}>צפה בהדגמה ▶</button>
        </div>

        {/* Mock player */}
        <div style={{ background: "#fff", border: `1px solid ${T.border}`, borderRadius: 20, padding: 20, animation: "glow 3s ease infinite", boxShadow: "0 8px 32px rgba(42,157,143,0.15)", maxWidth: 340, margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
            <span style={{ color: T.muted, fontSize: 11, letterSpacing: 1 }}>LOBBY · NOW PLAYING</span>
            <span style={{ color: T.accent, fontSize: 11, fontFamily: "monospace" }}>19:42</span>
          </div>
          <div style={{ color: "#fff", fontFamily: T.font, fontWeight: 700, fontSize: 17, marginBottom: 2 }}>ערב רומנטי</div>
          <div style={{ color: T.accent2, fontSize: 12, marginBottom: 14 }}>Asian Lounge · 18:00–22:00</div>
          <Wave playing={true} color={T.accent} bars={28} h={22} />
        </div>
      </div>

      {/* Plans */}
      <div style={{ padding: "48px 20px", maxWidth: 560, margin: "0 auto" }}>
        <h2 style={{ fontFamily: T.font, fontSize: 26, fontWeight: 800, textAlign: "center", color: "#fff", marginBottom: 8 }}>תמחור פשוט</h2>
        <p style={{ color: T.muted, textAlign: "center", fontSize: 13, marginBottom: 28 }}>14 יום ניסיון חינם · ללא כרטיס אשראי</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {Object.entries(PLANS).map(([key, plan]) => (
            <div key={key} className="card" style={{ padding: 18, border: `1px solid ${plan.color === T.border ? T.border : plan.color + "55"}`, background: plan.color === T.border ? T.card : `${plan.color}08` }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontFamily: T.font, fontWeight: 700, fontSize: 16, color: T.text }}>{plan.name}</div>
                  <div style={{ color: T.muted, fontSize: 12, marginTop: 2 }}>{plan.label}</div>
                </div>
                <div style={{ fontFamily: T.font, fontWeight: 800, fontSize: 24, color: plan.color === T.border ? "#fff" : plan.color }}>{plan.price}<span style={{ fontSize: 12, fontWeight: 400, color: T.muted }}>/חודש</span></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ padding: "24px", textAlign: "center", borderTop: `1px solid ${T.border}`, color: T.muted, fontSize: 12, background: T.surface }}>
        <Logo /> <span style={{ marginRight: 8 }}>· 2025 © כל הזכויות שמורות</span>
      </div>
    </div>
  );
}

function Logo() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <div style={{ width: 28, height: 28, borderRadius: 7, background: `linear-gradient(135deg, ${T.accent}, ${T.accent2})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>〜</div>
      <span style={{ fontFamily: T.font, fontWeight: 800, fontSize: 18, color: "#fff", letterSpacing: "-.5px" }}>AtmoSync</span>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// AUTH
// ═══════════════════════════════════════════════════════════════════════════════
function Auth({ mode, onDone, onSwitch, onBack }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const handle = async () => {
    if (!email || !pass) return;
    setLoading(true); setErr("");
    try {
      const data = mode === "signup" ? await sb.signUp(email, pass) : await sb.signIn(email, pass);
      if (data.access_token) {
        const isAdmin = email === ADMIN_EMAIL;
        onDone({ name: name || email.split("@")[0], email, token: data.access_token, userId: data.user?.id, isAdmin });
      } else {
        setErr(data.msg || data.error_description || "שגיאה, נסה שוב");
        setLoading(false);
      }
    } catch { setErr("שגיאת חיבור"); setLoading(false); }
  };

  return (
    <div style={{ minHeight: "100vh", background: T.bg, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ width: "100%", maxWidth: 340 }}>
        <button onClick={onBack} style={{ background: "none", border: "none", color: T.muted, cursor: "pointer", fontSize: 13, marginBottom: 24, padding: 0 }}>← חזרה</button>
        <Logo />
        <h2 style={{ fontFamily: T.font, fontWeight: 800, fontSize: 22, color: T.text, margin: "24px 0 6px" }}>
          {mode === "login" ? "ברוך השב 👋" : "צור חשבון חינם"}
        </h2>
        <p style={{ color: T.muted, fontSize: 13, marginBottom: 24 }}>
          {mode === "login" ? "כניסה לחשבון AtmoSync" : "14 יום ניסיון, ללא כרטיס"}
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 16 }}>
          {mode === "signup" && <input placeholder="שם העסק" value={name} onChange={e => setName(e.target.value)} style={inp} onFocus={e => e.target.style.borderColor = T.accent} onBlur={e => e.target.style.borderColor = T.border} />}
          <input placeholder="אימייל" type="email" value={email} onChange={e => setEmail(e.target.value)} style={inp} onFocus={e => e.target.style.borderColor = T.accent} onBlur={e => e.target.style.borderColor = T.border} />
          <input placeholder="סיסמה" type="password" value={pass} onChange={e => setPass(e.target.value)} onKeyDown={e => e.key === "Enter" && handle()} style={inp} onFocus={e => e.target.style.borderColor = T.accent} onBlur={e => e.target.style.borderColor = T.border} />
        </div>
        {err && <div style={{ color: "#FF4D8B", fontSize: 13, marginBottom: 12 }}>{err}</div>}
        <button className="btn-p" onClick={handle} style={{ width: "100%", padding: "13px 0", fontSize: 15, borderRadius: 12, marginBottom: 14 }}>
          {loading ? <span style={{ animation: "spin 1s linear infinite", display: "inline-block" }}>⟳</span> : mode === "login" ? "כניסה" : "צור חשבון"}
        </button>
        <p style={{ textAlign: "center", color: T.muted, fontSize: 13 }}>
          {mode === "login" ? "אין חשבון? " : "יש חשבון? "}
          <button onClick={onSwitch} style={{ background: "none", border: "none", color: T.accent, cursor: "pointer", fontSize: 13 }}>{mode === "login" ? "הרשם" : "כנס"}</button>
        </p>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ONBOARDING
// ═══════════════════════════════════════════════════════════════════════════════
function Onboarding({ user, onDone }) {
  const [step, setStep] = useState("type");
  const [btype, setBtype] = useState(null);
  const [subtype, setSubtype] = useState(null);
  const [hours, setHours] = useState({ open: "09:00", close: "22:00" });
  const [zones, setZones] = useState([]);
  const [generating, setGenerating] = useState(false);

  const isHotel = btype === "מלון";

  const doGenerate = async () => {
    setGenerating(true);
    try {
      const tracks = await sb.select("tracks", "select=*&order=created_at.desc", user.token);
      const result = await generateSchedule(btype, subtype, hours, Array.isArray(tracks) ? tracks : [], zones);
      // Save business
      const businesses = await sb.insert("businesses", {
        user_id: user.userId, name: user.name,
        business_type: btype, subtype,
        hours_open: hours.open, hours_close: hours.close,
        plan: BUSINESS_TYPES[btype]?.plan || "starter",
        zones: isHotel ? zones : ["ראשי"],
      }, user.token);
      const businessId = Array.isArray(businesses) ? businesses[0]?.id : null;
      onDone({ btype, subtype, hours, zones: isHotel ? zones : ["ראשי"], businessId, ...result });
    } catch (e) {
      const result = await generateSchedule(btype, subtype, hours, [], zones);
      onDone({ btype, subtype, hours, zones: isHotel ? zones : ["ראשי"], businessId: null, ...result });
    }
  };

  if (generating) return (
    <div style={{ minHeight: "100vh", background: T.bg, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 24, padding: 32 }}>
      <div style={{ position: "relative", width: 80, height: 80 }}>
        {[0, 1, 2].map(i => <div key={i} style={{ position: "absolute", inset: `${-i * 14}px`, borderRadius: "50%", border: `1px solid ${T.accent}${["55", "33", "18"][i]}`, animation: `pulse ${1 + i * .4}s ease infinite` }} />)}
        <div style={{ width: 80, height: 80, borderRadius: "50%", background: `${T.accent}22`, border: `2px solid ${T.accent}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 34 }}>
          {BUSINESS_TYPES[btype]?.icon}
        </div>
      </div>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontFamily: T.font, fontWeight: 700, fontSize: 20, color: T.text, marginBottom: 6 }}>AtmoSync בונה את הלוח שלך...</div>
        <div style={{ color: T.muted, fontSize: 14 }}>{btype} · {subtype}</div>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: T.bg }}>
      <div style={{ background: T.surface, borderBottom: `1px solid ${T.border}`, padding: "0 20px", height: 56, display: "flex", alignItems: "center", justifyContent: "space-between", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
        <Logo />
        <div style={{ display: "flex", gap: 5 }}>
          {["type", "subtype", "hours", isHotel && "zones"].filter(Boolean).map((s, i, arr) => (
            <div key={s} style={{ width: arr.indexOf(step) >= i ? 18 : 6, height: 6, borderRadius: 3, background: arr.indexOf(step) >= i ? T.accent : T.border, transition: "all .3s" }} />
          ))}
        </div>
      </div>
      <div style={{ padding: "28px 20px", maxWidth: 460, margin: "0 auto" }}>

        {step === "type" && (
          <div className="fade-up">
            <div style={{ color: T.accent, fontSize: 10, letterSpacing: 2, textTransform: "uppercase", marginBottom: 6, fontWeight: 700 }}>שלב 1</div>
            <h2 style={{ fontFamily: T.font, fontSize: 22, fontWeight: 800, color: T.text, marginBottom: 4 }}>מה סוג העסק?</h2>
            <p style={{ color: T.muted, fontSize: 13, marginBottom: 22 }}>AtmoSync יבנה לוח מוזיקה מותאם אוטומטית</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
              {Object.entries(BUSINESS_TYPES).map(([type, data]) => (
                <button key={type} onClick={() => { setBtype(type); setStep("subtype"); }} style={{ background: T.card, border: `1.5px solid ${T.border}`, borderRadius: 13, padding: "14px 16px", cursor: "pointer", display: "flex", alignItems: "center", gap: 12, transition: "all .2s" }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = data.color; e.currentTarget.style.background = `${data.color}0f`; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.background = T.card; }}>
                  <div style={{ width: 42, height: 42, borderRadius: 10, background: `${data.color}22`, border: `1.5px solid ${data.color}44`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>{data.icon}</div>
                  <div style={{ textAlign: "right", flex: 1 }}>
                    <div style={{ color: T.text, fontSize: 15, fontWeight: 600 }}>{type}</div>
                    <div style={{ color: T.muted, fontSize: 11, marginTop: 1 }}>{PLANS[data.plan]?.name} · {PLANS[data.plan]?.price}/חודש</div>
                  </div>
                  {type === "מלון" && <div style={{ background: `${data.color}22`, color: data.color, fontSize: 10, padding: "2px 8px", borderRadius: 10, border: `1px solid ${data.color}44` }}>ריבוי אזורים</div>}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === "subtype" && (
          <div className="fade-up">
            <button onClick={() => setStep("type")} style={{ background: "none", border: "none", color: T.muted, cursor: "pointer", fontSize: 13, marginBottom: 14, padding: 0 }}>← חזרה</button>
            <div style={{ color: T.accent, fontSize: 10, letterSpacing: 2, textTransform: "uppercase", marginBottom: 6 }}>שלב 2</div>
            <h2 style={{ fontFamily: T.font, fontSize: 22, fontWeight: 800, color: "#fff", marginBottom: 20 }}>{BUSINESS_TYPES[btype]?.icon} {btype} -- איזה סוג?</h2>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 9 }}>
              {BUSINESS_TYPES[btype]?.subtypes.map(sub => (
                <button key={sub} onClick={() => { setSubtype(sub); setStep("hours"); }} style={{ background: T.card, border: `1.5px solid ${T.border}`, borderRadius: 11, padding: "13px 10px", cursor: "pointer", color: T.muted, fontSize: 13, transition: "all .2s", textAlign: "center" }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = BUSINESS_TYPES[btype].color; e.currentTarget.style.color = "#fff"; e.currentTarget.style.background = `${BUSINESS_TYPES[btype].color}0f`; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.color = T.muted; e.currentTarget.style.background = T.card; }}
                >{sub}</button>
              ))}
            </div>
          </div>
        )}

        {step === "hours" && (
          <div className="fade-up">
            <button onClick={() => setStep("subtype")} style={{ background: "none", border: "none", color: T.muted, cursor: "pointer", fontSize: 13, marginBottom: 14, padding: 0 }}>← חזרה</button>
            <div style={{ color: T.accent, fontSize: 10, letterSpacing: 2, textTransform: "uppercase", marginBottom: 6 }}>שלב 3</div>
            <h2 style={{ fontFamily: T.font, fontSize: 22, fontWeight: 800, color: T.text, marginBottom: 6 }}>שעות פעילות</h2>
            <p style={{ color: T.muted, fontSize: 13, marginBottom: 22 }}>AtmoSync יתאים את המוזיקה לכל שעה אוטומטית</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 24 }}>
              <div>
                <label style={{ color: T.muted, fontSize: 11, display: "block", marginBottom: 7, letterSpacing: 1 }}>פתיחה</label>
                <input type="time" value={hours.open} onChange={e => setHours(h => ({ ...h, open: e.target.value }))} style={inp} />
              </div>
              <div>
                <label style={{ color: T.muted, fontSize: 11, display: "block", marginBottom: 7, letterSpacing: 1 }}>סגירה</label>
                <input type="time" value={hours.close} onChange={e => setHours(h => ({ ...h, close: e.target.value }))} style={inp} />
              </div>
            </div>
            <button className="btn-p" onClick={() => isHotel ? setStep("zones") : doGenerate()} style={{ width: "100%", padding: "14px 0", fontSize: 15, borderRadius: 13 }}>
              {isHotel ? "הגדר אזורים ←" : "✨ צור לוח מוזיקה אוטומטי"}
            </button>
          </div>
        )}

        {step === "zones" && isHotel && (
          <div className="fade-up">
            <button onClick={() => setStep("hours")} style={{ background: "none", border: "none", color: T.muted, cursor: "pointer", fontSize: 13, marginBottom: 14, padding: 0 }}>← חזרה</button>
            <div style={{ color: "#FFD166", fontSize: 10, letterSpacing: 2, textTransform: "uppercase", marginBottom: 6 }}>שלב 4 · Enterprise</div>
            <h2 style={{ fontFamily: T.font, fontSize: 22, fontWeight: 800, color: T.text, marginBottom: 4 }}>🏨 אזורי המלון</h2>
            <p style={{ color: T.muted, fontSize: 13, marginBottom: 20 }}>בחר את האזורים שרוצים מוזיקה נפרדת -- כל אחד ינגן בו זמנית</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 9, marginBottom: 24 }}>
              {HOTEL_ZONES.map(zone => {
                const sel = zones.includes(zone);
                return (
                  <button key={zone} onClick={() => setZones(p => sel ? p.filter(z => z !== zone) : [...p, zone])} style={{ background: sel ? "#FFD16618" : T.card, border: `1.5px solid ${sel ? "#FFD166" : T.border}`, borderRadius: 11, padding: "12px 10px", cursor: "pointer", color: sel ? "#fff" : T.muted, fontSize: 13, transition: "all .2s", textAlign: "center" }}>
                    {sel && "✓ "}{zone}
                  </button>
                );
              })}
            </div>
            <button className="btn-p" onClick={doGenerate} disabled={zones.length === 0} style={{ width: "100%", padding: "14px 0", fontSize: 15, borderRadius: 13, opacity: zones.length === 0 ? .5 : 1 }}>
              ✨ צור לוח מוזיקה אוטומטי ({zones.length} אזורים)
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ADMIN DASHBOARD
// ═══════════════════════════════════════════════════════════════════════════════
async function analyzeTrack(trackName) {
  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 300,
        messages: [{ role: "user", content: `Analyze this music track name and return ONLY valid JSON, no markdown:\nTrack: "${trackName}"\n{"genre":"Ambient/Acoustic/Jazz/Electronic/Chill/Lounge/World/Classical/Pop/Asian Fusion/Mediterranean","energy":70,"mood_tags":"Hebrew moods like \u05e8\u05d2\u05d5\u05e2,\u05d0\u05e0\u05e8\u05d2\u05d8\u05d9","name":"clean track name"}` }],
      }),
    });
    const data = await res.json();
    const text = data.content.map(i => i.text || "").join("");
    return JSON.parse(text.replace(/```json|```/g, "").trim());
  } catch {
    return { genre: "Ambient", energy: 60, mood_tags: "\u05e0\u05e2\u05d9\u05dd", name: trackName };
  }
}

function AdminDashboard({ user, onLogout }) {
  const [tab, setTab] = useState("library");
  const [tracks, setTracks] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef();

  useEffect(() => {
    sb.select("tracks", "select=*&order=created_at.desc", user.token).then(data => {
      if (Array.isArray(data)) setTracks(data);
    });
  }, []);

  const handleFile = async (file) => {
    if (!file) return;
    setUploading(true);
    setAnalyzing(true);
    setAnalysisResult(null);
    const trackName = file.name.replace(/\.[^.]+$/, "");
    const analysis = await analyzeTrack(trackName);
    setAnalysisResult(analysis);
    setAnalyzing(false);
    const path = `${Date.now()}_${file.name}`;
    let fileUrl = "";
    try { fileUrl = await sb.uploadFile("music", path, file, user.token); } catch {}
    try {
      const res = await sb.insert("tracks", {
        name: analysis.name || trackName,
        genre: analysis.genre,
        energy: analysis.energy,
        mood_tags: analysis.mood_tags,
        file_url: fileUrl,
      }, user.token);
      if (Array.isArray(res) && res[0]) setTracks(p => [res[0], ...p]);
    } catch {}
    setUploading(false);
    setTimeout(() => setAnalysisResult(null), 3000);
  };

  return (
    <div style={{ minHeight: "100vh", background: T.bg }}>
      <div style={{ background: T.surface, borderBottom: `1px solid ${T.border}`, padding: "0 20px", height: 56, display: "flex", alignItems: "center", justifyContent: "space-between", boxShadow: "0 2px 8px rgba(0,0,0,0.05)", position: "sticky", top: 0, zIndex: 100 }}>
        <Logo />
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ background: `${T.accent}18`, color: T.accent, padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700, border: `1px solid ${T.accent}55` }}>\u26a1 Admin</div>
          <button onClick={onLogout} style={{ background: "none", border: "none", color: T.muted, cursor: "pointer", fontSize: 12 }}>\u05d9\u05e6\u05d9\u05d0\u05d4</button>
        </div>
      </div>

      <div style={{ display: "flex", background: T.surface, borderBottom: `1px solid ${T.border}` }}>
        {[["library", "\ud83d\udcda \u05e1\u05e4\u05e8\u05d9\u05d9\u05d4"], ["upload", "\u2b06\ufe0f \u05d4\u05e2\u05dc\u05d0\u05d4"]].map(([id, label]) => (
          <button key={id} onClick={() => setTab(id)} style={{ flex: 1, padding: "12px 0", background: "none", border: "none", color: tab === id ? T.accent : T.muted, cursor: "pointer", fontSize: 13, fontWeight: tab === id ? 600 : 400, borderBottom: `2px solid ${tab === id ? T.accent : "transparent"}`, transition: "all .2s" }}>{label}</button>
        ))}
      </div>

      <div style={{ padding: 20, maxWidth: 480, margin: "0 auto" }}>
        {tab === "upload" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div className="card" style={{ padding: 20 }}>
              <div style={{ fontFamily: T.font, fontWeight: 700, fontSize: 16, color: T.text, marginBottom: 4 }}>\u05d4\u05e2\u05dc\u05d0\u05ea \u05e8\u05e6\u05d5\u05e2\u05d4 \u05d7\u05d3\u05e9\u05d4</div>
              <div style={{ color: T.muted, fontSize: 13, marginBottom: 18 }}>\u05d2\u05e8\u05d5\u05e8 \u05e7\u05d5\u05d1\u05e5 \u2014 AI \u05d9\u05e0\u05ea\u05d7 \u05d0\u05d5\u05ea\u05d5 \u05d0\u05d5\u05d8\u05d5\u05de\u05d8\u05d9\u05ea</div>
              <div
                onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={e => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0]); }}
                onClick={() => fileRef.current?.click()}
                style={{ border: `2px dashed ${dragOver ? T.accent : T.border}`, borderRadius: 13, padding: "32px 20px", textAlign: "center", cursor: "pointer", background: dragOver ? `${T.accent}08` : "transparent", transition: "all .2s" }}>
                <div style={{ fontSize: 36, marginBottom: 8 }}>\ud83c\udfb5</div>
                <div style={{ color: dragOver ? T.accent : T.text, fontSize: 15, fontWeight: 600, marginBottom: 4 }}>{dragOver ? "\u05e9\u05d7\u05e8\u05e8 \u05dc\u05d4\u05e2\u05dc\u05d0\u05d4" : "\u05d2\u05e8\u05d5\u05e8 MP3/WAV \u05dc\u05db\u05d0\u05df"}</div>
                <div style={{ color: T.muted, fontSize: 13 }}>\u05d0\u05d5 \u05dc\u05d7\u05e5 \u05dc\u05d1\u05d7\u05d9\u05e8\u05d4</div>
                <input ref={fileRef} type="file" accept=".mp3,.wav,.flac,.m4a" style={{ display: "none" }} onChange={e => handleFile(e.target.files[0])} />
              </div>
              {analyzing && (
                <div style={{ textAlign: "center", padding: "16px 0" }}>
                  <span style={{ animation: "spin 1s linear infinite", display: "inline-block", fontSize: 24, color: T.accent }}>\u27b3</span>
                  <div style={{ color: T.accent, fontSize: 13, marginTop: 8, fontWeight: 600 }}>AI \u05de\u05e0\u05ea\u05d7 \u05d0\u05ea \u05d4\u05e8\u05e6\u05d5\u05e2\u05d4...</div>
                </div>
              )}
              {analysisResult && !analyzing && (
                <div style={{ background: `${T.accent}12`, border: `1px solid ${T.accent}44`, borderRadius: 12, padding: 14, marginTop: 12 }}>
                  <div style={{ color: T.accent, fontSize: 12, fontWeight: 700, marginBottom: 8 }}>\u2713 \u05e0\u05d5\u05ea\u05d7 \u05d1\u05d4\u05e6\u05dc\u05d7\u05d4</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    <span style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 20, padding: "4px 12px", color: T.text, fontSize: 12 }}>{analysisResult.genre}</span>
                    <span style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 20, padding: "4px 12px", color: T.text, fontSize: 12 }}>\u26a1 {analysisResult.energy}%</span>
                    <span style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 20, padding: "4px 12px", color: T.text, fontSize: 12 }}>{analysisResult.mood_tags}</span>
                  </div>
                </div>
              )}
              {uploading && !analyzing && (
                <div style={{ textAlign: "center", color: T.accent, padding: 16 }}>
                  <span style={{ animation: "spin 1s linear infinite", display: "inline-block", fontSize: 20 }}>\u27b3</span>
                  <div style={{ fontSize: 13, marginTop: 8 }}>\u05e9\u05d5\u05de\u05e8 \u05dc\u05e1\u05e4\u05e8\u05d9\u05d9\u05d4...</div>
                </div>
              )}
            </div>
          </div>
        )}

        {tab === "library" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
              <div style={{ color: T.muted, fontSize: 12 }}>{tracks.length} \u05e8\u05e6\u05d5\u05e2\u05d5\u05ea \u05d1\u05e1\u05e4\u05e8\u05d9\u05d9\u05d4</div>
              <button className="btn-p" onClick={() => setTab("upload")} style={{ padding: "7px 14px", fontSize: 13 }}>+ \u05d4\u05d5\u05e1\u05e3 \u05e8\u05e6\u05d5\u05e2\u05d4</button>
            </div>
            {tracks.length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px 0", color: T.muted }}>
                <div style={{ fontSize: 36, marginBottom: 10, opacity: .3 }}>\ud83c\udfbc</div>
                <div>\u05d4\u05e1\u05e4\u05e8\u05d9\u05d9\u05d4 \u05e8\u05d9\u05e7\u05d4 -- \u05d4\u05ea\u05d7\u05dc \u05dc\u05d4\u05e2\u05dc\u05d5\u05ea \u05de\u05d5\u05d6\u05d9\u05e7\u05d4 \u05de-Suno</div>
              </div>
            ) : tracks.map((t, i) => (
              <div key={t.id || i} className="card" style={{ padding: "14px 16px", display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 38, height: 38, borderRadius: 9, background: `hsl(${i * 47}, 60%, 80%)`, border: `1px solid hsl(${i * 47}, 60%, 70%)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>\ud83c\udfb5</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ color: T.text, fontSize: 14, fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{t.name}</div>
                  <div style={{ color: T.muted, fontSize: 11, marginTop: 2 }}>{t.genre} \u00b7 \u26a1{t.energy}%{t.mood_tags ? ` \u00b7 ${t.mood_tags}` : ""}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// CLIENT DASHBOARD
// ═══════════════════════════════════════════════════════════════════════════════
function ClientDashboard({ user, data, onLogout }) {
  const { btype, subtype, hours, zones, playlists, tagline } = data;
  const bData = BUSINESS_TYPES[btype] || {};
  const isEnterprise = bData.plan === "enterprise";
  const [activeZone, setActiveZone] = useState(zones?.[0] || "ראשי");
  const [tab, setTab] = useState("now");
  const [volume, setVolume] = useState(70);
  const [playing, setPlaying] = useState(true);
  const [zoneVolumes, setZoneVolumes] = useState({});

  const now = new Date();
  const timeStr = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

  // Get schedule zones from data
  const scheduleZones = data.zones || [{ zone: "ראשי", slots: playlists || [] }];
  const currentZoneData = scheduleZones.find(z => z.zone === activeZone) || scheduleZones[0];
  const currentSlot = currentZoneData?.slots?.[0];

  const getZoneVol = (z) => zoneVolumes[z] ?? 70;
  const setZoneVol = (z, v) => setZoneVolumes(p => ({ ...p, [z]: v }));

  return (
    <div style={{ minHeight: "100vh", background: T.bg }}>
      <div style={{ background: `${T.surface}f0`, backdropFilter: "blur(20px)", borderBottom: `1px solid ${T.border}`, padding: "0 20px", height: 56, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100 }}>
        <Logo />
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontFamily: "monospace", color: bData.color || T.accent, fontWeight: 700, fontSize: 14 }}>{timeStr}</span>
          <span style={{ background: `${T.border}55`, borderRadius: 20, padding: "3px 10px", color: T.muted, fontSize: 11 }}>{bData.icon} {subtype}</span>
          <button onClick={onLogout} style={{ background: "none", border: "none", color: T.muted, cursor: "pointer", fontSize: 12 }}>יציאה</button>
        </div>
      </div>

      {/* Zone tabs for hotels */}
      {isEnterprise && zones?.length > 0 && (
        <div style={{ background: T.surface, borderBottom: `1px solid ${T.border}`, display: "flex", overflowX: "auto", padding: "0 4px" }}>
          {zones.map(zone => (
            <button key={zone} onClick={() => setActiveZone(zone)} style={{ flexShrink: 0, padding: "10px 14px", background: "none", border: "none", color: activeZone === zone ? "#FFD166" : T.muted, cursor: "pointer", fontSize: 13, fontWeight: activeZone === zone ? 600 : 400, borderBottom: `2px solid ${activeZone === zone ? "#FFD166" : "transparent"}`, transition: "all .2s", whiteSpace: "nowrap" }}>{zone}</button>
          ))}
        </div>
      )}

      {/* Nav tabs */}
      <div style={{ display: "flex", background: T.surface, borderBottom: `1px solid ${T.border}` }}>
        {[["now", "עכשיו"], ["schedule", "לוח יומי"], ["settings", "הגדרות"]].map(([id, label]) => (
          <button key={id} onClick={() => setTab(id)} style={{ flex: 1, padding: "11px 0", background: "none", border: "none", color: tab === id ? (bData.color || T.accent) : T.muted, cursor: "pointer", fontSize: 13, fontWeight: tab === id ? 600 : 400, borderBottom: `2px solid ${tab === id ? (bData.color || T.accent) : "transparent"}`, transition: "all .2s" }}>{label}</button>
        ))}
      </div>

      <div style={{ padding: 20, maxWidth: 480, margin: "0 auto" }}>

        {tab === "now" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {/* Now playing */}
            {currentSlot && (
              <div style={{ background: `linear-gradient(135deg, ${currentSlot.color || T.accent}18, ${T.card})`, border: `1px solid ${currentSlot.color || T.accent}44`, borderRadius: 20, padding: 22 }}>
                <div style={{ color: T.muted, fontSize: 10, letterSpacing: 2, textTransform: "uppercase", marginBottom: 10 }}>
                  {isEnterprise ? `${activeZone} · ` : ""}מושמע עכשיו
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
                  <div>
                    <div style={{ fontFamily: T.font, fontWeight: 800, fontSize: 20, color: T.text, marginBottom: 4 }}>{currentSlot.name}</div>
                    <div style={{ color: currentSlot.color || T.accent, fontSize: 13 }}>{currentSlot.mood}</div>
                    <div style={{ color: T.muted, fontSize: 12, marginTop: 4 }}>{currentSlot.timeFrom}–{currentSlot.timeTo}</div>
                  </div>
                  <button onClick={() => setPlaying(!playing)} style={{ width: 50, height: 50, borderRadius: "50%", border: "none", cursor: "pointer", fontSize: 18, background: playing ? `linear-gradient(135deg, ${currentSlot.color || T.accent}, ${currentSlot.color || T.accent}99)` : T.border, boxShadow: playing ? `0 0 20px ${currentSlot.color || T.accent}55` : "none", transition: "all .3s" }}>{playing ? "⏸" : "▶"}</button>
                </div>
                <Wave playing={playing} color={currentSlot.color || T.accent} bars={28} h={26} />
              </div>
            )}

            {/* Volume -- per zone for enterprise */}
            {isEnterprise ? (
              <div className="card" style={{ padding: 18 }}>
                <div style={{ color: T.muted, fontSize: 11, letterSpacing: 1, marginBottom: 14 }}>עוצמת קול לפי אזור</div>
                {zones.map(zone => (
                  <div key={zone} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                    <span style={{ color: T.muted, fontSize: 13, minWidth: 60, textAlign: "right" }}>{zone}</span>
                    <div style={{ flex: 1 }}>
                      <input type="range" min={0} max={100} value={getZoneVol(zone)} onChange={e => setZoneVol(zone, +e.target.value)} style={{ width: "100%", accentColor: "#FFD166" }} />
                    </div>
                    <span style={{ color: "#FFD166", fontFamily: "monospace", fontSize: 12, minWidth: 32 }}>{getZoneVol(zone)}%</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="card" style={{ padding: 18, display: "flex", alignItems: "center", gap: 14 }}>
                <span style={{ fontSize: 18 }}>🔊</span>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                    <span style={{ color: T.muted, fontSize: 12 }}>עוצמת קול</span>
                    <span style={{ color: bData.color || T.accent, fontFamily: "monospace", fontSize: 13, fontWeight: 700 }}>{volume}%</span>
                  </div>
                  <input type="range" min={0} max={100} value={volume} onChange={e => setVolume(+e.target.value)} style={{ width: "100%", accentColor: bData.color || T.accent }} />
                </div>
              </div>
            )}
          </div>
        )}

        {tab === "schedule" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {isEnterprise && (
              <div style={{ color: T.muted, fontSize: 12, marginBottom: 4 }}>מציג לוח עבור: <span style={{ color: "#FFD166" }}>{activeZone}</span></div>
            )}
            {(currentZoneData?.slots || []).map((slot, i) => (
              <div key={i} className="card" style={{ padding: "14px 16px", border: `1px solid ${slot.color || T.border}44`, background: `${slot.color || T.accent}08` }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                  <div style={{ fontFamily: T.font, fontWeight: 700, color: "#fff", fontSize: 15 }}>{slot.name}</div>
                  <div style={{ background: `${slot.color || T.accent}22`, color: slot.color || T.accent, fontSize: 11, padding: "3px 9px", borderRadius: 8, border: `1px solid ${slot.color || T.accent}44` }}>{slot.timeFrom}–{slot.timeTo}</div>
                </div>
                <div style={{ color: T.muted, fontSize: 13, marginBottom: 8 }}>{slot.mood}</div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ flex: 1, height: 3, background: T.border, borderRadius: 2 }}>
                    <div style={{ width: `${slot.energy || 60}%`, height: "100%", background: `linear-gradient(90deg, ${slot.color || T.accent}, ${slot.color || T.accent}88)`, borderRadius: 2 }} />
                  </div>
                  <span style={{ color: T.muted, fontSize: 11 }}>⚡{slot.energy || 60}%</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === "settings" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div className="card" style={{ padding: 18 }}>
              <div style={{ fontFamily: T.font, fontWeight: 700, fontSize: 15, color: T.text, marginBottom: 14 }}>פרטי העסק</div>
              {[["עסק", user.name], ["סוג", `${bData.icon} ${btype} · ${subtype}`], ["שעות", `${hours.open} – ${hours.close}`], ["תוכנית", `${PLANS[bData.plan]?.name} · ${PLANS[bData.plan]?.price}/חודש`], isEnterprise && ["אזורים", zones.join(" · ")]].filter(Boolean).map(([label, val]) => (
                <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "9px 0", borderBottom: `1px solid ${T.border}` }}>
                  <span style={{ color: T.muted, fontSize: 13 }}>{label}</span>
                  <span style={{ color: T.text, fontSize: 13 }}>{val}</span>
                </div>
              ))}
            </div>
            <button onClick={onLogout} style={{ background: "none", border: `1px solid #FF4D8B44`, borderRadius: 12, color: "#FF4D8B", padding: "13px 0", cursor: "pointer", fontSize: 14, width: "100%" }}>יציאה מהחשבון</button>
          </div>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ROOT
// ═══════════════════════════════════════════════════════════════════════════════
export default function App() {
  const [screen, setScreen] = useState("landing");
  const [user, setUser] = useState(null);
  const [bizData, setBizData] = useState(null);

  return (
    <div>
      <style>{css}</style>
      {screen === "landing" && <Landing onLogin={() => setScreen("login")} onSignup={() => setScreen("signup")} />}
      {(screen === "login" || screen === "signup") && (
        <Auth mode={screen} onBack={() => setScreen("landing")} onSwitch={() => setScreen(screen === "login" ? "signup" : "login")}
          onDone={u => { setUser(u); setScreen(u.isAdmin ? "admin" : "onboarding"); }} />
      )}
      {screen === "onboarding" && user && (
        <Onboarding user={user} onDone={d => { setBizData(d); setScreen("dashboard"); }} />
      )}
      {screen === "admin" && user && (
        <AdminDashboard user={user} onLogout={() => { setUser(null); setScreen("landing"); }} />
      )}
      {screen === "dashboard" && user && bizData && (
        <ClientDashboard user={user} data={bizData} onLogout={() => { setUser(null); setBizData(null); setScreen("landing"); }} />
      )}
    </div>
  );
}
