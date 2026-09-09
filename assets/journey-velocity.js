/* VOYAGE — one exhibition, six photographic rooms and a return passage. */
(() => {
 'use strict';
 const A=window.Atelier,D=window.MOCKUP_DATA?.proconcept,root=document.querySelector('#vj-app');
 if(!A||!D||!root)return;
 const env=A.setup(),g=env.gsap,projects=D.projects;
 const stage=root.querySelector('.vj-stage'),host=root.querySelector('.vj-surface'),track=root.querySelector('.vj-track');
 const sections=[...root.querySelectorAll('.vj-room')],finale=root.querySelector('.vj-finale');
 const heading=root.querySelector('.vj-heading'),destination=root.querySelector('.vj-destination'),sheet=root.querySelector('.vj-contact-sheet');
 const end=root.querySelector('.vj-end'),map=root.querySelector('.vj-map'),mapToggle=root.querySelector('.vj-map-toggle');
 const openButton=root.querySelector('.vj-open'),nextButton=root.querySelector('.vj-next');
 const ordered=projects.map(p=>{const lead=p.images.find(id=>{const im=A.get(id);return im.height>im.width*1.15;})||p.cover;return [lead,...p.images.filter(id=>id!==lead)].map(A.get);});
 const captions=['The entrance','Light and silhouette','A quieter perspective','The open room','Between the shows','The final production'];
 const state={travel:0,focus:0};
 let kit=null,live=false,room=0,frame=0,manual=false,focusTween=null,detailTimer=0,detailToken=0,detailTexture=null,requested='';
 let setDetail=()=>{},lastFocused=null;
 const clamp=(x,a=0,b=1)=>Math.min(b,Math.max(a,x));
 const smooth=(a,b,x)=>{const t=clamp((x-a)/(b-a));return t*t*(3-2*t);};
 const closeMap=()=>{map.hidden=true;mapToggle.setAttribute('aria-expanded','false');if(lastFocused?.isConnected)lastFocused.focus({preventScroll:true});};
 const jump=(index)=>{
  closeMap();
  const target=index<6?sections[index]:finale;
  const offset=live?(index<6?target.offsetHeight*.27:target.offsetHeight*.51):0;
  const y=target.getBoundingClientRect().top+scrollY+offset;
  if(env.lenis)env.lenis.scrollTo(y,{duration:1.35});else window.scrollTo({top:y,behavior:env.reduce?'auto':'smooth'});
 };
 mapToggle.addEventListener('click',()=>{lastFocused=mapToggle;map.hidden=false;mapToggle.setAttribute('aria-expanded','true');map.querySelector('.vj-map-close').focus();});
 root.querySelector('.vj-map-close').addEventListener('click',closeMap);
 map.addEventListener('keydown',event=>{
  if(event.key==='Escape'){event.preventDefault();closeMap();}
  if(event.key==='Tab'){const controls=[...map.querySelectorAll('button,a')];const first=controls[0],last=controls.at(-1);if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}}
 });
 root.querySelectorAll('.vj-header a,.vj-map nav a').forEach(a=>a.addEventListener('click',event=>{event.preventDefault();event.stopPropagation();const id=a.getAttribute('href');jump(id==='#contact'?6:Number(id.split('-')[1])-1);}));
 root.querySelector('.vj-revisit').addEventListener('click',()=>jump(0));
 root.querySelector('.vj-archive').addEventListener('click',event=>A.open(D.images.map(im=>im.id),0,event.currentTarget));
 openButton.addEventListener('click',()=>A.open(projects[room].images,Math.max(0,projects[room].images.indexOf(ordered[room][frame].id)),openButton));
 nextButton.addEventListener('click',()=>jump(room===5?6:room+1));
 function markFrame(index){
  frame=clamp(index,0,6);
  sheet.querySelectorAll('.vj-frame').forEach((button,i)=>button.setAttribute('aria-pressed',String(i===frame)));
  const image=ordered[room][frame];
  if(image.id!==requested){requested=image.id;clearTimeout(detailTimer);detailTimer=setTimeout(()=>setDetail(image,room,frame),100);}
 }
 function selectRoom(index){
  room=index;manual=false;focusTween?.kill();state.focus=0;
  destination.querySelector('h2').textContent=projects[index].title;
  root.querySelector('.vj-room-number').textContent=`0${index+1} / 06`;
  root.querySelector('.vj-room-caption').textContent=captions[index];
  root.querySelector('.vj-room-location').textContent=`ROOM 0${index+1} / ${projects[index].location||projects[index].category||'Pro Concept'}`;
  sheet.innerHTML=ordered[index].map((im,i)=>`<button class="vj-frame" aria-pressed="${i===0}" aria-label="Show ${A.esc(projects[index].title)} photograph ${i+1}" data-frame="${i}">${A.img(im,{sizes:'60px'})}<span>0${i+1}</span></button>`).join('');
  sheet.scrollLeft=0;
  nextButton.innerHTML=index===5?'The studio <span>↗</span>':'Next room <span>→</span>';
  markFrame(0);
 }
 sheet.addEventListener('click',event=>{const button=event.target.closest('[data-frame]');if(!button)return;manual=true;focusTween?.kill();const index=Number(button.dataset.frame);markFrame(index);if(kit?.alive)focusTween=kit.track(g.to(state,{focus:index,duration:.7,ease:'power3.inOut',onUpdate:()=>kit.invalidate()}));});
 const fallback=()=>{live=false;root.classList.remove('vj-live','vj-ending','vj-pale');stage.removeAttribute('style');closeMap();clearTimeout(detailTimer);};
 selectRoom(0);
 if(env.reduce||!g||!env.ScrollTrigger)return;
 start().catch(error=>{if(kit?.alive)kit.fail(error);else{console.warn('Voyage: all photographic rooms remain available.',error);fallback();}});
 async function start(){
  const {createLabScene}=await import('./lab-runtime.js');
  kit=await createLabScene({host,env,background:0x0c0d0f,onFallback:fallback});
  if(!kit?.alive)return;
  const {T,scene,camera,renderer}=kit;
  camera.fov=40;camera.near=.12;camera.far=270;camera.updateProjectionMatrix();
  const detail={texture:{value:null},index:{value:-1},aspect:{value:2/3}};
  const atlases=[];
  // Six small film atlases keep the full exhibition below a large-photo texture budget.
  for(let r=0;r<6;r++){
   const canvas=document.createElement('canvas');canvas.width=7*192;canvas.height=288;
   const ctx=canvas.getContext('2d');if(!ctx)throw new Error('Photographic contact sheet could not be created.');
   ctx.fillStyle='#dfded8';ctx.fillRect(0,0,canvas.width,canvas.height);
   await Promise.all(ordered[r].map((im,i)=>new Promise((resolve,reject)=>{
    const image=new Image();image.decoding='async';image.onload=()=>{if(kit.alive){const scale=Math.min(188/image.naturalWidth,284/image.naturalHeight);const w=image.naturalWidth*scale,h=image.naturalHeight*scale;ctx.drawImage(image,i*192+(192-w)/2,(288-h)/2,w,h);}image.src='';resolve();};image.onerror=()=>reject(new Error('An exhibition photograph could not load.'));image.src=im.thumb;
   })));
   if(!kit.alive)return;
   const texture=kit.track(new T.CanvasTexture(canvas));texture.colorSpace=T.SRGBColorSpace;texture.anisotropy=Math.min(4,renderer.capabilities.getMaxAnisotropy());atlases.push(texture);
   kit.addCleanup(()=>{canvas.width=canvas.height=1;});
  }
  const plane=kit.track(new T.PlaneGeometry(1,1)),box=kit.track(new T.BoxGeometry(1,1,1));
  const silver=kit.track(new T.MeshStandardMaterial({color:0xbfc1c5,metalness:.65,roughness:.35}));
  const inner=kit.track(new T.MeshStandardMaterial({color:0x26292e,metalness:.3,roughness:.5}));
  const white=kit.track(new T.MeshBasicMaterial({color:0xe4e4df}));
  scene.add(new T.HemisphereLight(0xf1f3ff,0x1b1b20,2.1));
  const key=new T.DirectionalLight(0xffffff,3.4);key.position.set(-4,8,12);scene.add(key);
  const rim=new T.DirectionalLight(0xa7b3c8,2);rim.position.set(6,-2,-6);scene.add(rim);
  function block(parent,material,x,y,z,w,h,d){const mesh=new T.Mesh(box,material);mesh.position.set(x,y,z);mesh.scale.set(w,h,d);parent.add(mesh);return mesh;}
  const rooms=[];
  const vertexShader='varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}';
  const fragmentShader=`uniform sampler2D uAtlas,uDetail;uniform float uCell,uIndex,uDetailIndex,uAspect;varying vec2 vUv;void main(){vec2 q=vUv;vec3 c=texture2D(uAtlas,vec2((uCell+mix(.007,.993,q.x))/7.,mix(.007,.993,q.y))).rgb;if(abs(uIndex-uDetailIndex)<.1){float a=uAspect/(2./3.);if(a>1.)q.y=(q.y-.5)*a+.5;else q.x=(q.x-.5)/a+.5;if(q.x>=0.&&q.x<=1.&&q.y>=0.&&q.y<=1.)c=texture2D(uDetail,q).rgb;else c=vec3(.74);}gl_FragColor=vec4(c,1.);#include <tonemapping_fragment>\n#include <colorspace_fragment>}`.replace(';#include',';\n#include');
  for(let r=0;r<6;r++){
   const group=new T.Group();group.position.z=-r*32;scene.add(group);
   const portals=new T.Group();group.add(portals);
   const walls=[new T.Group(),new T.Group()];walls.forEach(w=>portals.add(w));
   // Thick columns, soffits and illuminated insets reveal the volume of each room.
   [5,9,12].forEach((distance,j)=>{
    const viewH=2*Math.tan(40*Math.PI/360)*distance,h=viewH*[1.3,1.1,.94][j],w=viewH*.82*[1.38,1.2,1.04][j],z=14-distance;
    walls.forEach((wall,side)=>{const s=side?1:-1;block(wall,silver,s*w/2,0,z,.25,h,.75);block(wall,inner,s*w/2+s*.18,0,z-.25,.14,h+.12,1.3);block(wall,silver,s*w/4,h/2,z,w/2+.15,.22,.85);block(wall,silver,s*w/4,-h/2,z,w/2+.15,.22,.85);block(wall,white,s*(w/2-.14),0,z+.39,.025,h-.35,.025);});
   });
   const prints=[];
   for(let i=0;i<7;i++){
    const mat=kit.track(new T.ShaderMaterial({vertexShader,fragmentShader,side:T.DoubleSide,uniforms:{uAtlas:{value:atlases[r]},uCell:{value:i},uIndex:{value:r*7+i},uDetail:detail.texture,uDetailIndex:detail.index,uAspect:detail.aspect}}));
    const mesh=new T.Mesh(plane,mat);group.add(mesh);prints.push(mesh);
   }
   rooms.push({group,portals,walls,prints});
  }
  setDetail=async(image,r,f)=>{
   if(!kit.alive)return;const token=++detailToken;
   try{const tex=await kit.loadTexture(image.src);if(!kit.alive)return;if(token!==detailToken){tex.dispose();tex.image=null;return;}if(detailTexture){detailTexture.dispose();detailTexture.image=null;}detailTexture=tex;detail.texture.value=tex;detail.index.value=r*7+f;detail.aspect.value=image.width/image.height;kit.invalidate();}
   catch(error){if(kit.alive)console.warn('Voyage: keeping the complete contact-sheet photograph.',error);}
  };
  requested='';markFrame(0);
  const dark=new T.Color(0x0c0d0f),pale=new T.Color(0xe8e7e2),background=new T.Color();
  let current=-1,stableWidth=innerWidth,stableTravel=state.travel,resizeTravel=null;
  function compose(){
   if(innerWidth!==stableWidth&&resizeTravel===null)resizeTravel=stableTravel;
   const travel=resizeTravel===null?state.travel:resizeTravel;
   if(resizeTravel===null)stableTravel=travel;
   const active=Math.min(5,Math.floor(travel)),local=clamp(travel-active),out=smooth(6,6.58,travel);
   if(active!==current){current=active;selectRoom(active);}
   const focus=manual?state.focus:smooth(.22,.70,local)*2;
   if(!manual){state.focus=focus;markFrame(Math.round(focus));}
   const advance=active<5?smooth(.79,1,local):0,z=14-(active+advance)*32;
   const stopZ=14-5*32;
   camera.position.set(Math.sin(advance*Math.PI)*.65*(active%2?-1:1),Math.sin(advance*Math.PI)*.22,travel<6?z:T.MathUtils.lerp(stopZ,58,smooth(0,.85,out)));
   camera.lookAt(0,0,camera.position.z-20);
   camera.rotateZ(Math.sin(advance*Math.PI)*.035*(active%2?-1:1)*(1-out));
   const paleRoom=(active===2||active===3)?1:0;
   const nextPale=(active+1===2||active+1===3)?1:0;
   const lightValue=travel>=6?smooth(.18,.65,out):T.MathUtils.lerp(paleRoom,nextPale,smooth(.79,1,local));
   background.copy(dark).lerp(pale,lightValue);renderer.setClearColor(background,1);stage.style.backgroundColor=`#${background.getHexString()}`;root.classList.toggle('vj-pale',lightValue>.6);
   const endVisible=travel>6.23;
   end.hidden=!endVisible;root.classList.toggle('vj-ending',endVisible);
   heading.style.opacity=String((1-smooth(0,.4,local)*.86)*(1-out));
   root.querySelector('.vj-progress span').style.transform=`scaleX(${clamp(travel/6.6)})`;
   const aspect=camera.aspect,fit=Math.min(1,aspect/.78);
   rooms.forEach((item,r)=>{
    const delta=r-active,exit=travel>=6;
    item.group.visible=exit||delta===0||delta===1;
    if(!item.group.visible)return;
    const finaleGather=smooth(.65,1,out);
    item.group.position.set((r%2?1:-1)*finaleGather*8.5,((r%3)-1)*finaleGather*5.5,-r*32*(1-finaleGather));
    item.group.scale.setScalar(1-finaleGather*.35);
    const ownLocal=r===active?local:0,opening=smooth(.02,.25,ownLocal);
    item.portals.scale.x=aspect/.82;
    item.walls.forEach((wall,side)=>{const sign=side?1:-1;wall.position.x=sign*opening*.7;wall.rotation.y=sign*opening*.09;});
    item.portals.visible=finaleGather<.8;
    item.prints.forEach((print,i)=>{
     const distance=i-(r===active?focus:0),near=Math.abs(distance);
     const spread=T.MathUtils.lerp(2.9,4.8,opening)*fit;
     print.position.set(distance*spread,Math.sin(distance*.7)*.25*opening,-Math.min(near,3)*1.8-advance*3);
     print.rotation.y=-clamp(distance,-1,1)*T.MathUtils.lerp(.95,.22,opening);
     const h=(7.5-near*.72)*fit;
     print.scale.set(Math.max(2,h)*2/3,Math.max(2,h),1);
     print.visible=exit?i===0:near<2.2;
     if(exit){print.position.set(0,0,0);print.rotation.y=0;print.scale.set(5,7.5,1);}
    });
   });
  }
  kit.onFrame(compose);kit.onResize(()=>kit.invalidate());
  root.classList.add('vj-live');
  if(!kit.ready())return;
  live=true;
  const storyTween=kit.track(g.to(state,{travel:6.6,ease:'none',onUpdate:()=>kit.invalidate(),scrollTrigger:{trigger:track,start:'top top',end:'bottom bottom',scrub:.55,invalidateOnRefresh:true}}));
  // A rotation changes the height of all seven rooms. Preserve the exhibition
  // position rather than reinterpreting the old pixel scroll offset.
  let resizeTimer=0;
  function restorePosition(){
   resizeTimer=0;
   if(!kit.alive||!live||resizeTravel===null)return;
   const progress=clamp(resizeTravel/6.6);
   env.ScrollTrigger.refresh();
   const trigger=storyTween.scrollTrigger;
   const target=trigger.start+(trigger.end-trigger.start)*progress;
   if(env.lenis)env.lenis.scrollTo(target,{immediate:true,force:true});
   else window.scrollTo({top:target,behavior:'instant'});
   env.ScrollTrigger.update();
   trigger.getTween()?.progress(1);
   storyTween.progress(progress);state.travel=progress*6.6;
   stableWidth=innerWidth;stableTravel=state.travel;resizeTravel=null;
   kit.invalidate();
  }
  function onViewportResize(){
   if(!kit.alive||!live||(innerWidth===stableWidth&&resizeTravel===null))return;
   if(resizeTravel===null)resizeTravel=stableTravel;
   clearTimeout(resizeTimer);resizeTimer=setTimeout(restorePosition,180);
  }
  window.addEventListener('resize',onViewportResize,{passive:true});
  kit.addCleanup(()=>{window.removeEventListener('resize',onViewportResize);clearTimeout(resizeTimer);resizeTravel=null;});
  kit.addCleanup(()=>{live=false;detailToken++;clearTimeout(detailTimer);focusTween?.kill();});
  A.refresh();
 }
})();
