(function() {
  const s = document.createElement('style');
  s.textContent = `
    :root { --bg: rgba(9,14,28,0.88); --card: rgba(15,23,42,0.94); --cy: #38bdf8; --bd: rgba(56,189,248,0.3); --tx: #e2e8f0; }
    .leaflet-tile-pane { filter: brightness(80%) contrast(110%); }
    .control-panel, .analytics-box, .pro-btn { background: var(--bg) !important; backdrop-filter: blur(12px) !important; border: 1px solid var(--bd) !important; color: var(--tx) !important; }
    .panel-header { background: linear-gradient(90deg, rgba(56,189,248,0.16), transparent) !important; border-bottom: 1px solid var(--bd) !important; }
    .panel-stats, .popup-row strong, .popup-link { color: var(--cy) !important; }
    .search-box input, .filter-actions button, .st-tab, .kpi-card { background: var(--card) !important; border-color: var(--bd) !important; color: #fff !important; }
    .filter-label, .popup-card, .popup-desc { color: var(--tx) !important; }
    .leaflet-popup-content-wrapper, .leaflet-popup-tip { background: var(--bg) !important; border: 1px solid var(--cy) !important; }
    .pro-bar { position: absolute; top: 14px; right: 14px; z-index: 1000; display: flex; gap: 6px; flex-wrap: wrap; }
    .pro-btn { padding: 7px 11px; border-radius: 6px; font-size: 11px; font-weight: 600; cursor: pointer; }
    .btn-3d { display: block; width: 100%; margin-top: 10px; padding: 8px; background: linear-gradient(90deg, #0284c7, #38bdf8); color: #fff; border: none; border-radius: 6px; font-weight: 700; cursor: pointer; }
    #m3d { position: fixed; inset: 0; z-index: 9999; background: rgba(5,9,20,0.92); display: none; align-items: center; justify-content: center; }
    #m3d-box { width: 92vw; height: 82vh; background: #050914; border: 1px solid #38bdf8; border-radius: 12px; overflow: hidden; position: relative; perspective: 800px; }
    #map3d { width: 100%; height: 100%; transform: rotateX(34deg) scale(1.35); transform-origin: center 65%; }
    #c3d { position: absolute; top: 12px; right: 12px; z-index: 20; padding: 8px 14px; background: #090e1c; color: #38bdf8; border: 1px solid #38bdf8; border-radius: 6px; font-weight: 700; cursor: pointer; }
    #t3d { position: absolute; top: 12px; left: 12px; z-index: 20; padding: 8px 12px; background: rgba(9,14,28,0.88); color: #fff; border-left: 3px solid #38bdf8; border-radius: 4px; font-size: 12px; font-weight: 600; }
  `;
  document.head.appendChild(s);

  const bar = document.createElement('div'); bar.className = 'pro-bar';
  [['Вся Сибирь',[61.5,81.5],4],['ЯНАО // ХМАО',[64.5,73.5],5],['Кузбасс',[55.2,87.5],6],['Горная Шория',[53.2,87.8],7]].forEach(([n,c,z]) => {
    const b = document.createElement('button'); b.className = 'pro-btn'; b.textContent = n;
    b.onclick = () => map.flyTo(c, z, { duration: 1.2 }); bar.appendChild(b);
  });
  document.body.appendChild(bar);

  const m = document.createElement('div'); m.id = 'm3d';
  m.innerHTML = `<div id="m3d-box"><div id="t3d"></div><button id="c3d">✕ Закрыть 3D</button><div id="map3d"></div></div>`;
  document.body.appendChild(m);
  let m3 = null;
  document.getElementById('c3d').onclick = () => { m.style.display = 'none'; if (m3) { m3.remove(); m3 = null; } };

  const arc = 'https://server.' + '://arcgisonline.com{z}/{y}/{x}';

  map.on('popupopen', e => {
    const ll = e.popup.getLatLng(), body = e.popup.getElement().querySelector('.popup-body');
    const title = e.popup.getElement().querySelector('.popup-header');
    if (body && !body.querySelector('.btn-3d')) {
      const btn = document.createElement('button'); btn.className = 'btn-3d'; btn.textContent = '🌐 Открыть в 3D';
      btn.onclick = () => {
        m.style.display = 'flex';
        document.getElementById('t3d').textContent = `3D-обзор: ${title ? title.textContent : 'Объект'}`;
        setTimeout(() => {
          m3 = L.map('map3d', { zoomControl: false }).setView([ll.lat, ll.lng], 14);
          L.tileLayer(arc).addTo(m3);
          L.circle([ll.lat, ll.lng], { radius: 800, color: '#38bdf8', fillColor: '#38bdf8', fillOpacity: 0.2 }).addTo(m3);
          L.circleMarker([ll.lat, ll.lng], { radius: 7, color: '#fff', fillColor: '#38bdf8', fillOpacity: 1 }).addTo(m3);
        }, 50);
      };
      body.appendChild(btn);
    }
  });
})();
