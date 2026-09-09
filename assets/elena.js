(() => {
  'use strict';
  const D = window.MOCKUP_DATA?.elena;
  const A = window.Atelier;
  if (!D?.images?.length || !A) return;
  const esc = A.esc;
  const images = D.images;
  const image = n => images[((n % images.length) + images.length) % images.length];
  const photo = (n, cls = '', eager = false) => A.photo(typeof n === 'number' ? image(n).id : n, { className: cls, caption: false, eager });
  const candidates = (D.projects || []).filter(p => p.images?.length);
  const projects = candidates.length ? candidates.slice(0, 4) : [...new Set(images.map(i => i.category))].slice(0, 4).map(category => ({ title: category, images: images.filter(i => i.category === category).map(i => i.id) }));
  const pi = (p, n) => p.images[n % p.images.length];
  const ptitle = p => esc(p.title || p.category || 'Selected work');
  const sectionName = (p, n) => `<span class="e-eyebrow">${String(n + 1).padStart(2, '0')} / Selected photographs</span><h2>${ptitle(p)}</h2>`;
  const brand = `<a class="e-brand" href="#top" aria-label="Elena Belousova, top">Elena<br>Belousova</a>`;
  const header = (variant = '') => `<header class="e-header ${variant}">${brand}<nav aria-label="Primary"><a href="#work">Work</a><a href="#about">About</a><a href="#contact">Contact <span>↗</span></a></nav></header>`;
  const footer = () => `<section class="e-about" id="about"><span class="e-eyebrow">Behind the photographs</span><div><h2>Elena<br><i>Belousova.</i></h2><p>Fashion photography.<br>Editorial, portraits &amp; personal work.</p><a class="e-textlink" href="mailto:elenawhiteusova@gmail.com">Discuss a project ↗</a></div>${photo(19, 'e-about-photo')}</section><footer class="e-contact" id="contact"><p>For the next<br><i>beautiful image.</i></p><a href="mailto:elenawhiteusova@gmail.com">elenawhiteusova@gmail.com ↗</a><div><span>Elena Belousova — Photography</span><a href="#top">Back to top ↑</a></div></footer>`;
  const caseButton = p => `<button class="e-textlink" data-open-case="${esc(p.images.join(','))}">View the full story ↗</button>`;
  const render = {};

  render.eventail = () => `${header('e-header-fan')}<main id="main"><section class="e-fan-hero" id="top"><div class="e-fan-title"><span class="e-eyebrow">Fashion photography</span><h1>A singular<br><i>point of view.</i></h1></div><div class="e-fan" data-fan>${[3, 14, 1, 10, 23].map((n, i) => `<div class="e-fan-print" style="--slot:${i - 2}">${photo(n, '', i === 2)}</div>`).join('')}</div><div class="e-fan-bottom"><span>Elena Belousova</span><div><button data-fan-step="-1" aria-label="Previous composition">←</button><button data-fan-step="1" aria-label="Next composition">→</button></div><a href="#work">Discover the work ↓</a></div></section><section class="e-fan-work" id="work"><div class="e-section-heading"><span>Selected work</span><h2>Stories, <i>unfolded.</i></h2></div>${projects.map((p, i) => `<section id="work-${i}" class="e-fan-story"><header>${sectionName(p, i)}${caseButton(p)}</header><div class="e-fan-story-photos">${Array.from({ length: 5 }, (_, j) => photo(pi(p, j), `e-story-print e-story-print-${j}`)).join('')}</div></section>`).join('')}</section>${footer()}</main>`;

  render.volets = () => `${header('e-header-volets')}<main id="main"><section id="top" class="e-shutter-hero"><h1>Elena Belousova<span>Photographs in motion.</span></h1><div class="e-shutters" data-shutters>${projects.map((p, i) => `<article class="e-shutter ${i === 1 ? 'e-active' : ''}">${photo(pi(p, i), '', i === 1)}<button class="e-shutter-label" data-shutter="${i}" aria-expanded="${i === 1}"><span>0${i + 1}</span><strong>${ptitle(p)}</strong><span>↗</span></button></article>`).join('')}</div><div class="e-shutter-foot"><span>Fashion / Editorial / Portraits</span><a href="#work">Enter the archive ↓</a></div></section><div id="work" class="e-accordion-work">${projects.map((p, i) => `<section id="work-${i}" class="e-accordion-section"><header>${sectionName(p, i)}${caseButton(p)}</header><div class="e-accordion-photos">${Array.from({ length: 6 }, (_, j) => photo(pi(p, j), `e-accordion-photo e-ap-${j}`)).join('')}</div></section>`).join('')}</div>${footer()}</main>`;

  render.contrechamp = () => `${header('e-header-over')}<main id="main"><section class="e-counter-hero" id="top"><div class="e-counter-columns">${[0, 1, 2].map((c) => `<div class="e-counter-column e-cc-${c}">${[c + 2, c + 12, c + 22].map((n, j) => photo(n, '', c === 1 && j === 0)).join('')}</div>`).join('')}</div><div class="e-counter-name"><span>Fashion photographer</span><h1>Elena <i>Belousova</i></h1><a href="#work">Selected perspectives ↓</a></div></section><div id="work" class="e-counter-work">${projects.map((p, i) => `<section id="work-${i}" class="e-counter-story"><header>${sectionName(p, i)}${caseButton(p)}</header><div class="e-triptych"><div>${photo(pi(p, 1))}${photo(pi(p, 3))}</div><div>${photo(pi(p, 0))}<span>${ptitle(p)}</span></div><div>${photo(pi(p, 2))}${photo(pi(p, 4))}</div></div></section>`).join('')}</div>${footer()}</main>`;

  render.oblique = () => `${header('e-header-oblique')}<main id="main"><section class="e-oblique-hero" id="top"><div class="e-oblique-note"><span>Fashion photography</span><span>A different angle.</span></div><div class="e-diagonal">${[4, 17, 2].map((n, i) => photo(n, '', i === 1)).join('')}</div><h1>ELENA<br><i>BELOUSOVA</i></h1><a class="e-oblique-arrow" href="#work" aria-label="Discover selected work">↘</a></section><div id="work" class="e-oblique-work">${projects.map((p, i) => `<section id="work-${i}" class="e-oblique-story ${i % 2 ? 'e-reverse' : ''}"><header>${sectionName(p, i)}${caseButton(p)}</header><div class="e-zigzag">${Array.from({ length: 5 }, (_, j) => photo(pi(p, j), `e-zig e-zig-${j}`)).join('')}</div></section>`).join('')}</div>${footer()}</main>`;

  render.iris = () => `${header('e-header-iris')}<main id="main"><section id="top" class="e-iris-hero"><div class="e-iris-word"><h1>Elena<br><i>Belousova</i></h1><p>Through another lens.</p></div><div class="e-iris-window">${photo('516d35_34411c80c793474589279fb3ad9299e0~mv2.jpeg', '', true)}</div><a class="e-iris-enter" href="#work">An eye<br>for the unexpected.<span>↓</span></a></section><div id="work" class="e-iris-work">${projects.map((p, i) => `<section id="work-${i}" class="e-iris-story"><header>${sectionName(p, i)}${caseButton(p)}</header><div class="e-iris-portal">${photo(pi(p, 0))}</div><div class="e-iris-satellites">${Array.from({ length: 5 }, (_, j) => photo(pi(p, j + 1), `e-satellite e-satellite-${j}`)).join('')}</div></section>`).join('')}</div>${footer()}</main>`;

  render.reflets = () => `${header('e-header-reflets')}<main id="main"><section id="top" class="e-mirror-hero"><h1>ELENA BELOUSOVA</h1><div class="e-mirrors">${[0, 1, 2, 3, 4].map((n) => `<div class="e-mirror e-mirror-${n}">${photo(16, '', n === 2)}</div>`).join('')}</div><div class="e-mirror-bottom"><span>Beauty in repetition.</span><a href="#work">Selected work ↓</a><span>Fashion photography</span></div></section><div id="work" class="e-mirror-work">${projects.map((p, i) => `<section id="work-${i}" class="e-reflection-story"><header>${sectionName(p, i)}${caseButton(p)}</header><div class="e-reflection-group">${[1, 0, 2].map((j) => photo(pi(p, j))).join('')}</div><div class="e-reflection-pair">${photo(pi(p, 3))}${photo(pi(p, 4))}</div></section>`).join('')}</div>${footer()}</main>`;

  render.cascade = () => `${header('e-header-cascade')}<main id="main"><section id="top" class="e-cascade-hero"><div class="e-cascade-copy"><span class="e-eyebrow">Fashion photography</span><h1>Every image.<br><i>A feeling.</i></h1><a href="#work">Elena Belousova / Selected work ↘</a></div><div class="e-falling-prints">${[5, 24, 8, 13].map((n, i) => `<div class="e-falling e-falling-${i}">${photo(n, '', i === 3)}</div>`).join('')}</div></section><div id="work" class="e-cascade-work">${projects.map((p, i) => `<section id="work-${i}" class="e-cascade-story"><header>${sectionName(p, i)}${caseButton(p)}</header><div class="e-stack-flow">${Array.from({ length: 3 }, (_, j) => `<div class="e-stack-page" style="--page:${j}">${photo(pi(p, j))}<span>${ptitle(p)} — ${String(j + 1).padStart(2, '0')}</span></div>`).join('')}</div></section>`).join('')}</div>${footer()}</main>`;

  render.glyphe = () => `${header('e-header-glyphe')}<main id="main"><section id="top" class="e-glyph-hero"><div class="e-glyph-letters" style="background-image:url('${esc(image(16).src)}')" aria-hidden="true">EB</div><div class="e-glyph-photo">${photo(11, '', true)}</div><h1>Elena<br>Belousova</h1><div class="e-glyph-caption"><span>A photographic<br>point of view.</span><a href="#work">Explore ↓</a></div></section><div id="work" class="e-glyph-work">${projects.map((p, i) => `<section id="work-${i}" class="e-glyph-story"><header>${sectionName(p, i)}${caseButton(p)}</header><div class="e-glyph-spread"><span aria-hidden="true" class="e-glyph-number">${String(i + 1).padStart(2, '0')}</span>${photo(pi(p, 0), 'e-glyph-lead')}${photo(pi(p, 1), 'e-glyph-detail')}</div><div class="e-glyph-rest">${[2, 3, 4].map(j => photo(pi(p, j))).join('')}</div></section>`).join('')}</div>${footer()}</main>`;

  render.croise = () => `${header('e-header-cross')}<main id="main"><section class="e-cross-hero" id="top"><div class="e-cross-canvas">${[1, 18, 6, 27, 3].map((n, i) => photo(n, `e-cross-image e-cross-image-${i}`, i === 0)).join('')}<div class="e-cross-title"><span>Fashion photographer</span><h1>Elena<br><i>Belousova</i></h1><a href="#work">Find your perspective ↘</a></div></div></section><section id="work" class="e-atlas"><div class="e-section-heading"><span>Four perspectives</span><h2>A world of <i>images.</i></h2></div><nav class="e-atlas-nav" aria-label="Collections">${projects.map((p, i) => `<button data-atlas="${i}" aria-pressed="${i === 0}">${ptitle(p)} <span>↗</span></button>`).join('')}</nav><div class="e-atlas-canvas">${projects.map((p, i) => `<section id="work-${i}" class="e-atlas-quadrant ${i === 0 ? 'e-active' : ''}"><header><h3>${ptitle(p)}</h3>${caseButton(p)}</header><div>${Array.from({ length: 6 }, (_, j) => photo(pi(p, j), `e-atlas-photo e-atlas-photo-${j}`)).join('')}</div></section>`).join('')}</div></section>${footer()}</main>`;

  render.duet = () => `${header('e-header-duet')}<main id="main"><section id="top" class="e-duet-hero"><div class="e-duet-stage" data-duet><div class="e-duet-left">${photo(0, '', true)}</div><div class="e-duet-right">${photo(21)}</div><div class="e-duet-seam"><span>↔</span></div><label class="e-duet-range"><span class="sr-only">Balance the two photographs</span><input aria-label="Balance the two photographs" type="range" min="25" max="75" value="50"></label></div><div class="e-duet-title"><h1>Elena<br><i>Belousova</i></h1><p>Two images.<br>One conversation.</p><a href="#work">Selected pairings ↓</a></div></section><div id="work" class="e-duet-work">${projects.map((p, i) => `<section id="work-${i}" class="e-duet-story"><header>${sectionName(p, i)}${caseButton(p)}</header><div class="e-duet-pair ${i % 2 ? 'e-duet-alternate' : ''}">${photo(pi(p, 0))}${photo(pi(p, 1))}</div><div class="e-duet-secondary">${[2, 3, 4, 5].map(j => photo(pi(p, j))).join('')}</div></section>`).join('')}</div>${footer()}</main>`;

  const slug = document.body.dataset.concept;
  document.getElementById('e-site').innerHTML = (render[slug] || render.eventail)();
  const env = A.setup();
  const G = env.gsap;
  const animated = G && !env.reduce;
  const track = tween => { A.track(tween); return tween; };
  const animate = (targets, vars) => animated ? track(G.to(targets, { duration: .7, ease: 'power3.inOut', overwrite: 'auto', ...vars })) : null;
  document.querySelectorAll('[data-open-case]').forEach(button => button.addEventListener('click', () => A.open(button.dataset.openCase.split(','), 0, button)));

  if (slug === 'eventail') {
    let offset = 0;
    const cards = [...document.querySelectorAll('.e-fan-print')];
    document.querySelectorAll('[data-fan-step]').forEach(button => button.addEventListener('click', () => {
      offset += Number(button.dataset.fanStep);
      cards.forEach((card, i) => {
        const slot = ((i + offset) % cards.length + cards.length) % cards.length - 2;
        card.style.zIndex = 5 - Math.abs(slot);
        if (animated) animate(card, { '--slot': slot });
        else card.style.setProperty('--slot', slot);
      });
    }));
    if (animated) track(G.from(cards, { rotation: 0, xPercent: -50, y: 150, duration: 1.15, stagger: .06, ease: 'power4.out', clearProps: 'transform' }));
  }

  if (slug === 'volets') {
    const shutters = [...document.querySelectorAll('.e-shutter')];
    document.querySelectorAll('[data-shutter]').forEach(button => button.addEventListener('click', () => {
      shutters.forEach((shutter, i) => {
        const active = i === Number(button.dataset.shutter);
        shutter.classList.toggle('e-active', active);
        shutter.querySelector('[data-shutter]').setAttribute('aria-expanded', active);
      });
    }));
    if (animated) track(G.from('.e-shutter img', { yPercent: (i) => i % 2 ? -24 : 24, scale: 1.12, duration: 1.2, stagger: .09, ease: 'power3.out' }));
  }

  if (slug === 'croise') {
    const panels = [...document.querySelectorAll('.e-atlas-quadrant')];
    document.querySelectorAll('[data-atlas]').forEach(button => button.addEventListener('click', () => {
      const index = Number(button.dataset.atlas);
      document.querySelectorAll('[data-atlas]').forEach((b, i) => b.setAttribute('aria-pressed', i === index));
      panels.forEach((p, i) => p.classList.toggle('e-active', i === index));
      if (animated) track(G.fromTo(panels[index].querySelectorAll('.photo'), { y: 70, rotation: (i) => i % 2 ? 5 : -5 }, { y: 0, rotation: 0, duration: .75, stagger: .045, clearProps: 'transform', ease: 'power3.out' }));
      A.refresh();
    }));
  }

  if (slug === 'duet') {
    const stage = document.querySelector('[data-duet]');
    stage.querySelector('input').addEventListener('input', event => stage.style.setProperty('--seam', `${event.target.value}%`));
    if (animated) track(G.fromTo(stage, { '--seam': '35%' }, { '--seam': '50%', duration: 1.5, ease: 'power3.inOut' }));
  }

  if (animated) {
    const introductions = {
      contrechamp: () => G.from('.e-counter-column', { yPercent: (i) => i === 1 ? 18 : -18, duration: 1.3, ease: 'power3.out' }),
      oblique: () => G.from('.e-diagonal', { xPercent: 25, rotation: -20, duration: 1.25, ease: 'power4.out' }),
      iris: () => G.from('.e-iris-window', { clipPath: 'circle(14% at 50% 50%)', scale: .82, duration: 1.35, ease: 'power3.inOut' }),
      reflets: () => G.from('.e-mirror', { x: (i) => (2 - i) * 150, scale: .8, duration: 1.2, stagger: { each: .08, from: 'center' }, ease: 'power3.out' }),
      cascade: () => G.from('.e-falling', { y: innerWidth < 900 ? -80 : -500, rotation: (i) => (i % 2 ? 1 : -1) * (innerWidth < 900 ? 12 : 30), duration: innerWidth < 900 ? .7 : 1.25, stagger: innerWidth < 900 ? .06 : .12, ease: 'power4.out', clearProps: 'transform' }),
      glyphe: () => G.from('.e-glyph-photo', { yPercent: 40, rotation: -10, duration: 1.3, ease: 'power3.out', clearProps: 'transform' }),
      croise: () => G.from('.e-cross-image', { x: (i) => [120, -180, 130, -80, 60][i], y: (i) => i % 2 ? -120 : 120, duration: 1.2, stagger: .08, ease: 'power3.out', clearProps: 'transform' })
    };
    if (introductions[slug]) track(introductions[slug]());
    env.mm?.add('(prefers-reduced-motion:no-preference)', () => {
      if (!env.ScrollTrigger) return;
      const distance = innerWidth >= 900 ? 1 : .4;
      const scrub = (target, vars, trigger = target) => track(G.to(target, { ...vars, ease: 'none', scrollTrigger: { trigger, start: 'top bottom', end: 'bottom top', scrub: 1 } }));
      if (slug === 'contrechamp') document.querySelectorAll('.e-triptych').forEach(el => { scrub(el.children[0], { y: -75 * distance }, el); scrub(el.children[2], { y: 75 * distance }, el); });
      if (slug === 'oblique') document.querySelectorAll('.e-zigzag').forEach((el, i) => scrub(el, { rotation: (i % 2 ? 3 : -3) * distance, x: (i % 2 ? -35 : 35) * distance }, el.parentElement));
      if (slug === 'iris') document.querySelectorAll('.e-iris-portal').forEach(el => track(G.fromTo(el, { clipPath: 'circle(39% at 50% 50%)' }, { clipPath: 'circle(74% at 50% 50%)', ease: 'none', scrollTrigger: { trigger: el, start: 'top 85%', end: 'top 15%', scrub: 1 } })));
      if (slug === 'reflets') document.querySelectorAll('.e-reflection-group').forEach(el => { scrub(el.children[0], { x: -30 * distance }, el); scrub(el.children[2], { x: 30 * distance }, el); });
      if (slug === 'cascade') document.querySelectorAll('.e-stack-page').forEach((el, i) => scrub(el.querySelector('.photo'), { rotation: i % 2 ? 3 : -3, scale: .96 }, el));
      if (slug === 'glyphe') document.querySelectorAll('.e-glyph-number').forEach(el => scrub(el, { yPercent: 15 }, el.parentElement));
      if (slug === 'eventail') document.querySelectorAll('.e-fan-story-photos').forEach(el => track(G.from(el.children, { y: 100, rotation: (i) => (i - 2) * (innerWidth < 700 ? 2.5 : 10), duration: 1, stagger: .06, ease: 'power3.out', clearProps: 'transform', scrollTrigger: { trigger: el, start: 'top 85%', once: true } })));
      if (slug === 'volets') document.querySelectorAll('.e-accordion-photos').forEach(el => track(G.from(el.children, { clipPath: 'inset(0 0 100% 0)', duration: 1, stagger: .08, ease: 'power3.inOut', scrollTrigger: { trigger: el, start: 'top 80%', once: true } })));
      if (slug === 'duet') document.querySelectorAll('.e-duet-pair').forEach(el => { scrub(el.children[0], { y: -45 * distance }, el); scrub(el.children[1], { y: 45 * distance }, el); });
    });
  }
})();
