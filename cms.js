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
  const [active, title, desc, btnText, btnUrl, bgColor] = rows[0].map(v => (v||'').trim());
  // נקה תווים נסתרים ו-BOM מערך הפעיל
  const activeClean = (active || '').replace(/[\u200B-\u200D\uFEFF\r]/g, '').trim();
  if (activeClean !== 'כן' && activeClean !== '1' && activeClean !== 'true') return;
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

// ── הפעלה ─────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  loadBanner();
  loadTexts();
});