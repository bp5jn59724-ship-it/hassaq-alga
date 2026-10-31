import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
const root=path.dirname(new URL(import.meta.url).pathname);
for(const slug of ['nori','forma','north','linia','impulse']){
 const dir=path.join(root,slug), html=fs.readFileSync(path.join(dir,'index.html'),'utf8');
 if(!html.includes('демо')&&!html.includes('Демо'))throw Error(`${slug}: missing demo disclosure`);
 const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
 if(new Set(ids).size!==ids.length)throw Error(`${slug}: duplicate ids`);
 for(const m of html.matchAll(/(?:src|href)="([^"#][^"]*)"/g)){
  if(/^(https?:|tel:|mailto:)/.test(m[1]))continue;
  if(!fs.existsSync(path.join(dir,m[1])))throw Error(`${slug}: missing asset ${m[1]}`);
 }
 for(const m of html.matchAll(/href="#([^" ]+)"/g))if(!ids.includes(m[1]))throw Error(`${slug}: broken section ${m[1]}`);
 for(const script of ['base.js','app.js'])execFileSync(process.execPath,['--check',path.join(dir,script)]);
 if(html.includes('id="shop-data"')){
  const data=JSON.parse(html.match(/<script id="shop-data" type="application\/json">([\s\S]*?)<\/script>/)[1]);
  if(new Set(data.products.map(p=>p.id)).size!==data.products.length)throw Error('Duplicate product ID');
  for(const p of data.products)if(!fs.existsSync(path.join(dir,p.image))||!Number.isInteger(p.price)||p.price<=0)throw Error('Invalid product');
 }
 console.log(`PASS ${slug}: assets, navigation, demo disclosure and JavaScript syntax`);
}
