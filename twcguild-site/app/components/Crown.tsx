export function Crown({ size = 38 }: { size?: number }) {
  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="TWC Guild crown emblem"
      style={{ filter: "drop-shadow(0 2px 7px rgba(0,0,0,.45))", flexShrink: 0 }}
    >
      <defs>
        <clipPath id="crown-clip">
          <rect x="1.5" y="1.5" width="97" height="97" rx="14" />
        </clipPath>
      </defs>
      <g clipPath="url(#crown-clip)">
        <rect x="1.5" y="1.5" width="97" height="97" fill="#0e1110" />
        <polygon points="1.5,1.5 44,1.5 16,44 1.5,30" fill="#1c2a14" />
        <polygon points="50,1.5 98.5,1.5 98.5,26 60,15" fill="#2c3f17" />
        <polygon points="98.5,34 98.5,98.5 60,98.5 98.5,58" fill="#1c2a14" />
        <polygon points="1.5,60 28,72 10,98.5 1.5,98.5" fill="#2c3f17" />
        <polygon points="30,98.5 64,98.5 47,74" fill="#0a0d09" />
        <polygon points="70,28 98.5,30 98.5,52 76,44" fill="#0a0d09" />
        <polygon points="1.5,1.5 20,1.5 1.5,22" fill="#0a0d09" />
      </g>
      <g fill="#c6f53e">
        <path d="M22 67 L22 41 L36.5 53 L50 32 L63.5 53 L78 41 L78 67 Z" />
        <rect x="20" y="66" width="60" height="12" rx="2.5" />
        <circle cx="22" cy="39" r="3.4" />
        <circle cx="50" cy="30" r="3.7" />
        <circle cx="78" cy="39" r="3.4" />
      </g>
      <path
        d="M22 67 L22 41 L36.5 53 L50 32 L63.5 53 L78 41 L78 67 Z"
        fill="rgba(0,0,0,.28)"
        opacity="0.5"
        transform="translate(0,30) scale(1,0.18)"
      />
      <rect x="20" y="73" width="60" height="5" rx="2.5" fill="rgba(0,0,0,.28)" />
      <rect x="2.75" y="2.75" width="94.5" height="94.5" rx="12.75" fill="none" stroke="#c6f53e" strokeWidth="2.5" />
    </svg>
  );
}
