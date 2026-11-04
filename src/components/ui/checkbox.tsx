import { forwardRef } from 'react'
import { cn } from '@/utils/cn'

interface CheckboxProps {
  id?: string
  checked?: boolean
  onCheckedChange?: (checked: boolean) => void
  className?: string
  disabled?: boolean
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ id, checked, onCheckedChange, className, disabled }, ref) => (
    <input
      ref={ref}
      type="checkbox"
      id={id}
      checked={checked}
      disabled={disabled}
      onChange={(e) => onCheckedChange?.(e.target.checked)}
      className={cn(
        'size-4 rounded border border-input bg-background accent-primary cursor-pointer disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
    />
  ),
)
Checkbox.displayName = 'Checkbox'
