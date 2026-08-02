"use client";

import { useSearchParams } from 'next/navigation';
import { Suspense, useState, useRef, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';

function BunContent() {
  const searchParams = useSearchParams();
  const userName = searchParams.get('n') || searchParams.get('u') || 'Delegate';
  
  const [isRevealed, setIsRevealed] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [particles, setParticles] = useState<{ id: number; left: string; duration: string; delay: string; size: string; opacity: number }[]>([]);
  
  // Mini-game state
  const [bunPosition, setBunPosition] = useState({ top: '50%', left: '50%' });
  const [gameStarted, setGameStarted] = useState(false);
  const [catchCoords, setCatchCoords] = useState<{x: number, y: number} | null>(null);

  useEffect(() => {
    // Generate subtle, drifting ambient particles
    const generated = Array.from({ length: 35 }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      duration: `${Math.random() * 12 + 10}s`, // slow drifting
      delay: `${Math.random() * 8}s`,
      size: `${Math.random() * 4 + 1}px`,
      opacity: Math.random() * 0.4 + 0.1
    }));
    setParticles(generated);
  }, []);

  // Bun movement logic
  const moveBun = useCallback(() => {
    if (isRevealed) return;
    
    // Keep it within a safe zone (15% to 85% of screen) to avoid hiding on edges
    const randomTop = Math.floor(Math.random() * 70) + 15; 
    const randomLeft = Math.floor(Math.random() * 70) + 15;
    
    setBunPosition({ top: `${randomTop}%`, left: `${randomLeft}%` });
  }, [isRevealed]);

  useEffect(() => {
    if (!gameStarted || isRevealed) return;
    
    moveBun(); // Initial move
    const interval = setInterval(moveBun, 1000); // Moves slightly faster for more fun
    
    return () => clearInterval(interval);
  }, [gameStarted, isRevealed, moveBun]);


  const triggerConfetti = (clientX: number, clientY: number) => {
    const originX = clientX / window.innerWidth;
    const originY = clientY / window.innerHeight;

    // A massive, satisfying burst exactly where they clicked
    confetti({
      particleCount: 150,
      spread: 100,
      startVelocity: 40,
      origin: { x: originX, y: originY },
      colors: ['#5c3a21', '#ccb154', '#ffffff', '#d4af37'], // Chocolate and gold colors
      disableForReducedMotion: true,
      zIndex: 100
    });
    
    // A secondary wider burst for dramatic effect
    setTimeout(() => {
      confetti({
        particleCount: 50,
        spread: 140,
        origin: { x: originX, y: originY },
        colors: ['#ccb154', '#ffffff'],
        zIndex: 100
      });
    }, 200);
  };

  const handleCatchBun = (e: React.MouseEvent) => {
    setCatchCoords({ x: e.clientX, y: e.clientY });
    setIsRevealed(true);
    triggerConfetti(e.clientX, e.clientY);
    
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
          background: ${isRevealed ? 'rgba(0,0,0,0.75)' : 'transparent'};
          transition: background 1.5s ease;
          backdrop-filter: ${isRevealed ? 'blur(12px)' : 'none'};
        }

        /* Ambient Firefly Particles Effect */
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
          box-shadow: 0 0 15px rgba(204, 169, 84, 0.9);
          animation: floatDrift linear infinite;
          bottom: -20px;
        }

        @keyframes floatDrift {
          0% { transform: translateY(0) translateX(0) scale(0); opacity: 0; }
          20% { opacity: var(--target-opacity); transform: translateY(-20vh) translateX(-15px) scale(1); }
          50% { transform: translateY(-60vh) translateX(20px) scale(1.2); }
          80% { opacity: var(--target-opacity); transform: translateY(-90vh) translateX(-10px) scale(1.3); }
          100% { transform: translateY(-120vh) translateX(0) scale(1.5); opacity: 0; }
        }

        /* Logo floating at top left */
        .logo-container {
          position: fixed;
          top: 40px;
          left: 40px;
          z-index: 20;
          width: 55px;
          height: 55px;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 4px 15px rgba(0,0,0,0.4);
          border: 1px solid rgba(255,255,255,0.08);
          transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
          opacity: 0.8;
          animation: gentleFloat 4s ease-in-out infinite;
        }

        .logo-container:hover {
          opacity: 1;
          transform: scale(1.05) !important;
          box-shadow: 0 8px 25px rgba(204, 169, 84, 0.3);
          border-color: rgba(204, 169, 84, 0.5);
          animation-play-state: paused;
        }

        @keyframes gentleFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
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
          
          /* Slide down and fade out when game starts or is revealed */
          transform: ${gameStarted ? 'translate(-50%, calc(-50% + 60px)) scale(0.9)' : 'translate(-50%, -50%) scale(1)'};
          opacity: ${gameStarted ? '0' : '1'};
          pointer-events: ${gameStarted ? 'none' : 'auto'};
        }

        .greeting {
          font-family: "Cinzel", serif;
          font-size: 2.2rem;
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
          max-width: 90%;
        }

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

        /* The Target (Chocobun) */
        .chocobun-target {
          position: fixed;
          z-index: 25;
          cursor: crosshair;
          transition: all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1); /* bouncy gliding */
          user-select: none;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 120px;
          height: 120px;
          
          /* Glow effect for the image */
          filter: drop-shadow(0 0 15px rgba(204, 169, 84, 0.5));
          
          /* Hide initially, fade in when game starts, pop on reveal */
          opacity: ${gameStarted && !isRevealed ? '1' : '0'};
          pointer-events: ${gameStarted && !isRevealed ? 'auto' : 'none'};
          transform: ${
            isRevealed && catchCoords
              ? 'translate(-50%, -50%) scale(2)' // Explosion effect when clicked
              : gameStarted
                ? 'translate(-50%, -50%) scale(1)'
                : 'translate(-50%, -50%) scale(0)'
          };
        }
        
        .chocobun-target:hover {
          transform: translate(-50%, -50%) scale(1.2) rotate(15deg) !important;
          filter: drop-shadow(0 0 30px rgba(204, 169, 84, 0.9));
        }

        .chocobun-target img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          pointer-events: none; /* ensure clicks go to the wrapper div */
        }
        
        .game-instructions {
          position: fixed;
          top: 15%;
          left: 50%;
          transform: translateX(-50%);
          z-index: 20;
          font-family: "Cinzel", serif;
          font-size: 1.4rem;
          color: #e5cc7a;
          letter-spacing: 0.1em;
          opacity: ${gameStarted && !isRevealed ? '1' : '0'};
          transition: opacity 1s ease;
          pointer-events: none;
          text-shadow: 0 4px 15px rgba(0,0,0,0.9);
          text-align: center;
          width: 100%;
        }

        /* Video Card - Sleek dark mode */
        .panda-card {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%) scale(${isRevealed ? '1' : '0.85'});
          opacity: ${isRevealed ? '1' : '0'};
          pointer-events: ${isRevealed ? 'auto' : 'none'};
          z-index: 30;
          background: rgba(10, 20, 22, 0.85);
          backdrop-filter: blur(35px);
          -webkit-backdrop-filter: blur(35px);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 24px;
          padding: 2.5rem;
          text-align: center;
          box-shadow: 0 40px 100px rgba(0,0,0,0.9), inset 0 1px 0 rgba(255,255,255,0.1), 0 0 50px rgba(204,169,84,0.15);
          /* Very bouncy, premium slide-in */
          transition: all 1.2s cubic-bezier(0.34, 1.56, 0.64, 1);
          max-width: 90vw;
          width: 460px;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .video-wrapper {
          width: 100%;
          border-radius: 12px;
          overflow: hidden;
          margin-bottom: 1.8rem;
          box-shadow: 0 15px 35px rgba(0,0,0,0.6);
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
          inset: -4px;
          background: linear-gradient(45deg, rgba(204,169,84,0.3), transparent, rgba(204,169,84,0.3));
          z-index: -1;
          filter: blur(15px);
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
          font-size: 1.6rem;
          font-weight: 700;
          background: linear-gradient(135deg, #f5f4ef 0%, #ccb154 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          margin-bottom: 0.6rem;
          letter-spacing: 0.05em;
        }
        
        .panda-card-subtext {
          color: #a3adb0;
          font-size: 1rem;
          line-height: 1.6;
          margin-top: 0.25rem;
          font-weight: 300;
        }

        .close-btn {
          margin-top: 2rem;
          background: none;
          border: none;
          color: #7a868a;
          cursor: pointer;
          font-size: 0.85rem;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          transition: all 0.3s ease;
        }
        
        .close-btn:hover {
          color: #ccb154;
          transform: translateY(-2px);
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
          .greeting { font-size: 1.6rem; }
          .content-box { padding: 3rem 1.5rem; width: 85%; }
          .panda-card { width: 85%; padding: 2rem 1.5rem; }
          .game-instructions { font-size: 1.1rem; width: 90%; }
          .chocobun-target { width: 90px; height: 90px; }
        }
      `}} />

      <div className="overlay" />

      {/* Ambient Firefly Particles */}
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

      {/* Initial Greeting Box */}
      <div className="content-box">
        <h1 className="greeting">Hello, {userName}</h1>
        <p className="message">
          Someone special has been eagerly waiting to give you a warm welcome to SSET MUN 2.0.
        </p>
        <button className="play-btn" onClick={() => setGameStarted(true)}>
          Find The Greeting
        </button>
      </div>

      {/* Mini-Game Phase */}
      <div className="game-instructions">
        A Chocobun has been hidden for you... catch it!
      </div>
      
      <div 
        className="chocobun-target" 
        style={{ 
          top: isRevealed && catchCoords ? catchCoords.y + 'px' : bunPosition.top, 
          left: isRevealed && catchCoords ? catchCoords.x + 'px' : bunPosition.left 
        }}
        onClick={handleCatchBun}
      >
        <img src="https://i.ibb.co/zWq0n3Hq/pngtree-chocolate-buns-png-image-6471290.png" alt="Chocobun" />
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
        <h2 className="panda-card-text">You caught it! 🐼</h2>
        <p className="panda-card-subtext">We are incredibly excited to have you onboard. See you at the conference!</p>
        
        <button 
          className="close-btn"
          onClick={() => {
            setIsRevealed(false);
            setGameStarted(false); // Reset to start
            setCatchCoords(null);
          }}
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
