'use client'

interface SizeOption {
  size: string
  stock: number
  variantId?: string
}

interface SizeSelectorProps {
  sizes: SizeOption[]
  selected: string | null
  onChange: (size: string) => void
}

export default function SizeSelector({ sizes, selected, onChange }: SizeSelectorProps) {
  return (
    <div className="grid grid-cols-5 gap-2">
      {sizes.map(({ size, stock }) => {
        const outOfStock = stock === 0
        const isSelected = selected === size
        return (
          <button
            key={size}
            onClick={() => !outOfStock && onChange(size)}
            disabled={outOfStock}
            aria-label={outOfStock ? `Size ${size} - out of stock` : `Size ${size}`}
            aria-pressed={isSelected}
            className={
              'h-12 rounded-xl border text-sm font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-gray-400 ' +
              (outOfStock
                ? 'border-brand-border text-brand-subtle cursor-not-allowed line-through opacity-50'
                : isSelected
                ? 'bg-black text-white border-black'
                : 'border-brand-border text-brand-muted hover:bg-gray-100 hover:text-gray-900 hover:border-gray-400')
            }
          >
            {size}
            {!outOfStock && stock <= 3 && (
              <span className="block text-[10px] text-red-400 leading-tight">
                Only {stock}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
