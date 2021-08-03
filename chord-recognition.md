- "Real-Time Chord Recognition For Live Performance", A. M. Stark and M. D. Plumbley. In Proceedings of the 2009 International Computer Music Conference (ICMC 2009), Montreal, Canada, 16-21 August 2009.

## Approach

1. Multiply the signal frame by a Hamming window and calculate a the magnitude spectrum, X(k), using DFT
2. Take the square root of the magnitude spectrum to reduce the amplitude difference between harmonics
3. Frequencies of the lower octaves, starting from f_c3 = 130.81 Hz, are calculated by f(n) = f_c3 \* 2^(n/12) for n = 0,1,...,P-1 where P = 12.

- Consider only the energy present in the partial itself by finding the largest peak withing a given frequency range.
- Also allow the system to detect partials that are slightly inharmonic.

Examine only two octaves of the spectrum (between f_c3 = 130.81 Hz and f_c5 = 523.25 Hz)

- To comfortably achieve quarter-tone frequency resolution at 131.81 Hz, use a sampling frequency of 11025Hz or higher and a frame size of 8192 samples (0.74)
- The Web Audio API provides access to the microphones of the underlying hardware, and most modern hardware's built in microphone sample at 44.1kHz, more than enough for this application.
