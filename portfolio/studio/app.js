'use strict';
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const menu=$('.menu-toggle'), nav=$('.nav-links');
function closeMenu(){nav.classList.remove('open');menu.setAttribute('aria-expanded','false');menu.setAttribute('aria-label','Открыть меню')}
menu.addEventListener('click',()=>{const open=nav.classList.toggle('open');menu.setAttribute('aria-expanded',String(open));menu.setAttribute('aria-label',open?'Закрыть меню':'Открыть меню')});
$$('.nav-links a').forEach(a=>a.addEventListener('click',closeMenu));
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeMenu()});
$$('[data-filter]').forEach(b=>b.addEventListener('click',()=>{const filter=b.dataset.filter;$$('[data-filter]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));let count=0;$$('.project').forEach(p=>{p.hidden=filter!=='Все'&&p.dataset.tier!==filter;if(!p.hidden)count++});$('.work-counter').textContent=`Показано ${count} из 5`;}));
$$('[data-plan]').forEach(b=>b.addEventListener('click',()=>{$('#format').value=b.dataset.plan;$('#brief').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});$('#format').focus({preventScroll:true})}));
const dialog=$('#brief-dialog'), result=$('#brief-result');
$('.close').addEventListener('click',()=>dialog.close());
dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close()}});
$('#brief-form').addEventListener('submit',e=>{e.preventDefault();const form=e.currentTarget;if(!form.reportValidity())return;const data=new FormData(form);const task=String(data.get('task')).trim();if(!task){form.elements.task.setCustomValidity('Опишите задачу хотя бы в нескольких словах.');form.elements.task.reportValidity();return;}const prices={'Обычный':'25 000 ₸','Средний':'45 000 ₸','Максимум':'60 000 ₸'};const format=String(data.get('format'));result.value=['ПРОЕКТ САЙТА / AE','',`Формат: ${format}`,`Бизнес: ${String(data.get('business')).trim()||'Уточним при обсуждении'}`,`Референс: ${data.get('sample')}`,'','Задача:',task,'',`Ориентир по стоимости: ${prices[format]||'После выбора формата'}`,'Итоговые стоимость, объём и сроки согласуются до начала работы.'].join('\n');$('#send-whatsapp').href='https://wa.me/77000258363?text='+encodeURIComponent(result.value);$('#copy-status').textContent='';dialog.showModal()});
$('#brief-form textarea').addEventListener('input',e=>e.target.setCustomValidity(''));
$('#copy-brief').addEventListener('click',async()=>{try{await navigator.clipboard.writeText(result.value);$('#copy-status').textContent='Описание скопировано.'}catch{result.focus();result.select();$('#copy-status').textContent='Выделенный текст можно скопировать вручную.'}});
$('#download-brief').addEventListener('click',()=>{const blob=new Blob(['\uFEFF'+result.value],{type:'text/plain;charset=utf-8'});const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='AE-project-brief.txt';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);$('#copy-status').textContent='Файл с описанием подготовлен для скачивания.'});

$$('[data-example]').forEach(a=>a.addEventListener('click',()=>{const button=$$('[data-filter]').find(b=>b.dataset.filter===a.dataset.example);button?.click()}));
