import type { ButtonHTMLAttributes } from 'react';

export type ActionKind = 'add' | 'edit' | 'delete' | 'enable' | 'disable';

type Props = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children' | 'title' | 'aria-label'> & {
  action: ActionKind;
  label: string;
};

export function IconButton({ action, label, className = '', type = 'button', ...rest }: Props) {
  return (
    <button
      {...rest}
      type={type}
      className={`icon-action icon-action--${action} ${className}`.trim()}
      aria-label={label}
      title={label}
    >
      <svg viewBox="0 0 24 24" width="17" height="17" aria-hidden="true" fill="none"
        stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
        {action === 'add' && <path d="M12 5v14M5 12h14" />}
        {action === 'edit' && <><path d="M12 5H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7"/><path d="m15 5 4 4M10 14l9.7-9.7a2.12 2.12 0 0 0-3-3L7 11l-1 5 5-1z" /></>}
        {action === 'delete' && <><path d="M3 6h18M8 6V4h8v2M5 6l1 15h12l1-15M10 10v7M14 10v7" /></>}
        {action === 'enable' && <><circle cx="12" cy="12" r="9" /><path d="m8 12 3 3 5-6" /></>}
        {action === 'disable' && <><circle cx="12" cy="12" r="9" /><path d="m9 9 6 6m0-6-6 6" /></>}
      </svg>
    </button>
  );
}
