(function() {
  const cdn = 'https://cdn.' + 'jsdelivr.net/npm/';
  const chJs = document.createElement('script'); chJs.src = cdn + 'chart.js'; document.head.appendChild(chJs);

  const s = document.createElement('style');
  s.textContent = `
    :root { --bg: rgba(9,14,28,0.88); --card: rgba(15,23,42,0.94); --cy: #38bdf8; --bd: rgba(56,189,248,0.3); --tx: #e2e8f0; }
    .leaflet-tile-pane { filter: brightness(82%) contrast(108%); }
    .control-panel, .analytics-box, .pro-btn { background: var(--bg) !important; backdrop-filter: blur(12px) !important; border: 1px solid var(--bd) !important; color: var(--tx) !important; }
    .control-panel { transition: transform 0.3s ease; }
    .control-panel.collapsed { transform: translateX(-110%); }
    .panel-toggle { position: absolute; top: 14px; left: 354px; z-index: 1001; width: 34px; height: 34px; border-radius: 8px; background: var(--bg); color: var(--cy); border: 1px solid var(--bd); cursor: pointer; font-size: 14px; font-weight: 700; display: flex; align-items: center; justify-content: center; transition: left 0.3s ease; }
    .panel-toggle.shifted { left: 14px; }
    .leaflet-top.leaflet-left { left: 396px !important; transition: left 0.3s ease; }
    body.panel-hidden .leaflet-top.leaflet-left { left: 56px !important; }
    @media (max-width: 640px) { .control-panel.collapsed { transform: translateY(-110%); } .panel-toggle { left: auto; right: 14px; } .panel-toggle.shifted { left: 14px; right: auto; } }
    .panel-header { background: linear-gradient(90deg, rgba(56,189,248,0.16), transparent) !important; border-bottom: 1px solid var(--bd) !important; }
    .panel-stats, .popup-row strong, .popup-link { color: var(--cy) !important; }
    .search-box input, .filter-actions button, .st-tab, .kpi-card { background: var(--card) !important; border-color: var(--bd) !important; color: #fff !important; }
    .filter-label, .popup-card, .popup-desc { color: var(--tx) !important; }
    .filter-item:hover, .obj-item:hover { background: rgba(56,189,248,0.15) !important; }
    .st-tab.active { background: rgba(56,189,248,0.25) !important; border-color: var(--cy) !important; color: var(--cy) !important; }
    .leaflet-popup-content-wrapper, .leaflet-popup-tip { background: var(--bg) !important; border: 1px solid var(--cy) !important; }
    .pro-bar { position: absolute; top: 14px; right: 14px; z-index: 1000; display: flex; gap: 6px; flex-wrap: wrap; max-width: calc(100vw - 70px); justify-content: flex-end; }
    .pro-btn { padding: 7px 10px; border-radius: 6px; font-size: 10px; font-weight: 600; cursor: pointer; text-transform: uppercase; }
    .analytics-box { position: absolute; bottom: 20px; right: 14px; z-index: 1000; width: 260px; border-radius: 8px; padding: 12px; }
    .kpi-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 5px; margin-bottom: 8px; text-align: center; }
    .kpi-card { padding: 5px 3px; border-radius: 6px; border: 1px solid var(--bd); }
    .kpi-val { font-size: 15px; font-weight: 700; font-family: monospace; }
    .kpi-lbl { font-size: 9px; color: #94a3b8; text-transform: uppercase; }
    .status-tabs { display: flex; gap: 4px; padding: 8px 14px 0; }
    .st-tab { flex: 1; padding: 4px; font-size: 11px; border-radius: 6px; cursor: pointer; }
    .obj-list { max-height: 140px; overflow-y: auto; border-top: 1px solid var(--bd); margin-top: 6px; padding: 6px 14px; }
    .obj-item { padding: 5px 6px; font-size: 12px; border-radius: 6px; cursor: pointer; display: flex; justify-content: space-between; }
    .btn-3d { display: block; width: 100%; margin-top: 10px; padding: 8px; background: linear-gradient(90deg, #0284c7, #38bdf8); color: #fff; border: none; border-radius: 6px; font-weight: 700; cursor: pointer; }
    #m3d { position: fixed; inset: 0; z-index: 9999; background: rgba(5,9,20,0.92); display: none; align-items: center; justify-content: center; }
    #m3d-box { width: 92vw; height: 82vh; background: #090e1c; border: 1px solid #38bdf8; border-radius: 12px; overflow: hidden; position: relative; }
    #map3d { width: 100%; height: 100%; }
    #c3d { position: absolute; top: 12px; right: 12px; z-index: 20; padding: 8px 14px; background: #090e1c; color: #38bdf8; border: 1px solid #38bdf8; border-radius: 6px; font-weight: 700; cursor: pointer; }
    #t3d { position: absolute; top: 12px; left: 12px; z-index: 20; padding: 8px 12px; background: rgba(9,14,28,0.88); color: #fff; border-left: 3px solid #38bdf8; border-radius: 4px; font-size: 12px; font-weight: 600; }
  `;
  document.head.appendChild(s);
  const cp = document.querySelector('.control-panel'), tBtn = document.createElement('button');
  tBtn.className = 'panel-toggle shifted'; tBtn.textContent = '☰';
  cp.classList.add('collapsed'); document.body.classList.add('panel-hidden');
  tBtn.onclick = () => { const off = cp.classList.toggle('collapsed'); tBtn.classList.toggle('shifted', off); document.body.classList.toggle('panel-hidden', off); tBtn.textContent = off ? '☰' : '◀'; };
  document.body.appendChild(tBtn);

  const bar = document.createElement('div'); bar.className = 'pro-bar';
  [['Вся Сибирь',[61.5,81.5],4],['ЯНАО // ХМАО',[64.5,73.5],5],['Кузбасс',[55.2,87.5],6],['Горная Шория',[53.2,87.8],7]].forEach(([n,c,z]) => {
    const b = document.createElement('button'); b.className = 'pro-btn'; b.textContent = n;
    b.onclick = () => map.flyTo(c, z, { duration: 1.2 }); bar.appendChild(b);
  });
  document.body.appendChild(bar);

  const statusWrap = document.createElement('div'); statusWrap.className = 'status-tabs';
  let statusMode = 'all', maxYear = 2026, playTimer = null;
  [['all','Все'],['active','В работе'],['reserve','Резерв']].forEach(([val, txt]) => {
    const btn = document.createElement('button'); btn.className = 'st-tab' + (val === 'all' ? ' active' : ''); btn.textContent = txt;
    btn.onclick = () => { statusMode = val; statusWrap.querySelectorAll('.st-tab').forEach(x => x.classList.remove('active')); btn.classList.add('active'); enhancedUpdate(); };
    statusWrap.appendChild(btn);
  });
  cp.insertBefore(statusWrap, document.querySelector('.filter-actions'));

  const objList = document.createElement('div'); objList.className = 'obj-list'; cp.appendChild(objList);

  const box = document.createElement('div'); box.className = 'analytics-box';
  box.innerHTML = `<div class="kpi-grid"><div class="kpi-card"><div class="kpi-val" id="kpiTotal">0</div><div class="kpi-lbl">Всего</div></div><div class="kpi-card"><div class="kpi-val" id="kpiAct" style="color:#10b981">0</div><div class="kpi-lbl">В работе</div></div><div class="kpi-card"><div class="kpi-val" id="kpiRes" style="color:#f59e0b">0</div><div class="kpi-lbl">Резерв</div></div></div><canvas id="resChart" height="140"></canvas>`;
  document.body.appendChild(box);

  const tlBox = document.createElement('div');
  tlBox.style.cssText = 'position:absolute;bottom:20px;left:14px;z-index:1000;background:rgba(9,14,28,0.92);backdrop-filter:blur(12px);border:1px solid rgba(56,189,248,0.35);border-radius:10px;padding:7px 10px;display:flex;align-items:center;gap:7px;color:#e2e8f0;font-family:monospace;width:min(260px,calc(100vw - 300px));min-width:170px;';
  tlBox.innerHTML = `<button id="tlPlay" style="background:#0284c7;color:#fff;border:none;border-radius:6px;padding:4px 8px;font-weight:700;cursor:pointer;">▶</button><input id="tlRange" type="range" min="1950" max="2026" value="2026" style="flex:1;accent-color:#38bdf8;cursor:pointer;"><span id="tlVal" style="font-size:12px;font-weight:700;color:#38bdf8;">2026</span>`;
  document.body.appendChild(tlBox);

  const tlRange = document.getElementById('tlRange'), tlVal = document.getElementById('tlVal'), tlPlay = document.getElementById('tlPlay');
  tlRange.oninput = () => { maxYear = Number(tlRange.value); tlVal.textContent = maxYear; enhancedUpdate(); };
  tlPlay.onclick = () => {
    if (playTimer) { clearInterval(playTimer); playTimer = null; tlPlay.textContent = '▶'; return; }
    if (Number(tlRange.value) >= 2026) tlRange.value = 1950;
    tlPlay.textContent = '⏸';
    playTimer = setInterval(() => {
      if (Number(tlRange.value) >= 2026) { clearInterval(playTimer); playTimer = null; tlPlay.textContent = '▶'; return; }
      tlRange.value = Number(tlRange.value) + 1; maxYear = Number(tlRange.value); tlVal.textContent = maxYear; enhancedUpdate();
    }, 180);
  };

  const P = Array.of;
  L.polygon(P(P(P(90,-180),P(90,180),P(-90,180),P(-90,-180)),P(P(74.5,60),P(74.5,96),P(49,96),P(49,60))), { color: '#38bdf8', weight: 2, fillColor: '#090e1c', fillOpacity: 0.72, interactive: false }).addTo(map);
  const m = document.createElement('div'); m.id = 'm3d';
  m.innerHTML = `<div id="m3d-box"><div id="t3d"></div><button id="c3d">✕ Закрыть 3D</button><div id="map3d"></div></div>`;
  document.body.appendChild(m);
  const cnv = document.createElement('canvas'); cnv.style.cssText = 'width:100%;height:100%;display:block;touch-action:none;';
  document.getElementById('map3d').appendChild(cnv);

  let rotY = 0.65, rotX = 0.42, drag = false, lx = 0, ly = 0, anim3d = null, curCol = '#38bdf8', curType = '', curName = '';
  cnv.onpointerdown = e => { drag = true; lx = e.clientX; ly = e.clientY; };
  window.onpointerup = () => drag = false;
  cnv.onpointermove = e => { if (!drag) return; rotY += (e.clientX - lx) * 0.01; rotX = Math.max(0.15, Math.min(1.1, rotX + (e.clientY - ly) * 0.01)); lx = e.clientX; ly = e.clientY; };

  function draw3DBlock() {
    if (m.style.display !== 'flex') return;
    const w = cnv.width = cnv.offsetWidth, h = cnv.height = cnv.offsetHeight, ctx = cnv.getContext('2d');
    ctx.clearRect(0, 0, w, h);
    if (!drag) rotY += 0.004;
    const proj = (x, y, z) => { const x1 = x * Math.cos(rotY) - z * Math.sin(rotY), z1 = x * Math.sin(rotY) + z * Math.cos(rotY), y2 = y * Math.cos(rotX) - z1 * Math.sin(rotX), z2 = y * Math.sin(rotX) + z1 * Math.cos(rotX), s = 440 / (440 + z2); return P(w * 0.38 + x1 * s, h * 0.54 + y2 * s); };
    const faces = P(P(0,1,2,3), P(4,5,6,7), P(0,1,5,4), P(1,2,6,5), P(2,3,7,6), P(3,0,4,7));
    const drawBox = (x1, x2, y1, y2, z1, z2, fill, stroke, lw = 1.1) => {
      const pts = P(P(x1,y1,z1),P(x2,y1,z1),P(x2,y1,z2),P(x1,y1,z2),P(x1,y2,z1),P(x2,y2,z1),P(x2,y2,z2),P(x1,y2,z2)).map(p => proj(...p));
      ctx.fillStyle = fill; ctx.strokeStyle = stroke; ctx.lineWidth = lw;
      faces.forEach(f => { ctx.beginPath(); f.forEach((idx, i) => i ? ctx.lineTo(...pts[idx]) : ctx.moveTo(...pts[idx])); ctx.closePath(); ctx.fill(); ctx.stroke(); });
    };
    const sz = 76;
    drawBox(-sz, sz, 35, 68, -sz, sz, 'rgba(30,41,59,0.55)', '#475569');
    drawBox(-sz, sz, 5, 35, -sz, sz, curCol + '55', curCol);
    drawBox(-sz, sz, -42, 5, -sz, sz, 'rgba(100,116,139,0.28)', '#64748b');
    drawBox(-sz, sz, -64, -42, -sz, sz, 'rgba(34,197,94,0.24)', '#22c55e');
    drawBox(-26, 26, -69, -64, -22, 22, 'rgba(56,189,248,0.28)', '#38bdf8', 1.2);
    const legs = P(P(-12,-69,-12), P(12,-69,-12), P(12,-69,12), P(-12,-69,12)), tops = P(P(-3.5,-138,-3.5), P(3.5,-138,-3.5), P(3.5,-138,3.5), P(-3.5,-138,3.5));
    for (let i = 0; i < 4; i++) {
      const ni = (i + 1) % 4, p1 = proj(...legs.at(i)), p2 = proj(...tops.at(i)), p3 = proj(...tops.at(ni));
      ctx.strokeStyle = '#e2e8f0'; ctx.lineWidth = 1.8; ctx.beginPath(); ctx.moveTo(...p1); ctx.lineTo(...p2); ctx.stroke();
      ctx.strokeStyle = '#38bdf8'; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(...p2); ctx.lineTo(...p3); ctx.stroke();
    }
    const pTop = proj(0, -138, 0), pPipe = proj(0, 20, 0);
    ctx.strokeStyle = curCol; ctx.lineWidth = 2.5; ctx.setLineDash(P(4, 3)); ctx.beginPath(); ctx.moveTo(...pTop); ctx.lineTo(...pPipe); ctx.stroke(); ctx.setLineDash(P());
    P(P(-53,'Почва / тайга','#22c55e'),P(-19,'Осадочные породы','#94a3b8'),P(20,`Пласт: ${curType}`,curCol),P(52,'Фундамент','#64748b')).forEach(([my, txt, col]) => {
      const rp = P(P(-sz,my,-sz),P(sz,my,-sz),P(sz,my,sz),P(-sz,my,sz)).map(p => proj(...p)).reduce((a, b) => b.at(0) > a.at(0) ? b : a);
      const rx = rp.at(0), ry = rp.at(1), lx2 = Math.min(w - 115, rx + 18);
      ctx.strokeStyle = col; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(rx, ry); ctx.lineTo(lx2, ry); ctx.stroke();
      ctx.fillStyle = 'rgba(9,14,28,0.85)'; ctx.fillRect(lx2 + 3, ry - 9, 110, 16);
      ctx.fillStyle = '#f8fafc'; ctx.font = 'bold 11px sans-serif'; ctx.fillText(txt.slice(0, 17), lx2 + 6, ry + 3);
    });
    anim3d = requestAnimationFrame(draw3DBlock);
  }

  document.getElementById('c3d').onclick = () => { m.style.display = 'none'; cancelAnimationFrame(anim3d); };

  function createCardBanner(cat) {
    const c = (categoryStyles[cat] && categoryStyles[cat].color) || '#38bdf8';
    const cv = document.createElement('canvas'); cv.className = 'popup-img'; cv.width = 300; cv.height = 95;
    cv.style.cssText = 'width:100%;height:95px;border-radius:6px;margin-bottom:8px;border:1px solid rgba(56,189,248,0.35);display:block;background:#090e1c;';
    const g = cv.getContext('2d');
    g.strokeStyle = 'rgba(56,189,248,0.14)'; g.lineWidth = 1;
    for (let x = 30; x < 300; x += 45) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, 95); g.stroke(); }
    for (let y = 24; y < 95; y += 24) { g.beginPath(); g.moveTo(0, y); g.lineTo(300, y); g.stroke(); }
    g.strokeStyle = c; g.fillStyle = c; g.lineWidth = 2.2;
    if (cat.includes('газ')) {
      g.beginPath(); g.moveTo(85, 72); g.lineTo(215, 72); g.moveTo(115, 72); g.lineTo(115, 52); g.lineTo(185, 52); g.lineTo(185, 72); g.stroke();
      g.beginPath(); g.arc(150, 34, 11, 0, Math.PI * 2); g.globalAlpha = 0.35; g.fill(); g.globalAlpha = 1;
    } else if (cat.includes('уголь') || cat.includes('руд') || cat.includes('металл') || cat.includes('золот')) {
      g.beginPath(); g.moveTo(80, 76); g.lineTo(130, 32); g.lineTo(170, 60); g.lineTo(210, 36); g.lineTo(245, 76); g.closePath();
      g.globalAlpha = 0.25; g.fill(); g.globalAlpha = 1; g.stroke();
    } else {
      g.beginPath(); g.moveTo(134, 74); g.lineTo(150, 26); g.lineTo(166, 74); g.moveTo(139, 58); g.lineTo(161, 58); g.moveTo(144, 42); g.lineTo(156, 42); g.stroke();
      g.beginPath(); g.arc(150, 52, 24, 0, Math.PI * 2); g.globalAlpha = 0.18; g.fill(); g.globalAlpha = 1;
    }
    g.font = 'bold 10px monospace'; g.fillText('// ' + cat.toUpperCase(), 10, 16);
    g.fillStyle = '#94a3b8'; g.font = '9px monospace'; g.fillText('СЕКТОР: ЗАПАДНАЯ СИБИРЬ', 10, 87);
    return cv;
  }

  map.on('popupopen', e => {
    const body = e.popup.getElement().querySelector('.popup-body'), title = e.popup.getElement().querySelector('.popup-header');
    if (!body) return;
    const name = title ? title.textContent.trim() : 'Месторождение', d = depositsData.find(x => x.n === name);
    if (!body.querySelector('.popup-img')) body.insertBefore(createCardBanner(d ? d.c : 'ресурс'), body.firstChild);
    if (!body.querySelector('.btn-3d')) {
      const btn = document.createElement('button'); btn.className = 'btn-3d'; btn.textContent = '🧊 3D-разрез пласта';
      btn.onclick = () => { curName = name; curType = d ? d.c : 'порода'; curCol = (d && categoryStyles[d.c] && categoryStyles[d.c].color) || '#38bdf8'; document.getElementById('t3d').textContent = `Гео-разрез 3D: ${curName}`; m.style.display = 'flex'; cancelAnimationFrame(anim3d); draw3DBlock(); };
      body.appendChild(btn);
    }
  });

  let myChart = null;
  function enhancedUpdate() {
    const q = searchInput.value.trim().toLowerCase();
    clearSearchBtn.style.display = q ? 'block' : 'none';
    markersLayer.clearLayers(); objList.innerHTML = '';
    let total = 0, act = 0, res = 0; const catCounts = {};

    allMarkers.forEach(({ data, marker }) => {
      const isAct = data.a.toLowerCase().startsWith('да'), yr = parseInt(data.d, 10) || 1960;
      if (yr > maxYear) return;
      if (statusMode === 'active' && !isAct) return;
      if (statusMode === 'reserve' && isAct) return;
      if (!activeCategories.has(data.c)) return;
      if (q && !(data.n + data.l + data.r + data.t).toLowerCase().includes(q)) return;

      markersLayer.addLayer(marker); total++; if (isAct) act++; else res++;
      catCounts[data.c] = (catCounts[data.c] || 0) + 1;

      const row = document.createElement('div'); row.className = 'obj-item';
      row.innerHTML = `<span>${data.n}</span><span style="font-size:10px;opacity:0.7">${data.d}</span>`;
      row.onclick = () => { map.flyTo([data.lat, data.lng], 8, { duration: 1.2 }); setTimeout(() => marker.openPopup(), 1250); };
      objList.appendChild(row);
    });

    statsText.textContent = `АКТИВНО: ${total} // ИЗ ${depositsData.length}`;
    document.getElementById('kpiTotal').textContent = total;
    document.getElementById('kpiAct').textContent = act;
    document.getElementById('kpiRes').textContent = res;

    if (window.Chart) {
      const ctx = document.getElementById('resChart').getContext('2d');
      if (myChart) myChart.destroy();
      myChart = new Chart(ctx, {
        type: 'doughnut',
        data: { labels: Object.keys(catCounts), datasets: [{ data: Object.values(catCounts), backgroundColor: Object.keys(catCounts).map(c => (categoryStyles[c] && categoryStyles[c].color) || '#38bdf8'), borderColor: '#090e1c', borderWidth: 2 }] },
        options: { plugins: { legend: { display: false } }, cutout: '62%' }
      });
    }
  }

  window.updateMap = enhancedUpdate;
  searchInput.removeEventListener('input', updateMap);
  searchInput.addEventListener('input', enhancedUpdate);
  document.querySelectorAll('#filtersList input').forEach(cb => { cb.onchange = () => { cb.checked ? activeCategories.add(cb.value) : activeCategories.delete(cb.value); enhancedUpdate(); }; });
  chJs.onload = enhancedUpdate;
  enhancedUpdate();
})();
