/* Four Views — a contact sheet opens into a photographic space. */
(() => {
  'use strict';
  const A = window.Atelier;
  const D = window.MOCKUP_DATA?.proconcept;
  const root = document.querySelector('#fv-app');
  if (!A || !D || !root) return;
  const E = A.esc;
  const projects = D.projects;
  const leads = projects.slice(2, 6);
  const portrait = p => p.images.map(id => A.get(id)).find(im => im.height > im.width * 1.1) || A.get(p.cover);
  const photo = (id, cls = '', eager = false) => A.photo(id, { className: cls, caption: false, eager });
  const fullStory = (p, cls, text) => `<button class="${cls}" data-photo="${E(p.cover)}" data-collection="${E(p.images.join(','))}" aria-label="Open ${E(p.title)}">${text}</button>`;
  root.innerHTML = `<header class="fv-header"><a class="fv-logo" href="#top">PRO<span>CONCEPT</span></a><nav aria-label="Main navigation"><a href="#work">Work</a><a href="#contact">Contact ↗</a></nav></header>
    <main id="top"><section class="fv-hero" aria-label="Four views in motion"><div class="fv-stage" data-act="contact"><div class="fv-overline">Creative production<br>Four views / In motion</div><nav class="fv-edition" aria-label="Scene chapters"><button data-chapter="0" aria-label="Contact sheet" aria-pressed="true">01</button><button data-chapter="0.46" aria-label="Enter the dimension" aria-pressed="false">02</button><button data-chapter="1" aria-label="A closer look" aria-pressed="false">03</button></nav><div class="fv-space"><div class="fv-fallback">${leads.map(p => photo(portrait(p).id, '', true)).join('')}</div></div><h1 class="fv-wordmark">PRO<span><i>CONCEPT</i></span></h1><button class="fv-focus-return" hidden>Back to all views ↗</button><div class="fv-dimension"><span>01</span> / <b>Contact sheet</b></div><a class="fv-guide" href="#work" aria-label="View all projects">↓</a><div class="fv-controls"><button class="fv-action"><div><span>Select a frame</span><b>${E(leads[0].title)}</b></div><em aria-hidden="true">↗</em></button><button class="fv-arrow fv-prev" aria-label="Previous view">←</button><span class="fv-count" aria-live="polite">01 / 04</span><button class="fv-arrow fv-next" aria-label="Next view">→</button></div></div></section>
    <section class="fv-work" id="work"><div class="fv-work-head"><span class="fv-eyebrow">Selected productions / 06</span><h2>Every angle.<br><i>One vision.</i></h2><p>A closer look at the images, the places, and the stories we bring to life.</p></div>${projects.map((p, i) => `<article class="fv-project"><header class="fv-project-head"><span class="fv-project-number">0${i + 1}</span><h3>${E(p.title)}<span class="fv-project-place">${E(p.location || p.category || 'Creative production')}</span></h3>${fullStory(p, 'fv-open', '↗')}</header><div class="fv-project-photos">${[portrait(p).id, ...p.images.filter(id => id !== portrait(p).id).slice(0, 2)].map(id => photo(id)).join('')}</div><div class="fv-project-view">${fullStory(p, '', `View the complete project <span>↗</span>`)}</div></article>`).join('')}</section>
    <section class="fv-interlude" aria-label="Another point of view">${photo(portrait(projects[0]).id)}<p class="fv-interlude-word">Look.<br><i>Again.</i></p>${photo(portrait(projects[1]).id)}</section><footer class="fv-footer" id="contact"><span class="fv-eyebrow">Bring your next idea.</span><a class="fv-contact" href="mailto:${E(D.email)}">Let’s make<br><i>an impression.</i> ↗</a><div class="fv-footer-bottom"><a href="mailto:${E(D.email)}">${E(D.email)}</a><span>PRO CONCEPT</span><a href="#top">Back to the beginning ↑</a></div></footer></main>`;

  const motion = A.setup();
  const { gsap: g, ScrollTrigger: ST, reduce } = motion;
  const stage = root.querySelector('.fv-stage');
  const hero = root.querySelector('.fv-hero');
  const space = root.querySelector('.fv-space');
  const wordmark = root.querySelector('.fv-wordmark');
  const action = root.querySelector('.fv-action');
  const returnButton = root.querySelector('.fv-focus-return');
  const state = { progress: 0, intro: 0, focus: 0, transition: 1, pointerX: 0, pointerY: 0 };
  let selected = 0;
  let focused = false;
  let gpu = null;
  let sceneVisible = true;
  let modalOpen = false;
  let lost = false;
  let disposed = false;
  let queued = false;
  let cleanupScene = () => {};
  const ownTweens = new Set();
  const animate = vars => {
    if (!g || reduce) { Object.assign(state, Object.fromEntries(Object.entries(vars).filter(([key]) => key in state))); update(); return; }
    const tween = g.to(state, { duration: .95, ease: 'power3.inOut', overwrite: 'auto', ...vars, onUpdate: update });
    ownTweens.add(tween);
    A.track(tween);
    return tween;
  };
  function label() {
    action.querySelector('span').textContent = focused ? 'Open the project' : 'Enter this view';
    action.querySelector('b').textContent = leads[selected].title;
    root.querySelector('.fv-count').textContent = `0${selected + 1} / 04`;
    returnButton.hidden = !focused;
    stage.classList.toggle('fv-focused', focused);
  }
  function choose(index, focus = true) {
    gpu?.capture();
    state.transition = 0;
    selected = (index + leads.length) % leads.length;
    focused = focus;
    label();
    if (gpu && !lost) {
      gpu.promote(selected);
      animate({ focus: focus ? 1 : 0, transition: 1 });
    } else if (focus) A.open(leads[selected].images, 0, action);
  }
  root.querySelector('.fv-prev').addEventListener('click', () => choose(selected - 1));
  root.querySelector('.fv-next').addEventListener('click', () => choose(selected + 1));
  action.addEventListener('click', () => focused || !gpu ? A.open(leads[selected].images, 0, action) : choose(selected));
  returnButton.addEventListener('click', () => { focused = false; label(); animate({ focus: 0 }); action.focus({ preventScroll: true }); });
  stage.addEventListener('keydown', event => {
    if (event.target.tagName === 'INPUT' || modalOpen) return;
    if (event.key === 'Escape' && focused) { focused = false; label(); animate({ focus: 0 }); action.focus({ preventScroll: true }); }
  });

  root.querySelectorAll('[data-chapter]').forEach(button => button.addEventListener('click', () => {
    focused = false; label(); animate({focus: 0});
    const start = hero.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({top: start + (hero.offsetHeight - stage.offsetHeight) * Number(button.dataset.chapter), behavior: reduce ? 'instant' : 'smooth'});
  }));

  function update() {
    const p = state.progress;
    const act = p < .23 ? 'contact' : p < .74 ? 'space' : 'focus';
    stage.dataset.act = act;
    root.querySelectorAll('[data-chapter]').forEach((button, i) => button.setAttribute('aria-pressed', String(i === (act === 'contact' ? 0 : act === 'space' ? 1 : 2))));
    const text = root.querySelector('.fv-dimension');
    text.querySelector('span').textContent = act === 'contact' ? '01' : act === 'space' ? '02' : '03';
    text.querySelector('b').textContent = act === 'contact' ? 'Contact sheet' : act === 'space' ? 'A different dimension' : 'A closer look';
    if (gpu && !lost) {
      gpu.layout();
      wordmark.style.transform = `translate(-50%,-50%) scale(${(1 - Math.sin(p * Math.PI) * .64) * (1 - state.focus * .6)})`;
      wordmark.style.opacity = String((1 - state.focus) * (p > .75 ? 1 - (p - .75) * 4 : 1));
      invalidate();
    }
  }
  function flush() {
    queued = false;
    if (!gpu || !sceneVisible || modalOpen || document.hidden || lost || disposed) return;
    gpu.renderer.render(gpu.scene, gpu.camera);
  }
  function invalidate() {
    if (queued || !gpu || !sceneVisible || modalOpen || document.hidden || lost || disposed) return;
    queued = true;
    g.ticker.add(flush, true);
  }
  function fallback(reason) {
    if (reason) console.warn('Four Views: using the photographic gallery.', reason);
    lost = true;
    ownTweens.forEach(t => { t.scrollTrigger?.kill(); t.kill(); });
    g?.ticker.remove(flush);
    queued = false;
    cleanupScene();
    gpu = null;
    stage.classList.remove('gpu-ready');
    document.body.classList.add('fv-fallback-mode');
    wordmark.style.transform = '';
    wordmark.style.opacity = '';
    focused = false;
    label();
    A.refresh();
  }

  if (!reduce && g && ST) {
    root.querySelectorAll('.fv-project').forEach((article, index) => {
      const prints = article.querySelectorAll('.photo');
      A.track(g.fromTo(prints, { y: (i) => 80 + i * 50, rotation: i => i % 2 ? 11 : -8, rotationY: i => i % 2 ? -24 : 24 }, {
        y: 0, rotation: 0, rotationY: 0, ease: 'none', stagger: .08,
        scrollTrigger: { trigger: article, start: 'top 95%', end: 'top 22%', scrub: .65 },
      }));
    });
    A.track(g.fromTo('.fv-interlude .photo', { xPercent: i => i ? 90 : -90, yPercent: i => i ? 50 : -50, rotation: i => i ? 35 : -35 }, {
      xPercent: i => i ? -15 : 15, yPercent: i => i ? -25 : 25, rotation: i => i ? -8 : 8,
      ease: 'none', scrollTrigger: { trigger: '.fv-interlude', start: 'top bottom', end: 'bottom top', scrub: .7 },
    }));
    startScene().catch(fallback);
  } else fallback();

  async function startScene() {
    const T = await import('./vendor/three/three.module.js');
    if (disposed) return;
    const renderer = new T.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'default' });
    let compileFailed = false;
    renderer.debug.onShaderError = () => { compileFailed = true; queueMicrotask(() => fallback('The photographic scene could not be rendered.')); };
    renderer.outputColorSpace = T.SRGBColorSpace;
    renderer.setClearColor(0xefeff1, 0);
    renderer.domElement.setAttribute('aria-hidden', 'true');
    const scene = new T.Scene();
    const camera = new T.PerspectiveCamera(38, 1, .1, 80);
    camera.position.z = 12;
    const geometry = new T.PlaneGeometry(1, 1, 10, 10);
    const loader = new T.TextureLoader();
    const curl = { value: 0 };
    const cards = [];
    let fullTexture = null;
    let fullIndex = -1;
    let fullRequest = 0;
    let observer = null;
    let visibleObserver = null;
    let cleaned = false;
    const pointerTweens = [];
    cleanupScene = () => {
      if (cleaned) return;
      cleaned = true; fullRequest++;
      observer?.disconnect(); visibleObserver?.disconnect();
      g.ticker.remove(flush);
      pointerTweens.forEach(t => t.kill());
      ownTweens.forEach(t => { t.scrollTrigger?.kill(); t.kill(); });
      cards.filter(Boolean).forEach(c => { c.thumb.dispose(); c.material.dispose(); });
      fullTexture?.dispose(); geometry.dispose(); renderer.dispose(); renderer.domElement.remove();
    };
    window.addEventListener('pagehide', event => { if (!event.persisted) { disposed = true; cleanupScene(); } });
    const entries = [...leads.map((p, i) => ({ image: portrait(p), lead: true, project: i })), ...Array.from({ length: 12 }, (_, i) => ({ image: A.get(leads[i % 4].images[(Math.floor(i / 4) + 2) % leads[i % 4].images.length]), lead: false, project: i % 4 }))];
    const pending = entries.map(async (entry, i) => {
      const texture = await loader.loadAsync(entry.image.thumb);
      if (disposed || lost || cleaned) { texture.dispose(); return; }
      texture.colorSpace = T.SRGBColorSpace;
      const material = new T.MeshBasicMaterial({ map: texture, side: T.DoubleSide, transparent: true, toneMapped: false });
      material.onBeforeCompile = shader => {
        shader.uniforms.uCurl = curl;
        shader.vertexShader = `uniform float uCurl;\n${shader.vertexShader}`.replace('#include <begin_vertex>', '#include <begin_vertex>\ntransformed.z += sin(uv.x * 3.14159265) * uCurl;');
      };
      material.customProgramCacheKey = () => 'photographic-sheet-v1';
      const mesh = new T.Mesh(geometry, material);
      mesh.userData.project = entry.project;
      scene.add(mesh);
      cards[i] = { mesh, material, thumb: texture, entry, aspect: entry.image.width / entry.image.height };
      if (gpu) { gpu.layout(); invalidate(); }
    });
    let width = 1, height = 1;
    const lerp = T.MathUtils.lerp;
    const smooth = (a, b, x) => { const n = T.MathUtils.clamp((x - a) / (b - a), 0, 1); return n * n * (3 - 2 * n); };
    const target = new T.Vector3();
    function layout() {
      const p = state.progress;
      const burst = Math.sin(smooth(.04, .78, p) * Math.PI);
      const finish = smooth(.72, 1, p);
      const f = state.focus;
      const mobile = width < 700;
      const baseH = mobile ? 3.0 : 3.0;
      const xGap = mobile ? 1.15 : 2.25;
      camera.position.set(Math.sin(p * Math.PI * 1.6) * .7 * (1 - f) + state.pointerX * .23, Math.sin(p * Math.PI) * .3 + state.pointerY * .15, 12 - burst * 2.7);
      camera.lookAt(0, 0, -burst * 1.2);
      curl.value = (1 - state.intro) * .15 + burst * .08 * (1 - f);
      cards.forEach((card, i) => {
        if (!card) return;
        const lead = i < 4;
        const sx = i % 2 ? 1 : -1;
        const sy = i < 2 ? 1 : -1;
        const angle = ((i * 137.5 + 25) * Math.PI / 180) + p * 1.0;
        let x, y, z, rx, ry, rz, h, alpha;
        if (lead) {
          x = sx * xGap + sx * burst * (mobile ? 1.6 : 2.7);
          y = sy * 1.62 + Math.sin(angle) * burst * 1.4;
          z = -burst * (1.2 + i * 1.2);
          rx = sy * burst * .2;
          ry = -sx * burst * .68;
          rz = sx * burst * .19;
          h = baseH;
          alpha = 1;
          if (i === selected) {
            x = lerp(x, 0, finish); y = lerp(y, 0, finish); z = lerp(z, 1.2, finish);
            rx *= 1 - finish; ry *= 1 - finish; rz *= 1 - finish; h = lerp(h, 5.5, finish);
          } else { x += sx * finish * 3.4; z -= finish * 2; alpha *= 1 - finish * .5; }
        } else {
          const radius = (mobile ? 2.2 : 3.8) + (i % 3) * .7;
          x = Math.cos(angle) * radius * (.35 + burst * .65);
          y = Math.sin(angle) * (2.8 + i % 2) * (.4 + burst * .6);
          z = -6 + ((i - 4) % 4) * 1.25 + burst * .8;
          rx = Math.sin(angle) * .18; ry = Math.cos(angle) * .55; rz = Math.sin(angle) * .25;
          h = 1.6 + (i % 3) * .25;
          alpha = smooth(.1, .3, p) * (1 - finish * .35);
        }
        if (f > 0) {
          if (i === selected) { x = lerp(x, 0, f); y = lerp(y, 0, f); z = lerp(z, 1.3, f); h = lerp(h, 5.7, f); rx *= 1-f; ry *= 1-f; rz *= 1-f; }
          else { x += Math.cos(angle) * f * 4; y += Math.sin(angle) * f * 2; z -= f * 4; alpha *= 1 - f * .78; }
        }
        const intro = state.intro;
        x += (1 - intro) * sx * 4.5;
        y += (1 - intro) * (i % 2 ? 4 : -4);
        z -= (1 - intro) * 9;
        ry += (1 - intro) * sx * 1.1;
        rz += (1 - intro) * sx * .5;
        const from = card.from;
        const blend = state.transition;
        card.mesh.position.set(from ? lerp(from.x, x, blend) : x, from ? lerp(from.y, y, blend) : y, from ? lerp(from.z, z, blend) : z);
        card.mesh.rotation.set(from ? lerp(from.rx, rx, blend) : rx, from ? lerp(from.ry, ry, blend) : ry, from ? lerp(from.rz, rz, blend) : rz);
        card.mesh.scale.set((from ? lerp(from.h, h, blend) : h) * card.aspect, from ? lerp(from.h, h, blend) : h, 1);
        card.material.opacity = from ? lerp(from.alpha, alpha, blend) : alpha;
        card.mesh.visible = alpha > .015;
      });
    }
    function resize() {
      if (cleaned) return;
      width = space.clientWidth; height = space.clientHeight;
      if (!width || !height) return;
      const dpr = Math.min(devicePixelRatio || 1, width < 700 ? 1.5 : 2, Math.sqrt(2000000 / (width * height)));
      renderer.setPixelRatio(dpr);
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      layout(); invalidate();
    }
    async function promote(index) {
      const request = ++fullRequest;
      if (index === fullIndex || !cards[index]) return;
      try {
        const texture = await loader.loadAsync(entries[index].image.src);
        if (disposed || lost || cleaned || request !== fullRequest || index !== selected) { texture.dispose(); return; }
        texture.colorSpace = T.SRGBColorSpace;
        if (fullIndex >= 0) cards[fullIndex].material.map = cards[fullIndex].thumb;
        fullTexture?.dispose(); fullTexture = texture; fullIndex = index;
        cards[index].material.map = texture;
        invalidate();
      } catch (error) { console.warn('Four Views: full-size preview unavailable; keeping thumbnail.', error); }
    }
    function capture() { cards.filter(Boolean).forEach(c => { c.from = { x:c.mesh.position.x, y:c.mesh.position.y, z:c.mesh.position.z, rx:c.mesh.rotation.x, ry:c.mesh.rotation.y, rz:c.mesh.rotation.z, h:c.mesh.scale.y, alpha:c.material.opacity }; }); }
    gpu = { scene, camera, renderer, layout, promote, capture };
    resize();
    observer = new ResizeObserver(resize);
    observer.observe(space);
    space.append(renderer.domElement);
    renderer.domElement.addEventListener('webglcontextlost', event => { event.preventDefault(); fallback('Graphics context was interrupted.'); });
    visibleObserver = new IntersectionObserver(([entry]) => { sceneVisible = entry.isIntersecting; if (sceneVisible) { layout(); invalidate(); } }, { rootMargin: '120px' });
    visibleObserver.observe(stage);
    const raycaster = new T.Raycaster();
    const pointer = new T.Vector2();
    let down = null;
    const pointers = new Set();
    space.addEventListener('pointerdown', event => { pointers.add(event.pointerId); down = pointers.size === 1 ? { x: event.clientX, y: event.clientY, id: event.pointerId } : null; });
    space.addEventListener('pointercancel', event => { pointers.delete(event.pointerId); down = null; });
    space.addEventListener('pointerup', event => {
      pointers.delete(event.pointerId);
      if (!down || down.id !== event.pointerId || lost) { down = null; return; }
      const dx = event.clientX - down.x, dy = event.clientY - down.y;
      down = null;
      if (Math.abs(dx) > 55 && Math.abs(dx) > Math.abs(dy) * 1.5) { choose(selected + (dx < 0 ? 1 : -1)); return; }
      if (Math.hypot(dx, dy) > 8) return;
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.set((event.clientX - rect.left) / rect.width * 2 - 1, -(event.clientY - rect.top) / rect.height * 2 + 1);
      raycaster.setFromCamera(pointer, camera);
      const hit = raycaster.intersectObjects(cards.filter(Boolean).map(c => c.mesh)).find(hit => hit.object.visible);
      if (hit) { const index = hit.object.userData.project; if (focused && selected === index) A.open(leads[index].images, 0, action); else choose(index); }
    });
    if (matchMedia('(hover:hover) and (pointer:fine)').matches) {
      const xTo = g.quickTo(state, 'pointerX', { duration: .55, onUpdate: update });
      const yTo = g.quickTo(state, 'pointerY', { duration: .55, onUpdate: update });
      pointerTweens.push(xTo.tween, yTo.tween);
      space.addEventListener('pointermove', event => { const rect = space.getBoundingClientRect(); xTo((event.clientX-rect.left)/rect.width-.5); yTo((event.clientY-rect.top)/rect.height-.5); });
      space.addEventListener('pointerleave', () => { xTo(0); yTo(0); });
    }
    const results = await Promise.allSettled(pending);
    if (disposed || lost) return;
    if (results.slice(0, 4).some(result => result.status === 'rejected')) { fallback('A lead photograph could not load.'); return; }
    results.slice(4).forEach(result => { if (result.status === 'rejected') console.warn('Four Views: one background photograph could not load.'); });
    layout(); renderer.render(scene, camera);
    if (compileFailed || lost) { fallback('The photographic scene could not be rendered.'); return; }
    stage.classList.add('gpu-ready');
    animate({ intro: 1, duration: 1.45, ease: 'power3.out' });
    const scroll = g.to(state, { progress: 1, ease: 'none', onUpdate: update, scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom bottom', scrub: .65, invalidateOnRefresh: true } });
    ownTweens.add(scroll); A.track(scroll);
    A.refresh();
  }
  document.addEventListener('concept:modal-open', () => { modalOpen = true; });
  document.addEventListener('concept:modal-close', () => { modalOpen = false; update(); });
  document.addEventListener('visibilitychange', () => { if (!document.hidden) update(); });
  window.addEventListener('pageshow', () => { update(); });
  label();
})();
