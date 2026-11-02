export interface AnchorRect {
  x: number;
  y: number;
  width: number;
  height: number;
}
export interface PopoverViewport {
  width: number;
  height: number;
  top?: number;
  right?: number;
  bottom?: number;
  left?: number;
}
/** Clamp and flip an anchored surface without drawing actions outside the usable window. */
export function placePopover(
  anchor: AnchorRect,
  size: { width: number; height: number },
  viewport: PopoverViewport,
  placement: 'top' | 'bottom' = 'bottom',
  gap = 8,
) {
  const left = (viewport.left ?? 0) + 12,
    right = viewport.width - (viewport.right ?? 0) - 12;
  const top = (viewport.top ?? 0) + 12,
    bottom = viewport.height - (viewport.bottom ?? 0) - 12;
  const width = Math.max(0, Math.min(size.width, right - left));
  const height = Math.max(0, Math.min(size.height, bottom - top));
  const below = bottom - (anchor.y + anchor.height + gap),
    above = anchor.y - gap - top;
  const side =
    placement === 'bottom'
      ? height > below && above > below
        ? 'top'
        : 'bottom'
      : height > above && below > above
        ? 'bottom'
        : 'top';
  const y = side === 'bottom' ? anchor.y + anchor.height + gap : anchor.y - gap - height;
  return {
    left: Math.max(left, Math.min(anchor.x + anchor.width - width, right - width)),
    top: Math.max(top, Math.min(y, bottom - height)),
    width,
    maxHeight: bottom - top,
    placement: side,
  };
}
