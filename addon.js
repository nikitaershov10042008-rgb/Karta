(function() {
  const chartScript = document.createElement('script');
  chartScript.src = 'https://jsdelivr.net';
  document.head.appendChild(chartScript);

  const style = document.createElement('style');
  style.textContent = `
    :root { --ht-bg: rgba(9, 14, 28, 0.88); --ht-card: rgba(15, 23, 42, 0.94); --ht-cyan: #38bdf8; --ht-border: rgba(56, 189, 248, 0.3); --ht-text: #e2e8f0; }
    html, body, #map { background: #050914 !important; color: var(--ht-text); }
    .leaflet-tile-pane { filter: brightness(78%) contrast(112%) saturate(95%); }
    .control-panel, .analytics-box, .pro-btn { background: var(--ht-bg) !important; backdrop-filter: blur(12px) !important; border: 1px solid var(--ht-border) !important; color: var(--ht-text) !important; }
    .panel-header { background: linear-gradient(90deg, rgba(56,189,248,0.16), transparent) !important; border-bottom: 1px solid var(--ht-border) !important; }
    .panel-stats, .popup-row strong, .popup-link { color: var(--ht-cyan) !important; }
    .search-box input, .filter-actions button, .st-tab, .kpi-card { background: var(--ht-card) !important; border-color: var(--ht-border) !important; color: #fff !important; }
    .filter-label, .popup-card, .popup-desc { color: var(--ht-text) !important; }
    .filter-item:hover, .obj-item:hover { background: rgba(56,189,248,0.15) !important; }
    .st-tab.active { background: rgba(56,189,248,0.25) !important; border-color: var(--ht-cyan) !important; color: var(--ht-cyan) !important; }
    .leaflet-popup-content-wrapper, .leaflet-popup-tip { background: var(--ht-bg) !important; border: 1px solid var(--ht-cyan) !important; }
    .pro-bar { position: absolute; top: 14px; right: 14px; z-index: 1000; display: flex; gap: 6px; flex-wrap: wrap; }
    .pro-btn { padding: 7px 11px; border-radius: 6px; font-size: 11px; font-weight: 600; cursor: pointer; text-transform: uppercase; }
    .analytics-box { position: absolute; bottom: 20px; right: 14px; z-index: 1000; width: 290px; border-radius: 8px; padding: 14px; }
    .kpi-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px; margin-bottom: 10px; text-align: center; }
    .kpi-card { padding: 6px 4px; border-radius: 6px; border: 1px solid var(--ht-border); }
    .kpi-val { font-size: 16px; font-weight: 700; font-family: monospace; }
    .kpi-lbl { font-size: 10px; color: #94a3b8; text-transform: uppercase; }
    .status-tabs { display: flex; gap: 4px; padding: 8px 14px 0; }
    .st-tab { flex: 1; padding: 4px; font-size: 11px; border-radius: 6px; cursor: pointer; }
    .obj-list { max-height: 160px; overflow-y: auto; border-top: 1px solid var(--ht-border); margin-top: 6px; padding: 6px 14px; }
    .obj-item { padding: 5px 6px; font-size: 12px; border-radius: 6px; cursor: pointer; display: flex; justify-content: space-between; }
    .btn-3d { display: block; width: 100%; margin-top: 10px; padding: 8px; background: linear-gradient(90deg, #0284c7, #38bdf8); color: #fff; border: none; border-radius: 6px; font-weight: 700; font-size: 12px; cursor: pointer; text-transform: uppercase; }
    #modal3d { position: fixed; inset: 0; z-index: 9999; background: rgba(5, 9, 20, 0.88); backdrop-filter: blur(8px); display: none; align-items: center; justify-content: center; }
    #modal3d-box { width: 92vw; height: 82vh; background: #090e1c; border: 1px solid #38bdf8; border-radius: 12px; overflow: hidden; position: relative; }
    #map3d { width: 100%; height: 100%; }
    #close3d { position: absolute; top: 12px; right: 12px; z-index: 10; padding: 8px 14px; background: rgba(9,14,28,0.92); color: #38bdf8; border: 1px solid #38bdf8; border-radius: 6px; cursor: pointer; font-weight: 700; }
    #title3d { position: absolute; top: 12px; left: 12px; z-index: 10; padding: 8px 12px; background: rgba(9,14,28,0.88); color: #fff; border-left: 3px solid #38bdf8; border-radius: 4px; font-size: 13px; font-weight: 600; max-width: 65%; }
  `;
  document.head.appendChild(style);
  const regions = [
    { name: 'Вся Сибирь', coords: [61.5, 81.5], zoom: 4 },
    { name: 'ЯНАО // ХМАО', coords: [64.5, 73.5], zoom: 5 },
    { name: 'Кузбасс // КАТЭК', coords: [55.2, 87.5], zoom: 6 },
    { name: 'Горная Шория', coords: [53.2, 87.8], zoom: 7 }
  ];
  const topBar = document.createElement('div');
  topBar.className = 'pro-bar';
  regions.forEach(r => {
    const b = document.createElement('button');
    b.className = 'pro-btn';
    b.textContent = r.name;
    b.onclick = () => map.flyTo(r.coords, r.zoom, { duration: 1.2 });
    topBar.appendChild(b);
  });
  document.body.appendChild(topBar);

  const panel = document.querySelector('.control-panel');
  const statusWrap = document.createElement('div');
  statusWrap.className = 'status-tabs';
  let statusMode = 'all';
  [['all','Все'],['active','Действующие'],['reserve','Резерв']].forEach(([val, txt]) => {
    const btn = document.createElement('button');
    btn.className = 'st-tab' + (val === 'all' ? ' active' : '');
    btn.textContent = txt;
    btn.onclick = () => { statusMode = val; statusWrap.querySelectorAll('.st-tab').forEach(x => x.classList.remove('active')); btn.classList.add('active'); enhancedUpdate(); };
    statusWrap.appendChild(btn);
  });
  panel.insertBefore(statusWrap, document.querySelector('.filter-actions'));

  const objList = document.createElement('div');
  objList.className = 'obj-list';
  panel.appendChild(objList);

  const box = document.createElement('div');
  box.className = 'analytics-box';
  box.innerHTML = `<div class="kpi-grid"><div class="kpi-card"><div class="kpi-val" id="kpiTotal">0</div><div class="kpi-lbl">Всего</div></div><div class="kpi-card"><div class="kpi-val" id="kpiAct" style="color:#10b981">0</div><div class="kpi-lbl">В работе</div></div><div class="kpi-card"><div class="kpi-val" id="kpiRes" style="color:#f59e0b">0</div><div class="kpi-lbl">Резерв</div></div></div><canvas id="resChart" height="150"></canvas>`;
  document.body.appendChild(box);

  const modal = document.createElement('div');
  modal.id = 'modal3d';
  modal.innerHTML = `<div id="modal3d-box"><div id="title3d"></div><button id="close3d">✕ Закрыть 3D</button><div id="map3d"></div></div>`;
  document.body.appendChild(modal);

  let map3d = null, animId = null;

  document.getElementById('close3d').onclick = () => {
    modal.style.display = 'none';
    cancelAnimationFrame(animId);
    if (map3d) { map3d.remove(); map3d = null; }
  };

  window.openDeposit3D = function(name, lat, lng) {
    modal.style.display = 'flex';
    document.getElementById('title3d').textContent = `3D-сцена: ${name}`;
    if (!window.maplibregl) {
      document.getElementById('map3d').innerHTML = `<iframe src="https://openstreetmap.org{lng-0.15},${lat-0.1},${lng+0.15},${lat+0.1}&layer=mapnik&marker=${lat},${lng}" style="width:100%;height:100%;border:none;"></iframe>`;
      return;
    }
    map3d = new maplibregl.Map({
      container: 'map3d',
      center: [lng, lat],
      zoom: 12.5,
      pitch: 65,
      bearing: -25,
      style: {
        version: 8,
        sources: {
          sat: { type: 'raster', tiles: ['https://arcgisonline.com{z}/{y}/{x}'], tileSize: 256 },
          dem: { type: 'raster-dem', tiles: ['https://amazonaws.com{z}/{x}/{y}.png'], encoding: 'terrarium', tileSize: 256 }
        },
        layers: [{ id: 'sat-layer', type: 'raster', source: 'sat' }],
        terrain: { source: 'dem', exaggeration: 2.0 }
      }
    });
    new maplibregl.Marker({ color: '#38bdf8' }).setLngLat([lng, lat]).addTo(map3d);
    map3d.on('load', () => {
      function spin(t) {
        if (!map3d) return;
        map3d.rotateTo((t / 130) % 360, { duration: 0 });
        animId = requestAnimationFrame(spin);
      }
      spin(0);
      map3d.on('mousedown', () => cancelAnimationFrame(animId));
      map3d.on('touchstart', () => cancelAnimationFrame(animId));
    });
  };

  map.on('popupopen', function(e) {
    const latlng = e.popup.getLatLng();
    const content = e.popup.getElement().querySelector('.popup-body');
    const titleEl = e.popup.getElement().querySelector('.popup-header');
    if (content && !content.querySelector('.btn-3d')) {
      const name = titleEl ? titleEl.textContent : 'Месторождение';
      const btn = document.createElement('button');
      btn.className = 'btn-3d';
      btn.textContent = '🌐 Открыть в 3D';
      btn.onclick = () => openDeposit3D(name, latlng.lat, latlng.lng);
      content.appendChild(btn);
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

      const row = document.createElement('div');
      row.className = 'obj-item';
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
  chartScript.onload = enhancedUpdate;
  enhancedUpdate();
})();
