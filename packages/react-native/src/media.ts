export function clampZoom(value: number, maximum = 5) {
  'worklet';
  return Math.max(
    1,
    Math.min(
      Number.isFinite(maximum) ? Math.max(1, maximum) : 5,
      Number.isFinite(value) ? value : 1,
    ),
  );
}
/** Pan limits for a contained image, rather than the larger bounds of a cover image. */
export function imagePanBounds(width: number, height: number, aspect: number, scale: number) {
  'worklet';
  const ratio = Math.max(0.001, aspect);
  const shownWidth = Math.min(width, height * ratio);
  const shownHeight = Math.min(height, width / ratio);
  return {
    x: Math.max(0, (shownWidth * scale - width) / 2),
    y: Math.max(0, (shownHeight * scale - height) / 2),
  };
}
/** RN uses source dimensions; React Native Web forwards the DOM image load event. */
export function imageDimensions(event: unknown): { width: number; height: number } | null {
  if (!event || typeof event !== 'object') return null;
  const data = event as {
    target?: { naturalWidth?: number; naturalHeight?: number };
    currentTarget?: { naturalWidth?: number; naturalHeight?: number };
    nativeEvent?: {
      source?: { width?: number; height?: number };
      target?: { naturalWidth?: number; naturalHeight?: number };
    };
  };
  const width =
    data.nativeEvent?.source?.width ??
    data.nativeEvent?.target?.naturalWidth ??
    data.target?.naturalWidth ??
    data.currentTarget?.naturalWidth;
  const height =
    data.nativeEvent?.source?.height ??
    data.nativeEvent?.target?.naturalHeight ??
    data.target?.naturalHeight ??
    data.currentTarget?.naturalHeight;
  return typeof width === 'number' &&
    typeof height === 'number' &&
    Number.isFinite(width) &&
    Number.isFinite(height) &&
    width > 0 &&
    height > 0
    ? { width, height }
    : null;
}
