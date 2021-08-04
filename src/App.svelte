<script>
  import { onMount } from 'svelte'
  import { findChromaVector, bitMaskMatch } from './chordRecognition'

  import SpectrumVisualiser from './Components/SpectrumVisualiser.svelte'

  let running = false // global flag for audio on/off

  let detectedChord
  let detectedNotes

  // Peak detection params
  let lag = 11
  let thresh = 5
  let influence = 0.5

  const fftSize = 8192 // window size for fft
  const freqBinCount = fftSize / 2

  function calcFreqArr(Fres, len) {
    const arr = new Uint16Array(freqBinCount)
    for (let i = 0; i < len; i++) {
      arr[i] = i * Fres
    }
    return arr
  }

  const dataArray = new Uint8Array(freqBinCount)

  let Fs = 44100 // Assume 44.1kHz until we activate the Web Audio API
  $: Fres = Fs / fftSize // Frequency resolution
  $: freq2idx = (freq) => Math.round(freq / Fres)

  // Constrain frequency to <1000 Hz for viz
  $: maxVizIdx = freq2idx(1000)
  $: plotY = dataArray.subarray(0, maxVizIdx)
  $: freqArray = calcFreqArr(Fres, dataArray.length)
  $: plotX = freqArray.subarray(0, maxVizIdx)

  function onSuccess(stream) {
    const audioCtx = new AudioContext()
    Fs = audioCtx.sampleRate // audio sampling frequency
    console.log(`Sampling frequency: ${Fs}Hz`)

    const analyser = audioCtx.createAnalyser()
    analyser.fftSize = fftSize
    analyser.minDecibels = -70
    const audioSrc = audioCtx.createMediaStreamSource(stream)
    audioSrc.connect(analyser)

    let frame

    const loop = () => {
      if (!running) {
        return
      }
      frame = requestAnimationFrame(loop)
      analyser.getByteFrequencyData(dataArray)

      plotY = dataArray.subarray(0, maxVizIdx)

      // Calculate chroma vector
      const chromaVector = findChromaVector(dataArray, Fs, fftSize)
      if (chromaVector.reduce((prev, v) => prev + v) > 40) {
        detectedChord = bitMaskMatch(chromaVector)
      }

      /*// Find indices of peaks
      const peakIdx = detectPeaks(
        dataArray,
        maxIdx,
        lag,
        thresh,
        influence
      ).slice(0, 7) // Limit to the bottom 7 peaks

      // Convert indices to notes and deduplicate
      const notes = [...new Set(peakIdx.map((idx) => getNote(idx * Fres)))]
      detectedNotes = notes*/
    }
    frame = requestAnimationFrame(loop)
  }
  onMount(() => {})

  function toggleStartStop() {
    if (running) {
      running = false
    } else {
      running = true

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

  function handleKeyDown(kev) {
    kev.code === 'KeyA' && toggleStartStop()
  }
</script>

<svelte:window on:keydown={handleKeyDown} />

<main>
  <div class="container">
    <div class="row">
      <h1>
        <a href="https://kwsp.github.io/chord-analyser/">Chord Analyser</a>
      </h1>
    </div>

    <p>
      Press "A" or the "start" button to toggle the chord analyser. Try to play
      a chord on the guitar or piano, pause the app right after and see how many
      notes it got right. All processing is done in the browser and no data is
      sent anywhere.
    </p>

    {#if running}
      <button on:click={toggleStartStop}>stop</button>
    {:else}
      <button on:click={toggleStartStop}>start</button>
    {/if}

    <SpectrumVisualiser {plotX} {plotY} />

    <div class="row">
      <div id="buttons">
        <label>
          Lag
          <input type="number" bind:value={lag} min="5" max="25" />
          <input type="range" bind:value={lag} min="5" max="25" />
        </label>

        <label>
          Thresh
          <input
            type="number"
            bind:value={thresh}
            min="3"
            max="15"
            step="0.5"
          />
          <input type="range" bind:value={thresh} min="3" max="15" step="0.5" />
        </label>

        <label>
          Influence
          <input
            type="number"
            bind:value={influence}
            min="0"
            max="1"
            step="0.1"
          />
          <input
            type="range"
            bind:value={influence}
            min="0"
            max="1"
            step="0.1"
          />
        </label>
      </div>
    </div>

    <br />

    <div class="row" />

    <div class="row">
      <p>Chords: {detectedChord ? detectedChord : 'N/A'}</p>
      <p>Notes: {detectedNotes ? detectedNotes : 'N/A'}</p>
    </div>

    <p>
      This app attempts to distinguish between the notes you are playing by 1.
      transforming the audio to the frequency domain via FFT, 2. detecting the
      peaks, 3. matching each peak to the closest note in the chromatic scale.
    </p>
    <p>
      I've always wanted something like this to analyze the sounds I hear when I
      don't have my guitar with me (unfortunately I don't have perfect pitch),
      and I hacked this web app together in a weekend. It is not perfect - some
      notes might be off by a semitone, and strong overtones will be picked up.
      If you have ideas for improvement, please let me know.
    </p>

    <a href="https://github.com/kwsp/chord-analyser/">Github</a>
  </div>
</main>
