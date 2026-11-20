(function() {
  // Подключаем библиотеку графиков Chart.js
  const chartScript = document.createElement('script');
  chartScript.src = 'https://jsdelivr.net';
  document.head.appendChild(chartScript);

  // Стили для нового интерфейса и тёмной темы
  const style = document.createElement('style');
  style.textContent = `
    .pro-bar { position: absolute; top: 14px; right: 60px; z-index: 1000; display: flex; gap: 6px; flex-wrap: wrap; max-width: calc(100vw - 430px); }
    .pro-btn { padding: 7px 11px; border-radius: 8px; border: 1px solid rgba(0,0,0,0.12); background: rgba(255,255,255,0.95); color: #1e293b; font-size: 12px; font-weight: 600; cursor: pointer; box-shadow: 0 2px 10px rgba(0,0,0,0.1); transition: 0.15s; }
    .pro-btn:hover { background: #2563eb; color: #fff; }
    .analytics-box { position: absolute; bottom: 20px; right: 14px; z-index: 1000; width: 290px; background: rgba(255,255,255,0.96); backdrop-filter: blur(8px); border-radius: 12px; padding: 14px; box-shadow: 0 6px 24px rgba(0,0,0,0.16); border: 1px solid rgba(0,0,0,0.08); }
    .kpi-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px; margin-bottom: 10px; text-align: center; }
    .kpi-card { background: #f1f5f9; padding: 6px 4px; border-radius: 8px; }
    .kpi-val { font-size: 16px; font-weight: 700; color: #0f172a; }
    .kpi-lbl { font-size: 10px; color: #64748b; text-transform: uppercase; }
    .status-tabs { display: flex; gap: 4px; padding: 8px 14px 0; }
    .st-tab { flex: 1; padding: 4px; font-size: 11px; border: 1px solid #cbd5e1; background: #fff; border-radius: 6px; cursor: pointer; }
    .st-tab.active { background: #1e293b; color: #fff; border-color: #1e293b; }
    .obj-list { max-height: 160px; overflow-y: auto; border-top: 1px solid #e2e8f0; margin-top: 6px; padding: 6px 14px; }
    .obj-item { padding: 5px 6px; font-size: 12px; border-radius: 6px; cursor: pointer; display: flex; justify-content: space-between; align-items: center; }
    .obj-item:hover { background: #eff6ff; color: #1d4ed8; }
    body.dark-theme .control-panel, body.dark-theme .analytics-box, body.dark-theme .pro-btn { background: rgba(15, 23, 42, 0.94); color: #f8fafc; border-color: #334155; }
    body.dark-theme .filter-label, body.dark-theme .kpi-val { color: #f8fafc; }
    body.dark-theme .kpi-card, body.dark-theme .filter-actions { background: #1e293b; }
    body.dark-theme .filter-item:hover, body.dark-theme .obj-item:hover { background: #334155; }
    body.dark-theme input { background: #1e293b; color: #fff; border-color: #475569; }
  `;
  document.head.appendChild(style);

  // Верхняя панель быстрой навигации по регионам и смены темы
  const regions = [
    { name: '🌍 Вся Сибирь', coords: [61.5, 81.5], zoom: 4 },
    { name: '🛢️ ЯНАО и ХМАО', coords: [64.5, 73.5], zoom: 5 },
    { name: '⛏️ Кузбасс и КАТЭК', coords: [55.2, 87.5], zoom: 6 },
    { name: '⛰️ Горная Шория', coords: [53.2, 87.8], zoom: 7 }
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
  const themeBtn = document.createElement('button');
  themeBtn.className = 'pro-btn';
  themeBtn.textContent = '🌙 Тема';
  themeBtn.onclick = () => document.body.classList.toggle('dark-theme');
  topBar.appendChild(themeBtn);
  document.body.appendChild(topBar);

  // Фильтр по статусу и список объектов в левую панель
  const panel = document.querySelector('.control-panel');
  const statusWrap = document.createElement('div');
  statusWrap.className = 'status-tabs';
  let statusMode = 'all';
  [['all','Все'],['active','Действующие'],['reserve','Резерв / Прочие']].forEach(([val, txt]) => {
    const btn = document.createElement('button');
    btn.className = 'st-tab' + (val === 'all' ? ' active' : '');
    btn.textContent = txt;
    btn.onclick = () => {
      statusMode = val;
      statusWrap.querySelectorAll('.st-tab').forEach(x => x.classList.remove('active'));
      btn.classList.add('active');
      enhancedUpdate();
    };
    statusWrap.appendChild(btn);
  });
  panel.insertBefore(statusWrap, document.querySelector('.filter-actions'));

  const objList = document.createElement('div');
  objList.className = 'obj-list';
  panel.appendChild(objList);

  // Правая панель аналитики с графиком
  const box = document.createElement('div');
  box.className = 'analytics-box';
  box.innerHTML = `
    <div class="kpi-grid">
      <div class="kpi-card"><div class="kpi-val" id="kpiTotal">0</div><div class="kpi-lbl">Всего</div></div>
      <div class="kpi-card"><div class="kpi-val" id="kpiAct" style="color:#10b981">0</div><div class="kpi-lbl">В работе</div></div>
      <div class="kpi-card"><div class="kpi-val" id="kpiRes" style="color:#f59e0b">0</div><div class="kpi-lbl">Резерв</div></div>
    </div>
    <canvas id="resChart" height="150"></canvas>
  `;
  document.body.appendChild(box);

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
      row.onclick = () => {
        map.flyTo([data.lat, data.lng], 8, { duration: 1.2 });
        setTimeout(() => marker.openPopup(), 1250);
      };
      objList.appendChild(row);
    });

    statsText.textContent = `Показано: ${total} из ${depositsData.length}`;
    document.getElementById('kpiTotal').textContent = total;
    document.getElementById('kpiAct').textContent = act;
    document.getElementById('kpiRes').textContent = res;

    if (window.Chart) {
      const ctx = document.getElementById('resChart').getContext('2d');
      if (myChart) myChart.destroy();
      myChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: Object.keys(catCounts),
          datasets: [{
            data: Object.values(catCounts),
            backgroundColor: Object.keys(catCounts).map(c => (categoryStyles[c] && categoryStyles[c].color) || '#2563eb'),
            borderWidth: 1
          }]
        },
        options: { plugins: { legend: { display: false } }, cutout: '62%' }
      });
    }
  }

  // Переопределяем стандартное обновление на расширенное
  window.updateMap = enhancedUpdate;
  searchInput.removeEventListener('input', updateMap);
  searchInput.addEventListener('input', enhancedUpdate);
  document.querySelectorAll('#filtersList input').forEach(cb => {
    cb.onchange = () => { cb.checked ? activeCategories.add(cb.value) : activeCategories.delete(cb.value); enhancedUpdate(); };
  });
  chartScript.onload = enhancedUpdate;
  enhancedUpdate();
})();
