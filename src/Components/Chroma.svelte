<script>
  import { scaleLinear } from 'd3-scale'

  export let points = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]

  // prettier-ignore
  const xTicks = [
    'C', 'C#', 'D', 'D#', 'E', 'F',
    'F#', 'G', 'G#', 'A', 'A#', 'B'
  ]
  const yTicks = [0, 20, 40, 60, 80]
  const padding = { top: 20, right: 15, bottom: 20, left: 25 }

  let width = 500
  let height = 200

  $: xScale = scaleLinear()
    .domain([0, xTicks.length])
    .range([padding.left, width - padding.right])

  $: yScale = scaleLinear()
    .domain([0, 100])
    .range([height - padding.bottom, padding.top])

  $: innerWidth = width - (padding.left + padding.right)
  $: barWidth = innerWidth / xTicks.length
</script>

<h3>Chromagram Visualiser</h3>

<div class="chart" bind:clientWidth={width} bind:clientHeight={height}>
  <svg>
    <!-- y axis -->
    <g class="axis y-axis">
      {#each yTicks as tick}
        <g class="tick tick-{tick}" transform="translate(0, {yScale(tick)})">
          <line x2="100%" />
          <text y="-4">{tick}</text>
        </g>
      {/each}
    </g>

    <!-- x axis -->
    <g class="axis x-axis">
      {#each xTicks as tick, i}
        <g class="tick" transform="translate({xScale(i)},{height})">
          <text x={barWidth / 2} y="-4">
            {tick}
          </text>
        </g>
      {/each}
    </g>

    <g class="bars">
      {#each points as point, i}
        <rect
          x={xScale(i) + 2}
          y={yScale(point)}
          width={barWidth - 4}
          height={yScale(0) - yScale(point)}
        />
      {/each}
    </g>
  </svg>
</div>

<style>
  .chart,
  h3 {
    width: 100%;
    max-width: 500px;
    margin: 0 auto;
  }

  svg {
    position: relative;
    width: 100%;
    height: 200px;
  }

  .tick {
    font-size: 0.725em;
  }

  .tick line {
    stroke: #e2e2e2;
    stroke-dasharray: 2;
  }

  .tick text {
    text-anchor: start;
  }

  .tick.tick-0 line {
    stroke-dasharray: 0;
  }

  .x-axis .tick text {
    text-anchor: middle;
  }

  .bars rect {
    fill: #a11;
    stroke: none;
    opacity: 0.65;
  }
</style>
