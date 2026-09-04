const GRID_PATTERN_STYLE = {
  backgroundImage:
    'linear-gradient(to right, rgb(15 23 42) 1px, transparent 1px), linear-gradient(to bottom, rgb(15 23 42) 1px, transparent 1px)',
  backgroundSize: '32px 32px',
};

export function AuthGridPattern() {
  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 opacity-[0.02]"
      style={GRID_PATTERN_STYLE}
    />
  );
}
