// ════════════════════════════════════════════════════════════
//  CMS – ניהול תוכן מ-Google Sheets
//  גיליון "מודעה-עונתית"  |  גיליון "טקסטים"
// ════════════════════════════════════════════════════════════

const BANNER_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vS-o4pDAAROiApJOKr16R1hsAQuiH7ccgVjTMAn-ZsYzy0AW2-geNGnjv5qLjwx9sRQc_0GjUar5Hw9/pub?gid=447352052&single=true&output=csv';
const TEXTS_URL  = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vS-o4pDAAROiApJOKr16R1hsAQuiH7ccgVjTMAn-ZsYzy0AW2-geNGnjv5qLjwx9sRQc_0GjUar5Hw9/pub?gid=1214736460&single=true&output=csv';

// ── פירוש CSV ─────────────────────────────────────────────
function parseCsvLine(line) {
  const res = []; let cur = '', inQ = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') { if (inQ && line[i+1]==='"'){cur+='"';i++;} else inQ=!inQ; }
    else if (ch===',' && !inQ) { res.push(cur.trim()); cur=''; }
    else cur += ch;
  }
  res.push(cur.trim());
  return res;
}

async function fetchCsv(url) {
  try {
    const r = await fetch(url + '&t=' + Date.now());
    if (!r.ok) return [];
    const text = await r.text();
    const lines = text.trim().split('\n');
    return lines.slice(1).map(l => parseCsvLine(l));
  } catch { return []; }
}

// ── מודעה עונתית ──────────────────────────────────────────
// מבנה גיליון: פעיל | כותרת | תיאור | כפתור | קישור | צבע_רקע
async function loadBanner() {
  const container = document.getElementById('seasonal-banner');
  if (!container) return;
  const rows = await fetchCsv(BANNER_URL);
  if (!rows.length) return;
  const [active, title, desc, btnText, btnUrl, bgColor] = rows[0];
  if (active !== 'כן' && active !== '1' && active !== 'true') return;
  const bg = bgColor || '#7a3e2a';
  container.innerHTML = `
    <div style="
      background:${bg};color:#fff;padding:16px 48px 16px 24px;
      text-align:center;border-bottom:3px solid rgba(255,255,255,0.2);
      position:relative;
    ">
      <strong style="font-size:17px;font-family:'Frank Ruhl Libre',serif;display:block;margin-bottom:5px;">${title||''}</strong>
      ${desc ? `<p style="font-size:13px;opacity:0.88;margin:0 0 10px;line-height:1.5;">${desc}</p>` : ''}
      ${btnUrl ? `<a href="${btnUrl}" target="_blank" style="
        display:inline-block;background:rgba(255,255,255,0.2);
        border:1px solid rgba(255,255,255,0.5);color:#fff;
        padding:7px 22px;border-radius:20px;font-size:13px;
        text-decoration:none;font-weight:600;
      ">${btnText||'לפרטים ←'}</a>` : ''}
      <button onclick="this.parentElement.parentElement.remove()" style="
        position:absolute;top:50%;left:16px;transform:translateY(-50%);
        background:none;border:none;color:rgba(255,255,255,0.7);
        font-size:20px;cursor:pointer;line-height:1;padding:4px;
      ">✕</button>
    </div>`;
  container.style.display = 'block';
}

// ── טקסטים דינמיים ────────────────────────────────────────
// מבנה גיליון: מפתח | תוכן
async function loadTexts() {
  const rows = await fetchCsv(TEXTS_URL);
  if (!rows.length) return;
  const map = {};
  rows.forEach(([key, value]) => { if (key) map[key.trim()] = value; });
  document.querySelectorAll('[data-cms]').forEach(el => {
    const key = el.getAttribute('data-cms');
    if (map[key] !== undefined) el.innerHTML = map[key];
  });
}


// ── מפתחות CMS – עמוד כולל אברכים ────────────────────────
// kollel_hero_sub          – כיתוב קטן מתחת לכותרת הראשית
// kollel_section_title     – כותרת "אודות הכולל"
// kollel_intro             – פסקת פתיחה (קיים)
// kollel_p2                – פסקה 2 – שיטת הלימוד
// kollel_p3                – פסקה 3 – השיעורים
// kollel_p4                – פסקה 4 – שם הכולל
// kollel_p5                – פסקה 5 – מטרת הכולל
// kollel_sidebar_location  – מיקום בסרגל הצד
// kollel_sidebar_rosh      – ראש הכולל
// kollel_sidebar_nasi      – נשיא הכולל
// kollel_pillars_title     – כותרת "עמודי הלימוד"
// kollel_pillar1_title … kollel_pillar6_title – כותרות עמודים
// kollel_pillar1_text  … kollel_pillar6_text  – תיאורי עמודים
// kollel_schedule_title    – כותרת "סדר הלימוד"
// kollel_sched1_time … kollel_sched4_time     – שמות הסדרים
// kollel_sched1_desc … kollel_sched4_desc     – תיאורי הסדרים
// kollel_join_title        – כותרת "הצטרפו לכולל"
// kollel_join_text         – טקסט ההזמנה
// kollel_quote             – ציטוט בתחתית העמוד

// ── מפתחות CMS – עמוד בית הוראה ──────────────────────────
// bh_hero_sub              – כיתוב קטן מתחת לכותרת הראשית
// bh_section_title         – כותרת "שאלות הלכה – אנחנו כאן"
// beit_horaah_intro        – פסקת פתיחה (קיים)
// bh_p2                    – פסקה 2 – שיטת הפסיקה
// bh_p3                    – פסקה 3 – הכשרה מעשית
// bh_p4                    – פסקה 4 – הזמנה לציבור
// bh_phone_label           – כיתוב מתחת למספר הטלפון
// bh_areas_title           – כותרת "תחומי הפסיקה"
// bh_area1_title … bh_area6_title – כותרות תחומים
// bh_area1_text  … bh_area6_text  – תיאורי תחומים
// bh_training_title        – כותרת "הכשרת מורי הוראה"
// bh_training_intro        – פסקת מבוא להכשרה
// bh_step1_title … bh_step4_title – כותרות שלבי ההכשרה
// bh_step1_text  … bh_step4_text  – תיאורי שלבי ההכשרה
// bh_quote                 – ציטוט בתחתית העמוד

// ── הפעלה ─────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  loadBanner();
  loadTexts();
});