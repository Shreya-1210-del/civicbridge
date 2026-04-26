const paths = {
  bridge: (
    <>
      <path d="M4 18h16" />
      <path d="M6 18c1.5-5 4.5-8 6-8s4.5 3 6 8" />
      <path d="M8 18v-4" />
      <path d="M12 18v-8" />
      <path d="M16 18v-4" />
    </>
  ),
  shield: (
    <>
      <path d="M12 3l7 3v5c0 5-3.1 8.2-7 10-3.9-1.8-7-5-7-10V6l7-3z" />
      <path d="M9 12l2 2 4-5" />
    </>
  ),
  brain: (
    <>
      <path d="M9 4a3 3 0 0 0-3 3 3 3 0 0 0-2 5 3 3 0 0 0 3 5h2V4z" />
      <path d="M15 4a3 3 0 0 1 3 3 3 3 0 0 1 2 5 3 3 0 0 1-3 5h-2V4z" />
      <path d="M9 9H6" />
      <path d="M15 9h3" />
      <path d="M9 14H6" />
      <path d="M15 14h3" />
    </>
  ),
  heart: (
    <path d="M20 8.5c0 5.2-8 10.5-8 10.5S4 13.7 4 8.5A4.5 4.5 0 0 1 12 6a4.5 4.5 0 0 1 8 2.5z" />
  ),
  userPlus: (
    <>
      <path d="M15 19a6 6 0 0 0-12 0" />
      <circle cx="9" cy="8" r="4" />
      <path d="M19 8v6" />
      <path d="M16 11h6" />
    </>
  ),
  mapPin: (
    <>
      <path d="M12 21s7-5.1 7-11a7 7 0 1 0-14 0c0 5.9 7 11 7 11z" />
      <circle cx="12" cy="10" r="2.5" />
    </>
  ),
  hand: (
    <>
      <path d="M7 11V6a2 2 0 0 1 4 0v4" />
      <path d="M11 10V5a2 2 0 0 1 4 0v7" />
      <path d="M15 12V8a2 2 0 0 1 4 0v5c0 5-3 8-7 8h-1c-3 0-5-2-6-5l-1-4a2 2 0 0 1 4-1l1 3" />
    </>
  ),
  check: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M8 12l3 3 5-6" />
    </>
  ),
  menu: (
    <>
      <path d="M4 7h16" />
      <path d="M4 12h16" />
      <path d="M4 17h16" />
    </>
  ),
  x: (
    <>
      <path d="M6 6l12 12" />
      <path d="M18 6L6 18" />
    </>
  ),
  users: (
    <>
      <path d="M16 19a4 4 0 0 0-8 0" />
      <circle cx="12" cy="8" r="3" />
      <path d="M5 18a3 3 0 0 1 3-3" />
      <path d="M19 18a3 3 0 0 0-3-3" />
      <path d="M5.5 9.5a2 2 0 1 0 0-4" />
      <path d="M18.5 9.5a2 2 0 1 1 0-4" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </>
  ),
  spark: (
    <>
      <path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3z" />
      <path d="M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8L19 15z" />
    </>
  )
};

export default function Icon({ name, className = "h-5 w-5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {paths[name] || paths.spark}
    </svg>
  );
}
