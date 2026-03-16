export function Spinner({ size = 'md' }) {
  const sizes = { sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-8 h-8' };
  return (
    <div className={`${sizes[size]} border-2 border-accent/30 border-t-accent rounded-full animate-spin`} />
  );
}

export function Badge({ status }) {
  const styles = {
    Present: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
    Absent: 'bg-rose-100 text-rose-700 border border-rose-200',
  };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status]}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${status === 'Present' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
      {status}
    </span>
  );
}

export function EmptyState({ icon, title, description }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="font-display font-semibold text-ink-900 text-lg mb-1">{title}</h3>
      <p className="text-ink-600 text-sm max-w-xs">{description}</p>
    </div>
  );
}

export function ErrorState({ message, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-12 h-12 rounded-full bg-rose-100 flex items-center justify-center mb-4">
        <span className="text-rose-500 text-xl">!</span>
      </div>
      <h3 className="font-display font-semibold text-ink-900 text-lg mb-1">Something went wrong</h3>
      <p className="text-ink-600 text-sm mb-4">{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="text-sm text-accent hover:text-accent-dark font-medium transition-colors">
          Try again
        </button>
      )}
    </div>
  );
}

export function Button({ children, variant = 'primary', size = 'md', loading, disabled, ...props }) {
  const base = 'inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-accent/40 disabled:opacity-50 disabled:cursor-not-allowed';
  const variants = {
    primary: 'bg-accent text-white hover:bg-accent-dark active:scale-95',
    secondary: 'bg-ink-800 text-white hover:bg-ink-700 active:scale-95',
    ghost: 'text-ink-700 hover:bg-surface-100 active:scale-95',
    danger: 'bg-rose-500 text-white hover:bg-rose-600 active:scale-95',
  };
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-5 py-2.5 text-base',
  };
  return (
    <button
      className={`${base} ${variants[variant]} ${sizes[size]}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Spinner size="sm" />}
      {children}
    </button>
  );
}

export function Input({ label, error, ...props }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-sm font-medium text-ink-800">{label}</label>}
      <input
        className={`w-full px-3 py-2 rounded-lg border text-sm bg-white text-ink-900 placeholder:text-ink-600/50 focus:outline-none focus:ring-2 focus:ring-accent/40 transition-all ${
          error ? 'border-rose-400 focus:border-rose-400' : 'border-surface-200 focus:border-accent'
        }`}
        {...props}
      />
      {error && <p className="text-xs text-rose-500">{error}</p>}
    </div>
  );
}

export function Select({ label, error, children, ...props }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-sm font-medium text-ink-800">{label}</label>}
      <select
        className={`w-full px-3 py-2 rounded-lg border text-sm bg-white text-ink-900 focus:outline-none focus:ring-2 focus:ring-accent/40 transition-all ${
          error ? 'border-rose-400' : 'border-surface-200 focus:border-accent'
        }`}
        {...props}
      >
        {children}
      </select>
      {error && <p className="text-xs text-rose-500">{error}</p>}
    </div>
  );
}

export function Card({ children, className = '' }) {
  return (
    <div className={`bg-white border border-surface-200 rounded-xl ${className}`}>
      {children}
    </div>
  );
}

export function Modal({ open, onClose, title, children }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-ink-950/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md animate-[fadeIn_0.15s_ease]">
        <div className="flex items-center justify-between p-5 border-b border-surface-200">
          <h2 className="font-display font-semibold text-ink-900 text-lg">{title}</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-surface-100 text-ink-600 transition-colors"
          >
            ✕
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

export function Toast({ message, type = 'success', onClose }) {
  const styles = {
    success: 'bg-emerald-600',
    error: 'bg-rose-600',
  };
  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 ${styles[type]} text-white px-4 py-3 rounded-xl shadow-xl text-sm font-medium animate-[slideUp_0.2s_ease]`}>
      <span>{type === 'success' ? '✓' : '!'}</span>
      {message}
      <button onClick={onClose} className="ml-2 opacity-70 hover:opacity-100">✕</button>
    </div>
  );
}
