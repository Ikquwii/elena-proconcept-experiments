/* Pro Concept — ten independent photographic studies. Shared assets and a11y: Atelier. */
(() => {
  'use strict';
  const A = window.Atelier;
  const D = window.MOCKUP_DATA?.proconcept;
  const root = document.querySelector('#p-app');
  if (!A || !D || !root) return;
  const E = A.esc;
  const allProjects = D.projects.filter(p => p.images?.length);
  const leadOffsets = {billboard:0,table:1,paravent:2,onetake:3,reassembly:4,proscenium:5,elevation:0,cuthold:1,fourviews:2,rotograph:3};
  const offset = (leadOffsets[document.body.dataset.concept] || 0) % allProjects.length;
  const projects = allProjects.slice(offset).concat(allProjects.slice(0,offset)).map((p, i) => ({...p, index:i, images:[...new Set(p.images)], cover:p.cover || p.images[0]}));
  const P = i => projects[((i % projects.length) + projects.length) % projects.length];
  const picture = (id, cls='', eager=false) => A.photo(id, {className:cls, caption:false, eager});
  const portraitCover = p => {const cover=A.get(p.cover);if(!cover||cover.width/cover.height<=1.3)return p.cover;return p.images.map(id=>A.get(id)).find(im=>im&&im.height>im.width*1.1)?.id||p.cover;};
  const responsiveCover = p => window.innerWidth<900?portraitCover(p):p.cover;
  const word = '<span>PRO</span><span>CONCEPT</span>';
  const num = n => String(n + 1).padStart(2, '0');
  const label = p => `<span class="p-meta">${num(p.index)} / ${E(p.category || 'Selected work')}</span><h3>${E(p.title)}</h3>`;
  const caseButton = (p, text='View complete project') => `<button class="p-link p-case" data-photo="${E(p.cover)}" data-collection="${E(p.images.join(','))}">${text}<span aria-hidden="true">↗</span></button>`;
  const nav = (mode='') => `<header class="p-nav ${mode}"><a class="p-logo" href="#top" aria-label="Pro Concept home">PRO CONCEPT<span>Creative production</span></a><nav aria-label="Main navigation"><a href="#work">Work</a><a href="#studio">Studio</a><a href="#contact">Contact ↗</a></nav></header>`;
  const heading = (eyebrow, title) => `<div class="p-section-heading"><span class="p-meta">${eyebrow}</span><h2>${title}</h2><span class="p-meta">Pro Concept</span></div>`;
  const footer = () => `<section class="p-studio" id="studio"><span class="p-meta">The studio / Pro Concept</span><h2>One point<br>of <em>view.</em><br>Many possibilities.</h2><div class="p-studio-copy"><p>Images, ideas and the space between them.</p><p>Explore the projects, discover the details, and bring your next brief into the conversation.</p><a class="p-link" href="#contact">Start a conversation <span>↗</span></a></div>${picture(P(2).images[2] || P(2).cover,'p-studio-photo')}</section><footer class="p-footer" id="contact"><span class="p-meta">Your next project</span><a class="p-contact" href="mailto:${E(D.email || '')}">Let’s make<br><em>an impression.</em><span aria-hidden="true">↗</span></a><div class="p-footer-bottom"><a href="mailto:${E(D.email || '')}">${E(D.email || 'Contact Pro Concept')}</a><span>PRO CONCEPT</span><a href="#top">Back to top ↑</a></div></footer>`;
  const caseStrip = (p, style='') => `<article class="p-case-strip ${style}" id="project-${p.index}"><div class="p-case-heading">${label(p)}${caseButton(p)}</div><div class="p-case-images">${p.images.slice(0,3).map(id => picture(id)).join('')}</div></article>`;
  const allCases = style => projects.map(p=>caseStrip(p,style)).join('');
  const controls = (target, text='Browse projects') => `<div class="p-controls" aria-label="${text}"><button data-${target}="-1" aria-label="Previous project">←</button><span class="p-control-count" aria-live="polite">01 / ${num(projects.length-1)}</span><button data-${target}="1" aria-label="Next project">→</button></div>`;
  const projectTabs = (name) => `<div class="p-project-tabs" role="group" aria-label="Choose project">${projects.map((p,i)=>`<button data-${name}="${i}" aria-pressed="${i===0}"><span>${num(i)}</span>${E(p.title)}</button>`).join('')}</div>`;
  const stageDetail = () => `<div class="p-active-detail"><span class="p-meta">Selected project</span><h2>${E(P(0).title)}</h2><button class="p-link p-active-open">Explore the project <span>↗</span></button></div>`;
  const concepts = {
    billboard() {
      return `${nav()}<section class="p-billboard-hero" aria-label="Campaign billboards"><h1 class="p-billboard-title">PRO CONCEPT</h1><div class="p-street"><div class="p-street-line" aria-hidden="true"></div>${[P(1),P(0),P(2)].map((p,i)=>`<div class="p-board p-board-${i}">${picture(i===1?responsiveCover(p):portraitCover(p),'',i===1)}<span>${num(p.index)} — ${E(p.title)}</span></div>`).join('')}</div><div class="p-hero-baseline"><span>Images with presence.</span><a href="#work">Enter the work ↓</a></div></section><section id="work" class="p-billboard-work">${heading('Selected productions','Bigger than<br>the <em>frame.</em>')}${allCases('p-wide-case')}</section>`;
    },
    table() {
      return `${nav()}<section class="p-table-hero"><div class="p-table-word"><span class="p-meta">An open worktable</span><h1>${word}</h1><a href="#work">Take a closer look ↓</a></div><div class="p-table-prints">${[0,1,2,3,4,5].map((i)=>`<div class="p-loose-print p-loose-${i}">${picture(portraitCover(P(i)),'',i===0)}<span>${num(i)} / ${E(P(i).title)}</span></div>`).join('')}</div></section><section id="work" class="p-worktable">${heading('The worktable','Ideas take <em>shape.</em>')}<p class="p-hint">Tap a project to spread the prints.</p><div class="p-clusters">${projects.map(p=>`<article class="p-cluster"><div class="p-cluster-prints">${p.images.slice(0,3).map((id,i)=>`<div class="p-cluster-print p-cluster-print-${i}">${picture(id)}</div>`).join('')}</div><div class="p-cluster-info">${label(p)}<button class="p-link p-spread" aria-expanded="false">Spread the prints <span>+</span></button>${caseButton(p)}</div></article>`).join('')}</div></section>`;
    },
    paravent() {
      return `${nav('p-nav-light')}<section class="p-paravent-hero"><h1 class="p-screen-title">PRO<span>CONCEPT</span></h1><div class="p-screen" aria-label="Choose a project panel">${projects.slice(0,4).map((p,i)=>`<button class="p-screen-panel" data-screen="${i}" aria-pressed="${i===0}">${A.img(portraitCover(p),{eager:i===0})}<span>${num(i)}<strong>${E(p.title)}</strong><i aria-hidden="true">↗</i></span></button>`).join('')}</div><div class="p-screen-detail"><span class="p-meta">A different perspective</span><button class="p-screen-open p-link">Explore ${E(P(0).title)} <span>↗</span></button></div></section><section id="work" class="p-folded-work">${heading('Productions, unfolded','Behind every<br><em>perspective.</em>')}${projects.map(p=>`<article class="p-fold-case"><div class="p-fold-front">${picture(p.cover)}<div>${label(p)}${caseButton(p)}</div></div><div class="p-fold-wings">${p.images.slice(1,4).map(id=>picture(id)).join('')}</div></article>`).join('')}</section>`;
    },
    onetake() {
      return `${nav('p-nav-light p-nav-overlay')}<section class="p-take-hero"><div class="p-take-cover">${picture(responsiveCover(P(0)),'',true)}</div><div class="p-take-frame" aria-hidden="true"></div><div class="p-take-title"><span class="p-meta">Pro Concept / Selected production</span><h1>ONE<br><em>TAKE.</em></h1><a href="#work">${E(P(0).title)} <span>↓</span></a></div><div class="p-take-index">${projects.slice(0,4).map(p=>`<a href="#take-${p.index}">${num(p.index)}</a>`).join('')}</div></section><section id="work" class="p-takes">${projects.map(p=>`<article class="p-take-case" id="take-${p.index}"><div class="p-take-stage">${picture(p.cover)}<div class="p-take-caption">${label(p)}${caseButton(p)}</div></div><div class="p-take-sequence">${p.images.slice(1,4).map((id,i)=>`<figure>${picture(id)}<figcaption>Frame ${num(i+1)} / ${E(p.title)}</figcaption></figure>`).join('')}</div></article>`).join('')}</section>`;
    },
    reassembly() {
      const tiles = Array.from({length:12},(_,i)=>({p:P(i),id:P(i).images[Math.floor(i/6)] || P(i).cover}));
      return `${nav()}<section class="p-mosaic-hero"><div class="p-mosaic">${tiles.map(({p,id},i)=>`<button class="p-mosaic-tile p-tile-${i}" data-mosaic="${p.index}" aria-label="Select ${E(p.title)}">${A.img(id,{eager:i===0})}<span>${num(p.index)}</span></button>`).join('')}</div><h1 class="p-mosaic-word">PRO<span>CONCEPT</span></h1><div class="p-mosaic-focus" hidden></div><button class="p-mosaic-reset" hidden>All pieces ↗</button><div class="p-mosaic-summary">${stageDetail()}</div></section><section id="work" class="p-assembly-work">${heading('Individual visions / One studio','All the<br><em>pieces.</em>')}${projectTabs('assembly')}<div class="p-assembly-cases">${projects.map(p=>`<article class="p-assembly-case" data-assembly-case="${p.index}"><div>${label(p)}${caseButton(p)}</div><div class="p-assembly-images">${p.images.slice(0,4).map(id=>picture(id)).join('')}</div></article>`).join('')}</div></section>`;
    },
    proscenium() {
      return `${nav('p-nav-light')}<section class="p-portal-hero"><h1 class="p-facade-title">PRO CONCEPT</h1><div class="p-portal"><div class="p-portal-wing p-portal-left">${picture(P(1).cover)}</div><div class="p-portal-main">${picture(responsiveCover(P(0)),'',true)}<span class="p-portal-edge p-portal-edge-left" aria-hidden="true"></span><span class="p-portal-edge p-portal-edge-right" aria-hidden="true"></span></div><div class="p-portal-wing p-portal-right">${picture(P(2).cover)}</div></div><div class="p-portal-bottom"><span class="p-meta">Enter a different world</span><a href="#work">Step inside ↓</a></div></section><section id="work" class="p-stages">${heading('The stage is set','A world within<br><em>the frame.</em>')}${projects.map(p=>`<article class="p-production-stage"><div class="p-stage-header">${label(p)}${caseButton(p)}</div><div class="p-stage-photos">${p.images.slice(0,3).map(id=>picture(id)).join('')}</div></article>`).join('')}</section>`;
    },
    elevation() {
      return `${nav()}<section class="p-lift-hero"><div class="p-lift-track p-lift-left">${[portraitCover(P(0)),portraitCover(P(1))].map((id,i)=>picture(id,'',i===0)).join('')}</div><div class="p-lift-spine"><span class="p-meta">Creative production</span><h1>PRO<br>CON<br>CEPT</h1><span class="p-spine-rule" aria-hidden="true"></span><a href="#work">Selected<br>work ↓</a></div><div class="p-lift-track p-lift-right">${[portraitCover(P(2)),portraitCover(P(3))].map(id=>picture(id)).join('')}</div></section><section id="work" class="p-elevations">${heading('Different levels of detail','From here,<br><em>another view.</em>')}${projects.map(p=>`<article class="p-elevation-case"><div class="p-elevation-cover">${picture(p.cover)}</div><div class="p-elevation-label">${label(p)}${caseButton(p)}</div><div class="p-elevation-details">${p.images.slice(1,4).map(id=>picture(id)).join('')}</div></article>`).join('')}</section>`;
    },
    cuthold() {
      return `${nav('p-nav-light')}<section class="p-cut-hero"><div class="p-cut-brand"><h1>PRO<br>CONCEPT</h1><span>Cut. Hold. Look again.</span></div><div class="p-cut-bands">${projects.slice(0,4).map((p,i)=>`<div class="p-cut-band ${i===0?'is-active':''}"><button class="p-band-select" data-band="${i}" aria-expanded="${i===0}">${A.img(p.cover,{eager:i===0})}<span>${num(i)} <strong>${E(p.title)}</strong><i>↗</i></span></button><button class="p-band-open p-link" data-photo="${E(p.cover)}" data-collection="${E(p.images.join(','))}">Open project <span>↗</span></button></div>`).join('')}</div></section><section id="work" class="p-cut-work">${heading('An edit of our work','Hold that<br><em>thought.</em>')}${projects.map(p=>`<article class="p-film-case"><div class="p-film-title">${label(p)}${caseButton(p)}</div><div class="p-film-frames">${p.images.slice(0,4).map((id,i)=>`<figure>${picture(id)}<figcaption>${num(i)} — ${E(p.title)}</figcaption></figure>`).join('')}</div></article>`).join('')}</section>`;
    },
    fourviews() {
      return `${nav('p-nav-light p-nav-overlay')}<section class="p-views-hero"><div class="p-view-matrix">${projects.slice(0,4).map((p,i)=>`<button class="p-view p-view-${i}" data-view="${i}" aria-pressed="false">${A.img(portraitCover(p),{eager:i===0})}<span>${num(i)}<strong>${E(p.title)}</strong><i>↗</i></span></button>`).join('')}<h1 class="p-view-brand">PRO<br>CONCEPT</h1></div><div class="p-views-toolbar"><span class="p-view-selected">Four views. One point of view.</span><button class="p-view-reset">All work ↗</button><button class="p-view-open" hidden>Open project ↗</button></div></section><section id="work" class="p-four-work">${heading('An expanded view','Look in<br><em>every direction.</em>')}${projects.map(p=>`<article class="p-quadrant-case"><div class="p-quadrant-label">${label(p)}${caseButton(p)}</div>${p.images.slice(0,3).map(id=>picture(id)).join('')}</article>`).join('')}</section>`;
    },
    rotograph() {
      return `${nav()}<section class="p-roto-hero"><div class="p-roto-top"><span class="p-meta">A rotating selection</span><h1>PRO CONCEPT</h1></div><div class="p-roto-space"><div class="p-roto-side p-roto-side-left">${picture(P(projects.length-1).cover)}</div><div class="p-roto-front">${picture(responsiveCover(P(0)),'',true)}</div><div class="p-roto-side p-roto-side-right">${picture(P(1).cover)}</div></div><div class="p-roto-bottom">${stageDetail()}${controls('rotate')}</div></section><section id="work" class="p-roto-work">${heading('Every project / Another facet','Turn toward<br><em>the unexpected.</em>')}${projects.map(p=>`<article class="p-facet-case"><div class="p-facet-title">${label(p)}${caseButton(p)}</div><div class="p-facet-photos">${p.images.slice(0,3).map(id=>picture(id)).join('')}</div></article>`).join('')}</section>`;
    }
  };
  const slug = document.body.dataset.concept;
  const render = concepts[slug] || concepts.billboard;
  root.innerHTML = render() + footer();
  const motion = A.setup();
  const {gsap:g, mm, reduce} = motion;
  const animate = Boolean(g && !reduce);
  const on = (selector, type, fn) => root.querySelectorAll(selector).forEach(el=>el.addEventListener(type,fn));
  const activePressed = (selector,index) => root.querySelectorAll(selector).forEach((el,i)=>el.setAttribute('aria-pressed',String(i===index)));
  const openProject = (index, el) => A.open(P(index).images,0,el);
  const detail = (index) => {const h=root.querySelector('.p-active-detail h2');if(h)h.textContent=P(index).title;};
  let selected=0;
  on('.p-active-open','click',e=>openProject(selected,e.currentTarget));
  if (slug==='table') {
    on('.p-spread','click',e=>{const btn=e.currentTarget;const c=btn.closest('.p-cluster');const open=!c.classList.contains('is-spread');c.classList.toggle('is-spread',open);btn.setAttribute('aria-expanded',String(open));btn.innerHTML=`${open?'Gather the prints':'Spread the prints'} <span>${open?'−':'+'}</span>`;A.refresh();});
  }
  if(slug==='paravent') {
    on('[data-screen]','click',e=>{selected=Number(e.currentTarget.dataset.screen);activePressed('[data-screen]',selected);root.querySelector('.p-screen').dataset.selected=selected;root.querySelector('.p-screen-open').innerHTML=`Explore ${E(P(selected).title)} <span>↗</span>`;});
    on('.p-screen-open','click',e=>openProject(selected,e.currentTarget));
  }
  if(slug==='reassembly') {
    const choose=(index)=>{selected=index;detail(index);const focus=root.querySelector('.p-mosaic-focus');focus.innerHTML=picture(P(index).cover);focus.hidden=false;root.querySelector('.p-mosaic-reset').hidden=false;if(animate)A.track(g.fromTo(focus,{scale:.65,opacity:.3},{scale:1,opacity:1,duration:.6,ease:'power3.out'}));root.querySelectorAll('[data-mosaic]').forEach(el=>el.classList.toggle('is-selected',Number(el.dataset.mosaic)===index));root.querySelectorAll('[data-assembly-case]').forEach(el=>el.classList.toggle('is-selected',Number(el.dataset.assemblyCase)===index));activePressed('[data-assembly]',index);if(animate){const items=root.querySelectorAll('.p-mosaic-tile.is-selected');g.fromTo(items,{scale:.94},{scale:1,duration:.5,overwrite:true,ease:'power3.out'});} };
    on('.p-mosaic-reset','click',()=>{root.querySelector('.p-mosaic-focus').hidden=true;root.querySelector('.p-mosaic-reset').hidden=true;root.querySelectorAll('.p-mosaic-tile').forEach(el=>el.classList.remove('is-selected'));});
    on('[data-mosaic]','click',e=>choose(Number(e.currentTarget.dataset.mosaic)));
    on('[data-assembly]','click',e=>{choose(Number(e.currentTarget.dataset.assembly));root.querySelector(`[data-assembly-case="${selected}"]`).scrollIntoView({behavior:reduce?'instant':'smooth',block:'start'});});
  }
  if(slug==='cuthold')on('[data-band]','click',e=>{const b=e.currentTarget.closest('.p-cut-band');root.querySelectorAll('.p-cut-band').forEach(el=>{const active=el===b;el.classList.toggle('is-active',active);el.querySelector('[data-band]').setAttribute('aria-expanded',String(active));});A.refresh();});
  if(slug==='fourviews'){
    on('[data-view]','click',e=>{selected=Number(e.currentTarget.dataset.view);root.querySelector('.p-view-matrix').dataset.selected=selected;activePressed('[data-view]',selected);root.querySelector('.p-view-selected').textContent=P(selected).title;root.querySelector('.p-view-open').hidden=false;});
    on('.p-view-reset','click',()=>{delete root.querySelector('.p-view-matrix').dataset.selected;activePressed('[data-view]',-1);root.querySelector('.p-view-selected').textContent='Four views. One point of view.';root.querySelector('.p-view-open').hidden=true;});
    on('.p-view-open','click',e=>openProject(selected,e.currentTarget));
  }
  if(slug==='rotograph'){
    let busy=false;
    const turn=(step)=>{if(busy)return;selected=(selected+step+projects.length)%projects.length;const front=root.querySelector('.p-roto-front');const swap=()=>{front.innerHTML=picture(responsiveCover(P(selected)));root.querySelector('.p-roto-side-left').innerHTML=picture(P(selected-1).cover);root.querySelector('.p-roto-side-right').innerHTML=picture(P(selected+1).cover);detail(selected);root.querySelector('.p-control-count').textContent=`${num(selected)} / ${num(projects.length-1)}`;};if(animate){busy=true;g.to(front,{rotationY:-step*30,xPercent:-step*8,opacity:.25,duration:.22,onComplete:()=>{swap();g.fromTo(front,{rotationY:step*30,xPercent:step*8,opacity:.4},{rotationY:0,xPercent:0,opacity:1,duration:.4,ease:'power3.out',onComplete:()=>busy=false});}});}else swap();};
    on('[data-rotate]','click',e=>turn(Number(e.currentTarget.dataset.rotate)));
    const surface=root.querySelector('.p-roto-space');let touchStart=null,suppressClickUntil=0;surface.addEventListener('touchstart',e=>{touchStart=e.touches.length===1?{x:e.touches[0].clientX,y:e.touches[0].clientY}:null;},{passive:true});surface.addEventListener('touchcancel',()=>{touchStart=null;},{passive:true});surface.addEventListener('touchend',e=>{if(!touchStart)return;const dx=e.changedTouches[0].clientX-touchStart.x,dy=e.changedTouches[0].clientY-touchStart.y;touchStart=null;if(Math.abs(dx)>45&&Math.abs(dx)>Math.abs(dy)*1.4){suppressClickUntil=Date.now()+450;turn(dx<0?1:-1);}},{passive:true});surface.addEventListener('click',e=>{if(Date.now()<suppressClickUntil){e.preventDefault();e.stopPropagation();}},true);
  }
  if(!animate){root.querySelectorAll('.p-portal-edge').forEach(el=>el.remove());return;}
  const enter=(targets,from,to={})=>{const els=root.querySelectorAll(targets);if(els.length)A.track(g.fromTo(els,from,{duration:.85,ease:'power3.out',...to}));};
  const scroll=(el,targets,vars,options={})=>A.track(g.to(targets,{...vars,ease:'none',scrollTrigger:{trigger:el,start:'top bottom',end:'bottom top',scrub:.5,...options}}));
  if(slug==='billboard'){enter('.p-board',{y:65,rotationY:-8,opacity:.5},{y:0,rotationY:0,opacity:1,stagger:.1});scroll('.p-billboard-hero','.p-board-1',{y:-38});}
  if(slug==='table'){enter('.p-loose-print',{scale:.82,y:70,opacity:.4},{scale:1,y:0,opacity:1,stagger:.08});root.querySelectorAll('.p-cluster').forEach(c=>scroll(c,c.querySelector('.p-cluster-print-1'),{y:-20}));}
  if(slug==='paravent'){enter('.p-screen-panel',{rotationY:0,y:45,opacity:.3},{y:0,opacity:1,stagger:.08,clearProps:'transform'});root.querySelectorAll('.p-fold-case').forEach(el=>scroll(el,el.querySelector('.p-fold-wings'),{y:-24}));}
  if(slug==='onetake'){enter('.p-take-cover',{scale:1.04},{scale:1,duration:1});root.querySelectorAll('.p-take-sequence figure').forEach(el=>g.fromTo(el,{clipPath:'inset(8% 0 0 0)'},{clipPath:'inset(0% 0 0 0)',duration:.8,scrollTrigger:{trigger:el,start:'top 85%',once:true}}));}
  if(slug==='reassembly')enter('.p-mosaic-tile',{scale:.88,opacity:.3},{scale:1,opacity:1,stagger:{each:.035,from:'center'}});
  if(slug==='proscenium'){enter('.p-portal-edge-left',{scaleX:1},{scaleX:0,duration:1});enter('.p-portal-edge-right',{scaleX:1},{scaleX:0,duration:1});scroll('.p-portal-hero','.p-portal-wing',{y:-35});}
  if(slug==='elevation'){scroll('.p-lift-hero','.p-lift-left',{y:-45});scroll('.p-lift-hero','.p-lift-right',{y:45});root.querySelectorAll('.p-elevation-details').forEach(el=>scroll(el,el,{y:-22}));}
  if(slug==='cuthold')enter('.p-cut-band',{xPercent:8,opacity:.3},{xPercent:0,opacity:1,stagger:.1});
  if(slug==='fourviews')enter('.p-view',{scale:1.06,opacity:.45},{scale:1,opacity:1,stagger:.08});
  if(slug==='rotograph')enter('.p-roto-front',{rotationY:24,opacity:.3},{rotationY:0,opacity:1});
  // Only desktop adds brief sticky emphasis; phones retain direct document scrolling.
  if(mm) mm.add('(min-width: 900px) and (prefers-reduced-motion: no-preference)',()=>{
    if(slug==='onetake')root.querySelectorAll('.p-take-stage').forEach(el=>scroll(el,el.querySelector('.photo'),{scale:.97},{start:'top top',end:'+=350',pin:el,pinSpacing:true}));
    if(slug==='billboard')scroll('.p-street','.p-board-0',{rotationY:8,x:18});
  });
  A.refresh();
})();
