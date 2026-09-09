/* VELOCITY: three photographic passages, rendered only as the scene changes. */
(() => {
  'use strict';
  const A = window.Atelier;
  const data = window.MOCKUP_DATA?.proconcept;
  if (!A || !data) return;
  const env = A.setup();
  const g = env.gsap;
  const story = document.querySelector('.nv-story');
  const stage = document.querySelector('.nv-stage');
  const host = document.querySelector('.nv-scene');
  const entryButton = document.querySelector('.nv-enter');
  const wordmark = document.querySelector('.nv-intro h1');
  const velocityWord = document.querySelector('.nv-velocity');
  const buttons = [...document.querySelectorAll('[data-act-button]')];
  const acts = [
    { project: data.projects[0], image: A.get('516d35_232c102cf44d42f08b574382369c8b0f~mv2.jpg'), name: 'The entrance', target: 0 },
    { project: data.projects[1], image: A.get('516d35_d77ab9ce6c0041f4984ef42c642a4918~mv2.jpg'), name: 'Another perspective', target: .40 },
    { project: data.projects[5], image: A.get('516d35_024d9d6208924e4bbdd2a6ccdad4a48b~mv2.jpg'), name: 'The arrival', target: .94 },
  ];
  const state = { progress: 0, speed: 0 };
  let selected = 0;
  let kit = null;
  let live = false;
  let sceneTween = null;
  document.body.classList.add('nv-js');
  function select(index) {
    selected = index;
    stage.dataset.act = String(index);
    document.querySelector('.nv-current-title').textContent = acts[index].project.title;
    document.querySelector('.nv-act-name').textContent = `${acts[index].name} / 0${index + 1}`;
    buttons.forEach((b, i) => b.setAttribute('aria-pressed', String(i === index)));
    document.querySelectorAll('[data-static-act]').forEach((el, i) => { el.hidden = i !== index; });
  }
  function staticGallery() {
    live = false;
    document.body.classList.remove('nv-live', 'nv-gpu');
    wordmark.style.transform = '';
    wordmark.style.opacity = '';
    velocityWord.style.transform = '';
    stage.style.backgroundColor = '';
    stage.dataset.act = '0';
    select(selected);
    A.refresh();
  }
  entryButton.addEventListener('click', () => {
    const act = acts[selected];
    A.open(act.project.images, Math.max(0, act.project.images.indexOf(act.image.id)), entryButton);
  });
  buttons.forEach((button, index) => button.addEventListener('click', () => {
    if (!live) { select(index); return; }
    const distance = Math.max(0, story.offsetHeight - stage.offsetHeight);
    const top = story.getBoundingClientRect().top + scrollY + acts[index].target * distance;
    if (env.lenis) env.lenis.scrollTo(top, { duration: 1.2 });
    else window.scrollTo({ top, behavior: env.reduce ? 'auto' : 'smooth' });
  }));

  if (!g || !env.ScrollTrigger || env.reduce) { staticGallery(); return; }
  start().catch(error => { if (kit?.alive) kit.fail(error); else { console.warn('Velocity: keeping the photographic gallery.', error); staticGallery(); } });

  async function start() {
    const { createLabScene } = await import('./lab-runtime.js');
    kit = await createLabScene({ host, env, background: 0x0b0b0b, onFallback: staticGallery });
    if (!kit?.alive) return;
    const { T, scene, camera, renderer } = kit;
    camera.fov = 36;
    camera.near = .12;
    camera.far = 130;
    camera.updateProjectionMatrix();

    // Solid, bevelled portals widen into the passage. Their depth stays real
    // while their opening proportions adapt to the available photographic stage.
    function frameGeometry(act) {
      const points = [], colors = [];
      const face = new T.Color(0x45494f).toArray();
      const bevel = new T.Color(0xcbd0d7).toArray();
      const wall = new T.Color(0x171a20).toArray();
      function quad(a, b, c, d, color) {
        points.push(...a, ...b, ...c, ...a, ...c, ...d);
        // A broad reflected light travels across each chrome facet without bloom.
        for (const point of [a, b, c, a, c, d]) {
          const reflection = .55 + .65 * Math.pow(.5 + .5 * Math.sin(point[0] * .27 + point[1] * .21 + point[2] * .07), 3);
          colors.push(...color.map(channel => channel * reflection));
        }
      }
      function contour(w, h, z, cx, angle, chamfer) {
        const x = w / 2, y = h / 2, c = Math.min(w, h) * chamfer;
        const ca = Math.cos(angle), sa = Math.sin(angle);
        return [[-x+c,y],[x-c,y],[x,y-c],[x,-y+c],[x-c,-y],[-x+c,-y],[-x,-y+c],[-x,y-c]]
          .map(([px,py]) => [cx + px*ca-py*sa, px*sa+py*ca, z]);
      }
      const stop = act === 0 ? 12 : act === 1 ? -16 : -46.8;
      const distances = act === 2 ? [6,10,14,18,20] : act === 0 ? [6,10,14,17,20] : [6,10,14,18,21];
      const heights = [1.24,1.10,.98,.87,.78];
      const widths = [1.48,1.28,1.12,1.00,.88];
      distances.forEach((distance, i) => {
        const viewH = 2 * Math.tan(36*Math.PI/360) * distance;
        const arrivalSpace = act === 2 ? 1.5 : 1;
        const h = viewH * heights[i] * arrivalSpace, w = viewH * .66 * widths[i] * arrivalSpace;
        const rim = Math.min(w,h)*.045;
        const z = stop-distance, cx = act === 1 ? 1.6 : 0;
        const angle = act === 1 ? (i-2)*.026 : 0;
        const outer = contour(w,h,z,cx,angle,.12);
        const lip = contour(w-rim*.7,h-rim*.7,z+.10,cx,angle,.12);
        const inner = contour(w-rim*2,h-rim*2,z+.10,cx,angle,.12);
        const rear = contour(w-rim*2,h-rim*2,z-.85,cx,angle,.12);
        const back = contour(w,h,z-.85,cx,angle,.12);
        for (let j=0;j<8;j++) {
          const k=(j+1)%8;
          quad(outer[j],outer[k],lip[k],lip[j],bevel);
          quad(lip[j],lip[k],inner[k],inner[j],face);
          quad(inner[j],inner[k],rear[k],rear[j],wall);
          quad(outer[k],outer[j],back[j],back[k],wall);
          quad(back[k],back[j],rear[j],rear[k],face);
        }
      });
      const geometry = kit.track(new T.BufferGeometry());
      geometry.setAttribute('position', new T.Float32BufferAttribute(points, 3));
      geometry.setAttribute('color', new T.Float32BufferAttribute(colors, 3));
      geometry.computeBoundingSphere();
      return geometry;
    }
    const structures = [0, 1, 2].map(index => {
      const material = kit.track(new T.MeshBasicMaterial({ vertexColors: true, side: T.DoubleSide, toneMapped: false }));
      const mesh = new T.Mesh(frameGeometry(index), material);
      scene.add(mesh);
      return mesh;
    });

    // Light rails follow the photographic corridor; their length responds to scroll speed.
    const railVertices = [];
    for (let i = 0; i < 24; i++) {
      const side = i % 4;
      const x = side < 2 ? (side ? -4.6 : 4.6) : (i % 3 - 1) * 2.8;
      const y = side < 2 ? ((i % 6) - 2.5) * 1.4 : (side === 2 ? 6.7 : -6.7);
      const z = -(i % 8) * 9;
      railVertices.push(x, y, z, x, y, z - 2);
    }
    const railGeometry = kit.track(new T.BufferGeometry());
    const railPositions = new T.Float32BufferAttribute(railVertices, 3);
    railPositions.setUsage(T.DynamicDrawUsage);
    railGeometry.setAttribute('position', railPositions);
    const railMaterial = kit.track(new T.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: .18, depthWrite: false, toneMapped: false }));
    const rails = new T.LineSegments(railGeometry, railMaterial);
    rails.frustumCulled = false;
    scene.add(rails);

    const photos = [];
    const photoGeometry = kit.track(new T.PlaneGeometry(1, 1));
    const textures = await Promise.all(acts.map(act => kit.loadTexture(act.image.src)));
    if (!kit.alive) return;
    const positions = [{ x: 0, z: -9, height: 8.9 }, { x: 1.6, z: -38, height: 9.25 }, { x: 0, z: -68, height: 17.5 }];
    textures.forEach((texture, index) => {
      const material = kit.track(new T.MeshBasicMaterial({ map: texture, transparent: true, depthWrite: false, toneMapped: false }));
      const mesh = new T.Mesh(photoGeometry, material);
      const item = positions[index];
      mesh.position.set(item.x, 0, item.z);
      mesh.scale.set(item.height * acts[index].image.width / acts[index].image.height, item.height, 1);
      scene.add(mesh);
      photos.push(mesh);
    });
    const background = new T.Color(0x0b0b0b);
    const light = new T.Color(0xe9e9e5);
    const dark = new T.Color(0x0b0b0b);
    const lookAt = new T.Vector3();
    const smooth = (a, b, n) => T.MathUtils.smoothstep(n, a, b);
    let lastAct = -1;
    function compose({ delta = 0, size = kit.size } = {}) {
      const p = state.progress;
      state.speed *= Math.exp(-Math.max(0, delta) * 8);
      const act = p < .32 ? 0 : p < .70 ? 1 : 2;
      if (act !== lastAct) { lastAct = act; select(act); }
      const turn = Math.sin(smooth(.20, .73, p) * Math.PI);
      camera.position.set(turn * 1.6, Math.sin(p * Math.PI * 2) * .12, 12 - p * 70);
      lookAt.set(turn * 1.8, 0, camera.position.z - 20);
      camera.lookAt(lookAt);
      camera.rotateZ(Math.sin(smooth(.10, .34, p) * Math.PI) * .045 - Math.sin(smooth(.48, .72, p) * Math.PI) * .035);
      const pale = smooth(.66, .79, p);
      background.copy(dark).lerp(light, pale);
      renderer.setClearColor(background, 1);
      stage.style.backgroundColor = `#${background.getHexString()}`;
      structures.forEach((mesh, i) => {
        // Keep solid silver edges against both black space and white clothing.
        mesh.material.color.setScalar(1 - pale * .60);
        mesh.scale.x = camera.aspect / .66;
        mesh.position.x = i === 1 ? 1.6 * (1 - mesh.scale.x) : 0;
      });
      photos.forEach((mesh, i) => {
        const distance = camera.position.z - mesh.position.z;
        mesh.material.opacity = smooth(1.8, 6.5, distance);
        mesh.visible = distance > 1.7;
        if (i === 2) {
          // The arrival holds the entire final photograph inside the near portal.
          const viewH = 2 * Math.tan(camera.fov * Math.PI / 360) * Math.max(1, distance);
          const ratio = acts[i].image.width / acts[i].image.height;
          const contained = Math.min(viewH * .86, viewH * camera.aspect * .84 / ratio);
          const h = T.MathUtils.lerp(positions[i].height, contained, smooth(.70, .88, p));
          mesh.scale.set(h * ratio, h, 1);
        }
      });
      railMaterial.color.copy(light).lerp(dark, pale);
      railMaterial.opacity = .12 + state.speed * .46;
      for (let i = 0; i < 24; i++) {
        const start = railVertices[i * 6 + 2];
        railPositions.setZ(i * 2 + 1, start - 2 - state.speed * 12);
      }
      railPositions.needsUpdate = true;
      const mobile = size.width < 700;
      wordmark.style.transform = `translateY(${-smooth(0, .30, p) * (mobile ? 50 : 95)}px) scale(${1 - smooth(0, .3, p) * .24})`;
      wordmark.style.opacity = String(1 - smooth(.11, .30, p));
      velocityWord.style.transform = `translateX(${Math.sin(p * Math.PI) * (mobile ? -10 : 30)}%) scaleX(${1 + state.speed * .035})`;
    }
    kit.onFrame(compose);
    kit.onResize(() => { kit.invalidate(); });
    if (!kit.ready()) return;
    live = true;
    document.body.classList.add('nv-live', 'nv-gpu');
    sceneTween = kit.track(g.to(state, {
      progress: 1, ease: 'none',
      onUpdate: () => kit.invalidate(),
      scrollTrigger: {
        trigger: story, start: 'top top', end: 'bottom bottom', scrub: .55, invalidateOnRefresh: true,
        onUpdate: self => { state.speed = Math.max(state.speed, Math.min(1, Math.abs(self.getVelocity()) / 2600)); kit.wake(500); },
      },
    }));
    A.track(sceneTween);
    kit.addCleanup(() => { live = false; });
    A.refresh();
  }
})();
