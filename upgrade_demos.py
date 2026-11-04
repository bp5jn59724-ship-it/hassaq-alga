from pathlib import Path
R=Path(__file__).parent/'portfolio'
for slug in ['nori','impulse']:
 p=R/slug/'index.html';s=p.read_text()
 if 'upgrade.css' not in s:s=s.replace('</head>','<link rel="stylesheet" href="upgrade.css"></head>')
 if slug=='nori':
  s=s.replace('Вкус Японии.<br>Настроение —<br><em>твоё.</em>','Хороший вечер<br>начинается<br><em>с NORI.</em>')
  s=s.replace('РОЛЛЫ. ДРУЗЬЯ. ХОРОШИЙ ВЕЧЕР.','JAPANESE FOOD / GOOD MOOD')
  s=s.replace('Собери любимые роллы, позови своих.<br>Повод уже есть.','Любимые роллы. Близкие люди.<br>И немного времени только для вас.')
  s=s.replace('>Суши</button>','>Маки</button>').replace(' Роллы <i>',' Роллы <i>').replace(' Суши <i>',' Маки <i>')
  s=s.replace('data-filter="Суши"','data-filter="Маки"').replace('"category": "Суши"','"category": "Маки"')
  if 'nori-editorial' not in s:
   s=s.replace('<section class="wrap offers"', '''<section class="wrap nori-editorial"><div class="editorial-image"><img src="assets/nori-roll-1.webp" alt="Роллы с лососем" loading="lazy"><span>THE NORI WAY</span></div><div><p class="eyebrow">МАЛЕНЬКИЙ РИТУАЛ. БОЛЬШОЕ УДОВОЛЬСТВИЕ.</p><h2>Отложи дела.<br><em>Останься на вкусное.</em></h2><p>Вечер не обязан быть особенным, чтобы собрать любимых за одним столом. Выбирай классику или открывай новый вкус — остальное подождёт.</p><a href="#catalog" class="text-button">Найти свой ролл ↗</a></div></section><section class="wrap offers"''')
   s=s.replace('</footer>','''</footer><nav class="mobile-dock" aria-label="Быстрые действия"><a href="#catalog"><span>▦</span>Меню</a><a href="#offers"><span>✳</span>Сеты</a><button data-open-cart><span>Корзина <b data-cart-count>0</b></span><small data-cart-total>Выбрать вкусное</small></button></nav>''')
  s=s.replace('КОНЦЕПТ ДЛЯ ПОРТФОЛИО','NORI / ДЕМО · МАКСИМУМ')
 else:
  s=s.replace('КОНЦЕПТ ДЛЯ ПОРТФОЛИО','IMPULSE / ДЕМО · СРЕДНИЙ')
  if 'club-intro' not in s:
   s=s.replace('<section class="wrap section" id="training">','''<section class="wrap club-intro"><p class="eyebrow">БОЛЬШЕ, ЧЕМ ТРЕНИРОВКА</p><h2>Твоя энергия.<br>Твой темп.</h2><div><p>Здесь не нужно никому ничего доказывать. Найди занятие, которое подходит тебе, и оставь время на себя.</p><a href="#schedule">Выбрать день и занятие ↗</a></div></section><section class="wrap section" id="training">''')
 p.write_text(s)
p=R/'nori'/'app.js';s=p.read_text();s=s.replace("function sync(){storeWrite", "function sync(){$$('[data-cart-total]').forEach(x=>x.textContent=count()?money(total()):'Выбрать вкусное');storeWrite") if '[data-cart-total]' not in s else s;p.write_text(s)
