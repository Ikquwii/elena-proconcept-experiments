(() => {
  'use strict';
  const A = window.Atelier, D = window.MOCKUP_DATA?.elena;
  if (!A || !D) return;
  const env = A.setup(), g = env.gsap;
  const chapters = [...document.querySelectorAll('.ja-chapter')];
  const menu = document.querySelector('.ja-menu');
  menu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => { menu.open = false; }));
  menu.addEventListener('keydown', e => { if (e.key === 'Escape') { menu.open = false; menu.querySelector('summary').focus(); } });
  const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
  const smooth = (a, b, x) => { const t = clamp((x - a) / (b - a)); return t * t * (3 - 2 * t); };
  const lerp = (a, b, t) => a + (b - a) * t;
  const moving = Boolean(g && env.ScrollTrigger && !env.reduce);
  if (moving) document.documentElement.classList.add('ja-motion');
  const scenes = [];
  let restorePending = null;

  chapters.forEach(section => {
    const project = D.projects[Number(section.dataset.project)];
    const field = section.querySelector('.ja-field');
    const prints = [...field.querySelectorAll('.ja-print')];
    const buttons = prints.map(print => print.querySelector('.photo'));
    const counter = section.querySelector('.ja-count');
    const state = { p: 0, active: 0 };
    let timeline, width = 1, height = 1;
    const count = prints.length;
    function setActive(index) {
      const value = clamp(index, 0, count - 1);
      if (value !== state.active) { state.active = value; counter.textContent = `${String(value + 1).padStart(2, '0')} / 04`; }
      if (moving) buttons.forEach((b, i) => { b.tabIndex = i === value ? 0 : -1; });
    }
    function travel(index) {
      index = (index + count) % count;
      if (!moving || !timeline) {
        setActive(index);
        buttons[index].scrollIntoView({ block: 'center', behavior: 'instant' });
        buttons[index].focus({ preventScroll: true });
        return;
      }
      const trigger = timeline.scrollTrigger;
      const top = trigger.start + (trigger.end - trigger.start) * index / (count - 1);
      if (env.lenis) env.lenis.scrollTo(top, { duration: 1.1 });
      else window.scrollTo({ top, behavior: 'smooth' });
    }
    section.querySelector('.ja-prev').addEventListener('click', () => travel(state.active - 1));
    section.querySelector('.ja-next').addEventListener('click', () => travel(state.active + 1));
    section.querySelector('.ja-full').addEventListener('click', e => A.open(project.images, project.images.indexOf(buttons[state.active].dataset.photo), e.currentTarget));
    section.querySelector('.ja-all').addEventListener('click', e => A.open(project.images, 0, e.currentTarget));
    if (!moving) return;

    const mode = section.dataset.mode;
    function draw() {
      if (restorePending) return;
      const q = state.p * (count - 1), index = Math.min(count - 1, Math.floor(q));
      const fraction = q - index;
      const turn = smooth(.18, .88, fraction);
      const active = mode === 'folio' || mode === 'overprint' ? Math.min(count - 1, index + (turn > .52 ? 1 : 0)) : Math.round(q);
      setActive(active);
      prints.forEach((print, i) => {
        const distance = i - q;
        let x = 0, y = 0, scale = 1, rotation = 0, rotationY = 0, opacity = 1, zIndex = 1;
        let clipPath = 'inset(0% 0% 0% 0%)';
        if (mode === 'sheet') {
          const emphasis = 1 - smooth(0, 1, Math.abs(distance));
          const gx = (i % 2 ? 1 : -1) * width * .28;
          const gy = (i < 2 ? -1 : 1) * height * .28;
          x = lerp(gx, 0, emphasis); y = lerp(gy, 0, emphasis);
          scale = lerp(.43, 1, emphasis);
          rotation = lerp(i % 2 ? 5 : -5, 0, emphasis);
          zIndex = 10 + Math.round(emphasis * 20);
          opacity = lerp(.88, 1, emphasis);
        } else if (mode === 'folio') {
          zIndex = count - i;
          if (i < index) { rotationY = -124; x = -width * .45; opacity = 0; }
          else if (i === index && index < count - 1) {
            rotationY = -124 * turn; x = -width * .19 * turn;
            rotation = -4 * turn;
            opacity = 1 - smooth(.72, .92, turn);
          }
        } else if (mode === 'overprint') {
          const axes = [[0, 1], [1, 0], [0, -1], [-1, 0]];
          zIndex = i + 1;
          if (i < index) { opacity = 0; }
          else if (i === index) { scale = 1 - turn * .12; rotation = (i % 2 ? -1 : 1) * turn * 7; }
          else {
            const arrival = i === index + 1 ? turn : 0;
            const [dx, dy] = axes[i];
            x = dx * width * 1.2 * (1 - arrival); y = dy * height * 1.2 * (1 - arrival);
            rotation = (1 - arrival) * (i % 2 ? 9 : -9);
            opacity = arrival > .005 ? 1 : 0;
            clipPath = `inset(${(1 - arrival) * 12}% 0% 0% 0%)`;
          }
        } else {
          x = distance * width * .84;
          y = Math.sin(distance * .75) * height * .22;
          rotation = distance * -9;
          rotationY = clamp(distance, -1, 1) * -15;
          scale = 1 - Math.min(1, Math.abs(distance)) * .16;
          opacity = 1 - smooth(1.2, 1.75, Math.abs(distance));
          zIndex = 20 - Math.round(Math.abs(distance) * 4);
        }
        g.set(print, { x, y, scale, rotation, rotationY, opacity, zIndex, clipPath });
        print.style.pointerEvents = opacity > .05 ? 'auto' : 'none';
      });
      const big = section.querySelector('.ja-big-type');
      const typeX = mode === 'folio' ? -50 + state.p * 13 : mode === 'overprint' ? -75 + state.p * 45 : -58 + state.p * 16;
      g.set(big, { xPercent: typeX, x: 0, rotation: mode === 'archive' ? -10 + state.p * 16 : 0 });
      g.set(section.querySelector('.ja-progress i'), { scaleX: .08 + state.p * .92 });
      const guide = section.querySelector('.ja-guide');
      g.set(guide, { rotation: mode === 'overprint' ? Math.sin(q * Math.PI) * 6 : 0, scale: 1 - Math.sin(q * Math.PI) ** 2 * .04 });
    }
    const measure = () => { width = field.clientWidth; height = field.clientHeight; draw(); };
    timeline = A.track(g.to(state, { p: 1, ease: 'none', onUpdate: draw, scrollTrigger: { trigger: section, start: 'top top', end: 'bottom bottom', scrub: .48, invalidateOnRefresh: true, onRefresh: measure } }));
    measure();
    scenes.push({ section, timeline, measure });
  });

  if (!moving) return;
  const cover = document.querySelector('.ja-cover');
  const coverField = document.querySelector('.ja-cover-prints');
  const coverPrints = [...coverField.querySelectorAll('.ja-print')];
  const coverState = { p: 0 };
  let coverW = 1, coverH = 1;
  function coverDraw() {
    if (restorePending) return;
    const p = coverState.p, expansion = smooth(.03, .67, p), departure = smooth(.7, 1, p);
    coverPrints.forEach((print, i) => {
      const side = i % 2 ? 1 : -1;
      const row = i < 2 ? -1 : 1;
      g.set(print, { x: side * coverW * .29 * expansion + side * coverW * 1.1 * departure, y: row * coverH * .24 * expansion - coverH * .35 * departure, scale: 1 - expansion * .54, rotation: (i - 1.5) * 4 * (1 - expansion) + side * departure * 34, rotationY: departure * side * 45, opacity: 1 - departure, zIndex: 10 - i });
      print.style.pointerEvents = departure > .95 ? 'none' : 'auto';
      print.querySelector('.photo').tabIndex = departure > .1 ? -1 : expansion > .6 || i === 0 ? 0 : -1;
    });
    g.set(cover.querySelector('h1'), { y: -coverH * .28 * p, x: -coverW * .13 * p, rotation: -5 * p });
    g.set(cover.querySelector('.ja-cover-mark'), { scale: .84 + p * .2, rotation: 8 * p });
  }
  const coverMeasure = () => { coverW = coverField.clientWidth; coverH = coverField.clientHeight; coverDraw(); };
  const coverTimeline = A.track(g.to(coverState, { p: 1, ease: 'none', onUpdate: coverDraw, scrollTrigger: { trigger: cover, start: 'top top', end: 'bottom bottom', scrub: .5, invalidateOnRefresh: true, onRefresh: coverMeasure } }));
  scenes.unshift({ section: cover, timeline: coverTimeline, measure: coverMeasure });
  coverMeasure();

  const end = document.querySelector('.ja-colophon'), endField = end.querySelector('.ja-signature-prints');
  const endPrints = [...endField.querySelectorAll('.ja-print')], endState = { p: 0 };
  let endW = 1, endH = 1;
  function endDraw() {
    if (restorePending) return;
    const p = endState.p, assemble = smooth(0, .63, p), ink = smooth(.4, .9, p);
    endPrints.forEach((print, i) => {
      const archiveX = (i - 1.5) * endW * .72;
      const finalX = (i - 1.5) * endW * .26;
      g.set(print, { x: lerp(archiveX, finalX, assemble), y: lerp((i % 2 ? 1 : -1) * endH * .6, 0, assemble), rotation: lerp((i - 1.5) * -16, (i - 1.5) * 3, assemble), scale: lerp(1.9, .88, assemble) });
      print.querySelector('.photo').tabIndex = assemble >= .9 ? 0 : -1;
    });
    g.set(end.querySelectorAll('.ja-signature h2 span'), { clipPath: `inset(${(1 - ink) * 100}% 0 0 0)`, y: (1 - ink) * 45 });
    g.set(end.querySelector('.ja-end-mark'), { xPercent: 14 * (1 - assemble), rotation: -10 * (1 - assemble), opacity: .4 + ink * .6 });
  }
  const endMeasure = () => { endW = endField.clientWidth; endH = endField.clientHeight; endDraw(); };
  const endTimeline = A.track(g.to(endState, { p: 1, ease: 'none', onUpdate: endDraw, scrollTrigger: { trigger: end, start: 'top top', end: 'bottom bottom', scrub: .5, invalidateOnRefresh: true, onRefresh: endMeasure } }));
  scenes.push({ section: end, timeline: endTimeline, measure: endMeasure });
  endMeasure();
  let knownWidth = innerWidth, resizeCall = null;
  let position = { scene: scenes[0], fraction: 0 };
  function rememberPosition() {
    // Keep the pre-rotation coordinate until the new width has been restored.
    if (restorePending || innerWidth !== knownWidth) return;
    let index = 0;
    scenes.forEach((scene, i) => { if (scrollY >= scene.timeline.scrollTrigger.start) index = i; });
    const scene = scenes[index], trigger = scene.timeline.scrollTrigger;
    const boundary = scenes[index + 1]?.timeline.scrollTrigger.start ?? trigger.end;
    position = { scene, fraction: clamp((scrollY - trigger.start) / Math.max(1, boundary - trigger.start)) };
  }
  function preserveOnResize() {
    if (innerWidth === knownWidth) return;
    restorePending ||= position;
    knownWidth = innerWidth;
    resizeCall?.kill();
    resizeCall = g.delayedCall(.24, () => {
      env.ScrollTrigger.refresh();
      const saved = restorePending, trigger = saved.scene.timeline.scrollTrigger;
      const next = scenes[scenes.indexOf(saved.scene) + 1];
      const boundary = next?.timeline.scrollTrigger.start ?? trigger.end;
      const top = trigger.start + (boundary - trigger.start) * saved.fraction;
      restorePending = null;
      if (env.lenis) env.lenis.scrollTo(top, { immediate: true, force: true });
      else window.scrollTo({ top, behavior: 'instant' });
      env.ScrollTrigger.update();
      scenes.forEach(scene => { scene.timeline.scrollTrigger.getTween()?.progress(1); scene.measure(); });
      rememberPosition();
    });
  }
  window.addEventListener('scroll', rememberPosition, { passive: true });
  window.addEventListener('resize', preserveOnResize, { passive: true });
  window.addEventListener('pagehide', event => {
    if (event.persisted) return;
    resizeCall?.kill();
    window.removeEventListener('scroll', rememberPosition);
    window.removeEventListener('resize', preserveOnResize);
  });
  rememberPosition();
  A.refresh();
})();
