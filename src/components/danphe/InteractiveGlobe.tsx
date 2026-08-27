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
   Glow sprite texture (for marker halos)
   ═══════════════════════════════════════════════════════════════════ */

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
   ═══════════════════════════════════════════════════════════════════ */

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
    // Teal-ish atmosphere
    gl_FragColor = vec4(0.04, 0.52, 0.48, glow * 0.4);
  }
`;

/* ═══════════════════════════════════════════════════════════════════════════════
   Marker pin geometry (cone + sphere top)
   ═══════════════════════════════════════════════════════════════════ */

function createMarkerPin(isHighlighted: boolean): THREE.Group {
  const group = new THREE.Group();
  const color = isHighlighted ? 0x07c2b8 : 0x0d9488;
  const pinHeight = isHighlighted ? 0.06 : 0.04;
  const headRadius = isHighlighted ? 0.018 : 0.012;

  // Stem
  const stemGeom = new THREE.CylinderGeometry(0.003, 0.005, pinHeight, 8);
  const stemMat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.9 });
  const stem = new THREE.Mesh(stemGeom, stemMat);
  stem.position.y = pinHeight / 2;
  group.add(stem);

  // Head
  const headGeom = new THREE.SphereGeometry(headRadius, 12, 12);
  const headMat = new THREE.MeshBasicMaterial({ color });
  const head = new THREE.Mesh(headGeom, headMat);
  head.position.y = pinHeight + headRadius * 0.3;
  group.add(head);

  return group;
}

/* ═══════════════════════════════════════════════════════════════════════════════
   Component
   ═══════════════════════════════════════════════════════════════════════════════ */

export default function InteractiveGlobe({ countries, heading, subheading }: InteractiveGlobeProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-60px' });

  // Three.js object refs
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const earthGroupRef = useRef<THREE.Group | null>(null);
  const markersGroupRef = useRef<THREE.Group | null>(null);
  const animRef = useRef(0);
  const clockRef = useRef(new THREE.Timer());
  const nepalRingRef = useRef<THREE.Mesh | null>(null);

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
  const [webglFailed, setWebglFailed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Computed data
  const activeCountries = useMemo(() => countries.filter((c) => c.isActive), [countries]);
  const totalHospitals = useMemo(() => activeCountries.reduce((s, c) => s + c.hospitalCount, 0), [activeCountries]);
  const nepalData = useMemo(() => countries.find((c) => c.isHighlighted) || null, [countries]);

  // ─── Three.js scene setup (runs once when in view) ──────────────────
  useEffect(() => {
    const container = containerRef.current;
    if (!container || !isInView) return;
    const w = container.clientWidth;
    const h = container.clientHeight;
    if (w === 0 || h === 0) return;

    setContainerW(w);

    // Check WebGL support
    try {
      const testCanvas = document.createElement('canvas');
      const gl = testCanvas.getContext('webgl2') || testCanvas.getContext('webgl');
      if (!gl) { setWebglFailed(true); return; }
    } catch { setWebglFailed(true); return; }

    // Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(38, w / h, 0.1, 100);
    camera.position.set(0, 0.15, DEFAULT_CAM_Z);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // ── Lights ────────────────────────────────────────────────────
    const ambient = new THREE.AmbientLight(0xffffff, 0.45);
    scene.add(ambient);

    const sun = new THREE.DirectionalLight(0xfff5e6, 1.2);
    sun.position.set(5, 3, 5);
    scene.add(sun);

    const fill = new THREE.DirectionalLight(0x8ecae6, 0.3);
    fill.position.set(-4, -1, -3);
    scene.add(fill);

    const rim = new THREE.DirectionalLight(0x0d9488, 0.15);
    rim.position.set(-3, 2, -5);
    scene.add(rim);

    // ── Earth group (rotation target) ─────────────────────────────
    const earthGroup = new THREE.Group();
    earthGroup.rotation.x = 0.25; // Earth axial tilt
    earthGroup.rotation.y = -0.5;
    scene.add(earthGroup);
    earthGroupRef.current = earthGroup;

    // ── Load textures and build Earth ─────────────────────────────
    const textureLoader = new THREE.TextureLoader();

    const onTexturesReady = (colorMap: THREE.Texture, bumpMap: THREE.Texture | null) => {
      colorMap.colorSpace = THREE.SRGBColorSpace;
      colorMap.anisotropy = renderer.capabilities.getMaxAnisotropy();

      if (bumpMap) {
        bumpMap.anisotropy = renderer.capabilities.getMaxAnisotropy();
      }

      const earthGeom = new THREE.SphereGeometry(EARTH_RADIUS, 96, 64);
      const earthMat = new THREE.MeshStandardMaterial({
        map: colorMap,
        bumpMap: bumpMap || undefined,
        bumpScale: 0.015,
        roughness: 0.75,
        metalness: 0.05,
      });
      const earthMesh = new THREE.Mesh(earthGeom, earthMat);
      earthGroup.add(earthMesh);

      setIsLoading(false);
    };

    const onTextureError = () => {
      // Fallback: create a simple procedural texture
      const canvas = document.createElement('canvas');
      canvas.width = 2048; canvas.height = 1024;
      const ctx = canvas.getContext('2d')!;
      // Ocean gradient
      const oceanGrad = ctx.createRadialGradient(1024, 512, 0, 1024, 512, 1024);
      oceanGrad.addColorStop(0, '#1a5276');
      oceanGrad.addColorStop(0.5, '#1b4f72');
      oceanGrad.addColorStop(1, '#0e3a5c');
      ctx.fillStyle = oceanGrad;
      ctx.fillRect(0, 0, 2048, 1024);
      const fallbackTex = new THREE.CanvasTexture(canvas);
      fallbackTex.colorSpace = THREE.SRGBColorSpace;

      const earthGeom = new THREE.SphereGeometry(EARTH_RADIUS, 96, 64);
      const earthMat = new THREE.MeshStandardMaterial({
        map: fallbackTex,
        roughness: 0.6,
        metalness: 0.1,
      });
      earthGroup.add(new THREE.Mesh(earthGeom, earthMat));
      setIsLoading(false);
    };

    // Load color map
    const colorTex = textureLoader.load(
      '/textures/earth-day-hd.jpg',
      (tex) => {
        // Load bump map
        const bumpTex = textureLoader.load(
          '/textures/earth-topology.png',
          (bump) => onTexturesReady(tex, bump),
          undefined,
          () => onTexturesReady(tex, null), // bump fails → just use color
        );
      },
      undefined,
      onTextureError,
    );

    // ── Atmosphere glow (back-face sphere) ────────────────────────
    const atmosGeom = new THREE.SphereGeometry(EARTH_RADIUS * 1.025, 64, 48);
    const atmosMat = new THREE.ShaderMaterial({
      vertexShader: ATMO_VS,
      fragmentShader: ATMO_FS,
      transparent: true,
      side: THREE.BackSide,
      depthWrite: false,
    });
    scene.add(new THREE.Mesh(atmosGeom, atmosMat));

    // ── Inner glow (front-face, subtle) ───────────────────────────
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

    // ── Markers group ─────────────────────────────────────────────
    const markersGroup = new THREE.Group();
    earthGroup.add(markersGroup);
    markersGroupRef.current = markersGroup;

    // ── Stars background (subtle) ─────────────────────────────────
    const starsGeom = new THREE.BufferGeometry();
  const starCount = 300;
  const starPositions = new Float32Array(starCount * 3);
  for (let i = 0; i < starCount; i++) {
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    const r = 8 + Math.random() * 6;
    starPositions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    starPositions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    starPositions[i * 3 + 2] = r * Math.cos(phi);
  }
  starsGeom.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
  const starsMat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.03, transparent: true, opacity: 0.4 });
  scene.add(new THREE.Points(starsGeom, starsMat));

    // ── Animation loop ────────────────────────────────────────────
  const clock = clockRef.current;

    const animate = () => {
      animRef.current = requestAnimationFrame(animate);

      // Pause when not visible
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

      // Smooth camera Y
      const targetCamY = 0.15;
      cam.position.y += (targetCamY - cam.position.y) * 0.05;

      // Zoom-to-country animation
      if (zoomingToRef.current && targetRotYRef.current !== null) {
        let diff = targetRotYRef.current - group.rotation.y;
        while (diff > Math.PI) diff -= Math.PI * 2;
        while (diff < -Math.PI) diff += Math.PI * 2;
        group.rotation.y += diff * 0.04;

        if (targetRotXRef.current !== null) {
          group.rotation.x += (targetRotXRef.current - group.rotation.x) * 0.04;
        }
      }

      // Nepal pulse ring
      const ring = nepalRingRef.current;
      if (ring) {
        const s = 1 + 0.6 * Math.sin(elapsed * 2);
        ring.scale.set(s, s, s);
        (ring.material as THREE.MeshBasicMaterial).opacity = 0.5 * (1 - (s - 1) / 0.6);
      }

      // Marker pulse animation (subtle scale on all markers)
      if (mg) {
        for (let i = 0; i < mg.children.length; i++) {
          const child = mg.children[i];
          if (child.userData.isRing) continue;
          if (!child.userData.isGlow) {
            // Marker pins: orient along surface normal
            const surfPos = child.position.clone().normalize();
            const up = new THREE.Vector3(0, 1, 0);
            const quat = new THREE.Quaternion().setFromUnitVectors(up, surfPos);
            child.quaternion.copy(quat);
          }

          // Visibility: hide markers on back side of Earth
          const camWorldPos = cam.position.clone();
          const wPos = new THREE.Vector3();
          child.getWorldPosition(wPos);
          const toCam = camWorldPos.clone().sub(wPos).normalize();
          const normal = wPos.clone().normalize();
          child.visible = toCam.dot(normal) > -0.1;
        }
      }

      ren.render(scene, sceneRef.current!);
    };

    animRef.current = requestAnimationFrame(animate);

    // ── IntersectionObserver: pause when off-screen ────────────────
    const observer = new IntersectionObserver(
      (entries) => { isVisibleRef.current = entries[0]?.isIntersecting ?? true; },
      { threshold: 0.05 },
    );
    if (container) observer.observe(container);

    // Resize
    const onResize = () => {
      const cw = container.clientWidth;
      const ch = container.clientHeight;
      if (cw === 0 || ch === 0) return;
      cam.aspect = cw / ch;
      cam.updateProjectionMatrix();
      ren.setSize(cw, ch);
      setContainerW(cw);
    };
    window.addEventListener('resize', onResize);

    // Cleanup
    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener('resize', onResize);
      observer.disconnect();
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      colorTex.dispose();
      atmosGeom.dispose();
      atmosMat.dispose();
      ren.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [isInView]);

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
      const pos = latLngToVec3(country.latitude, country.longitude, EARTH_RADIUS * 1.002);
      const isHL = country.isHighlighted;

      // Marker pin group
      const pin = createMarkerPin(isHL);
      pin.position.copy(pos);
      pin.userData.isMarker = true;
      mg.add(pin);

      // Register the pin head for raycasting
      const headMesh = pin.children[1] as THREE.Mesh;
      markerMapRef.current.set(headMesh.id, country);

      // Glow sprite
      const spriteMat = new THREE.SpriteMaterial({
        map: isHL ? hlGlow : normalGlow,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      });
      const sprite = new THREE.Sprite(spriteMat);
      sprite.position.copy(pos);
      sprite.position.y += (isHL ? 0.06 : 0.04) + (isHL ? 0.018 : 0.012);
      sprite.scale.set(isHL ? 0.12 : 0.08, isHL ? 0.12 : 0.08, 1);
      sprite.userData.isGlow = true;
      mg.add(sprite);

      // Pulse ring for highlighted (Nepal)
      if (isHL) {
        const ringGeom = new THREE.RingGeometry(0.03, 0.038, 32);
        const ringMat = new THREE.MeshBasicMaterial({
          color: '#07c2b8',
          transparent: true,
          opacity: 0.5,
          side: THREE.DoubleSide,
          depthWrite: false,
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
      const allMarkers = mg.children.filter((c) => c.userData.isMarker && c.visible);
      const allMeshes: THREE.Object3D[] = [];
      for (const marker of allMarkers) {
        marker.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) allMeshes.push(child);
        });
      }
      const hits = raycasterRef.current.intersectObjects(allMeshes, false);

      if (hits.length > 0) {
        // Walk up to find the parent pin group
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
      // Don't fire if user was dragging
      if (dragDistance > 8) return;

      const rect = el.getBoundingClientRect();
      const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const ny = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      const cam = cameraRef.current;
      const mg = markersGroupRef.current;
      if (!cam || !mg) return;

      raycasterRef.current.setFromCamera(new THREE.Vector2(nx, ny), cam);
      const allMarkers = mg.children.filter((c) => c.userData.isMarker && c.visible);
      const allMeshes: THREE.Object3D[] = [];
      for (const marker of allMarkers) {
        marker.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) allMeshes.push(child);
        });
      }
      const hits = raycasterRef.current.intersectObjects(allMeshes, false);

      if (hits.length > 0) {
        let obj: THREE.Object3D | null = hits[0].object;
        while (obj && !obj.userData.isMarker) obj = obj.parent;
        if (obj) {
          const headMesh = obj.children[1] as THREE.Mesh;
          const country = markerMapRef.current.get(headMesh.id);
          if (!country) return;

          if (country.isHighlighted) {
            // Zoom into Nepal
            const targetY = -country.longitude * (Math.PI / 180);
            const targetX = country.latitude * (Math.PI / 180) * -0.4;
            targetRotYRef.current = targetY;
            targetRotXRef.current = targetX;
            targetZoomRef.current = ZOOM_COUNTRY_Z;
            zoomingToRef.current = country.id;
            setZoomedCountry(country);
            setTooltip(null);
          } else {
            // Zoom to country and show info
            const targetY = -country.longitude * (Math.PI / 180);
            const targetX = country.latitude * (Math.PI / 180) * -0.4;
            targetRotYRef.current = targetY;
            targetRotXRef.current = targetX;
            targetZoomRef.current = ZOOM_COUNTRY_Z + 0.2;
            zoomingToRef.current = country.id;
            setZoomedCountry(country);
            setTooltip(null);
          }
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
      {/* Subtle background gradient */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-slate-50/50 via-transparent to-slate-50/50" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
        {/* ── Heading ────────────────────────────────────────────────── */}
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

        {/* ── Two-column layout ─────────────────────────────────────── */}
        <div className="flex flex-col items-center gap-8 lg:flex-row lg:items-center lg:gap-10">
          {/* ── Left: Statistics cards ──────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex w-full flex-col gap-4 lg:w-[380px] xl:w-[420px] lg:shrink-0"
          >
            {/* Nepal Card */}
            {nepalData && (
              <div className="glass rounded-2xl border border-danphe-accent/10 p-5 shadow-premium">
                <div className="mb-3 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-danphe-accent/10">
                    <MapPin className="h-5 w-5 text-danphe-accent" />
                  </div>
                  <div>
                    <h3 className="font-heading text-base font-semibold text-danphe-primary">
                      {nepalData.countryName}
                    </h3>
                    <p className="text-[11px] font-medium text-danphe-accent">Headquarters</p>
                  </div>
                </div>
                <p className="font-heading text-2xl font-bold text-danphe-primary">
                  {nepalData.displayLabel || `${nepalData.hospitalCount}+`}
                </p>
                <p className="mt-1 text-[11px] text-danphe-text/50">Hospitals &amp; Health Institutions</p>
              </div>
            )}

            {/* Global Stats */}
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

            {/* Country list */}
            <div className="glass rounded-2xl p-4 shadow-premium">
              <p className="mb-2.5 text-[10px] font-semibold uppercase tracking-widest text-danphe-text/40">
                Active Regions
              </p>
              <div className="max-h-44 space-y-2 overflow-y-auto pr-1">
                {activeCountries
                  .sort((a, b) => b.hospitalCount - a.hospitalCount)
                  .map((c) => (
                    <div
                      key={c.id}
                      className="flex items-center justify-between rounded-lg px-2 py-1.5 transition-colors hover:bg-danphe-accent/5"
                    >
                      <div className="flex items-center gap-2.5">
                        <span
                          className={`h-2 w-2 rounded-full ${c.isHighlighted ? 'bg-danphe-accent shadow-[0_0_8px_rgba(13,148,136,0.6)]' : 'bg-danphe-accent/40'}`}
                        />
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

          {/* ── Right: 3D Globe ─────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.7, delay: 0.2, ease: 'easeOut' }}
            className="flex flex-1 items-center justify-center"
          >
            <div
              ref={containerRef}
              className="relative h-[320px] w-full max-w-[460px] sm:h-[380px] md:h-[440px] lg:h-[460px]"
              style={{ cursor: 'grab' }}
            >
              {/* Three.js canvas is injected here */}

              {/* Loading state */}
              {isLoading && !webglFailed && (
                <div className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-3">
                  <div className="h-8 w-8 animate-spin rounded-full border-2 border-danphe-accent/20 border-t-danphe-accent" />
                  <span className="text-[11px] font-medium text-danphe-text/40">Loading Earth...</span>
                </div>
              )}

              {/* WebGL fallback */}
              {webglFailed && (
                <div className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-2 rounded-2xl bg-slate-100">
                  <GlobeIcon className="h-10 w-10 text-danphe-text/20" />
                  <p className="text-sm text-danphe-text/40">3D not supported</p>
                </div>
              )}

              {/* Tooltip overlay */}
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

              {/* Country info panel (when zoomed) */}
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
