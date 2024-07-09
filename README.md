# chord-analyser

This web app listens on the microphone and attempts to figure out the musical chords and notes you are playing on an instrument (e.g. guitar or piano). It first transforms the audio to the frequency domain via FFT with the Web Audio API's [AnalyserNode](https://developer.mozilla.org/en-US/docs/Web/API/AnalyserNode). To figure out the chords, it calculates the Chromagram from the power spectrum and matches the chromagram to a set of precomputed chord masks, as per Stark et al. To find the specific notes played, it looks for the peaks in the power spectrum and then find the closest chromatic note each peak frequency corresponds to via a binary nearest neighbour search.

I've always wanted something like this to analyze the sounds I hear when I don't have my guitar with me (unfortunately I don't have perfect pitch), and I hacked this web app together in a weekend. It is not perfect - some notes might be off by a semitone, and strong overtones will be picked up. If you have ideas for improvement, please let me know.