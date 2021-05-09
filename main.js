const toggleButton = document.getElementById('toggleOnOff')
const canvas = document.getElementById('canvas')
const canvasCtx = canvas.getContext('2d')

const chordsDiv = document.getElementById('chords')

let running = false // global flag for audio on/off

let lag = 11
let thresh = 5
let influence = 0.5
const fftSize = 16384 // window size for fft

const inpLag = document.getElementById('lag')
inpLag.value = lag
inpLag.addEventListener('change', (ev) => {
  lag = parseFloat(ev.target.value)
})
const inpThresh = document.getElementById('thresh')
inpThresh.value = thresh
inpThresh.addEventListener('change', (ev) => {
  thresh = parseFloat(ev.target.value)
})
const inpInfluence = document.getElementById('influence')
inpInfluence.value = influence
inpInfluence.addEventListener('change', (ev) => {
  influence = parseFloat(ev.target.value)
})

const onSuccess = (stream) => {
  const audioCtx = new AudioContext()
  const analyser = audioCtx.createAnalyser()
  analyser.fftSize = fftSize
  analyser.minDecibels = -70
  const audioSrc = audioCtx.createMediaStreamSource(stream)
  audioSrc.connect(analyser)
  const bufLen = analyser.frequencyBinCount
  const dataArray = new Uint8Array(analyser.frequencyBinCount)

  const Fs = audioCtx.sampleRate // audio sampling frequency
  const Fres = Fs / fftSize // Frequency resolution
  const freq2idx = (freq) => Math.round(freq / Fres)

  const draw = (peakIdx) => {
    const xMargin = 10
    const yMargin = 10
    let height = canvas.height - yMargin
    let width = canvas.width - xMargin

    // background colour
    canvasCtx.fillStyle = '#2f3b54'
    canvasCtx.fillRect(0, 0, canvas.width, canvas.height)

    // line style
    canvasCtx.lineWidth = 1

    // Draw axis
    canvasCtx.strokeStyle = '#ffae57'
    canvasCtx.beginPath()
    canvasCtx.moveTo(xMargin, yMargin)
    canvasCtx.lineTo(xMargin, height)
    canvasCtx.lineTo(xMargin + width, height)
    canvasCtx.stroke()

    // Draw FFT
    canvasCtx.strokeStyle = '#c3a6ff'
    const sliceWidth = width / bufLen
    let x = xMargin
    let y = height * (1 - dataArray[0] / 256)
    canvasCtx.beginPath()
    canvasCtx.moveTo(x, y)
    x += sliceWidth
    for (let i = 0; i < bufLen; i++) {
      y = height * (1 - dataArray[i] / 256)
      canvasCtx.lineTo(x, y)
      x += sliceWidth
    }
    canvasCtx.lineTo(canvas.width - xMargin, canvas.height - yMargin)
    canvasCtx.stroke()

    // Draw peaks
    if (peakIdx) {
      canvasCtx.strokeStyle = '#bae67e'
      peakIdx.forEach((idx) => {
        let x = xMargin + sliceWidth * idx
        canvasCtx.beginPath()
        canvasCtx.moveTo(x, 0)
        canvasCtx.lineTo(x, 5)
        canvasCtx.stroke()
      })
    }
  }

  // Constrain frequency to <3000 Hz
  const maxIdx = freq2idx(3000)

  const loop = () => {
    if (!running) {
      return
    }
    requestAnimationFrame(loop)
    analyser.getByteFrequencyData(dataArray)

    // Find indices of peaks
    const peakIdx = detectPeaks(dataArray, maxIdx, lag, thresh, influence)

    // Draw if there are less than 20 peaks
    // too many peaks probably indicate noisy/meaningless data
    if (peakIdx.length < 20) {
      draw(peakIdx)
      // Convert indices to notes and deduplicate
      const notes = [...new Set(peakIdx.map((idx) => getNote(idx * Fres)))]
      // Update the HTML text
      chordsDiv.innerText = notes
    } else {
      draw()
    }
  }

  requestAnimationFrame(loop)
}

function toggleStartStop() {
  if (running) {
    running = false
    toggleButton.innerText = 'start'
  } else {
    running = true
    toggleButton.innerText = 'Stop'

    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices
        .getUserMedia({
          audio: true,
        })
        .then(onSuccess)
        .catch(function (err) {
          console.log('The following getUserMedia error occurred: ' + err)
        })
    } else {
      console.log('getUserMedia not supported on your browser!')
    }
  }
}

toggleButton.onclick = toggleStartStop

window.addEventListener('keydown', handleKeyDown, false)

function handleKeyDown(kev) {
  switch (kev.code) {
    case 'Space':
      toggleStartStop()
      break
  }
}
