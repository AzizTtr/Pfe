import {
  Directive, ElementRef, OnDestroy, OnInit, NgZone, Renderer2, inject
} from '@angular/core';
import * as THREE from 'three';

/**
 * Directive qui monte un cristal Three.js translucide dans l'élément hôte.
 *
 * Utilisation : <div class="..." aqHeroCrystal></div>
 *
 * Le cristal flotte, tourne lentement et réagit au mouvement de la souris.
 */
@Directive({
  selector: '[aqHeroCrystal]',
  standalone: true
})
export class HeroCrystalDirective implements OnInit, OnDestroy {
  private host = inject(ElementRef<HTMLElement>);
  private zone = inject(NgZone);
  private renderer2 = inject(Renderer2);

  private renderer!: THREE.WebGLRenderer;
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private rafId = 0;
  private resizeListener?: () => void;
  private mouseListener?: (e: MouseEvent) => void;
  private mouse = { x: 0, y: 0, tx: 0, ty: 0 };
  private t0 = 0;

  ngOnInit(): void {
    this.zone.runOutsideAngular(() => this.init());
  }

  private init(): void {
    const el = this.host.nativeElement;
    const w = el.clientWidth || 400;
    const h = el.clientHeight || 400;

    this.scene  = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 100);
    this.camera.position.z = 5.2;

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(w, h);
    this.renderer2.appendChild(el, this.renderer.domElement);

    // Lights
    this.scene.add(new THREE.AmbientLight(0xffffff, 0.4));
    const dir1 = new THREE.DirectionalLight(0x10b981, 1.2); dir1.position.set(3, 4, 5);
    const dir2 = new THREE.DirectionalLight(0x3b82f6, 1.0); dir2.position.set(-4, -2, 3);
    const pt   = new THREE.PointLight(0x6ee7b7, 1.5, 12);   pt.position.set(0, 2, 3);
    this.scene.add(dir1, dir2, pt);

    // Crystal
    const geo = new THREE.IcosahedronGeometry(1.7, 4);
    const mat = new THREE.MeshPhysicalMaterial({
      color: 0x0e3a3b,
      metalness: 0.2,
      roughness: 0.05,
      transmission: 0.95,
      thickness: 1.5,
      ior: 1.45,
      clearcoat: 1.0,
      clearcoatRoughness: 0.08,
      iridescence: 0.6,
      iridescenceIOR: 1.3,
      transparent: true,
      opacity: 0.92
    });
    const crystal = new THREE.Mesh(geo, mat);
    this.scene.add(crystal);

    // Wireframe overlay
    const wire = new THREE.Mesh(
      new THREE.IcosahedronGeometry(1.72, 1),
      new THREE.MeshBasicMaterial({ color: 0x6ee7b7, wireframe: true, transparent: true, opacity: 0.18 })
    );
    this.scene.add(wire);

    // Particle halo
    const N = 220;
    const positions = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) {
      const r = 3 + Math.random() * 1.8;
      const t = Math.random() * Math.PI * 2;
      const p = Math.acos(2 * Math.random() - 1);
      positions[i * 3]     = r * Math.sin(p) * Math.cos(t);
      positions[i * 3 + 1] = r * Math.sin(p) * Math.sin(t);
      positions[i * 3 + 2] = r * Math.cos(p);
    }
    const pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const pMat = new THREE.PointsMaterial({ color: 0x60a5fa, size: 0.025, transparent: true, opacity: 0.7 });
    const pts  = new THREE.Points(pGeo, pMat);
    this.scene.add(pts);

    // Mouse parallax
    this.mouseListener = (e: MouseEvent) => {
      const r = el.getBoundingClientRect();
      this.mouse.tx = ((e.clientX - r.left) / r.width  - 0.5) * 2;
      this.mouse.ty = ((e.clientY - r.top)  / r.height - 0.5) * 2;
    };
    window.addEventListener('mousemove', this.mouseListener);

    // Resize
    this.resizeListener = () => {
      const W = el.clientWidth, H = el.clientHeight;
      this.camera.aspect = W / H;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(W, H);
    };
    window.addEventListener('resize', this.resizeListener);

    // Loop
    this.t0 = performance.now();
    const tick = () => {
      const t = (performance.now() - this.t0) / 1000;
      this.mouse.x += (this.mouse.tx - this.mouse.x) * 0.05;
      this.mouse.y += (this.mouse.ty - this.mouse.y) * 0.05;

      crystal.rotation.x = t * 0.18 + this.mouse.y * 0.5;
      crystal.rotation.y = t * 0.22 + this.mouse.x * 0.7;
      crystal.position.y = Math.sin(t * 0.8) * 0.12;

      wire.rotation.copy(crystal.rotation);
      wire.position.copy(crystal.position);

      pts.rotation.y = t * 0.05;
      pts.rotation.x = t * 0.03;

      this.renderer.render(this.scene, this.camera);
      this.rafId = requestAnimationFrame(tick);
    };
    tick();
  }

  ngOnDestroy(): void {
    cancelAnimationFrame(this.rafId);
    if (this.mouseListener)  window.removeEventListener('mousemove', this.mouseListener);
    if (this.resizeListener) window.removeEventListener('resize',    this.resizeListener);
    this.renderer?.dispose();
    this.scene?.traverse((obj: THREE.Object3D) => {
      const m = obj as THREE.Mesh;
      if (m.geometry) m.geometry.dispose();
      const mat = (m as unknown as { material: THREE.Material | THREE.Material[] }).material;
      if (Array.isArray(mat)) mat.forEach(x => x.dispose());
      else if (mat && 'dispose' in mat) mat.dispose();
    });
    if (this.renderer?.domElement?.parentNode === this.host.nativeElement) {
      this.host.nativeElement.removeChild(this.renderer.domElement);
    }
  }
}
