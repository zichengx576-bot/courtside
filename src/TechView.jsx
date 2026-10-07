import {useLocale} from './Locale';
import {useEffect, useRef, useState} from 'react';
import {Move3D, X, Plus, Minus} from 'lucide-react';
import {useSiteMotion} from './MotionPreferences';
import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';
import {componentMesh} from './midsoleGeometry';
import './model-controls.css';

export default function TechView({shoe, explode, focus, reset}) {
  const {t, lang} = useLocale(), en = lang === 'en', reducedMotion = useSiteMotion();
  const host = useRef(null), launch = useRef(null), view = useRef(null), restoreFocus = useRef(false);
  const [failed, setFailed] = useState(false), [exploring, setExploring] = useState(false);
  const state = useRef({explode, focus, reset, exploring, en, reduced: reducedMotion});
  state.current = {explode, focus, reset, exploring, en, reduced: reducedMotion};

  useEffect(() => {
    const el = host.current, resources = [];
    let renderer, frame = 0, visible = true, disposed = false, interacting = false;
    let last = 0, amount = state.current.explode / 100, lastReset = state.current.reset, lastFocus;
    let reduced = state.current.reduced;
    setFailed(false);
    setExploring(false);
    state.current.exploring = false;
    restoreFocus.current = false;
    try {
      renderer = new THREE.WebGLRenderer({alpha: true, antialias: true, powerPreference: 'low-power'});
    } catch {
      setFailed(true);
      return;
    }
    renderer.setPixelRatio(Math.min(devicePixelRatio, 1.75));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = .92;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    const canvas = renderer.domElement;
    el.appendChild(canvas);
    canvas.tabIndex = 0;

    const scene = new THREE.Scene(), camera = new THREE.PerspectiveCamera(34, 1, .1, 50);
    camera.position.set(3.25, 3.3, 5.2);
    const controls = new OrbitControls(camera, canvas);
    controls.enablePan = false;
    controls.enableDamping = !reduced;
    controls.dampingFactor = .12;
    controls.minDistance = 4;
    controls.maxDistance = 10;
    controls.target.set(0, .6, 0);
    controls.saveState();
    // OrbitControls sets touch-action:none at construction. Restore browsing until explicitly enabled.
    controls.enabled = false;
    controls.enableZoom = false;
    canvas.style.touchAction = 'pan-y';
    const pmrem = new THREE.PMREMGenerator(renderer), environment = new RoomEnvironment();
    const env = pmrem.fromScene(environment, .04);
    scene.environment = env.texture;
    scene.environmentIntensity = .6;
    resources.push(env);
    environment.dispose();
    pmrem.dispose();
    scene.add(new THREE.HemisphereLight(0xe4efff, 0x18263b, 1.2));
    const light = new THREE.DirectionalLight(0xffffff, 2.3);
    light.position.set(-2, 6, 5);
    light.castShadow = true;
    light.shadow.mapSize.set(1024, 1024);
    light.shadow.camera.left = -4;
    light.shadow.camera.right = 4;
    light.shadow.camera.top = 4;
    light.shadow.camera.bottom = -4;
    light.shadow.normalBias = .025;
    scene.add(light);
    const rim = new THREE.DirectionalLight(0x77adff, 1.6);
    rim.position.set(3, 2, -4);
    scene.add(rim);
    const floorGeometry = new THREE.PlaneGeometry(8, 8), floorMaterial = new THREE.ShadowMaterial({opacity: .35});
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -.17;
    floor.receiveShadow = true;
    scene.add(floor);
    resources.push(floorGeometry, floorMaterial);
    const root = new THREE.Group();
    root.rotation.y = -.4;
    scene.add(root);
    const parts = shoe.layers.filter(layer => layer.zone !== 'unknown' && layer.type !== 'upper').map((layer, index) => {
      const part = componentMesh(layer, shoe.shape ?? {}, resources);
      root.add(part.group);
      return {...part, index, layer};
    });
    const grid = new THREE.GridHelper(4.2, 18, 0x2d5585, 0x162d4b);
    grid.position.y = -.16;
    grid.material.transparent = true;
    grid.material.opacity = .27;
    scene.add(grid);
    resources.push(grid.geometry, grid.material);

    const cancel = () => {cancelAnimationFrame(frame); frame = 0; last = 0;};
    const invalidate = () => {
      if (!disposed && visible && !document.hidden && !frame) frame = requestAnimationFrame(draw);
    };
    const applyMode = () => {
      const active = state.current.exploring;
      controls.enabled = active;
      controls.enableZoom = active;
      canvas.style.touchAction = active ? 'none' : 'pan-y';
      canvas.style.cursor = active ? 'grab' : 'default';
      canvas.setAttribute('aria-label', shoe.short + (state.current.en
        ? ' midsole reconstruction. Press Enter to explore, arrow keys to rotate, Escape to exit. Not a measured model.'
        : ' 中底配置三维重建。按 Enter 探索，方向键旋转，Escape 退出；非尺寸测量模型。'));
    };
    const exit = (returnFocus = false) => {
      state.current.exploring = false;
      interacting = false;
      controls.enableDamping = false;
      controls.update();
      controls.enableDamping = !reduced;
      applyMode();
      restoreFocus.current = returnFocus;
      setExploring(false);
      invalidate();
    };
    const key = event => {
      if (event.key === 'Enter' && !state.current.exploring) {
        event.preventDefault();
        state.current.exploring = true;
        applyMode();
        setExploring(true);
      } else if (state.current.exploring && event.key.startsWith('Arrow')) {
        event.preventDefault();
        root.rotation.y += event.key === 'ArrowLeft' ? -.15 : event.key === 'ArrowRight' ? .15 : 0;
        root.rotation.x = THREE.MathUtils.clamp(root.rotation.x + (event.key === 'ArrowUp' ? -.1 : event.key === 'ArrowDown' ? .1 : 0), -.7, .7);
        invalidate();
      }
    };
    const escape = event => {
      if (event.key === 'Escape' && state.current.exploring) {
        event.preventDefault();
        exit(true);
      }
    };
    const start = () => {interacting = true; invalidate();};
    const end = () => {interacting = false; invalidate();};
    controls.addEventListener('change', invalidate);
    controls.addEventListener('start', start);
    controls.addEventListener('end', end);
    canvas.addEventListener('keydown', key);
    window.addEventListener('keydown', escape);
    const api = {
      update() {
        if (reduced !== state.current.reduced) {
          reduced = state.current.reduced;
          controls.enableDamping = !reduced;
          controls.update();
        }
        applyMode();
        invalidate();
      },
      activate() {
        state.current.exploring = true;
        applyMode();
        setExploring(true);
        canvas.focus({preventScroll: true});
        invalidate();
      },
      exit() {exit(true);},
      zoom(factor) {
        if (!state.current.exploring) return;
        const offset = camera.position.clone().sub(controls.target);
        const distance = THREE.MathUtils.clamp(offset.length() * factor, controls.minDistance, controls.maxDistance);
        camera.position.copy(controls.target).add(offset.setLength(distance));
        controls.update();
        invalidate();
      }
    };
    view.current = api;
    const resize = () => {
      const w = el.clientWidth, h = el.clientHeight;
      if (!w || !h) return;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.zoom = Math.min(1.08, camera.aspect / .96);
      camera.updateProjectionMatrix();
      invalidate();
    };
    const sizeObserver = new ResizeObserver(resize);
    sizeObserver.observe(el);
    const viewObserver = new IntersectionObserver(entries => {
      visible = entries[0].isIntersecting;
      if (visible) invalidate();
      else {exit(); cancel();}
    });
    viewObserver.observe(el);
    const visibility = () => {
      if (document.hidden) {exit(); cancel();}
      else invalidate();
    };
    document.addEventListener('visibilitychange', visibility);

    function draw(time) {
      frame = 0;
      if (disposed || !visible || document.hidden) return;
      if (last && time - last < 32) {invalidate(); return;}
      const delta = last ? Math.min(time - last, 64) : 32;
      last = time;
      const current = state.current, target = current.explode / 100;
      amount = reduced || Math.abs(target - amount) < .0005 ? target : THREE.MathUtils.lerp(amount, target, 1 - Math.exp(-delta / 150));
      if (lastReset !== current.reset) {
        controls.reset();
        root.rotation.set(0, -.4, 0);
        lastReset = current.reset;
      }
      const focusChanged = lastFocus !== current.focus;
      parts.forEach(({group, materials, index, layer}) => {
        const base = layer.level ?? (parts.length - 1 - index) * .14;
        const spread = (layer.explodeRank ?? parts.length - 1 - index) * .33;
        group.position.y = base + spread * amount;
        if (!focusChanged) return;
        const on = current.focus === layer.id, dim = current.focus && !on;
        materials.forEach(material => {
          material.transparent = Boolean(dim) || layer.type === 'air';
          material.opacity = dim ? .18 : layer.type === 'air' ? .72 : 1;
          if (material.emissive) {
            material.emissive.set(on ? layer.color : 0x000000);
            material.emissiveIntensity = on ? .3 : 0;
          }
        });
      });
      lastFocus = current.focus;
      const cameraChanged = controls.update();
      renderer.render(scene, camera);
      // No persistent render loop: only animate a changed model, a gesture or unsettled damping.
      if (Math.abs(target - amount) > .0005 || interacting || cameraChanged) invalidate();
    }
    applyMode();
    resize();
    invalidate();
    return () => {
      disposed = true;
      cancel();
      if (view.current === api) view.current = null;
      sizeObserver.disconnect();
      viewObserver.disconnect();
      document.removeEventListener('visibilitychange', visibility);
      window.removeEventListener('keydown', escape);
      canvas.removeEventListener('keydown', key);
      controls.removeEventListener('change', invalidate);
      controls.removeEventListener('start', start);
      controls.removeEventListener('end', end);
      controls.dispose();
      for (const resource of new Set(resources)) resource.dispose();
      light.shadow.dispose();
      scene.clear();
      renderer.dispose();
      renderer.forceContextLoss();
      canvas.remove();
    };
  }, [shoe.id]);

  useEffect(() => {
    view.current?.update();
    if (!exploring && restoreFocus.current) {
      restoreFocus.current = false;
      launch.current?.focus({preventScroll: true});
    }
  }, [explode, focus, reset, exploring, lang, reducedMotion]);
  return <div className={'tech-scene' + (exploring ? ' model-exploring' : '')}>
    <div className="tech-model-stage" ref={host}/>
    {!failed && <><div className="model-controls" aria-label={en ? '3D model controls' : '三维模型操作'}>
      {exploring ? <><button className="model-zoom" aria-label={en ? 'Zoom in' : '放大模型'} onClick={() => view.current?.zoom(.88)}><Plus size={16}/></button><button className="model-zoom" aria-label={en ? 'Zoom out' : '缩小模型'} onClick={() => view.current?.zoom(1.14)}><Minus size={16}/></button><button className="model-mode" aria-label={en ? 'Exit model exploration' : '退出模型探索'} onClick={() => view.current?.exit()}><X size={15}/>{en ? 'Exit' : '退出'}</button></>
        : <button className="model-mode" ref={launch} onClick={() => view.current?.activate()}><Move3D size={15}/>{en ? 'Explore model' : '探索模型'}</button>}
    </div><p className="model-mode-status" role="status">{exploring
      ? (en ? 'Drag to rotate · zoom with + / − · Esc to exit' : '拖动旋转 · ＋ / − 缩放 · Esc 退出')
      : (en ? 'Scroll freely · activate to rotate the model' : '自由下滑浏览 · 点击探索后旋转模型')}</p></>}
    {failed && <div className="webgl-fallback"><img src={shoe.photos[shoe.coverIndex || 0]} alt={shoe.name}/><p>{t('当前设备无法显示 3D，可查看分布说明与官方配置图。')}</p></div>}
  </div>;
}
