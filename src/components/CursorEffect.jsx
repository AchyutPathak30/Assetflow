// CursorEffect.jsx
// Custom cursor — a small navy dot + a larger lagging ring that follows the mouse.
// Mount once at the top level (App.jsx). Works across the entire page.

import { useEffect, useRef } from 'react';

export default function CursorEffect() {
  const dotRef = useRef(null);
  const ringRef = useRef(null);

  useEffect(() => {
    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    let mouseX = 0, mouseY = 0;
    let ringX = 0, ringY = 0;
    let animId;

    const onMove = (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      // Dot snaps instantly
      dot.style.transform = `translate(${mouseX - 4}px, ${mouseY - 4}px)`;
    };

    // Ring lags behind with lerp
    function animate() {
      ringX += (mouseX - ringX) * 0.12;
      ringY += (mouseY - ringY) * 0.12;
      ring.style.transform = `translate(${ringX - 18}px, ${ringY - 18}px)`;
      animId = requestAnimationFrame(animate);
    }

    // Grow ring on clickable elements
    const onEnter = () => ring.classList.add('cursor-ring--hover');
    const onLeave = () => ring.classList.remove('cursor-ring--hover');

    document.addEventListener('mousemove', onMove);
    document.querySelectorAll('a, button, input, select, [role="button"]').forEach(el => {
      el.addEventListener('mouseenter', onEnter);
      el.addEventListener('mouseleave', onLeave);
    });

    animId = requestAnimationFrame(animate);

    return () => {
      document.removeEventListener('mousemove', onMove);
      cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <>
      <style>{`
        * { cursor: none !important; }

        .cursor-dot {
          position: fixed;
          top: 0; left: 0;
          width: 8px; height: 8px;
          background: #16233D;
          border-radius: 50%;
          pointer-events: none;
          z-index: 99999;
          transition: opacity 0.2s;
        }

        .cursor-ring {
          position: fixed;
          top: 0; left: 0;
          width: 36px; height: 36px;
          border: 1.5px solid #4C8DFF;
          border-radius: 50%;
          pointer-events: none;
          z-index: 99998;
          transition: width 0.2s ease, height 0.2s ease, border-color 0.2s ease, opacity 0.2s;
          opacity: 0.7;
        }

        .cursor-ring--hover {
          width: 52px;
          height: 52px;
          border-color: #16233D;
          opacity: 1;
        }
      `}</style>
      <div className="cursor-dot" ref={dotRef} />
      <div className="cursor-ring" ref={ringRef} />
    </>
  );
}
