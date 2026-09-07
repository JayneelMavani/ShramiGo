export function Avatar({ name = 'ShramiGo', size = 'md' }: { name?: string; size?: 'sm' | 'md' | 'lg' }) {
  return <div className={`avatar avatar-${size}`} aria-label={name}>{name.slice(0, 1).toUpperCase()}</div>
}
