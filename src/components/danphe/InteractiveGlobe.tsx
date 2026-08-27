'use client';

import { useRef, useEffect, useState, useMemo, useCallback } from 'react';
import { motion, useInView } from 'framer-motion';
import { MapPin, Globe as GlobeIcon, ArrowLeft } from 'lucide-react';
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
const DEFAULT_CAM_Z = 2.6;
const MIN_CAM_Z = 1.5;
const MAX_CAM_Z = 4.2;
const ZOOM_COUNTRY_Z = 1.7;
const AUTO_SPEED = 0.0012;
const DRAG_SENS = 0.005;
const ZOOM_SENS = 0.0008;
const IDLE_MS = 3500;

/* ═══════════════════════════════════════════════════════════════════════════════
   Continent polygons — lat/lng — for procedural Earth texture
   ═══════════════════════════════════════════════════════════════════════════════ */

const LAND: [number, number][][] = [
  // North America
  [[-130,55],[-125,60],[-120,65],[-110,68],[-100,70],[-85,72],[-75,70],[-65,62],[-58,48],[-66,44],[-70,42],[-75,36],[-80,25],[-82,22],[-87,18],[-90,16],[-96,18],[-100,20],[-105,22],[-110,30],[-115,32],[-120,34],[-122,37],[-124,42],[-124,48],[-130,55]],
  // Greenland
  [[-55,60],[-48,62],[-40,65],[-25,70],[-18,76],[-20,80],[-35,82],[-50,78],[-55,72],[-55,60]],
  // South America
  [[-80,10],[-77,8],[-72,8],[-68,6],[-60,5],[-52,3],[-48,0],[-40,-2],[-35,-5],[-35,-12],[-38,-16],[-42,-22],[-48,-26],[-52,-32],[-58,-38],[-64,-50],[-68,-54],[-70,-48],[-72,-40],[-75,-30],[-76,-18],[-80,-5],[-80,10]],
  // Europe
  [[-10,36],[-8,38],[-4,40],[-8,43],[-2,44],[0,46],[-2,48],[2,50],[5,52],[5,56],[10,55],[12,58],[14,56],[16,54],[18,55],[22,55],[24,58],[26,60],[28,62],[30,65],[28,68],[25,70],[18,70],[15,68],[12,64],[8,62],[5,62],[5,58],[3,55],[-2,52],[-5,48],[-8,44],[-10,40],[-10,36]],
  // UK & Ireland
  [[-10,50],[-6,50],[-5,52],[-3,54],[-5,56],[-3,58],[-2,58],[0,56],[2,53],[0,51],[-2,50],[-5,50],[-10,50]],
  // Africa
  [[-15,15],[-17,20],[-17,25],[-13,28],[-8,32],[-5,35],[0,36],[8,37],[10,36],[12,34],[15,33],[20,32],[25,32],[30,30],[33,28],[36,25],[38,20],[42,15],[46,12],[50,10],[48,5],[45,0],[42,-3],[40,-8],[38,-12],[36,-18],[34,-24],[30,-30],[28,-33],[25,-34],[22,-34],[18,-30],[15,-26],[12,-18],[12,-12],[10,-5],[8,0],[5,5],[2,6],[0,5],[-5,5],[-8,8],[-12,10],[-15,15]],
  // Madagascar
  [[44,-12],[46,-14],[48,-18],[48,-22],[46,-24],[44,-24],[43,-20],[43,-15],[44,-12]],
  // Asia (mainland)
  [[30,35],[32,36],[35,38],[38,40],[42,42],[48,40],[52,42],[55,45],[58,48],[62,48],[65,50],[68,52],[72,55],[76,55],[80,52],[84,48],[88,48],[92,50],[96,48],[100,46],[104,42],[108,38],[112,36],[116,34],[118,36],[120,38],[124,40],[126,42],[128,44],[130,42],[132,44],[134,46],[136,48],[140,48],[142,50],[140,54],[138,58],[134,60],[130,62],[126,58],[122,55],[118,52],[114,50],[108,52],[102,55],[96,58],[90,60],[84,62],[78,65],[72,68],[66,65],[60,60],[54,55],[50,52],[46,48],[42,45],[38,42],[35,40],[30,35]],
  // India subcontinent
  [[68,32],[70,28],[72,24],[74,20],[76,16],[78,12],[80,8],[80,10],[78,14],[76,18],[74,22],[72,26],[70,30],[68,32]],
  // Japan
  [[130,31],[131,33],[132,34],[134,36],[136,38],[140,40],[142,42],[144,44],[145,42],[143,39],[140,36],[138,34],[136,32],[132,30],[130,31]],
  // Southeast Asia / Indonesia
  [[100,18],[102,16],[104,14],[104,10],[106,6],[108,2],[106,-2],[108,-4],[112,-6],[116,-8],[120,-6],[122,-4],[124,-2],[128,0],[130,2],[128,4],[124,6],[120,8],[116,10],[112,12],[108,14],[104,16],[100,18]],
  // Philippines
  [[118,8],[120,10],[122,14],[124,16],[124,12],[122,8],[120,6],[118,8]],
  // Australia
  [[114,-14],[118,-14],[124,-14],[130,-12],[136,-12],[140,-14],[146,-18],[150,-22],[152,-26],[150,-30],[148,-34],[144,-36],[140,-38],[136,-36],[132,-34],[128,-32],[124,-30],[120,-28],[116,-24],[114,-20],[114,-14]],
  // New Zealand
  [[166,-35],[168,-37],[172,-38],[174,-40],[176,-42],[178,-44],[176,-46],[174,-44],[170,-42],[168,-40],[166,-38],[168,-36],[166,-35]],
  // Arabian Peninsula
  [[35,28],[36,26],[38,22],[40,18],[42,14],[44,12],[46,16],[50,18],[52,22],[56,24],[56,26],[54,28],[50,28],[48,30],[44,30],[40,30],[36,30],[35,28]],
];

/* ═══════════════════════════════════════════════════════════════════════════════
   Utility — lat/lng → Three.js Vector3 on sphere surface
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
   Procedural Earth texture (dark navy theme with teal landmasses)
   ═══════════════════════════════════════════════════════════════════════════════ */

function createEarthTexture(): THREE.CanvasTexture {
  const W = 2048;
  const H = 1024;
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d')!;

  // Ocean
  ctx.fillStyle = '#091a28';
  ctx.fillRect(0, 0, W, H);

  // Subtle ocean gradient (lighter at equator)
  const oceanGrad = ctx.createLinearGradient(0, 0, 0, H);
  oceanGrad.addColorStop(0, 'rgba(15,35,55,0.5)');
  oceanGrad.addColorStop(0.5, 'rgba(20,45,65,0.3)');
  oceanGrad.addColorStop(1, 'rgba(10,25,40,0.5)');
  ctx.fillStyle = oceanGrad;
  ctx.fillRect(0, 0, W, H);

  // Grid
  ctx.strokeStyle = 'rgba(255,255,255,0.025)';
  ctx.lineWidth = 1;
  for (let lng = -180; lng <= 180; lng += 30) {
    const x = ((lng + 180) / 360) * W;
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
  }
  for (let lat = -90; lat <= 90; lat += 30) {
    const y = ((90 - lat) / 180) * H;
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
  }

  // Draw landmasses
  for (const polygon of LAND) {
    ctx.beginPath();
    for (let i = 0; i < polygon.length; i++) {
      const [lat, lng] = polygon[i];
      const x = ((lng + 180) / 360) * W;
      const y = ((90 - lat) / 180) * H;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fillStyle = '#0f2a38';
    ctx.fill();
    ctx.strokeStyle = 'rgba(13,148,136,0.18)';
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }

  // Subtle coastal glow pass
  for (const polygon of LAND) {
    ctx.beginPath();
    for (let i = 0; i < polygon.length; i++) {
      const [lat, lng] = polygon[i];
      const x = ((lng + 180) / 360) * W;
      const y = ((90 - lat) / 180) * H;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.strokeStyle = 'rgba(13,148,136,0.08)';
    ctx.lineWidth = 4;
    ctx.stroke();
  }

  // Noise dots for texture feel
  ctx.fillStyle = 'rgba(255,255,255,0.008)';
  for (let i = 0; i < 6000; i++) {
    const x = Math.random() * W;
    const y = Math.random() * H;
    ctx.fillRect(x, y, 1, 1);
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/* ═══════════════════════════════════════════════════════════════════════════════
   Glow sprite texture (for marker halos)
   ═══════════════════════════════════════════════════════════════════ */

function createGlowTexture(r: number, g: number, b: number): THREE.CanvasTexture {
  const s = 128;
  const c = document.createElement('canvas');
  c.width = s; c.height = s;
  const ctx = c.getContext('2d')!;
  const grad = ctx.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
  grad.addColorStop(0, `rgba(${r},${g},${b},0.9)`);
  grad.addColorStop(0.3, `rgba(${r},${g},${b},0.3)`);
  grad.addColorStop(0.7, `rgba(${r},${g},${b},0.05)`);
  grad.addColorStop(1, 'transparent');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, s, s);
  return new THREE.CanvasTexture(c);
}

/* ═══════════════════════════════════════════════════════════════════════════════
   Atmosphere shaders (Fresnel rim glow)
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
    float glow = pow(rim, 3.5) * 1.4;
    gl_FragColor = vec4(0.051, 0.58, 0.533, glow * 0.45);
  }
`;

/* ═══════════════════════════════════════════════════════════════════════════════
   Component
   ═══════════════════════════════════════════════════════════════════════════════ */

export default function InteractiveGlobe({ countries, heading, subheading }: InteractiveGlobeProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-80px' });

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
  const targetZoomRef = useRef(DEFAULT_CAM_Z);
  const zoomingToRef = useRef<string | null>(null);
  const targetRotYRef = useRef<number | null>(null);

  // Raycasting
  const raycasterRef = useRef(new THREE.Raycaster());
  const markerMapRef = useRef<Map<number, GlobeCountryData>>(new Map());

  // React state
  const [tooltip, setTooltip] = useState<{ country: GlobeCountryData; x: number; y: number } | null>(null);
  const [containerW, setContainerW] = useState(300);
  const [zoomedId, setZoomedId] = useState<string | null>(null);

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

    // Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(42, w / h, 0.1, 100);
    camera.position.set(0, 0, DEFAULT_CAM_Z);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Lights
    scene.add(new THREE.AmbientLight(0xffffff, 0.5));
    const dir = new THREE.DirectionalLight(0xffffff, 0.9);
    dir.position.set(5, 3, 5);
    scene.add(dir);
    const rim = new THREE.DirectionalLight(0x3366aa, 0.2);
    rim.position.set(-4, -2, -4);
    scene.add(rim);

    // Earth group (rotation target)
    const earthGroup = new THREE.Group();
    earthGroup.rotation.x = 0.25; // slight tilt
    earthGroup.rotation.y = -0.5;
    scene.add(earthGroup);
    earthGroupRef.current = earthGroup;

    // Earth sphere
    const earthTex = createEarthTexture();
    const earthGeom = new THREE.SphereGeometry(EARTH_RADIUS, 80, 80);
    const earthMat = new THREE.MeshPhongMaterial({
          map: earthTex,
          shininess: 12,
          specular: new THREE.Color('#0e2233'),
    });
    earthGroup.add(new THREE.Mesh(earthGeom, earthMat));

    // Atmosphere glow (back-face sphere)
    const atmosGeom = new THREE.SphereGeometry(EARTH_RADIUS * 1.018, 64, 64);
    const atmosMat = new THREE.ShaderMaterial({
      vertexShader: ATMO_VS,
      fragmentShader: ATMO_FS,
      transparent: true,
      side: THREE.BackSide,
      depthWrite: false,
    });
    scene.add(new THREE.Mesh(atmosGeom, atmosMat));

    // Markers group (child of earthGroup so markers rotate with the globe)
    const markersGroup = new THREE.Group();
    earthGroup.add(markersGroup);
    markersGroupRef.current = markersGroup;

    // ── Animation loop ────────────────────────────────────────────────
    const clock = clockRef.current;

    const animate = () => {
      animRef.current = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();
      const group = earthGroupRef.current;
      const cam = cameraRef.current;
      const ren = rendererRef.current;
      const mg = markersGroupRef.current;
      if (!group || !cam || !ren || !mg) return;

      // Auto-rotate
      if (autoRotRef.current && !isDragRef.current && !zoomingToRef.current) {
        group.rotation.y += AUTO_SPEED;
      }

      // Smooth zoom
      cam.position.z += (targetZoomRef.current - cam.position.z) * 0.06;

      // Zoom-to-country animation
      if (zoomingToRef.current && targetRotYRef.current !== null) {
        let diff = targetRotYRef.current - group.rotation.y;
        while (diff > Math.PI) diff -= Math.PI * 2;
        while (diff < -Math.PI) diff += Math.PI * 2;
        group.rotation.y += diff * 0.06;
      }

      // Nepal pulse ring
      const ring = nepalRingRef.current;
      if (ring) {
        const s = 1 + 0.5 * Math.sin(elapsed * 2.5);
        ring.scale.set(s, s, s);
        (ring.material as THREE.MeshBasicMaterial).opacity = 0.55 * (1 - (s - 1) / 0.5);
      }

      // Marker visibility (hide markers on back side)
      const camWorldPos = cam.position.clone();
      for (let i = 0; i < mg.children.length; i++) {
        const child = mg.children[i];
        if (child.userData.isRing) continue; // rings are always visible
        const wPos = new THREE.Vector3();
        child.getWorldPosition(wPos);
        const toCam = camWorldPos.clone().sub(wPos).normalize();
        const normal = wPos.clone().normalize();
        child.visible = toCam.dot(normal) > -0.15;
      }

      ren.render(scene, sceneRef.current!);
    };

    animRef.current = requestAnimationFrame(animate);

    // Resize
    const onResize = () => {
      const cw = container.clientWidth;
      const ch = container.clientHeight;
      if (cw === 0 || ch === 0) return;
      cam.aspect = cw / ch;
      cam.updateProjectionMatrix();
      ren.setSize(cw, ch);
    };
    window.addEventListener('resize', onResize);

    // Cleanup
    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener('resize', onResize);
      earthGeom.dispose();
      earthMat.dispose();
      earthTex.dispose();
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
      if ((c as THREE.Mesh).geometry) (c as THREE.Mesh).geometry.dispose();
      if ((c as THREE.Mesh).material) {
        const mat = (c as THREE.Mesh).material;
        if (mat instanceof THREE.SpriteMaterial) mat.map?.dispose();
        mat.dispose();
      }
    }
    markerMapRef.current.clear();
    nepalRingRef.current = null;

    const glowTex = createGlowTexture(7, 194, 188);
    const normalGlow = createGlowTexture(13, 148, 136);

    for (const country of activeCountries) {
      const pos = latLngToVec3(country.latitude, country.longitude, EARTH_RADIUS * 1.006);
      const isHL = country.isHighlighted;
      const sz = isHL ? 0.022 : 0.013;

      // Marker dot
      const geom = new THREE.SphereGeometry(sz, 16, 16);
      const mat = new THREE.MeshBasicMaterial({
        color: isHL ? '#07c2b8' : '#0d9488',
      });
      const mesh = new THREE.Mesh(geom, mat);
      mesh.position.copy(pos);
      mg.add(mesh);
      markerMapRef.current.set(mesh.id, country);

      // Glow sprite
      const spriteMat = new THREE.SpriteMaterial({
        map: isHL ? glowTex : normalGlow,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      });
      const sprite = new THREE.Sprite(spriteMat);
      sprite.position.copy(pos);
      sprite.scale.set(isHL ? 0.14 : 0.09, isHL ? 0.14 : 0.09, 1);
      mg.add(sprite);

      // Pulse ring for highlighted (Nepal)
      if (isHL) {
        const ringGeom = new THREE.RingGeometry(0.028, 0.035, 32);
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

    const onDown = (e: PointerEvent) => {
      isDragRef.current = true;
      autoRotRef.current = false;
      prevPtrRef.current = { x: e.clientX, y: e.clientY };
      el.setPointerCapture(e.pointerId);
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      if (zoomingToRef.current) {
        // Cancel zoom if user drags during zoom
        zoomingToRef.current = null;
        targetRotYRef.current = null;
        targetZoomRef.current = DEFAULT_CAM_Z;
        setZoomedId(null);
      }
    };

    const onMove = (e: PointerEvent) => {
      if (isDragRef.current) {
        const dx = e.clientX - prevPtrRef.current.x;
        const dy = e.clientY - prevPtrRef.current.y;
        const g = earthGroupRef.current;
        if (g) {
          g.rotation.y += dx * DRAG_SENS;
          g.rotation.x = Math.max(-0.8, Math.min(0.8, g.rotation.x + dy * DRAG_SENS));
        }
        prevPtrRef.current = { x: e.clientX, y: e.clientY };
        setTooltip(null);
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
      const hits = raycasterRef.current.intersectObjects(
        mg.children.filter((c) => !c.userData.isRing && c.visible),
      );

      if (hits.length > 0) {
        const country = markerMapRef.current.get(hits[0].object.id);
        if (country) {
          setTooltip({ country, x: e.clientX - rect.left, y: e.clientY - rect.top });
          el.style.cursor = 'pointer';
          return;
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
      const rect = el.getBoundingClientRect();
      const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const ny = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      const cam = cameraRef.current;
      const mg = markersGroupRef.current;
      if (!cam || !mg) return;

      raycasterRef.current.setFromCamera(new THREE.Vector2(nx, ny), cam);
      const hits = raycasterRef.current.intersectObjects(
        mg.children.filter((c) => !c.userData.isRing && c.visible),
      );

      if (hits.length > 0) {
        const country = markerMapRef.current.get(hits[0].object.id);
        if (!country) return;

        if (country.isHighlighted) {
          // Zoom into Nepal
          const targetY = -country.longitude * (Math.PI / 180);
          targetRotYRef.current = targetY;
          targetZoomRef.current = ZOOM_COUNTRY_Z;
          zoomingToRef.current = country.id;
          setZoomedId(country.id);
          setTooltip(null);
        } else {
          // Show tooltip for non-Nepal countries
          setTooltip({ country, x: e.clientX - rect.left, y: e.clientY - rect.top });
        }
      } else {
        setTooltip(null);
      }
    };

    el.addEventListener('pointerdown', onDown);
    el.addEventListener('pointermove', onMove);
    el.addEventListener('pointerup', onUp);
    el.addEventListener('pointerleave', onUp);
    el.addEventListener('wheel', onWheel, { passive: false });
    el.addEventListener('click', onClick);

    return () => {
      el.removeEventListener('pointerdown', onDown);
      el.removeEventListener('pointermove', onMove);
      el.removeEventListener('pointerup', onUp);
      el.removeEventListener('pointerleave', onUp);
      el.removeEventListener('wheel', onWheel);
      el.removeEventListener('click', onClick);
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    };
  }, []);

  // ─── Zoom out handler ────────────────────────────────────────────────
  const handleZoomOut = useCallback(() => {
    zoomingToRef.current = null;
    targetRotYRef.current = null;
    targetZoomRef.current = DEFAULT_CAM_Z;
    setZoomedId(null);
  }, []);

  // ─── Render ───────────────────────────────────────────────────────────
  return (
    <section
      ref={sectionRef}
      className="bg-white py-16 md:py-24"
      aria-label="Trusted Across Borders"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
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

        <div className="grid items-center gap-6 lg:grid-cols-12 lg:gap-8">
          {/* ── Left: Statistics cards ──────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex flex-col gap-4 lg:col-span-5"
          >
            {/* Nepal Card */}
            {nepalData && (
              <div className="glass rounded-2xl p-5 shadow-premium">
                <div className="mb-3 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-danphe-accent/10">
                    <MapPin className="h-4.5 w-4.5 text-danphe-accent" />
                  </div>
                  <div>
                    <h3 className="font-heading text-base font-semibold text-danphe-primary">
                      {nepalData.countryName}
                    </h3>
                    <p className="text-[11px] text-danphe-text/60">Headquarters</p>
                  </div>
                </div>
                <p className="font-heading text-2xl font-bold text-danphe-primary">
                  {nepalData.displayLabel || `${nepalData.hospitalCount}+`}
                </p>
              </div>
            )}

            {/* Global Stats */}
            <div className="glass rounded-2xl p-5 shadow-premium">
              <div className="mb-3 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-danphe-accent/10">
                  <GlobeIcon className="h-4.5 w-4.5 text-danphe-accent" />
                </div>
                <h3 className="font-heading text-base font-semibold text-danphe-primary">Global Reach</h3>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="font-heading text-xl font-bold text-danphe-primary">{activeCountries.length}+</p>
                  <p className="text-[11px] text-danphe-text">Countries Served</p>
                </div>
                <div>
                  <p className="font-heading text-xl font-bold text-danphe-primary">{totalHospitals}+</p>
                  <p className="text-[11px] text-danphe-text">Hospitals & Partners</p>
                </div>
              </div>
            </div>

            {/* Country list */}
            <div className="glass rounded-2xl p-4 shadow-premium">
              <p className="mb-2.5 text-[10px] font-semibold uppercase tracking-widest text-danphe-text/50">
                Active Regions
              </p>
              <div className="max-h-40 space-y-2 overflow-y-auto pr-1">
                {activeCountries
                  .sort((a, b) => b.hospitalCount - a.hospitalCount)
                  .map((c) => (
                    <div key={c.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${c.isHighlighted ? 'bg-danphe-accent shadow-[0_0_6px_rgba(13,148,136,0.6)]' : 'bg-danphe-accent/40'}`}
                        />
                        <span className="text-[13px] text-danphe-text">{c.countryName}</span>
                      </div>
                      <span className="text-[11px] font-medium text-danphe-primary">
                        {c.displayLabel || `${c.hospitalCount}+`}
                      </span>
                    </div>
                  ))}
              </div>
            </div>

            <p className="hidden text-[11px] text-danphe-text/40 lg:block">
              Drag to rotate · Scroll to zoom · Click markers for details
            </p>
          </motion.div>

          {/* ── Right: 3D Globe ─────────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-7"
          >
            <div
              ref={containerRef}
              className="relative mx-auto h-[340px] w-full max-w-[520px] overflow-hidden rounded-2xl bg-danphe-dark sm:h-[400px] md:h-[460px]"
              style={{ cursor: 'grab' }}
            >
              {/* Three.js canvas is injected here by useEffect */}

              {/* Tooltip overlay */}
              {tooltip && !zoomedId && (
                <div
                  className="pointer-events-none absolute z-20 rounded-xl border border-white/10 bg-slate-900/90 px-3.5 py-2.5 shadow-xl backdrop-blur-sm"
                  style={{
                    left: Math.min(tooltip.x + 14, containerW - 160),
                    top: tooltip.y - 50,
                  }}
                >
                  <p className="text-xs font-semibold text-white">{tooltip.country.countryName}</p>
                  <p className="mt-0.5 text-[11px] font-medium text-danphe-accent">
                    {tooltip.country.displayLabel || `${tooltip.country.hospitalCount}+ Hospitals`}
                  </p>
                </div>
              )}

              {/* Nepal zoom overlay */}
              {zoomedId && nepalData && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute bottom-4 left-4 right-4 z-20 flex items-center justify-between rounded-xl border border-danphe-accent/20 bg-slate-900/85 px-4 py-3 backdrop-blur-md"
                >
                  <div>
                    <p className="text-xs font-semibold text-danphe-accent">{nepalData.countryName} — Headquarters</p>
                    <p className="text-lg font-bold text-white">{nepalData.displayLabel || `${nepalData.hospitalCount}+ Hospitals`}</p>
                  </div>
                  <button
                    onClick={handleZoomOut}
                    className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 text-white/70 transition-colors hover:bg-white/20 hover:text-white"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </button>
                </motion.div>
              )}

              {/* Bottom-right status */}
              <div className="absolute bottom-3 right-3 z-10 flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-danphe-accent animate-pulse" />
                <span className="text-[10px] font-medium text-white/40">Interactive 3D Globe</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
