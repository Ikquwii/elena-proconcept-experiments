/* Stage: a three-act folding photographic theatre. */
(()=>{
 'use strict';
 const A=window.Atelier,D=window.MOCKUP_DATA?.proconcept,root=document.querySelector('#ws-app');
 if(!A||!D||!root)return;
 const esc=A.esc,P=D.projects;
 const chosen=[0,2,3];
 const portrait=p=>p.images.map(A.get).find(im=>im?.height>im.width*1.1)?.id||p.cover;
 const projects=chosen.map(i=>P[i]);
 const acts=projects.map(p=>({project:p,photos:[p.images[2]||p.cover,portrait(p),p.images[3]||p.cover]}));
 const number=i=>String(i+1).padStart(2,'0');
 const photo=(id,cls='',eager=false)=>A.photo(id,{className:cls,caption:false,eager});
 root.innerHTML=`<section class="ws-story" id="top"><div class="ws-sticky"><header class="ws-nav"><a href="#top" class="ws-logo">PRO CONCEPT<span>Visual production</span></a><nav aria-label="Main navigation"><a href="#work">Work</a><a href="#studio">Studio</a><a href="#contact">Contact ↗</a></nav></header><div class="ws-masthead"><span class="ws-kicker">A photographic theatre</span><h1>WORLD<span>STAGE.</span></h1></div><div class="ws-theatre" aria-label="Three photographic acts"><div class="ws-perspective"><div class="ws-floor" aria-hidden="true"></div>${acts.map((act,i)=>`<div class="ws-act" data-act="${i}" aria-label="Act ${number(i)}: ${esc(act.project.title)}"><span class="ws-act-ghost" aria-hidden="true">${number(i)}</span>${act.photos.map((id,j)=>`<div class="ws-panel ws-panel-${j}" data-panel="${j}"><button class="ws-panel-face" data-select="${id}" data-act-index="${i}" aria-label="Unfold ${esc(A.get(id).title)}">${A.img(id,{eager:i===0&&j===1})}<span class="ws-print-caption">${number(i)}.${number(j)}<span>${j===1?'Tap to unfold':'Another perspective'}</span>↗</span></button><div class="ws-panel-back" aria-hidden="true">PRO<br>CONCEPT</div></div>`).join('')}</div>`).join('')}</div><div class="ws-focus" hidden><button class="ws-focus-close" aria-label="Return to the stage">Close ×</button><div class="ws-focus-photo"></div><span class="ws-focus-hint">Tap the photograph for the full frame</span></div></div><div class="ws-scene-caption"><div><span class="ws-kicker ws-current-act">Act 01 / 03</span><h2 class="ws-current-title">${esc(acts[0].project.title)}</h2></div><button class="ws-case-open">View project <span>↗</span></button></div><div class="ws-scene-bottom"><div class="ws-act-buttons" aria-label="Choose an act">${acts.map((a,i)=>`<button data-goto-act="${i}" aria-label="Act ${number(i)}: ${esc(a.project.title)}" aria-pressed="${i===0}">${number(i)}<span></span></button>`).join('')}</div><span class="ws-scroll-hint">Scroll to unfold <span aria-hidden="true">↓</span></span></div></div></section><section class="ws-work" id="work"><header class="ws-work-heading"><span class="ws-kicker">The complete picture</span><h2>A frame is<br>only <em>the beginning.</em></h2><p>Six productions. Step inside each project.</p></header>${P.map((p,i)=>`<article class="ws-project"><div class="ws-project-label"><span class="ws-kicker">${number(i)} / ${esc(p.category||'Production')}</span><h3>${esc(p.title)}</h3><button class="ws-project-open" data-photo="${esc(p.cover)}" data-collection="${esc(p.images.join(','))}">Explore all photographs <span>↗</span></button></div><div class="ws-project-photos">${p.images.slice(0,4).map((id,j)=>`<div class="ws-project-print ws-project-print-${j}">${photo(id)}<span>${number(j)} — ${esc(p.title)}</span></div>`).join('')}</div></article>`).join('')}</section><section id="studio" class="ws-studio"><span class="ws-kicker">Pro Concept / The studio</span><h2>Made to<br><em>be seen.</em></h2><div class="ws-studio-grid">${photo(portrait(P[1]))}<div><p>Images give ideas a world of their own.</p><p>Explore our productions, look closer at the details, and bring your next brief into the conversation.</p><a href="#contact">Start a conversation ↗</a></div></div></section><footer class="ws-footer" id="contact"><span class="ws-kicker">Your next production</span><a class="ws-contact" href="mailto:${esc(D.email)}">Let’s make<br><em>a scene.</em><span>↗</span></a><div><a href="mailto:${esc(D.email)}">${esc(D.email)}</a><span>PRO CONCEPT</span><a href="#top">Back to the stage ↑</a></div></footer>`;
 const {gsap:g,ScrollTrigger:ST,reduce,mm}=A.setup();
 const actEls=[...root.querySelectorAll('.ws-act')],story=root.querySelector('.ws-story'),stage=root.querySelector('.ws-theatre'),focus=root.querySelector('.ws-focus');
 let current=0,lastFocus=null,focusTween=null;
 const setAct=i=>{if(current===i&&root.dataset.ready)return;current=i;root.dataset.ready='true';root.querySelector('.ws-current-act').textContent=`Act ${number(i)} / 03`;root.querySelector('.ws-current-title').textContent=acts[i].project.title;root.querySelectorAll('[data-goto-act]').forEach((el,j)=>el.setAttribute('aria-pressed',String(j===i)));if(!reduce&&g)actEls.forEach((el,j)=>{el.inert=j!==i;el.setAttribute('aria-hidden',String(j!==i));});};
 const closeFocus=()=>{focusTween?.kill();focus.hidden=true;focus.querySelector('.ws-focus-photo').innerHTML='';lastFocus?.focus({preventScroll:true});lastFocus=null;};
 root.querySelector('.ws-focus-close').addEventListener('click',closeFocus);
 root.querySelector('.ws-case-open').addEventListener('click',e=>A.open(acts[current].project.images,0,e.currentTarget));
 root.querySelectorAll('[data-select]').forEach(button=>button.addEventListener('click',()=>{
   lastFocus=button;focusTween?.kill();const before=button.getBoundingClientRect();focus.querySelector('.ws-focus-photo').innerHTML=photo(button.dataset.select);focus.hidden=false;if(g)g.set(focus,{clearProps:'transform,opacity'});const after=focus.getBoundingClientRect();
   if(g&&!reduce){focusTween=A.track(g.fromTo(focus,{x:before.left-after.left,y:before.top-after.top,scaleX:before.width/after.width,scaleY:before.height/after.height,rotationY:button.closest('.ws-panel-0')?48:button.closest('.ws-panel-2')?-48:0,opacity:.6},{x:0,y:0,scaleX:1,scaleY:1,rotationY:0,opacity:1,duration:.85,ease:'expo.out'}));}
   focus.querySelector('.ws-focus-close').focus({preventScroll:true});
 }));
 root.addEventListener('keydown',e=>{if(e.key==='Escape'&&!focus.hidden){e.preventDefault();closeFocus();}});
 const goTo=i=>{closeFocus();if(!g||reduce){actEls[i].scrollIntoView({behavior:'auto',block:'center'});setAct(i);return;}const top=story.getBoundingClientRect().top+scrollY;const range=story.offsetHeight-innerHeight;window.scrollTo({top:top+range*(i===0?0:i===1?.5:.94),behavior:'smooth'});};
 root.querySelectorAll('[data-goto-act]').forEach(b=>b.addEventListener('click',()=>goTo(Number(b.dataset.gotoAct))));
 if(!g||!ST||reduce){root.classList.add('ws-static');return;}
 root.classList.add('ws-enhanced');
 const setupScene=()=>{
   const w=actEls[0].querySelector('.ws-panel-1').offsetWidth;
   const vh=root.querySelector('.ws-sticky').clientHeight;
   const travel=stage.clientWidth*.9;
   const panel=(i,j)=>actEls[i].querySelector(`.ws-panel-${j}`);
   const pose=(i)=>{g.set(actEls[i],{opacity:i===0?1:0});g.set(panel(i,0),{xPercent:-50,yPercent:-50,x:-w*.83,y:14,z:-100,rotationY:51,rotationZ:-3,scale:.88});g.set(panel(i,1),{xPercent:-50,yPercent:-50,x:0,y:0,z:70,rotationY:0,rotationX:0,scale:1});g.set(panel(i,2),{xPercent:-50,yPercent:-50,x:w*.83,y:14,z:-100,rotationY:-51,rotationZ:3,scale:.88});};
   acts.forEach((_,i)=>pose(i));setAct(0);
   const tl=g.timeline({defaults:{ease:'none'},scrollTrigger:{trigger:story,start:'top top',end:'bottom bottom',scrub:.65,invalidateOnRefresh:true,onUpdate:self=>{const next=self.progress<.35?0:self.progress<.72?1:2;if(next!==current){if(!focus.hidden)closeFocus();setAct(next);}}}});
   tl.addLabel('opening',0)
     .to(panel(0,0),{x:-travel,rotationY:115,z:300,rotationZ:-14,duration:1.1},.08)
     .to(panel(0,2),{x:travel,rotationY:-115,z:300,rotationZ:14,duration:1.1},.08)
     .to(panel(0,1),{z:650,y:-vh*.38,rotationX:28,scale:1.2,opacity:0,duration:.8},.4)
     .to(actEls[0],{opacity:0,duration:.12},1.12)
     .fromTo(actEls[1],{opacity:0},{opacity:1,duration:.15,immediateRender:false},.82)
     .fromTo(panel(1,0),{x:-w*.1,z:-650,rotationY:86,scale:.55},{x:-w*.83,z:-100,rotationY:51,scale:.88,duration:.85,immediateRender:false},.84)
     .fromTo(panel(1,2),{x:w*.1,z:-650,rotationY:-86,scale:.55},{x:w*.83,z:-100,rotationY:-51,scale:.88,duration:.85,immediateRender:false},.84)
     .fromTo(panel(1,1),{z:-900,rotationY:-28,scale:.6},{z:70,rotationY:0,scale:1,duration:.9,immediateRender:false},.84)
     .addLabel('second-act',1.72)
     .to(panel(1,0),{x:-travel*.8,y:vh*.3,z:350,rotationY:-90,rotationZ:-18,duration:.85},1.87)
     .to(panel(1,2),{x:travel*.8,y:-vh*.3,z:350,rotationY:90,rotationZ:18,duration:.85},1.87)
     .to(panel(1,1),{rotationY:90,z:250,opacity:0,duration:.8},1.98)
     .to(actEls[1],{opacity:0,duration:.1},2.73)
     .fromTo(actEls[2],{opacity:0},{opacity:1,duration:.15,immediateRender:false},2.4)
     .fromTo(panel(2,0),{x:-travel,y:-vh*.3,z:-500,rotationY:-75,rotationZ:-30},{x:-w*.83,y:14,z:-100,rotationY:51,rotationZ:-3,duration:.9,immediateRender:false},2.42)
     .fromTo(panel(2,2),{x:travel,y:vh*.3,z:-500,rotationY:75,rotationZ:30},{x:w*.83,y:14,z:-100,rotationY:-51,rotationZ:3,duration:.9,immediateRender:false},2.42)
     .fromTo(panel(2,1),{z:-1100,rotationY:-90,scale:.5},{z:70,rotationY:0,scale:1,duration:.9,immediateRender:false},2.42)
     .addLabel('finale',3.32).to({}, {duration:.3});
   A.track(tl);
   window.__STAGE_QA={seek:p=>{tl.progress(Math.max(0,Math.min(1,p)));setAct(p<.35?0:p<.72?1:2);},timeline:tl};
   return ()=>{tl.scrollTrigger?.kill();tl.kill();};
 };
 const mountScene=()=>{
   let sceneContext=null,resizeTimer=null;
   let sizeKey='';
   const dimensions=()=>`${stage.clientWidth}:${stage.clientHeight}:${actEls[0].querySelector('.ws-panel-1').offsetWidth}`;
   const rebuild=()=>{
     if(!focus.hidden)closeFocus();
     sceneContext?.revert();
     sceneContext=g.context(setupScene,root);
     sizeKey=dimensions();
     ST.refresh();
     const timeline=window.__STAGE_QA.timeline;
     const progress=timeline.scrollTrigger.progress;
     timeline.progress(progress);
     setAct(progress<.35?0:progress<.72?1:2);
   };
   rebuild();
   const observer=new ResizeObserver(()=>{
     if(dimensions()===sizeKey)return;
     clearTimeout(resizeTimer);
     resizeTimer=setTimeout(()=>{if(dimensions()!==sizeKey)rebuild();},180);
   });
   observer.observe(stage);
   observer.observe(actEls[0].querySelector('.ws-panel-1'));
   return ()=>{clearTimeout(resizeTimer);observer.disconnect();sceneContext?.revert();};
 };
 if(mm)mm.add('(prefers-reduced-motion:no-preference)',mountScene);else mountScene();
 // The opening hinges animate on inner faces, leaving the scrubbed panel geometry untouched.
 const faces=actEls[0].querySelectorAll('.ws-panel-face');
 A.track(g.fromTo(faces,{rotationY:i=>i===0?-75:i===2?75:0,z:-700,scale:.6,opacity:.2},{rotationY:0,z:0,scale:1,opacity:1,duration:1.15,stagger:.12,ease:'expo.out',clearProps:'transform,opacity'}));
 root.querySelectorAll('.ws-project').forEach(project=>{
  const prints=project.querySelectorAll('.ws-project-print');
  A.track(g.fromTo(prints,{y:90,rotationZ:i=>i%2?-8:8,rotationY:i=>i%2?-18:18,opacity:.5},{y:0,rotationZ:0,rotationY:0,opacity:1,duration:1,ease:'power3.out',stagger:.12,scrollTrigger:{trigger:project,start:'top 80%',once:true}}));
 });
 window.addEventListener('pagehide',()=>focusTween?.kill());
 A.refresh();
})();
