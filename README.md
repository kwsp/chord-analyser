# chord-analyser

This web app listens on the microphone and attempts to distinguish between the chromatic notes you are playing on a instrument (e.g. guitar or piano). It does so by 

1. transforming the audio to the frequency domain via FFT with the Web Audio API's [AnalyserNode](https://developer.mozilla.org/en-US/docs/Web/API/AnalyserNode),
2. finding the peaks in the frequency domain,
3. finding the closest chromatic note each frequency peak corresponds to via a binary nearest neighbour search.

I've always wanted something like this to analyze the sounds I hear when I don't have my guitar with me (unfortunately I don't have perfect pitch), and I hacked this web app together in a weekend. It is not perfect - some notes might be off by a semitone, and strong overtones will be picked up. If you have ideas for improvement, please let me know.
