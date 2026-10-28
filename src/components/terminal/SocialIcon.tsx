const PATHS: Record<string, string[]> = {
  GitHub: [
    "M9 19c-4.3 1.4-4.3-2.5-6-3m12 5v-3.5c0-1 .1-1.4-.5-2 2.8-.3 5.5-1.4 5.5-6a4.6 4.6 0 0 0-1.3-3.2 4.2 4.2 0 0 0-.1-3.2s-1.1-.3-3.5 1.3a12.3 12.3 0 0 0-6.2 0C6 1.8 4.9 2.1 4.9 2.1a4.2 4.2 0 0 0-.1 3.2A4.6 4.6 0 0 0 3.5 8.5c0 4.6 2.7 5.7 5.5 6-.6.6-.6 1.2-.5 2V20",
  ],
  LinkedIn: [
    "M8 11v5M8 8v.01M12 16v-5M16 16v-3a2 2 0 1 0-4 0M3 7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4v10a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4z",
  ],
  Instagram: [
    "M8 4h8a4 4 0 0 1 4 4v8a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4V8a4 4 0 0 1 4-4",
    "M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0M16.5 7.5v.01",
  ],
  Mail: ["M3 5h18v14H3zM3 5l9 8 9-8"],
};
export default function SocialIcon({ name }: { name: string }) {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {(PATHS[name] ?? PATHS.Mail).map(d => (
        <path key={d} d={d} />
      ))}
    </svg>
  );
}
