"use client";

import { useSearchParams } from 'next/navigation';
import { Suspense, useState, useRef, useEffect } from 'react';
import confetti from 'canvas-confetti';

function BunContent() {
  const searchParams = useSearchParams();
  const userName = searchParams.get('n') || searchParams.get('u') || 'Delegate';
  
  const [isRevealed, setIsRevealed] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [particles, setParticles] = useState<{ id: number; left: string; duration: string; delay: string; size: string; opacity: number }[]>([]);

  useEffect(() => {
    // Generate subtle, ambient particles
    const generated = Array.from({ length: 30 }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      duration: `${Math.random() * 10 + 10}s`, // slow floating
      delay: `${Math.random() * 5}s`,
      size: `${Math.random() * 3 + 1}px`,
      opacity: Math.random() * 0.4 + 0.1
    }));
    setParticles(generated);
  }, []);

  const triggerConfetti = () => {
    const duration = 2500;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 4,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#ccb154', '#ffffff', '#aa8022', '#6dd5ed']
      });
      confetti({
        particleCount: 4,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#ccb154', '#ffffff', '#aa8022', '#6dd5ed']
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  };

  const handleReveal = () => {
    setIsRevealed(true);
    triggerConfetti();
    if (videoRef.current) {
      videoRef.current.play().catch(e => console.log("Video playback error:", e));
    }
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&display=swap');

        * { margin: 0; padding: 0; box-sizing: border-box; }
        html, body { 
          width: 100%; 
          height: 100%; 
          background: #040d0f; 
          color: #f5f4ef; 
          font-family: 'Inter', sans-serif; 
          overflow: hidden; 
        }
        
        .overlay {
          position: fixed;
          inset: 0;
          background: radial-gradient(circle at center, #0a1f22 0%, #040d0f 100%);
          z-index: 2;
          pointer-events: none;
        }
        
        .overlay::after {
          content: '';
          position: absolute;
          inset: 0;
          background: ${isRevealed ? 'rgba(0,0,0,0.6)' : 'transparent'};
          transition: background 1.5s ease;
          backdrop-filter: ${isRevealed ? 'blur(4px)' : 'none'};
        }

        /* Ambient Particles Effect */
        .particles {
          position: fixed;
          inset: 0;
          z-index: 3;
          pointer-events: none;
        }
        
        .particle {
          position: absolute;
          background: #ccb154;
          border-radius: 50%;
          box-shadow: 0 0 15px rgba(204, 169, 84, 0.8);
          animation: floatUp linear infinite;
          bottom: -20px;
        }

        @keyframes floatUp {
          0% { transform: translateY(0) scale(0); opacity: 0; }
          20% { opacity: var(--target-opacity); transform: translateY(-20vh) scale(1); }
          80% { opacity: var(--target-opacity); }
          100% { transform: translateY(-120vh) scale(1.5); opacity: 0; }
        }

        /* Logo floating at top left */
        .logo-container {
          position: fixed;
          top: 40px;
          left: 40px;
          z-index: 20;
          width: 55px;
          height: 55px;
          border-radius: 10px;
          overflow: hidden;
          box-shadow: 0 4px 15px rgba(0,0,0,0.4);
          border: 1px solid rgba(255,255,255,0.08);
          transition: all 0.5s ease;
          opacity: 0.8;
        }

        .logo-container:hover {
          opacity: 1;
          transform: scale(1.05);
          box-shadow: 0 8px 25px rgba(204, 169, 84, 0.2);
          border-color: rgba(204, 169, 84, 0.4);
        }

        .logo-container img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        /* Pro-level Glassmorphism Greeting Box */
        .content-box {
          position: fixed;
          top: 50%;
          left: 50%;
          z-index: 20;
          text-align: center;
          background: rgba(15, 30, 32, 0.4);
          border: 1px solid rgba(255, 255, 255, 0.06);
          padding: 4rem 3rem;
          border-radius: 20px;
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          box-shadow: 0 30px 60px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1);
          max-width: 540px;
          width: 90%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          transition: all 1s cubic-bezier(0.16, 1, 0.3, 1);
          
          /* Slide down and fade out when revealed */
          transform: ${isRevealed ? 'translate(-50%, calc(-50% + 40px)) scale(0.95)' : 'translate(-50%, -50%) scale(1)'};
          opacity: ${isRevealed ? '0' : '1'};
          pointer-events: ${isRevealed ? 'none' : 'auto'};
        }

        /* Video Card - Sleek dark mode */
        .panda-card {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%) scale(${isRevealed ? '1' : '0.95'});
          opacity: ${isRevealed ? '1' : '0'};
          pointer-events: ${isRevealed ? 'auto' : 'none'};
          z-index: 30;
          background: rgba(10, 20, 22, 0.85);
          backdrop-filter: blur(30px);
          -webkit-backdrop-filter: blur(30px);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 24px;
          padding: 2rem;
          text-align: center;
          box-shadow: 0 40px 80px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.1), 0 0 40px rgba(204,169,84,0.1);
          transition: all 1s cubic-bezier(0.16, 1, 0.3, 1);
          max-width: 90vw;
          width: 440px;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .video-wrapper {
          width: 100%;
          border-radius: 12px;
          overflow: hidden;
          margin-bottom: 1.5rem;
          box-shadow: 0 10px 30px rgba(0,0,0,0.5);
          background: #000;
          display: flex;
          justify-content: center;
          align-items: center;
          position: relative;
        }
        
        /* Subtle glow behind the video */
        .video-wrapper::before {
          content: '';
          position: absolute;
          inset: -2px;
          background: linear-gradient(45deg, rgba(204,169,84,0.2), transparent, rgba(204,169,84,0.2));
          z-index: -1;
          filter: blur(10px);
        }

        .panda-video {
          width: 100%;
          height: auto;
          object-fit: cover; 
          border-radius: 12px;
          display: block;
        }

        .panda-card-text {
          font-family: "Cinzel", serif;
          font-size: 1.4rem;
          font-weight: 600;
          color: #f5f4ef;
          margin-bottom: 0.5rem;
          letter-spacing: 0.05em;
        }
        
        .panda-card-subtext {
          color: #9ba3a7;
          font-size: 0.95rem;
          line-height: 1.6;
          margin-top: 0.25rem;
          font-weight: 300;
        }

        .greeting {
          font-family: "Cinzel", serif;
          font-size: 2rem;
          font-weight: 600;
          color: #f5f4ef;
          margin-bottom: 1rem;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        .message {
          color: #a3adb0;
          line-height: 1.6;
          margin-bottom: 2.5rem;
          font-size: 1.05rem;
          font-weight: 300;
          text-align: center;
          max-width: 85%;
        }

        /* Modern, subtle glowing button */
        .play-btn {
          background: rgba(255, 255, 255, 0.03);
          color: #ccb154;
          border: 1px solid rgba(204, 169, 84, 0.4);
          padding: 14px 36px;
          font-size: 0.9rem;
          font-weight: 500;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
          display: inline-flex;
          justify-content: center;
          align-items: center;
          box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        }

        .play-btn:hover {
          background: rgba(204, 169, 84, 0.1);
          border-color: rgba(204, 169, 84, 0.8);
          color: #e5cc7a;
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(204, 169, 84, 0.2), inset 0 0 15px rgba(204, 169, 84, 0.1);
        }

        .close-btn {
          margin-top: 1.5rem;
          background: none;
          border: none;
          color: #7a868a;
          cursor: pointer;
          font-size: 0.85rem;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          transition: color 0.3s ease;
        }
        
        .close-btn:hover {
          color: #ccb154;
        }

        /* Elegant Minimal Footer */
        .footer {
          position: fixed;
          bottom: 30px;
          left: 0;
          right: 0;
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 24px;
          font-size: 11px;
          color: rgba(255,255,255,0.4);
          letter-spacing: 0.15em;
          z-index: 20;
          text-transform: uppercase;
          opacity: ${isRevealed ? '0.1' : '1'};
          transition: opacity 1.5s ease;
        }

        .footer a {
          color: rgba(255,255,255,0.5);
          text-decoration: none;
          transition: all 0.3s ease;
        }

        .footer a:hover {
          color: #ccb154;
        }
        
        .footer .dot {
          width: 3px;
          height: 3px;
          background: rgba(255,255,255,0.2);
          border-radius: 50%;
        }
        
        @media (max-width: 600px) {
          .logo-container { top: 24px; left: 24px; width: 45px; height: 45px; }
          .footer { font-size: 9px; gap: 12px; bottom: 20px; }
          .greeting { font-size: 1.5rem; }
          .content-box { padding: 3rem 1.5rem; width: 85%; }
          .panda-card { width: 85%; padding: 1.5rem; }
        }
      `}} />

      <div className="overlay" />

      {/* Ambient Particles */}
      <div className="particles">
        {particles.map((p) => (
          <div 
            key={p.id} 
            className="particle" 
            style={{ 
              left: p.left, 
              width: p.size,
              height: p.size,
              animationDuration: p.duration, 
              animationDelay: p.delay,
              '--target-opacity': p.opacity
            } as any} 
          />
        ))}
      </div>

      {/* Floating Logo */}
      <div className="logo-container">
        <img src="https://i.ibb.co/ksY274mG/SSET-MUN-pfp.png" alt="SSET MUN Logo" />
      </div>

      {/* Center Box */}
      <div className="content-box">
        <h1 className="greeting">Hello, {userName}</h1>
        <p className="message">
          Someone special has been eagerly waiting to give you a warm welcome to SSET MUN 2.0.
        </p>
        <button className="play-btn" onClick={handleReveal}>
          Accept the Greeting
        </button>
      </div>

      {/* The Reveal with Video */}
      <div className="panda-card">
        <div className="video-wrapper">
          <video 
            ref={videoRef}
            src="/easter-egg.mp4" 
            className="panda-video"
            autoPlay 
            loop 
            muted 
            playsInline
          />
        </div>
        <h2 className="panda-card-text">A Chocobun just for you! 🐼🍫</h2>
        <p className="panda-card-subtext">We are incredibly excited to have you onboard. See you at the conference!</p>
        
        <button 
          className="close-btn"
          onClick={() => setIsRevealed(false)}
        >
          Close
        </button>
      </div>

      <div className="footer">
        <a href="https://instagram.com/ssetmun" target="_blank" rel="noopener noreferrer">@ssetmun</a>
        <div className="dot" />
        <a href="https://ssetmun.dev" target="_blank" rel="noopener noreferrer">ssetmun.dev</a>
        <div className="dot" />
        <span>SSET MUN 2.0</span>
      </div>
    </>
  );
}

export default function BunPage() {
  return (
    <Suspense fallback={<div style={{ background: '#040d0f', width: '100vw', height: '100vh' }}></div>}>
      <BunContent />
    </Suspense>
  );
}
