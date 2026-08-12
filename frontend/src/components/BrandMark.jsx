export default function BrandMark({ size = 32, className = "" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="HelpDesk Pro"
    >
      <rect x="2" y="2" width="60" height="60" rx="16" fill="#0B1F3A" />
      <path
        d="M22 15h20a9 9 0 0 1 9 9v10a9 9 0 0 1-9 9H26l-7.5 7v-7H22a9 9 0 0 1-9-9V24a9 9 0 0 1 9-9Z"
        fill="none"
        stroke="#FFFFFF"
        strokeWidth="3.3"
        strokeLinejoin="round"
      />
      <path
        d="M25.5 29.5l5.5 5.5L43 23.5"
        fill="none"
        stroke="#3B82F6"
        strokeWidth="4.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}