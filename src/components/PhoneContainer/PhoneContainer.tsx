import { useState, useEffect, useRef, useCallback, type ReactNode } from 'react';
import './PhoneContainer.css';

// iPhone 15 Pro logical resolution (points)
const PHONE_WIDTH = 393;
const PHONE_HEIGHT = 852;
const DESKTOP_MIN = 600;
const WRAPPER_PADDING = 48; // 24px × 2

interface PhoneContainerProps {
  children: ReactNode;
}

export function PhoneContainer({ children }: PhoneContainerProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);

  const [isDesktop, setIsDesktop] = useState(
    () => typeof window !== 'undefined' && window.innerWidth >= DESKTOP_MIN,
  );

  const [scale, setScale] = useState(() => {
    if (typeof window === 'undefined' || window.innerWidth < DESKTOP_MIN) return 1;
    const availW = window.innerWidth - WRAPPER_PADDING;
    const availH = window.innerHeight - WRAPPER_PADDING;
    return Math.min(1, availW / PHONE_WIDTH, availH / PHONE_HEIGHT);
  });

  const recalc = useCallback(() => {
    const el = wrapperRef.current;
    if (!el) return;

    const desktop = el.clientWidth >= DESKTOP_MIN;
    setIsDesktop(desktop);

    if (!desktop) {
      setScale(1);
      return;
    }

    const availW = el.clientWidth - WRAPPER_PADDING;
    const availH = el.clientHeight - WRAPPER_PADDING;
    setScale(Math.min(1, availW / PHONE_WIDTH, availH / PHONE_HEIGHT));
  }, []);

  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;

    const ro = new ResizeObserver(recalc);
    ro.observe(el);
    recalc();

    return () => ro.disconnect();
  }, [recalc]);

  return (
    <div className="phone-wrapper" ref={wrapperRef}>
      <div
        className="phone-scale-container"
        style={
          isDesktop
            ? { width: PHONE_WIDTH * scale, height: PHONE_HEIGHT * scale }
            : undefined
        }
      >
        <div
          className="phone-frame"
          style={
            isDesktop
              ? {
                  width: PHONE_WIDTH,
                  height: PHONE_HEIGHT,
                  transform: `scale(${scale})`,
                  transformOrigin: 'top left',
                }
              : undefined
          }
        >
          <div className="phone-notch" />
          <div className="phone-screen">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
