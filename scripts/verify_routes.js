const fs = require('fs');
const path = require('path');
const http = require('http');
const https = require('https');

function walk(dir){
  const items = fs.readdirSync(dir, { withFileTypes: true });
  let results = [];
  for(const it of items){
    const full = path.join(dir, it.name);
    if(it.isDirectory()){
      results = results.concat(walk(full));
    } else if(it.isFile() && it.name === 'page.tsx'){
      results.push(full);
    }
  }
  return results;
}

function toRoute(file){
  const rel = path.relative(path.join(process.cwd(),'src','app'), path.dirname(file));
  if(!rel) return '/';
  // Split segments and remove segments that are parentheses groups like '(admin)'
  const segs = rel.split(path.sep).filter(Boolean).map(s=> s.replace(/^\(|\)$/g,''));
  // remove empty segments
  const route = '/' + segs.join('/');
  // Normalize double slashes
  return route.replace(/\\+/g,'/');
}

function isDynamic(route){
  return route.includes('[') || route.includes(']');
}

function isAdminPath(file){
  // if the path contains (admin) or a folder named admin under root
  const parts = file.split(path.sep);
  return parts.includes('(admin)') || parts.includes('admin') && parts.includes('(admin)') === false && parts.includes('src') === false ? false : parts.includes('(admin)') || parts.includes('admin') && file.includes(path.join('(admin)', 'admin'));
}

function simpleIsAdmin(relPath){
  // if relPath starts with '(admin)' or includes '/(admin)/' or includes '/admin/' after removing parentheses
  const p = relPath.replace(/\\/g,'/');
  if(p.startsWith('(admin)') || p.includes('/(admin)/')) return true;
  // also if after removing parentheses we get route starting with '/admin'
  const noPar = p.replace(/\(.*?\)\//g,'');
  return noPar.startsWith('admin');
}

function fetchUrl(url, timeout=10000){
  return new Promise((resolve)=>{
    const lib = url.startsWith('https')?https:http;
    const req = lib.get(url, { timeout }, (res)=>{
      let data = '';
      res.setEncoding('utf8');
      res.on('data', chunk=> data += chunk);
      res.on('end', ()=> resolve({status: res.statusCode, body: data}));
    });
    req.on('error', (err)=> resolve({error: err.message}));
    req.on('timeout', ()=>{ req.abort(); resolve({error:'timeout'}); });
  });
}

(async function(){
  const base = path.join(process.cwd(),'src','app');
  const files = walk(base);
  const routes = [];
  for(const f of files){
      const relRaw = path.relative(base, path.dirname(f)).replace(/\\/g,'/');
      // determine admin by presence of (admin) segment in the raw relative path
      const admin = relRaw.split('/').includes('(admin)');
      // build route by removing any grouping segments like (internal) or (admin)
      const segsRaw = relRaw.split('/').filter(Boolean);
      const segs = segsRaw.filter(s => !/^\(.*\)$/.test(s)).map(s => s);
      const route = segs.length === 0 ? '/' : '/' + segs.join('/');
      if(isDynamic(route)) continue;
      routes.push({file: f, route, rel: relRaw, admin});
  }

  // dedupe routes
  const map = new Map();
  for(const r of routes) map.set(r.route + '|' + r.admin, r);
  const unique = Array.from(map.values());

  const results = [];
  for(const r of unique){
    const url = 'http://localhost:3000' + (r.route === '/'? '/': r.route);
    try{
      const res = await fetchUrl(url);
      if(res.error){
        results.push({route: r.route, admin: r.admin, ok:false, error: res.error});
        console.log(`${r.route} -> ERROR ${res.error}`);
        continue;
      }
      const body = res.body || '';
      const hasFooter = body.includes('danphehealth.com') || body.includes('Site footer') || body.includes('Danphe Health');
      const hasFooterTag = body.includes('aria-label="Site footer"') || body.includes('<footer');
      // key markers for home
      const keyMarkers = [];
      if(r.route === '/'){
        keyMarkers.push({name:'hero', ok: body.includes('Enterprise-Grade') || body.includes('HIMS')});
        keyMarkers.push({name:'sections', ok: body.includes('Trusted by') || body.includes('Homepage')});
      }
      results.push({route: r.route, admin: r.admin, status: res.status, hasFooter, hasFooterTag, keyMarkers});
      console.log(`${r.route} -> ${res.status} footer:${hasFooter} tag:${hasFooterTag}`);
    } catch(e){
      results.push({route: r.route, admin: r.admin, ok:false, error: e.message});
      console.log(`${r.route} -> EX ${e.message}`);
    }
  }

  fs.writeFileSync('route_results.json', JSON.stringify(results, null, 2));
  console.log('\nWrote route_results.json');
})();