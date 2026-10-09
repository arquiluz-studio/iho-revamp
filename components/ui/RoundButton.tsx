import { Arrow } from './Arrow'

type Props = {
  onClick: () => void
  label: string
  flip?: boolean
  size?: number
  border?: string
  bg?: string
  color?: string
  arrowSize?: number
}

export function RoundButton({ onClick, label, flip = false, size = 46, border = '1px solid rgba(20,18,12,0.2)', bg = 'transparent', color = '#17150f', arrowSize = 16 }: Props) {
  return (
    <button onClick={onClick} aria-label={label} style={{ width: size, height: size, borderRadius: '50%', border, background: bg, color, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <Arrow w={arrowSize} h={Math.round(arrowSize * 0.875)} flip={flip} />
    </button>
  )
}
