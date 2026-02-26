"use client";

import { useEffect, useRef } from "react";

export default function SplashCursor() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = (canvas.width = canvas.offsetWidth);
    let height = (canvas.height = canvas.offsetHeight);

    const particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      life: number;
      maxLife: number;
      size: number;
      color: string;
    }> = [];

    const colors = [
      "rgba(139,92,246,",   // purple
      "rgba(59,130,246,",   // blue
      "rgba(236,72,153,",   // pink
      "rgba(99,102,241,",   // indigo
    ];

    let mouseX = 0;
    let mouseY = 0;
    let animFrameId: number;

    function spawnParticles(x: number, y: number) {
      for (let i = 0; i < 4; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 2 + 0.5;
        particles.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: 1,
          maxLife: 1,
          size: Math.random() * 8 + 4,
          color: colors[Math.floor(Math.random() * colors.length)],
        });
      }
    }

    function animate() {
      ctx!.clearRect(0, 0, width, height);

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.05;
        p.life -= 0.025;

        if (p.life <= 0) {
          particles.splice(i, 1);
          continue;
        }

        ctx!.beginPath();
        ctx!.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
        ctx!.fillStyle = p.color + p.life + ")";
        ctx!.fill();
      }

      animFrameId = requestAnimationFrame(animate);
    }

    function onMouseMove(e: MouseEvent) {
      const rect = canvas!.getBoundingClientRect();
      mouseX = e.clientX - rect.left;
      mouseY = e.clientY - rect.top;
      spawnParticles(mouseX, mouseY);
    }

    function onResize() {
      width = canvas!.width = canvas!.offsetWidth;
      height = canvas!.height = canvas!.offsetHeight;
    }

    canvas.addEventListener("mousemove", onMouseMove);
    window.addEventListener("resize", onResize);
    animate();

    return () => {
      canvas.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("resize", onResize);
      cancelAnimationFrame(animFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 0,
      }}
    />
  );
}