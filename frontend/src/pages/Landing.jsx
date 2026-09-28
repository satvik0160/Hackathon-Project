import React, { lazy, Suspense } from 'react';
import '../spiral-landing.css';

/* Lazy-load the 3D spiral experience so it never blocks first paint. */
const SpiralLandingExperience = lazy(() =>
  import('../components/landing/spiral/SpiralLandingExperience')
);

function SpiralLoader() {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#060612',
        color: '#d9af67',
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        fontSize: '1rem',
      }}
    >
      <div className="spinner spinner-lg" />
    </div>
  );
}

export default function Landing() {
  return (
    <Suspense fallback={<SpiralLoader />}>
      <SpiralLandingExperience />
    </Suspense>
  );
}
