<script>
  import SpectrumVisualiser from './Components/SpectrumVisualiser.svelte'
  import ChromaPlot from './Components/Chroma.svelte'
  import { findChromaVector, bitMaskMatch } from './chordRecognition'
  import { detectPeaks } from './detectPeaks.js'
  import { getNote } from './notes.js'

  let running = false // global flag for audio on/off
  let screenWidth // Bound to screen's innerWidth

  let detectedChord = ''
  let detectedNotes = ''

  // Peak detection params
  let lag = 11
  let thresh = 5
  let influence = 0.5

  const fftSize = 8192 * 2 // window size for fft
  const freqBinCount = fftSize / 2

  let chromaVector

  function calcFreqArr(Fres) {
    const arr = new Uint16Array(freqBinCount)
    for (let i = 0; i < freqBinCount; i++) {
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
  $: freqArray = calcFreqArr(Fres)
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

    const loop = () => {
      if (!running) {
        return
      }
      requestAnimationFrame(loop)
      analyser.getByteFrequencyData(dataArray)

      plotY = dataArray.subarray(0, maxVizIdx)

      // Calculate chroma vector
      chromaVector = findChromaVector(dataArray, Fs, fftSize)
      if (chromaVector.reduce((prev, v) => prev + v) > 40) {
        detectedChord = bitMaskMatch(chromaVector)
      }

      // Find indices of peaks
      const peakIdx = detectPeaks(
        dataArray,
        lag,
        thresh,
        influence,
        maxVizIdx
      ).slice(0, 8) // Limit to the bottom n peaks

      // Convert indices to notes and deduplicate
      detectedNotes = [...new Set(peakIdx.map((idx) => getNote(idx * Fres)))]
    }
    requestAnimationFrame(loop)
  }

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

<svelte:window on:keydown={handleKeyDown} bind:innerWidth={screenWidth} />

<main>
  <div class="container">
    <h1>
      <a href="https://kwsp.github.io/chord-analyser/">Chord Analyser</a>
    </h1>

    <p>
      Press "Start" to toggle the mic. Try to play a chord on the guitar or
      piano and see if it got the chords and notes right.
    </p>

    {#if running}
      <button on:click={toggleStartStop}><b>Stop</b></button>
    {:else}
      <button on:click={toggleStartStop}><b>Start</b></button>
    {/if}

    <span class="chordBox" style="width: 8em;">
      <b>Chord:</b>
      {detectedChord ? detectedChord : 'N/A'}
    </span>
    {#if screenWidth < 500}
      <br />
    {/if}
    <span class="notesBox">
      <b>Notes:</b>
      {detectedNotes ? detectedNotes : 'N/A'}
    </span>

    <SpectrumVisualiser {plotX} {plotY} />
    <ChromaPlot points={chromaVector} />

    <!--
    <label>
      Lag
      <input type="number" bind:value={lag} min="5" max="25" />
      <input type="range" bind:value={lag} min="5" max="25" />
    </label>

    <label>
      Thresh
      <input type="number" bind:value={thresh} min="3" max="15" step="0.5" />
      <input type="range" bind:value={thresh} min="3" max="15" step="0.5" />
    </label>

    <label>
      Influence
      <input type="number" bind:value={influence} min="0" max="1" step="0.1" />
      <input type="range" bind:value={influence} min="0" max="1" step="0.1" />
    </label>
    -->

    <p>
      This web app listens on the microphone and attempts to figure out the
      musical chords and notes you are playing on an instrument (e.g. guitar or
      piano). It first transforms the audio to the frequency domain via FFT with
      the Web Audio API's
      <a href="https://developer.mozilla.org/en-US/docs/Web/API/AnalyserNode">
        AnalyserNode
      </a>. To figure out the chords, it calculates the Chromagram from the
      power spectrum and matches the chromagram to a set of precomputed chord
      masks<a href="#ref1"><sup>1</sup></a>. To find the specific notes played,
      it looks for the peaks in the power spectrum and then find the closest
      chromatic note each peak frequency corresponds to via a binary nearest
      neighbour search.
    </p>
    <p>All processing is done in the browser and no data is sent anywhere.</p>

    References:
    <p class="references">
      <span id="ref1">
        1. "Real-Time Chord Recognition For Live Performance", A. M. Stark and
        M. D. Plumbley. In Proceedings of the 2009 International Computer Music
        Conference (ICMC 2009), Montreal, Canada, 16-21 August 2009.
      </span>
    </p>

    <a href="https://github.com/kwsp/chord-analyser/">Github</a>
  </div>
</main>

<style>
  main {
    max-width: 700px;
    margin: 0 auto;
    padding-bottom: 1em;
  }

  .chordBox {
    border: 1px solid #ccc;
    border-radius: 2px;
    padding: 0.4em;
    display: inline-block;
  }
  .references {
    margin-left: 1.5em;
  }
</style>
