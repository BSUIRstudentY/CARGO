import { useLayoutEffect, useRef, useState } from 'react';

export function SlidePill({ active, className, children }) {
  const bar = useRef(null);
  const [pill, setPill] = useState({ x: 0, y: 0, w: 0, h: 0, ready: false });
  const [motionOn, setMotionOn] = useState(false);

  useLayoutEffect(() => {
    const node = () => bar.current?.querySelector(`[data-tab="${active}"]`);
    const update = () => {
      const tab = node();
      if (!tab) return;
      setPill({
        x: tab.offsetLeft,
        y: tab.offsetTop,
        w: tab.offsetWidth,
        h: tab.offsetHeight,
        ready: true,
      });
    };
    update();
    const frame = window.requestAnimationFrame(() => setMotionOn(true));
    const ro = new ResizeObserver(update);
    if (bar.current) ro.observe(bar.current);
    window.addEventListener('resize', update);
    return () => {
      window.cancelAnimationFrame(frame);
      ro.disconnect();
      window.removeEventListener('resize', update);
    };
  }, [active]);

  return (
    <div ref={bar} className={`slide-nav ${className ?? ''}`}>
      <span
        className="tab-pill"
        style={{
          width: pill.w,
          height: pill.h,
          transform: `translate(${pill.x}px, ${pill.y}px)`,
          opacity: pill.ready ? 1 : 0,
          transition: motionOn ? undefined : 'none',
        }}
      />
      {children}
    </div>
  );
}
