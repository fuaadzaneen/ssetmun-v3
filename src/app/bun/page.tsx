"use client";

import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useRef } from 'react';

function BunContent() {
  const searchParams = useSearchParams();
  // We passed ?n=[DELEGATE_NAME_ENC]
  const userName = searchParams.get('n') || searchParams.get('u') || 'Delegate';
  const bunRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const bun = bunRef.current;
    if (!bun) return;

    const SIZE = 90;
    let x = Math.random() * (window.innerWidth - SIZE);
    let y = Math.random() * (window.innerHeight - SIZE);
    let dx = 3.5, dy = 2.8;
    let raf: number;
    let speedMult = 1;

    function step() {
      x += dx * speedMult; 
      y += dy * speedMult;
      const W = window.innerWidth - SIZE;
      const H = window.innerHeight - SIZE;
      
      let hit = false;
      if (x <= 0) { x = 0; dx = Math.abs(dx); hit = true; }
      if (x >= W) { x = W; dx = -Math.abs(dx); hit = true; }
      if (y <= 0) { y = 0; dy = Math.abs(dy); hit = true; }
      if (y >= H) { y = H; dy = -Math.abs(dy); hit = true; }
      
      if (hit && bun) {
        const colors = [
          'rgba(204,169,84,0.8)', 'rgba(255,100,100,0.7)',
          'rgba(100,200,255,0.7)', 'rgba(150,255,150,0.7)',
          'rgba(255,150,255,0.7)'
        ];
        bun.style.boxShadow = '0 0 50px ' + colors[Math.floor(Math.random() * colors.length)];
      }

      if (bun) {
        bun.style.transform = `translate(${x}px, ${y}px)`;
      }
      raf = requestAnimationFrame(step);
    }

    raf = requestAnimationFrame(step);

    const handleResize = () => {
      x = Math.min(x, window.innerWidth - SIZE);
      y = Math.min(y, window.innerHeight - SIZE);
    };

    const handleClick = () => {
      speedMult = 4;
      setTimeout(() => { speedMult = 1; }, 1500);
    };

    window.addEventListener('resize', handleResize);
    bun.addEventListener('click', handleClick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', handleResize);
      if (bun) bun.removeEventListener('click', handleClick);
    };
  }, []);

  return (
    <>
      <style>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }
        html, body { width: 100%; height: 100%; overflow: hidden; background: #061619; }
        
        #bun {
          position: fixed;
          top: 0;
          left: 0;
          width: 90px;
          height: 90px;
          border-radius: 50%;
          cursor: pointer;
          user-select: none;
          box-shadow: 0 0 30px rgba(204,169,84,0.4);
          z-index: 999;
          will-change: transform;
        }

        .comic-container {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          text-align: center;
          width: 90%;
          max-width: 600px;
          pointer-events: none;
          z-index: 10;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1.5rem;
        }

        .greeting {
          font-family: "Cinzel", serif;
          font-size: 2.5rem;
          font-weight: 600;
          color: #f5f4ef;
          text-shadow: 0 4px 20px rgba(0,0,0,0.5);
          letter-spacing: 0.05em;
        }

        .subtitle {
          font-family: "Cinzel", serif;
          font-size: 1.2rem;
          color: #ccb154;
          letter-spacing: 0.15em;
          text-transform: uppercase;
        }

        .message-box {
          background: rgba(13, 39, 41, 0.7);
          border: 1px solid rgba(204, 169, 84, 0.4);
          border-radius: 20px;
          padding: 2rem;
          backdrop-filter: blur(10px);
          box-shadow: 0 10px 30px rgba(0,0,0,0.5);
        }

        .message-text {
          font-family: sans-serif;
          font-size: 1.1rem;
          color: #dfe4e6;
          line-height: 1.6;
        }

        .panda-container {
          font-size: 5rem;
          filter: drop-shadow(0 10px 15px rgba(0,0,0,0.5));
          animation: float 3s ease-in-out infinite;
        }

        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-15px); }
        }

        .hint {
          position: fixed;
          bottom: 20px;
          left: 50%;
          transform: translateX(-50%);
          color: rgba(204,169,84,0.5);
          font-family: sans-serif;
          font-size: 11px;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          pointer-events: none;
        }

        @media (max-width: 600px) {
          .greeting { font-size: 1.8rem; }
          .subtitle { font-size: 0.9rem; }
          .message-box { padding: 1.5rem; }
          .message-text { font-size: 0.95rem; }
          .panda-container { font-size: 4rem; }
        }
      `}</style>

      <div className="comic-container">
        <div className="panda-container">
          🐼🤲🍞
        </div>
        
        <div>
          <h1 className="greeting">Hey, {userName}!</h1>
          <p className="subtitle">You found the Chocobun ✨</p>
        </div>

        <div className="message-box">
          <p className="message-text">
            Thank you so much for registering for SSET MUN 2.0.<br/>
            We hope to see you there and can't wait to make amazing memories together!
          </p>
        </div>
      </div>

      <img
        ref={bunRef}
        id="bun"
        src="https://i.ibb.co/zWq0n3Hq/pngtree-chocolate-buns-png-image-6471290.png"
        alt="Chocobun"
      />
      
      <div className="hint">psst... click the flying bun</div>
    </>
  );
}

export default function BunPage() {
  return (
    <Suspense fallback={<div style={{ background: '#061619', width: '100vw', height: '100vh' }}></div>}>
      <BunContent />
    </Suspense>
  );
}
