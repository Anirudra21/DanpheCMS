const fs = require('fs');
const path = require('path');
const http = require('http');
const https = require('https');

function isDynamic(p){ return p.includes('['); }

function collectPages(dir){
  const results = [];
  const items = fs.readdirSync(dir, { withFileTypes: true });
  for(const it of items){
    const full = path.join(dir, it.name);
    if(it.isDirectory()){
      results.push(...collectPages(full));
    } else if(it.isFile() && it.name === 'page.tsx'){
      const rel = path.relative(path.join(process.cwd(),'src','app'), path.dirname(full));
      let route = '/' + rel.replace(/\\/g,'/');
      // normalize multiple leading slashes
      route = route.replace(/^\/+/,'/');
      if(route === '/.') route = '/';
      route = route.replace(/\(.*?\)\//g,'/');
      route = route.replace(/\(.*?\)/g,'');
      if(route.endsWith('/')) route = route.slice(0,-1) || '/';
      results.push({route, full});
    }
  }
  return results;
}

function httpGet(url, timeout = 10000){
  return new Promise((resolve, reject) => {
    try{
      const u = new URL(url);
      const lib = u.protocol === 'https:' ? https : http;
      const req = lib.request(u, { method: 'GET' }, (res) => {
        let data = '';
        res.setEncoding('utf8');
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => resolve({ status: res.statusCode, body: data }));
      });
      req.on('error', reject);
      req.setTimeout(timeout, () => { req.destroy(new Error('timeout')) });
      req.end();
    } catch(e){ reject(e); }
  });
}

(async function(){
  const pages = collectPages(path.join(process.cwd(),'src','app'));
  const unique = {};
  for(const p of pages){
    if(isDynamic(p.route)) continue;
    unique[p.route]=p.full;
  }
  const routes = Object.keys(unique).sort();
  console.log('Found routes:', routes.length);
  const failures = [];
  for(const r of routes){
    const norm = r.replace(/^\/+/,'/');
    const url = new URL(norm, 'http://localhost:3000').toString();
    try{
      const res = await httpGet(url);
      const body = res.body || '';
      const hasFooter = body.includes('danphehealth.com') || body.includes('Danphe Health');
      const nonEmpty = body.trim().length > 100;
      const ok = res.status === 200 && nonEmpty;
      console.log(`${norm} -> ${res.status} footer:${hasFooter} len:${body.length}`);
      if(!ok || !hasFooter) failures.push({route: norm, status: res.status, footer: hasFooter, len: body.length});
    } catch(e){
      console.log(`${norm} -> ERROR ${e.message}`);
      failures.push({route: norm, error: e.message});
    }
  }
  console.log('Failures:', failures.length);
  if(failures.length>0) console.log(JSON.stringify(failures, null, 2));
})();
