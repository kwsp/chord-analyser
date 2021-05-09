function sum(arr) {
  return arr.reduce((acc, v) => acc + v)
}

function mean(arr) {
  return sum(arr) / arr.length
}

function max(arr) {
  return arr.reduce((a, b) => Math.max(a, b))
}

function std(arr) {
  const _mean = mean(arr)
  return Math.sqrt(
    arr.reduce((acc, v) => {
      acc + (_mean - v) ** 2
    }) / arr.length
  )
}

function std_with_mean(arr, _mean) {
  return Math.sqrt(
    arr.reduce((acc, v) => {
      acc + (_mean - v) ** 2
    }) / arr.length
  )
}

function detectPeaks(
  y,
  maxIdx = null,
  lag = 20,
  threshold = 5,
  influence = 0.5
) {
  // Settings (the ones below are examples: choose what is best for your data)
  // lag - lag the moving window
  // threshold - standard deviations for signal
  // influence - the influence (between 0 and 1) of new signals on the mean and standard deviation

  maxIdx = maxIdx || y.length
  const res = [] // Indices of peaks
  const filteredY = y.slice(0, maxIdx) // Initialize filtered series

  const avgFilter = new Uint8Array(maxIdx) // Initialize average filter
  const stdFilter = new Uint8Array(maxIdx) // Initialize std. filter
  const _window = y.slice(0, lag)
  avgFilter[lag - 1] = mean(_window) // Initialize first value
  stdFilter[lag - 1] = std(_window) // Initialize first value

  for (i = lag; i < maxIdx; i++) {
    if (Math.abs(y[i] - avgFilter[i - 1]) > threshold * stdFilter[i - 1]) {
      if (y[i] > avgFilter[i - 1]) {
        res.push(i)
      }
      filteredY[i] = influence * y[i] + (1 - influence) * filteredY[i - 1]
    } else {
      filteredY[i] = y[i]
    }
    const _window = filteredY.slice(i - lag, i)
    avgFilter[i] = mean(_window)
    stdFilter[i] = std_with_mean(_window, avgFilter[i])
  }

  const vThresh = max(y) / 2
  const peaks = []
  let peakBegin = 0
  let lastIdx = 0
  for (let i = 1; i < res.length; i++) {
    if (res[i] == res[i - 1] + 1) {
      lastIdx = i
    } else {
      if (lastIdx === i - 1) {
        const j = Math.round((res[lastIdx] + res[peakBegin]) / 2)
        if (y[j] > vThresh) {
          peaks.push(j)
        }
      }
      peakBegin = i
    }
  }
  return peaks
}
