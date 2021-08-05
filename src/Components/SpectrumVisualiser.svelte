<script>
  import { scaleLinear } from 'd3-scale'

  export let plotX
  export let plotY

  const yTicks = [0, 50, 100, 150, 200, 250]
  const xTicks = [0, 200, 400, 600, 800, 1000]
  const padding = { top: 20, right: 15, bottom: 20, left: 25 }

  let width = 500
  let height = 200

  $: minX = plotX[0]
  $: maxX = plotX[plotX.length - 1]

  $: xScale = scaleLinear()
    .domain([minX, maxX])
    .range([padding.left, width - padding.right])
  $: yScale = scaleLinear()
    .domain([0, 255])
    .range([height - padding.bottom, padding.top])

  function calcPath(arrX, arrY) {
    let i = 0
    let path = `M${xScale(arrX[i])},${yScale(arrY[i])}`
    for (i = 1; i < arrY.length; i++) {
      path += `L${xScale(arrX[i])},${yScale(arrY[i])}`
    }
    return path
  }

  $: path = calcPath(plotX, plotY)
  $: area = `${path}L${xScale(maxX)},${yScale(0)}L${xScale(minX)},${yScale(0)}Z`
</script>

<h3>Spectrum Visualiser</h3>

<div class="chart" bind:clientWidth={width} bind:clientHeight={height}>
  <svg>
    <!-- y axis -->
    <g class="axis y-axis" transform="translate(0, {padding.top})">
      {#each yTicks as tick}
        <g
          class="tick tick-{tick}"
          transform="translate(0, {yScale(tick) - padding.bottom})"
        >
          <line x2="100%" />
          <text y="-4">{tick}</text>
        </g>
      {/each}
    </g>

    <!-- x axis -->
    <g class="axis x-axis">
      {#each xTicks as tick, idx}
        <g
          class="tick tick-{tick}"
          transform="translate({xScale(tick)},{height})"
        >
          <line y1="-{height}" y2="-{padding.bottom}" x1="0" x2="0" />
          <text y="-2">
            {tick}
            {idx === xTicks.length - 1 ? ' Hz' : ''}
          </text>
        </g>
      {/each}
    </g>

    <!-- data -->
    <path class="path-area" d={area} />
    <path class="path-line" d={path} />
  </svg>
</div>

<style>
  .chart,
  h3,
  p {
    width: 100%;
    max-width: 500px;
    margin-left: auto;
    margin-right: auto;
  }

  svg {
    position: relative;
    width: 100%;
    height: 200px;
    overflow: visible;
  }

  .tick {
    font-size: 0.725em;
    font-weight: 200;
  }

  .tick line {
    stroke: #aaa;
    stroke-dasharray: 2;
  }

  .tick text {
    fill: #666;
    text-anchor: start;
  }

  .tick.tick-0 line {
    stroke-dasharray: 0;
  }

  .x-axis .tick text {
    text-anchor: middle;
  }

  .path-line {
    fill: none;
    stroke: rgb(0, 100, 100);
    stroke-linejoin: round;
    stroke-linecap: round;
    stroke-width: 2;
  }

  .path-area {
    fill: rgba(0, 100, 100, 0.2);
  }
</style>
