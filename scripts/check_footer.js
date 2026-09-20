// Uses global fetch available in Node 18+
(async ()=>{
  try{
    const api = await fetch('http://localhost:3000/api/public-data');
    const pd = await api.json();
    const footerText = pd.siteSettings?.footerText || '';
    const home = await (await fetch('http://localhost:3000')).text();
    const containsFull = home.includes(footerText);
    const containsHealth = home.includes('danphehealth.com');
    const containsCare = home.includes('danphecare.com');
    console.log(JSON.stringify({ footerText, homeContainsFooterText: containsFull, containsHealth, containsCare }));
  }catch(e){ console.error('ERROR', e.message || e); process.exit(1) }
})();
