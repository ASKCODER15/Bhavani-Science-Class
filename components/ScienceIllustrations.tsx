'use client';

import React from 'react';

// Hero illustration for Faculty Dashboard (Daily Hub)
// Displays stacked leather books (Physics, Chemistry, Mathematics),
// optical glass prism with rainbow spectrum, golden atom with orbiting electrons,
// chalkboard with E=mc², pencils in holder, and botanical laurel branches.
export const FacultyHeroIllustration: React.FC<{ className?: string }> = ({ className = 'w-full h-auto' }) => {
  return (
    <svg
      viewBox="0 0 420 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Science illustration with stacked books, glass prism, and golden atom"
    >
      <defs>
        {/* Warm golden background glow */}
        <radialGradient id="heroGlow" cx="65%" cy="45%" r="55%">
          <stop offset="0%" stopColor="#FDE68A" stopOpacity="0.45" />
          <stop offset="60%" stopColor="#FEF3C7" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#FFFBEB" stopOpacity="0" />
        </radialGradient>

        {/* Gold foil for book lettering */}
        <linearGradient id="goldSpine" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#F59E0B" />
          <stop offset="50%" stopColor="#FDE68A" />
          <stop offset="100%" stopColor="#D97706" />
        </linearGradient>

        {/* Prism glass gradient */}
        <linearGradient id="prismGlass" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.9" />
          <stop offset="40%" stopColor="#E0F2FE" stopOpacity="0.7" />
          <stop offset="100%" stopColor="#BAE6FD" stopOpacity="0.5" />
        </linearGradient>

        {/* Rainbow spectrum dispersion */}
        <linearGradient id="rainbowGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#EF4444" />
          <stop offset="18%" stopColor="#F97316" />
          <stop offset="35%" stopColor="#FBBF24" />
          <stop offset="52%" stopColor="#10B981" />
          <stop offset="70%" stopColor="#06B6D4" />
          <stop offset="85%" stopColor="#3B82F6" />
          <stop offset="100%" stopColor="#8B5CF6" />
        </linearGradient>

        {/* Leather burgundy book covers */}
        <linearGradient id="bookBurgundy" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#5D1025" />
          <stop offset="50%" stopColor="#85152F" />
          <stop offset="100%" stopColor="#4A0D1D" />
        </linearGradient>

        <linearGradient id="bookCrimson" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#7A1E2D" />
          <stop offset="50%" stopColor="#991B33" />
          <stop offset="100%" stopColor="#5C1322" />
        </linearGradient>

        <linearGradient id="bookNavy" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#1E1B4B" />
          <stop offset="50%" stopColor="#312E81" />
          <stop offset="100%" stopColor="#0F172A" />
        </linearGradient>

        <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* Ambient warm radiant background */}
      <rect x="0" y="0" width="420" height="200" fill="url(#heroGlow)" />

      {/* Constellation & celestial geometry lines in background */}
      <g stroke="#E5A332" strokeWidth="0.75" strokeOpacity="0.4" strokeDasharray="3 3">
        <circle cx="80" cy="50" r="28" />
        <line x1="80" y1="22" x2="130" y2="45" />
        <line x1="130" y1="45" x2="160" y2="25" />
        <circle cx="130" cy="45" r="2" fill="#E5A332" />
        <circle cx="160" cy="25" r="1.5" fill="#E5A332" />
        <circle cx="210" cy="40" r="1.5" fill="#E5A332" />
        <line x1="160" y1="25" x2="210" y2="40" />
      </g>

      {/* Chalkboard blackboard backdrop with equation */}
      <g opacity="0.85">
        <rect x="330" y="15" width="80" height="60" rx="4" fill="#292524" />
        <rect x="332" y="17" width="76" height="56" rx="3" fill="#1C1917" stroke="#78350F" strokeWidth="1.5" />
        {/* Chalk equation */}
        <text
          x="345"
          y="45"
          fill="#FEF3C7"
          fontFamily="Georgia, serif"
          fontStyle="italic"
          fontSize="14"
          letterSpacing="0.5"
          opacity="0.9"
        >
          E = mc²
        </text>
        {/* Chalk atom sketch */}
        <ellipse cx="370" cy="52" rx="14" ry="4" stroke="#FDE68A" strokeWidth="0.75" opacity="0.6" transform="rotate(-15 370 52)" />
        <circle cx="370" cy="52" r="1.5" fill="#FDE68A" opacity="0.8" />
      </g>

      {/* 3D Golden Atom Model with Orbiting Electrons */}
      <g transform="translate(315, 65)">
        {/* Central glowing golden nucleus */}
        <circle cx="0" cy="0" r="9" fill="url(#goldSpine)" filter="url(#softGlow)" />
        <circle cx="0" cy="0" r="6" fill="#F59E0B" />
        <circle cx="-2" cy="-2" r="2.5" fill="#FEF3C7" />

        {/* Orbit Ring 1 */}
        <ellipse
          cx="0"
          cy="0"
          rx="38"
          ry="14"
          stroke="#D97706"
          strokeWidth="1.75"
          fill="none"
          transform="rotate(0)"
        />
        <circle cx="36" cy="0" r="3" fill="#F59E0B" filter="url(#softGlow)" />
        <circle cx="36" cy="0" r="1.5" fill="#FFFFFF" />

        {/* Orbit Ring 2 */}
        <ellipse
          cx="0"
          cy="0"
          rx="38"
          ry="14"
          stroke="#D97706"
          strokeWidth="1.75"
          fill="none"
          transform="rotate(60)"
        />
        <circle cx="-19" cy="33" r="3" fill="#F59E0B" filter="url(#softGlow)" />
        <circle cx="-19" cy="33" r="1.5" fill="#FFFFFF" />

        {/* Orbit Ring 3 */}
        <ellipse
          cx="0"
          cy="0"
          rx="38"
          ry="14"
          stroke="#D97706"
          strokeWidth="1.75"
          fill="none"
          transform="rotate(120)"
        />
        <circle cx="-19" cy="-33" r="3" fill="#F59E0B" filter="url(#softGlow)" />
        <circle cx="-19" cy="-33" r="1.5" fill="#FFFFFF" />
      </g>

      {/* Stacked Classical Science Books */}
      <g transform="translate(180, 85)">
        {/* Book 1 (Bottom): MATHEMATICS */}
        <g transform="translate(0, 52)">
          {/* Book shadow */}
          <rect x="5" y="18" width="160" height="6" rx="3" fill="#000000" opacity="0.2" />
          {/* Book spine */}
          <rect x="0" y="0" width="165" height="20" rx="3" fill="url(#bookNavy)" />
          {/* Gold page edges on right */}
          <rect x="155" y="2" width="10" height="16" fill="#FEF3C7" stroke="#D97706" strokeWidth="0.5" />
          {/* Gold foil text */}
          <text
            x="32"
            y="14"
            fill="url(#goldSpine)"
            fontFamily="'Plus Jakarta Sans', sans-serif"
            fontSize="9"
            fontWeight="bold"
            letterSpacing="2"
          >
            MATHEMATICS
          </text>
          {/* Gold ornamental corner lines */}
          <line x1="8" y1="2" x2="8" y2="18" stroke="url(#goldSpine)" strokeWidth="0.75" />
          <line x1="150" y1="2" x2="150" y2="18" stroke="url(#goldSpine)" strokeWidth="0.75" />
        </g>

        {/* Book 2 (Middle): CHEMISTRY */}
        <g transform="translate(6, 26)">
          <rect x="0" y="0" width="155" height="20" rx="3" fill="url(#bookCrimson)" />
          <rect x="146" y="2" width="9" height="16" fill="#FEF3C7" stroke="#D97706" strokeWidth="0.5" />
          <text
            x="34"
            y="14"
            fill="url(#goldSpine)"
            fontFamily="'Plus Jakarta Sans', sans-serif"
            fontSize="9"
            fontWeight="bold"
            letterSpacing="2"
          >
            CHEMISTRY
          </text>
          <line x1="8" y1="2" x2="8" y2="18" stroke="url(#goldSpine)" strokeWidth="0.75" />
          <line x1="140" y1="2" x2="140" y2="18" stroke="url(#goldSpine)" strokeWidth="0.75" />
        </g>

        {/* Book 3 (Top): PHYSICS */}
        <g transform="translate(14, 0)">
          <rect x="0" y="0" width="145" height="20" rx="3" fill="url(#bookBurgundy)" />
          <rect x="136" y="2" width="9" height="16" fill="#FEF3C7" stroke="#D97706" strokeWidth="0.5" />
          <text
            x="36"
            y="14"
            fill="url(#goldSpine)"
            fontFamily="'Plus Jakarta Sans', sans-serif"
            fontSize="9"
            fontWeight="bold"
            letterSpacing="2"
          >
            PHYSICS
          </text>
          <line x1="8" y1="2" x2="8" y2="18" stroke="url(#goldSpine)" strokeWidth="0.75" />
          <line x1="130" y1="2" x2="130" y2="18" stroke="url(#goldSpine)" strokeWidth="0.75" />
        </g>
      </g>

      {/* Optical Glass Triangular Prism with Refracting Rainbow */}
      <g transform="translate(290, 80)">
        {/* White Incident Light Ray */}
        <line x1="-30" y1="25" x2="20" y2="35" stroke="#FFFFFF" strokeWidth="2.5" opacity="0.9" filter="url(#softGlow)" />

        {/* Triangular Prism 3D faces */}
        {/* Back/base face */}
        <polygon points="20,10 65,45 10,55" fill="#93C5FD" opacity="0.4" />
        {/* Front face */}
        <polygon points="20,10 75,50 35,62" fill="url(#prismGlass)" stroke="#FFFFFF" strokeWidth="1" />
        {/* Left refraction face */}
        <polygon points="20,10 10,55 35,62" fill="#E0F2FE" opacity="0.7" stroke="#BAE6FD" strokeWidth="0.75" />

        {/* Refracted Dispersion Rainbow Fan */}
        <polygon
          points="55,42 125,15 130,45 60,48"
          fill="url(#rainbowGrad)"
          opacity="0.9"
          filter="url(#softGlow)"
        />

        {/* Individual spectral lines for crisp detail */}
        <path d="M 56 42 Q 90 32 125 15" stroke="#EF4444" strokeWidth="1.5" fill="none" opacity="0.95" />
        <path d="M 57 43 Q 92 34 126 20" stroke="#F97316" strokeWidth="1.5" fill="none" opacity="0.95" />
        <path d="M 58 44 Q 94 36 127 25" stroke="#FBBF24" strokeWidth="1.5" fill="none" opacity="0.95" />
        <path d="M 59 45 Q 96 38 128 30" stroke="#10B981" strokeWidth="1.5" fill="none" opacity="0.95" />
        <path d="M 60 46 Q 98 40 129 35" stroke="#06B6D4" strokeWidth="1.5" fill="none" opacity="0.95" />
        <path d="M 61 47 Q 100 42 130 40" stroke="#3B82F6" strokeWidth="1.5" fill="none" opacity="0.95" />
        <path d="M 62 48 Q 102 44 131 45" stroke="#8B5CF6" strokeWidth="1.5" fill="none" opacity="0.95" />
      </g>

      {/* Pencil & Pen Brass Holder with Writing Utensils */}
      <g transform="translate(378, 92)">
        {/* Brass Cup */}
        <rect x="0" y="24" width="28" height="32" rx="4" fill="#78350F" />
        <rect x="2" y="26" width="24" height="28" rx="3" fill="#D97706" />
        <rect x="4" y="28" width="8" height="24" fill="#FDE68A" opacity="0.4" />
        {/* Pencils & Pens */}
        <line x1="8" y1="8" x2="10" y2="24" stroke="#DC2626" strokeWidth="4" strokeLinecap="round" />
        <polygon points="7,8 9,8 8,4" fill="#FDE047" />
        <line x1="16" y1="4" x2="14" y2="24" stroke="#2563EB" strokeWidth="3" strokeLinecap="round" />
        <polygon points="15,4 17,4 16,1" fill="#FDE047" />
        <line x1="22" y1="10" x2="18" y2="24" stroke="#10B981" strokeWidth="3.5" strokeLinecap="round" />
        <polygon points="21,10 23,10 22,6" fill="#FDE047" />
      </g>

      {/* Botanical Olive / Laurel Branches Flourish */}
      <g stroke="#166534" fill="#22C55E" opacity="0.75" transform="translate(230, 75)">
        <path d="M 0 10 Q 15 0 35 2" stroke="#166534" strokeWidth="1.5" fill="none" />
        <ellipse cx="8" cy="4" rx="4" ry="2" transform="rotate(-30 8 4)" />
        <ellipse cx="18" cy="2" rx="4" ry="2" transform="rotate(-15 18 2)" />
        <ellipse cx="28" cy="3" rx="4" ry="2" transform="rotate(10 28 3)" />
        <ellipse cx="12" cy="9" rx="4" ry="2" transform="rotate(35 12 9)" />
        <ellipse cx="24" cy="7" rx="4" ry="2" transform="rotate(25 24 7)" />
      </g>

      {/* Brass Fountain Pen lying on foreground */}
      <g transform="translate(260, 158) rotate(-6)">
        <rect x="0" y="2" width="75" height="6" rx="2" fill="#78350F" />
        <rect x="15" y="1" width="12" height="8" rx="1" fill="#F59E0B" />
        <polygon points="75,2 75,8 88,5" fill="#D97706" />
        <polygon points="85,4 85,6 88,5" fill="#1C1917" />
      </g>
    </svg>
  );
};

// Physics Class Card Illustration: Triangular Prism & Light Ray
export const PrismRayOpticsIllustration: React.FC<{ className?: string }> = ({ className = 'w-14 h-14' }) => {
  return (
    <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <rect width="80" height="80" rx="16" fill="#FEF3C7" fillOpacity="0.6" />
      {/* Light ray in */}
      <line x1="8" y1="42" x2="30" y2="40" stroke="#F59E0B" strokeWidth="2" strokeDasharray="3 2" />
      {/* Glass Prism */}
      <polygon points="32,20 62,60 18,60" fill="#E0F2FE" stroke="#38BDF8" strokeWidth="1.5" />
      <polygon points="32,20 62,60 40,60" fill="#BAE6FD" opacity="0.6" />
      {/* Refracted rainbow spectrum out */}
      <line x1="45" y1="48" x2="74" y2="34" stroke="#EF4444" strokeWidth="1.5" />
      <line x1="46" y1="50" x2="74" y2="38" stroke="#F97316" strokeWidth="1.5" />
      <line x1="47" y1="52" x2="74" y2="42" stroke="#FBBF24" strokeWidth="1.5" />
      <line x1="48" y1="54" x2="74" y2="46" stroke="#10B981" strokeWidth="1.5" />
      <line x1="49" y1="56" x2="74" y2="50" stroke="#3B82F6" strokeWidth="1.5" />
      <line x1="50" y1="58" x2="74" y2="54" stroke="#8B5CF6" strokeWidth="1.5" />
      {/* Sparkle */}
      <circle cx="22" cy="24" r="1.5" fill="#F59E0B" />
      <circle cx="68" cy="22" r="1.5" fill="#F59E0B" />
    </svg>
  );
};

// Chemistry Class Card Illustration: 3D Coordination Molecule
export const ChemistryMoleculesIllustration: React.FC<{ className?: string }> = ({ className = 'w-14 h-14' }) => {
  return (
    <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <rect width="80" height="80" rx="16" fill="#FEF3C7" fillOpacity="0.6" />
      {/* Bond lines */}
      <g stroke="#94A3B8" strokeWidth="2.5" strokeLinecap="round">
        <line x1="40" y1="36" x2="22" y2="24" />
        <line x1="40" y1="36" x2="58" y2="24" />
        <line x1="40" y1="36" x2="40" y2="56" />
        <line x1="40" y1="56" x2="22" y2="66" />
        <line x1="40" y1="56" x2="58" y2="66" />
      </g>
      {/* Central Atom (Cobalt/Iron complex) */}
      <circle cx="40" cy="36" r="9" fill="#D97706" />
      <circle cx="37" cy="33" r="3" fill="#FDE68A" />

      {/* Ligand Atoms (Oxygen / Nitrogen) */}
      <circle cx="22" cy="24" r="7" fill="#DC2626" />
      <circle cx="20" cy="22" r="2.5" fill="#FECACA" />

      <circle cx="58" cy="24" r="7" fill="#DC2626" />
      <circle cx="56" cy="22" r="2.5" fill="#FECACA" />

      <circle cx="40" cy="56" r="8" fill="#D97706" />
      <circle cx="37" cy="53" r="2.5" fill="#FDE68A" />

      <circle cx="22" cy="66" r="7" fill="#DC2626" />
      <circle cx="20" cy="64" r="2.5" fill="#FECACA" />

      <circle cx="58" cy="66" r="7" fill="#DC2626" />
      <circle cx="56" cy="64" r="2.5" fill="#FECACA" />
    </svg>
  );
};

// Mathematics Class Card Illustration: Definite Integration Graph
export const MathsIntegrationIllustration: React.FC<{ className?: string }> = ({ className = 'w-14 h-14' }) => {
  return (
    <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <rect width="80" height="80" rx="16" fill="#EDE9FE" fillOpacity="0.6" />
      {/* Grid lines */}
      <g stroke="#C4B5FD" strokeWidth="0.5" strokeDasharray="2 2" opacity="0.6">
        <line x1="22" y1="18" x2="22" y2="62" />
        <line x1="38" y1="18" x2="38" y2="62" />
        <line x1="54" y1="18" x2="54" y2="62" />
        <line x1="14" y1="30" x2="68" y2="30" />
        <line x1="14" y1="46" x2="68" y2="46" />
      </g>
      {/* Axes */}
      <line x1="16" y1="62" x2="70" y2="62" stroke="#6D28D9" strokeWidth="1.5" />
      <line x1="16" y1="62" x2="16" y2="16" stroke="#6D28D9" strokeWidth="1.5" />
      {/* Area under curve shaded */}
      <path
        d="M 22 62 Q 35 62 42 42 T 62 26 L 62 62 Z"
        fill="#8B5CF6"
        fillOpacity="0.25"
      />
      {/* Shading vertical hatch lines */}
      <g stroke="#7C3AED" strokeWidth="0.75" opacity="0.5">
        <line x1="26" y1="62" x2="26" y2="58" />
        <line x1="30" y1="62" x2="30" y2="54" />
        <line x1="34" y1="62" x2="34" y2="48" />
        <line x1="38" y1="62" x2="38" y2="44" />
        <line x1="42" y1="62" x2="42" y2="42" />
        <line x1="46" y1="62" x2="46" y2="38" />
        <line x1="50" y1="62" x2="50" y2="34" />
        <line x1="54" y1="62" x2="54" y2="31" />
        <line x1="58" y1="62" x2="58" y2="28" />
      </g>
      {/* Function curve line */}
      <path
        d="M 16 62 Q 35 62 42 42 T 66 22"
        stroke="#6D28D9"
        strokeWidth="2"
        fill="none"
      />
      {/* Integral symbol */}
      <text x="18" y="26" fill="#5B21B6" fontFamily="Georgia, serif" fontStyle="italic" fontSize="11" fontWeight="bold">
        ∫
      </text>
    </svg>
  );
};

// Realistic 3D Animated Science Laboratory Hero for Login Screen
export const LoginNewtonHeroIllustration: React.FC<{ className?: string }> = ({ className = 'w-full h-auto' }) => {
  const [tilt, setTilt] = React.useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 16;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * -16;
    setTilt({ x: Math.round(y * 10) / 10, y: Math.round(x * 10) / 10 });
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!containerRef.current || !e.touches[0]) return;
    const touch = e.touches[0];
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((touch.clientX - rect.left) / rect.width - 0.5) * 14;
    const y = ((touch.clientY - rect.top) / rect.height - 0.5) * -14;
    setTilt({ x: Math.round(y * 10) / 10, y: Math.round(x * 10) / 10 });
  };

  const handleReset = () => {
    setIsHovered(false);
    setTilt({ x: 0, y: 0 });
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleReset}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleReset}
      className="relative w-full select-none cursor-pointer group"
      style={{ perspective: '1000px' }}
      aria-label="Interactive 3D animated science hero with quantum atom, optical prism, and stacked physics volumes"
    >
      <div
        className="transition-transform duration-300 ease-out"
        style={{
          transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) ${isHovered ? 'scale(1.02)' : 'scale(1)'}`,
          transformStyle: 'preserve-3d',
        }}
      >
        <svg
          viewBox="0 0 400 190"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={`${className} transition-shadow duration-300 drop-shadow-[0_12px_24px_rgba(93,16,37,0.18)]`}
        >
          <defs>
            {/* Deep Warm Sunlight Gradient */}
            <radialGradient id="loginGlow" cx="50%" cy="45%" r="65%">
              <stop offset="0%" stopColor="#FFF2D6" stopOpacity="1" />
              <stop offset="45%" stopColor="#FDE6B4" stopOpacity="0.85" />
              <stop offset="80%" stopColor="#F7D896" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#FAF7EE" stopOpacity="0.2" />
            </radialGradient>

            {/* 3D Gold Foil Gradient for Book Spines */}
            <linearGradient id="gold3D" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#B45309" />
              <stop offset="25%" stopColor="#F59E0B" />
              <stop offset="50%" stopColor="#FEF3C7" />
              <stop offset="75%" stopColor="#F59E0B" />
              <stop offset="100%" stopColor="#92400E" />
            </linearGradient>

            {/* 3D Deep Burgundy Leather */}
            <linearGradient id="bookBurgundy3D" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#7A152E" />
              <stop offset="30%" stopColor="#5D1025" />
              <stop offset="70%" stopColor="#450A19" />
              <stop offset="100%" stopColor="#2E040E" />
            </linearGradient>

            {/* 3D Ruby Red Leather */}
            <linearGradient id="bookRuby3D" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#C41D44" />
              <stop offset="35%" stopColor="#9E1637" />
              <stop offset="75%" stopColor="#780F27" />
              <stop offset="100%" stopColor="#4A0615" />
            </linearGradient>

            {/* 3D Deep Navy Mathematics Leather */}
            <linearGradient id="bookNavy3D" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#2A2468" />
              <stop offset="35%" stopColor="#1E1B4B" />
              <stop offset="75%" stopColor="#151238" />
              <stop offset="100%" stopColor="#0B0920" />
            </linearGradient>

            {/* 3D Emerald Biology Leather */}
            <linearGradient id="bookEmerald3D" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#1C6639" />
              <stop offset="35%" stopColor="#14532D" />
              <stop offset="75%" stopColor="#0E3D20" />
              <stop offset="100%" stopColor="#072412" />
            </linearGradient>

            {/* 3D Optical Glass Prism Gradient with Specular Sheen */}
            <linearGradient id="prismFaceLeft" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95" />
              <stop offset="35%" stopColor="#E0F2FE" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#BAE6FD" stopOpacity="0.6" />
            </linearGradient>

            <linearGradient id="prismFaceRight" x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#F8FAFC" stopOpacity="0.9" />
              <stop offset="50%" stopColor="#93C5FD" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#38BDF8" stopOpacity="0.7" />
            </linearGradient>

            {/* Rainbow Spectrum Caustics */}
            <linearGradient id="spectrumBeam" x1="0%" y1="0%" x2="100%" y2="50%">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.9" />
              <stop offset="18%" stopColor="#EF4444" stopOpacity="0.85" />
              <stop offset="34%" stopColor="#F97316" stopOpacity="0.85" />
              <stop offset="50%" stopColor="#FACC15" stopOpacity="0.85" />
              <stop offset="66%" stopColor="#10B981" stopOpacity="0.85" />
              <stop offset="82%" stopColor="#38BDF8" stopOpacity="0.85" />
              <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.85" />
            </linearGradient>

            {/* Soft 3D Glow Filter */}
            <filter id="glow3D" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="3.5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>

            <filter id="intenseGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>

            {/* Embedded Pure CSS Animation Keyframes for 60fps Native Realism */}
            <style>{`
              @keyframes orbitSpin1 {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
              @keyframes orbitSpin2 {
                0% { transform: rotate(60deg) rotateZ(0deg); }
                100% { transform: rotate(60deg) rotateZ(360deg); }
              }
              @keyframes orbitSpin3 {
                0% { transform: rotate(-60deg) rotateZ(0deg); }
                100% { transform: rotate(-60deg) rotateZ(360deg); }
              }
              @keyframes pulseCore {
                0%, 100% { transform: scale(1); filter: drop-shadow(0 0 6px #F59E0B); }
                50% { transform: scale(1.18); filter: drop-shadow(0 0 16px #FBBF24); }
              }
              @keyframes laserShimmer {
                0%, 100% { opacity: 0.8; stroke-width: 2; }
                50% { opacity: 1; stroke-width: 3; filter: drop-shadow(0 0 6px #FFF); }
              }
              @keyframes rainbowCaustic {
                0%, 100% { opacity: 0.75; transform: scaleY(1); }
                50% { opacity: 0.95; transform: scaleY(1.08); filter: drop-shadow(0 0 10px rgba(245,158,11,0.6)); }
              }
              @keyframes floatPhoton1 {
                0%, 100% { transform: translateY(0px) translateX(0px); opacity: 0.4; }
                50% { transform: translateY(-8px) translateX(3px); opacity: 0.9; }
              }
              @keyframes floatPhoton2 {
                0%, 100% { transform: translateY(0px) translateX(0px); opacity: 0.3; }
                50% { transform: translateY(-12px) translateX(-4px); opacity: 0.85; }
              }
              @keyframes floatPhoton3 {
                0%, 100% { transform: translateY(0px) translateX(0px); opacity: 0.5; }
                50% { transform: translateY(-10px) translateX(5px); opacity: 1; }
              }
              @keyframes bubbleRise1 {
                0% { transform: translateY(0px); opacity: 0; }
                30% { opacity: 0.8; }
                100% { transform: translateY(-22px); opacity: 0; }
              }
              @keyframes bubbleRise2 {
                0% { transform: translateY(0px); opacity: 0; }
                30% { opacity: 0.8; }
                100% { transform: translateY(-26px); opacity: 0; }
              }
              .atom-nucleus {
                transform-origin: 300px 75px;
                animation: pulseCore 3s ease-in-out infinite;
              }
              .orbit-ring-1 {
                transform-origin: 300px 75px;
                animation: orbitSpin1 6s linear infinite;
              }
              .orbit-ring-2 {
                transform-origin: 300px 75px;
                animation: orbitSpin2 8.5s linear infinite;
              }
              .orbit-ring-3 {
                transform-origin: 300px 75px;
                animation: orbitSpin3 7s linear infinite;
              }
              .laser-beam {
                animation: laserShimmer 2.5s ease-in-out infinite;
              }
              .rainbow-spectrum {
                transform-origin: 195px 125px;
                animation: rainbowCaustic 3.2s ease-in-out infinite;
              }
              .photon-1 { animation: floatPhoton1 4s ease-in-out infinite; }
              .photon-2 { animation: floatPhoton2 3.2s ease-in-out infinite 1s; }
              .photon-3 { animation: floatPhoton3 4.5s ease-in-out infinite 0.5s; }
              .flask-bubble-1 { animation: bubbleRise1 2.8s ease-in infinite 0.2s; }
              .flask-bubble-2 { animation: bubbleRise2 3.4s ease-in infinite 1.4s; }
            `}</style>
          </defs>

          {/* LAYER 0: Ambient Warm Radiance Floor and Background Glow */}
          <rect x="0" y="0" width="400" height="190" rx="16" fill="url(#loginGlow)" />

          {/* Perspective 3D Wood Desk Surface / Laboratory Table */}
          <path
            d="M 0 145 L 400 145 L 400 190 L 0 190 Z"
            fill="#EFE4CF"
            stroke="#DFCBB0"
            strokeWidth="1"
          />
          {/* Desk Edge Highlight & 3D Bevel */}
          <line x1="0" y1="145" x2="400" y2="145" stroke="#FFFFFF" strokeWidth="1.5" strokeOpacity="0.8" />
          <line x1="0" y1="148" x2="400" y2="148" stroke="#D1BEA2" strokeWidth="1" />

          {/* Celestial Astrolabe / Coordinate Rings in Background */}
          <g opacity="0.35" stroke="#D97706" strokeWidth="0.75" strokeDasharray="3 3">
            <circle cx="300" cy="75" r="58" />
            <circle cx="300" cy="75" r="74" strokeDasharray="2 4" />
            <line x1="220" y1="75" x2="380" y2="75" strokeWidth="0.5" />
            <line x1="300" y1="0" x2="300" y2="150" strokeWidth="0.5" />
          </g>

          {/* Classical Chalkboard on Right Backdrop with Gold Border */}
          <g transform="translate(232, 16)">
            {/* 3D Chalkboard Frame with Cast Shadow */}
            <rect x="0" y="0" width="158" height="118" rx="8" fill="#1C1816" stroke="#92400E" strokeWidth="2.5" />
            <rect x="3" y="3" width="152" height="112" rx="6" fill="#181514" stroke="#78350F" strokeWidth="1" />
            
            {/* Subtle chalkboard grid & chalk equations */}
            <g opacity="0.45" stroke="#FEF3C7" strokeWidth="0.6" strokeDasharray="2 3">
              <line x1="8" y1="28" x2="148" y2="28" />
              <line x1="8" y1="58" x2="148" y2="58" />
              <line x1="8" y1="88" x2="148" y2="88" />
            </g>

            {/* Glowing Chalk Formulae */}
            <text x="12" y="24" fill="#FDE68A" fontFamily="Georgia, serif" fontStyle="italic" fontSize="9" opacity="0.85">
              E = mc² • ∇×B = μ₀J
            </text>
            <text x="12" y="106" fill="#FDE68A" fontFamily="Georgia, serif" fontStyle="italic" fontSize="8.5" opacity="0.85">
              λ = h/p • Concept First
            </text>
          </g>

          {/* LAYER 1: 3D OPTICAL GLASS PRISM & RAY REFRACTION (Center Desk) */}
          <g transform="translate(140, 78)">
            {/* Desk Contact Shadow for Prism */}
            <ellipse cx="45" cy="65" rx="36" ry="7" fill="#85152F" fillOpacity="0.12" filter="url(#glow3D)" />

            {/* Incident White Light Beam */}
            <path
              d="M -40 25 L 32 40"
              stroke="#FFFFFF"
              strokeWidth="2.5"
              strokeLinecap="round"
              className="laser-beam"
              filter="url(#glow3D)"
            />

            {/* Dispersed Spectral Rainbow Caustics spreading to right desk */}
            <path
              d="M 52 42 L 135 52 L 138 68 L 50 48 Z"
              fill="url(#spectrumBeam)"
              className="rainbow-spectrum"
            />

            {/* 3D Faceted Glass Prism Trihedron */}
            {/* Back Base Shadow */}
            <path d="M 18 62 L 68 62 L 44 14 Z" fill="#93C5FD" fillOpacity="0.3" />

            {/* Left Glass Facet (Refracting Incident Beam) */}
            <path
              d="M 18 62 L 44 14 L 42 62 Z"
              fill="url(#prismFaceLeft)"
              stroke="#FFFFFF"
              strokeWidth="1.25"
            />

            {/* Right Glass Facet (Dispersing Spectrum) */}
            <path
              d="M 44 14 L 72 62 L 42 62 Z"
              fill="url(#prismFaceRight)"
              stroke="#BAE6FD"
              strokeWidth="1"
            />

            {/* Sharp Specular Apex Glint on Prism Tip */}
            <circle cx="44" cy="14" r="2.5" fill="#FFFFFF" filter="url(#glow3D)" />
            <line x1="44" y1="14" x2="42" y2="62" stroke="#FFFFFF" strokeWidth="1" strokeOpacity="0.7" />
          </g>

          {/* LAYER 2: 3D ERLENMEYER CHEMISTRY FLASK (Between Books & Prism) */}
          <g transform="translate(108, 92)">
            {/* Flask Shadow */}
            <ellipse cx="18" cy="50" rx="16" ry="4" fill="#000" fillOpacity="0.15" />

            {/* Glowing Emerald Fluid Body */}
            <path
              d="M 12 18 L 4 44 C 3 47 6 50 10 50 L 26 50 C 30 50 33 47 32 44 L 24 18 Z"
              fill="url(#bookEmerald3D)"
              fillOpacity="0.85"
            />
            {/* Fluid Meniscus Level */}
            <ellipse cx="18" cy="36" rx="10" ry="2.5" fill="#34D399" fillOpacity="0.9" />

            {/* Transparent Glass Outline with Highlights */}
            <path
              d="M 14 6 L 14 18 L 3 44 C 2 48 5 52 10 52 L 26 52 C 31 52 34 48 33 44 L 22 18 L 22 6 Z"
              fill="#FFFFFF"
              fillOpacity="0.2"
              stroke="#FFFFFF"
              strokeWidth="1.25"
            />
            {/* Flask Rim */}
            <ellipse cx="18" cy="6" rx="4.5" ry="1.5" fill="#FFFFFF" stroke="#6EE7B7" strokeWidth="1" />

            {/* Animated Chemistry Bubbles */}
            <circle cx="16" cy="42" r="1.5" fill="#A7F3D0" className="flask-bubble-1" />
            <circle cx="21" cy="40" r="1.2" fill="#ECFDF5" className="flask-bubble-2" />
          </g>

          {/* LAYER 3: 3D REALISTIC STACKED LEATHER VOLUMES (Foreground Left) */}
          <g transform="translate(12, 68)">
            {/* Deep Desk Cast Shadow */}
            <ellipse cx="68" cy="88" rx="64" ry="9" fill="#450A19" fillOpacity="0.25" filter="url(#glow3D)" />

            {/* BOOK 1: BIOLOGY (Bottom Jade Volume) */}
            <g transform="translate(0, 56)">
              {/* 3D Curved Spine */}
              <rect x="0" y="0" width="118" height="19" rx="3.5" fill="url(#bookEmerald3D)" stroke="#0E3D20" strokeWidth="0.75" />
              {/* Gold Embossed Spine Bands & Foil Text */}
              <line x1="12" y1="0" x2="12" y2="19" stroke="url(#gold3D)" strokeWidth="1.5" />
              <line x1="15" y1="0" x2="15" y2="19" stroke="url(#gold3D)" strokeWidth="0.75" />
              <line x1="102" y1="0" x2="102" y2="19" stroke="url(#gold3D)" strokeWidth="1.5" />
              <text x="24" y="13" fill="url(#gold3D)" fontFamily="'Plus Jakarta Sans', sans-serif" fontSize="7.5" fontWeight="900" letterSpacing="1.8">
                BIOLOGY • NEET
              </text>
              {/* 3D Gilded Paper Block on Right Edge */}
              <path d="M 118 2 L 126 5 L 126 15 L 118 17 Z" fill="#FEF3C7" stroke="#D4AF37" strokeWidth="0.5" />
            </g>

            {/* BOOK 2: MATHEMATICS (Deep Royal Navy Volume) */}
            <g transform="translate(3, 38)">
              <rect x="0" y="0" width="116" height="19" rx="3.5" fill="url(#bookNavy3D)" stroke="#0B0920" strokeWidth="0.75" />
              <line x1="12" y1="0" x2="12" y2="19" stroke="url(#gold3D)" strokeWidth="1.5" />
              <line x1="100" y1="0" x2="100" y2="19" stroke="url(#gold3D)" strokeWidth="1.5" />
              <text x="20" y="13" fill="url(#gold3D)" fontFamily="'Plus Jakarta Sans', sans-serif" fontSize="7.5" fontWeight="900" letterSpacing="1.8">
                MATHEMATICS • JEE
              </text>
              <path d="M 116 2 L 124 5 L 124 15 L 116 17 Z" fill="#FEF3C7" stroke="#D4AF37" strokeWidth="0.5" />
            </g>

            {/* BOOK 3: CHEMISTRY (Ruby Red Volume) */}
            <g transform="translate(6, 20)">
              <rect x="0" y="0" width="114" height="19" rx="3.5" fill="url(#bookRuby3D)" stroke="#4A0615" strokeWidth="0.75" />
              <line x1="12" y1="0" x2="12" y2="19" stroke="url(#gold3D)" strokeWidth="1.5" />
              <line x1="98" y1="0" x2="98" y2="19" stroke="url(#gold3D)" strokeWidth="1.5" />
              <text x="22" y="13" fill="url(#gold3D)" fontFamily="'Plus Jakarta Sans', sans-serif" fontSize="7.5" fontWeight="900" letterSpacing="1.8">
                CHEMISTRY • XI-XII
              </text>
              <path d="M 114 2 L 122 5 L 122 15 L 114 17 Z" fill="#FEF3C7" stroke="#D4AF37" strokeWidth="0.5" />
            </g>

            {/* BOOK 4: PHYSICS (Top Rich Burgundy Master Volume) */}
            <g transform="translate(9, 2)">
              <rect x="0" y="0" width="112" height="19" rx="3.5" fill="url(#bookBurgundy3D)" stroke="#2E040E" strokeWidth="0.75" />
              <line x1="12" y1="0" x2="12" y2="19" stroke="url(#gold3D)" strokeWidth="1.5" />
              <line x1="15" y1="0" x2="15" y2="19" stroke="url(#gold3D)" strokeWidth="0.75" />
              <line x1="96" y1="0" x2="96" y2="19" stroke="url(#gold3D)" strokeWidth="1.5" />
              <text x="26" y="13" fill="url(#gold3D)" fontFamily="'Plus Jakarta Sans', sans-serif" fontSize="8" fontWeight="900" letterSpacing="2">
                PHYSICS • ELITE
              </text>
              <path d="M 112 2 L 120 5 L 120 15 L 112 17 Z" fill="#FEF3C7" stroke="#D4AF37" strokeWidth="0.5" />
              
              {/* Crimson Silk Bookmark Ribbon flowing across books */}
              <path
                d="M 75 0 C 75 8 82 18 84 32 C 86 42 78 52 79 58 L 86 54 L 89 60 C 86 52 89 42 87 30 C 85 18 78 8 78 0 Z"
                fill="#DC2626"
                stroke="#991B1B"
                strokeWidth="0.5"
              />
            </g>
          </g>

          {/* LAYER 4: 3D REAL-TIME ANIMATED QUANTUM ATOM (Hero Centerpiece Inside Chalkboard) */}
          <g>
            {/* Core Golden Ambient Glow Halo */}
            <circle cx="300" cy="75" r="38" fill="#F59E0B" fillOpacity="0.15" filter="url(#intenseGlow)" />

            {/* Orbit Ring 1 (Tilted 0 deg) */}
            <g className="orbit-ring-1">
              <ellipse
                cx="300"
                cy="75"
                rx="42"
                ry="15"
                stroke="#FDE68A"
                strokeWidth="1.5"
                strokeOpacity="0.85"
                fill="none"
              />
              {/* Golden Saffron Electron with Radiant Glow */}
              <circle cx="342" cy="75" r="3.5" fill="#F59E0B" filter="url(#glow3D)" />
              <circle cx="342" cy="75" r="1.5" fill="#FFFFFF" />
            </g>

            {/* Orbit Ring 2 (Tilted +60 deg) */}
            <g className="orbit-ring-2">
              <ellipse
                cx="300"
                cy="75"
                rx="42"
                ry="15"
                stroke="#67E8F9"
                strokeWidth="1.5"
                strokeOpacity="0.8"
                fill="none"
              />
              {/* Cyan Luminous Electron */}
              <circle cx="342" cy="75" r="3.2" fill="#06B6D4" filter="url(#glow3D)" />
              <circle cx="342" cy="75" r="1.5" fill="#E0F2FE" />
            </g>

            {/* Orbit Ring 3 (Tilted -60 deg) */}
            <g className="orbit-ring-3">
              <ellipse
                cx="300"
                cy="75"
                rx="42"
                ry="15"
                stroke="#F472B6"
                strokeWidth="1.5"
                strokeOpacity="0.8"
                fill="none"
              />
              {/* Ruby Neon Electron */}
              <circle cx="342" cy="75" r="3.2" fill="#E11D48" filter="url(#glow3D)" />
              <circle cx="342" cy="75" r="1.5" fill="#FFF1F2" />
            </g>

            {/* Quantum Glowing Nucleus (Protons & Neutrons Cluster) */}
            <g className="atom-nucleus">
              <circle cx="300" cy="75" r="7" fill="url(#gold3D)" filter="url(#intenseGlow)" />
              <circle cx="298" cy="73" r="3" fill="#FFFFFF" fillOpacity="0.8" />
              <circle cx="302" cy="76" r="2.5" fill="#B9193F" />
              <circle cx="300" cy="77" r="2.2" fill="#D97706" />
            </g>
          </g>

          {/* LAYER 5: FLOATING LUMINOUS STARDUST PHOTONS */}
          <g filter="url(#glow3D)">
            <circle cx="70" cy="45" r="2" fill="#F59E0B" className="photon-1" />
            <circle cx="160" cy="35" r="1.8" fill="#FDE68A" className="photon-2" />
            <circle cx="230" cy="50" r="2.2" fill="#60A5FA" className="photon-3" />
            <circle cx="370" cy="40" r="1.6" fill="#F43F5E" className="photon-1" />
            <circle cx="280" cy="135" r="2" fill="#FACC15" className="photon-2" />
          </g>

          {/* LAYER 6: 3D GLASSMORPHIC FLOATING BADGE (Top Left Parallax Accent) */}
          <g transform="translate(18, 14)">
            <rect
              x="0"
              y="0"
              width="92"
              height="22"
              rx="11"
              fill="#FFFFFF"
              fillOpacity="0.85"
              stroke="url(#gold3D)"
              strokeWidth="1.25"
              filter="url(#glow3D)"
            />
            {/* Tiny Atom Icon */}
            <circle cx="12" cy="11" r="5" fill="#85152F" />
            <circle cx="12" cy="11" r="2" fill="#F8CF72" />
            <text x="23" y="14.5" fill="#5D1025" fontFamily="'Plus Jakarta Sans', sans-serif" fontSize="8" fontWeight="900" letterSpacing="0.8">
              3D STEM LAB
            </text>
          </g>
        </svg>
      </div>
    </div>
  );
};

// Subtle Decorative Botanical Branch Sketch
export const BotanicalFlourish: React.FC<{ className?: string }> = ({ className = 'w-16 h-16' }) => {
  return (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path
        d="M 10 90 Q 50 70 85 15"
        stroke="#D97706"
        strokeWidth="1.5"
        strokeOpacity="0.4"
        fill="none"
      />
      <ellipse cx="32" cy="74" rx="10" ry="4" transform="rotate(-35 32 74)" fill="#FEF3C7" stroke="#D97706" strokeWidth="0.75" strokeOpacity="0.5" />
      <ellipse cx="50" cy="56" rx="11" ry="4.5" transform="rotate(-25 50 56)" fill="#FEF3C7" stroke="#D97706" strokeWidth="0.75" strokeOpacity="0.5" />
      <ellipse cx="68" cy="38" rx="11" ry="4.5" transform="rotate(-15 68 38)" fill="#FEF3C7" stroke="#D97706" strokeWidth="0.75" strokeOpacity="0.5" />
      <ellipse cx="80" cy="22" rx="9" ry="4" transform="rotate(-5 80 22)" fill="#FEF3C7" stroke="#D97706" strokeWidth="0.75" strokeOpacity="0.5" />
      <ellipse cx="40" cy="62" rx="9" ry="3.5" transform="rotate(35 40 62)" fill="#FEF3C7" stroke="#D97706" strokeWidth="0.75" strokeOpacity="0.5" />
      <ellipse cx="58" cy="46" rx="9" ry="3.5" transform="rotate(30 58 46)" fill="#FEF3C7" stroke="#D97706" strokeWidth="0.75" strokeOpacity="0.5" />
    </svg>
  );
};
