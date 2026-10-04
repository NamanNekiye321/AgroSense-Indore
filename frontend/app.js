/**
 * AgroSense Indore - Frontend Controller
 * Handles interactive cards, slider calculations, presets, and recommendation display.
 */

// ---- THEME & LANGUAGE CONTROLLERS ----

let currentLanguage = 'en';

function applyTheme(isDark) {
  if (isDark) {
    document.body.classList.add('dark');
  } else {
    document.body.classList.remove('dark');
  }
  const btn = document.getElementById('theme-btn');
  const label = document.getElementById('theme-label');

  if (label) {
    if (isDark) {
      label.textContent = currentLanguage === 'hi' ? 'लाइट मोड' : 'Light Mode';
    } else {
      label.textContent = currentLanguage === 'hi' ? 'डार्क मोड' : 'Dark Mode';
    }
  }
  if (btn) {
    const icon = btn.querySelector('i');
    if (icon) {
      icon.className = isDark ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
    }
  }
}

function toggleDarkMode() {
  const isDark = !document.body.classList.contains('dark');
  applyTheme(isDark);
  try {
    localStorage.setItem('agrosense_theme', isDark ? 'dark' : 'light');
  } catch (e) {}
}

function initTheme() {
  try {
    const saved = localStorage.getItem('agrosense_theme');
    if (saved === 'dark') {
      applyTheme(true);
    } else if (saved === 'light') {
      applyTheme(false);
    }
  } catch (e) {}
}

// Immediate invocation in case body is already parsed
if (document.body) {
  initTheme();
}

function applyLanguage(lang) {
  currentLanguage = lang;
  try {
    localStorage.setItem('agrosense_lang', lang);
  } catch (e) {}

  const langLabel = document.getElementById('lang-label');
  if (langLabel) {
    langLabel.textContent = currentLanguage === 'en' ? 'हिंदी / English' : 'English / हिंदी';
  }

  const themeLabel = document.getElementById('theme-label');
  if (themeLabel) {
    const isDark = document.body.classList.contains('dark');
    themeLabel.textContent = isDark
      ? (currentLanguage === 'hi' ? 'लाइट मोड' : 'Light Mode')
      : (currentLanguage === 'hi' ? 'डार्क मोड' : 'Dark Mode');
  }

  document.querySelectorAll('[data-en]').forEach((el) => {
    const val = currentLanguage === 'en' ? el.getAttribute('data-en') : el.getAttribute('data-hi');
    if (val) el.innerHTML = val;
  });

  document.querySelectorAll('[data-en-placeholder]').forEach((el) => {
    const val = currentLanguage === 'en' ? el.getAttribute('data-en-placeholder') : el.getAttribute('data-hi-placeholder');
    if (val) el.placeholder = val;
  });
}

function toggleLanguage() {
  applyLanguage(currentLanguage === 'en' ? 'hi' : 'en');
}

function initLanguage() {
  try {
    const saved = localStorage.getItem('agrosense_lang');
    if (saved === 'hi' || saved === 'en') {
      applyLanguage(saved);
    }
  } catch (e) {}
}

if (document.body) {
  initLanguage();
}

function setActiveNav(el) {
  document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));
  if (el) el.classList.add('active');
}

function scrollToFertilizer(el) {
  setActiveNav(el);
  const target = document.getElementById('advisor');
  if (target) {
    target.scrollIntoView({ behavior: 'smooth' });
  }
}

// ---- HAMBURGER / MOBILE NAV ----
function toggleMobileNav() {
  const nav     = document.getElementById('main-nav');
  const btn     = document.getElementById('hamburger-btn');
  const overlay = document.getElementById('nav-overlay');
  if (!nav) return;
  const isOpen = nav.classList.toggle('open');
  btn.classList.toggle('open', isOpen);
  overlay.classList.toggle('visible', isOpen);
  // Lock body scroll when drawer is open
  document.body.style.overflow = isOpen ? 'hidden' : '';
}

// handleNavClick: sets active + closes drawer on mobile
function handleNavClick(el) {
  setActiveNav(el);
  // Close mobile drawer if it's open
  const nav = document.getElementById('main-nav');
  if (nav && nav.classList.contains('open')) {
    toggleMobileNav();
  }
}

// Close drawer on Escape key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    const nav = document.getElementById('main-nav');
    if (nav && nav.classList.contains('open')) toggleMobileNav();
  }
});


// Track active navbar link on scroll
window.addEventListener('scroll', () => {
  const sections = [
    { id: 'history-section', selector: 'a[href="#history-section"]' },
    { id: 'atlas-section',   selector: 'a[href="#atlas-section"]' },
    { id: 'advisor',         selector: 'a[href="#advisor"]' },
  ];

  const scrollY = window.scrollY + 160;
  for (const s of sections) {
    const el = document.getElementById(s.id);
    if (el && scrollY >= el.offsetTop) {
      document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));
      const activeLink = document.querySelector(s.selector);
      if (activeLink) activeLink.classList.add('active');
      break;
    }
  }
});

// ---- SLIDER LOGIC & HINTS ----
const sliderConfig = {
  n:  { optimal: [40, 110], low: 40, high: 110 },
  p:  { optimal: [40, 80],  low: 40, high: 80  },
  k:  { optimal: [25, 70],  low: 25, high: 70  },
  ph: { optimal: [6.5, 7.5], low: 6.5, high: 7.5 },
};

const sliderHints = {
  n:  { low: 'Low (<40 kg/ha)',     ok: 'Optimal (40–110)',  high: 'High (>110 kg/ha)' },
  p:  { low: 'Deficient (<40)',     ok: 'Optimal (40–80)',   high: 'High (>80)'  },
  k:  { low: 'Low (<25 kg/ha)',     ok: 'Optimal (25–70)',   high: 'High (>70)'  },
  ph: { low: 'Acidic (<6.5)',       ok: 'Neutral (6.5–7.5)', high: 'Mildly Alkaline (Typical Malwa Black Soil)' },
};

function updateSlider(type) {
  const el    = document.getElementById(`soil-${type}`);
  const valEl = document.getElementById(`${type}-val`);
  const hint  = document.getElementById(`${type}-hint`);
  if (!el || !valEl) return;

  const val = parseFloat(el.value);
  valEl.textContent = val;

  const cfg = sliderConfig[type];
  const h   = sliderHints[type];
  if (!cfg || !hint) return;

  if (val < cfg.low) {
    hint.textContent = h.low;
    hint.className = 'nutrient-status low';
  } else if (val > cfg.high) {
    hint.textContent = h.high;
    hint.className = 'nutrient-status warn';
  } else {
    hint.textContent = h.ok;
    hint.className = 'nutrient-status optimal';
  }

  // Visual slider fill track
  const min = parseFloat(el.min) || 0;
  const max = parseFloat(el.max) || 100;
  const pct = ((val - min) / (max - min)) * 100;
  const color = type === 'ph' ? '#d97706' : '#6366f1';
  el.style.background = `linear-gradient(to right, ${color} ${pct}%, #e2e8f0 ${pct}%)`;
}

// ---- REGIONAL TEHSIL BASELINES (INDORE & MALWA) — Kharif & Rabi Seasonal ----
const TEHSIL_DATA = {
  'Sanwer': {
    zone: 'Malwa Plateau (Zone X)',
    soil: 'Deep Black Cotton Soil',
    ph: 7.6,
    n: 45, p: 50, k: 40,
    Kharif: { rain: 890, temp: 27, humidity: 78 },
    Rabi:   { rain: 42,  temp: 19, humidity: 48 }
  },
  'Indore': {
    zone: 'Malwa Plateau (Zone X)',
    soil: 'Medium Deep Black Cotton Soil',
    ph: 7.4,
    n: 55, p: 58, k: 45,
    Kharif: { rain: 920, temp: 28, humidity: 80 },
    Rabi:   { rain: 45,  temp: 20, humidity: 50 }
  },
  'Depalpur': {
    zone: 'Malwa Plateau (Zone X)',
    soil: 'Heavy Vertisol Clay Soil',
    ph: 7.5,
    n: 40, p: 48, k: 38,
    Kharif: { rain: 860, temp: 28, humidity: 76 },
    Rabi:   { rain: 38,  temp: 20, humidity: 47 }
  },
  'Mhow': {
    zone: 'Malwa Plateau (Zone X)',
    soil: 'Loamy Black & Undulating Soil',
    ph: 7.2,
    n: 60, p: 54, k: 50,
    Kharif: { rain: 950, temp: 25, humidity: 82 },
    Rabi:   { rain: 48,  temp: 18, humidity: 52 }
  },
  'Hatod': {
    zone: 'Malwa Plateau (Zone X)',
    soil: 'Shallow to Medium Black Soil',
    ph: 7.5,
    n: 42, p: 46, k: 40,
    Kharif: { rain: 875, temp: 28, humidity: 77 },
    Rabi:   { rain: 40,  temp: 20, humidity: 48 }
  }
};

function handleTehsilChange() {
  const tehsilEl  = document.getElementById('tehsil');
  const seasonEl  = document.getElementById('season-select');
  if (!tehsilEl) return;

  const selected = tehsilEl.value;
  const season   = seasonEl ? seasonEl.value : 'Kharif';
  const data     = TEHSIL_DATA[selected] || TEHSIL_DATA['Sanwer'];
  const climate  = data[season] || data['Kharif'];

  // 1. Update Zone Bar Badges
  const soilBadge = document.getElementById('zone-soil');
  const rainBadge = document.getElementById('zone-rain');
  const zoneBadge = document.getElementById('zone-name');

  if (soilBadge) soilBadge.textContent = data.soil;
  if (rainBadge) rainBadge.textContent = `${climate.rain} mm (${season})`;
  if (zoneBadge) zoneBadge.textContent = data.zone;

  // 2. Update Climate Inputs
  const rainInput  = document.getElementById('rainfall');
  const tempInput  = document.getElementById('temperature');
  const humidInput = document.getElementById('humidity');
  if (rainInput)  rainInput.value  = climate.rain;
  if (tempInput)  tempInput.value  = climate.temp;
  if (humidInput) humidInput.value = climate.humidity;

  // 3. Auto-load regional baseline soil values into sliders
  const soilN  = document.getElementById('soil-n');
  const soilP  = document.getElementById('soil-p');
  const soilK  = document.getElementById('soil-k');
  const soilPh = document.getElementById('soil-ph');

  if (soilN)  soilN.value  = data.n;
  if (soilP)  soilP.value  = data.p;
  if (soilK)  soilK.value  = data.k;
  if (soilPh) soilPh.value = data.ph;

  // Refresh all slider labels and track fills
  ['n', 'p', 'k', 'ph'].forEach(updateSlider);
}


// Quick presets handler for verified Indore/Malwa soil types
function applyPreset(presetKey) {
  if (presetKey === 'black_cotton' || presetKey === 'malwa') {
    document.getElementById('soil-n').value = 60;
    document.getElementById('soil-p').value = 55;
    document.getElementById('soil-k').value = 40;
    document.getElementById('soil-ph').value = 7.6;
    document.getElementById('rainfall').value = 900;
    document.getElementById('temperature').value = 26;
    document.getElementById('humidity').value = 65;
  } else if (presetKey === 'deep_black' || presetKey === 'deep') {
    document.getElementById('soil-n').value = 70;
    document.getElementById('soil-p').value = 60;
    document.getElementById('soil-k').value = 50;
    document.getElementById('soil-ph').value = 7.8;
    document.getElementById('rainfall').value = 910;
    document.getElementById('temperature').value = 25;
    document.getElementById('humidity').value = 68;
  } else if (presetKey === 'loamy_black' || presetKey === 'loamy') {
    document.getElementById('soil-n').value = 50;
    document.getElementById('soil-p').value = 45;
    document.getElementById('soil-k').value = 35;
    document.getElementById('soil-ph').value = 7.4;
    document.getElementById('rainfall').value = 930;
    document.getElementById('temperature').value = 27;
    document.getElementById('humidity').value = 62;
  }
  ['n', 'p', 'k', 'ph'].forEach(updateSlider);
}
const applyQuickPreset = applyPreset;

// Initialise all sliders, regional baseline, and history ledger on load
window.addEventListener('DOMContentLoaded', () => {
  initTheme();
  handleTehsilChange();
  updateTimestamp();
  fetchHistory();
});

// ---- ATLAS CARD CLICK → SCROLL + LOAD BASELINE ----
function loadTehsilFromAtlas(tehsilName) {
  // 1. Set the tehsil dropdown
  const tehsilEl = document.getElementById('tehsil');
  if (tehsilEl) {
    tehsilEl.value = tehsilName;
    handleTehsilChange();           // auto-fills all sliders + zone strip
  }

  // 2. Highlight the clicked card, clear others
  document.querySelectorAll('.atlas-card').forEach(c => c.classList.remove('atlas-card--active'));
  const clicked = document.querySelector(`.atlas-card[data-tehsil="${tehsilName}"]`);
  if (clicked) clicked.classList.add('atlas-card--active');

  // 3. Smooth scroll to the top (left card / form)
  const target = document.querySelector('.two-col-layout');
  if (target) {
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  } else {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}


function updateTimestamp() {
  const tsEl = document.getElementById('res-timestamp');
  if (tsEl) {
    const now = new Date();
    tsEl.textContent = now.toTimeString().split(' ')[0];
  }
}

// ---- FORM SUBMIT ----
async function handleFormSubmit(event) {
  event.preventDefault();

  const farmerVal = document.getElementById('farmer-name')?.value.trim() || 'Farmer Guest';
  const villageVal = document.getElementById('village')?.value.trim() || '';

  const payload = {
    farmer_name:    farmerVal,
    farmerName:     farmerVal,
    village:        villageVal,
    farmer_village: villageVal,
    district:       document.getElementById('tehsil').value,
    tehsil:         document.getElementById('tehsil').value,
    land_area:      parseFloat(document.getElementById('land-area').value) || null,
    phone:          document.getElementById('phone')?.value.trim() || '',
    N:              parseFloat(document.getElementById('soil-n').value),
    P:              parseFloat(document.getElementById('soil-p').value),
    K:              parseFloat(document.getElementById('soil-k').value),
    ph:             parseFloat(document.getElementById('soil-ph').value),
    rainfall:       parseFloat(document.getElementById('rainfall').value),
    temperature:    parseFloat(document.getElementById('temperature').value),
    humidity:       parseFloat(document.getElementById('humidity').value) || 68,
  };

  const btn = document.getElementById('submit-btn');
  btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> <span>Analyzing Soil & Climate...</span>';
  btn.disabled = true;

  let data;
  try {
    const response = await fetch('http://localhost:5001/api/recommend', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(payload),
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    data = await response.json();
    displayResults(data);
  } catch (err) {
    console.warn('Backend unreachable, using local agronomic fallback:', err);
    data = calculateLocalFallback(payload);
    displayResults(data);
  } finally {
    btn.innerHTML = '<i class="fa-solid fa-wand-magic-sparkles"></i> <span>Generate AI Crop Recommendation</span>';
    btn.disabled = false;
  }

  // Prepend current session consultation to MongoDB live ledger
  if (data) {
    recordConsultationToLedger(payload, data);
  }
}

// ---- DISPLAY RESULTS ----
const cropInfoMap = {
  'Soybean': {
    hindi: 'सोयाबीन (Kharif Season)',
    icon: 'fa-seedling',
    duration: '95–105 Days',
    season: 'Kharif',
    msp: '₹4,892 / Q',
    water: 'Moderate'
  },
  'Wheat': {
    hindi: 'गेहूं (शरबती / मालवी) (Rabi)',
    icon: 'fa-wheat-awn',
    duration: '115–125 Days',
    season: 'Rabi',
    msp: '₹2,275 / Q',
    water: 'Moderate'
  },
  'Gram (Chickpea)': {
    hindi: 'चना (डॉलर / देशी) (Rabi)',
    icon: 'fa-leaf',
    duration: '90–110 Days',
    season: 'Rabi',
    msp: '₹5,440 / Q',
    water: 'Low'
  },
  'Maize (Corn)': {
    hindi: 'मक्का (Kharif)',
    icon: 'fa-wheat-awn',
    duration: '90–100 Days',
    season: 'Kharif / Rabi',
    msp: '₹2,225 / Q',
    water: 'Moderate'
  },
  'Onion': {
    hindi: 'प्याज (Rabi / Late Kharif)',
    icon: 'custom-onion',
    duration: '120–140 Days',
    season: 'Rabi / Kharif',
    msp: '₹1,850 / Q',
    water: 'High'
  },
  'Potato': {
    hindi: 'आलू (Rabi Season)',
    icon: 'custom-potato',
    duration: '90–100 Days',
    season: 'Rabi',
    msp: '₹1,450 / Q',
    water: 'Moderate'
  }
};

function displayResults(data) {
  const topCrop = data.recommendations?.[0] ?? { crop: 'Soybean', confidence: 94.2 };
  const alt1    = data.recommendations?.[1] ?? { crop: 'Wheat',          confidence: 18.5 };
  const alt2    = data.recommendations?.[2] ?? { crop: 'Gram (Chickpea)', confidence: 12.0 };

  const fert = data.fertilizer_plan ?? {
    urea_kg: 15, dap_kg: 10, mop_kg: 10,
    remarks: 'Apply DAP as basal dose at sowing. Split Urea into 2 doses.'
  };

  // Hero Card Info
  const cName = topCrop.crop;
  const meta = cropInfoMap[cName] || {
    hindi: 'कृषि अनुशंसा',
    icon: 'fa-seedling',
    duration: '95–110 Days',
    season: 'Kharif / Rabi',
    msp: '₹2,500 / Q',
    water: 'Moderate'
  };

  document.getElementById('res-crop-name').textContent = cName;
  document.getElementById('res-crop-meta').textContent = meta.hindi;
  document.getElementById('res-confidence-pill').textContent = `${topCrop.confidence}%`;

  const heroIcon = document.getElementById('hero-crop-icon');
  if (heroIcon) {
    if (meta.icon === 'custom-onion') {
      // Crisp SVG Onion bulb with shoots
      heroIcon.innerHTML = `<svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v3"/><path d="m15 3 2.5-1.5"/><path d="m9 3-2.5-1.5"/><path d="M12 5C7.5 5 4 8.8 4 13.5 4 18 7.5 21 12 21s8-3 8-7.5C20 8.8 16.5 5 12 5z"/><path d="M12 5c-2.5 2.5-4 5.5-4 8.5 0 3.5 1.8 6.5 4 7.5"/><path d="M12 5c2.5 2.5 4 5.5 4 8.5 0 3.5-1.8 6.5-4 7.5"/></svg>`;
    } else if (meta.icon === 'custom-potato') {
      heroIcon.innerHTML = `<i class="fa-solid fa-cookie"></i>`;
    } else {
      heroIcon.innerHTML = `<i class="fa-solid ${meta.icon}"></i>`;
    }
  }

  document.getElementById('stat-duration').textContent = meta.duration;
  document.getElementById('stat-season').textContent   = meta.season;
  document.getElementById('stat-msp').textContent      = meta.msp;
  document.getElementById('stat-water').textContent    = meta.water;

  // Alternatives
  document.getElementById('alt-1-name').textContent = alt1.crop;
  document.getElementById('alt-1-suit').textContent = `Suitability: ${alt1.confidence}%`;
  document.getElementById('alt-2-name').textContent = alt2.crop;
  document.getElementById('alt-2-suit').textContent = `Suitability: ${alt2.confidence}%`;

  // Fertilizers
  const landAreaInput = parseFloat(document.getElementById('land-area')?.value) || 1.0;
  const landArea = Math.max(0.1, landAreaInput);
  const orgTonPerAcre = fert.organic_manure_ton ?? fert.organic_ton ?? 2.0;

  const totalUrea = Math.round(fert.urea_kg * landArea * 10) / 10;
  const totalDap  = Math.round(fert.dap_kg * landArea * 10) / 10;
  const totalMop  = Math.round(fert.mop_kg * landArea * 10) / 10;
  const totalOrg  = Math.round(orgTonPerAcre * landArea * 10) / 10;

  document.getElementById('res-urea').textContent = fert.urea_kg;
  document.getElementById('res-dap').textContent  = fert.dap_kg;
  document.getElementById('res-mop').textContent  = fert.mop_kg;
  const orgEl = document.getElementById('res-org');
  if (orgEl) orgEl.textContent = orgTonPerAcre;

  const ureaTotalEl = document.getElementById('res-urea-total');
  if (ureaTotalEl) ureaTotalEl.textContent = `Total: ${totalUrea} kg`;
  const dapTotalEl = document.getElementById('res-dap-total');
  if (dapTotalEl) dapTotalEl.textContent = `Total: ${totalDap} kg`;
  const mopTotalEl = document.getElementById('res-mop-total');
  if (mopTotalEl) mopTotalEl.textContent = `Total: ${totalMop} kg`;
  const orgTotalEl = document.getElementById('res-org-total');
  if (orgTotalEl) orgTotalEl.textContent = `Total: ${totalOrg} ton`;

  const fertSubtitle = document.getElementById('fert-subtitle');
  if (fertSubtitle) {
    fertSubtitle.innerHTML = currentLanguage === 'hi'
      ? `प्रति एकड़ दर एवं आपके <b>${landArea} एकड़</b> खेत हेतु कुल आवश्यक मात्रा`
      : `Rate per acre &amp; total requirement calculated for your <b>${landArea} Acre</b> field`;
  }
  
  // Format friendly, easy-to-understand application steps
  let adviceText = fert.remarks || '';
  if (adviceText.includes('basal') || adviceText.includes('Vertisols') || adviceText.includes('split Urea')) {
    adviceText = `<strong>How to Apply:</strong> Mix all <b>DAP</b> and <b>MOP</b> directly into the soil when planting seeds (basal dose). For <b>Urea</b>, apply half now at planting, and the remaining half 25–30 days later.`;
  }
  document.getElementById('res-remarks').innerHTML = `<i class="fa-solid fa-lightbulb"></i> ${adviceText}`;

  // Update session time
  updateTimestamp();

  // Switch placeholder -> results card
  document.getElementById('placeholder-state').style.display = 'none';
  document.getElementById('result-state').style.display      = 'block';
}

// ---- LOCAL FALLBACK ----
function calculateLocalFallback(p) {
  let crop = 'Soybean', conf = 92.4;
  let alts = [{ crop: 'Wheat', confidence: 18.5 }, { crop: 'Gram (Chickpea)', confidence: 12.0 }];

  if (p.rainfall < 550 || p.temperature < 22) {
    crop = 'Wheat'; conf = 94.0;
    alts = [{ crop: 'Gram (Chickpea)', confidence: 18.5 }, { crop: 'Onion', confidence: 12.0 }];
  } else if (p.N < 30 && p.rainfall < 600) {
    crop = 'Gram (Chickpea)'; conf = 91.0;
    alts = [{ crop: 'Wheat', confidence: 16.0 }, { crop: 'Soybean', confidence: 8.0 }];
  } else if (p.K > 65) {
    crop = 'Onion'; conf = 93.0;
    alts = [{ crop: 'Potato', confidence: 15.0 }, { crop: 'Soybean', confidence: 10.0 }];
  }

  const urea = p.N < 40 ? 35 : 15;
  const dap  = p.P < 45 ? 40 : 10;
  const mop  = p.K < 35 ? 25 : 10;

  return {
    recommendations: [{ crop, confidence: conf }, ...alts],
    fertilizer_plan: {
      urea_kg: urea, dap_kg: dap, mop_kg: mop,
      remarks: `<strong>How to Apply for ${crop}:</strong> Mix all <b>DAP</b> and <b>MOP</b> into the soil while planting seeds (basal dose). Give half the <b>Urea</b> at planting, and scatter the remaining half 25–30 days later.`,
    },
  };
}

// ---- MONGODB LIVE LEDGER & CONSULTATION HISTORY ----
const DEFAULT_LEDGER_RECORDS = [
  {
    recommendation_id: 1084,
    farmer_name: 'Radheshyam Patidar',
    farmer_village: 'Sanwer Kalan',
    district_name: 'Sanwer',
    input_n: 55,
    input_p: 48,
    input_k: 42,
    input_ph: 7.6,
    top_1_crop: 'Soybean',
    top_1_confidence: 94.2,
    created_at: new Date(Date.now() - 14 * 60 * 1000).toISOString()
  },
  {
    recommendation_id: 1083,
    farmer_name: 'Kailash Choudhary',
    farmer_village: 'Gautampura',
    district_name: 'Depalpur',
    input_n: 42,
    input_p: 52,
    input_k: 38,
    input_ph: 7.8,
    top_1_crop: 'Wheat',
    top_1_confidence: 91.8,
    created_at: new Date(Date.now() - 52 * 60 * 1000).toISOString()
  },
  {
    recommendation_id: 1082,
    farmer_name: 'Dinesh Solanki',
    farmer_village: 'Simrol',
    district_name: 'Mhow',
    input_n: 28,
    input_p: 40,
    input_k: 30,
    input_ph: 7.4,
    top_1_crop: 'Gram (Chickpea)',
    top_1_confidence: 89.5,
    created_at: new Date(Date.now() - 125 * 60 * 1000).toISOString()
  },
  {
    recommendation_id: 1081,
    farmer_name: 'Mukesh Verma',
    farmer_village: 'Betma',
    district_name: 'Hatod',
    input_n: 65,
    input_p: 70,
    input_k: 80,
    input_ph: 7.5,
    top_1_crop: 'Onion',
    top_1_confidence: 93.1,
    created_at: new Date(Date.now() - 260 * 60 * 1000).toISOString()
  },
  {
    recommendation_id: 1080,
    farmer_name: 'Vikram Singh',
    farmer_village: 'Kanadia',
    district_name: 'Indore Central',
    input_n: 60,
    input_p: 50,
    input_k: 45,
    input_ph: 7.6,
    top_1_crop: 'Maize (Corn)',
    top_1_confidence: 88.7,
    created_at: new Date(Date.now() - 410 * 60 * 1000).toISOString()
  }
];

let localLedgerHistory = [...DEFAULT_LEDGER_RECORDS];

async function fetchHistory() {
  try {
    const res = await fetch('http://localhost:5001/api/history?limit=10');
    if (res.ok) {
      const json = await res.json();
      const records = Array.isArray(json) ? json : (json.data || []);
      if (Array.isArray(records) && records.length > 0) {
        try {
          localStorage.setItem('agrosense_recent_history', JSON.stringify(records));
        } catch(e) {}
        renderHistoryTable(records);
        return;
      }
    }
  } catch (err) {
    console.info('[AgroSense] Live MongoDB ledger fallback:', err.message);
  }

  // Fallback to localStorage if available
  try {
    const cached = localStorage.getItem('agrosense_recent_history');
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed) && parsed.length > 0) {
        renderHistoryTable(parsed);
        return;
      }
    }
  } catch (e) {}

  renderHistoryTable(localLedgerHistory);
}

function renderHistoryTable(records) {
  const tbody = document.getElementById('history-table-body');
  if (!tbody) return;
  tbody.innerHTML = '';

  if (!records || records.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" style="text-align:center; color:var(--text-muted); padding:24px;">No consultation history logged yet. Run a recommendation above to log the first record!</td></tr>';
    return;
  }

  records.forEach((row, idx) => {
    const tr = document.createElement('tr');
    tr.className = 'ledger-row';
    tr.title = 'Click to load these soil parameters into the advisory form';
    
    let timeStr = 'Just now';
    if (row.created_at) {
      const d = new Date(row.created_at);
      timeStr = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    let recId = row.recommendation_id;
    if (!recId && row._id) {
      recId = typeof row._id === 'string' ? row._id.slice(-4).toUpperCase() : row._id;
    }
    const displayId = recId ? `#REC-${recId}` : `#REC-${1085 + idx}`;

    const farmer = row.farmer_name || row.farmerName || 'Kisan Guest';
    const rawVill = row.farmer_village || row.village;
    const village = rawVill ? ` / ${rawVill}` : '';
    const tehsil = row.district_name || row.tehsil || 'Indore';
    
    const n = Math.round(Number(row.input_n ?? (row.soil_inputs?.N ?? 60)));
    const p = Math.round(Number(row.input_p ?? (row.soil_inputs?.P ?? 50)));
    const k = Math.round(Number(row.input_k ?? (row.soil_inputs?.K ?? 45)));
    const ph = Number(row.input_ph ?? (row.soil_inputs?.ph ?? 7.6)).toFixed(1);

    const crop = row.top_1_crop || row.primary_crop || row.recommended_crop || (row.recommendations && row.recommendations[0]?.crop) || 'Soybean';
    const conf = Number(row.top_1_confidence || row.confidence || (row.recommendations && row.recommendations[0]?.confidence) || 92.5).toFixed(1);

    tr.innerHTML = `
      <td data-label="ID"><span class="record-pill">${displayId}</span></td>
      <td data-label="Farmer / Village"><strong>${farmer}</strong><span style="color: var(--text-muted); font-size: 0.78rem;">${village}</span></td>
      <td data-label="Tehsil"><span style="font-weight: 600;">${tehsil}</span></td>
      <td data-label="Soil Profile"><span class="soil-code">N:${n} P:${p} K:${k} pH:${ph}</span></td>
      <td data-label="Recommended Crop"><span class="crop-rec-badge"><i class="fa-solid fa-seedling"></i> ${crop}</span></td>
      <td data-label="Confidence"><span class="confidence-pill"><i class="fa-solid fa-circle-check"></i> ${conf}%</span></td>
      <td data-label="Time"><span style="color: var(--text-muted); font-size: 0.8rem;">${timeStr}</span></td>
    `;
    
    tr.onclick = () => loadConsultationIntoForm(row, tr);
    tbody.appendChild(tr);
  });
}

function loadConsultationIntoForm(row, trElement) {
  // 1. Highlight active clicked row
  document.querySelectorAll('.ledger-row').forEach(r => r.classList.remove('ledger-row--active'));
  if (trElement) trElement.classList.add('ledger-row--active');

  // 2. Set tehsil
  const tehsilEl = document.getElementById('tehsil');
  const targetTehsil = row.district_name || row.tehsil;
  if (tehsilEl && targetTehsil) {
    for (let opt of tehsilEl.options) {
      if (opt.value.toLowerCase().includes(targetTehsil.toLowerCase()) || targetTehsil.toLowerCase().includes(opt.value.toLowerCase())) {
        tehsilEl.value = opt.value;
        break;
      }
    }
  }

  // 3. Populate soil inputs
  const nVal = row.input_n !== undefined ? row.input_n : row.soil_inputs?.N;
  if (nVal !== undefined) {
    const el = document.getElementById('soil-n');
    if (el) el.value = Math.round(Number(nVal));
    updateSlider('n');
  }
  const pVal = row.input_p !== undefined ? row.input_p : row.soil_inputs?.P;
  if (pVal !== undefined) {
    const el = document.getElementById('soil-p');
    if (el) el.value = Math.round(Number(pVal));
    updateSlider('p');
  }
  const kVal = row.input_k !== undefined ? row.input_k : row.soil_inputs?.K;
  if (kVal !== undefined) {
    const el = document.getElementById('soil-k');
    if (el) el.value = Math.round(Number(kVal));
    updateSlider('k');
  }
  const phVal = row.input_ph !== undefined ? row.input_ph : row.soil_inputs?.ph;
  if (phVal !== undefined) {
    const el = document.getElementById('soil-ph');
    if (el) el.value = Number(phVal).toFixed(1);
    updateSlider('ph');
  }

  // 4. Populate farmer and village if available
  const farmerVal = row.farmer_name || row.farmerName;
  if (farmerVal) {
    const nameEl = document.getElementById('farmer-name');
    if (nameEl) nameEl.value = farmerVal;
  }
  const rawVill = row.farmer_village || row.village;
  if (rawVill) {
    const villEl = document.getElementById('village');
    if (villEl) villEl.value = rawVill;
  }
  const landAreaVal = row.land_area;
  if (landAreaVal) {
    const areaEl = document.getElementById('land-area');
    if (areaEl) areaEl.value = landAreaVal;
  }
  const phoneVal = row.contact_no || row.phone;
  if (phoneVal) {
    const phoneEl = document.getElementById('phone');
    if (phoneEl) phoneEl.value = phoneVal;
  }

  // 5. Smooth scroll to advisor
  const target = document.getElementById('advisor');
  if (target) {
    target.scrollIntoView({ behavior: 'smooth' });
  }
}

function recordConsultationToLedger(payload, data) {
  const tehsilEl = document.getElementById('tehsil');
  const tehsilVal = payload.tehsil || (tehsilEl ? tehsilEl.value : 'Indore');
  const farmerVal = payload.farmerName || payload.farmer_name || document.getElementById('farmer-name')?.value.trim() || 'Farmer Guest';
  const villageVal = payload.village || payload.farmer_village || document.getElementById('village')?.value.trim() || '';
  const topRec = (data.recommendations && data.recommendations[0]) || { crop: 'Soybean', confidence: 92.4 };

  const recId = data.recommendation_id 
    ? (typeof data.recommendation_id === 'string' ? data.recommendation_id.slice(-4).toUpperCase() : data.recommendation_id)
    : (localLedgerHistory[0]?.recommendation_id ? Number(localLedgerHistory[0].recommendation_id) + 1 : 1085);

  const newLog = {
    _id: data.recommendation_id || Date.now().toString(),
    recommendation_id: recId,
    farmer_name: farmerVal,
    farmer_village: villageVal,
    tehsil: tehsilVal,
    district_name: tehsilVal,
    input_n: payload.N,
    input_p: payload.P,
    input_k: payload.K,
    input_ph: payload.ph,
    soil_inputs: { N: payload.N, P: payload.P, K: payload.K, ph: payload.ph },
    top_1_crop: topRec.crop,
    primary_crop: topRec.crop,
    top_1_confidence: topRec.confidence,
    confidence: topRec.confidence,
    created_at: new Date().toISOString()
  };

  localLedgerHistory.unshift(newLog);
  try {
    localStorage.setItem('agrosense_recent_history', JSON.stringify(localLedgerHistory));
  } catch(e) {}
  renderHistoryTable(localLedgerHistory);

  // Also trigger a fresh fetch from MongoDB after 500ms
  setTimeout(fetchHistory, 500);
}
