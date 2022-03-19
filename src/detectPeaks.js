import { mean, max, std, std_with_mean } from './maths'

export function detectPeaks(
  y,
  lag = 20,
  threshold = 5,
  influence = 0.5,
  maxIdx = null
) {
  // Based on https://stackoverflow.com/questions/22583391/peak-signal-detection-in-realtime-timeseries-data/22640362#22640362
  //
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

  const vThresh = max(y) / 3

  for (let i = lag; i < maxIdx; i++) {
    if (Math.abs(y[i] - avgFilter[i - 1]) > threshold * stdFilter[i - 1]) {
      if (y[i] > avgFilter[i - 1] && y[i] > vThresh) {
        res.push(i)
        //i += 10
      }
      filteredY[i] = influence * y[i] + (1 - influence) * filteredY[i - 1]
    } else {
      filteredY[i] = y[i]
    }
    const _window = filteredY.slice(i - lag, i)
    avgFilter[i] = mean(_window)
    stdFilter[i] = std_with_mean(_window, avgFilter[i])
  }

  // For a contiguous peak find its center
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
