/* Shared view links carry the current historical context, never reader expansion or lane order. */
(function() {
  'use strict';
  if(location.pathname==='/'&&!location.search&&!location.hash) {
    location.replace('story.html');return;
  }
  function context() {
    const s=window.HistoryCompare?.state||window.WorldHistoryAtlas?.state||{};
    return {year:s.year??1200,civ:s.selected||s.civ||null};
  }
  function href(view) {
    const {year,civ}=context();
    const base='?year='+encodeURIComponent(year)+(civ?'&'+(view==='story'?'entity':'civ')+'='+encodeURIComponent(civ):'');
    return (view==='story'?'story.html':view==='compare'?'compare.html':'index.html')+base+(view==='technology'?'#technology':'');
  }
  let fallback=null;
  function refresh() {
    for(const a of document.querySelectorAll?.('[data-atlas-nav]')||[]) {
      if(['story','map','compare','technology'].includes(a.dataset.atlasNav))a.href=href(a.dataset.atlasNav);
    }
    if(fallback)fallback.href=href('story');
  }
  window.AtlasNavigation={refresh};
  function boot() {
    const primary=document.querySelector('.topbar nav');
    const actions=document.querySelector('.top-actions');
    const nav=primary||actions;
    const storySelector='[data-atlas-nav="story"], [data-story-entry], a[href^="story.html"]';
    // Primary view links and utility actions can occupy separate header containers.
    const existingStory=primary?.querySelector(storySelector)||actions?.querySelector(storySelector);
    if(nav&&!existingStory) {
      fallback=document.createElement('a');fallback.dataset.storyEntry='true';fallback.dataset.atlasNav='story';
      fallback.textContent='Story';fallback.className='story-entry-link';
      fallback.addEventListener('click',refresh);nav.prepend(fallback);
    }
    refresh();
    // Covers keyboard, middle-click and context-menu navigation as well as ordinary taps.
    for(const type of ['click','auxclick','focusin','pointerover','contextmenu'])document.addEventListener?.(type,refresh,true);
    function openTechnology() {
      if(location.hash==='#technology'&&window.WorldHistoryTechnology&&!document.getElementById('technologyDialog')?.open)window.WorldHistoryTechnology.open();
    }
    openTechnology();window.addEventListener('hashchange',openTechnology);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
