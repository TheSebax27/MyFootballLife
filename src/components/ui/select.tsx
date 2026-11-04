import { Children, isValidElement, type ReactElement, type ReactNode } from 'react'
import { cn } from '@/utils/cn'

// ----- Sub-components (data carriers only) -----

export function SelectTrigger({ children, className, id }: { children?: ReactNode; className?: string; id?: string }) {
  void children
  void className
  void id
  return null // Select renders the actual element
}

export function SelectValue({ placeholder }: { placeholder?: string }) {
  void placeholder
  return null
}

export function SelectContent({ children }: { children: ReactNode }) {
  void children
  return null
}

export function SelectItem({ value, children }: { value: string; children: ReactNode }) {
  void value
  void children
  return null
}

// ----- Select: does all the work -----

interface SelectProps {
  value: string
  onValueChange: (v: string) => void
  children: ReactNode
}

export function Select({ value, onValueChange, children }: SelectProps) {
  let triggerId: string | undefined
  let triggerClassName: string | undefined
  let placeholder: string | undefined
  const options: { value: string; label: ReactNode }[] = []

  Children.forEach(children, (child) => {
    if (!isValidElement(child)) return
    const el = child as ReactElement<{ children?: ReactNode; className?: string; id?: string; placeholder?: string }>

    if (el.type === SelectTrigger) {
      triggerClassName = el.props.className
      triggerId = el.props.id
      // SelectValue inside trigger
      Children.forEach(el.props.children, (sv) => {
        if (isValidElement(sv) && (sv as ReactElement<{ placeholder?: string }>).type === SelectValue) {
          placeholder = (sv as ReactElement<{ placeholder?: string }>).props.placeholder
        }
      })
    }

    if (el.type === SelectContent) {
      Children.forEach(el.props.children, (item) => {
        if (!isValidElement(item)) return
        const it = item as ReactElement<{ value: string; children: ReactNode }>
        if (it.type === SelectItem) {
          options.push({ value: it.props.value, label: it.props.children })
        }
      })
    }
  })

  return (
    <select
      id={triggerId}
      value={value}
      onChange={(e) => onValueChange(e.target.value)}
      className={cn(
        'flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50',
        triggerClassName,
      )}
    >
      {placeholder && !value && (
        <option value="" disabled hidden>{placeholder}</option>
      )}
      {options.map((opt) => (
        <option key={String(opt.value)} value={String(opt.value)}>
          {opt.label}
        </option>
      ))}
    </select>
  )
}
