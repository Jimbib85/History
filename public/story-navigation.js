/* Bridge to the original map and comparison pages; preserves deep links and saved lane order. */
(function() {
  'use strict';
  if(location.pathname==='/'&&!location.search&&!location.hash) {
    location.replace('story.html');return;
  }
  function boot() {
  function selectedYear() {return window.HistoryCompare?.state?.year??window.WorldHistoryAtlas?.state?.year??1200;}
  const nav=document.querySelector('.top-actions')||document.querySelector('.topbar nav');
  if(nav&&!nav.querySelector('[data-story-entry]')) {
    const link=document.createElement('a');link.dataset.storyEntry='true';link.href='story.html?year='+selectedYear();link.textContent='Story timeline';link.className='story-entry-link';
    link.addEventListener('click',()=>{link.href='story.html?year='+selectedYear();});nav.prepend(link);
    const style=document.createElement('style');style.textContent='.story-entry-link{display:inline-flex;align-items:center;padding:9px 11px;background:#dac396;color:#172e3a!important;border-radius:5px;text-decoration:none;white-space:nowrap;font:600 12px system-ui}.story-entry-link:hover{background:#ead6af}.top-actions{flex-wrap:wrap}@media(max-width:1200px){.topbar-center{display:none!important}}';document.head.append(style);
  }
  function openTechnology() {
    if(location.hash==='#technology'&&window.WorldHistoryTechnology&&!document.getElementById('technologyDialog')?.open)window.WorldHistoryTechnology.open();
  }
  openTechnology();window.addEventListener('hashchange',openTechnology);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
