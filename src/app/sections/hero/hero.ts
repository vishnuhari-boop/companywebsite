import {
  afterNextRender,
  Component,
  DestroyRef,
  ElementRef,
  inject,
  signal,
  viewChild,
} from '@angular/core';

interface HeroStat {
  value: string;
  label: string;
  icon: 'people' | 'shield' | 'rocket';
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  color: string;
  phase: number;
}

interface TrailPoint {
  x: number;
  y: number;
  life: number;
}

interface OrbCard {
  slot: string;
  title: string;
  description: string;
  icon: 'helpdesk' | 'web' | 'dedicated' | 'noc' | 'soc' | 'pro';
  angle: number;
}

interface GlobePoint {
  lat: number;
  lon: number;
  land: boolean;
}

@Component({
  selector: 'app-hero',
  templateUrl: './hero.html',
  styleUrl: './hero.scss',
})
export class Hero {
  private readonly destroyRef = inject(DestroyRef);
  private readonly host = inject(ElementRef<HTMLElement>);
  private readonly particleCanvas = viewChild<HTMLCanvasElement>('particles');
  private readonly trailCanvas = viewChild<HTMLCanvasElement>('trail');
  private readonly globeCanvas = viewChild<HTMLCanvasElement>('globe');
  private readonly cta = viewChild<HTMLAnchorElement>('cta');

  protected readonly stats: HeroStat[] = [
    { value: '8+', label: 'Years Experience', icon: 'people' },
    { value: '50+', label: 'Projects Delivered', icon: 'shield' },
    { value: '100%', label: 'Client Satisfaction', icon: 'rocket' },
  ];

  protected readonly orbCards: OrbCard[] = [
    {
      slot: 'helpdesk',
      title: 'HelpDesk Services',
      description: 'Smart support solutions that improve efficiency.',
      icon: 'helpdesk',
      angle: 310,
    },
    {
      slot: 'web',
      title: 'Web Services',
      description: 'Modern, responsive and scalable web applications.',
      icon: 'web',
      angle: 50,
    },
    {
      slot: 'dedicated',
      title: 'Dedicated Techs',
      description: 'Skilled experts dedicated to your success.',
      icon: 'dedicated',
      angle: 270,
    },
    {
      slot: 'noc',
      title: 'NOC Services',
      description: '24/7 monitoring and proactive network management.',
      icon: 'noc',
      angle: 90,
    },
    {
      slot: 'soc',
      title: 'SOC Services',
      description: 'Advanced security operations to protect what matters.',
      icon: 'soc',
      angle: 220,
    },
    {
      slot: 'pro',
      title: 'Professional Services',
      description: 'Consulting and solutions that drive real business impact.',
      icon: 'pro',
      angle: 140,
    },
  ];

  protected readonly trailX = signal(72);
  protected readonly trailY = signal(24);
  protected readonly ctaHover = signal(false);

  private frame = 0;
  private particles: Particle[] = [];
  private trail: TrailPoint[] = [];
  private globePoints: GlobePoint[] = [];
  private globeRot = -2.05;
  private globeStarted = 0;
  private reduceMotion = false;
  private particleCtx: CanvasRenderingContext2D | null = null;
  private trailCtx: CanvasRenderingContext2D | null = null;
  private globeCtx: CanvasRenderingContext2D | null = null;

  constructor() {
    afterNextRender(() => this.start());
    this.destroyRef.onDestroy(() => cancelAnimationFrame(this.frame));
  }

  protected onCtaEnter(): void {
    this.ctaHover.set(true);
    this.resizeTrailCanvas();
  }

  protected onCtaLeave(): void {
    this.ctaHover.set(false);
  }

  protected onCtaMove(event: PointerEvent): void {
    const button = this.asElement(this.cta(), 'a.hero__cta');
    if (!button) {
      return;
    }

    const rect = button.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    this.trailX.set(x);
    this.trailY.set(y);

    const last = this.trail[this.trail.length - 1];
    const distance = last ? Math.hypot(x - last.x, y - last.y) : 8;
    const steps = Math.max(1, Math.min(5, Math.round(distance / 5)));
    for (let i = 1; i <= steps; i++) {
      const t = i / steps;
      this.trail.push({
        x: last ? last.x + (x - last.x) * t : x,
        y: last ? last.y + (y - last.y) * t : y,
        life: 1,
      });
    }
    if (this.trail.length > 36) {
      this.trail.splice(0, this.trail.length - 36);
    }
  }

  private start(): void {
    this.reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.seedGlobe();

    let attempts = 0;
    const boot = () => {
      this.resizeCanvases();
      this.seedParticles();
      this.drawGlobe();
      if (!this.asElement(this.globeCanvas(), 'canvas.hero-orb__globe') && attempts < 20) {
        attempts += 1;
        requestAnimationFrame(boot);
        return;
      }
      if (this.reduceMotion) {
        return;
      }
      this.tick(performance.now());
    };
    boot();

    const onResize = () => {
      this.resizeCanvases();
      this.seedParticles();
      this.drawGlobe();
    };
    window.addEventListener('resize', onResize);
    this.destroyRef.onDestroy(() => window.removeEventListener('resize', onResize));
  }

  private asElement<T extends HTMLElement>(
    ref: T | { nativeElement: T } | undefined,
    selector: string,
  ): T | undefined {
    if (ref instanceof HTMLElement) {
      return ref as T;
    }
    if (ref && 'nativeElement' in ref && ref.nativeElement instanceof HTMLElement) {
      return ref.nativeElement;
    }
    return (this.host.nativeElement.querySelector(selector) as T | null) ?? undefined;
  }

  private resizeCanvases(): void {
    const particleEl = this.asElement(this.particleCanvas(), 'canvas.hero__particles');
    if (particleEl?.parentElement) {
      this.particleCtx = this.fitCanvas(
        particleEl,
        particleEl.parentElement.clientWidth,
        particleEl.parentElement.clientHeight,
      );
    }
    this.resizeTrailCanvas();
    this.resizeGlobeCanvas();
  }

  private resizeTrailCanvas(): void {
    const trailEl = this.asElement(this.trailCanvas(), 'canvas.hero__cta-trail');
    const button = this.asElement(this.cta(), 'a.hero__cta');
    if (trailEl && button) {
      this.trailCtx = this.fitCanvas(trailEl, button.clientWidth, button.clientHeight);
    }
  }

  private resizeGlobeCanvas(): void {
    const globeEl = this.asElement(this.globeCanvas(), 'canvas.hero-orb__globe');
    if (!globeEl) {
      return;
    }
    const size = Math.max(160, globeEl.clientWidth || 200);
    this.globeCtx = this.fitCanvas(globeEl, size, size);
  }

  private fitCanvas(
    canvas: HTMLCanvasElement,
    width: number,
    height: number,
  ): CanvasRenderingContext2D | null {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.max(1, Math.floor(width * dpr));
    canvas.height = Math.max(1, Math.floor(height * dpr));
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    const ctx = canvas.getContext('2d');
    ctx?.setTransform(dpr, 0, 0, dpr, 0, 0);
    return ctx;
  }

  private isLand(lat: number, lon: number): boolean {
    if (lat > 8 && lat < 72 && lon > 60 && lon < 150) {
      return true;
    }
    if (lat > 8 && lat < 36 && lon > 68 && lon < 90) {
      return true;
    }
    if (lat > -40 && lat < -11 && lon > 113 && lon < 154) {
      return true;
    }
    if (lat > -35 && lat < 37 && lon > -18 && lon < 52) {
      return true;
    }
    if (lat > 36 && lat < 71 && lon > -10 && lon < 40) {
      return true;
    }
    if (lat > 15 && lat < 72 && lon > -130 && lon < -52) {
      return true;
    }
    if (lat > -55 && lat < 12 && lon > -82 && lon < -34) {
      return true;
    }
    return false;
  }

  private seedGlobe(): void {
    const points: GlobePoint[] = [];
    for (let lat = -78; lat <= 78; lat += 7) {
      for (let lon = -180; lon < 180; lon += 8) {
        points.push({ lat, lon, land: false });
      }
    }
    for (let lat = -70; lat <= 70; lat += 3) {
      for (let lon = -180; lon < 180; lon += 4) {
        if (this.isLand(lat, lon)) {
          points.push({ lat, lon, land: true });
        }
      }
    }
    this.globePoints = points;
  }

  private seedParticles(): void {
    const canvas = this.asElement(this.particleCanvas(), 'canvas.hero__particles');
    if (!canvas) {
      return;
    }

    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    const count = Math.round(Math.min(130, Math.max(56, (width * height) / 11000)));
    const colors = ['#1b4dff', '#38bdf8', '#7c3aed', '#a78bfa', '#60a5fa', '#818cf8'];
    this.particles = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: 0.16 + Math.random() * 0.32,
      vy: (Math.random() - 0.5) * 0.18,
      r: Math.random() * 1.7 + 0.9,
      color: colors[Math.floor(Math.random() * colors.length)],
      phase: Math.random() * Math.PI * 2,
    }));
  }

  private tick = (time: number): void => {
    this.drawParticles();
    this.drawTrail();
    if (!this.globeStarted) {
      this.globeStarted = time;
    }
    this.globeRot = -2.05 - ((time - this.globeStarted) / 18000) * Math.PI * 2;
    this.drawGlobe();
    this.frame = requestAnimationFrame(this.tick);
  };

  private drawGlobe(): void {
    const canvas = this.asElement(this.globeCanvas(), 'canvas.hero-orb__globe');
    const ctx = this.globeCtx ?? canvas?.getContext('2d');
    if (!canvas || !ctx) {
      return;
    }

    const size = canvas.clientWidth || 200;
    const cx = size / 2;
    const cy = size / 2;
    const radius = size * 0.46;
    ctx.clearRect(0, 0, size, size);

    for (const point of this.globePoints) {
      const lat = (point.lat * Math.PI) / 180;
      const lon = (point.lon * Math.PI) / 180 + this.globeRot;
      const x = Math.cos(lat) * Math.sin(lon);
      const y = Math.sin(lat);
      const z = Math.cos(lat) * Math.cos(lon);
      if (z < 0.04) {
        continue;
      }
      const px = cx + x * radius;
      const py = cy - y * radius;
      ctx.beginPath();
      ctx.fillStyle = point.land
        ? `rgba(224, 242, 254, ${0.35 + z * 0.65})`
        : `rgba(186, 230, 253, ${0.16 + z * 0.28})`;
      ctx.arc(px, py, point.land ? 1.4 : 0.75, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  private drawParticles(): void {
    const canvas = this.asElement(this.particleCanvas(), 'canvas.hero__particles');
    const ctx = this.particleCtx ?? canvas?.getContext('2d');
    if (!canvas || !ctx) {
      return;
    }

    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    ctx.clearRect(0, 0, width, height);

    for (const particle of this.particles) {
      particle.phase += 0.008;
      particle.x += particle.vx;
      particle.y += particle.vy + Math.sin(particle.phase) * 0.12;
      if (particle.x > width + 12) {
        particle.x = -12;
      } else if (particle.x < -12) {
        particle.x = width + 12;
      }
      if (particle.y > height + 12) {
        particle.y = -12;
      } else if (particle.y < -12) {
        particle.y = height + 12;
      }
    }

    for (let i = 0; i < this.particles.length; i++) {
      const a = this.particles[i];
      for (let j = i + 1; j < this.particles.length; j++) {
        const b = this.particles[j];
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const dist = Math.hypot(dx, dy);
        if (dist < 132) {
          const fade = 1 - dist / 132;
          ctx.beginPath();
          ctx.strokeStyle =
            i % 2 === 0
              ? `rgba(56, 189, 248, ${0.26 * fade})`
              : `rgba(139, 92, 246, ${0.24 * fade})`;
          ctx.lineWidth = 1;
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }

    for (const particle of this.particles) {
      ctx.beginPath();
      ctx.fillStyle = particle.color;
      ctx.globalAlpha = 0.78;
      ctx.arc(particle.x, particle.y, particle.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    }
  }

  private drawTrail(): void {
    const canvas = this.asElement(this.trailCanvas(), 'canvas.hero__cta-trail');
    const ctx = this.trailCtx ?? canvas?.getContext('2d');
    if (!canvas || !ctx) {
      return;
    }

    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    ctx.clearRect(0, 0, width, height);

    this.trail = this.trail
      .map((point) => ({ ...point, life: point.life - 0.038 }))
      .filter((point) => point.life > 0);

    if (!this.ctaHover() && this.trail.length === 0) {
      return;
    }

    for (let i = 1; i < this.trail.length; i++) {
      const prev = this.trail[i - 1];
      const point = this.trail[i];
      ctx.beginPath();
      ctx.strokeStyle = `rgba(255, 255, 255, ${point.life * 0.95})`;
      ctx.lineWidth = 5.5 * point.life + 1;
      ctx.lineCap = 'round';
      ctx.shadowColor = '#7dd3fc';
      ctx.shadowBlur = 22;
      ctx.moveTo(prev.x, prev.y);
      ctx.lineTo(point.x, point.y);
      ctx.stroke();
    }

    ctx.shadowBlur = 0;
  }
}
