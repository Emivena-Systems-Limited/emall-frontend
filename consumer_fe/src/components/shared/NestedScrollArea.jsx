import { useEffect, useRef } from 'react'
import { attachScrollChain } from '../../utils/scrollChain'

/**
 * Scrollable region that chains wheel scrolling to its parent once the
 * nested list reaches the top or bottom edge.
 */
export default function NestedScrollArea({
  as: Tag = 'div',
  className = '',
  children,
  ...props
}) {
  const ref = useRef(null)

  useEffect(() => attachScrollChain(ref.current), [])

  return (
    <Tag
      ref={ref}
      className={className}
      data-nested-scroll=""
      {...props}
    >
      {children}
    </Tag>
  )
}
