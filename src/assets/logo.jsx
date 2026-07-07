export default function Logo({ size = 36 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="24" cy="24" r="22" fill="var(--color-primary)" />
      <path
        d="M15 24.5L21 30.5L33 17.5"
        stroke="white"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle
        cx="24"
        cy="24"
        r="22"
        stroke="var(--color-primary-hover)"
        strokeWidth="1.5"
        opacity="0.4"
      />
    </svg>
  );
}