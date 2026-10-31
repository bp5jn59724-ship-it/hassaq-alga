(() => {
  'use strict';
  const menu = window.MENU;
  const $ = (s, root = document) => root.querySelector(s);
  const $$ = (s, root = document) => [...root.querySelectorAll(s)];
  const esc = (s) => String(s).replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const money = n => new Intl.NumberFormat('ru-RU').format(n) + ' ₸';
  const normalize = s => s.toLocaleLowerCase('ru-RU').replace(/ё/g,'е').trim();
  const byId = new Map(menu.map(p => [p.id,p]));
  const storageKey = 'hassaq-cart-v1';
  const groups = [
    ['all','Всё меню'], ['cold','Холодные роллы'], ['baked','Запечённые'],
    ['fried','Темпура'], ['sets','Сеты суши'], ['sushi','Суши'],
    ['new','Новинки'], ['combo','Сеты на компанию'], ['extras','Добавки']
  ];
  const labels = Object.fromEntries(groups);
  const priority = ['Филадельфия ролл','Калифорния с креветкой','Сэндвич-Ролл','Сет на Двоих'];
  const orderedMenu = [...menu].sort((a,b) => {
    const ai = priority.indexOf(a.name), bi = priority.indexOf(b.name);
    if (ai >= 0 || bi >= 0) return (ai < 0 ? 999 : ai) - (bi < 0 ? 999 : bi);
    const groupRank = ['cold','baked','fried','sets','sushi','new','combo','extras'];
    return groupRank.indexOf(a.category) - groupRank.indexOf(b.category);
  });
  let category = 'all', query = '', sort = 'default', cart = {}, currentProduct = null, toastTimer;
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey) || '{}');
    if (saved && typeof saved === 'object' && !Array.isArray(saved)) {
      Object.entries(saved).forEach(([id,qty]) => {
        if (byId.has(id) && Number.isInteger(qty) && qty > 0 && qty <= 99) cart[id] = qty;
      });
    }
  } catch (_) {}
  const count = () => Object.values(cart).reduce((a,b) => a+b,0);
  const total = () => Object.entries(cart).reduce((sum,[id,qty]) => sum + byId.get(id).price * qty,0);
  function toast(message) {
    const el = $('.toast'); el.textContent = message; el.classList.add('show');
    clearTimeout(toastTimer); toastTimer = setTimeout(() => el.classList.remove('show'),2200);
  }
  function persist() { try { localStorage.setItem(storageKey,JSON.stringify(cart)); } catch (_) {} }
  function placeholder() { return '<div class="photo-placeholder"><span class="mark" aria-hidden="true">SS</span><small>HASSAQ · МЕНЮ</small></div>'; }
  function controls(p) {
    const qty = cart[p.id] || 0;
    if (!qty) return `<button class="add-button" data-add="${p.id}" aria-label="Добавить ${esc(p.name)} в корзину"><span class="add-label">Добавить</span><span aria-hidden="true">+</span></button>`;
    return `<div class="quantity"><button data-minus="${p.id}" aria-label="Уменьшить количество: ${esc(p.name)}">−</button><b aria-label="Количество: ${qty}">${qty}</b><button data-plus="${p.id}" aria-label="Увеличить количество: ${esc(p.name)}" ${qty >= 99 ? 'disabled' : ''}>+</button></div>`;
  }
  function showDialog(id) { const d = $('#'+id); d.showModal(); document.body.classList.add('modal-open'); }
  function closeDialog(id) { $('#'+id).close(); }
  $$('dialog').forEach(d => {
    d.addEventListener('close',() => { if (!$('dialog[open]')) document.body.classList.remove('modal-open'); });
    d.addEventListener('click',e => { if (e.target === d) { const r=d.getBoundingClientRect(); if (e.clientX<r.left || e.clientX>r.right || e.clientY<r.top || e.clientY>r.bottom) d.close(); } });
  });
  function renderCategories() {
    $('#categories').innerHTML = groups.map(([id,label]) => `<button class="category ${id===category?'active':''}" data-category="${id}" aria-pressed="${id===category}">${label}<sup>${id==='all'?menu.length:menu.filter(p=>p.category===id).length}</sup></button>`).join('');
  }
  function renderProducts() {
    const terms = normalize(query).split(/\s+/).filter(Boolean);
    let items = orderedMenu.filter(p => (category==='all'||p.category===category) && terms.every(term=>normalize(p.name+' '+p.description).includes(term)));
    if (sort==='asc') items.sort((a,b)=>a.price-b.price);
    if (sort==='desc') items.sort((a,b)=>b.price-a.price);
    if (sort==='name') items.sort((a,b)=>a.name.localeCompare(b.name,'ru'));
    $('#products').innerHTML = items.map(p=>`<article class="product-card">
      <button class="product-image" data-detail="${p.id}" aria-label="Подробнее: ${esc(p.name)}">
        ${p.image?`<img src="${p.image}" alt="${esc(p.name)}" loading="lazy" decoding="async" width="1024" height="1024">`:placeholder()}
        ${p.category==='new'?'<span class="tag">НОВИНКА</span>':p.category==='sets'?'<span class="tag">СЕТ СУШИ</span>':''}
      </button><p class="product-category">${labels[p.category]}</p>
      <button class="product-name" data-detail="${p.id}">${esc(p.name)}</button>
      ${p.description?`<p class="product-description">${esc(p.description)}</p>`:''}
      <div class="product-bottom"><span class="product-price">${money(p.price)}</span><div class="product-controls" data-id="${p.id}">${controls(p)}</div></div></article>`).join('');
    $('#results-count').textContent = `Блюда и добавки: ${items.length}`;
    $('#empty-search').hidden = items.length > 0;
    $('#clear-search').hidden = !query;
  }
  function syncUI() {
    const n=count();
    $$('[data-count]').forEach(el=>el.textContent=n);
    $$('[data-total]').forEach(el=>el.textContent=money(total()));
    $$('.product-controls').forEach(el=>el.innerHTML=controls(byId.get(el.dataset.id)));
    $('.mobile-cart').hidden = !n;
    document.body.classList.toggle('has-cart',!!n);
    if ($('#cart-dialog').open) renderCart();
    $('#checkout-status').textContent=''; $('#whatsapp-retry').hidden=true;
  }
  function changeQuantity(id,delta,announce=false) {
    if (!byId.has(id)) return;
    const next=(cart[id]||0)+delta;
    if (next>99) {toast('Максимум 99 порций одного блюда');return;}
    if (next<=0) delete cart[id]; else cart[id]=next;
    persist();syncUI();
    if (announce && delta>0) toast(`${byId.get(id).name} — в корзине`);
  }
  function openProduct(id) {
    const p=byId.get(id);if(!p)return;currentProduct=p;
    const extras=menu.filter(x=>x.category==='extras');
    $('#product-detail').innerHTML=`<div class="detail-layout"><div class="detail-photo">${p.image?`<img src="${p.image}" alt="${esc(p.name)}" width="1024" height="1024">`:placeholder()}</div><div class="detail-copy"><p class="eyebrow">${labels[p.category]}</p><h2 id="detail-name">${esc(p.name)}</h2>${p.description?`<p class="detail-description">${esc(p.description)}</p>`:''}<div class="detail-price">${money(p.price)}</div>${!['extras','combo'].includes(p.category)?`<div class="extras"><h3>Добавить к заказу</h3>${extras.map(x=>`<label class="extra-row"><input type="checkbox" value="${x.id}" name="extra"><span>${esc(x.name.replace(' для суши',''))}</span><span>+ ${money(x.price)}</span></label>`).join('')}</div>`:''}<button class="button primary" id="detail-add">В корзину · ${money(p.price)} <span aria-hidden="true">+</span></button><p class="detail-hint">Состав и аллергены уточняйте у ресторана.</p></div></div>`;
    showDialog('product-dialog');
  }
  function renderCart() {
    const entries=Object.entries(cart);
    $('#checkout-form').hidden=!entries.length;
    if (!entries.length) {
      $('#cart-content').innerHTML='<div class="cart-empty"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 8h14l1 13H4L5 8Z M8 9V6a4 4 0 0 1 8 0v3"/></svg><h3>Здесь будет вкусно</h3><p>Добавьте любимые блюда из меню.</p><button class="button primary" data-close="cart-dialog">Выбрать блюда ↗</button></div>';
      return;
    }
    $('#cart-content').innerHTML=entries.map(([id,qty])=>{const p=byId.get(id);return `<div class="cart-item">${p.image?`<img src="${p.image}" alt="${esc(p.name)}" width="65" height="65">`:'<span class="mini-placeholder" aria-hidden="true">H</span>'}<div><p class="cart-item-title">${esc(p.name)}</p>${controls(p)}</div><div class="cart-item-right"><strong>${money(p.price*qty)}</strong><button class="remove-item" data-remove="${id}" aria-label="Удалить ${esc(p.name)} из корзины">Удалить</button></div></div>`}).join('');
    $('#cart-subtotal').textContent=money(total());
    updateFulfillment();
  }
  function updateFulfillment() {
    const isDelivery=$('[name=fulfillment]:checked').value==='delivery';
    $('#address-field').hidden=!isDelivery;
    $('[name=address]').required=isDelivery;
    $('.delivery-summary').hidden=!isDelivery;
  }
  function selectCategory(id,scroll=false) {
    category=id;renderCategories();renderProducts();
    const button=$(`[data-category="${id}"]`);if(button) button.scrollIntoView({block:'nearest',inline:'nearest'});
    if(scroll)$('#menu').scrollIntoView({behavior:'smooth',block:'start'});
  }
  document.addEventListener('click',e=>{
    const target=e.target.closest('button');if(!target)return;
    if(target.dataset.close){closeDialog(target.dataset.close);return;}
    if(target.hasAttribute('data-open-cart')){renderCart();showDialog('cart-dialog');return;}
    if(target.dataset.detail){openProduct(target.dataset.detail);return;}
    if(target.dataset.feature){const p=menu.find(x=>x.name===target.dataset.feature);if(p)openProduct(p.id);return;}
    if(target.dataset.category){selectCategory(target.dataset.category);return;}
    if(target.dataset.quick){query='';$('#search').value='';selectCategory(target.dataset.quick,true);return;}
    const id=target.dataset.add||target.dataset.plus||target.dataset.minus;
    if(id){
      const inCart=!!target.closest('#cart-dialog');const minus=!!target.dataset.minus;
      changeQuantity(id,minus?-1:1,!!target.dataset.add);
      const root=inCart?$('#cart-dialog'):$('#products');
      const next=$(`[data-${minus?'minus':'plus'}="${id}"]`,root)||$(`[data-add="${id}"]`,root);
      if(next)next.focus({preventScroll:true});return;
    }
    if(target.dataset.remove){delete cart[target.dataset.remove];persist();syncUI();return;}
    if(target.id==='detail-add'&&currentProduct){
      if((cart[currentProduct.id]||0)>=99){toast('Максимум 99 порций одного блюда');return;}
      cart[currentProduct.id]=(cart[currentProduct.id]||0)+1;
      $$('input[name=extra]:checked').forEach(x=>{cart[x.value]=Math.min(99,(cart[x.value]||0)+1)});
      persist();syncUI();closeDialog('product-dialog');toast(`${currentProduct.name} — в корзине`);return;
    }
    if(target.id==='show-sets'){query='';$('#search').value='';selectCategory('sets',true);return;}
    if(target.id==='reset-filters'){query='';$('#search').value='';selectCategory('all');return;}
    if(target.id==='clear-search'){query='';$('#search').value='';renderProducts();$('#search').focus();}
  });
  $('#search').addEventListener('input',e=>{query=e.target.value;renderProducts()});
  $('#sort').addEventListener('change',e=>{sort=e.target.value;renderProducts()});
  $('#product-dialog').addEventListener('change',()=>{
    if(!currentProduct)return;
    const sum=currentProduct.price+$$('input[name=extra]:checked').reduce((n,x)=>n+byId.get(x.value).price,0);
    $('#detail-add').innerHTML=`В корзину · ${money(sum)} <span aria-hidden="true">+</span>`;
  });
  $$('[name=fulfillment]').forEach(x=>x.addEventListener('change',updateFulfillment));
  $('#checkout-form').addEventListener('input',()=>{ $('#checkout-status').textContent='';$('#whatsapp-retry').hidden=true; });
  $('[name=phone]').addEventListener('input',e=>e.target.setCustomValidity(''));
  $('#checkout-form').addEventListener('submit',e=>{
    e.preventDefault();if(!count())return;
    const form=e.currentTarget;
    const phone=form.elements.phone;
    const phoneDigits=phone.value.replace(/\D/g,'');
    if(phoneDigits.length<10||phoneDigits.length>15){phone.setCustomValidity('Укажите номер телефона: от 10 до 15 цифр.');phone.reportValidity();return;}
    if(!form.elements.customer.value.trim()){form.elements.customer.value='';form.reportValidity();return;}
    const delivery=form.elements.fulfillment.value==='delivery';
    if(delivery&&!form.elements.address.value.trim()){form.elements.address.value='';form.reportValidity();return;}
    const lines=['Здравствуйте, HASSAQ! Хочу оформить заказ:','',...Object.entries(cart).map(([id,qty])=>`${byId.get(id).name} × ${qty} — ${money(byId.get(id).price*qty)}`),'',`Стоимость блюд: ${money(total())}`,delivery?'Доставка: стоимость уточняется':'Самовывоз',`Имя: ${form.elements.customer.value.trim()}`,`Телефон: ${phone.value.trim()}`];
    if(delivery)lines.push(`Адрес: ${form.elements.address.value.trim()}`);
    if(form.elements.comment.value.trim())lines.push(`Комментарий: ${form.elements.comment.value.trim()}`);
    lines.push('','Подтвердите, пожалуйста, наличие, время и итоговую стоимость.');
    const url='https://wa.me/77717925250?text='+encodeURIComponent(lines.join('\n'));
    const retry=$('#whatsapp-retry');retry.href=url;retry.hidden=false;
    $('#checkout-status').textContent='Текст заказа готов. Отправьте его в открывшемся WhatsApp. Если окно не открылось, нажмите ссылку ниже.';
    window.open(url,'_blank','noopener,noreferrer');
  });
  const family=menu.find(x=>x.name==='Сет FAMILY');if(family?.image)$('#together-photo').src=family.image;
  renderCategories();renderProducts();syncUI();
})();
