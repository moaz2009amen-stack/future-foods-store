export function FacebookIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5 3.66 9.15 8.44 9.94v-7.03H7.9v-2.91h2.54V9.85c0-2.51 1.49-3.9 3.77-3.9 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56v1.89h2.78l-.44 2.91h-2.34V22c4.78-.79 8.44-4.94 8.44-9.94z" />
    </svg>
  );
}

export function InstagramIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function TiktokIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M16.6 5.82c-.9-.85-1.45-2.02-1.45-3.32h-3.02v13.6c0 1.5-1.22 2.72-2.73 2.72a2.73 2.73 0 0 1-2.72-2.72c0-1.5 1.22-2.72 2.72-2.72.28 0 .55.04.8.12v-3.07a5.8 5.8 0 0 0-.8-.06 5.75 5.75 0 0 0-5.75 5.73A5.75 5.75 0 0 0 9.4 21.83a5.75 5.75 0 0 0 5.75-5.73V9.02a8.35 8.35 0 0 0 4.87 1.56V7.56a5.1 5.1 0 0 1-3.42-1.74z" />
    </svg>
  );
}
