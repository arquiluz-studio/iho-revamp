import type { ImageVM } from '@/lib/types/site'

type Props = {
  image: ImageVM
  sizes?: string
  priority?: boolean
  className?: string
  style?: React.CSSProperties
  alt?: string
}

/**
 * Responsive <img> for pre-generated variants (thumb/md/lg). Variants are already
 * optimized at upload time, so we skip Next's image optimizer on purpose.
 */
export function MediaImage({ image, sizes, priority, className, style, alt }: Props) {
  const placeholderStyle: React.CSSProperties = {}
  if (image.color) placeholderStyle.backgroundColor = image.color
  if (image.placeholder) {
    placeholderStyle.backgroundImage = `url(${image.placeholder})`
    placeholderStyle.backgroundSize = 'cover'
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={image.src}
      srcSet={image.srcSet}
      sizes={image.srcSet ? sizes : undefined}
      alt={alt ?? image.alt}
      width={image.width ?? undefined}
      height={image.height ?? undefined}
      loading={priority ? 'eager' : 'lazy'}
      fetchPriority={priority ? 'high' : undefined}
      decoding="async"
      className={className}
      style={{ ...placeholderStyle, ...style }}
    />
  )
}
