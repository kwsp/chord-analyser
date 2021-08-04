// Implementation of "Real-Time Chord Recognition For Live Performance", A. M. Stark and M. D. Plumbley. In Proceedings of the 2009 International Computer Music Conference (ICMC 2009), Montreal, Canada, 16-21 August 2009.

/**
 * @param X Array magnitude spectrum
 * @param fs int sampling frequency
 * @param L int frame size of the DFT
 *
 * TODO: Make this more robust against lower notes in a chord
 */
export function findChromaVector(X, fs, L) {
  // Square root the magnitude spectrum
  X = X.map((v) => Math.sqrt(v))
  const C = new Float32Array(12)
  const r = 1 // number of bins

  const _calc = (phi, h, n) => {
    const kp = kPrime(n, phi, h, fs, L)
    const k0 = kp - r * h
    const k1 = kp + r * h
    return Math.max(...X.slice(k0, k1))
  }

  for (let i = 0; i < 12; i++) {
    C[i] =
      _calc(1, 1, i) + _calc(2, 1, i) + (_calc(1, 2, i) + _calc(2, 2, i)) / 2
  }

  return C
}

/**
 * @param n int 0,1,...,11 for each of the 12 chromatic notes
 * @param phi int number of octaves to consider
 * @param h int number of the harmonic
 */
function kPrime(n, phi, h, fs, L) {
  // TODO: use precomputed frequencies rather than calling f()
  return Math.round((f(n) * phi * h) / (fs / L))
}

const fC3 = 130.81
function f(n) {
  return fC3 * Math.pow(2, n / 12)
}

// Variations of all C chords
const allCChords = {
  maj: [1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0],
  maj7: [1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 1],
  m: [1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0],
  m7: [1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1, 0],
  7: [1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0], // dominant 7th
  dim: [1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0],
}

// prettier-ignore
const notesSharp = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
// prettier-ignore
const notesFlat = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B']

function mask2notes(mask) {
  const res = []
  mask.forEach((v, i) => {
    if (v) {
      res.push(notesSharp[i])
    }
  })
  return res
}

function mod(i, v) {
  return ((i % v) + v) % v
}

// rightShift creates a copy of arr shifted to the right by i bit
function rightShift(arr, i = 1) {
  const res = new Int8Array(arr.length)
  for (let j = 0; j < res.length; j++) {
    res[j] = arr[mod(j - i, arr.length)]
  }
  return res
}

/**
 * generateAllChords depends on `allCChords`, `notesSharp` (or `notesFlat`),
 * and the function `rightShift`
 */
function generateAllChords() {
  const names = Object.keys(allCChords)
  const notes = notesSharp

  // Returns
  const allChords = {}

  let root = 'C'
  for (const name of names) {
    const chordName = name === 'maj' ? root : root + name
    const bitMask = new Uint8Array(allCChords[name])
    const invertedMask = bitMask.map((v) => (v ? 0 : 1))
    const nNotes = bitMask.reduce((a, v) => (v ? a + 1 : a))

    allChords[chordName] = {
      bitMask: bitMask,
      invertedMask: invertedMask,
      nNotes: nNotes,
    }
  }

  for (let n = 1; n < notes.length; n++) {
    root = notes[n]
    for (const name of names) {
      const chordName = name === 'maj' ? root : root + name
      const bitMask = rightShift(allCChords[name], n)
      const invertedMask = bitMask.map((v) => (v ? 0 : 1))
      const nNotes = bitMask.reduce((a, v) => (v ? a + 1 : a))

      allChords[chordName] = {
        bitMask: bitMask,
        invertedMask: invertedMask,
        nNotes: nNotes,
      }
    }
  }

  return allChords
}

// Object storing precomputed information on all chords,
// including their bitmask, inverted bitmask, and number of notes
const allChords = generateAllChords() // Must not modify after generated
const chordNames = Object.keys(allChords) // chordNames depends on allChords being constant

/**
 * @param C array Chroma vector
 *
 * TODO: currently we minimize delta for the inverted mask as per Stark et al.
 * However, when playing a pair of notes such as E and G, which should match Em,
 * a few chords are matched with delta = 0 (e.g. C7) since E and G are 0 in the inverted
 * bit mask of C7 (any any chord with notes E and G).
 */
export function bitMaskMatch(C) {
  const delta = new Float32Array(chordNames.length)

  for (let i = 0; i < chordNames.length; i++) {
    const imask = allChords[chordNames[i]].invertedMask // inverted mask of this chord
    const nNotes = allChords[chordNames[i]].nNotes // inverted mask of this chord

    let dotprod = 0
    for (let n = 0; n < 12; n++) {
      dotprod += imask[n] * C[n] * C[n]
    }
    delta[i] = Math.sqrt(dotprod) / (12 - nNotes)
  }

  const idx = argMin(delta)
  if (idx === 0) {
    console.log(delta)
    //debugger
  }
  return chordNames[idx]
}

function argMin(arr) {
  let min = arr[0]
  let minIdx = 0
  for (let i = 1; i < arr.length; i++) {
    if (arr[i] < min) {
      min = arr[i]
      minIdx = i
    }
  }
  return minIdx
}
