(() => {
  'use strict';
  const A = window.Atelier, D = window.MOCKUP_DATA?.elena;
  if (!A || !D) return;
  const E = A.esc;
  const ids = ['516d35_2c57ef3bbd1f4444b5b822ab42e1adcd~mv2.jpeg','516d35_fb77e78515814e428742387df6d00423~mv2.jpg','516d35_e3fde001b3ef4a2585390c1b901a5ff3~mv2.jpg'];
  const images = ids.map(A.get);
  const words = ['A gesture.','A detail.','A different light.'];
  const photo = (id, eager = false) => A.photo(id,{caption:false,eager});
  const root = document.querySelector('#sb-app');
  root.innerHTML = `<header class="sb-header"><a href="#top" class="sb-brand">ELENA<br>BELOUSOVA</a><nav aria-label="Main navigation"><a href="#work">Photographs</a><a href="#contact">Contact ↗</a></nav></header><main><section class="sb-journey" id="top"><div class="sb-stage"><h1 class="sb-title"><b>THE ART</b><span>of seeing.</span></h1><div class="sb-world"><div class="sb-static">${photo(ids[0],true)}</div><div class="sb-orbit-type" aria-hidden="true"><svg viewBox="0 0 230 230"><defs><path id="sb-circle" d="M115 12 a103 103 0 1 1 -0.01 0"/></defs><text><textPath href="#sb-circle">ELENA BELOUSOVA · FASHION PHOTOGRAPHY · </textPath></text></svg></div></div><p class="sb-caption">Elena Belousova<i>${words[0]}</i></p><div class="sb-bottom"><nav class="sb-chapters" aria-label="Optical scenes">${['Observe','Pass through','Reframe'].map((label,i)=>`<button data-sb-chapter="${i}" aria-pressed="${i===0}"><span>0${i+1}</span>${label}</button>`).join('')}</nav><div class="sb-actions"><span class="sb-sensory">Touch the light</span><button class="sb-next" aria-label="Next optical scene">Next ↗</button><button class="sb-open">Full photograph <span>↗</span></button></div></div><a href="#work" class="sb-enter">Selected work <span>↓</span></a></div></section><section class="sb-work" id="work"><div class="sb-work-intro"><p>Fashion photography by Elena Belousova</p><h2>Look closer.<i>Feel more.</i></h2><nav class="sb-work-nav" aria-label="Collections">${D.projects.map((p,i)=>`<a href="#sb-series-${i}">${E(p.title)}</a>`).join('')}</nav></div>${D.projects.map((p,i)=>`<section class="sb-series" id="sb-series-${i}"><header class="sb-series-head"><h3>${E(p.title)}</h3><button data-sb-case="${i}">View the complete collection ↗</button></header><div class="sb-prints">${p.images.slice(0,4).map((id,j)=>`<figure>${photo(id)}<figcaption>${E(p.title)} / ${String(j+1).padStart(2,'0')}</figcaption></figure>`).join('')}</div></section>`).join('')}<section class="sb-seeing" aria-label="A closer look"><p>The light.<br>The texture.<br>The feeling.</p>${photo(ids[1])}</section></section><footer class="sb-contact" id="contact"><div class="sb-metal" aria-hidden="true"></div><p>Elena Belousova</p><a href="mailto:${E(D.email)}">Let’s make<br><i>something felt.</i> ↗</a><div class="sb-contact-bottom"><a href="mailto:${E(D.email)}">${E(D.email)}</a><a href="#top">Back to the light ↑</a></div></footer></main>`;
  const env = A.setup(), g = env.gsap;
  const host = root.querySelector('.sb-world');
  const story = root.querySelector('.sb-journey');
  const stage = root.querySelector('.sb-stage');
  const state = { progress:0, intro:0, pulse:0, pointerX:0, pointerY:0, pulseX:0, pulseY:0 };
  let kit = null, current = 0;
  let uniformSet = null;
  const fallback = () => { document.body.classList.add('sb-static-mode');host.removeAttribute('role');host.removeAttribute('tabindex');host.removeAttribute('aria-label');const title=root.querySelector('.sb-title');title.style.transform='';title.style.opacity='';host.querySelector('.sb-static').innerHTML=photo(ids[current],true);A.refresh(); };
  function update() {
    current = Math.min(2,Math.floor(state.progress*2+.5));
    stage.dataset.scene = String(current);
    root.querySelector('.sb-caption i').textContent = words[current];
    root.querySelectorAll('[data-sb-chapter]').forEach((b,i)=>b.setAttribute('aria-pressed',String(i===current)));
    root.querySelector('.sb-open').setAttribute('aria-label',`Open full photograph: ${words[current]}`);
    if (!kit?.alive) return;
    const p = state.progress;
    const flight = Math.sin(p*Math.PI);
    const title = root.querySelector('.sb-title');
    title.style.transform = `translate(${flight*-22}%,${flight*-14}%) rotate(${-flight*8}deg)`;
    title.style.opacity = String(1-flight*.62);
    root.querySelector('.sb-orbit-type').style.transform = `translate(-50%,-50%) rotate(${p*270+state.intro*30}deg) scale(${1-flight*.5})`;
    root.querySelector('.sb-orbit-type').style.opacity = String(.6*(1-flight));
    kit.invalidate();
  }
  function chapter(index) {
    const i = (index+3)%3;
    if (!kit?.alive) {
      current=i;host.querySelector('.sb-static').innerHTML=photo(ids[i],true);
      root.querySelector('.sb-open').setAttribute('aria-label',`Open full photograph: ${words[i]}`);
      return;
    }
    const top = story.getBoundingClientRect().top+scrollY;
    window.scrollTo({top:top+(story.offsetHeight-stage.offsetHeight)*i/2,behavior:env.reduce?'instant':'smooth'});
  }
  root.querySelectorAll('[data-sb-chapter]').forEach(b=>b.addEventListener('click',()=>chapter(Number(b.dataset.sbChapter))));
  root.querySelector('.sb-next').addEventListener('click',()=>chapter(current+1));
  root.querySelector('.sb-open').addEventListener('click',event=>A.open(ids,current,event.currentTarget));
  root.querySelectorAll('[data-sb-case]').forEach(b=>b.addEventListener('click',()=>A.open(D.projects[Number(b.dataset.sbCase)].images,0,b)));
  if (env.reduce || !g) { fallback(); return; }
  root.querySelectorAll('.sb-series').forEach((section,i)=>{
    A.track(g.fromTo(section.querySelectorAll('figure'),{y:j=>40+j*25,rotation:j=>(j%2?1:-1)*6},{y:0,rotation:0,ease:'none',stagger:.08,scrollTrigger:{trigger:section,start:'top 90%',end:'top 20%',scrub:.7}}));
  });
  A.track(g.fromTo('.sb-metal',{rotation:-28,scaleX:.6},{rotation:60,scaleX:.9,ease:'none',scrollTrigger:{trigger:'.sb-contact',start:'top bottom',end:'bottom bottom',scrub:.8}}));
  start().catch(error=>{if(kit?.alive)kit.fail(error);else{console.warn('Optical gallery unavailable.',error);fallback();}});

  async function start() {
    const {createLabScene}=await import('./lab-runtime.js');
    kit=await createLabScene({host,env,background:0xefefec,onFallback:fallback});
    if(!kit)return;
    const {T}=kit;
    const textures=await Promise.all(images.map(im=>kit.loadTexture(im.src)));
    if(!kit.alive)return;
    kit.camera=new T.OrthographicCamera(-1,1,1,-1,0,2);
    kit.camera.position.z=1;
    uniformSet={uPaper:{value:new T.Color(0xefefec)},uA:{value:textures[0]},uB:{value:textures[1]},uAspectA:{value:images[0].width/images[0].height},uAspectB:{value:images[1].width/images[1].height},uSize:{value:new T.Vector2(1,1)},uMix:{value:0},uProgress:{value:0},uIntro:{value:0},uPointer:{value:new T.Vector2()},uPulsePoint:{value:new T.Vector2()},uPulse:{value:0},uTime:{value:0}};
    const material=kit.track(new T.ShaderMaterial({uniforms:uniformSet,depthTest:false,depthWrite:false,toneMapped:false,vertexShader:`varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}`,fragmentShader:`
      precision highp float;
      uniform sampler2D uA,uB;
      uniform vec2 uSize,uPointer,uPulsePoint;
      uniform float uAspectA,uAspectB,uMix,uProgress,uIntro,uPulse,uTime;
      varying vec2 vUv;
      uniform vec3 uPaper;
      #define PAPER uPaper
      float aa(float edge,float value){return smoothstep(edge-.002,edge+.002,value);}
      vec3 photograph(vec2 p){
        float a=uSize.x/uSize.y;
        float h=min(.94,a*.87/min(uAspectA,uAspectB));
        vec2 ra=vec2(h*uAspectA,h),rb=vec2(h*uAspectB,h);
        vec2 ua=p/ra+.5,ub=p/rb+.5;
        float ma=(1.-aa(.5,abs(ua.x-.5)))*(1.-aa(.5,abs(ua.y-.5)));
        float mb=(1.-aa(.5,abs(ub.x-.5)))*(1.-aa(.5,abs(ub.y-.5)));
        vec3 ca=mix(PAPER,texture2D(uA,clamp(ua,.001,.999)).rgb,ma);
        vec3 cb=mix(PAPER,texture2D(uB,clamp(ub,.001,.999)).rgb,mb);
        return mix(ca,cb,uMix);
      }
      vec3 lens(vec2 p,vec2 c,float radius,vec3 under,float strength){
        vec2 q=p-c;float d=length(q);vec2 direction=q/max(d,.001);
        float interior=1.-smoothstep(radius-.009,radius+.002,d);
        float depth=sqrt(max(0.,1.-pow(d/radius,2.)));
        vec2 warped=c+q*(.79+.13*pow(d/radius,2.));
        float ripple=sin(length(p-uPulsePoint)*44.-uTime*7.)*uPulse*.016*exp(-length(p-uPulsePoint)*3.);
        warped+=direction*(ripple+.006*depth);
        vec3 refracted=photograph(warped);
        float sheen=pow(max(0.,dot(normalize(vec3(q/radius,depth)),normalize(vec3(-.65,.75,1.)))),10.);
        refracted=mix(refracted,vec3(1.),sheen*.18);
        vec3 color=mix(under,refracted,interior*strength);
        float band=(d-radius)/.027;
        float rim=1.-smoothstep(.92,1.04,abs(band));
        float rz=sqrt(max(0.,1.-band*band));
        vec3 normal=normalize(vec3(direction*band,rz));
        float light=dot(normal,normalize(vec3(-.4,.7,1.)));
        float silver=.2+.62*pow(max(light,0.),.4)+.25*pow(max(light,0.),20.);
        silver+=.25*sin(atan(q.y,q.x)*3.+uProgress*4.)*pow(abs(band),2.);
        silver=mix(silver,.055,smoothstep(.35,.55,band)*(1.-smoothstep(.75,.93,band))*.85);
        vec3 chrome=vec3(clamp(silver,.08,1.));
        chrome=mix(chrome,photograph(c+q*1.1),.09);
        float shadow=exp(-pow((length(p-c-vec2(.014,-.022))-radius)/.042,2.))*.12;
        color*=1.-shadow*strength*(1.-interior);
        return mix(color,chrome,rim*strength);
      }
      void main(){
        float aspect=uSize.x/uSize.y;
        vec2 p=(vUv-.5)*vec2(aspect,1.);
        float progress=uProgress;
        float phase=fract(progress*2.);
        float sweep=sin(phase*3.14159265);
        float radius=.30+sweep*sweep*.74+(1.-uIntro)*.28;
        vec2 center=vec2(sin(progress*6.283)*min(.17,aspect*.2),-.03+sin(progress*3.14159)*.08)+uPointer*.09;
        float wave=sin(length(p-uPulsePoint)*42.-uTime*6.)*uPulse*.009*exp(-length(p-uPulsePoint)*2.);
        vec3 base=photograph(p+normalize(p-uPulsePoint+vec2(.001))*wave);
        float backdrop=1.-smoothstep(.2,.6,abs(p.x));
        base=mix(PAPER,base,uIntro);
        base=lens(p,center,radius,base,uIntro);
        float satellite=sin(progress*3.14159265);
        vec2 c2=vec2(cos(progress*5.)*aspect*.40,sin(progress*5.)*.27);
        base=lens(p,c2,.10+satellite*.04,base,satellite*.8);
        float axis=(1.-smoothstep(.0004,.0012,abs(p.x-center.x)))*(1.-smoothstep(.34,.37,abs(p.y-center.y)));
        float axis2=(1.-smoothstep(.0004,.0012,abs(p.y-center.y)))*(1.-smoothstep(.34,.37,abs(p.x-center.x)));
        base=mix(base,vec3(.14),max(axis,axis2)*.12*(1.-sweep));
        gl_FragColor=vec4(base,1.);
        #include <colorspace_fragment>
      }` }));
    const geometry=kit.track(new T.PlaneGeometry(2,2));
    kit.scene.add(new T.Mesh(geometry,material));
    kit.onResize(({width,height})=>uniformSet.uSize.value.set(width,height));
    kit.onFrame(({time})=>{
      const q=state.progress*2,index=Math.min(2,Math.floor(q)),next=Math.min(2,index+1);
      uniformSet.uA.value=textures[index];uniformSet.uB.value=textures[next];
      uniformSet.uAspectA.value=images[index].width/images[index].height;uniformSet.uAspectB.value=images[next].width/images[next].height;
      uniformSet.uMix.value=g.utils.clamp(0,1,(q-index-.28)/.48);
      uniformSet.uProgress.value=state.progress;uniformSet.uIntro.value=state.intro;
      uniformSet.uTime.value=time;uniformSet.uPulse.value=state.pulse;
      uniformSet.uPointer.value.set(state.pointerX,state.pointerY);
      uniformSet.uPulsePoint.value.set(state.pulseX,state.pulseY);
    });
    if(!kit.ready())return;
    host.tabIndex=0;host.setAttribute('role','button');host.setAttribute('aria-label','Move the optical lens over the photograph');
    const pulse=(x,y)=>{
      const rect=host.getBoundingClientRect();
      state.pulseX=(x-rect.left-rect.width/2)/rect.height;
      state.pulseY=-(y-rect.top-rect.height/2)/rect.height;
      kit.track(g.to(state,{pointerX:state.pulseX,pointerY:state.pulseY,duration:1.1,ease:'elastic.out(1,.65)',overwrite:'auto',onUpdate:update}));
      state.pulse=1;
      kit.track(g.to(state,{pulse:0,duration:1.5,ease:'power2.out',overwrite:'auto',onUpdate:()=>kit.invalidate()}));
      kit.wake(1600);
    };
    let down=null;
    const onDown=e=>{down={x:e.clientX,y:e.clientY};};
    const onUp=e=>{if(down&&Math.hypot(e.clientX-down.x,e.clientY-down.y)<12)pulse(e.clientX,e.clientY);down=null;};
    const onCancel=()=>{down=null;};
    const onKey=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();const r=host.getBoundingClientRect();pulse(r.left+r.width*.62,r.top+r.height*.48);}};
    host.addEventListener('pointerdown',onDown);host.addEventListener('pointerup',onUp);host.addEventListener('pointercancel',onCancel);host.addEventListener('keydown',onKey);
    kit.addCleanup(()=>{host.removeEventListener('pointerdown',onDown);host.removeEventListener('pointerup',onUp);host.removeEventListener('pointercancel',onCancel);host.removeEventListener('keydown',onKey);});
    kit.track(g.to(state,{intro:1,duration:1.65,ease:'power3.out',onUpdate:update}));
    kit.track(g.to(state,{progress:1,ease:'none',onUpdate:update,scrollTrigger:{trigger:story,start:'top top',end:'bottom bottom',scrub:.65,invalidateOnRefresh:true}}));
    update();A.refresh();
  }
})();
