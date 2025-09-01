
import { Component, ChangeDetectionStrategy, ViewChild, ElementRef, AfterViewInit, OnDestroy, effect, input } from '@angular/core';

interface Dot {
  ox: number;
  oy: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
}

@Component({
  selector: 'app-dot-matrix',
  standalone: true,
  template: `<canvas #canvasRef class="w-full h-full"></canvas>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DotMatrixComponent implements AfterViewInit, OnDestroy {
  @ViewChild('canvasRef') canvasRef!: ElementRef<HTMLCanvasElement>;
  
  density = input.required<number>();
  dotSize = input.required<number>();
  interactionRadius = input.required<number>();
  repelForce = input.required<number>();
  returnSpeed = input.required<number>();
  damping = input.required<number>();
  hueShift = input.required<number>();
  baseHue = input.required<number>();

  private ctx!: CanvasRenderingContext2D;
  private dots: Dot[] = [];
  private mouse = { x: -9999, y: -9999, down: false };
  private animationFrameId: number | null = null;
  private resizeObserver: ResizeObserver;

  constructor() {
    effect(() => {
      // This effect will run when density changes, triggering a re-initialization
      this.density(); 
      if (this.ctx) {
        this.initDots();
      }
    });

    this.resizeObserver = new ResizeObserver(() => {
        if (this.ctx) {
            this.initDots();
        }
    });
  }

  ngAfterViewInit(): void {
    const canvas = this.canvasRef.nativeElement;
    const context = canvas.getContext('2d');
    if (!context) {
      console.error('Failed to get 2D context');
      return;
    }
    this.ctx = context;
    
    this.initDots();
    this.addEventListeners();
    this.resizeObserver.observe(canvas);
    this.animate();
  }

  ngOnDestroy(): void {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    this.removeEventListeners();
    this.resizeObserver.disconnect();
  }

  private initDots(): void {
    const canvas = this.canvasRef.nativeElement;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = canvas.offsetWidth * dpr;
    canvas.height = canvas.offsetHeight * dpr;
    this.ctx.scale(dpr, dpr);
    
    this.dots = [];
    const spacing = this.density();
    const width = canvas.offsetWidth;
    const height = canvas.offsetHeight;
    
    for (let x = spacing / 2; x < width; x += spacing) {
      for (let y = spacing / 2; y < height; y += spacing) {
        this.dots.push({ ox: x, oy: y, x, y, vx: 0, vy: 0 });
      }
    }
  }

  private addEventListeners(): void {
    const canvas = this.canvasRef.nativeElement;
    canvas.addEventListener('mousemove', this.onMouseMove);
    canvas.addEventListener('mouseleave', this.onMouseLeave);
  }

  private removeEventListeners(): void {
      const canvas = this.canvasRef.nativeElement;
      canvas.removeEventListener('mousemove', this.onMouseMove);
      canvas.removeEventListener('mouseleave', this.onMouseLeave);
  }

  private onMouseMove = (event: MouseEvent) => {
    const rect = this.canvasRef.nativeElement.getBoundingClientRect();
    this.mouse.x = event.clientX - rect.left;
    this.mouse.y = event.clientY - rect.top;
  };

  private onMouseLeave = () => {
    this.mouse.x = -9999;
    this.mouse.y = -9999;
  };

  private animate = () => {
    this.animationFrameId = requestAnimationFrame(this.animate);
    
    const canvas = this.canvasRef.nativeElement;
    this.ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    const radius = this.interactionRadius();
    const radiusSq = radius * radius;
    const forceFactor = this.repelForce();
    const spring = this.returnSpeed();
    const friction = this.damping();
    const baseHueVal = this.baseHue();
    const hueShiftVal = this.hueShift();

    for (const dot of this.dots) {
      const dx = dot.x - this.mouse.x;
      const dy = dot.y - this.mouse.y;
      const distSq = dx * dx + dy * dy;

      let hue = baseHueVal;
      let saturation = 70;
      let lightness = 50;

      if (distSq < radiusSq) {
        const dist = Math.sqrt(distSq);
        const angle = Math.atan2(dy, dx);
        const force = (1 - dist / radius) * forceFactor;
        
        dot.vx += Math.cos(angle) * force;
        dot.vy += Math.sin(angle) * force;

        const proximity = 1 - dist / radius;
        hue = baseHueVal + proximity * hueShiftVal;
        lightness = 50 + proximity * 20;
      }
      
      dot.vx += (dot.ox - dot.x) * spring;
      dot.vy += (dot.oy - dot.y) * spring;
      
      dot.vx *= friction;
      dot.vy *= friction;
      
      dot.x += dot.vx;
      dot.y += dot.vy;
      
      this.ctx.fillStyle = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
      this.ctx.beginPath();
      this.ctx.arc(dot.x, dot.y, this.dotSize() / 2, 0, Math.PI * 2);
      this.ctx.fill();
    }
  };
}
