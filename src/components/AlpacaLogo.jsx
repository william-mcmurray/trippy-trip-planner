export default function AlpacaLogo({ className = 'w-8 h-8' }) {
  return (
    <svg className={className} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Simple friendly alpaca face */}
      {/* Fluffy head/fur */}
      <ellipse cx="32" cy="20" rx="16" ry="14" fill="#6B8F71" />
      <circle cx="24" cy="14" r="6" fill="#6B8F71" />
      <circle cx="40" cy="14" r="6" fill="#6B8F71" />
      <circle cx="32" cy="10" r="7" fill="#6B8F71" />
      <circle cx="26" cy="18" r="5" fill="#7fa885" />
      <circle cx="38" cy="18" r="5" fill="#7fa885" />
      {/* Face */}
      <ellipse cx="32" cy="36" rx="14" ry="16" fill="#F0EBE1" />
      {/* Eyes */}
      <circle cx="27" cy="32" r="2.5" fill="#2C2C2C" />
      <circle cx="37" cy="32" r="2.5" fill="#2C2C2C" />
      <circle cx="27.8" cy="31.2" r="0.8" fill="white" />
      <circle cx="37.8" cy="31.2" r="0.8" fill="white" />
      {/* Nose/mouth */}
      <ellipse cx="32" cy="40" rx="4" ry="2.5" fill="#C97B84" opacity="0.6" />
      <path d="M30 42 Q32 44.5 34 42" stroke="#8A8070" strokeWidth="1" fill="none" strokeLinecap="round" />
      {/* Ears */}
      <ellipse cx="18" cy="22" rx="4" ry="7" fill="#6B8F71" transform="rotate(-15 18 22)" />
      <ellipse cx="18" cy="22" rx="2.5" ry="5" fill="#C97B84" opacity="0.4" transform="rotate(-15 18 22)" />
      <ellipse cx="46" cy="22" rx="4" ry="7" fill="#6B8F71" transform="rotate(15 46 22)" />
      <ellipse cx="46" cy="22" rx="2.5" ry="5" fill="#C97B84" opacity="0.4" transform="rotate(15 46 22)" />
      {/* Golden bell/accessory */}
      <circle cx="32" cy="52" r="3" fill="#E8C547" />
      <circle cx="32" cy="52" r="1.5" fill="#D4A24E" />
    </svg>
  );
}
