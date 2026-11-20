(function() {
  const cdn = 'https://cdn.' + 'jsdelivr.net/npm/';
  const chJs = document.createElement('script'); chJs.src = cdn + 'chart.js'; document.head.appendChild(chJs);

  const s = document.createElement('style');
  s.textContent = `
    :root { --bg: rgba(9,14,28,0.88); --card: rgba(15,23,42,0.94); --cy: #38bdf8; --bd: rgba(56,189,248,0.3); --tx: #e2e8f0; }
    .leaflet-tile-pane { filter: brightness(82%) contrast(108%); }
    .control-panel, .analytics-box, .pro-btn { background: var(--bg) !important; backdrop-filter: blur(12px) !important; border: 1px solid var(--bd) !important; color: var(--tx) !important; }
    .panel-header { background: linear-gradient(90deg, rgba(56,189,248,0.16), transparent) !important; border-bottom: 1px solid var(--bd) !important; }
    .panel-stats, .popup-row strong, .popup-link { color: var(--cy) !important; }
    .search-box input, .filter-actions button, .st-tab, .kpi-card { background: var(--card) !important; border-color: var(--bd) !important; color: #fff !important; }
    .filter-label, .popup-card, .popup-desc { color: var(--tx) !important; }
    .filter-item:hover, .obj-item:hover { background: rgba(56,189,248,0.15) !important; }
    .st-tab.active { background: rgba(56,189,248,0.25) !important; border-color: var(--cy) !important; color: var(--cy) !important; }
    .leaflet-popup-content-wrapper, .leaflet-popup-tip { background: var(--bg) !important; border: 1px solid var(--cy) !important; }
    .pro-bar { position: absolute; top: 14px; right: 14px; z-index: 1000; display: flex; gap: 6px; flex-wrap: wrap; }
    .pro-btn { padding: 7px 11px; border-radius: 6px; font-size: 11px; font-weight: 600; cursor: pointer; text-transform: uppercase; }
    .analytics-box { position: absolute; bottom: 20px; right: 14px; z-index: 1000; width: 290px; border-radius: 8px; padding: 14px; }
    .kpi-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px; margin-bottom: 10px; text-align: center; }
    .kpi-card { padding: 6px 4px; border-radius: 6px; border: 1px solid var(--bd); }
    .kpi-val { font-size: 16px; font-weight: 700; font-family: monospace; }
    .kpi-lbl { font-size: 10px; color: #94a3b8; text-transform: uppercase; }
    .status-tabs { display: flex; gap: 4px; padding: 8px 14px 0; }
    .st-tab { flex: 1; padding: 4px; font-size: 11px; border-radius: 6px; cursor: pointer; }
    .obj-list { max-height: 160px; overflow-y: auto; border-top: 1px solid var(--bd); margin-top: 6px; padding: 6px 14px; }
    .obj-item { padding: 5px 6px; font-size: 12px; border-radius: 6px; cursor: pointer; display: flex; justify-content: space-between; }
    .btn-3d { display: block; width: 100%; margin-top: 10px; padding: 8px; background: linear-gradient(90deg, #0284c7, #38bdf8); color: #fff; border: none; border-radius: 6px; font-weight: 700; cursor: pointer; }
    #m3d { position: fixed; inset: 0; z-index: 9999; background: rgba(5,9,20,0.92); display: none; align-items: center; justify-content: center; }
    #m3d-box { width: 92vw; height: 82vh; background: #090e1c; border: 1px solid #38bdf8; border-radius: 12px; overflow: hidden; position: relative; perspective: 850px; }
    #map3d { width: 100%; height: 100%; transform: rotateX(32deg) scale(1.3); transform-origin: center 65%; }
    #c3d { position: absolute; top: 12px; right: 12px; z-index: 20; padding: 8px 14px; background: #090e1c; color: #38bdf8; border: 1px solid #38bdf8; border-radius: 6px; font-weight: 700; }
    #t3d { position: absolute; top: 12px; left: 12px; z-index: 20; padding: 8px 12px; background: rgba(9,14,28,0.88); color: #fff; border-left: 3px solid #38bdf8; border-radius: 4px; font-size: 12px; font-weight: 600; }
  `;
  document.head.appendChild(s);

  const bar = document.createElement('div'); bar.className = 'pro-bar';
  [['Вся Сибирь',[61.5,81.5],4],['ЯНАО // ХМАО',[64.5,73.5],5],['Кузбасс',[55.2,87.5],6],['Горная Шория',[53.2,87.8],7]].forEach(([n,c,z]) => {
    const b = document.createElement('button'); b.className = 'pro-btn'; b.textContent = n;
    b.onclick = () => map.flyTo(c, z, { duration: 1.2 }); bar.appendChild(b);
  });
  document.body.appendChild(bar);
  const panel = document.querySelector('.control-panel');
  const statusWrap = document.createElement('div'); statusWrap.className = 'status-tabs';
  let statusMode = 'all';
  [['all','Все'],['active','В работе'],['reserve','Резерв']].forEach(([val, txt]) => {
    const btn = document.createElement('button'); btn.className = 'st-tab' + (val === 'all' ? ' active' : ''); btn.textContent = txt;
    btn.onclick = () => { statusMode = val; statusWrap.querySelectorAll('.st-tab').forEach(x => x.classList.remove('active')); btn.classList.add('active'); enhancedUpdate(); };
    statusWrap.appendChild(btn);
  });
  panel.insertBefore(statusWrap, document.querySelector('.filter-actions'));

  const objList = document.createElement('div'); objList.className = 'obj-list'; panel.appendChild(objList);

  const box = document.createElement('div'); box.className = 'analytics-box';
  box.innerHTML = `<div class="kpi-grid"><div class="kpi-card"><div class="kpi-val" id="kpiTotal">0</div><div class="kpi-lbl">Всего</div></div><div class="kpi-card"><div class="kpi-val" id="kpiAct" style="color:#10b981">0</div><div class="kpi-lbl">В работе</div></div><div class="kpi-card"><div class="kpi-val" id="kpiRes" style="color:#f59e0b">0</div><div class="kpi-lbl">Резерв</div></div></div><canvas id="resChart" height="150"></canvas>`;
  document.body.appendChild(box);

  function getPoly(lat, lng, seed, km) {
    const pts = [];
    for (let i = 0; i < 7; i++) {
      const a = (i / 7) * Math.PI * 2;
      const h = Math.sin(seed * 12.9898 + i * 78.233) * 43758.5453;
      const j = 0.65 + (h - Math.floor(h)) * 0.65;
      pts.push([lat + Math.sin(a) * (km * j) / 111, lng + Math.cos(a) * (km * j) / (111 * Math.cos(lat * Math.PI / 180))]);
    }
    return pts;
  }

  const zones = L.layerGroup().addTo(map);
  depositsData.forEach((d, i) => {
    const big = (d.v || '').toLowerCase().includes('крупн') || (d.v || '').toLowerCase().includes('уникал');
    const col = (categoryStyles[d.c] && categoryStyles[d.c].color) || '#38bdf8';
    const p = L.polygon(getPoly(d.lat, d.lng, i + 1, big ? 14 : 7), { color: col, weight: 1.5, dashArray: '5,4', fillColor: col, fillOpacity: 0.16 });
    p.on('click', () => { const f = allMarkers.find(x => x.data.n === d.n); if (f) f.marker.openPopup(); });
    p.addTo(zones);
  });

  const m = document.createElement('div'); m.id = 'm3d';
  m.innerHTML = `<div id="m3d-box"><div id="t3d"></div><button id="c3d">✕ Закрыть 3D</button><div id="map3d"></div></div>`;
  document.body.appendChild(m);
     const cnv = document.createElement('canvas');
  cnv.style.cssText = 'width:100%;height:100%;display:block;touch-action:none;';
  document.getElementById('map3d').style.transform = 'none';
  document.getElementById('map3d').appendChild(cnv);

  let rotY = 0.6, rotX = 0.45, drag = false, lx = 0, ly = 0, anim3d = null, curCol = '#38bdf8', curType = '', curName = '';

  cnv.onpointerdown = e => { drag = true; lx = e.clientX; ly = e.clientY; };
  window.onpointerup = () => drag = false;
  cnv.onpointermove = e => {
    if (!drag) return;
    rotY += (e.clientX - lx) * 0.01;
    rotX = Math.max(0.15, Math.min(1.1, rotX + (e.clientY - ly) * 0.01));
    lx = e.clientX; ly = e.clientY;
  };

  function draw3DBlock() {
    if (m.style.display !== 'flex') return;
    const w = cnv.width = cnv.offsetWidth, h = cnv.height = cnv.offsetHeight;
    const ctx = cnv.getContext('2d');
    ctx.clearRect(0, 0, w, h);
    if (!drag) rotY += 0.005;

    const proj = (x, y, z) => {
      const x1 = x * Math.cos(rotY) - z * Math.sin(rotY);
      const z1 = x * Math.sin(rotY) + z * Math.cos(rotY);
      const y2 = y * Math.cos(rotX) - z1 * Math.sin(rotX);
      const z2 = y * Math.sin(rotX) + z1 * Math.cos(rotX);
      const s = 420 / (420 + z2);
      return [w / 2 + x1 * s, h / 2 + y2 * s];
    };

    const faces = ['0,1,2,3', '4,5,6,7', '0,1,5,4', '1,2,6,5', '2,3,7,6', '3,0,4,7'].map(s => s.split(',').map(Number));

    const drawBox = (y1, y2, fill, stroke) => {
      const sz = 105;
      const pts = [[-sz,y1,-sz],[sz,y1,-sz],[sz,y1,sz],[-sz,y1,sz],[-sz,y2,-sz],[sz,y2,-sz],[sz,y2,sz],[-sz,y2,sz]].map(p => proj(...p));
      ctx.fillStyle = fill; ctx.strokeStyle = stroke; ctx.lineWidth = 1.2;
      faces.forEach(f => {
        ctx.beginPath();
        f.forEach((idx, i) => i ? ctx.lineTo(...pts[idx]) : ctx.moveTo(...pts[idx]));
        ctx.closePath(); ctx.fill(); ctx.stroke();
      });
    };

    drawBox(-70, -45, 'rgba(34,197,94,0.22)', '#22c55e');
    drawBox(-45, 5, 'rgba(100,116,139,0.25)', '#64748b');
    drawBox(5, 35, curCol + '55', curCol);
    drawBox(35, 70, 'rgba(30,41,59,0.5)', '#475569');

    const pTop = proj(0, -115, 0), pBase1 = proj(-14, -70, -14), pBase2 = proj(14, -70, -14), pBase3 = proj(14, -70, 14), pBase4 = proj(-14, -70, 14), pPipe = proj(0, 22, 0);
    ctx.strokeStyle = '#38bdf8'; ctx.lineWidth = 2;
    [pBase1, pBase2, pBase3, pBase4].forEach(b => { ctx.beginPath(); ctx.moveTo(...pTop); ctx.lineTo(...b); ctx.stroke(); });
    ctx.strokeStyle = curCol; ctx.lineWidth = 3; ctx.setLineDash('4,4'.split(',').map(Number));
    ctx.beginPath(); ctx.moveTo(...proj(0, -70, 0)); ctx.lineTo(...pPipe); ctx.stroke(); ctx.setLineDash([]);

    ctx.fillStyle = '#e2e8f0'; ctx.font = '12px monospace';
    ctx.fillText(`ОБЪЕКТ: ${curName}`, 18, h - 58);
    ctx.fillStyle = curCol;
    ctx.fillText(`ПЛАСТ: ${curType.toUpperCase()} (ГЛУБИНА ~${curType.includes('нефть') || curType.includes('газ') ? '2400 м' : '450 м'})`, 18, h - 38);
    ctx.fillStyle = '#94a3b8';
    ctx.fillText('Потяните пальцем для вращения 3D-разреза', 18, h - 18);

    anim3d = requestAnimationFrame(draw3DBlock);
  }

  document.getElementById('c3d').onclick = () => { m.style.display = 'none'; cancelAnimationFrame(anim3d); };

  map.on('popupopen', e => {
    const body = e.popup.getElement().querySelector('.popup-body');
    const title = e.popup.getElement().querySelector('.popup-header');
    if (body && !body.querySelector('.btn-3d')) {
      const btn = document.createElement('button'); btn.className = 'btn-3d'; btn.textContent = '🧊 3D-разрез пласта';
      btn.onclick = () => {
        curName = title ? title.textContent : 'Месторождение';
        const d = depositsData.find(x => x.n === curName);
        curType = d ? d.c : 'порода';
        curCol = (d && categoryStyles[d.c] && categoryStyles[d.c].color) || '#38bdf8';
        document.getElementById('t3d').textContent = `Гео-разрез 3D: ${curName}`;
        m.style.display = 'flex';
        cancelAnimationFrame(anim3d);
        draw3DBlock();
      };
      body.appendChild(btn);
    }
  });

  let myChart = null;
  function enhancedUpdate() {
    const q = searchInput.value.trim().toLowerCase();
    clearSearchBtn.style.display = q ? 'block' : 'none';
    markersLayer.clearLayers();
    objList.innerHTML = '';
    let total = 0, act = 0, res = 0;
    const catCounts = {};

    allMarkers.forEach(({ data, marker }) => {
      const isAct = data.a.toLowerCase().startsWith('да');
      if (statusMode === 'active' && !isAct) return;
      if (statusMode === 'reserve' && isAct) return;
      if (!activeCategories.has(data.c)) return;
      if (q && !(data.n + data.l + data.r + data.t).toLowerCase().includes(q)) return;

      markersLayer.addLayer(marker);
      total++;
      if (isAct) act++; else res++;
      catCounts[data.c] = (catCounts[data.c] || 0) + 1;

      const row = document.createElement('div'); row.className = 'obj-item';
      row.innerHTML = `<span>${data.n}</span><span style="font-size:10px;opacity:0.7">${data.c}</span>`;
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
