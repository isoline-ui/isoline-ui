/** Clamp and quantize controlled slider values without accumulating decimal drift. */
export function sliderValue(value: number, min = 0, max = 1, step = 0) {
  if (!Number.isFinite(min) || !Number.isFinite(max) || max <= min)
    return Number.isFinite(min) ? min : 0;
  const finite = Number.isFinite(value) ? value : min;
  const snapped =
    step > 0 && Number.isFinite(step)
      ? Number((min + Math.round((finite - min) / step) * step).toPrecision(12))
      : finite;
  return Math.max(min, Math.min(max, snapped));
}
