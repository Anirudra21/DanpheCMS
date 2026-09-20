const fs = require('fs');
(async ()=>{
  const base = 'http://localhost:3000';
  const results = JSON.parse(fs.readFileSync('route_results.json','utf8'));
  const publicRoutes = results.filter(r=> !r.admin && r.status===200);
  const pdResp = await (await fetch(base + '/api/public-data')).json();
  const footerText = pdResp.siteSettings?.footerText || '';
  const substr1 = 'danphehealth.com';
  const substr2 = 'danphecare.com';
  const checks = [];
  for(const r of publicRoutes){
    const url = base + (r.route === '/'? '/' : r.route);
    try{
      const html = await (await fetch(url)).text();
      checks.push({ route: r.route, full: html.includes(footerText), containsHealth: html.includes(substr1), containsCare: html.includes(substr2) });
    }catch(e){ checks.push({ route: r.route, error: e.message }) }
  }
  console.log(JSON.stringify({ footerText, checks }, null, 2));
})();
