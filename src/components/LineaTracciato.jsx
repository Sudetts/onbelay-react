function LineaTracciato() {
  return (
    <svg
      viewBox="0 0 300 40"
      className="linea-tracciato"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <path
        d="M5,28 Q40,8 65,20 T130,12 T195,26 T260,10 T295,18"
        fill="none"
        stroke="var(--colore-accento)"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <circle cx="65" cy="20" r="3.5" fill="var(--colore-accento)" />
      <circle cx="130" cy="12" r="3.5" fill="var(--colore-accento)" />
      <circle cx="195" cy="26" r="3.5" fill="var(--colore-accento)" />
    </svg>
  );
}

export default LineaTracciato;