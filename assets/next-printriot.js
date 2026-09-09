const A = window.Atelier;
const D = window.MOCKUP_DATA.elena;
const env = A.setup();
const host = document.querySelector('.pr-canvas');
const scrollSection = document.querySelector('.pr-scroll');
const fallback = document.querySelector('.pr-fallback');
const chapters = [...document.querySelectorAll('[data-chapter]')];
const ids = host.dataset.heroIds.split(',');
const photos = ids.map(id => A.get(id));
const state = { progress: 0, index: 0 };
let kit = null, trigger = null, textures = [], material = null;

function selectImage(index) {
  const next = Math.max(0, Math.min(3, index));
  if (state.index === next && fallback.dataset.photo === photos[next].id) return;
  state.index = next;
  const p = photos[next];
  if (fallback.dataset.photo !== p.id) {
    fallback.dataset.photo = p.id;
    fallback.innerHTML = A.img(p.id, { eager: true, sizes: '(max-width: 700px) 92vw, 45vw' });
  }
  chapters.forEach((button, i) => button.setAttribute('aria-pressed', String(i === next)));
  document.querySelector('.pr-counter').textContent = `0${next + 1} / 04`;
}

function drawProgress(value) {
  state.progress = Math.max(0, Math.min(1, value));
  const position = state.progress * 3;
  const segment = Math.min(2, Math.floor(position));
  const phase = position - segment;
  selectImage(Math.round(position));
  const burst = Math.sin(Math.PI * phase);
  host.classList.toggle('is-settled', phase < .001 || phase > .999);
  document.querySelector('.pr-glyph').style.transform = `scale(${.92 + burst * .2}) rotate(${-8 * burst}deg)`;
  if (!material || !kit?.alive) return;
  material.uniforms.uFrom.value = textures[segment];
  material.uniforms.uTo.value = textures[segment + 1];
  material.uniforms.uFromAspect.value = photos[segment].width / photos[segment].height;
  material.uniforms.uToAspect.value = photos[segment + 1].width / photos[segment + 1].height;
  material.uniforms.uProgress.value = phase;
  kit.invalidate();
}

function goToChapter(index) {
  index = (index + 4) % 4;
  if (!kit?.alive || !trigger) { selectImage(index); return; }
  const y = trigger.start + (trigger.end - trigger.start) * index / 3;
  if (env.lenis) env.lenis.scrollTo(y, { duration: 1.35, easing: t => 1 - Math.pow(1 - t, 3) });
  else window.scrollTo({ top: y, behavior: 'smooth' });
}

chapters.forEach(button => button.addEventListener('click', () => goToChapter(Number(button.dataset.chapter))));
document.querySelector('.pr-next').addEventListener('click', () => goToChapter(state.index + 1));
document.querySelector('.pr-full').addEventListener('click', event => A.open(ids, state.index, event.currentTarget));
document.querySelectorAll('[data-collection-index]').forEach(button => button.addEventListener('click', () => A.open(D.projects[Number(button.dataset.collectionIndex)].images, 0, button)));
let startX = 0, startY = 0;
host.addEventListener('touchstart', event => { startX = event.changedTouches[0].clientX; startY = event.changedTouches[0].clientY; }, { passive: true });
host.addEventListener('touchend', event => {
  const dx = event.changedTouches[0].clientX - startX, dy = event.changedTouches[0].clientY - startY;
  if (Math.abs(dx) > 55 && Math.abs(dx) > Math.abs(dy) * 1.5) goToChapter(state.index + (dx < 0 ? 1 : -1));
}, { passive: true });

function fallbackMode() {
  scrollSection.classList.remove('has-scene');
  host.classList.remove('is-live');
  host.classList.add('is-settled');
  document.querySelector('.pr-instruction').textContent = 'Four prints. Choose a chapter.';
  env.gsap?.set('.pr-print', { clearProps: 'transform,clipPath' });
  A.refresh();
}

const vertexShader = /* glsl */`
  attribute vec2 aCell;
  attribute vec3 aRandom;
  uniform vec2 uStep;
  uniform vec2 uPlane;
  uniform float uProgress;
  varying vec2 vUv;
  varying float vShade;
  varying float vMix;
  mat3 rotationX(float a) { float c=cos(a),s=sin(a); return mat3(1.,0.,0.,0.,c,s,0.,-s,c); }
  mat3 rotationY(float a) { float c=cos(a),s=sin(a); return mat3(c,0.,-s,0.,1.,0.,s,0.,c); }
  mat3 rotationZ(float a) { float c=cos(a),s=sin(a); return mat3(c,s,0.,-s,c,0.,0.,0.,1.); }
  void main() {
    float delay=aRandom.x*.12;
    float p=clamp((uProgress-delay)/(1.-.12),0.,1.);
    float burst=sin(p*3.14159265);
    float surge=pow(max(0.,burst),1.25);
    vec3 center=vec3((aCell-.5)*uPlane,0.);
    float angle=surge*(aRandom.z-.5)*7.;
    center.xy=mat2(cos(angle),sin(angle),-sin(angle),cos(angle))*center.xy;
    center += vec3((aRandom.x-.5)*6.4,(aRandom.y-.5)*6.4,(aRandom.z-.35)*4.8)*surge;
    center.x += sin(aCell.y*9.+p*3.14159)*surge*.7;
    vec3 tile=vec3(position.xy*uStep*uPlane*mix(1.002,.75,surge),0.);
    mat3 turn=rotationZ(surge*(aRandom.y-.5)*8.)*rotationY(surge*(aRandom.x-.5)*9.)*rotationX(surge*(aRandom.z-.5)*7.);
    tile=turn*tile;
    vUv=aCell+uv*uStep-uStep*.5;
    vShade=mix(1.,.42+.58*abs((turn*vec3(0.,0.,1.)).z),surge);
    vMix=smoothstep(.32+aRandom.y*.1,.62+aRandom.y*.1,p);
    gl_Position=projectionMatrix*modelViewMatrix*vec4(center+tile,1.);
  }
`;
const fragmentShader = /* glsl */`
  uniform sampler2D uFrom;
  uniform sampler2D uTo;
  uniform float uFromAspect;
  uniform float uToAspect;
  uniform float uFrameAspect;
  varying vec2 vUv;
  varying float vShade;
  varying float vMix;
  vec4 photograph(sampler2D tex, float ratio) {
    vec2 q=vUv;
    if(ratio>uFrameAspect) q.y=(q.y-.5)*ratio/uFrameAspect+.5;
    else q.x=(q.x-.5)*uFrameAspect/ratio+.5;
    if(q.x<0.||q.x>1.||q.y<0.||q.y>1.) return vec4(0.);
    return texture2D(tex,q);
  }
  void main() {
    vec4 color=mix(photograph(uFrom,uFromAspect),photograph(uTo,uToAspect),vMix);
    if(color.a<.02) discard;
    gl_FragColor=vec4(color.rgb*vShade,color.a);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

async function initScene() {
  if (env.reduce) { fallbackMode(); return; }
  try {
    const { createLabScene } = await import('./lab-runtime.js');
    kit = await createLabScene({ host, env, background: 0x080808, onFallback: fallbackMode });
    if (!kit?.alive) return;
    const { T, scene, renderer, camera } = kit;
    renderer.setClearColor(0x080808, 0);
    textures = await Promise.all(photos.map(photo => kit.loadTexture(photo.src)));
    if (!kit.alive) return;
    const columns = 72, rows = 84;
    const geometry = kit.track(new T.InstancedBufferGeometry());
    geometry.setAttribute('position', new T.Float32BufferAttribute([-.5,-.5,0,.5,-.5,0,.5,.5,0,-.5,.5,0],3));
    geometry.setAttribute('uv',new T.Float32BufferAttribute([0,0,1,0,1,1,0,1],2));
    geometry.setIndex([0,1,2,0,2,3]);
    const cells = new Float32Array(columns*rows*2), random = new Float32Array(columns*rows*3);
    let seed = 431;
    const rng = () => { seed = (Math.imul(seed,1664525)+1013904223)>>>0; return seed/4294967296; };
    for(let y=0;y<rows;y++) for(let x=0;x<columns;x++) {
      const i=y*columns+x;
      cells[i*2]=(x+.5)/columns; cells[i*2+1]=(y+.5)/rows;
      random[i*3]=rng(); random[i*3+1]=rng(); random[i*3+2]=rng();
    }
    geometry.setAttribute('aCell',new T.InstancedBufferAttribute(cells,2));
    geometry.setAttribute('aRandom',new T.InstancedBufferAttribute(random,3));
    geometry.instanceCount=columns*rows;
    material = kit.track(new T.ShaderMaterial({
      vertexShader,fragmentShader,side:T.DoubleSide,transparent:true,depthWrite:true,
      uniforms:{uStep:{value:new T.Vector2(1/columns,1/rows)},uPlane:{value:new T.Vector2(2.8,4)},uProgress:{value:0},uFrom:{value:textures[0]},uTo:{value:textures[1]},uFromAspect:{value:photos[0].width/photos[0].height},uToAspect:{value:photos[1].width/photos[1].height},uFrameAspect:{value:12/17}},
    }));
    const mesh = new T.Mesh(geometry,material);
    mesh.frustumCulled=false;
    scene.add(mesh);
    camera.position.z=6;
    kit.onResize(({width,height}) => {
      const viewHeight=2*Math.tan(camera.fov*Math.PI/360)*camera.position.z;
      material.uniforms.uPlane.value.set(viewHeight*width/height,viewHeight);
      material.uniforms.uFrameAspect.value=width/height;
      kit.invalidate();
    });
    drawProgress(0);
    if (!kit.ready()) return;
    scrollSection.classList.add('has-scene');
    trigger = env.ScrollTrigger.create({trigger:scrollSection,start:'top top',end:'bottom bottom',invalidateOnRefresh:true,onUpdate:self=>drawProgress(self.progress)});
    kit.addCleanup(()=>{trigger?.kill();trigger=null;});
    A.refresh();
    // Print motion below the shader scene uses a separate wrapper per photograph.
    document.querySelectorAll('.pr-print').forEach((print,index)=>{
      const tween=env.gsap.fromTo(print,{y:index%2?95:55,rotation:index%2?3:-3,clipPath:'inset(15% 0 0 0)'},{y:0,rotation:0,clipPath:'inset(0% 0 0 0)',ease:'none',scrollTrigger:{trigger:print,start:'top 95%',end:'top 55%',scrub:.5}});
      kit.track(tween);
    });
  } catch(error) {
    if (kit?.alive) kit.fail(error);
    else { console.warn('Print Riot is showing the complete photographic edition.',error); fallbackMode(); }
  }
}

initScene();
