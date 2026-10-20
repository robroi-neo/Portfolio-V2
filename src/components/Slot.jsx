// Temporary placeholder showing where a future component goes.
// Remove each one as the real component is built.
export default function Slot({ children, className = '', minHeight }) {
  return (
    <div className={`slot ${className}`} style={minHeight ? { minHeight } : undefined}>
      {children}
    </div>
  )
}
