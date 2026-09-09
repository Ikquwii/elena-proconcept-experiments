(() => {
  'use strict';
  const A=window.Atelier,D=window.MOCKUP_DATA?.elena;
  if(!A||!D)return;
  const env=A.setup(),g=env.gsap,S=env.ScrollTrigger;
  document.body.classList.add('ad-js');
  document.querySelectorAll('[data-open-collection]').forEach(button=>button.addEventListener('click',()=>A.open(D.projects[Number(button.dataset.openCollection)].images,0,button)));
  const links=[...document.querySelectorAll('.ad-nav a')];
  const sections=[...document.querySelectorAll('.ad-chapter')];
  const mark=index=>links.forEach((a,i)=>{if(i===index)a.setAttribute('aria-current','true');else a.removeAttribute('aria-current');});
  if(!g||!S||env.reduce)return;
  document.body.classList.add('ad-motion');
  const timelines=[];
  const track=t=>{timelines.push(t);A.track(t);return t;};
  const opening=track(g.timeline({scrollTrigger:{trigger:'.ad-opening',start:'top top',end:'bottom bottom',scrub:.6,invalidateOnRefresh:true}}));
  opening.fromTo('.ad-first-print',{clipPath:'inset(0% 43% 0% 43%)',rotation:-7,scale:.85},{clipPath:'inset(0% 0% 0% 0%)',rotation:0,scale:1.12,duration:.62,ease:'power2.inOut'},0)
    .fromTo('.ad-exposure',{y:0},{y:()=>innerHeight*.82,duration:1,ease:'none'},0)
    .to('.ad-opening h1',{yPercent:-30,opacity:.2,duration:.6},.35);
  sections.forEach((section,index)=>{
    const prints=[...section.querySelectorAll('.ad-print')].slice(0,4);
    const scan=section.querySelector('.ad-scan'),word=section.querySelector('.ad-act-word');
    const tl=track(g.timeline({defaults:{ease:'power2.inOut'},scrollTrigger:{trigger:section,start:'top top',end:'bottom bottom',scrub:.7,invalidateOnRefresh:true,onEnter:()=>mark(index),onEnterBack:()=>mark(index)}}));
    const mobile=()=>innerWidth<700&&innerHeight>540;
    if(index===0){
      tl.fromTo(prints,{xPercent:i=>i%2?-95:95,yPercent:i=>i<2?65:-65,rotationY:i=>i%2?-28:28,clipPath:'inset(0% 45% 0% 45%)'}, {xPercent:0,yPercent:0,rotationY:0,clipPath:'inset(0% 0% 0% 0%)',stagger:.065,duration:.40},0);
    }else if(index===1){
      tl.fromTo(prints,{xPercent:i=>(1.5-i)*62,yPercent:i=>mobile()?(i<2?35:-35):0,z:i=>-200-i*65,rotation:i=>(i-1.5)*12}, {xPercent:0,yPercent:0,z:0,rotation:0,stagger:.045,duration:.43},0);
    }else if(index===2){
      tl.fromTo(prints,{rotationX:65,yPercent:80,z:-150,scale:.7},{rotationX:0,yPercent:0,z:0,scale:1,stagger:.06,duration:.40},0);
    }else{
      tl.fromTo(prints,{xPercent:i=>i%2?105:-105,rotation:i=>i%2?20:-20,scale:1.3},{xPercent:0,rotation:0,scale:1,stagger:.04,duration:.44},0);
    }
    // A generous still interval keeps the photographs readable before the next exposure.
    tl.to(prints,{yPercent:i=>i%2?-8:8,duration:.25,ease:'none'},.60)
      .fromTo(scan,{y:0},{y:()=>section.querySelector('.ad-table').clientHeight*.72,duration:1,ease:'none'},0)
      .fromTo(word,{xPercent:12},{xPercent:-18,duration:1,ease:'none'},0);
  });
  const final=track(g.timeline({scrollTrigger:{trigger:'.ad-contact',start:'top bottom',end:'bottom bottom',scrub:.8,invalidateOnRefresh:true}}));
  final.fromTo('.ad-final-print',{rotation:16,y:120,scale:.75},{rotation:0,y:0,scale:1,duration:.7,ease:'power2.out'},0)
    .fromTo('.ad-signature',{xPercent:30},{xPercent:-5,duration:1,ease:'none'},0)
    .fromTo('.ad-contact-copy',{y:70},{y:0,duration:.5},.35);
  const stops=[document.querySelector('.ad-opening'),...sections,document.querySelector('.ad-contact')];
  const viewportWidth=()=>document.documentElement.clientWidth;
  let stableWidth=viewportWidth(), savedPosition=null, pendingPosition=null;
  let resizeTimer=0, settleFrame=0, disposed=false;
  const bounds=()=>{
    const tops=stops.map(section=>section.getBoundingClientRect().top+scrollY);
    const max=Math.max(0,document.documentElement.scrollHeight-innerHeight);
    return tops.map((top,index)=>({top,end:Math.max(top+1,Math.min(max,tops[index+1]??max))}));
  };
  let stableBounds=bounds();
  const rememberPosition=()=>{
    // Never derive a snapshot from the new layout or ScrollTrigger's temporary refresh scroll.
    if(disposed||pendingPosition||viewportWidth()!==stableWidth||S.isRefreshing)return;
    let index=0;
    stableBounds.forEach((range,i)=>{if(scrollY>=range.top)index=i;});
    const range=stableBounds[index];
    savedPosition={index,ratio:Math.max(0,Math.min(1,(scrollY-range.top)/(range.end-range.top))),width:stableWidth};
  };
  const applyPosition=()=>{
    const range=bounds()[pendingPosition.index];
    const top=range.top+(range.end-range.top)*pendingPosition.ratio;
    if(env.lenis)env.lenis.scrollTo(top,{immediate:true,force:true});
    else window.scrollTo({top,behavior:'instant'});
    S.update();
    timelines.forEach(t=>t.scrollTrigger?.getTween()?.progress(1));
  };
  const restorePosition=()=>{
    resizeTimer=0;
    if(disposed||!pendingPosition)return;
    S.refresh();
    applyPosition();
    // Keep the immutable snapshot through refresh and its queued scroll notifications.
    settleFrame=requestAnimationFrame(()=>{
      settleFrame=requestAnimationFrame(()=>{
        settleFrame=0;
        if(disposed||!pendingPosition)return;
        applyPosition();
        stableWidth=viewportWidth();stableBounds=bounds();
        savedPosition={...pendingPosition,width:stableWidth};
        pendingPosition=null;
      });
    });
  };
  const onResize=()=>{
    if(disposed)return;
    if(viewportWidth()===stableWidth&&!pendingPosition){stableBounds=bounds();return;}
    if(!pendingPosition&&savedPosition)pendingPosition={...savedPosition};
    clearTimeout(resizeTimer);cancelAnimationFrame(settleFrame);
    resizeTimer=setTimeout(restorePosition,220);
  };
  const onRefresh=()=>{
    if(!pendingPosition&&viewportWidth()===stableWidth)stableBounds=bounds();
  };
  const resizeObserver=new ResizeObserver(onResize);
  resizeObserver.observe(document.querySelector('.ad-opening-stage'));
  const cleanup=event=>{
    if(event.persisted)return;
    disposed=true;clearTimeout(resizeTimer);cancelAnimationFrame(settleFrame);resizeObserver.disconnect();
    window.removeEventListener('resize',onResize);
    window.removeEventListener('scroll',rememberPosition);
    window.removeEventListener('pagehide',cleanup);
    S.removeEventListener('refresh',onRefresh);
    timelines.forEach(t=>{t.scrollTrigger?.kill();t.kill();});
  };
  window.addEventListener('resize',onResize,{passive:true});
  window.addEventListener('scroll',rememberPosition,{passive:true});
  window.addEventListener('pagehide',cleanup);
  S.addEventListener('refresh',onRefresh);
  rememberPosition();
  A.refresh();
})();
