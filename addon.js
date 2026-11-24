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

  let rotY = 0.65, rotX = 0.42, drag = false, lx = 0, ly = 0, anim3d = null, curCol = '#38bdf8', curType = '', curName = '';
  const P = Array.of;

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
    if (!drag) rotY += 0.004;

    const proj = (x, y, z) => {
      const x1 = x * Math.cos(rotY) - z * Math.sin(rotY);
      const z1 = x * Math.sin(rotY) + z * Math.cos(rotY);
      const y2 = y * Math.cos(rotX) - z1 * Math.sin(rotX);
      const z2 = y * Math.sin(rotX) + z1 * Math.cos(rotX);
      const s = 440 / (440 + z2);
      return P(w * 0.38 + x1 * s, h * 0.54 + y2 * s);
    };

    const faces = P(P(0,1,2,3), P(4,5,6,7), P(0,1,5,4), P(1,2,6,5), P(2,3,7,6), P(3,0,4,7));

    const drawBox = (x1, x2, y1, y2, z1, z2, fill, stroke, lw = 1.1) => {
      const pts = P(P(x1,y1,z1),P(x2,y1,z1),P(x2,y1,z2),P(x1,y1,z2),P(x1,y2,z1),P(x2,y2,z1),P(x2,y2,z2),P(x1,y2,z2)).map(p => proj(...p));
      ctx.fillStyle = fill; ctx.strokeStyle = stroke; ctx.lineWidth = lw;
      faces.forEach(f => {
        ctx.beginPath();
        f.forEach((idx, i) => i ? ctx.lineTo(...pts[idx]) : ctx.moveTo(...pts[idx]));
        ctx.closePath(); ctx.fill(); ctx.stroke();
      });
    };

    const line3D = (a, b, col, lw = 1.5) => {
      const p1 = proj(...a), p2 = proj(...b);
      ctx.strokeStyle = col; ctx.lineWidth = lw;
      ctx.beginPath(); ctx.moveTo(...p1); ctx.lineTo(...p2); ctx.stroke();
    };

    const sz = 76;
    drawBox(-sz, sz, 35, 68, -sz, sz, 'rgba(30,41,59,0.55)', '#475569');
    drawBox(-sz, sz, 5, 35, -sz, sz, curCol + '55', curCol);
    drawBox(-sz, sz, -42, 5, -sz, sz, 'rgba(100,116,139,0.28)', '#64748b');
    drawBox(-sz, sz, -64, -42, -sz, sz, 'rgba(34,197,94,0.24)', '#22c55e');

    drawBox(-26, 26, -69, -64, -22, 22, 'rgba(56,189,248,0.28)', '#38bdf8', 1.2);
    drawBox(11, 23, -78, -69, -12, 12, 'rgba(148,163,184,0.38)', '#94a3b8', 1);

    const legs = P(P(-12,-69,-12), P(12,-69,-12), P(12,-69,12), P(-12,-69,12));
    const tops = P(P(-3.5,-138,-3.5), P(3.5,-138,-3.5), P(3.5,-138,3.5), P(-3.5,-138,3.5));
    for (let i = 0; i < 4; i++) {
      const ni = (i + 1) % 4;
      const a = legs.at(i), b = legs.at(ni), ta = tops.at(i), tb = tops.at(ni);
      line3D(a, ta, '#e2e8f0', 1.8);
      line3D(ta, tb, '#38bdf8', 1.5);
      const m1 = P(a.at(0) * 0.65, -103, a.at(2) * 0.65);
      const m2 = P(b.at(0) * 0.65, -103, b.at(2) * 0.65);
      line3D(m1, m2, '#38bdf8', 1.1);
      line3D(a, m2, 'rgba(56,189,248,0.5)', 0.9);
    }

    const crown = proj(0, -143, 0);
    ctx.fillStyle = '#38bdf8'; ctx.beginPath(); ctx.arc(crown.at(0), crown.at(1), 3.5, 0, Math.PI * 2); ctx.fill();

    ctx.setLineDash(P(4, 3));
    line3D(P(0, -138, 0), P(0, 20, 0), curCol, 2.5);
    ctx.setLineDash(P());
    const tip = proj(0, 20, 0);
    ctx.fillStyle = curCol; ctx.beginPath(); ctx.arc(tip.at(0), tip.at(1), 4, 0, Math.PI * 2); ctx.fill();

    const layers = P(
      P(-53, 'Почва / тайга', '#22c55e'),
      P(-19, 'Осадочные породы', '#94a3b8'),
      P(20, `Пласт: ${curType}`, curCol),
      P(52, 'Фундамент', '#64748b')
    );

    ctx.font = 'bold 11px sans-serif';
    layers.forEach(([my, txt, col]) => {
      const corners = P(P(-sz,my,-sz), P(sz,my,-sz), P(sz,my,sz), P(-sz,my,sz)).map(p => proj(...p));
      const rp = corners.reduce((a, b) => b.at(0) > a.at(0) ? b : a);
      const rx = rp.at(0), ry = rp.at(1);
      const lx2 = Math.min(w - 115, rx + 18);
      ctx.strokeStyle = col; ctx.lineWidth = 1.2;
      ctx.beginPath(); ctx.moveTo(rx, ry); ctx.lineTo(lx2, ry); ctx.stroke();
      ctx.fillStyle = col; ctx.beginPath(); ctx.arc(rx, ry, 2.5, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = 'rgba(9,14,28,0.85)'; ctx.fillRect(lx2 + 3, ry - 9, 110, 16);
      ctx.fillStyle = '#f8fafc'; ctx.fillText(txt.slice(0, 17), lx2 + 6, ry + 3);
    });

    ctx.fillStyle = '#e2e8f0'; ctx.font = '12px monospace';
    ctx.fillText(`ОБЪЕКТ: ${curName}`, 16, h - 52);
    ctx.fillStyle = curCol;
    ctx.fillText(`ГЛУБИНА ЗАЛЕГАНИЯ: ~${curType.includes('нефть') || curType.includes('газ') ? '2400 м' : '450 м'}`, 16, h - 34);
    ctx.fillStyle = '#94a3b8';
    ctx.fillText('Потяните пальцем для вращения 3D-разреза', 16, h - 16);

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
  const wiki = 'https://upload.' + 'wikimedia.org/wikipedia/commons/thumb/';
  const exactPhotos = {
    'Самотлорское': wiki + 'a/a7/%D0%A4%D0%BE%D1%82%D0%BE_%D0%A1%D0%B0%D0%BC%D0%BE%D1%82%D0%BB%D0%BE%D1%80%D0%B0_%D1%81_%D0%B2%D0%BE%D0%B7%D0%B4%D1%83%D1%85%D0%B0.jpg/640px-%D0%A4%D0%BE%D1%82%D0%BE_%D0%A1%D0%B0%D0%BC%D0%BE%D1%82%D0%BB%D0%BE%D1%80%D0%B0_%D1%81_%D0%B2%D0%BE%D0%B7%D0%B4%D1%83%D1%85%D0%B0.jpg',
    'Уренгойское': wiki + '6/6b/%D0%A3%D1%80%D0%B5%D0%BD%D0%B3%D0%BE%D0%B9%D1%81%D0%BA%D0%B0%D1%8F_%D0%93%D0%A0%D0%AD%D0%A1.jpg/640px-%D0%A3%D1%80%D0%B5%D0%BD%D0%B3%D0%BE%D0%B9%D1%81%D0%BA%D0%B0%D1%8F_%D0%93%D0%A0%D0%AD%D0%A1.jpg',
    'Ямбургское': wiki + '4/4c/Jamburg_Ansicht.JPG/640px-Jamburg_Ansicht.JPG'
  };

  const catPhotos = {
    'нефть': wiki + 'a/a7/%D0%A4%D0%BE%D1%82%D0%BE_%D0%A1%D0%B0%D0%BC%D0%BE%D1%82%D0%BB%D0%BE%D1%80%D0%B0_%D1%81_%D0%B2%D0%BE%D0%B7%D0%B4%D1%83%D1%85%D0%B0.jpg/640px-%D0%A4%D0%BE%D1%82%D0%BE_%D0%A1%D0%B0%D0%BC%D0%BE%D1%82%D0%BB%D0%BE%D1%80%D0%B0_%D1%81_%D0%B2%D0%BE%D0%B7%D0%B4%D1%83%D1%85%D0%B0.jpg',
    'нефть и газ': wiki + '4/4c/Jamburg_Ansicht.JPG/640px-Jamburg_Ansicht.JPG',
    'газ': wiki + '6/6b/%D0%A3%D1%80%D0%B5%D0%BD%D0%B3%D0%BE%D0%B9%D1%81%D0%BA%D0%B0%D1%8F_%D0%93%D0%A0%D0%AD%D0%A1.jpg/640px-%D0%A3%D1%80%D0%B5%D0%BD%D0%B3%D0%BE%D0%B9%D1%81%D0%BA%D0%B0%D1%8F_%D0%93%D0%A0%D0%AD%D0%A1.jpg',
    'уголь': wiki + 'c/c5/BelAZ_75600.JPG/640px-BelAZ_75600.JPG',
    'железная руда': wiki + '8/87/Mining_in_Mezhdurechensk.jpg/640px-Mining_in_Mezhdurechensk.jpg'
  };
  const defPhoto = wiki + '8/87/Mining_in_Mezhdurechensk.jpg/640px-Mining_in_Mezhdurechensk.jpg';

  map.on('popupopen', e => {
    const body = e.popup.getElement().querySelector('.popup-body');
    const title = e.popup.getElement().querySelector('.popup-header');
    if (!body || body.querySelector('.popup-img')) return;
    const name = title ? title.textContent.trim() : '';
    const d = depositsData.find(x => x.n === name);
    const imgUrl = (d && d.img) || exactPhotos[name] || (d && catPhotos[d.c]) || defPhoto;

    const img = document.createElement('img');
    img.className = 'popup-img';
    img.src = imgUrl;
    img.alt = name;
    img.style.cssText = 'width:100%;height:125px;object-fit:cover;border-radius:6px;margin-bottom:9px;border:1px solid rgba(56,189,248,0.35);display:block;';
    img.onerror = () => img.style.display = 'none';
    body.insertBefore(img, body.firstChild);
  });
      const P = Array.of;
  const world = P(P(90, -180), P(90, 180), P(-90, 180), P(-90, -180));
  const pts = depositsData.map(d => P(d.lat, d.lng)).sort((a, b) => a.at(1) - b.at(1) || a.at(0) - b.at(0));
  const cross = (o, a, b) => (a.at(1) - o.at(1)) * (b.at(0) - o.at(0)) - (a.at(0) - o.at(0)) * (b.at(1) - o.at(1));
  const low = P(), up = P();
  pts.forEach(p => { while (low.length >= 2 && cross(low.at(-2), low.at(-1), p) <= 0) low.pop(); low.push(p); });
  for (let i = pts.length - 1; i >= 0; i--) {
    const p = pts.at(i);
    while (up.length >= 2 && cross(up.at(-2), up.at(-1), p) <= 0) up.pop();
    up.push(p);
  }
  const hull = low.slice(0, -1).concat(up.slice(0, -1));
  const cLat = hull.reduce((s, p) => s + p.at(0), 0) / hull.length;
  const cLng = hull.reduce((s, p) => s + p.at(1), 0) / hull.length;
  const westSiberia = hull.map(p => {
    const dLat = p.at(0) - cLat;
    const dLng = (p.at(1) - cLng) * Math.cos(p.at(0) * Math.PI / 180);
    const a = Math.atan2(dLat, dLng);
    const padLat = Math.sin(a) * 1.8;
    const padLng = (Math.cos(a) * 1.8) / Math.cos(p.at(0) * Math.PI / 180);
    return P(p.at(0) + padLat, p.at(1) + padLng);
  });

  L.polygon(P(world, westSiberia), {
    color: '#38bdf8',
    weight: 2,
    fillColor: '#090e1c',
    fillOpacity: 0.72,
    interactive: false
  }).addTo(map);


})();
