import { useState, useEffect, useRef, useCallback, type ReactNode } from 'react';
import './PhoneContainer.css';

// iPhone 15 Pro logical resolution (points)
const PHONE_WIDTH = 393;
const PHONE_HEIGHT = 852;
const DESKTOP_MIN = 900; // Raised to accommodate left panels

interface PhoneContainerProps {
  children: ReactNode;
  leftPanels?: ReactNode;
}

export function PhoneContainer({ children, leftPanels }: PhoneContainerProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);

  const [isDesktop, setIsDesktop] = useState(
    () => typeof window !== 'undefined' && window.innerWidth >= DESKTOP_MIN,
  );

  const [scale, setScale] = useState(() => {
    if (typeof window === 'undefined' || window.innerWidth < DESKTOP_MIN) return 1;
    // On desktop, the phone gets roughly 50% of the width (right side)
    const phoneAreaW = window.innerWidth * 0.5;
    const availH = window.innerHeight - 48;
    return Math.min(1, phoneAreaW / PHONE_WIDTH, availH / PHONE_HEIGHT);
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

    // Phone gets the right portion; panels take the left
    const phoneAreaW = el.clientWidth * 0.48;
    const availH = el.clientHeight - 48;
    setScale(Math.min(1, phoneAreaW / PHONE_WIDTH, availH / PHONE_HEIGHT));
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
    <div className={`phone-wrapper ${isDesktop ? 'phone-wrapper--desktop' : ''}`} ref={wrapperRef}>
      {/* Left panels — desktop only */}
      {isDesktop && leftPanels && (
        <aside className="desktop-left-panels">
          {leftPanels}
        </aside>
      )}

      {/* Phone prototype */}
      <div className="phone-area">
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
    </div>
  );
}
