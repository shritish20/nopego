'use client'

interface ColorOption {
  name: string
  hex: string
  value: string
}

interface ColorSelectorProps {
  colors: ColorOption[]
  selected: string
  onChange: (value: string) => void
}

export default function ColorSelector({ colors, selected, onChange }: ColorSelectorProps) {
  return (
    <div className="flex items-center gap-3">
      {colors.map((color) => (
        <button
          key={color.value}
          onClick={() => onChange(color.value)}
          title={color.name}
          className={
            'w-6 h-6 rounded-full border-2 transition-all focus:outline-none ' +
            (selected === color.value
              ? 'ring-2 ring-black ring-offset-2 ring-offset-brand-bg border-transparent'
              : 'border-gray-300 hover:border-gray-500')
          }
          style={{ backgroundColor: color.hex }}
          aria-label={color.name}
          aria-pressed={selected === color.value}
        />
      ))}
    </div>
  )
}
