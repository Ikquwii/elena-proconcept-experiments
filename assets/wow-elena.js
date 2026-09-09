(() => {
  'use strict';
  const A = window.Atelier, D = window.MOCKUP_DATA?.elena;
  if (!A || !D?.images.length) return;
  const E = A.esc;
  const orbit = document.body.dataset.concept === 'wow-orbit';
  const ids = {
    silver: '516d35_34411c80c793474589279fb3ad9299e0~mv2.jpeg',
    seated: '516d35_74a22f8a45824e35be3c1dc850ae7293~mv2.jpeg',
    runway: '516d35_62017b7e5be947e2be90e10ae37b711c~mv2.jpeg',
    suit: '516d35_c54a9ce3f7e848e8801b506ca9490fcc~mv2.jpg',
    pool: '516d35_a1d7e2e5487d484a8b48ec3aaeacc2e0~mv2.jpg'
  };
  const hero = orbit ? [ids.suit, ids.runway, ids.silver, ids.seated, ids.pool] : [ids.pool, ids.suit, ids.seated, ids.runway, ids.silver];
  const projects = D.projects.slice(0, 4);
  const photo = (id, cls = '', eager = false) => A.photo(id, { className: cls, eager, caption: false, sizes: '(max-width: 699px) 70vw, 32vw' });
  const header = `<header class="we-header"><a class="we-brand" href="#top">Elena<br>Belousova</a><nav aria-label="Primary"><a href="#work">Work</a><a href="#contact">Contact ↗</a></nav></header>`;
  const controls = `<div class="we-controls"><button type="button" data-step="-1" aria-label="Previous photograph">←</button><span class="we-position" aria-live="polite">03 / 05</span><button type="button" data-step="1" aria-label="Next photograph">→</button><button type="button" class="we-reset" data-reset hidden>All frames</button><button type="button" class="we-replay" data-replay aria-label="Replay entrance">↺</button></div>`;
  const orbitHero = `<section class="we-journey wo-journey" id="top"><div class="we-stage wo-stage">${header}<div class="wo-title"><span class="we-kicker">Fashion photography</span><h1><span><b class="we-word-intro">Elena</b></span><i><b class="we-word-intro">Belousova</b></i></h1></div><div class="wo-world"><div class="wo-orbit">${hero.map((id, i) => `<div class="wo-card" data-hero-index="${i}" style="--slot:${i - 2};z-index:${5 - Math.abs(i - 2)}"><div class="wo-flight">${photo(id, 'wo-print', i === 2)}</div></div>`).join('')}</div></div><div class="wo-endmark" aria-hidden="true">A singular<br><i>point of view.</i></div><div class="we-stage-bottom"><p class="we-instruction">Swipe the orbit. Tap a print.</p>${controls}<a class="we-scroll" href="#work">Keep looking <span>↓</span></a></div><div class="we-scene-progress" aria-hidden="true"><span></span></div></div></section>`;
  const obliqueHero = `<section class="we-journey wx-journey" id="top"><div class="we-stage wx-stage">${header}<div class="wx-topnote"><span>Fashion photography</span><span>A different angle.</span></div><h1 class="wx-title"><span><b class="we-word-intro">ELENA</b></span><i><b class="we-word-intro">BELOUSOVA</b></i></h1><div class="wx-ribbon"><div class="wx-focus"><div class="wx-track">${hero.map((id, i) => `<div class="wx-card" data-hero-index="${i}"><div class="wx-flight">${photo(id, 'wx-print', i === 2)}</div></div>`).join('')}</div></div></div><div class="wx-crossword" aria-hidden="true">POINT OF VIEW — POINT OF VIEW —</div><div class="wx-endmark" aria-hidden="true">THE<br><i>unexpected.</i></div><div class="we-stage-bottom"><p class="we-instruction">Swipe to shift the frame. Tap to compose.</p>${controls}<a class="we-scroll" href="#work">Change perspective <span>↘</span></a></div><div class="we-scene-progress" aria-hidden="true"><span></span></div></div></section>`;
  const series = projects.map((p, i) => `<section class="we-series ${orbit ? 'wo-series' : 'wx-series'}" id="series-${i}"><header class="we-series-heading"><span class="we-kicker">0${i + 1} / Photographic stories</span><h2>${E(p.title)}</h2><button class="we-case" data-case="${E(p.images.join(','))}">Explore the full story ↗</button></header><div class="${orbit ? 'wo-constellation' : 'wx-zigzag'}">${p.images.slice(0, 4).map((id, j) => `<div class="we-frame we-frame-${j}"><div class="we-frame-flight">${photo(id)}<span class="we-frame-caption">${String(j + 1).padStart(2, '0')} / ${E(p.title)}</span></div></div>`).join('')}</div></section>`).join('');
  const work = `<section class="we-work-intro" id="work"><span class="we-kicker">Selected work</span><p>${orbit ? 'Images with<br><i>their own gravity.</i>' : 'Nothing stays<br><i>in a straight line.</i>'}</p><nav aria-label="Photographic collections">${projects.map((p, i) => `<a href="#series-${i}">${E(p.title)} <span>↗</span></a>`).join('')}</nav></section>${series}`;
  const footer = `<section class="we-about" id="about"><span class="we-kicker">The eye behind the image</span><h2>Elena<br><i>Belousova.</i></h2><p>Fashion photography.<br>Editorial, portraits &amp; personal work.</p></section><footer class="we-contact" id="contact"><div class="we-contact-mark" aria-hidden="true">EB</div><div><span class="we-kicker">Make the next image</span><h2>Let’s create<br><i>something felt.</i></h2><a href="mailto:${E(D.email)}">${E(D.email)} ↗</a></div><p>Elena Belousova — Photography <a href="#top">Return to the beginning ↑</a></p></footer>`;
  document.getElementById('we-site').innerHTML = `<main id="main">${orbit ? orbitHero : obliqueHero}${work}${footer}</main>`;
  const env = A.setup();
  const G = env.gsap, ST = env.ScrollTrigger;
  const motion = Boolean(G && ST && !env.reduce);
  const track = tl => { A.track(tl); return tl; };
  const stage = document.querySelector('.we-stage');
  const cards = [...document.querySelectorAll('[data-hero-index]')];
  const counter = document.querySelector('.we-position');
  let active = 2, focused = false, intro = null;
  let suppressClickUntil = 0;
  const mobile = () => innerWidth < 700;
  const wrap = n => ((n % hero.length) + hero.length) % hero.length;
  const slot = index => ((index - active + 7) % 5) - 2;
  const tween = (target, vars) => motion ? track(G.to(target, { duration: .85, ease: 'power4.inOut', overwrite: 'auto', ...vars })) : null;
  document.querySelectorAll('[data-case]').forEach(button => button.addEventListener('click', () => A.open(button.dataset.case.split(','), 0, button)));

  function compose(animate = true) {
    counter.textContent = `${String(active + 1).padStart(2, '0')} / 05`;
    document.querySelector('[data-reset]').hidden = !focused;
    document.querySelector('.we-instruction').textContent = focused ? 'Tap the chosen photograph for the full frame.' : orbit ? 'Swipe the orbit. Tap a print.' : 'Swipe to shift the frame. Tap to compose.';
    stage.classList.toggle('we-focused', focused);
    cards.forEach((card, i) => {
      const n = slot(i);
      card.dataset.active = i === active ? 'true' : 'false';
      card.querySelector('.photo').tabIndex = i === active ? 0 : -1;
      card.style.zIndex = 6 - Math.abs(n);
      if (orbit) {
        const spread = mobile() ? innerWidth * .32 : Math.min(innerWidth * .19, 270);
        const vars = { xPercent: -50, yPercent: -50, x: n * spread * (focused ? 1.9 : 1), y: Math.abs(n) * (focused ? 12 : 35), z: focused ? (n ? -450 : 90) : -Math.abs(n) * 125, rotationY: n * (focused ? -42 : -23), rotationZ: n * (focused ? 4 : 12), scale: focused ? (n ? .72 : 1.13) : 1 };
        card.style.setProperty('--slot', n);
        if (motion) animate ? tween(card, vars) : G.set(card, vars);
      } else {
        const vars = { y: focused && n ? 65 + Math.abs(n) * 18 : 0, rotation: focused ? n * 12 : 0, scale: focused ? (n ? .84 : 1.04) : 1 };
        if (motion) animate ? tween(card, vars) : G.set(card, vars);
        else card.style.opacity = i === active || !focused ? '1' : '.65';
      }
    });
    if (!orbit) {
      const cardWidth = cards[0].offsetWidth;
      const gap = innerWidth < 700 ? 18 : 36;
      const x = -(active - 2) * (cardWidth + gap);
      if (motion) {
        const vars = { x };
        animate ? tween('.wx-track', vars) : G.set('.wx-track', vars);
        animate ? tween('.wx-focus', { rotation: focused ? 14 : 0 }) : G.set('.wx-focus', { rotation: focused ? 14 : 0 });
      } else document.querySelector('.wx-track').style.transform = `translateX(${x}px)`;
    }
  }
  function step(direction) { focused = false; active = wrap(active + direction); compose(); }
  document.querySelectorAll('[data-step]').forEach(button => button.addEventListener('click', () => step(Number(button.dataset.step))));
  document.querySelector('[data-reset]').addEventListener('click', () => { focused = false; compose(); });
  stage.addEventListener('click', event => {
    const card = event.target.closest('[data-hero-index]');
    if (!card) return;
    if (performance.now() < suppressClickUntil) { event.preventDefault(); event.stopPropagation(); return; }
    const index = Number(card.dataset.heroIndex);
    if (!focused || index !== active) { event.preventDefault(); event.stopPropagation(); active = index; focused = true; compose(); }
  }, true);
  let touchX = 0, touchY = 0;
  const touchSurface = document.querySelector(orbit ? '.wo-world' : '.wx-ribbon');
  touchSurface.addEventListener('touchstart', event => { touchX = event.changedTouches[0].clientX; touchY = event.changedTouches[0].clientY; }, { passive: true });
  touchSurface.addEventListener('touchend', event => { const dx = event.changedTouches[0].clientX - touchX, dy = event.changedTouches[0].clientY - touchY; if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.25) { suppressClickUntil = performance.now() + 400; step(dx < 0 ? 1 : -1); } }, { passive: true });
  compose(false);

  function entrance() {
    if (!motion) return;
    intro?.kill();
    const prints = document.querySelectorAll(orbit ? '.wo-print' : '.wx-print');
    G.set(prints, { clearProps: 'transform,opacity,visibility' });
    G.set('.we-word-intro', { clearProps: 'transform' });
    intro = G.timeline({ defaults: { ease: 'power4.out' } });
    if (orbit) {
      intro.from(prints, { x: i => (i - 2) * 75, y: i => i === 2 ? 80 : 180, z: -550, rotationY: i => (i - 2) * 36, rotationX: 32, scale: .45, duration: 1.2, stagger: { each: .045, from: 'center' }, clearProps: 'transform' }, 0)
        .from('.wo-title h1 span .we-word-intro', { x: -100, rotation: -10, duration: .9, clearProps: 'transform' }, .12)
        .from('.wo-title h1 i .we-word-intro', { x: 110, rotation: 8, duration: 1, clearProps: 'transform' }, .18);
    } else {
      intro.from(prints, { x: 130, y: 60, rotationY: -65, rotationZ: 20, scale: .75, duration: 1.05, stagger: .075, clearProps: 'transform' }, 0)
        .from('.wx-title span .we-word-intro', { xPercent: -70, duration: 1.15, clearProps: 'transform' }, 0)
        .from('.wx-title i .we-word-intro', { xPercent: 70, duration: 1.2, clearProps: 'transform' }, .1);
    }
    track(intro);
  }
  document.querySelector('[data-replay]').addEventListener('click', entrance);
  if (!motion) document.querySelector('[data-replay]').hidden = true;
  if (motion) {
    document.documentElement.classList.add('we-motion');
    entrance();
    env.mm.add('(prefers-reduced-motion:no-preference)', () => {
      const journey = document.querySelector('.we-journey');
      const timeline = G.timeline({ defaults: { ease: 'none' }, scrollTrigger: { trigger: journey, start: 'top top', end: 'bottom bottom', scrub: .7, invalidateOnRefresh: true } });
      if (orbit) {
        timeline.addLabel('expand', 0)
          .to('.wo-orbit', { rotationZ: 19, rotationY: -28, rotationX: 12, scale: 1.2, yPercent: -6, duration: 1.1 }, 'expand')
          .to('.wo-flight', { x: i => (i - 2) * (mobile() ? 58 : 100), y: i => Math.abs(i - 2) * -65, z: 200, rotationZ: i => (i - 2) * 9, duration: 1.1 }, 'expand')
          .to('.wo-title h1 span', { xPercent: -65, rotation: -14, duration: .8 }, 'expand')
          .to('.wo-title h1 i', { xPercent: 55, rotation: 12, duration: .8 }, 'expand')
          .addLabel('gather', 1.1)
          .to('.wo-orbit', { rotationZ: -8, rotationY: 0, rotationX: 0, scale: .9, yPercent: -20, duration: 1 }, 'gather')
          .to('.wo-flight', { x: i => -(i - 2) * (mobile() ? 36 : 60), y: i => -Math.abs(i - 2) * 18, z: 0, rotationZ: i => -(i - 2) * 10, duration: 1 }, 'gather')
          .fromTo('.wo-endmark', { yPercent: 100, scale: .7, autoAlpha: 0 }, { yPercent: 0, scale: 1, autoAlpha: 1, duration: .65, immediateRender: false }, 1.3)
          .to('.wo-title', { autoAlpha: 0, duration: .3 }, 1.1);
      } else {
        timeline.addLabel('cross', 0)
          .to('.wx-ribbon', { x: () => -innerWidth * .7, rotation: 15, yPercent: -8, scale: 1.14, duration: 1.2 }, 'cross')
          .to('.wx-flight', { rotationY: i => (i - 2) * 17, rotationZ: i => i % 2 ? 12 : -12, y: i => i % 2 ? -65 : 65, duration: 1.2 }, 'cross')
          .to('.wx-title span', { xPercent: 75, rotation: 7, duration: 1 }, 'cross')
          .to('.wx-title i', { xPercent: -70, rotation: -8, duration: 1 }, 'cross')
          .to('.wx-crossword', { xPercent: -45, rotation: -12, duration: 1.2 }, 'cross')
          .addLabel('assemble', 1.2)
          .to('.wx-ribbon', { x: 0, rotation: -6, yPercent: -12, scale: .86, duration: 1 }, 'assemble')
          .to('.wx-flight', { rotationY: 0, rotationZ: 0, y: 0, duration: 1 }, 'assemble')
          .to('.wx-title', { autoAlpha: 0, duration: .35 }, 'assemble')
          .fromTo('.wx-endmark', { xPercent: -45, rotation: -10, autoAlpha: 0 }, { xPercent: 0, rotation: 0, autoAlpha: 1, duration: .7, immediateRender: false }, 1.35);
      }
      timeline.to('.we-scene-progress span', { scaleX: 1, duration: timeline.duration() }, 0);
      track(timeline);
      document.querySelectorAll('.we-series').forEach((section, index) => {
        const frames = section.querySelectorAll('.we-frame-flight');
        const tl = G.timeline({ defaults: { ease: 'none' }, scrollTrigger: { trigger: section, start: 'top 90%', end: 'bottom 85%', scrub: .75 } });
        if (orbit) {
          tl.from(frames, { rotationY: i => i % 2 ? -52 : 52, rotationZ: i => i % 2 ? 16 : -16, z: -250, x: i => i % 2 ? 55 : -55, y: 70, scale: .7, stagger: .16, duration: 1, immediateRender: false }, 0);
        } else {
          tl.from(frames, { x: i => i % 2 ? 140 : -140, y: i => i % 2 ? -95 : 95, rotationZ: i => i % 2 ? 24 : -24, rotationY: i => i % 2 ? 24 : -24, scale: .82, stagger: .18, duration: 1.2, immediateRender: false }, 0);
        }
        tl.from(section.querySelector('h2'), { xPercent: index % 2 ? 20 : -20, skewX: index % 2 ? -12 : 12, duration: 1, immediateRender: false }, 0);
        track(tl);
      });
      track(G.from('.we-contact-mark', { rotation: orbit ? -35 : 35, scale: .45, xPercent: orbit ? -25 : 25, scrollTrigger: { trigger: '.we-contact', start: 'top bottom', end: 'top 25%', scrub: .8 }, ease: 'none' }));
    });
  }
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      if (motion) { G.killTweensOf(cards); if (!orbit) G.killTweensOf('.wx-track, .wx-focus'); }
      compose(false);
      A.refresh();
    }, 180);
  }, { passive: true });
})();
