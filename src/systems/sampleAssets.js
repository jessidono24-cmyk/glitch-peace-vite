// Embedded sample assets generator
// Provides programmatic AudioBuffer generators when external files are not available.
export async function makeEmbeddedSample(ctx, name) {
  if (!ctx) return null;
  const sr = ctx.sampleRate;
  if (!sr) return null;

  if (name === 'ambient') {
    const len = Math.floor(sr * 1.0);
    const buf = ctx.createBuffer(1, len, sr);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) {
      const t = i / sr;
      d[i] = 0.06 * Math.sin(2 * Math.PI * 110 * t) + 0.02 * Math.sin(2 * Math.PI * 220 * t) * Math.sin(2 * Math.PI * 0.2 * t);
    }
    return buf;
  }

  // short blips/noise
  const len = Math.floor(sr * 0.25);
  const buf = ctx.createBuffer(1, len, sr);
  const d = buf.getChannelData(0);
  if (name === 'damage') {
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.exp(-i / (sr * 0.06));
    return buf;
  }
  if (name === 'peace') {
    for (let i = 0; i < len; i++) {
      const t = i / sr;
      d[i] = 0.6 * Math.sin(2 * Math.PI * 540 * t) * Math.exp(-t * 4.0) + 0.2 * Math.sin(2 * Math.PI * 720 * t) * Math.exp(-t * 3.2);
    }
    return buf;
  }
  if (name === 'select' || name === 'nav') {
    for (let i = 0; i < len; i++) {
      const t = i / sr;
      d[i] = Math.sin(2 * Math.PI * (name === 'select' ? 880 : 660) * t) * Math.exp(-t * 12.0);
    }
    return buf;
  }
  if (name === 'teleport') {
    for (let i = 0; i < len; i++) {
      const t = i / sr;
      d[i] = Math.sin(2 * Math.PI * (300 + 800 * t) * t) * Math.exp(-t * 2.0);
    }
    return buf;
  }

  // default blip
  for (let i = 0; i < len; i++) {
    const t = i / sr;
    d[i] = Math.sin(2 * Math.PI * 660 * t) * Math.exp(-t * 10.0);
  }
  return buf;
}
