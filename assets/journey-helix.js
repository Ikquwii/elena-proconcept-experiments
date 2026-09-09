/* One continuous film carries all six productions through a complete scroll journey. */
import { createLabScene } from './lab-runtime.js';
const A = window.Atelier;
const D = window.MOCKUP_DATA?.proconcept;
const story = document.querySelector('.hc-journey');
if (A && D && story) {
  const env = A.setup(), g = env.gsap, projects = D.projects;
  const host = document.querySelector('.hc-world');
  const stage = document.querySelector('.hc-stage');
  const panels = [...document.querySelectorAll('.hc-panel')];
  const frames = panels.map(p => [...p.querySelectorAll('.hc-frame')]);
  const intro = document.querySelector('.hc-intro');
  const current = document.querySelector('.hc-current');
  const ending = document.querySelector('.hc-ending');
  const action = document.querySelector('.hc-action');
  const stopButtons = [...document.querySelectorAll('[data-stop]')];
  const routeLabel = document.querySelector('.hc-route-label');
  const routeCount = document.querySelector('.hc-route-count');
  const routeLine = document.querySelector('.hc-route-line i');
  const note = document.querySelector('.hc-note');
  const state = { q: 0 }, TOTAL = 7.3, START = .65, PITCH = 5.2;
  let kit = null, live = false, selected = -2, mode = '';
  let layout = { width: 390, height: 844, packW: 350, packH: 494, cols: 3, gapX: 10, gapY: 13 };
  const clamp = (n, lo = 0, hi = 1) => Math.max(lo, Math.min(hi, n));
  const smooth = (a, b, v) => { const n = clamp((v-a)/(b-a)); return n*n*(3-2*n); };
  const number = n => String(n).padStart(2,'0');

  function fallback() {
    live = false;
    document.body.classList.remove('hc-live', 'hc-enhancing');
    A.refresh();
  }
  function go(q) {
    if (!live) return;
    const top = story.getBoundingClientRect().top + scrollY;
    const target = top + clamp(q/TOTAL) * (story.offsetHeight-stage.offsetHeight);
    if (env.lenis) env.lenis.scrollTo(target, { duration: 1.1 });
    else window.scrollTo({ top: target, behavior: 'smooth' });
  }
  stopButtons.forEach((b,i) => b.addEventListener('click', () => go(START+i+.52)));
  document.querySelector('.hc-contact-jump').addEventListener('click', () => go(TOTAL));
  document.querySelector('.hc-restart').addEventListener('click', () => go(0));
  action.addEventListener('click', () => {
    if (selected >= 0 && selected < 6) A.open(projects[selected].images, 0, action);
    else go(selected === 6 ? 0 : START+.52);
  });
  document.querySelector('.skip-link').addEventListener('click', event => {
    if (!live) return;
    event.preventDefault(); kit?.destroy(); fallback();
    const archive = document.querySelector('#archive');
    archive.tabIndex = -1; archive.focus(); archive.scrollIntoView({ block: 'start' });
  });
  if (!g || !env.ScrollTrigger || env.reduce) fallback();
  else {
    document.body.classList.add('hc-enhancing');
    start().catch(error => {
      if (kit?.alive) kit.fail(error);
      else { console.warn('Helix Journey: all photographs remain available.', error); fallback(); }
    });
  }

  function select(index) {
    if (selected === index) return;
    selected = index;
    stage.dataset.project = String(index);
    panels.forEach((panel,i) => { panel.hidden = i !== index; panel.inert = true; });
    stopButtons.forEach((button,i) => button.setAttribute('aria-pressed', String(i===index)));
    if (index >= 0 && index < 6) {
      current.querySelector('h2').textContent = projects[index].title;
      current.querySelector('p').textContent = `${number(index+1)} / 06 — Seven photographs`;
      action.innerHTML = 'Open project <span aria-hidden="true">↗</span>';
      action.setAttribute('aria-label', `Open all seven photographs from ${projects[index].title}`);
      routeCount.textContent = `${number(index+1)} / 06`;
    } else {
      action.innerHTML = index === 6 ? 'Back to the start <span aria-hidden="true">↑</span>' : 'Begin the journey <span aria-hidden="true">↓</span>';
      action.setAttribute('aria-label', index === 6 ? 'Back to the start' : 'Begin the journey');
      routeCount.textContent = index === 6 ? '06 / 06' : '00 / 06';
    }
  }
  function measure() {
    const pack = document.querySelector('.hc-pack');
    const landscape = matchMedia('(orientation:landscape) and (max-height:600px)').matches;
    const desktop = innerWidth >= 900;
    const short = innerHeight <= 650 && !landscape;
    layout = { width: stage.clientWidth, height: stage.clientHeight, packW: pack.clientWidth, packH: pack.clientHeight,
      cols: desktop || landscape ? 4 : 3, gapX: landscape ? 9 : desktop ? 26 : short ? 8 : 10,
      gapY: landscape ? 9 : desktop ? 20 : short ? 8 : 13 };
  }

  async function start() {
    kit = await createLabScene({ host, env, background: 0xeff0ee, onFallback: fallback });
    if (!kit?.alive) return;
    const { T, scene, camera } = kit;
    camera.fov = 38; camera.far = 130; camera.updateProjectionMatrix();
    const allImages = projects.flatMap(p => p.images.map(A.get));
    const loaded = await Promise.all(allImages.map(im => new Promise((resolve,reject) => {
      const image = new Image(); image.decoding = 'async';
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error('A film frame could not load.'));
      image.src = im.thumb;
    })));
    if (!kit.alive) return;
    const tileW = 224, tileH = 336;
    const atlasCanvas = document.createElement('canvas');
    atlasCanvas.width = tileW*7; atlasCanvas.height = tileH*6;
    const ctx = atlasCanvas.getContext('2d');
    if (!ctx) throw new Error('The photographic atlas could not be prepared.');
    ctx.fillStyle = '#e9ece5'; ctx.fillRect(0,0,atlasCanvas.width,atlasCanvas.height);
    loaded.forEach((image,i) => {
      const fit = Math.min((tileW-6)/image.naturalWidth,(tileH-6)/image.naturalHeight);
      const w=image.naturalWidth*fit,h=image.naturalHeight*fit;
      ctx.drawImage(image,(i%7)*tileW+(tileW-w)/2,Math.floor(i/7)*tileH+(tileH-h)/2,w,h);
    });
    const atlas = kit.track(new T.CanvasTexture(atlasCanvas));
    atlas.colorSpace = T.SRGBColorSpace;
    atlas.anisotropy = Math.min(4,kit.renderer.capabilities.getMaxAnisotropy());
    const uniforms = { uAtlas: { value: atlas }, uTwist: { value: 0 }, uPack: { value: 0 }, uProject: { value: 0 } };
    const along=1008, across=8, positions=[], uv=[], indices=[];
    for(let i=0;i<=along;i++) for(let j=0;j<=across;j++) { positions.push(i/along,j/across,0); uv.push(i/along,j/across); }
    for(let i=0;i<along;i++) for(let j=0;j<across;j++) { const a=i*(across+1)+j,b=a+across+1; indices.push(a,b,a+1,b,b+1,a+1); }
    const geo = kit.track(new T.BufferGeometry());
    geo.setAttribute('position',new T.Float32BufferAttribute(positions,3));
    geo.setAttribute('uv',new T.Float32BufferAttribute(uv,2)); geo.setIndex(indices);
    const material = kit.track(new T.ShaderMaterial({ uniforms, side: T.DoubleSide, transparent: true, depthWrite: true,
      vertexShader: `
        uniform float uTwist,uPack; varying vec2 vUv; varying vec3 vNormal,vView;
        void main(){
          vUv=uv; float turn=uv.x*6.; float theta=turn*6.2831853+uTwist;
          float radius=2.85-uPack*.35;
          vec3 pos=vec3(cos(theta)*radius,-turn*5.2+(uv.y-.5)*3.86,sin(theta)*radius);
          vec3 normalCoil=normalize(vec3(cos(theta),.06,sin(theta)));
          vNormal=normalize(normalMatrix*normalCoil);
          vec4 mv=modelViewMatrix*vec4(pos,1.); vView=-mv.xyz; gl_Position=projectionMatrix*mv;
        }`,
      fragmentShader: `
        uniform sampler2D uAtlas; uniform float uPack,uProject;
        varying vec2 vUv; varying vec3 vNormal,vView;
        void main(){
          float cell=min(41.,floor(vUv.x*42.)); float local=fract(min(vUv.x,.999999)*42.);
          float hole=step(.22,fract(vUv.x*42.*12.))*step(fract(vUv.x*42.*12.),.78);
          if((vUv.y<.048||vUv.y>.952)&&hole>.5)discard;
          float border=1.-step(.083,vUv.y)*step(vUv.y,.917);
          float divider=1.-smoothstep(.007,.014,min(local,1.-local));
          vec2 frame=vec2(local,clamp((vUv.y-.083)/.834,0.,1.));
          float col=mod(cell,7.); float row=floor(cell/7.);
          vec2 atlasUv=vec2((col+mix(.006,.994,frame.x))/7.,1.-(row+1.-mix(.004,.996,frame.y))/6.);
          vec3 color=texture2D(uAtlas,atlasUv).rgb;
          vec3 n=normalize(vNormal); if(!gl_FrontFacing)n=-n;
          float fresnel=pow(1.-abs(dot(n,normalize(vView))),3.);
          float silver=.16+.59*pow(abs(dot(n,normalize(vec3(.7,.9,1.)))),8.)+.2*fresnel;
          color=mix(color,vec3(silver),max(border,divider));
          float groupMask=1.-step(.5,abs(row-uProject));
          float alpha=1.-uPack*(.75+groupMask*.17);
          gl_FragColor=vec4(color,alpha);
          #include <tonemapping_fragment>
          #include <colorspace_fragment>
        }`
    }));
    const film = new T.Mesh(geo,material); film.frustumCulled=false; scene.add(film);
    const aim = new T.Vector3();
    kit.addCleanup(() => { loaded.forEach(im => { im.src=''; }); atlasCanvas.width=atlasCanvas.height=1; live=false; });
    kit.onResize(() => { measure(); kit.invalidate(); });
    let stableWidth = innerWidth, stableProgress = state.q / TOTAL, resizeProgress = null;
    function compose() {
      // Width changes can alter svh before ScrollTrigger receives its resize event.
      if (innerWidth !== stableWidth && resizeProgress === null) resizeProgress = stableProgress;
      const q = resizeProgress === null ? state.q : resizeProgress * TOTAL;
      if (resizeProgress === null) stableProgress = q / TOTAL;
      const idx = q < START ? -1 : q >= START+6 ? 6 : Math.min(5,Math.floor(q-START));
      const local = idx < 0 ? q/START : idx === 6 ? (q-START-6)/.65 : q-START-idx;
      const opening = idx < 0;
      const closing = idx === 6;
      select(idx);
      let pack=0, aimY=-3.4, distance=15, orbit=.20, twist=-.60;
      if (opening) {
        aimY=-3.4-local*1.6; distance=17-local*2;
        twist=-.60+local*.8; orbit=.2+local*.2;
      } else if (!closing) {
        const travel=smooth(0,.24,local);
        const previousY=idx===0?-5:-(idx-.5)*PITCH;
        aimY=previousY+(-(idx+.5)*PITCH-previousY)*travel;
        orbit=.4+(idx===0?0:idx-1+travel)*.19+Math.sin(travel*Math.PI)*.3;
        twist=.20-(idx+travel)*.35;
        distance=15+Math.sin(travel*Math.PI)*1.6;
        pack=smooth(.15,.34,local)*(1-smooth(.78,.99,local));
      } else {
        const end=smooth(0,1,local);
        aimY=-(5.5)*PITCH+(-(3)*PITCH+(5.5)*PITCH)*end;
        distance=15+end*49; orbit=1.35-end*.5; twist=-1.9+end*.95;
      }
      uniforms.uTwist.value=twist;
      uniforms.uPack.value=pack;
      uniforms.uProject.value=clamp(idx,0,5);
      const portrait=layout.width<900 && layout.height>layout.width;
      const endShift=closing?smooth(0,1,local)*(portrait?5:12):0;
      film.position.x=-pack*(portrait?4.9:9.4)+endShift+(opening&&!portrait?2.7*(1-smooth(.3,1,local)):0);
      film.rotation.z=opening?-.08*(1-local):Math.sin((q-START)*.6)*.012;
      if(closing && portrait) aimY += smooth(0,1,local)*3;
      camera.position.set(Math.sin(orbit)*distance,aimY+.5,Math.cos(orbit)*distance);
      aim.set(0,aimY,0); camera.lookAt(aim);
      intro.style.opacity=String(opening?1-smooth(.50,1,local):0);
      intro.style.transform=`translateY(${-Math.min(1,q/START)*22}px)`;
      current.style.opacity=String(idx>=0&&idx<6?smooth(.05,.18,local):0);
      ending.hidden=!closing;
      ending.inert=!closing||local<.45;
      if(closing){ending.style.opacity=String(smooth(.20,.7,local));ending.style.transform=`translateY(${(1-smooth(.20,.7,local))*30}px)`;}
      if(idx>=0&&idx<6) {
        const cols=layout.cols, rows=cols===3?3:2;
        const cw=(layout.packW-layout.gapX*(cols-1))/cols;
        const ch=(layout.packH-layout.gapY*(rows-1))/rows;
        panels[idx].inert=pack<.88;
        frames[idx].forEach((frame,n) => {
          const col=cols===3&&n===6?1:n%cols, row=Math.floor(n/cols);
          const cx=(col+.5)*cw+col*layout.gapX, cy=(row+.5)*ch+row*layout.gapY;
          const lift=1-pack;
          const x=(layout.packW*.43-cx+Math.sin(n*.9)*layout.packW*.19)*lift;
          const y=(layout.packH*.5-cy+(n-3)*14)*lift;
          const turn=Math.sin(n*.81+idx)*27*lift;
          frame.style.transform=`translate3d(${x}px,${y}px,${-lift*(240+n*20)}px) rotateY(${lift*(n%2?65:-65)}deg) rotate(${turn}deg) scale(${.22+.78*pack})`;
          frame.style.opacity=String(smooth(.03,.48,pack));
        });
      }
      const nextMode=opening?'intro':closing?'end':pack>.9?'hold':'travel';
      if(mode!==nextMode){mode=nextMode;stage.dataset.phase=mode;}
      routeLabel.textContent=opening?'The unbroken film':closing?'The next production':pack>.9?'The complete project':'Following the film';
      routeLine.style.transform=`scaleX(${clamp(q/TOTAL)})`;
      note.textContent=opening?'Scroll to follow the film':closing?'Every frame leads somewhere.':pack>.9?'Tap any photograph to view it whole':'Scroll to unfold the next project';
    }
    kit.onFrame(compose);
    if (!kit.ready()) return;
    document.body.classList.remove('hc-enhancing'); document.body.classList.add('hc-live');
    live=true;
    const timeline=kit.track(g.timeline({ scrollTrigger:{trigger:story,start:'top top',end:'bottom bottom',scrub:.45,invalidateOnRefresh:true},onUpdate:()=>kit.invalidate()}));
    timeline.addLabel('Opening',0);
    projects.forEach((p,i)=>timeline.addLabel(p.title,(START+i+.52)/TOTAL));
    timeline.to(state,{q:TOTAL,duration:1,ease:'none'},0).addLabel('Your next production',1);
    // Preserve the current act across rotation, but ignore browser-toolbar height changes.
    let resizeTimer = 0;
    const restorePosition = () => {
      resizeTimer = 0;
      if (!kit.alive || !live || resizeProgress === null) return;
      const progress = clamp(resizeProgress);
      env.ScrollTrigger.refresh();
      const trigger = timeline.scrollTrigger;
      const target = trigger.start + (trigger.end - trigger.start) * progress;
      if (env.lenis) env.lenis.scrollTo(target, { immediate: true, force: true });
      else window.scrollTo({ top: target, behavior: 'instant' });
      env.ScrollTrigger.update();
      trigger.getTween()?.progress(1);
      timeline.progress(progress);
      state.q = progress * TOTAL;
      stableWidth = innerWidth;
      stableProgress = progress;
      resizeProgress = null;
      kit.invalidate();
    };
    const onViewportResize = () => {
      if (!kit.alive || !live || (innerWidth === stableWidth && resizeProgress === null)) return;
      if (resizeProgress === null) resizeProgress = stableProgress;
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(restorePosition, 180);
    };
    window.addEventListener('resize', onViewportResize, { passive: true });
    kit.addCleanup(() => {
      window.removeEventListener('resize', onViewportResize);
      clearTimeout(resizeTimer);
      resizeProgress = null;
    });
    A.track(timeline); A.refresh();
  }
}
