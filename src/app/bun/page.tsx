"use client";

import { useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';

function BunContent() {
  const searchParams = useSearchParams();
  const userName = searchParams.get('n') || searchParams.get('u') || 'Delegate';
  
  const [isRevealed, setIsRevealed] = useState(false);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        * { margin: 0; padding: 0; box-sizing: border-box; }
        html, body { width: 100%; height: 100%; background: #061619; color: #f5f4ef; font-family: sans-serif; overflow: hidden; }
        
        .container {
          position: fixed;
          inset: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          z-index: 10;
        }

        .overlay {
          position: fixed;
          inset: 0;
          background: ${isRevealed ? 'rgba(6, 22, 25, 0.85)' : 'radial-gradient(circle at center, #0d2729 0%, #061619 100%)'};
          z-index: 2;
          transition: background 1s ease;
          pointer-events: none;
        }

        /* Initial Greeting Box */
        .content-box {
          position: relative;
          z-index: 20;
          text-align: center;
          background: rgba(13, 39, 41, 0.6);
          border: 1px solid rgba(204, 169, 84, 0.4);
          padding: 3rem 2rem;
          border-radius: 24px;
          backdrop-filter: blur(12px);
          box-shadow: 0 10px 40px rgba(0,0,0,0.5);
          max-width: 500px;
          width: 90%;
          transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
          transform: ${isRevealed ? 'translateY(100vh) scale(0.9)' : 'translateY(0) scale(1)'};
          opacity: ${isRevealed ? '0' : '1'};
          pointer-events: ${isRevealed ? 'none' : 'auto'};
        }

        /* Panda GIF Card */
        .panda-card {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%) scale(${isRevealed ? '1' : '0.8'});
          opacity: ${isRevealed ? '1' : '0'};
          pointer-events: ${isRevealed ? 'auto' : 'none'};
          z-index: 30;
          background: #ffffff; /* White background to blend with GIF */
          border-radius: 24px;
          padding: 2rem;
          text-align: center;
          box-shadow: 0 20px 50px rgba(0,0,0,0.7), 0 0 100px rgba(204,169,84,0.2);
          transition: all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1);
          max-width: 90vw;
          width: 450px;
        }

        .panda-gif {
          width: 100%;
          height: auto;
          border-radius: 12px;
          margin-bottom: 1.5rem;
          /* The GIF has a white background, so it blends seamlessly with .panda-card */
        }

        .panda-card-text {
          color: #1a1a1a;
          font-family: "Cinzel", serif;
          font-size: 1.5rem;
          font-weight: 600;
        }
        
        .panda-card-subtext {
          color: #666;
          font-size: 1rem;
          margin-top: 0.5rem;
        }

        .greeting {
          font-family: "Cinzel", serif;
          font-size: 2.2rem;
          font-weight: 600;
          color: #f5f4ef;
          margin-bottom: 1rem;
          text-shadow: 0 4px 10px rgba(0,0,0,0.5);
        }

        .message {
          color: #dfe4e6;
          line-height: 1.6;
          margin-bottom: 2rem;
          font-size: 1.1rem;
        }

        .play-btn {
          background: linear-gradient(135deg, #d4af37, #aa8022);
          color: #000;
          border: none;
          padding: 14px 36px;
          font-size: 1.1rem;
          font-weight: bold;
          font-family: "Cinzel", serif;
          border-radius: 50px;
          cursor: pointer;
          box-shadow: 0 4px 15px rgba(204,169,84,0.4);
          transition: transform 0.2s, box-shadow 0.2s;
        }

        .play-btn:hover {
          transform: scale(1.05) translateY(-2px);
          box-shadow: 0 6px 20px rgba(204,169,84,0.6);
        }

        .watermark {
          position: fixed;
          bottom: 20px;
          left: 50%;
          transform: translateX(-50%);
          font-family: "Cinzel", serif;
          font-size: 12px;
          color: rgba(204, 169, 84, 0.6);
          letter-spacing: 0.2em;
          z-index: 20;
          text-shadow: 0 2px 4px rgba(0,0,0,0.8);
        }
      `}} />

      <div className="overlay" />

      {/* The Initial Greeting */}
      <div className="container">
        <div className="content-box">
          <h1 className="greeting">Hello, {userName}!</h1>
          <p className="message">
            Someone special has been waiting to give you a warm welcome to SSET MUN 2.0.
          </p>
          <button className="play-btn" onClick={() => setIsRevealed(true)}>
            Accept the Greeting
          </button>
        </div>
      </div>

      {/* The Reveal with GIF */}
      <div className="panda-card">
        {/* We use an img tag for the GIF */}
        <img 
          src="/panda-chocobun.gif" 
          alt="Panda offering a chocobun" 
          className="panda-gif"
        />
        <h2 className="panda-card-text">A Chocobun just for you! 🐼🍫</h2>
        <p className="panda-card-subtext">We can't wait to see you at the conference.</p>
        
        <button 
          onClick={() => setIsRevealed(false)}
          style={{
            marginTop: '1.5rem',
            background: 'none',
            border: 'none',
            color: '#aa8022',
            cursor: 'pointer',
            fontWeight: 'bold',
            textDecoration: 'underline'
          }}
        >
          Go Back
        </button>
      </div>

      <div className="watermark">SSET MUN 2.0</div>
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
