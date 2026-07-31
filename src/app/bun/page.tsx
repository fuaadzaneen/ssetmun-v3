export default function BunPage() {
  return (
    <>
      <style>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }
        html, body { width: 100%; height: 100%; overflow: hidden; background: #061619; }
        #bun {
          position: fixed;
          width: 90px;
          height: 90px;
          border-radius: 50%;
          cursor: pointer;
          user-select: none;
          box-shadow: 0 0 30px rgba(204,169,84,0.4);
          z-index: 999;
        }
        #msg {
          position: fixed;
          bottom: 20px;
          left: 50%;
          transform: translateX(-50%);
          color: rgba(204,169,84,0.5);
          font-family: serif;
          font-size: 13px;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          pointer-events: none;
        }
      `}</style>

      <img
        id="bun"
        src="https://i.ibb.co/zWq0n3Hq/pngtree-chocolate-buns-png-image-6471290.png"
        alt="Chocobun"
      />
      <div id="msg">psst... click me 🍞</div>

      <script dangerouslySetInnerHTML={{ __html: `
        const bun = document.getElementById('bun');
        const SIZE = 90;
        let x = Math.random() * (window.innerWidth - SIZE);
        let y = Math.random() * (window.innerHeight - SIZE);
        let dx = 3.5, dy = 2.8;
        let raf;

        function step() {
          x += dx; y += dy;
          const W = window.innerWidth - SIZE;
          const H = window.innerHeight - SIZE;
          if (x <= 0) { x = 0; dx = Math.abs(dx); flash(); }
          if (x >= W) { x = W; dx = -Math.abs(dx); flash(); }
          if (y <= 0) { y = 0; dy = Math.abs(dy); flash(); }
          if (y >= H) { y = H; dy = -Math.abs(dy); flash(); }
          bun.style.left = x + 'px';
          bun.style.top  = y + 'px';
          raf = requestAnimationFrame(step);
        }

        function flash() {
          const colors = [
            'rgba(204,169,84,0.6)', 'rgba(255,100,100,0.5)',
            'rgba(100,200,255,0.5)', 'rgba(150,255,150,0.5)',
            'rgba(255,150,255,0.5)'
          ];
          bun.style.boxShadow = '0 0 40px ' + colors[Math.floor(Math.random() * colors.length)];
        }

        bun.onclick = function() {
          cancelAnimationFrame(raf);
          dx *= 3; dy *= 3;
          setTimeout(function() { dx /= 3; dy /= 3; raf = requestAnimationFrame(step); }, 1500);
        };

        bun.style.left = x + 'px';
        bun.style.top  = y + 'px';
        raf = requestAnimationFrame(step);

        window.addEventListener('resize', function() {
          x = Math.min(x, window.innerWidth - SIZE);
          y = Math.min(y, window.innerHeight - SIZE);
        });
      `}} />
    </>
  );
}
