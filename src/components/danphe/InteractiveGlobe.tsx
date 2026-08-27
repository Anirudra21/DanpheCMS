'use client';

import { useRef, useEffect, useState, useMemo, useCallback } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { MapPin, Globe as GlobeIcon, X, Building2 } from 'lucide-react';
import * as THREE from 'three';

/* ═══════════════════════════════════════════════════════════════════════════════
   Types
   ═══════════════════════════════════════════════════════════════════════════════ */

export interface GlobeCountryData {
  id: string;
  countryName: string;
  latitude: number;
  longitude: number;
  hospitalCount: number;
  displayLabel: string;
  isHighlighted: boolean;
  isActive: boolean;
  order: number;
}

interface InteractiveGlobeProps {
  countries: GlobeCountryData[];
  heading: string;
  subheading: string;
}

/* ═══════════════════════════════════════════════════════════════════════════════
   Constants
   ═══════════════════════════════════════════════════════════════════════════════ */

const EARTH_RADIUS = 1;
const DEFAULT_CAM_Z = 2.8;
const MIN_CAM_Z = 1.6;
const MAX_CAM_Z = 5.0;
const ZOOM_COUNTRY_Z = 1.8;
const AUTO_SPEED = 0.0008;
const DRAG_SENS = 0.004;
const ZOOM_SENS = 0.0006;
const IDLE_MS = 4000;
const MOMENTUM_FRICTION = 0.92;

/* ═══════════════════════════════════════════════════════════════════════════════
   Utility: lat/lng → 3D position on sphere
   ═══════════════════════════════════════════════════════════════════════════════ */

function latLngToVec3(lat: number, lng: number, radius: number): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta),
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
   Glow sprite texture
   ═══════════════════════════════════════════════════════════════════════════════ */

function createGlowTexture(r: number, g: number, b: number, alpha = 0.9): THREE.CanvasTexture {
  const s = 128;
  const c = document.createElement('canvas');
  c.width = s; c.height = s;
  const ctx = c.getContext('2d')!;
  const grad = ctx.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
  grad.addColorStop(0, `rgba(${r},${g},${b},${alpha})`);
  grad.addColorStop(0.25, `rgba(${r},${g},${b},0.35)`);
  grad.addColorStop(0.6, `rgba(${r},${g},${b},0.08)`);
  grad.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, s, s);
  return new THREE.CanvasTexture(c);
}

/* ═══════════════════════════════════════════════════════════════════════════════
   Atmosphere shaders
   ═══════════════════════════════════════════════════════════════════════════════ */

const ATMO_VS = `
  varying vec3 vWorldNormal;
  varying vec3 vViewPos;
  void main() {
    vec4 wp = modelMatrix * vec4(position, 1.0);
    vViewPos = (viewMatrix * wp).xyz;
    vWorldNormal = normalize(mat3(modelMatrix) * normal);
    gl_Position = projectionMatrix * viewMatrix * wp;
  }
`;

const ATMO_FS = `
  varying vec3 vWorldNormal;
  varying vec3 vViewPos;
  void main() {
    vec3 viewDir = normalize(-vViewPos);
    float rim = 1.0 - max(0.0, dot(viewDir, vWorldNormal));
    float glow = pow(rim, 3.0) * 1.6;
    gl_FragColor = vec4(0.04, 0.52, 0.48, glow * 0.4);
  }
`;

/* ═══════════════════════════════════════════════════════════════════════════════
   Component
   ═══════════════════════════════════════════════════════════════════════════════ */

export default function InteractiveGlobe({ countries, heading, subheading }: InteractiveGlobeProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-60px' });

  // Three.js refs
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const earthGroupRef = useRef<THREE.Group | null>(null);
  const markersGroupRef = useRef<THREE.Group | null>(null);
  const animRef = useRef(0);
  const clockRef = useRef(new THREE.Timer());
  const nepalRingRef = useRef<THREE.Mesh | null>(null);
  const cleanupFnRef = useRef<(() => void) | null>(null);

  // Interaction refs
  const isDragRef = useRef(false);
  const autoRotRef = useRef(true);
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevPtrRef = useRef({ x: 0, y: 0 });
  const momentumRef = useRef({ x: 0, y: 0 });
  const targetZoomRef = useRef(DEFAULT_CAM_Z);
  const zoomingToRef = useRef<string | null>(null);
  const targetRotYRef = useRef<number | null>(null);
  const targetRotXRef = useRef<number | null>(null);
  const isVisibleRef = useRef(true);

  // Raycasting
  const raycasterRef = useRef(new THREE.Raycaster());
  const markerMapRef = useRef<Map<number, GlobeCountryData>>(new Map());

  // React state
  const [tooltip, setTooltip] = useState<{ country: GlobeCountryData; x: number; y: number } | null>(null);
  const [containerW, setContainerW] = useState(400);
  const [zoomedCountry, setZoomedCountry] = useState<GlobeCountryData | null>(null);
  const [globeReady, setGlobeReady] = useState(false);

  // Computed data
  const activeCountries = useMemo(() => countries.filter((c) => c.isActive), [countries]);
  const totalHospitals = useMemo(() => activeCountries.reduce((s, c) => s + c.hospitalCount, 0), [activeCountries]);
  const nepalData = useMemo(() => countries.find((c) => c.isHighlighted) || null, [countries]);

  // ─── Three.js scene setup — runs once on mount ──────────────────
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // WebGL support check
    let hasWebGL = false;
    try {
      const c = document.createElement('canvas');
      hasWebGL = !!(c.getContext('webgl2') || c.getContext('webgl'));
    } catch { /* no webgl */ }
    if (!hasWebGL) return;

    // Defer to next frame so layout has settled
    let rafId = 0;
    let destroyed = false;

    const tryInit = () => {
      if (destroyed) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      if (w < 10 || h < 10) { rafId = requestAnimationFrame(tryInit); return; }
      init(w, h);
    };
    rafId = requestAnimationFrame(tryInit);

    function init(w: number, h: number) {
      if (destroyed) return;
      setContainerW(w);

      const scene = new THREE.Scene();
      sceneRef.current = scene;

      const camera = new THREE.PerspectiveCamera(38, w / h, 0.1, 100);
      camera.position.set(0, 0.15, DEFAULT_CAM_Z);
      cameraRef.current = camera;

      const renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance',
      });
      renderer.setSize(w, h);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setClearColor(0x000000, 0);
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.1;
      container.appendChild(renderer.domElement);
      rendererRef.current = renderer;

      // Lights
      scene.add(new THREE.AmbientLight(0xffffff, 0.5));
      const sun = new THREE.DirectionalLight(0xfff5e6, 1.2);
      sun.position.set(5, 3, 5);
      scene.add(sun);
      const fill = new THREE.DirectionalLight(0x8ecae6, 0.35);
      fill.position.set(-4, -1, -3);
      scene.add(fill);
      const rimLight = new THREE.DirectionalLight(0x0d9488, 0.15);
      rimLight.position.set(-3, 2, -5);
      scene.add(rimLight);

      // Earth group
      const earthGroup = new THREE.Group();
      earthGroup.rotation.x = 0.25;
      earthGroup.rotation.y = -0.5;
      scene.add(earthGroup);
      earthGroupRef.current = earthGroup;

      // ── IMMEDIATE visible Earth sphere (placeholder until textures load) ──
      const earthGeom = new THREE.SphereGeometry(EARTH_RADIUS, 96, 64);
      const placeholderMat = new THREE.MeshPhongMaterial({
        color: 0x1a5276,
        emissive: 0x0a2a3d,
        shininess: 15,
      });
      const earthMesh = new THREE.Mesh(earthGeom, placeholderMat);
      earthGroup.add(earthMesh);

      // Atmosphere (back-face glow)
      const atmosGeom = new THREE.SphereGeometry(EARTH_RADIUS * 1.025, 64, 48);
      const atmosMat = new THREE.ShaderMaterial({
        vertexShader: ATMO_VS,
        fragmentShader: ATMO_FS,
        transparent: true,
        side: THREE.BackSide,
        depthWrite: false,
      });
      scene.add(new THREE.Mesh(atmosGeom, atmosMat));

      // Inner glow
      const innerGlowGeom = new THREE.SphereGeometry(EARTH_RADIUS * 1.005, 64, 48);
      const innerGlowMat = new THREE.ShaderMaterial({
        vertexShader: ATMO_VS,
        fragmentShader: `
          varying vec3 vWorldNormal;
          varying vec3 vViewPos;
          void main() {
            vec3 viewDir = normalize(-vViewPos);
            float rim = 1.0 - max(0.0, dot(viewDir, vWorldNormal));
            float glow = pow(rim, 5.0) * 0.6;
            gl_FragColor = vec4(0.05, 0.58, 0.53, glow * 0.25);
          }
        `,
        transparent: true,
        side: THREE.FrontSide,
        depthWrite: false,
      });
      scene.add(new THREE.Mesh(innerGlowGeom, innerGlowMat));

      // Markers group
      const markersGroup = new THREE.Group();
      earthGroup.add(markersGroup);
      markersGroupRef.current = markersGroup;

      // Stars
      const starsGeom = new THREE.BufferGeometry();
      const starPos = new Float32Array(200 * 3);
      for (let i = 0; i < 200; i++) {
        const t = Math.random() * Math.PI * 2;
        const p = Math.acos(2 * Math.random() - 1);
        const r = 8 + Math.random() * 6;
        starPos[i * 3] = r * Math.sin(p) * Math.cos(t);
        starPos[i * 3 + 1] = r * Math.sin(p) * Math.sin(t);
        starPos[i * 3 + 2] = r * Math.cos(p);
      }
      starsGeom.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
      const starsMat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.03, transparent: true, opacity: 0.3 });
      scene.add(new THREE.Points(starsGeom, starsMat));

      // ── Load textures and upgrade material ──
      const loader = new THREE.TextureLoader();

      const upgradeEarth = (colorMap: THREE.Texture, bumpMap: THREE.Texture | null) => {
        if (destroyed) return;
        colorMap.colorSpace = THREE.SRGBColorSpace;
        colorMap.anisotropy = renderer.capabilities.getMaxAnisotropy();
        if (bumpMap) bumpMap.anisotropy = renderer.capabilities.getMaxAnisotropy();
        const realMat = new THREE.MeshStandardMaterial({
          map: colorMap,
          bumpMap: bumpMap || undefined,
          bumpScale: 0.015,
          roughness: 0.75,
          metalness: 0.05,
        });
        earthMesh.material = realMat;
        placeholderMat.dispose();
        setGlobeReady(true);
      };

      // Try HD texture, fall back to SD, then keep placeholder
      loader.load(
        '/textures/earth-day-hd.jpg',
        (tex) => {
          loader.load(
            '/textures/earth-topology.png',
            (bump) => upgradeEarth(tex, bump),
            undefined,
            () => upgradeEarth(tex, null),
          );
        },
        undefined,
        () => {
          loader.load(
            '/textures/earth-day.jpg',
            (tex) => upgradeEarth(tex, null),
            undefined,
            () => setGlobeReady(true),
          );
        },
      );

      // ── Animation loop ──
      const clock = clockRef.current;

      const animate = () => {
        animRef.current = requestAnimationFrame(animate);
        if (!isVisibleRef.current) return;

        clock.update();
        const elapsed = clock.getElapsed();
        const group = earthGroupRef.current;
        const cam = cameraRef.current;
        const ren = rendererRef.current;
        const mg = markersGroupRef.current;
        if (!group || !cam || !ren) return;

        // Auto-rotate
        if (autoRotRef.current && !isDragRef.current && !zoomingToRef.current) {
          group.rotation.y += AUTO_SPEED;
        }

        // Momentum
        if (!isDragRef.current && !autoRotRef.current && !zoomingToRef.current) {
          const m = momentumRef.current;
          if (Math.abs(m.x) > 0.0001 || Math.abs(m.y) > 0.0001) {
            group.rotation.y += m.x;
            group.rotation.x = Math.max(-0.8, Math.min(0.8, group.rotation.x + m.y));
            m.x *= MOMENTUM_FRICTION;
            m.y *= MOMENTUM_FRICTION;
          }
        }

        // Smooth zoom
        cam.position.z += (targetZoomRef.current - cam.position.z) * 0.05;
        cam.position.y += (0.15 - cam.position.y) * 0.05;

        // Zoom-to-country
        if (zoomingToRef.current && targetRotYRef.current !== null) {
          let diff = targetRotYRef.current - group.rotation.y;
          while (diff > Math.PI) diff -= Math.PI * 2;
          while (diff < -Math.PI) diff += Math.PI * 2;
          group.rotation.y += diff * 0.04;
          if (targetRotXRef.current !== null) {
            group.rotation.x += (targetRotXRef.current - group.rotation.x) * 0.04;
          }
        }

        // Nepal pulse
        const ring = nepalRingRef.current;
        if (ring) {
          const s = 1 + 0.6 * Math.sin(elapsed * 2);
          ring.scale.set(s, s, s);
          (ring.material as THREE.MeshBasicMaterial).opacity = 0.5 * (1 - (s - 1) / 0.6);
        }

        // Marker orientation & visibility
        if (mg) {
          const camWP = cam.position.clone();
          for (let i = 0; i < mg.children.length; i++) {
            const child = mg.children[i];
            if (child.userData.isRing || child.userData.isGlow) continue;
            const surfPos = child.position.clone().normalize();
            const quat = new THREE.Quaternion().setFromUnitVectors(
              new THREE.Vector3(0, 1, 0), surfPos,
            );
            child.quaternion.copy(quat);
            const wPos = new THREE.Vector3();
            child.getWorldPosition(wPos);
            const toCam = camWP.clone().sub(wPos).normalize();
            const normal = wPos.clone().normalize();
            child.visible = toCam.dot(normal) > -0.1;
          }
        }

        ren.render(scene, sceneRef.current!);
      };

      animRef.current = requestAnimationFrame(animate);

      // IntersectionObserver
      const observer = new IntersectionObserver(
        (entries) => { isVisibleRef.current = entries[0]?.isIntersecting ?? true; },
        { threshold: 0.05 },
      );
      observer.observe(container);

      // Resize
      const onResize = () => {
        const cw = container.clientWidth;
        const ch = container.clientHeight;
        if (cw < 10 || ch < 10) return;
        camera.aspect = cw / ch;
        camera.updateProjectionMatrix();
        renderer.setSize(cw, ch);
        setContainerW(cw);
      };
      window.addEventListener('resize', onResize);

      // Cleanup
      cleanupFnRef.current = () => {
        cancelAnimationFrame(animRef.current);
        window.removeEventListener('resize', onResize);
        observer.disconnect();
        if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
        earthGeom.dispose();
        atmosGeom.dispose();
        atmosMat.dispose();
        innerGlowGeom.dispose();
        innerGlowMat.dispose();
        starsGeom.dispose();
        starsMat.dispose();
        renderer.dispose();
        if (container.contains(renderer.domElement)) {
          container.removeChild(renderer.domElement);
        }
      };
    }

    return () => {
      destroyed = true;
      cancelAnimationFrame(rafId);
      cleanupFnRef.current?.();
    };
  }, []);

  // ─── Cleanup on unmount ───────────────────────────────────────────────
  useEffect(() => {
    return () => { cleanupFnRef.current?.(); };
  }, []);

  // ─── Update markers when countries change ────────────────────────────
  useEffect(() => {
    const mg = markersGroupRef.current;
    if (!mg) return;

    // Dispose old
    while (mg.children.length) {
      const c = mg.children[0];
      mg.remove(c);
      c.traverse((obj) => {
        if ((obj as THREE.Mesh).geometry) (obj as THREE.Mesh).geometry.dispose();
        if ((obj as THREE.Mesh).material) {
          const mat = (obj as THREE.Mesh).material;
          if (mat instanceof THREE.SpriteMaterial) mat.map?.dispose();
          mat.dispose();
        }
      });
    }
    markerMapRef.current.clear();
    nepalRingRef.current = null;

    const hlGlow = createGlowTexture(7, 194, 188);
    const normalGlow = createGlowTexture(13, 148, 136, 0.7);

    for (const country of activeCountries) {
      const pos = latLngToVec3(country.latitude, country.longitude, EARTH_RADIUS * 1.006);
      const isHL = country.isHighlighted;

      // Marker pin (cylinder stem + sphere head)
      const pin = new THREE.Group();
      const pinH = isHL ? 0.06 : 0.04;
      const headR = isHL ? 0.018 : 0.012;
      const stemGeom = new THREE.CylinderGeometry(0.003, 0.005, pinH, 8);
      const stemMat = new THREE.MeshBasicMaterial({ color: isHL ? 0x07c2b8 : 0x0d9488, transparent: true, opacity: 0.9 });
      const stem = new THREE.Mesh(stemGeom, stemMat);
      stem.position.y = pinH / 2;
      pin.add(stem);

      const headGeom = new THREE.SphereGeometry(headR, 12, 12);
      const headMat = new THREE.MeshBasicMaterial({ color: isHL ? 0x07c2b8 : 0x0d9488 });
      const head = new THREE.Mesh(headGeom, headMat);
      head.position.y = pinH + headR * 0.3;
      pin.add(head);

      pin.position.copy(pos);
      pin.userData.isMarker = true;
      mg.add(pin);
      markerMapRef.current.set(head.id, country);

      // Glow sprite
      const spriteMat = new THREE.SpriteMaterial({
        map: isHL ? hlGlow : normalGlow,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      });
      const sprite = new THREE.Sprite(spriteMat);
      sprite.position.copy(pos);
      sprite.position.y += pinH + headR * 0.5;
      sprite.scale.set(isHL ? 0.12 : 0.08, isHL ? 0.12 : 0.08, 1);
      sprite.userData.isGlow = true;
      mg.add(sprite);

      // Pulse ring for highlighted (Nepal)
      if (isHL) {
        const ringGeom = new THREE.RingGeometry(0.03, 0.038, 32);
        const ringMat = new THREE.MeshBasicMaterial({
          color: '#07c2b8', transparent: true, opacity: 0.5,
          side: THREE.DoubleSide, depthWrite: false,
        });
        const ring = new THREE.Mesh(ringGeom, ringMat);
        ring.position.copy(pos);
        ring.lookAt(pos.clone().multiplyScalar(2));
        ring.userData.isRing = true;
        mg.add(ring);
        nepalRingRef.current = ring;
      }
    }
  }, [activeCountries]);

  // ─── Pointer interaction handlers ────────────────────────────────────
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    let dragDistance = 0;

    const onDown = (e: PointerEvent) => {
      isDragRef.current = true;
      autoRotRef.current = false;
      dragDistance = 0;
      prevPtrRef.current = { x: e.clientX, y: e.clientY };
      momentumRef.current = { x: 0, y: 0 };
      el.setPointerCapture(e.pointerId);
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      if (zoomingToRef.current) {
        zoomingToRef.current = null;
        targetRotYRef.current = null;
        targetRotXRef.current = null;
        targetZoomRef.current = DEFAULT_CAM_Z;
        setZoomedCountry(null);
      }
    };

    const onMove = (e: PointerEvent) => {
      if (isDragRef.current) {
        const dx = e.clientX - prevPtrRef.current.x;
        const dy = e.clientY - prevPtrRef.current.y;
        dragDistance += Math.abs(dx) + Math.abs(dy);
        const g = earthGroupRef.current;
        if (g) {
          g.rotation.y += dx * DRAG_SENS;
          g.rotation.x = Math.max(-0.8, Math.min(0.8, g.rotation.x + dy * DRAG_SENS));
          momentumRef.current = { x: dx * DRAG_SENS * 0.5, y: dy * DRAG_SENS * 0.3 };
        }
        prevPtrRef.current = { x: e.clientX, y: e.clientY };
        setTooltip(null);
        el.style.cursor = 'grabbing';
        return;
      }

      // Hover detection
      const rect = el.getBoundingClientRect();
      const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const ny = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      const cam = cameraRef.current;
      const mg = markersGroupRef.current;
      if (!cam || !mg) return;

      raycasterRef.current.setFromCamera(new THREE.Vector2(nx, ny), cam);
      const meshes: THREE.Object3D[] = [];
      for (const marker of mg.children) {
        if (!marker.userData.isMarker || !marker.visible) continue;
        marker.traverse((child) => { if ((child as THREE.Mesh).isMesh) meshes.push(child); });
      }
      const hits = raycasterRef.current.intersectObjects(meshes, false);

      if (hits.length > 0) {
        let obj: THREE.Object3D | null = hits[0].object;
        while (obj && !obj.userData.isMarker) obj = obj.parent;
        if (obj) {
          const headMesh = obj.children[1] as THREE.Mesh;
          const country = markerMapRef.current.get(headMesh.id);
          if (country) {
            setTooltip({ country, x: e.clientX - rect.left, y: e.clientY - rect.top });
            el.style.cursor = 'pointer';
            return;
          }
        }
      }
      setTooltip(null);
      el.style.cursor = 'grab';
    };

    const onUp = () => {
      isDragRef.current = false;
      el.style.cursor = 'grab';
      idleTimerRef.current = setTimeout(() => { autoRotRef.current = true; }, IDLE_MS);
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      targetZoomRef.current = Math.max(MIN_CAM_Z, Math.min(MAX_CAM_Z, targetZoomRef.current + e.deltaY * ZOOM_SENS));
    };

    const onClick = (e: MouseEvent) => {
      if (dragDistance > 8) return;
      const rect = el.getBoundingClientRect();
      const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const ny = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      const cam = cameraRef.current;
      const mg = markersGroupRef.current;
      if (!cam || !mg) return;

      raycasterRef.current.setFromCamera(new THREE.Vector2(nx, ny), cam);
      const meshes: THREE.Object3D[] = [];
      for (const marker of mg.children) {
        if (!marker.userData.isMarker || !marker.visible) continue;
        marker.traverse((child) => { if ((child as THREE.Mesh).isMesh) meshes.push(child); });
      }
      const hits = raycasterRef.current.intersectObjects(meshes, false);

      if (hits.length > 0) {
        let obj: THREE.Object3D | null = hits[0].object;
        while (obj && !obj.userData.isMarker) obj = obj.parent;
        if (obj) {
          const headMesh = obj.children[1] as THREE.Mesh;
          const country = markerMapRef.current.get(headMesh.id);
          if (!country) return;
          const targetY = -country.longitude * (Math.PI / 180);
          const targetX = country.latitude * (Math.PI / 180) * -0.4;
          targetRotYRef.current = targetY;
          targetRotXRef.current = targetX;
          targetZoomRef.current = country.isHighlighted ? ZOOM_COUNTRY_Z : ZOOM_COUNTRY_Z + 0.2;
          zoomingToRef.current = country.id;
          setZoomedCountry(country);
          setTooltip(null);
        }
      }
    };

    // Touch pinch zoom
    let lastPinchDist = 0;
    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        lastPinchDist = Math.sqrt(dx * dx + dy * dy);
      }
    };
    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const delta = lastPinchDist - dist;
        targetZoomRef.current = Math.max(MIN_CAM_Z, Math.min(MAX_CAM_Z, targetZoomRef.current + delta * 0.005));
        lastPinchDist = dist;
      }
    };

    el.addEventListener('pointerdown', onDown);
    el.addEventListener('pointermove', onMove);
    el.addEventListener('pointerup', onUp);
    el.addEventListener('pointerleave', onUp);
    el.addEventListener('wheel', onWheel, { passive: false });
    el.addEventListener('click', onClick);
    el.addEventListener('touchstart', onTouchStart, { passive: true });
    el.addEventListener('touchmove', onTouchMove, { passive: true });

    return () => {
      el.removeEventListener('pointerdown', onDown);
      el.removeEventListener('pointermove', onMove);
      el.removeEventListener('pointerup', onUp);
      el.removeEventListener('pointerleave', onUp);
      el.removeEventListener('wheel', onWheel);
      el.removeEventListener('click', onClick);
      el.removeEventListener('touchstart', onTouchStart);
      el.removeEventListener('touchmove', onTouchMove);
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    };
  }, []);

  // ─── Zoom out handler ────────────────────────────────────────────────
  const handleZoomOut = useCallback(() => {
    zoomingToRef.current = null;
    targetRotYRef.current = null;
    targetRotXRef.current = null;
    targetZoomRef.current = DEFAULT_CAM_Z;
    setZoomedCountry(null);
  }, []);

  // ─── Render ───────────────────────────────────────────────────────────
  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden bg-white py-16 md:py-24"
      aria-label="Trusted Across Borders"
    >
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-slate-50/50 via-transparent to-slate-50/50" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="mb-10 text-center"
        >
          <h2 className="font-heading mb-3 text-2xl font-bold text-danphe-primary sm:text-3xl md:text-4xl">
            {heading}
          </h2>
          <p className="mx-auto max-w-2xl text-sm text-danphe-text sm:text-base">
            {subheading}
          </p>
        </motion.div>

        <div className="flex flex-col items-center gap-8 lg:flex-row lg:items-center lg:gap-10">
          {/* Left: Statistics */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex w-full flex-col gap-4 lg:w-[380px] xl:w-[420px] lg:shrink-0"
          >
            {nepalData && (
              <div className="glass rounded-2xl border border-danphe-accent/10 p-5 shadow-premium">
                <div className="mb-3 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-danphe-accent/10">
                    <MapPin className="h-5 w-5 text-danphe-accent" />
                  </div>
                  <div>
                    <h3 className="font-heading text-base font-semibold text-danphe-primary">{nepalData.countryName}</h3>
                    <p className="text-[11px] font-medium text-danphe-accent">Headquarters</p>
                  </div>
                </div>
                <p className="font-heading text-2xl font-bold text-danphe-primary">
                  {nepalData.displayLabel || `${nepalData.hospitalCount}+`}
                </p>
                <p className="mt-1 text-[11px] text-danphe-text/50">Hospitals &amp; Health Institutions</p>
              </div>
            )}

            <div className="glass rounded-2xl p-5 shadow-premium">
              <div className="mb-3 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-danphe-accent/10">
                  <GlobeIcon className="h-5 w-5 text-danphe-accent" />
                </div>
                <h3 className="font-heading text-base font-semibold text-danphe-primary">Global Reach</h3>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="font-heading text-2xl font-bold text-danphe-primary">{activeCountries.length}+</p>
                  <p className="text-[11px] text-danphe-text/70">Countries Served</p>
                </div>
                <div>
                  <p className="font-heading text-2xl font-bold text-danphe-primary">{totalHospitals}+</p>
                  <p className="text-[11px] text-danphe-text/70">Hospitals &amp; Partners</p>
                </div>
              </div>
            </div>

            <div className="glass rounded-2xl p-4 shadow-premium">
              <p className="mb-2.5 text-[10px] font-semibold uppercase tracking-widest text-danphe-text/40">Active Regions</p>
              <div className="max-h-44 space-y-2 overflow-y-auto pr-1">
                {activeCountries
                  .sort((a, b) => b.hospitalCount - a.hospitalCount)
                  .map((c) => (
                    <div key={c.id} className="flex items-center justify-between rounded-lg px-2 py-1.5 transition-colors hover:bg-danphe-accent/5">
                      <div className="flex items-center gap-2.5">
                        <span className={`h-2 w-2 rounded-full ${c.isHighlighted ? 'bg-danphe-accent shadow-[0_0_8px_rgba(13,148,136,0.6)]' : 'bg-danphe-accent/40'}`} />
                        <span className="text-[13px] font-medium text-danphe-text">{c.countryName}</span>
                      </div>
                      <span className="text-[11px] font-semibold text-danphe-primary/80">
                        {c.displayLabel || `${c.hospitalCount}+`}
                      </span>
                    </div>
                  ))}
              </div>
            </div>

            <p className="hidden text-[11px] text-danphe-text/30 lg:block">
              Drag to rotate · Scroll to zoom · Click markers for details
            </p>
          </motion.div>

          {/* Right: 3D Globe */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.7, delay: 0.2, ease: 'easeOut' }}
            className="flex flex-1 items-center justify-center"
          >
            <div
              ref={containerRef}
              className="relative h-[300px] w-full max-w-[460px] sm:h-[360px] md:h-[420px] lg:h-[460px]"
              style={{ cursor: 'grab' }}
            >
              {/* Loading indicator */}
              {!globeReady && (
                <div className="pointer-events-none absolute bottom-3 left-3 z-20 flex items-center gap-1.5">
                  <div className="h-3 w-3 animate-spin rounded-full border border-danphe-accent/30 border-t-danphe-accent" />
                  <span className="text-[10px] text-danphe-text/30">Loading...</span>
                </div>
              )}

              {/* Tooltip */}
              <AnimatePresence>
                {tooltip && !zoomedCountry && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 4 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 4 }}
                    transition={{ duration: 0.15 }}
                    className="pointer-events-none absolute z-20 rounded-xl border border-white/10 bg-slate-900/90 px-3.5 py-2.5 shadow-xl backdrop-blur-sm"
                    style={{
                      left: Math.min(Math.max(tooltip.x + 14, 8), containerW - 170),
                      top: tooltip.y - 56,
                    }}
                  >
                    <p className="text-xs font-semibold text-white">{tooltip.country.countryName}</p>
                    <p className="mt-0.5 text-[11px] font-medium text-danphe-accent">
                      {tooltip.country.displayLabel || `${tooltip.country.hospitalCount}+ Hospitals`}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Country info panel (zoomed) */}
              <AnimatePresence>
                {zoomedCountry && (
                  <motion.div
                    initial={{ opacity: 0, y: 16, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 16, scale: 0.95 }}
                    transition={{ duration: 0.25, ease: 'easeOut' }}
                    className="absolute bottom-4 left-4 right-4 z-20 flex items-center justify-between gap-3 rounded-xl border border-danphe-accent/15 bg-slate-900/85 px-4 py-3.5 shadow-2xl backdrop-blur-md sm:left-auto sm:right-4 sm:w-auto sm:min-w-[240px]"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <Building2 className="h-3.5 w-3.5 shrink-0 text-danphe-accent" />
                        <p className="truncate text-[11px] font-semibold text-danphe-accent">
                          {zoomedCountry.isHighlighted ? 'Headquarters' : 'Danphe HMIS Presence'}
                        </p>
                      </div>
                      <p className="mt-1 text-base font-bold text-white">{zoomedCountry.countryName}</p>
                      <p className="mt-0.5 text-sm font-medium text-white/80">
                        {zoomedCountry.displayLabel || `${zoomedCountry.hospitalCount}+ Hospitals`}
                      </p>
                    </div>
                    <button
                      onClick={handleZoomOut}
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/10 text-white/60 transition-all hover:bg-white/20 hover:text-white"
                      aria-label="Zoom out"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
