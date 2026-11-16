"use client";

import React, { useEffect, useRef, useImperativeHandle, forwardRef } from "react";
import * as THREE from "three";
import { FBXLoader } from "three/addons/loaders/FBXLoader.js";

const EarthScene = forwardRef(function EarthScene(props, ref) {
  const mountRef = useRef(null);
  const connectionGroupRef = useRef(null);

  // GSAP ScrollTrigger
  useImperativeHandle(ref, () => ({
    setConnectionProgress: (progress) => {
      const group = connectionGroupRef.current;
      if (!group) return;

      // when earth reaches a certain position (>= 0.65 progress), the connections start to appear
      if (progress < 0.65) {
        group.visible = false;
        group.scale.set(0, 0, 0);
      } else {
        group.visible = true;
        // 0.65 to 0.85 between scale 0 to 1
        const growth = THREE.MathUtils.clamp((progress - 0.65) / 0.20, 0, 1);
        group.scale.setScalar(growth);
      }
    },
  }));

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    let disposed = false;
    let earth = null;
    let connectionGroup = null;

    let isDragging = false;
    let previousPointer = { x: 0, y: 0, time: 0 };
    let velocity = { x: 0, y: 0 };
    let autoRotate = true;

    // 1. Scene
    const scene = new THREE.Scene();

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      100
    );
    camera.position.set(0, 0, 5.5);

    // 3. Renderer #0a0a0a background blending with alpha: true for transparent background
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.NoToneMapping;
    renderer.toneMappingExposure = 1;

    container.appendChild(renderer.domElement);

    // 4. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.3);
    directionalLight.position.set(5, 3, 5);
    scene.add(directionalLight);

    const blueLight = new THREE.PointLight(0x3b82f6, 4.5, 16);
    blueLight.position.set(-4, 1, 3);
    scene.add(blueLight);

    // 5. Load Earth Model & Texture
    const loader = new FBXLoader();
    const textureLoader = new THREE.TextureLoader();

    // until earth model is loaded, use a fallback sphere with basic material
    const fallbackRadius = 1.72;
    const fallbackGeometry = new THREE.SphereGeometry(fallbackRadius, 64, 64);
    const fallbackMaterial = new THREE.MeshStandardMaterial({
      color: 0x1e3a8a,
      roughness: 0.8,
      metalness: 0.1,
    });
    const fallbackEarth = new THREE.Mesh(fallbackGeometry, fallbackMaterial);

    connectionGroup = createConnectionEffects(fallbackRadius);
    connectionGroup.visible = false;
    connectionGroup.scale.set(0, 0, 0);
    connectionGroupRef.current = connectionGroup;
    fallbackEarth.add(connectionGroup);

    earth = fallbackEarth;
    scene.add(earth);

    // FBX and texture loading
    Promise.all([
      loader.loadAsync("/models/Earth.fbx").catch(() => null),
      textureLoader.loadAsync("/models/earth-texture.jpg").catch(() => null),
    ]).then(([model, texture]) => {
      if (disposed) {
        if (model) disposeObject(model);
        if (texture) texture.dispose();
        return;
      }

      if (texture) {
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
        fallbackMaterial.map = texture;
        fallbackMaterial.color.set(0xffffff);
        fallbackMaterial.needsUpdate = true;
      }

      if (model) {
        if (texture) {
          model.traverse((child) => {
            if (!child.isMesh) return;
            child.material = new THREE.MeshStandardMaterial({
              map: texture,
              roughness: 1,
              metalness: 0,
            });
            child.material.needsUpdate = true;
          });
        }

        const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        const maxDimension = Math.max(size.x, size.y, size.z);

        model.position.sub(center);
        model.scale.setScalar(3.4 / maxDimension);

        fallbackEarth.remove(connectionGroup);
        scene.remove(fallbackEarth);

        const localRadius = 1.72 / model.scale.x;
        connectionGroup = createConnectionEffects(localRadius);
        connectionGroup.visible = connectionGroupRef.current?.visible || false;
        connectionGroup.scale.copy(
          connectionGroupRef.current?.scale || new THREE.Vector3(0, 0, 0)
        );
        connectionGroupRef.current = connectionGroup;

        model.add(connectionGroup);
        earth = model;
        scene.add(earth);
      }
    });

    // 6. mouse/touch interaction for rotating the earth
    const canvas = renderer.domElement;

    const handlePointerDown = (event) => {
      if (!earth) return;
      isDragging = true;
      autoRotate = false;

      velocity.x = 0;
      velocity.y = 0;

      previousPointer.x = event.clientX;
      previousPointer.y = event.clientY;
      previousPointer.time = performance.now();

      canvas.setPointerCapture(event.pointerId);
      canvas.style.cursor = "grabbing";
    };

    const handlePointerMove = (event) => {
      if (!isDragging || !earth) return;

      const now = performance.now();
      const elapsed = Math.max((now - previousPointer.time) / 1000, 0.001);

      const deltaX = event.clientX - previousPointer.x;
      const deltaY = event.clientY - previousPointer.y;

      const sensitivity = 0.005;
      const rotationX = deltaX * sensitivity;
      const rotationY = deltaY * sensitivity;

      earth.rotation.y += rotationX;
      earth.rotation.x += rotationY;

      velocity.x = rotationX / elapsed;
      velocity.y = rotationY / elapsed;

      const maxVelocity = 8;
      velocity.x = THREE.MathUtils.clamp(velocity.x, -maxVelocity, maxVelocity);
      velocity.y = THREE.MathUtils.clamp(velocity.y, -maxVelocity, maxVelocity);

      earth.rotation.x = THREE.MathUtils.clamp(
        earth.rotation.x,
        -Math.PI / 2,
        Math.PI / 2
      );

      previousPointer.x = event.clientX;
      previousPointer.y = event.clientY;
      previousPointer.time = now;
    };

    const handlePointerUp = () => {
      isDragging = false;
      canvas.style.cursor = "grab";
    };

    canvas.style.cursor = "grab";
    canvas.style.touchAction = "pan-y";

    canvas.addEventListener("pointerdown", handlePointerDown);
    canvas.addEventListener("pointermove", handlePointerMove);
    canvas.addEventListener("pointerup", handlePointerUp);
    canvas.addEventListener("pointercancel", handlePointerUp);

    // 7. resizeObserver to handle window resize
    const resizeObserver = new ResizeObserver(() => {
      const width = container.clientWidth;
      const height = container.clientHeight;
      if (!width || !height) return;

      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    });
    resizeObserver.observe(container);

    // 8. main animation loop
    const clock = new THREE.Clock();

    renderer.setAnimationLoop(() => {
      const delta = Math.min(clock.getDelta(), 0.05);

      if (earth) {
        if (!isDragging) {
          const damping = 2.0;
          earth.rotation.y += velocity.x * delta;
          earth.rotation.x += velocity.y * delta;

          earth.rotation.x = THREE.MathUtils.clamp(
            earth.rotation.x,
            -Math.PI / 2,
            Math.PI / 2
          );

          const friction = Math.exp(-damping * delta);
          velocity.x *= friction;
          velocity.y *= friction;

          if (Math.abs(velocity.x) < 0.01 && Math.abs(velocity.y) < 0.01) {
            velocity.x = 0;
            velocity.y = 0;
            autoRotate = true;
          }

          if (autoRotate) {
            earth.rotation.y += delta * 0.14; // auto rotation speed
          }
        }
      }

      // multiplayer connection effects animation
      const currentGroup = connectionGroupRef.current;
      if (currentGroup?.userData?.particles && currentGroup.visible) {
        const elapsed = clock.elapsedTime;
        currentGroup.userData.particles.forEach((particle) => {
          const progress = (elapsed * 0.12 + particle.offset) % 1;
          particle.mesh.position.copy(particle.curve.getPointAt(progress));
        });
      }

      renderer.render(scene, camera);
    });

    // cleanup
    return () => {
      disposed = true;
      resizeObserver.disconnect();
      renderer.setAnimationLoop(null);
      disposeObject(scene);

      canvas.removeEventListener("pointerdown", handlePointerDown);
      canvas.removeEventListener("pointermove", handlePointerMove);
      canvas.removeEventListener("pointerup", handlePointerUp);
      canvas.removeEventListener("pointercancel", handlePointerUp);

      renderer.dispose();
      renderer.forceContextLoss();

      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return <div ref={mountRef} className="relative h-full w-full" />;
});

export default EarthScene;

// ---------------------------------------------------------------------------
// multiplayer connection effects: arcs and moving particles
// ---------------------------------------------------------------------------
function createConnectionEffects(radius) {
  const group = new THREE.Group();
  // 1. (Nodes)
  const cities = {
    delhi: { lat: 28.61, lon: 77.20 },
    mumbai: { lat: 19.07, lon: 72.87 },
    tokyo: { lat: 35.67, lon: 139.65 },
    singapore: { lat: 1.35, lon: 103.81 },
    seoul: { lat: 37.56, lon: 126.97 },
    london: { lat: 51.50, lon: -0.12 },
    paris: { lat: 48.85, lon: 2.35 },
    frankfurt: { lat: 50.11, lon: 8.68 },
    dubai: { lat: 25.20, lon: 55.27 },
    nyc: { lat: 40.71, lon: -74.00 },
    sanFrancisco: { lat: 37.77, lon: -122.41 },
    toronto: { lat: 43.65, lon: -79.38 },
    saoPaulo: { lat: -23.55, lon: -46.63 },
    sydney: { lat: -33.86, lon: 151.20 },
    cairo: { lat: 30.04, lon: 31.23 },
  };
  const toVector = (lat, lon, r) => {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lon + 180) * (Math.PI / 180);
    return new THREE.Vector3(
      -r * Math.sin(phi) * Math.cos(theta),
      r * Math.cos(phi),
      r * Math.sin(phi) * Math.sin(theta)
    );
  };
  // 2. connections
  const connections = [
    ["delhi", "dubai"],
    ["delhi", "singapore"],
    ["delhi", "tokyo"],
    ["mumbai", "london"],
    ["dubai", "frankfurt"],
    ["frankfurt", "london"],
    ["london", "paris"],
    ["london", "nyc"],
    ["london", "toronto"],
    ["nyc", "sanFrancisco"],
    ["nyc", "saoPaulo"],
    ["sanFrancisco", "tokyo"],
    ["tokyo", "seoul"],
    ["tokyo", "singapore"],
    ["singapore", "sydney"],
    ["cairo", "dubai"],
    ["paris", "nyc"],
  ];
  // (Materials)
  const lineMaterial = new THREE.MeshBasicMaterial({
    color: 0x3b82f6,
    transparent: true,
    opacity: 0.85,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const nodeMaterial = new THREE.MeshBasicMaterial({ color: 0x60a5fa });
  const particleMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const nodeGeometry = new THREE.SphereGeometry(radius * 0.015, 12, 12);
  const particleGeometry = new THREE.SphereGeometry(radius * 0.02, 10, 10);
  // node (Dots)
  const plottedNodes = new Set();
  const particles = [];
  connections.forEach(([fromKey, toKey], index) => {
    const c1 = cities[fromKey];
    const c2 = cities[toKey];
    if (!c1 || !c2) return;
    const start = toVector(c1.lat, c1.lon, radius * 1.012);
    const end = toVector(c2.lat, c2.lon, radius * 1.012);
    
    [ { key: fromKey, pos: start }, { key: toKey, pos: end } ].forEach(({ key, pos }) => {
      if (!plottedNodes.has(key)) {
        plottedNodes.add(key);
        const node = new THREE.Mesh(nodeGeometry, nodeMaterial);
        node.position.copy(pos);
        group.add(node);
      }
    });
  
    const distance = start.distanceTo(end);
    const maxAltitude = Math.max(radius * 0.16, distance * 0.28); // दूरी के हिसाब से ऊंचाई तय होगी
    const curvePoints = [];
    const segments = 16;
    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      const currentDir = start.clone().lerp(end, t).normalize();
      const height = Math.sin(t * Math.PI) * maxAltitude + radius * 0.012;
      curvePoints.push(currentDir.multiplyScalar(radius + height));
    }
    const curve = new THREE.CatmullRomCurve3(curvePoints);
    const tubeGeometry = new THREE.TubeGeometry(curve, 36, radius * 0.0035, 6, false);
    const arcMesh = new THREE.Mesh(tubeGeometry, lineMaterial);
    group.add(arcMesh);
    const particle = new THREE.Mesh(particleGeometry, particleMaterial);
    group.add(particle);
    particles.push({
      mesh: particle,
      curve,
      offset: (index / connections.length) * 0.8,
    });
  });
  group.userData.particles = particles;
  return group;
}

function disposeObject(object) {
  const textures = new Set();
  const materials = new Set();

  object?.traverse?.((child) => {
    if (child.geometry) {
      child.geometry.dispose();
    }

    if (child.material) {
      const materialList = Array.isArray(child.material)
        ? child.material
        : [child.material];

      materialList.forEach((material) => {
        materials.add(material);

        Object.values(material).forEach((value) => {
          if (value?.isTexture) {
            textures.add(value);
          }
        });
      });
    }
  });

  textures.forEach((texture) => texture.dispose());
  materials.forEach((material) => material.dispose());
}