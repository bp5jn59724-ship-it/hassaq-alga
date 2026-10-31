import assert from 'node:assert/strict';
import fs from 'node:fs';
const menu = JSON.parse(fs.readFileSync('dist/menu.json','utf8'));
const expected = `Сэндвич-Ролл|2090
Суши с лососем|1090
Суши с угрем|1090
Суши с креветкой|1290
Соевый соус для суши|150
Имбирь для суши|150
Васаби для суши|150
Ролл Нежный|3190
Темпура Ролл|2590
Шеф Ролл|2690
Лайт темпура|2290
Ролл Ребус|2190
Калифорния с креветкой|2390
Ролл с креветками|1790
Ролл с огурцом|990
Ролл с Лососем|1590
Ролл с Угрем|1390
Филадельфия ролл|3290
Филадельфия гриль|3290
Ролл Цезарь|1790
Калифорния с лососем|2290
Ролл Канада|2890
Ролл Бонито|2390
Калифорния запеченный|2490
Запеченный лосось|2590
Запеченный угорь|2490
Филадельфия запеченный|3390
Поцелуй гейши|3390
Американо|2490
Лосось темпура|2290
Угорь темпура|2190
Хокайдо темпура|3590
Калифорния темпура|2090
Креветки темпура|2390
Цезарь темпура|1990
Сет Радуга|8090
Сет Классик|5190
Сет Запеченный|9490
Сет на Компанию|10990
Сет на Двоих|6490
Сет Темпура|9990
Сет Теплый|12990
Сет Фила микс|11990
Сет FAMILY|12990
донер на двоих|4790
бургер на двоих|6790
СЕТ ВКУСНЫЙ|6390
СЕТ ДОСТОЙНЫЙ.|8690
СЕТ ОСОБЕННЫЙ|7090
СЕТ НАСТОЯЩИЙ|7690`.split('\n').map(row=>row.split('|'));
assert.equal(menu.length,50);
assert.equal(new Set(menu.map(p=>p.id)).size,50);
for (const [name,price] of expected) {
 const matches=menu.filter(p=>p.name===name);assert.equal(matches.length,1,`Unique item: ${name}`);
 assert.equal(matches[0].price,Number(price),`Exact supplied price: ${name}`);
}
for (const p of menu) {
 assert(Number.isInteger(p.price)&&p.price>0);
 assert(!/<[^>]+>/.test(p.description),`Plain description: ${p.name}`);
 if (p.image) assert(fs.existsSync('dist/'+p.image),`Photo: ${p.name}`);
}
assert(!fs.existsSync('dist/__mobile-check.html'),'No QA route in deployment');
console.log('PASS: all 50 supplied names and prices; unique IDs; photo files; plain descriptions; no QA route.');
