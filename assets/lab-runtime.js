/* Shared lifecycle for the four photographic experiments. One GSAP clock. */
export async function createLabScene({ host, env, background = 0x080808, onFallback = () => {} }) {
  const g = env?.gsap;
  const unavailable = reason => {
    host.classList.remove('is-live');
    host.dataset.sceneReady = 'false';
    onFallback(reason);
  };
  if (!g || !env?.ScrollTrigger || env?.reduce) { unavailable(null); return null; }

  let T, renderer;
  try {
    T = await import('./vendor/three/three.module.js');
    if (!host.isConnected) return null;
    renderer = new T.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'default' });
  } catch (error) { console.warn('Photographic scene unavailable.', error); unavailable(error); return null; }

  const scene = new T.Scene();
  const defaultCamera = new T.PerspectiveCamera(40, 1, .1, 180);
  defaultCamera.position.z = 10;
  const resources = new Set();
  const cleanup = [];
  const frameCallbacks = new Set();
  const resizeCallbacks = new Set();
  let alive = true, ready = false, rendering = false, shaderError = false;
  let visible = true, modal = false, ticking = false, continuous = false;
  let dirty = true, wakeUntil = 0, previousTime = 0;
  let size = { width: 1, height: 1, dpr: 1 };
  const canvas = renderer.domElement;
  canvas.setAttribute('aria-hidden', 'true');
  canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;display:block;pointer-events:none;opacity:0;transition:opacity .35s';
  renderer.outputColorSpace = T.SRGBColorSpace;
  renderer.setClearColor(background, 1);
  host.append(canvas);

  const allowed = () => alive && ready && visible && !modal && !document.hidden;
  function stop() { if (ticking) g.ticker.remove(tick); ticking = false; previousTime = 0; }
  function request() {
    if (allowed() && !ticking) { ticking = true; g.ticker.add(tick); }
  }
  function draw(time = performance.now() / 1000) {
    if (!alive || rendering) return;
    rendering = true;
    try {
      const delta = previousTime ? Math.min(time - previousTime, .05) : 0;
      previousTime = time;
      frameCallbacks.forEach(fn => fn({ time, delta, size }));
      renderer.render(scene, kit.camera);
    } catch (error) { kit.fail(error); }
    finally { rendering = false; }
  }
  function tick(time) {
    if (!allowed()) { stop(); return; }
    const awake = performance.now() < wakeUntil;
    if (dirty || continuous || awake) {
      dirty = false;
      draw(time);
    }
    if (!dirty && !continuous && !awake) stop();
  }
  function measure() {
    if (!alive) return;
    const width = Math.max(1, host.clientWidth), height = Math.max(1, host.clientHeight);
    const dpr = Math.min(devicePixelRatio || 1, width < 700 ? 1.5 : 2, Math.sqrt(2_000_000 / (width * height)));
    size = { width, height, dpr };
    renderer.setPixelRatio(dpr);
    renderer.setSize(width, height, false);
    defaultCamera.aspect = width / height;
    defaultCamera.updateProjectionMatrix();
    try { resizeCallbacks.forEach(fn => fn(size)); }
    catch (error) { kit.fail(error); return; }
    dirty = true; request();
  }
  function listen(target, name, fn, options) {
    target.addEventListener(name, fn, options);
    cleanup.push(() => target.removeEventListener(name, fn, options));
  }
  function destroy() {
    if (!alive) return;
    alive = false; ready = false; stop();
    cleanup.forEach(fn => { try { fn(); } catch (error) { console.warn('Scene cleanup could not finish.', error); } });
    resources.forEach(resource => {
      if (resource?.kill) { resource.scrollTrigger?.kill(); resource.kill(); }
      else resource?.dispose?.();
    });
    resources.clear(); frameCallbacks.clear(); resizeCallbacks.clear();
    renderer.dispose(); canvas.remove();
  }
  const kit = {
    T, scene, renderer, camera: defaultCamera,
    get size() { return size; },
    get alive() { return alive; },
    track(resource) { resources.add(resource); return resource; },
    addCleanup(fn) { cleanup.push(fn); return fn; },
    async loadTexture(url) {
      const texture = await new T.TextureLoader().loadAsync(url);
      if (!alive) { texture.dispose(); throw new Error('Scene closed before photograph finished loading.'); }
      texture.colorSpace = T.SRGBColorSpace;
      texture.anisotropy = Math.min(4, renderer.capabilities.getMaxAnisotropy());
      resources.add(texture);
      return texture;
    },
    onResize(fn) { resizeCallbacks.add(fn); fn(size); return () => resizeCallbacks.delete(fn); },
    onFrame(fn) { frameCallbacks.add(fn); return () => frameCallbacks.delete(fn); },
    invalidate() { dirty = true; request(); },
    wake(milliseconds = 1200) { wakeUntil = Math.max(wakeUntil, performance.now() + milliseconds); dirty = true; request(); },
    continuous(value) { continuous = Boolean(value); if (continuous) request(); },
    ready() {
      if (!alive) return false;
      draw();
      if (shaderError || !alive) return false;
      ready = true;
      host.dataset.sceneReady = 'true';
      host.classList.add('is-live');
      canvas.style.opacity = '1';
      dirty = true; request();
      return true;
    },
    fail(error) {
      if (!alive) return;
      if (error) console.warn('Using the photographic gallery.', error);
      destroy(); unavailable(error);
    },
    destroy,
  };
  renderer.debug.onShaderError = (gl, program, vertexShader, fragmentShader) => {
    shaderError = true;
    console.error('Photographic shader compilation:', gl.getShaderInfoLog(vertexShader), gl.getShaderInfoLog(fragmentShader), gl.getProgramInfoLog(program));
    queueMicrotask(() => kit.fail(new Error('The graphics program could not be compiled.')));
  };
  const resizeObserver = new ResizeObserver(measure);
  resizeObserver.observe(host);
  cleanup.push(() => resizeObserver.disconnect());
  const intersectionObserver = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (visible) { dirty = true; request(); } else stop();
  }, { rootMargin: '80px' });
  intersectionObserver.observe(host);
  cleanup.push(() => intersectionObserver.disconnect());
  listen(document, 'visibilitychange', () => { if (document.hidden) stop(); else { dirty = true; request(); } });
  listen(document, 'concept:modal-open', () => { modal = true; stop(); });
  listen(document, 'concept:modal-close', () => { modal = false; dirty = true; request(); });
  listen(window, 'pagehide', event => { if (!event.persisted) destroy(); else stop(); });
  listen(window, 'pageshow', () => { dirty = true; request(); });
  listen(canvas, 'webglcontextlost', event => { event.preventDefault(); kit.fail(new Error('Graphics context interrupted.')); });
  measure();
  return kit;
}
