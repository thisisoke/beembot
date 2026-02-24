import type { ReactNode } from 'react';
import './PhoneContainer.css';

interface PhoneContainerProps {
  children: ReactNode;
}

export function PhoneContainer({ children }: PhoneContainerProps) {
  return (
    <div className="phone-wrapper">
      <div className="phone-frame">
        <div className="phone-notch" />
        <div className="phone-screen">
          {children}
        </div>
      </div>
    </div>
  );
}
