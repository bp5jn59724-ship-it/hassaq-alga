"use strict";
const $=(s,root=document)=>root.querySelector(s), $$=(s,root=document)=>[...root.querySelectorAll(s)];
const money=n=>new Intl.NumberFormat('ru-RU').format(n)+' ₸';
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let toastTimer;
function toast(text){const t=$('.toast');t.textContent=text;t.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>t.classList.remove('show'),2500)}
function openModal(html){$('#modal-content').innerHTML=html;const d=$('#modal');if(!d.open)d.showModal()}
function closeModal(){$('#modal').close()}
$('#modal .close').addEventListener('click',closeModal);
$('#modal').addEventListener('click',e=>{if(e.target===$('#modal')){const r=e.target.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)closeModal()}});
const toggle=$('.menu-toggle');if(toggle)toggle.addEventListener('click',()=>{const open=$('.nav-links').classList.toggle('open');toggle.setAttribute('aria-expanded',String(open));toggle.setAttribute('aria-label',open?'Закрыть меню':'Открыть меню')});
$$('.nav-links a').forEach(a=>a.addEventListener('click',()=>{$('.nav-links').classList.remove('open');toggle?.setAttribute('aria-expanded','false');toggle?.setAttribute('aria-label','Открыть меню')}));
function storeRead(key,fallback){try{return JSON.parse(localStorage.getItem(key))??fallback}catch{return fallback}}
function storeWrite(key,value){try{localStorage.setItem(key,JSON.stringify(value))}catch{}}
function success(title,details){openModal('<div class="success-mark">✓</div><h2 id="modal-title">'+esc(title)+'</h2><p>Это демонстрация. Заявка не отправлена, оплата не списывается.</p><div class="success-detail">'+details+'</div><button class="button full" id="success-close">Понятно</button>');$('#success-close').onclick=closeModal}
function minDate(){const d=new Date();return new Date(d.getTime()-d.getTimezoneOffset()*60000).toISOString().slice(0,10)}
