import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

/**
 * Robot3D — Interactive Real-time 3D AI-9 Mascot
 * Faithfully constructs the 3D structure of the AI-9 robot from the official artwork:
 * - Ceramic white helmet with glossy dark visor
 * - Emissive glowing cyan smiling eyes (^ ^) with live blinking animation
 * - Cyan ear pods with dual antennae
 * - Sculpted white/blue chest chassis with glowing "AI-9" Arc Reactor
 * - Waving articulated robotic right arm & gesture left arm
 * - Lower hover pod with dual pulsing jet thruster exhaust flames
 * - Floating orbiting holographic UI HUD cards ("AI", Code cards, Metrics)
 * - Smooth cursor tracking / head turn and responsive hover physics
 */
export default function Robot3D({
  className = '',
  size = 'hero', // 'hero' | 'auth' | 'card'
  interactive = true,
  autoRotate = false,
}) {
  const containerRef = useRef(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Dimensions
    let width = container.clientWidth || 400;
    let height = container.clientHeight || 450;

    // ─── Scene, Camera, Renderer ───
    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 100);
    // Camera distance based on size variant
    if (size === 'hero') {
      camera.position.set(0, 0.2, 5.2);
    } else if (size === 'auth') {
      camera.position.set(0, 0.1, 4.8);
    } else {
      camera.position.set(0, 0, 5.4);
    }

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    container.appendChild(renderer.domElement);

    // ─── Materials ───
    // 1. Ceramic Pearl White Armor
    const whiteArmorMat = new THREE.MeshPhysicalMaterial({
      color: 0xf4f7fb,
      metalness: 0.08,
      roughness: 0.18,
      clearcoat: 0.95,
      clearcoatRoughness: 0.1,
    });

    // 2. High-Tech Cobalt Blue Accent
    const blueAccentMat = new THREE.MeshPhysicalMaterial({
      color: 0x1d4ed8,
      metalness: 0.5,
      roughness: 0.22,
      clearcoat: 0.8,
      clearcoatRoughness: 0.15,
    });

    // 3. Dark Glossy Obsidian Visor
    const visorMat = new THREE.MeshStandardMaterial({
      color: 0x070b14,
      metalness: 0.9,
      roughness: 0.08,
    });

    // 4. Glowing Cyan Emissive
    const cyanGlowMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x00f0ff,
      emissiveIntensity: 2.5,
      roughness: 0.2,
    });

    // 5. Dark Gunmetal Joints & Bellows
    const darkJointMat = new THREE.MeshStandardMaterial({
      color: 0x181a20,
      metalness: 0.8,
      roughness: 0.5,
    });

    // 6. Thruster Jet Flame Material
    const flameMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.85,
    });

    const innerFlameMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.95,
    });

    // ─── Lighting ───
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);

    // Cool key light
    const keyLight = new THREE.DirectionalLight(0xdbeafe, 2.8);
    keyLight.position.set(4, 5, 5);
    scene.add(keyLight);

    // Warm Gold rim light (matching Hexona theme)
    const goldRimLight = new THREE.DirectionalLight(0xd4af37, 2.2);
    goldRimLight.position.set(-5, 2, -3);
    scene.add(goldRimLight);

    // Bottom bounce light
    const blueFill = new THREE.DirectionalLight(0x0ea5e9, 1.8);
    blueFill.position.set(0, -5, 2);
    scene.add(blueFill);

    // Reactor Core PointLight
    const reactorLight = new THREE.PointLight(0x00f0ff, 2.2, 3.5);
    reactorLight.position.set(0, 0.1, 0.7);
    scene.add(reactorLight);

    // Thruster Bottom PointLight
    const thrusterLight = new THREE.PointLight(0x38bdf8, 3.0, 4);
    thrusterLight.position.set(0, -1.5, 0);
    scene.add(thrusterLight);

    // ─── Master Groups ───
    const robotRoot = new THREE.Group();
    scene.add(robotRoot);

    const bodyBobGroup = new THREE.Group();
    robotRoot.add(bodyBobGroup);

    // ═══════════════════════════════════════════════════════
    // 1. HEAD & VISOR
    // ═══════════════════════════════════════════════════════
    const headGroup = new THREE.Group();
    headGroup.position.set(0, 0.88, 0);
    bodyBobGroup.add(headGroup);

    // Helmet shell (smooth rounded oblong)
    const helmetGeo = new THREE.SphereGeometry(0.72, 32, 32);
    helmetGeo.scale(1.15, 1.0, 1.0);
    const helmetMesh = new THREE.Mesh(helmetGeo, whiteArmorMat);
    headGroup.add(helmetMesh);

    // Helmet blue accent band across forehead/back
    const blueBandGeo = new THREE.TorusGeometry(0.71, 0.04, 16, 64);
    blueBandGeo.rotateX(Math.PI / 2);
    blueBandGeo.scale(1.16, 1.0, 0.4);
    const blueBand = new THREE.Mesh(blueBandGeo, blueAccentMat);
    blueBand.position.set(0, 0.1, 0);
    headGroup.add(blueBand);

    // Dark Visor Face Screen (curved front plate)
    const visorGeo = new THREE.SphereGeometry(0.68, 32, 24, 0, Math.PI);
    visorGeo.scale(1.05, 0.85, 0.55);
    const visorMesh = new THREE.Mesh(visorGeo, visorMat);
    visorMesh.position.set(0, 0, 0.28);
    visorMesh.rotation.y = -Math.PI / 2;
    headGroup.add(visorMesh);

    // Visor Outer Blue Bezel Ring
    const visorBezelGeo = new THREE.TorusGeometry(0.58, 0.035, 16, 48);
    visorBezelGeo.scale(1.1, 0.82, 1);
    const visorBezel = new THREE.Mesh(visorBezelGeo, blueAccentMat);
    visorBezel.position.set(0, 0.01, 0.54);
    headGroup.add(visorBezel);

    // ── Visor Dynamic Eye Canvas ──
    const eyeCanvas = document.createElement('canvas');
    eyeCanvas.width = 512;
    eyeCanvas.height = 256;
    const eyeCtx = eyeCanvas.getContext('2d');

    const eyeTexture = new THREE.CanvasTexture(eyeCanvas);
    eyeTexture.colorSpace = THREE.SRGBColorSpace;

    const eyeMat = new THREE.MeshBasicMaterial({
      map: eyeTexture,
      transparent: true,
      opacity: 0.98,
      blending: THREE.AdditiveBlending,
    });

    const eyePlaneGeo = new THREE.PlaneGeometry(0.85, 0.42);
    const eyePlane = new THREE.Mesh(eyePlaneGeo, eyeMat);
    eyePlane.position.set(0, 0.02, 0.56);
    headGroup.add(eyePlane);

    // Function to draw animated smiling curved eyes (^ ^)
    const drawEyes = (blinkProgress = 0) => {
      eyeCtx.clearRect(0, 0, 512, 256);

      eyeCtx.strokeStyle = '#00f0ff';
      eyeCtx.shadowColor = '#00e5ff';
      eyeCtx.shadowBlur = 24;
      eyeCtx.lineWidth = 18;
      eyeCtx.lineCap = 'round';

      const h = Math.max(2, 38 * (1 - blinkProgress));

      // Left smiling eye arc
      eyeCtx.beginPath();
      eyeCtx.ellipse(170, 130, 42, h, 0, Math.PI, 0, false);
      eyeCtx.stroke();

      // Right smiling eye arc
      eyeCtx.beginPath();
      eyeCtx.ellipse(342, 130, 42, h, 0, Math.PI, 0, false);
      eyeCtx.stroke();

      eyeTexture.needsUpdate = true;
    };
    drawEyes(0);

    // ── Headphone Ear Pods ──
    const createEarPod = (side) => {
      const earGroup = new THREE.Group();
      earGroup.position.set(side * 0.84, 0, 0);

      // Outer white cap
      const capGeo = new THREE.CylinderGeometry(0.24, 0.24, 0.12, 32);
      capGeo.rotateZ(Math.PI / 2);
      const cap = new THREE.Mesh(capGeo, whiteArmorMat);
      earGroup.add(cap);

      // Inner cyan glowing ring
      const earRingGeo = new THREE.TorusGeometry(0.18, 0.025, 16, 32);
      earRingGeo.rotateY(Math.PI / 2);
      const earRing = new THREE.Mesh(earRingGeo, cyanGlowMat);
      earRing.position.set(side * 0.065, 0, 0);
      earGroup.add(earRing);

      // Blue ear socket
      const socketGeo = new THREE.SphereGeometry(0.18, 16, 16);
      socketGeo.scale(side * 0.6, 1, 1);
      const socket = new THREE.Mesh(socketGeo, blueAccentMat);
      earGroup.add(socket);

      // Cute Antenna on top of ear
      const antennaPoleGeo = new THREE.CylinderGeometry(0.018, 0.022, 0.42, 16);
      const antennaPole = new THREE.Mesh(antennaPoleGeo, whiteArmorMat);
      antennaPole.position.set(0, 0.32, 0);
      antennaPole.rotation.z = side * -0.28;
      earGroup.add(antennaPole);

      // Antenna Glowing Tip
      const tipGeo = new THREE.SphereGeometry(0.045, 16, 16);
      const tip = new THREE.Mesh(tipGeo, cyanGlowMat);
      tip.position.set(side * -0.1, 0.52, 0);
      earGroup.add(tip);

      return earGroup;
    };

    headGroup.add(createEarPod(-1));
    headGroup.add(createEarPod(1));

    // Neck joint
    const neckGeo = new THREE.CylinderGeometry(0.24, 0.28, 0.22, 32);
    const neck = new THREE.Mesh(neckGeo, darkJointMat);
    neck.position.set(0, -0.62, 0);
    headGroup.add(neck);

    // ═══════════════════════════════════════════════════════
    // 2. TORSO & CHEST REACTOR
    // ═══════════════════════════════════════════════════════
    const torsoGroup = new THREE.Group();
    torsoGroup.position.set(0, -0.05, 0);
    bodyBobGroup.add(torsoGroup);

    // Main chest armor hull (white aerodynamic pod)
    const chestGeo = new THREE.SphereGeometry(0.68, 32, 32);
    chestGeo.scale(1.0, 1.15, 0.88);
    const chestMesh = new THREE.Mesh(chestGeo, whiteArmorMat);
    torsoGroup.add(chestMesh);

    // Blue side flank trims
    const flankGeo = new THREE.TorusGeometry(0.55, 0.08, 16, 32, Math.PI * 0.9);
    flankGeo.rotateZ(Math.PI / 2);
    flankGeo.rotateY(Math.PI / 2);
    const leftFlank = new THREE.Mesh(flankGeo, blueAccentMat);
    leftFlank.position.set(-0.38, 0, -0.05);
    torsoGroup.add(leftFlank);

    const rightFlank = new THREE.Mesh(flankGeo, blueAccentMat);
    rightFlank.position.set(0.38, 0, -0.05);
    rightFlank.rotation.y = -Math.PI / 2;
    torsoGroup.add(rightFlank);

    // ── Chest Arc Reactor ──
    const reactorOuterRingGeo = new THREE.TorusGeometry(0.18, 0.03, 16, 32);
    const reactorOuterRing = new THREE.Mesh(reactorOuterRingGeo, blueAccentMat);
    reactorOuterRing.position.set(0, 0.08, 0.58);
    torsoGroup.add(reactorOuterRing);

    const reactorCoreGeo = new THREE.CircleGeometry(0.14, 32);
    const reactorCore = new THREE.Mesh(reactorCoreGeo, cyanGlowMat);
    reactorCore.position.set(0, 0.08, 0.59);
    torsoGroup.add(reactorCore);

    // Inner bright core
    const innerCoreGeo = new THREE.CircleGeometry(0.06, 24);
    const innerCore = new THREE.Mesh(
      innerCoreGeo,
      new THREE.MeshBasicMaterial({ color: 0xffffff })
    );
    innerCore.position.set(0, 0.08, 0.60);
    torsoGroup.add(innerCore);

    // "AI-9" Insignia Decal on chest (Canvas Texture)
    const logoCanvas = document.createElement('canvas');
    logoCanvas.width = 256;
    logoCanvas.height = 128;
    const logoCtx = logoCanvas.getContext('2d');
    logoCtx.fillStyle = '#1e3a8a';
    logoCtx.font = 'bold 54px Orbitron, sans-serif';
    logoCtx.textAlign = 'center';
    logoCtx.textBaseline = 'middle';
    logoCtx.fillText('AI-9', 128, 64);

    const logoTexture = new THREE.CanvasTexture(logoCanvas);
    const logoMat = new THREE.MeshBasicMaterial({
      map: logoTexture,
      transparent: true,
      opacity: 0.9,
    });
    const logoPlane = new THREE.Mesh(new THREE.PlaneGeometry(0.36, 0.18), logoMat);
    logoPlane.position.set(0.25, 0.22, 0.55);
    logoPlane.rotation.y = 0.2;
    torsoGroup.add(logoPlane);

    // ═══════════════════════════════════════════════════════
    // 3. WAIST BELLOWS & LOWER JET THRUSTER POD
    // ═══════════════════════════════════════════════════════
    // Waist flexible bellow rings
    for (let r = 0; r < 3; r++) {
      const ringGeo = new THREE.TorusGeometry(0.38 - r * 0.04, 0.04, 16, 32);
      ringGeo.rotateX(Math.PI / 2);
      const ring = new THREE.Mesh(ringGeo, darkJointMat);
      ring.position.set(0, -0.68 - r * 0.09, 0);
      torsoGroup.add(ring);
    }

    // Floating Pelvis Armor Pod
    const pelvisGeo = new THREE.ConeGeometry(0.48, 0.62, 32);
    pelvisGeo.scale(1, -1, 0.85); // inverted tapered pod
    const pelvisMesh = new THREE.Mesh(pelvisGeo, whiteArmorMat);
    pelvisMesh.position.set(0, -1.05, 0);
    torsoGroup.add(pelvisMesh);

    // Pelvis blue trim
    const pelvisBandGeo = new THREE.TorusGeometry(0.45, 0.035, 16, 32);
    pelvisBandGeo.rotateX(Math.PI / 2);
    const pelvisBand = new THREE.Mesh(pelvisBandGeo, blueAccentMat);
    pelvisBand.position.set(0, -0.92, 0);
    torsoGroup.add(pelvisBand);

    // Dual Rocket Thruster Nozzles
    const leftNozzleGroup = new THREE.Group();
    leftNozzleGroup.position.set(-0.22, -1.35, 0);
    torsoGroup.add(leftNozzleGroup);

    const rightNozzleGroup = new THREE.Group();
    rightNozzleGroup.position.set(0.22, -1.35, 0);
    torsoGroup.add(rightNozzleGroup);

    [leftNozzleGroup, rightNozzleGroup].forEach((nozzleGroup) => {
      // Dark metal bell nozzle
      const nozzleGeo = new THREE.CylinderGeometry(0.12, 0.08, 0.22, 24);
      const nozzle = new THREE.Mesh(nozzleGeo, darkJointMat);
      nozzleGroup.add(nozzle);

      // Cyan glowing nozzle rim
      const rimGeo = new THREE.TorusGeometry(0.12, 0.02, 16, 24);
      rimGeo.rotateX(Math.PI / 2);
      const rim = new THREE.Mesh(rimGeo, cyanGlowMat);
      rim.position.set(0, -0.1, 0);
      nozzleGroup.add(rim);

      // Outer jet flame cone
      const flameGeo = new THREE.ConeGeometry(0.15, 0.75, 24);
      flameGeo.rotateX(Math.PI);
      const flame = new THREE.Mesh(flameGeo, flameMat);
      flame.position.set(0, -0.45, 0);
      flame.name = 'flame';
      nozzleGroup.add(flame);

      // Inner intense core flame
      const innerFlameGeo = new THREE.ConeGeometry(0.08, 0.5, 24);
      innerFlameGeo.rotateX(Math.PI);
      const innerFlame = new THREE.Mesh(innerFlameGeo, innerFlameMat);
      innerFlame.position.set(0, -0.32, 0);
      innerFlame.name = 'innerFlame';
      nozzleGroup.add(innerFlame);
    });

    // ═══════════════════════════════════════════════════════
    // 4. ARTICULATED ROBOT ARMS
    // ═══════════════════════════════════════════════════════
    // ── RIGHT ARM: Raised & Waving Hello! ──
    const rightArmPivot = new THREE.Group();
    rightArmPivot.position.set(0.68, 0.15, 0);
    torsoGroup.add(rightArmPivot);

    // Shoulder ball joint
    const rShoulder = new THREE.Mesh(new THREE.SphereGeometry(0.16, 24, 24), blueAccentMat);
    rightArmPivot.add(rShoulder);

    // White Shoulder pauldron cap
    const rPaul = new THREE.Mesh(new THREE.SphereGeometry(0.2, 16, 16, 0, Math.PI), whiteArmorMat);
    rPaul.rotation.y = Math.PI / 2;
    rPaul.position.set(0.05, 0.05, 0);
    rightArmPivot.add(rPaul);

    // Upper arm (raised up & outward)
    const rUpperArmGeo = new THREE.CylinderGeometry(0.1, 0.09, 0.44, 24);
    const rUpperArm = new THREE.Mesh(rUpperArmGeo, whiteArmorMat);
    rUpperArm.position.set(0.18, 0.18, 0);
    rUpperArm.rotation.z = -0.75;
    rightArmPivot.add(rUpperArm);

    // Elbow joint
    const rElbow = new THREE.Mesh(new THREE.SphereGeometry(0.11, 20, 20), blueAccentMat);
    rElbow.position.set(0.33, 0.35, 0);
    rightArmPivot.add(rElbow);

    // Forearm + Hand (waves back and forth in animation loop)
    const rForearmGroup = new THREE.Group();
    rForearmGroup.position.set(0.33, 0.35, 0);
    rightArmPivot.add(rForearmGroup);

    const rForearmGeo = new THREE.CylinderGeometry(0.11, 0.09, 0.46, 24);
    const rForearm = new THREE.Mesh(rForearmGeo, whiteArmorMat);
    rForearm.position.set(0.08, 0.22, 0.08);
    rForearm.rotation.z = 0.2;
    rForearm.rotation.x = -0.2;
    rForearmGroup.add(rForearm);

    // Cyan glowing wrist ring
    const rWristRingGeo = new THREE.TorusGeometry(0.095, 0.018, 16, 24);
    rWristRingGeo.rotateX(Math.PI / 2);
    const rWristRing = new THREE.Mesh(rWristRingGeo, cyanGlowMat);
    rWristRing.position.set(0.12, 0.44, 0.12);
    rForearmGroup.add(rWristRing);

    // Palm
    const rHandGroup = new THREE.Group();
    rHandGroup.position.set(0.14, 0.52, 0.14);
    rHandGroup.rotation.y = -0.3;
    rForearmGroup.add(rHandGroup);

    const palmGeo = new THREE.BoxGeometry(0.18, 0.18, 0.08);
    const palm = new THREE.Mesh(palmGeo, whiteArmorMat);
    rHandGroup.add(palm);

    // Articulated robotic waving fingers
    const createFinger = (xOffset, length, angle) => {
      const fingerGroup = new THREE.Group();
      fingerGroup.position.set(xOffset, 0.09, 0);
      fingerGroup.rotation.z = angle;

      const seg1 = new THREE.Mesh(new THREE.CylinderGeometry(0.024, 0.024, length * 0.55, 12), whiteArmorMat);
      seg1.position.set(0, length * 0.28, 0);
      fingerGroup.add(seg1);

      const knuckle = new THREE.Mesh(new THREE.SphereGeometry(0.026, 12, 12), blueAccentMat);
      knuckle.position.set(0, length * 0.55, 0);
      fingerGroup.add(knuckle);

      const seg2 = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.016, length * 0.45, 12), whiteArmorMat);
      seg2.position.set(0, length * 0.78, 0);
      fingerGroup.add(seg2);

      return fingerGroup;
    };

    rHandGroup.add(createFinger(-0.065, 0.17, 0.12)); // Pinky
    rHandGroup.add(createFinger(-0.022, 0.21, 0.05)); // Ring
    rHandGroup.add(createFinger(0.022, 0.22, -0.05)); // Middle
    rHandGroup.add(createFinger(0.065, 0.19, -0.15)); // Index

    // Thumb
    const thumb = createFinger(0.08, 0.14, -0.7);
    thumb.position.set(0.09, -0.02, 0.02);
    rHandGroup.add(thumb);

    // ── LEFT ARM: Welcoming Gesture Forward ──
    const leftArmPivot = new THREE.Group();
    leftArmPivot.position.set(-0.68, 0.15, 0);
    torsoGroup.add(leftArmPivot);

    const lShoulder = new THREE.Mesh(new THREE.SphereGeometry(0.16, 24, 24), blueAccentMat);
    leftArmPivot.add(lShoulder);

    const lPaul = new THREE.Mesh(new THREE.SphereGeometry(0.2, 16, 16, 0, Math.PI), whiteArmorMat);
    lPaul.rotation.y = -Math.PI / 2;
    lPaul.position.set(-0.05, 0.05, 0);
    leftArmPivot.add(lPaul);

    // Upper arm curved down & forward
    const lUpperArmGeo = new THREE.CylinderGeometry(0.1, 0.09, 0.44, 24);
    const lUpperArm = new THREE.Mesh(lUpperArmGeo, whiteArmorMat);
    lUpperArm.position.set(-0.16, -0.15, 0.1);
    lUpperArm.rotation.z = 0.55;
    lUpperArm.rotation.x = 0.35;
    leftArmPivot.add(lUpperArm);

    // Forearm forward welcoming
    const lForearmGeo = new THREE.CylinderGeometry(0.1, 0.085, 0.44, 24);
    const lForearm = new THREE.Mesh(lForearmGeo, whiteArmorMat);
    lForearm.position.set(-0.25, -0.32, 0.38);
    lForearm.rotation.z = -0.4;
    lForearm.rotation.x = -1.1;
    leftArmPivot.add(lForearm);

    // Left hand open towards user
    const lHand = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.16, 0.07), whiteArmorMat);
    lHand.position.set(-0.29, -0.32, 0.62);
    lHand.rotation.x = -0.8;
    lHand.rotation.y = 0.3;
    leftArmPivot.add(lHand);

    // ═══════════════════════════════════════════════════════
    // 5. FLOATING HOLOGRAPHIC HUD CARDS (Matching Artwork!)
    // ═══════════════════════════════════════════════════════
    const hudGroup = new THREE.Group();
    robotRoot.add(hudGroup);

    // Helper to generate dynamic glass HUD textures
    const createHudCard = (type, w = 256, h = 180) => {
      const c = document.createElement('canvas');
      c.width = w;
      c.height = h;
      const ctx = c.getContext('2d');

      // Glass dark backdrop
      ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
      ctx.roundRect(4, 4, w - 8, h - 8, 16);
      ctx.fill();

      // Border glow
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.7)';
      ctx.lineWidth = 4;
      ctx.roundRect(4, 4, w - 8, h - 8, 16);
      ctx.stroke();

      if (type === 'ai-badge') {
        // Hexagon "AI" badge
        ctx.fillStyle = '#38bdf8';
        ctx.font = 'bold 74px Orbitron, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('AI', w / 2, h / 2);
      } else if (type === 'code-widget') {
        // Window dots
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(28, 28, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#eab308';
        ctx.beginPath();
        ctx.arc(50, 28, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#22c55e';
        ctx.beginPath();
        ctx.arc(72, 28, 8, 0, Math.PI * 2);
        ctx.fill();

        // Code lines
        ctx.fillStyle = 'rgba(56, 189, 248, 0.85)';
        ctx.fillRect(28, 60, 160, 16);
        ctx.fillStyle = 'rgba(212, 175, 55, 0.8)';
        ctx.fillRect(28, 90, 120, 16);
        ctx.fillStyle = 'rgba(148, 163, 184, 0.6)';
        ctx.fillRect(28, 120, 180, 14);
      } else if (type === 'user-pill') {
        // User Pill with Icon & text lines
        ctx.fillStyle = 'rgba(56, 189, 248, 0.9)';
        ctx.beginPath();
        ctx.arc(42, h / 2, 20, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#fff';
        ctx.fillRect(78, 38, 110, 14);
        ctx.fillStyle = 'rgba(212, 175, 55, 0.85)';
        ctx.fillRect(78, 62, 70, 12);
      }

      const tex = new THREE.CanvasTexture(c);
      const mat = new THREE.MeshBasicMaterial({
        map: tex,
        transparent: true,
        opacity: 0.9,
        side: THREE.DoubleSide,
      });

      const plane = new THREE.Mesh(new THREE.PlaneGeometry(w / 280, h / 280), mat);
      return plane;
    };

    // Card 1: Top-Right "AI" Badge
    const aiBadge1 = createHudCard('ai-badge', 180, 150);
    aiBadge1.position.set(1.5, 1.2, -0.3);
    aiBadge1.rotation.y = -0.35;
    hudGroup.add(aiBadge1);

    // Card 2: Top-Left "AI" Badge
    const aiBadge2 = createHudCard('ai-badge', 160, 140);
    aiBadge2.position.set(-1.4, 0.9, -0.4);
    aiBadge2.rotation.y = 0.35;
    hudGroup.add(aiBadge2);

    // Card 3: Right Floating Code Window
    const codeCard = createHudCard('code-widget', 240, 170);
    codeCard.position.set(1.65, 0.3, 0.2);
    codeCard.rotation.y = -0.45;
    codeCard.rotation.z = 0.05;
    hudGroup.add(codeCard);

    // Card 4: Right Lower Pill Widget
    const pillCard = createHudCard('user-pill', 210, 100);
    pillCard.position.set(1.45, -0.45, 0.4);
    pillCard.rotation.y = -0.38;
    hudGroup.add(pillCard);

    // Floating Data Particle Sparks
    const sparkCount = 35;
    const sparkGeo = new THREE.BufferGeometry();
    const sparkPos = new Float32Array(sparkCount * 3);
    for (let i = 0; i < sparkCount * 3; i += 3) {
      sparkPos[i] = (Math.random() - 0.5) * 4.5;
      sparkPos[i + 1] = (Math.random() - 0.5) * 4.0;
      sparkPos[i + 2] = (Math.random() - 0.5) * 2.5;
    }
    sparkGeo.setAttribute('position', new THREE.BufferAttribute(sparkPos, 3));
    const sparkMat = new THREE.PointsMaterial({
      color: 0x38bdf8,
      size: 0.06,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
    });
    const sparks = new THREE.Points(sparkGeo, sparkMat);
    scene.add(sparks);

    // ═══════════════════════════════════════════════════════
    // 6. ANIMATION & INTERACTION LOOP
    // ═══════════════════════════════════════════════════════
    let targetHeadRotY = 0;
    let targetHeadRotX = 0;
    let targetBodyRotY = 0;
    const clock = new THREE.Clock();

    const handleMouseMove = (e) => {
      if (!interactive) return;
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      targetHeadRotY = x * 0.45;
      targetHeadRotX = -y * 0.35;
      targetBodyRotY = x * 0.25;
    };

    window.addEventListener('mousemove', handleMouseMove);

    // Eye blinking timer
    let blinkTimer = 0;

    let animId;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // 1. Hover Bobbing (sinusoidal float)
      const hoverOffset = Math.sin(elapsedTime * 2.2) * 0.12;
      bodyBobGroup.position.y = hoverOffset;
      bodyBobGroup.rotation.z = Math.sin(elapsedTime * 1.5) * 0.03;

      // 2. Head & Torso smooth mouse tracking
      headGroup.rotation.y += (targetHeadRotY - headGroup.rotation.y) * 0.08;
      headGroup.rotation.x += (targetHeadRotX - headGroup.rotation.x) * 0.08;
      bodyBobGroup.rotation.y += (targetBodyRotY - bodyBobGroup.rotation.y) * 0.05;

      if (autoRotate) {
        robotRoot.rotation.y = Math.sin(elapsedTime * 0.5) * 0.2;
      }

      // 3. Right Arm Waving Hello
      const wave = Math.sin(elapsedTime * 4.5) * 0.24;
      rForearmGroup.rotation.z = wave;
      rHandGroup.rotation.z = wave * 0.4;

      // 4. Jet Exhaust Flicker & Pulsing
      const flameFlicker = 1.0 + (Math.random() - 0.5) * 0.25;
      leftNozzleGroup.traverse((child) => {
        if (child.name === 'flame') child.scale.set(flameFlicker, flameFlicker * 1.1, flameFlicker);
      });
      rightNozzleGroup.traverse((child) => {
        if (child.name === 'flame') child.scale.set(flameFlicker, flameFlicker * 1.1, flameFlicker);
      });
      thrusterLight.intensity = 2.8 + Math.sin(elapsedTime * 12) * 0.6;
      reactorLight.intensity = 2.0 + Math.sin(elapsedTime * 3) * 0.5;

      // 5. Floating HUD Orbit & Parallax
      aiBadge1.position.y = 1.2 + Math.sin(elapsedTime * 1.8 + 1) * 0.08;
      aiBadge2.position.y = 0.9 + Math.sin(elapsedTime * 1.6 + 2) * 0.08;
      codeCard.position.y = 0.3 + Math.sin(elapsedTime * 1.5 + 3) * 0.06;
      pillCard.position.y = -0.45 + Math.sin(elapsedTime * 1.7 + 4) * 0.06;

      // 6. Blink Animation Cycle
      blinkTimer += 0.016;
      if (blinkTimer > 3.8) {
        const progress = (blinkTimer - 3.8) / 0.16; // 160ms blink
        if (progress <= 1) {
          drawEyes(Math.sin(progress * Math.PI));
        } else {
          drawEyes(0);
          blinkTimer = 0;
        }
      }

      // 7. Sparks drift
      sparks.rotation.y = elapsedTime * 0.05;

      renderer.render(scene, camera);
    };

    animate();
    setLoaded(true);

    // ── Resize Observer ──
    const handleResize = () => {
      if (!container) return;
      width = container.clientWidth;
      height = container.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    // ── Cleanup ──
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('mousemove', handleMouseMove);
      resizeObserver.disconnect();
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
      scene.clear();
    };
  }, [size, interactive, autoRotate]);

  return (
    <div
      ref={containerRef}
      className={`robot-3d-wrapper ${className}`}
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        minHeight: size === 'hero' ? '460px' : size === 'auth' ? '380px' : '220px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'visible',
      }}
    >
      {!loaded && (
        <div
          style={{
            position: 'absolute',
            color: 'var(--gold-400)',
            fontFamily: 'var(--font-accent)',
            fontSize: '0.85rem',
            letterSpacing: '0.1em',
          }}
        >
          INITIALIZING AI-9 3D CHASSIS...
        </div>
      )}
    </div>
  );
}
