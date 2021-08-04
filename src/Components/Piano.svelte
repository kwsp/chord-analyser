<script>
  let width = 500
  let height = 200

  const nWhiteKeys = 7
  const scale = 2

  // Piano key dimensions from http://www.quadibloc.com/other/cnv05.htm
  const blackIdx = [1, 3, 6, 8, 10]
  // const whiteIdx = [0, 2, 4, 5, 7, 9, 11]
  const whiteKeyWidths = [23, 24, 23, 24, 23, 23, 24]
  const blackKeyWidths = [14, 14, 14, 14, 14, 13, 14, 13, 14, 13, 14, 13]
  const blackKeyHeight = 120

  const actives = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
  const whiteKeysActive = [
    actives[0],
    actives[2],
    actives[4],
    actives[5],
    actives[7],
    actives[9],
    actives[11],
  ]
  const blackKeysActive = [
    actives[1],
    actives[3],
    actives[6],
    actives[8],
    actives[10],
  ]

  const whiteKeys = []
  let accX = 0
  for (let i = 0; i < whiteKeyWidths.length; i++) {
    whiteKeys.push({
      x: scale * accX,
      y: 0,
      w: scale * whiteKeyWidths[i],
      h: height,
    })
    accX += whiteKeyWidths[i]
  }

  accX = 0
  const blackKeys = []
  for (let i = 0; i < blackKeyWidths.length; i++) {
    if (blackIdx.find((v) => v === i)) {
      blackKeys.push({
        x: scale * accX,
        y: 0,
        w: scale * blackKeyWidths[i],
        h: blackKeyHeight,
      })
    }
    accX += blackKeyWidths[i]
  }
</script>

<div class="chart" bind:clientWidth={width} bind:clientHeight={height}>
  <svg>
    {#each whiteKeys as wk, idx}
      <rect
        x={wk.x}
        y={wk.y}
        width={wk.w}
        height={wk.h}
        rx="5"
        ry="5"
        class={whiteKeysActive[idx] ? 'whiteKeyActive' : 'whiteKey'}
      />
    {/each}

    {#each blackKeys as bk, idx}
      <rect
        x={bk.x}
        y={bk.y}
        width={bk.w}
        height={bk.h}
        rx="5"
        ry="5"
        class={blackKeysActive[idx] ? 'blackKeyActive' : 'blackKey'}
      />
    {/each}
  </svg>
</div>

<style>
  .chart {
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

  .whiteKey {
    fill: white;
    stroke: black;
  }
  .whiteKeyActive {
    fill: #bae67e;
    stroke: black;
  }
  .blackKey {
    fill: black;
    stroke: black;
  }
  .blackKeyActive {
    fill: #bae67e;
    stroke: black;
  }
</style>
