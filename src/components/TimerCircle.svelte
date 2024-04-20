<script lang="ts">
  // seconds since Unix epoch
  export let now: number;
  const totalSeconds = 30;
  const width = 100;
  const height = 100;
  // circle
  const cx = width / 2;
  const cy = height / 2;
  const strokeWidth = 8;
  const r = (width - strokeWidth) / 2;
  // path
  const x1 = width / 2;
  const y1 = strokeWidth / 2;
  let secondsRemaining = 0;
  let x2 = 0;
  let y2 = 0;
  // See https://developer.mozilla.org/en-US/docs/Web/SVG/Tutorial/Paths#curve_commands
  let largeArcSweepFlag = 0;
  // TODO: cache the calculations
  $: {
    secondsRemaining = totalSeconds - (now % totalSeconds);
    // The angle of the blue arc
    let rad = (secondsRemaining / totalSeconds) * (2 * Math.PI);
    if (secondsRemaining === totalSeconds) {
      // If we do a full revolution (i.e. rad === 2 * PI), then no arc will
      // be drawn at all, because the starting and ending points are the same.
      // We want a full arc (i.e. circle) to be drawn in this situation.
      // As a workaround, we make rad slightly less than 2* PI.
      rad -= 1e-6;
    }
    // Add pi / 2 because the starting point of the arc is at pi / 2
    rad += Math.PI / 2;
    x2 = r * Math.cos(rad);
    y2 = r * Math.sin(rad);
    // Add w / 2 because the center of the viewBox is (w / 2, w / 2)
    x2 = width / 2 + x2;
    y2 = width / 2 - y2;
    // Need a large arc if traversing more than half the circle
    largeArcSweepFlag = secondsRemaining > totalSeconds / 2 ? 1 : 0;
  }
  let className = "";
  export { className as class };
</script>

<div class={className}>
  <svg viewBox={`0 0 ${width} ${height}`} xmlns="http://www.w3.org/2000/svg">
    <circle {cx} {cy} {r} stroke-width={strokeWidth} fill="none" />
    <path
      d={`M ${x1} ${y1} A ${r} ${r} 0 ${largeArcSweepFlag} 0 ${x2} ${y2}`}
      stroke-width={strokeWidth}
      fill="none"
    />
  </svg>
  <span>{secondsRemaining}</span>
</div>

<style lang="postcss">
  div {
    position: relative;
  }
  circle {
    stroke: #bbbbbb;
    @media (prefers-color-scheme: dark) {
      stroke: #888888;
    }
  }
  path {
    stroke: var(--otp-code-color);
  }
  span {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-size: 0.75rem;
    font-weight: bold;
    color: var(--otp-code-color);
  }
</style>
