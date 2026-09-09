/* Helix Press: original continuous ribbon geometry, composed with the shared GPU lifecycle. */
const A=window.Atelier,D=window.MOCKUP_DATA?.proconcept,root=document.querySelector('#hx-app');
if(A&&D&&root){
 const E=A.esc,projects=D.projects;
 const portrait=p=>p.images.map(A.get).find(im=>im&&im.height>im.width*1.1)||A.get(p.cover);
 const images=projects.map(portrait);
 const number=i=>String(i+1).padStart(2,'0');
 const photo=(id,eager=false)=>A.photo(id,{caption:false,eager});
 const galleryButton=(p,cls,text)=>`<button class="${cls}" data-photo="${E(p.cover)}" data-collection="${E(p.images.join(','))}">${text}</button>`;
 root.innerHTML=`<section class="hx-story" id="top"><div class="hx-stage"><header class="hx-nav"><a class="hx-logo" href="#top">PRO<span>CONCEPT</span></a><nav aria-label="Main navigation"><a href="#work">Work</a><a href="#studio">Studio</a><a href="#contact">Contact ↗</a></nav></header><div class="hx-heading"><span class="hx-eyebrow">Six productions / One continuous strip</span><h1>HELIX<span>PRESS.</span></h1><span class="hx-subtitle">The moving image, reimagined.</span></div><span class="hx-coordinate">PRO CONCEPT — PHOTOGRAPHIC STUDIES</span><div class="hx-surface" aria-label="A continuous spiral of photographic film"><div class="hx-fallback">${images.map((im,i)=>photo(im.id,i===0)).join('')}</div></div><span class="hx-watermark" aria-hidden="true">06</span><div class="hx-stage-rail"><b class="hx-act-label">01 / The sculpture</b><nav class="hx-chapters" aria-label="Scene chapters"><button data-chapter="0" aria-label="The sculpture" aria-pressed="true">01</button><button data-chapter=".46" aria-label="Around the ribbon" aria-pressed="false">02</button><button data-chapter="1" aria-label="Unroll the selected photograph" aria-pressed="false">03</button></nav></div><div class="hx-controls"><button class="hx-current" aria-label="Open selected production"><span><small>01 / 06 — Full project</small><strong>${E(projects[0].title)}</strong></span><span aria-hidden="true">↗</span></button><button class="hx-prev" aria-label="Previous production">←</button><button class="hx-next" aria-label="Next production">→</button></div><a class="hx-scroll-hint" href="#work">ALL PRODUCTIONS <span>↓</span></a></div></section><section class="hx-work" id="work"><header class="hx-work-heading"><span class="hx-eyebrow">The work / Pro Concept</span><h2>Each production.<br><em>Every perspective.</em></h2><p>Follow the photographs from the opening frame to the details.</p></header>${projects.map((p,i)=>`<article class="hx-case"><header class="hx-case-heading"><span class="hx-case-number">${number(i)}</span><h3>${E(p.title)}<small>${E(p.category||'Selected production')}</small></h3>${galleryButton(p,'hx-case-open','<span aria-hidden="true">↗</span><span class="sr-only">Open '+E(p.title)+'</span>')}</header><div class="hx-filmstrip">${p.images.slice(0,4).map((id,j)=>`<div class="hx-frame">${photo(id)}<span>${number(j)} — ${E(p.title)}</span></div>`).join('')}</div>${galleryButton(p,'hx-all','View the complete project <span>↗</span>')}</article>`).join('')}</section><section class="hx-studio" id="studio"><span class="hx-eyebrow">The studio / Pro Concept</span><h2>Ideas in<br><em>motion.</em></h2>${photo(images[1].id)}<div><p>A production takes shape through the images it leaves behind.</p><p>Explore the projects, discover the details, and bring your next brief into the conversation.</p><a href="#contact">Talk to Pro Concept ↗</a></div></section><footer class="hx-footer" id="contact"><span class="hx-eyebrow">Your next production</span><a class="hx-contact" href="mailto:${E(D.email)}">Let’s make<span>the next frame. ↗</span></a><div class="hx-footer-bottom"><a href="mailto:${E(D.email)}">${E(D.email)}</a><span>PRO CONCEPT</span><a href="#top">Return to the sculpture ↑</a></div></footer>`;
 const env=A.setup(),g=env.gsap,host=root.querySelector('.hx-surface'),stage=root.querySelector('.hx-stage'),story=root.querySelector('.hx-story');
 const state={progress:0,selection:0,intro:0},labels=['The sculpture','Around the ribbon','The complete frame'];
 let selected=0,kit=null,selectionTween=null;
 const fallback=()=>{root.classList.add('hx-static');stage.classList.remove('hx-gpu');};
 const label=()=>{root.querySelector('.hx-current strong').textContent=projects[selected].title;root.querySelector('.hx-current small').textContent=`${number(selected)} / 06 — Full project`;};
 const choose=(step)=>{selected=(selected+step+projects.length)%projects.length;label();if(kit?.alive&&g){selectionTween?.kill();selectionTween=kit.track(g.to(state,{selection:selected,duration:.9,ease:'power3.inOut',onUpdate:()=>kit.invalidate()}));promote(selected);}else A.open(projects[selected].images,Math.max(0,projects[selected].images.indexOf(images[selected].id)),root.querySelector('.hx-current'));};
 root.querySelector('.hx-prev').addEventListener('click',()=>choose(-1));
 root.querySelector('.hx-next').addEventListener('click',()=>choose(1));
 root.querySelector('.hx-current').addEventListener('click',e=>A.open(projects[selected].images,Math.max(0,projects[selected].images.indexOf(images[selected].id)),e.currentTarget));
 const goTo=value=>{if(root.classList.contains('hx-static'))return;const top=story.getBoundingClientRect().top+scrollY;window.scrollTo({top:top+(story.offsetHeight-stage.offsetHeight)*value,behavior:env.reduce?'auto':'smooth'});};
 root.querySelectorAll('[data-chapter]').forEach(button=>button.addEventListener('click',()=>goTo(Number(button.dataset.chapter))));
 let promote=()=>{};
 start().catch(error=>{if(kit?.alive)kit.fail(error);else{console.warn('Helix Press: the photographic gallery is available.',error);fallback();}});

 async function start(){
  const {createLabScene}=await import('./lab-runtime.js');
  kit=await createLabScene({host,env,background:0xf2f3f5,onFallback:fallback});
  if(!kit?.alive)return;
  const {T,scene,camera}=kit;
  // All atlas pixels come from the client's local photographs, preserving their whole frame.
  const loaded=await Promise.all(images.map(im=>new Promise((resolve,reject)=>{const image=new Image();image.decoding='async';image.onload=()=>resolve(image);image.onerror=()=>reject(new Error('A film photograph could not load.'));image.src=im.thumb;})));
  if(!kit.alive)return;
  const tileW=256,tileH=384,atlasCanvas=document.createElement('canvas');atlasCanvas.width=tileW*images.length;atlasCanvas.height=tileH;
  const ctx=atlasCanvas.getContext('2d');if(!ctx)throw new Error('The photographic atlas could not be prepared.');
  ctx.fillStyle='#e8e9eb';ctx.fillRect(0,0,atlasCanvas.width,atlasCanvas.height);
  loaded.forEach((image,i)=>{const scale=Math.min((tileW-6)/image.naturalWidth,(tileH-6)/image.naturalHeight);const w=image.naturalWidth*scale,h=image.naturalHeight*scale;ctx.drawImage(image,i*tileW+(tileW-w)/2,(tileH-h)/2,w,h);});
  const atlas=kit.track(new T.CanvasTexture(atlasCanvas));atlas.colorSpace=T.SRGBColorSpace;atlas.anisotropy=Math.min(4,kit.renderer.capabilities.getMaxAnisotropy());
  const uniforms={uAtlas:{value:atlas},uHero:{value:atlas},uHeroReady:{value:0},uHeroAspect:{value:images[0].width/images[0].height},uHeroIndex:{value:0},uProgress:{value:0},uSelection:{value:0},uIntro:{value:0}};
  const along=432,across=12,positions=[],uv=[],indices=[];
  for(let i=0;i<=along;i++)for(let j=0;j<=across;j++){positions.push(i/along,j/across,0);uv.push(i/along,j/across);}
  for(let i=0;i<along;i++)for(let j=0;j<across;j++){const a=i*(across+1)+j,b=a+across+1;indices.push(a,b,a+1,b,b+1,a+1);}
  const geometry=kit.track(new T.BufferGeometry());geometry.setAttribute('position',new T.Float32BufferAttribute(positions,3));geometry.setAttribute('uv',new T.Float32BufferAttribute(uv,2));geometry.setIndex(indices);
  const material=kit.track(new T.ShaderMaterial({uniforms,side:T.DoubleSide,transparent:true,depthWrite:true,vertexShader:`
   uniform float uProgress,uSelection,uIntro;
   varying vec2 vUv;varying vec3 vNormal;varying vec3 vView;
   void main(){
    vUv=uv;float p=uProgress;float unfold=smoothstep(.62,.98,p);float center=(uSelection+.5)/6.;
    float theta=(uv.x-center)*8.48230016+1.57079633-p*.8;
    float radius=2.75+(1.-uIntro)*1.5;
    vec3 coil=vec3(cos(theta)*radius,(uv.x-.5)*6.8+(uv.y-.5)*4.4,sin(theta)*radius);
    coil.y+=(1.-uIntro)*(uv.x-.5)*6.;
    vec3 unfoldedPosition=vec3((uv.x-center)*6.*3.8,(uv.y-.5)*6.82,0.);
    vec3 pos=mix(coil,unfoldedPosition,unfold);
    vec3 normalCoil=vec3(cos(theta),0.,sin(theta));
    vNormal=normalize(normalMatrix*mix(normalCoil,vec3(0.,0.,1.),unfold));
    vec4 mv=modelViewMatrix*vec4(pos,1.);vView=-mv.xyz;gl_Position=projectionMatrix*mv;
   }`,fragmentShader:`
   uniform sampler2D uAtlas,uHero;uniform float uHeroReady,uHeroAspect,uHeroIndex,uProgress,uSelection,uIntro;
   varying vec2 vUv;varying vec3 vNormal;varying vec3 vView;
   void main(){
    float cell=min(5.,floor(vUv.x*6.));float local=fract(min(vUv.x,.999999)*6.);float y=vUv.y;
    float hole=step(.20,fract(vUv.x*96.))*step(fract(vUv.x*96.),.80);
    if((y<.047||y>.953)&&hole>.5)discard;
    float edge=1.-step(.082,y)*step(y,.918);
    float divider=1.-smoothstep(.009,.017,min(local,1.-local));
    vec2 frame=vec2(local,(y-.082)/.836);frame=clamp(frame,0.,1.);
    vec2 atlasUv=vec2((cell+mix(.006,.994,frame.x))/6.,mix(.004,.996,frame.y));
    vec3 color=texture2D(uAtlas,atlasUv).rgb;
    if(abs(cell-uHeroIndex)<.1&&uHeroReady>.5){
     vec2 fitUv=frame;float a=uHeroAspect/(2./3.);
     if(a>1.)fitUv.y=(fitUv.y-.5)*a+.5;else fitUv.x=(fitUv.x-.5)/a+.5;
     bool inside=all(greaterThanEqual(fitUv,vec2(0.)))&&all(lessThanEqual(fitUv,vec2(1.)));
     color=inside?texture2D(uHero,fitUv).rgb:vec3(.81);
    }
    vec3 n=normalize(vNormal);if(!gl_FrontFacing)n=-n;
    float fresnel=pow(1.-abs(dot(n,normalize(vView))),3.);
    float metal=.16+.63*pow(abs(dot(n,normalize(vec3(.5,.8,1.)))),10.)+fresnel*.3;
    color=mix(color,vec3(metal),max(edge,divider));
    float flatten=smoothstep(.66,1.,uProgress);
    float distant=min(1.,abs(cell-uSelection));
    float alpha=(1.-flatten*.97*distant)*smoothstep(0.,.5,uIntro);
    gl_FragColor=vec4(color,alpha);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
   }` }));
  const ribbon=new T.Mesh(geometry,material);ribbon.frustumCulled=false;scene.add(ribbon);
  let heroTexture=null,request=0;
  promote=async(index)=>{
   const token=++request;uniforms.uHeroReady.value=0;kit.invalidate();
   try{const texture=await kit.loadTexture(images[index].src);if(!kit.alive)return;if(token!==request){texture.dispose();texture.image=null;return;}
    if(heroTexture){heroTexture.dispose();heroTexture.image=null;}heroTexture=texture;uniforms.uHero.value=texture;uniforms.uHeroAspect.value=images[index].width/images[index].height;uniforms.uHeroIndex.value=index;uniforms.uHeroReady.value=1;kit.invalidate();
   }catch(error){if(kit.alive)console.warn('Helix Press: retaining the complete atlas photograph.',error);}
  };
  kit.addCleanup(()=>{request++;loaded.forEach(image=>{image.src='';});atlasCanvas.width=atlasCanvas.height=1;});
  const smooth=(a,b,x)=>{const n=Math.max(0,Math.min(1,(x-a)/(b-a)));return n*n*(3-2*n);};
  kit.onFrame(()=>{
   const p=state.progress,flat=smooth(.62,.98,p),sweep=Math.sin(p*Math.PI)*1.2;
   uniforms.uProgress.value=p;uniforms.uSelection.value=state.selection;uniforms.uIntro.value=state.intro;
   const distance=T.MathUtils.lerp(14.6,10.2,flat);const orbit=sweep*(1-flat);
   const follow=(state.selection+.5)/6.-.5;const aimY=follow*6.8*Math.sin(p*Math.PI)*(1-flat);
   camera.position.set(Math.sin(orbit)*distance,aimY+Math.sin(p*Math.PI)*1.15,Math.cos(orbit)*distance);
   camera.lookAt(0,aimY,0);ribbon.rotation.z=T.MathUtils.lerp(-.12,0,flat);
   const act=p<.24?0:p<.7?1:2;stage.dataset.act=String(act+1);
   root.querySelector('.hx-act-label').textContent=`${number(act)} / ${labels[act]}`;
   root.querySelectorAll('[data-chapter]').forEach((button,i)=>button.setAttribute('aria-pressed',String(i===act)));
   root.querySelector('.hx-heading').style.opacity=String(1-flat*.9);
  });
  kit.onResize(()=>kit.invalidate());
  state.intro=1;
  if(!kit.ready())return;
  stage.classList.add('hx-gpu');
  kit.track(g.fromTo(state,{intro:0},{intro:1,duration:1.6,ease:'power3.out',onUpdate:()=>kit.invalidate()}));
  if(env.ScrollTrigger)kit.track(g.to(state,{progress:1,ease:'none',onUpdate:()=>kit.invalidate(),scrollTrigger:{trigger:story,start:'top top',end:'bottom bottom',scrub:.65,invalidateOnRefresh:true}}));
  promote(0);
  let down=null;const pointers=new Set();
  const downHandler=e=>{pointers.add(e.pointerId);down=pointers.size===1?{x:e.clientX,y:e.clientY,id:e.pointerId}:null;};
  const cancelHandler=e=>{pointers.delete(e.pointerId);down=null;};
  const upHandler=e=>{pointers.delete(e.pointerId);if(!down||down.id!==e.pointerId){down=null;return;}const dx=e.clientX-down.x,dy=e.clientY-down.y;down=null;if(Math.abs(dx)>50&&Math.abs(dx)>Math.abs(dy)*1.5)choose(dx<0?1:-1);else if(Math.hypot(dx,dy)<8)goTo(1);};
  host.addEventListener('pointerdown',downHandler);host.addEventListener('pointercancel',cancelHandler);host.addEventListener('pointerup',upHandler);
  kit.addCleanup(()=>{host.removeEventListener('pointerdown',downHandler);host.removeEventListener('pointercancel',cancelHandler);host.removeEventListener('pointerup',upHandler);});
  A.refresh();
 }
}
