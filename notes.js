// prettier-ignore
const frequencies = new Float32Array([
  130.81, 138.59, 146.83, 155.56, 164.81, 174.61, 185.0, 196.0, 207.65, 220.0,
  233.08, 246.94, 261.63, 277.18, 293.66, 311.13, 329.63, 349.23, 369.99,
  392.0, 415.3, 440.0, 466.16, 493.88, 523.25,
])

// prettier-ignore
const notes = [
  'C3', 'C#3/Db3', 'D3', 'D#3/Eb3', 'E3', 'F3', 'F#3/Gb3', 'G3', 'G#3/Ab3',
  'A3', 'A#3/Bb3', 'B3', 'C4', 'C#4/Db4', 'D4', 'D#4/Eb4', 'E4', 'F4',
  'F#4/Gb4', 'G4', 'G#4/Ab4', 'A4', 'A#4/Bb4', 'B4', 'C5',
]

const binarySearchNN = (freq) => {
  let l = 0
  let r = frequencies.length
  let m = -1
  let prev_m = -1
  while (l < r) {
    m = Math.round((l + r) / 2)
    if (m == prev_m) {
      break
    }
    if (freq > frequencies[m]) {
      l = m + 1
    } else {
      r = m
    }
    prev_m = m
  }
  return frequencies[l] - freq > freq - frequencies[l - 1] ? l - 1 : l
}

const getNote = (freq) => {
  const i = binarySearchNN(freq)
  return notes[i]
}
