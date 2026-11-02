/** Browser keyboard occlusion only while editing, at normal zoom. Resized layouts need no extra inset. */
export function keyboardOcclusion(layoutHeight: number, visualHeight: number, offsetTop = 0, scale = 1, editing = false): number {
  if (!editing || Math.abs(scale - 1) > 0.01 || ![layoutHeight, visualHeight, offsetTop].every(Number.isFinite)) return 0;
  return Math.max(0, layoutHeight - visualHeight - offsetTop);
}
