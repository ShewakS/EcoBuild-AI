import React from 'react';

/**
 * BrandedLoader — animated SVG building outline that "draws itself"
 * using stroke-dashoffset animation. Consistent with the blueprint
 * visual language of the product.
 *
 * Props:
 *   size    — 'sm' | 'md' | 'lg'  (default 'md')
 *   message — optional string shown below the animation
 */
export default function BrandedLoader({ size = 'md', message = '' }) {
  const dimensions = { sm: 80, md: 120, lg: 160 };
  const dim = dimensions[size] || 120;

  return (
    <div
      className="flex flex-col items-center justify-center gap-4"
      style={{ padding: size === 'lg' ? '4rem' : '2rem' }}
      role="status"
      aria-label={message || 'Loading'}
    >
      <svg
        width={dim}
        height={dim}
        viewBox="0 0 120 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        {/* Ground line */}
        <line
          x1="8" y1="108" x2="112" y2="108"
          stroke="var(--concrete)" strokeWidth="1.5" strokeLinecap="round"
        />

        {/* Building outline — draws itself */}
        {/* Left wall */}
        <line x1="20" y1="108" x2="20" y2="30"
          stroke="var(--blueprint)" strokeWidth="1.5" strokeLinecap="round"
          strokeDasharray="90" strokeDashoffset="90"
          style={{ animation: 'draw 0.6s 0s ease-out forwards' }}
        />
        {/* Roof ridge left */}
        <line x1="20" y1="30" x2="60" y2="14"
          stroke="var(--blueprint)" strokeWidth="1.5" strokeLinecap="round"
          strokeDasharray="50" strokeDashoffset="50"
          style={{ animation: 'draw 0.5s 0.5s ease-out forwards' }}
        />
        {/* Roof ridge right */}
        <line x1="60" y1="14" x2="100" y2="30"
          stroke="var(--blueprint)" strokeWidth="1.5" strokeLinecap="round"
          strokeDasharray="50" strokeDashoffset="50"
          style={{ animation: 'draw 0.5s 0.9s ease-out forwards' }}
        />
        {/* Right wall */}
        <line x1="100" y1="30" x2="100" y2="108"
          stroke="var(--blueprint)" strokeWidth="1.5" strokeLinecap="round"
          strokeDasharray="90" strokeDashoffset="90"
          style={{ animation: 'draw 0.6s 1.3s ease-out forwards' }}
        />
        {/* Bottom */}
        <line x1="20" y1="108" x2="100" y2="108"
          stroke="var(--blueprint)" strokeWidth="1.5" strokeLinecap="round"
          strokeDasharray="90" strokeDashoffset="90"
          style={{ animation: 'draw 0.5s 1.8s ease-out forwards' }}
        />

        {/* Floor lines */}
        <line x1="20" y1="72" x2="100" y2="72"
          stroke="var(--concrete)" strokeWidth="1" strokeDasharray="3 4"
          strokeDashoffset="80"
          style={{ animation: 'draw 0.4s 2.2s ease-out forwards' }}
        />
        <line x1="20" y1="54" x2="100" y2="54"
          stroke="var(--concrete)" strokeWidth="1" strokeDasharray="3 4"
          strokeDashoffset="80"
          style={{ animation: 'draw 0.4s 2.4s ease-out forwards' }}
        />

        {/* Door */}
        <rect x="50" y="84" width="20" height="24"
          stroke="var(--blueprint-300, #7F9EDE)" strokeWidth="1" fill="none"
          opacity="0" style={{ animation: 'fadeIn 0.3s 2.6s ease forwards' }}
        />

        {/* Windows floor 1 */}
        <rect x="28" y="77" width="14" height="10"
          stroke="var(--concrete)" strokeWidth="1" fill="none"
          opacity="0" style={{ animation: 'fadeIn 0.3s 2.7s ease forwards' }}
        />
        <rect x="78" y="77" width="14" height="10"
          stroke="var(--concrete)" strokeWidth="1" fill="none"
          opacity="0" style={{ animation: 'fadeIn 0.3s 2.7s ease forwards' }}
        />

        {/* Windows floor 2 */}
        <rect x="28" y="59" width="14" height="10"
          stroke="var(--concrete)" strokeWidth="1" fill="none"
          opacity="0" style={{ animation: 'fadeIn 0.3s 2.9s ease forwards' }}
        />
        <rect x="78" y="59" width="14" height="10"
          stroke="var(--concrete)" strokeWidth="1" fill="none"
          opacity="0" style={{ animation: 'fadeIn 0.3s 2.9s ease forwards' }}
        />

        {/* Eco dot — appears last */}
        <circle cx="60" cy="14" r="3"
          fill="var(--eco)"
          opacity="0" style={{ animation: 'fadeIn 0.4s 3.1s ease forwards' }}
        />
      </svg>

      {message && (
        <p
          className="text-sm font-medium"
          style={{ color: 'var(--ink-muted)', fontFamily: 'var(--font-mono)' }}
        >
          {message}
        </p>
      )}
    </div>
  );
}
