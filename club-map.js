function initBootcampMap() {
  'use strict';
  const root = document.getElementById('clubMap');
  const data = window.BOOTCAMP_MAP_DATA;
  if (!root || !data) return;
  root.replaceChildren();
  root.className = 'bc-map';
  const assets = root.dataset.assets || 'images/';
  const names = {standard:'Standart','standard-plus':'Standart +',office:'office',vip1:'VIP 1',vip2:'VIP 2',vip3:'VIP 3'};
  const zones = Object.fromEntries(data.zones.map(z => [z.slug,z]));
  const images = {standard:'floor2','standard-plus':'floor2',vip1:'vip1',vip2:'vip2',vip3:'vip3',office:'office1'};
  let current = null, room = 0, details = false, pc = null, filter = 'all';
  const money = n => new Intl.NumberFormat('ru-RU').format(n);
  const esc = s => String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const asset = key => `${assets}${key}.webp?v=20261002-mobile`;
  root.innerHTML = `<header class="bc-topbar"><div><strong>Карта клуба</strong><small>61 компьютер · 6 залов</small></div><nav class="bc-tabs" aria-label="Выбор этажа"><button class="bc-tab" data-filter="all" aria-pressed="true">Все залы</button><button class="bc-tab" data-filter="first" aria-pressed="false">1 этаж</button><button class="bc-tab" data-filter="second" aria-pressed="false">2 этаж</button></nav></header><div class="bc-overview"><div class="bc-map-grid"></div><p class="bc-overview-note">Нажми на зал, чтобы приблизить его. Ещё одно нажатие — характеристики и тарифы.</p></div><section class="bc-view" hidden aria-label="Выбранный зал"></section>`;
  const overview=root.querySelector('.bc-overview'),grid=root.querySelector('.bc-map-grid'),view=root.querySelector('.bc-view');
  function overviewRender(){
    const keys=filter==='second'?['standard','standard-plus']:filter==='first'?['vip1','vip2','vip3','office']:['vip1','vip2','vip3','office','floor2'];
    grid.innerHTML=keys.map(key=>{
      const floor=key==='floor2',office=key==='office',z=zones[key];
      const image=office?`<div class="bc-office-strip">${[1,2,3].map(n=>`<img src="${asset('office'+n)}" alt="Офис, комната ${n}" loading="lazy">`).join('')}</div>`:`<img src="${asset(floor?'floor2':images[key])}" alt="${floor?'Второй этаж':names[key]}" loading="lazy">`;
      return `<button class="bc-tile ${office?'bc-office-tile':''} ${floor||key.startsWith('standard')?'bc-floor-tile':''}" data-zone="${floor?'standard-plus':key}"><div class="bc-tile-image">${image}</div><div class="bc-tile-caption"><div><strong>${floor?'Standart / Standart +':names[key]}</strong><small>${floor?'2 этаж':office?'3 комнаты · 20 компьютеров':z.numbers.length+' компьютеров'}</small></div><span class="bc-price">${floor?'от 800':money(z.price)} ₸ / час</span></div></button>`;
    }).join('');
  }
  function officeNumbers(){return room===0?[29,30,31,32,33]:room===1?[34,35,36,37,38,39,40,41,42,43]:[44,45,46,47,48]}
  function renderView(){
    const z=zones[current],floor=current.startsWith('standard');
    const image=current==='office'?'office'+(room+1):images[current];
    const numbers=current==='office'?officeNumbers():[...z.numbers].sort((a,b)=>a-b);
    const floorMarkers=floor?`<div class="bc-floor-choices" aria-label="Зоны второго этажа"><button class="bc-floor-marker bc-floor-marker-standard" data-switch="standard" aria-label="Открыть Standart">Standart →</button><button class="bc-floor-marker bc-floor-marker-plus" data-switch="standard-plus" aria-label="Открыть Standart плюс">← Standart +</button></div>`:'';
    view.dataset.zone=current;
    view.innerHTML=`<div class="bc-view-header"><div><h2 class="bc-view-title">${names[current]}</h2><div class="bc-view-sub">${current==='office'?'Три комнаты — один зал':floor?'Второй этаж':z.numbers.length+' игровых мест'}</div></div><button class="bc-back" data-back>← Все залы</button></div>
    ${current==='office'?`<nav class="bc-room-tabs" aria-label="Комнаты office">${['Первая комната','Вторая комната','Третья комната'].map((n,i)=>`<button class="bc-room-tab" data-room="${i}" aria-pressed="${i===room}">${n}</button>`).join('')}</nav>`:''}
    <div class="bc-view-body ${details?'with-details':''}"><div class="bc-scene"><button class="bc-image-button" data-details aria-label="Открыть характеристики и тарифы ${names[current]}"><img src="${asset(image)}" alt="${names[current]}${current==='office'?', комната '+(room+1):''}"></button>${floorMarkers}<span class="bc-scene-label">${names[current]} · ${money(z.price)} ₸ / час</span></div>${details?renderDetails(z):''}</div>`;
  }
  function renderDetails(z){
    const fields={gpu:'Видеокарта',cpu:'Процессор',ram:'Память',monitor:'Монитор',mouse:'Мышь',keyboard:'Клавиатура',headset:'Наушники',chair:'Кресло'};
    return `<aside class="bc-details" aria-label="Характеристики и тарифы" aria-live="polite"><div class="bc-details-heading"><h3>${pc?'ПК '+pc:names[current]}</h3><button class="bc-close" data-close aria-label="Скрыть характеристики">×</button></div><div class="bc-big-price">${money(z.price)} ₸ <span>/ час</span></div><h4>Оборудование</h4><dl class="bc-specs">${Object.entries(fields).map(([k,label])=>`<div><dt>${label}</dt><dd>${esc(data.equipment[current][k])}</dd></div>`).join('')}</dl><h4>Все тарифы</h4><div class="bc-tariffs">${z.tariffs.map(t=>`<div class="bc-tariff"><small>${esc(t.label)}</small><strong>${esc(t.value)}</strong></div>`).join('')}</div></aside>`;
  }
  function openZone(key,button){
    const from=button?.querySelector('img');const rect=from?.getBoundingClientRect();const src=from?.src;
    current=key;room=0;details=true;pc=null;overview.hidden=true;view.hidden=false;renderView();
    if(innerWidth<761)root.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'start'});
    const target=view.querySelector('.bc-image-button img');
    if(rect&&src&&!matchMedia('(prefers-reduced-motion: reduce)').matches){
      const end=target.getBoundingClientRect(),fly=new Image();fly.src=src;fly.className='bc-flight';
      Object.assign(fly.style,{left:rect.left+'px',top:rect.top+'px',width:rect.width+'px',height:rect.height+'px'});document.body.append(fly);
      const a=fly.animate([{left:rect.left+'px',top:rect.top+'px',width:rect.width+'px',height:rect.height+'px',opacity:1},{left:end.left+'px',top:end.top+'px',width:end.width+'px',height:end.height+'px',opacity:1}],{duration:560,easing:'cubic-bezier(.2,.8,.2,1)'});
      a.finished.catch(()=>{}).finally(()=>fly.remove());
    }
  }
  root.addEventListener('click',e=>{
    const b=e.target.closest('button');if(!b||!root.contains(b))return;
    document.querySelectorAll('.bc-flight').forEach(f=>f.remove());
    if(b.dataset.filter){filter=b.dataset.filter;current=null;overview.hidden=false;view.hidden=true;root.querySelectorAll('[data-filter]').forEach(t=>t.setAttribute('aria-pressed',String(t===b)));overviewRender();}
    else if(b.dataset.zone)openZone(b.dataset.zone,b);
    else if(b.hasAttribute('data-back')){current=null;overview.hidden=false;view.hidden=true;grid.querySelector('button')?.focus();}
    else if(b.dataset.room!==undefined){room=Number(b.dataset.room);pc=null;renderView();}
    else if(b.dataset.switch){current=b.dataset.switch;pc=null;renderView();}
    else if(b.hasAttribute('data-close')){details=false;pc=null;renderView();view.querySelector('[data-details]').focus();}
    else if(b.hasAttribute('data-details')||b.dataset.pc){details=true;pc=null;renderView();if(innerWidth<761)view.querySelector('.bc-details').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'nearest'});}
  });
  window.addEventListener('resize',()=>document.querySelectorAll('.bc-flight').forEach(f=>f.remove()));
  root.addEventListener('keydown',e=>{if(e.key==='Escape'&&current){if(details){details=false;pc=null;renderView();}else{current=null;overview.hidden=false;view.hidden=true;} }});
  overviewRender();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',initBootcampMap);else initBootcampMap();

