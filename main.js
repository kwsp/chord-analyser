const toggleButton = document.getElementById('toggleOnOff')
const canvas = document.getElementById('canvas')
const canvasCtx = canvas.getContext('2d')

const chordsDiv = document.getElementById('chords')

let running = false

let lag = 11
let thresh = 5
let influence = 0.5

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

const Fs = 44100 // audio sampling frequency
const fftSize = 4096 // window size for fft
const Fres = Fs / fftSize / 2

const freq2idx = (freq) => freq / Fres

let ANALYSER // DEBUG
let STREAM

const onSuccess = (stream) => {
  const audioCtx = new AudioContext()
  const analyser = audioCtx.createAnalyser()
  analyser.fftSize = fftSize
  const audioSrc = audioCtx.createMediaStreamSource(stream)
  audioSrc.connect(analyser)
  const bufLen = analyser.frequencyBinCount
  const dataArray = new Uint8Array(analyser.frequencyBinCount)

  ANALYSER = analyser // DEBUG
  STREAM = stream

  const draw = (peakIdx) => {
    // background colour
    canvasCtx.fillStyle = '#2f3b54'
    canvasCtx.fillRect(0, 0, canvas.width, canvas.height)

    // line style
    canvasCtx.lineWidth = 1
    canvasCtx.strokeStyle = '#c3a6ff'

    canvasCtx.beginPath()

    const sliceWidth = canvas.width / bufLen
    let x = 0
    let y = canvas.height * (1 - dataArray[0] / 256)
    canvasCtx.moveTo(x, y)
    x += sliceWidth
    for (let i = 0; i < bufLen; i++) {
      y = canvas.height * (1 - dataArray[i] / 256)
      canvasCtx.lineTo(x, y)
      x += sliceWidth
    }
    canvasCtx.lineTo(canvas.width, canvas.height)
    canvasCtx.stroke()

    if (peakIdx) {
      canvasCtx.strokeStyle = '#bae67e'
      peakIdx.forEach((idx) => {
        let x = sliceWidth * idx
        canvasCtx.beginPath()
        canvasCtx.moveTo(x, 0)
        canvasCtx.lineTo(x, canvas.height)
        canvasCtx.stroke()
      })
    }
  }

  const loop = () => {
    if (!running) {
      return
    }
    requestAnimationFrame(loop)
    analyser.getByteFrequencyData(dataArray)
    const maxIdx = freq2idx(4000)
    console.log(maxIdx)

    const peakIdx = detectPeaks(dataArray, maxIdx, lag, thresh, influence)
    if (peakIdx.length < 15) {
      //chordsDiv.innerText = peakIdx
      draw(peakIdx)
      const notes = peakIdx.map((idx) => getNote(idx * Fres))
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
