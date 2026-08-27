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
   Utility
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
   Component
   ═══════════════════════════════════════════════════════════════════════════════ */

export default function InteractiveGlobe({ countries, heading, subheading }: InteractiveGlobeProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const canvasWrapRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-50px' });

  /* Three.js handles — stored in a single ref to survive re-renders */
  const threeRef = useRef<{
    renderer: THREE.WebGLRenderer;
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    earthGroup: THREE.Group;
    earthMesh: THREE.Mesh;
    markersGroup: THREE.Group;
    rafId: number;
    disposed: boolean;
  } | null>(null);

  /* Interaction state refs */
  const isDragging = useRef(false);
  const autoRotate = useRef(true);
  const idleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevPointer = useRef({ x: 0, y: 0 });
  const momentum = useRef({ x: 0, y: 0 });
  const zoomTarget = useRef(2.6);
  const zoomingToCountry = useRef<string | null>(null);
  const targetRotY = useRef<number | null>(null);
  const targetRotX = useRef<number | null>(null);
  const markerMap = useRef<Map<number, GlobeCountryData>>(new Map());

  /* React state for UI overlays */
  const [tooltip, setTooltip] = useState<{ country: GlobeCountryData; x: number; y: number } | null>(null);
  const [containerW, setContainerW] = useState(400);
  const [zoomedCountry, setZoomedCountry] = useState<GlobeCountryData | null>(null);
  const [textureLoaded, setTextureLoaded] = useState(false);

  /* Derived data */
  const activeCountries = useMemo(() => countries.filter((c) => c.isActive), [countries]);
  const totalHospitals = useMemo(() => activeCountries.reduce((s, c) => s + c.hospitalCount, 0), [activeCountries]);
  const nepalData = useMemo(() => countries.find((c) => c.isHighlighted) || null, [countries]);

  /* ────────────────────────────────────────────────────────────────────
     Three.js Initialization — runs once, immediately on mount
     ──────────────────────────────────────────────────────────────────── */
  useEffect(() => {
    const container = canvasWrapRef.current;
    if (!container) return;

    /* Check WebGL */
    const testCanvas = document.createElement('canvas');
    const gl = testCanvas.getContext('webgl2') || testCanvas.getContext('webgl');
    if (!gl) return;

    const w = container.clientWidth;
    const h = container.clientHeight;
    if (w < 1 || h < 1) return;

    /* ── Scene ── */
    const scene = new THREE.Scene();

    /* ── Camera ── */
    const camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 100);
    camera.position.set(0, 0.2, 2.6);
    camera.lookAt(0, 0, 0);

    /* ── Renderer ── */
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0); // transparent
    container.appendChild(renderer.domElement);

    /* ── Lights ── */
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xfff8ee, 1.8);
    sunLight.position.set(5, 3, 5);
    scene.add(sunLight);

    const fillLight = new THREE.DirectionalLight(0x8ecae6, 0.4);
    fillLight.position.set(-4, -1, -3);
    scene.add(fillLight);

    /* ── Earth Group (rotated together) ── */
    const earthGroup = new THREE.Group();
    earthGroup.rotation.x = 0.25;
    earthGroup.rotation.y = -0.5;
    scene.add(earthGroup);

    /* ── Earth Sphere ── */
    const earthGeom = new THREE.SphereGeometry(1, 64, 48);

    /* Start with a bright, visible blue placeholder */
    const placeholderMat = new THREE.MeshPhongMaterial({
      color: 0x2277bb,
      emissive: 0x112244,
      shininess: 25,
    });
    const earthMesh = new THREE.Mesh(earthGeom, placeholderMat);
    earthGroup.add(earthMesh);

    /* ── Atmosphere glow (outer, BackSide) ── */
    const atmosGeom = new THREE.SphereGeometry(1.04, 48, 36);
    const atmosMat = new THREE.ShaderMaterial({
      vertexShader: `
        varying vec3 vNormal;
        varying vec3 vPosition;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          vPosition = (modelViewMatrix * vec4(position, 1.0)).xyz;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec3 vNormal;
        varying vec3 vPosition;
        void main() {
          vec3 viewDir = normalize(-vPosition);
          float rim = 1.0 - max(0.0, dot(viewDir, vNormal));
          float glow = pow(rim, 3.0) * 1.2;
          gl_FragColor = vec4(0.05, 0.58, 0.53, glow * 0.35);
        }
      `,
      transparent: true,
      side: THREE.BackSide,
      depthWrite: false,
    });
    scene.add(new THREE.Mesh(atmosGeom, atmosMat));

    /* ── Markers Group ── */
    const markersGroup = new THREE.Group();
    earthGroup.add(markersGroup);

    /* ── Store refs ── */
    const threeCtx = {
      renderer,
      scene,
      camera,
      earthGroup,
      earthMesh,
      markersGroup,
      rafId: 0,
      disposed: false,
    };
    threeRef.current = threeCtx;

    /* ── Load Earth Texture ── */
    const textureLoader = new THREE.TextureLoader();

    function applyTexture(tex: THREE.Texture) {
      if (threeCtx.disposed) return;
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
      const realMat = new THREE.MeshStandardMaterial({
        map: tex,
        roughness: 0.75,
        metalness: 0.05,
      });
      earthMesh.material = realMat;
      placeholderMat.dispose();
      setTextureLoaded(true);
    }

    /* Try local HD texture first */
    textureLoader.load(
      '/textures/earth-day-hd.jpg',
      (tex) => {
        applyTexture(tex);
      },
      undefined,
      () => {
        /* Fallback to SD local */
        textureLoader.load(
          '/textures/earth-day.jpg',
          (tex) => {
            applyTexture(tex);
          },
          undefined,
          () => {
            /* Fallback to CDN */
            textureLoader.load(
              'https://unpkg.com/three-globe/example/img/earth-day.jpg',
              (tex) => {
                applyTexture(tex);
              },
              undefined,
              () => {
                /* All texture sources failed, keeping placeholder */
                setTextureLoaded(true);
              },
            );
          },
        );
      },
    );

    /* ── Animation Loop ── */
    function animate() {
      if (threeCtx.disposed) return;
      threeCtx.rafId = requestAnimationFrame(animate);

      /* Auto-rotate */
      if (autoRotate.current && !isDragging.current && !zoomingToCountry.current) {
        earthGroup.rotation.y += 0.001;
      }

      /* Momentum */
      if (!isDragging.current && !autoRotate.current && !zoomingToCountry.current) {
        const m = momentum.current;
        if (Math.abs(m.x) > 0.0001 || Math.abs(m.y) > 0.0001) {
          earthGroup.rotation.y += m.x;
          earthGroup.rotation.x = Math.max(-0.8, Math.min(0.8, earthGroup.rotation.x + m.y));
          m.x *= 0.92;
          m.y *= 0.92;
        }
      }

      /* Smooth zoom */
      camera.position.z += (zoomTarget.current - camera.position.z) * 0.06;
      camera.position.y += (0.2 - camera.position.y) * 0.04;

      /* Zoom-to-country rotation */
      if (zoomingToCountry.current && targetRotY.current !== null) {
        let diff = targetRotY.current - earthGroup.rotation.y;
        while (diff > Math.PI) diff -= Math.PI * 2;
        while (diff < -Math.PI) diff += Math.PI * 2;
        earthGroup.rotation.y += diff * 0.04;
        if (targetRotX.current !== null) {
          earthGroup.rotation.x += (targetRotX.current - earthGroup.rotation.x) * 0.04;
        }
      }

      /* Marker visibility (hide when on back side) */
      for (let i = 0; i < markersGroup.children.length; i++) {
        const child = markersGroup.children[i];
        if (child.userData.isGlow || child.userData.isRing) continue;
        const wPos = new THREE.Vector3();
        child.getWorldPosition(wPos);
        const normal = wPos.clone().normalize();
        const toCamera = camera.position.clone().sub(wPos).normalize();
        child.visible = toCamera.dot(normal) > -0.15;
      }

      renderer.render(scene, camera);
    }
    threeCtx.rafId = requestAnimationFrame(animate);

    /* ── Resize handler ── */
    function onResize() {
      if (threeCtx.disposed) return;
      const cw = container.clientWidth;
      const ch = container.clientHeight;
      if (cw < 1 || ch < 1) return;
      camera.aspect = cw / ch;
      camera.updateProjectionMatrix();
      renderer.setSize(cw, ch);
      setContainerW(cw);
    }
    window.addEventListener('resize', onResize);
    setContainerW(w);

    /* ── Cleanup ── */
    return () => {
      threeCtx.disposed = true;
      cancelAnimationFrame(threeCtx.rafId);
      window.removeEventListener('resize', onResize);
      if (idleTimer.current) clearTimeout(idleTimer.current);

      /* Dispose Three.js resources */
      earthGeom.dispose();
      atmosGeom.dispose();
      atmosMat.dispose();
      renderer.dispose();

      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      threeRef.current = null;
    };
  }, []);

  /* ────────────────────────────────────────────────────────────────────
     Build markers when countries data arrives
     ──────────────────────────────────────────────────────────────────── */
  useEffect(() => {
    const ctx = threeRef.current;
    if (!ctx) return;
    const { markersGroup } = ctx;

    /* Clear old markers */
    while (markersGroup.children.length > 0) {
      const child = markersGroup.children[0];
      markersGroup.remove(child);
      child.traverse((obj) => {
        if ((obj as THREE.Mesh).geometry) (obj as THREE.Mesh).geometry.dispose();
        if ((obj as THREE.Mesh).material) {
          const mat = obj as THREE.Mesh;
          if (mat.material instanceof THREE.SpriteMaterial) mat.material.map?.dispose();
          (mat.material as THREE.Material).dispose();
        }
      });
    }
    markerMap.current.clear();

    /* Create new markers */
    for (const country of activeCountries) {
      const pos = latLngToVec3(country.latitude, country.longitude, 1.005);
      const isHL = country.isHighlighted;

      /* Pin group */
      const pin = new THREE.Group();
      const stemH = isHL ? 0.06 : 0.04;
      const headR = isHL ? 0.018 : 0.012;

      const stem = new THREE.Mesh(
        new THREE.CylinderGeometry(0.003, 0.005, stemH, 8),
        new THREE.MeshBasicMaterial({ color: isHL ? 0x07c2b8 : 0x0d9488, transparent: true, opacity: 0.9 }),
      );
      stem.position.y = stemH / 2;
      pin.add(stem);

      const head = new THREE.Mesh(
        new THREE.SphereGeometry(headR, 12, 12),
        new THREE.MeshBasicMaterial({ color: isHL ? 0x07c2b8 : 0x0d9488 }),
      );
      head.position.y = stemH + headR * 0.3;
      pin.add(head);

      pin.position.copy(pos);
      pin.userData.isMarker = true;
      markersGroup.add(pin);
      markerMap.current.set(head.id, country);

      /* Glow sprite */
      const glowCanvas = document.createElement('canvas');
      glowCanvas.width = 64;
      glowCanvas.height = 64;
      const gCtx = glowCanvas.getContext('2d')!;
      const grad = gCtx.createRadialGradient(32, 32, 0, 32, 32, 32);
      grad.addColorStop(0, isHL ? 'rgba(7,194,184,0.9)' : 'rgba(13,148,136,0.7)');
      grad.addColorStop(0.4, isHL ? 'rgba(7,194,184,0.2)' : 'rgba(13,148,136,0.15)');
      grad.addColorStop(1, 'rgba(0,0,0,0)');
      gCtx.fillStyle = grad;
      gCtx.fillRect(0, 0, 64, 64);

      const glowSprite = new THREE.Sprite(
        new THREE.SpriteMaterial({
          map: new THREE.CanvasTexture(glowCanvas),
          transparent: true,
          depthWrite: false,
          blending: THREE.AdditiveBlending,
        }),
      );
      glowSprite.position.copy(pos);
      glowSprite.position.y += stemH + headR * 0.5;
      glowSprite.scale.set(isHL ? 0.12 : 0.08, isHL ? 0.12 : 0.08, 1);
      glowSprite.userData.isGlow = true;
      markersGroup.add(glowSprite);
    }
  }, [activeCountries]);

  /* ────────────────────────────────────────────────────────────────────
     Pointer interaction handlers
     ──────────────────────────────────────────────────────────────────── */
  useEffect(() => {
    const el = canvasWrapRef.current;
    if (!el) return;

    let dragDist = 0;

    const onDown = (e: PointerEvent) => {
      isDragging.current = true;
      autoRotate.current = false;
      dragDist = 0;
      prevPointer.current = { x: e.clientX, y: e.clientY };
      momentum.current = { x: 0, y: 0 };
      el.setPointerCapture(e.pointerId);
      if (idleTimer.current) clearTimeout(idleTimer.current);
      /* Cancel zoom-to if dragging */
      if (zoomingToCountry.current) {
        zoomingToCountry.current = null;
        targetRotY.current = null;
        targetRotX.current = null;
        zoomTarget.current = 2.6;
        setZoomedCountry(null);
      }
    };

    const onMove = (e: PointerEvent) => {
      if (isDragging.current) {
        const dx = e.clientX - prevPointer.current.x;
        const dy = e.clientY - prevPointer.current.y;
        dragDist += Math.abs(dx) + Math.abs(dy);
        const g = threeRef.current?.earthGroup;
        if (g) {
          g.rotation.y += dx * 0.004;
          g.rotation.x = Math.max(-0.8, Math.min(0.8, g.rotation.x + dy * 0.004));
          momentum.current = { x: dx * 0.002, y: dy * 0.001 };
        }
        prevPointer.current = { x: e.clientX, y: e.clientY };
        setTooltip(null);
        el.style.cursor = 'grabbing';
        return;
      }

      /* Hover detection via raycasting */
      const ctx = threeRef.current;
      if (!ctx) return;
      const rect = el.getBoundingClientRect();
      const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const ny = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(new THREE.Vector2(nx, ny), ctx.camera);

      const meshes: THREE.Mesh[] = [];
      for (const marker of ctx.markersGroup.children) {
        if (!marker.userData.isMarker || !marker.visible) continue;
        marker.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) meshes.push(child as THREE.Mesh);
        });
      }
      const hits = raycaster.intersectObjects(meshes, false);

      if (hits.length > 0) {
        let obj: THREE.Object3D | null = hits[0].object;
        while (obj && !obj.userData.isMarker) obj = obj.parent;
        if (obj) {
          const headMesh = obj.children[1] as THREE.Mesh;
          const country = markerMap.current.get(headMesh.id);
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
      isDragging.current = false;
      el.style.cursor = 'grab';
      idleTimer.current = setTimeout(() => { autoRotate.current = true; }, 4000);
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      zoomTarget.current = Math.max(1.5, Math.min(5, zoomTarget.current + e.deltaY * 0.0006));
    };

    const onClick = (e: MouseEvent) => {
      if (dragDist > 8) return;
      const ctx = threeRef.current;
      if (!ctx) return;
      const rect = el.getBoundingClientRect();
      const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const ny = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(new THREE.Vector2(nx, ny), ctx.camera);

      const meshes: THREE.Mesh[] = [];
      for (const marker of ctx.markersGroup.children) {
        if (!marker.userData.isMarker || !marker.visible) continue;
        marker.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) meshes.push(child as THREE.Mesh);
        });
      }
      const hits = raycaster.intersectObjects(meshes, false);

      if (hits.length > 0) {
        let obj: THREE.Object3D | null = hits[0].object;
        while (obj && !obj.userData.isMarker) obj = obj.parent;
        if (obj) {
          const headMesh = obj.children[1] as THREE.Mesh;
          const country = markerMap.current.get(headMesh.id);
          if (!country) return;
          targetRotY.current = -country.longitude * (Math.PI / 180);
          targetRotX.current = country.latitude * (Math.PI / 180) * -0.4;
          zoomTarget.current = country.isHighlighted ? 1.7 : 1.9;
          zoomingToCountry.current = country.id;
          setZoomedCountry(country);
          setTooltip(null);
        }
      }
    };

    /* Touch pinch zoom */
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
        zoomTarget.current = Math.max(1.5, Math.min(5, zoomTarget.current + delta * 0.005));
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
      if (idleTimer.current) clearTimeout(idleTimer.current);
    };
  }, []);

  /* ─── Zoom out handler ─── */
  const handleZoomOut = useCallback(() => {
    zoomingToCountry.current = null;
    targetRotY.current = null;
    targetRotX.current = null;
    zoomTarget.current = 2.6;
    setZoomedCountry(null);
  }, []);

  /* ═══════════════════════════════════════════════════════════════════════════════
     Render
     ═══════════════════════════════════════════════════════════════════════════════ */
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

          {/* Right: 3D Globe Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.7, delay: 0.2, ease: 'easeOut' }}
            className="flex flex-1 items-center justify-center"
          >
            <div
              ref={canvasWrapRef}
              className="relative h-[300px] w-full max-w-[460px] sm:h-[360px] md:h-[420px] lg:h-[460px]"
              style={{ cursor: 'grab' }}
            >
              {/* Loading indicator */}
              {!textureLoaded && (
                <div className="pointer-events-none absolute bottom-3 left-3 z-20 flex items-center gap-1.5">
                  <div className="h-3 w-3 animate-spin rounded-full border border-danphe-accent/30 border-t-danphe-accent" />
                  <span className="text-[10px] text-danphe-text/30">Loading Earth...</span>
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
