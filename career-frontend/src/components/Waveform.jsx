import React, { useEffect, useRef, useState } from 'react';

function AudioWaveform() {
  const [audioUrl, setAudioUrl] = useState('/story.mp3');  // URL for your audio file
  const audioRef = useRef(null); // Reference to the audio element
  const canvasRef = useRef(null); // Reference to the canvas element
  const [isPlaying, setIsPlaying] = useState(false);
  const audioContext = useRef(new (window.AudioContext || window.webkitAudioContext)()); // Create an AudioContext
  const analyserRef = useRef(audioContext.current.createAnalyser()); // Create an analyser node
  const bufferLengthRef = useRef(0); // Holds the length of the waveform data
  const dataArrayRef = useRef(null); // Holds the waveform data

  useEffect(() => {
    const audioElement = audioRef.current;
    const analyser = analyserRef.current;

    // Setup the audio context
    const source = audioContext.current.createMediaElementSource(audioElement);
    source.connect(analyser);
    analyser.connect(audioContext.current.destination);
    analyser.fftSize = 256; // Number of frequency bins
    bufferLengthRef.current = analyser.frequencyBinCount; // Get the length of the waveform data
    dataArrayRef.current = new Uint8Array(bufferLengthRef.current); // Create the data array for waveform data

    // Start drawing the waveform once the audio is playing
    const drawWaveform = () => {
      analyser.getByteFrequencyData(dataArrayRef.current); // Get frequency data from the analyser
      draw(); // Call the draw function to update the canvas
      requestAnimationFrame(drawWaveform); // Continuously call this function
    };

    // Draw the waveform on the canvas
    const draw = () => {
      const canvas = canvasRef.current;
      const canvasContext = canvas.getContext('2d');
      const width = canvas.width;
      const height = canvas.height;
      canvasContext.clearRect(0, 0, width, height); // Clear the canvas for the new frame
      const barWidth = width / bufferLengthRef.current;
      let barHeight;
      let x = 0;

      // Loop through the frequency data to draw the waveform
      for (let i = 0; i < bufferLengthRef.current; i++) {
        barHeight = dataArrayRef.current[i];
        canvasContext.fillStyle = `rgb(${barHeight + 100}, 50, 50)`; // Color for each bar
        canvasContext.fillRect(x, height - barHeight / 2, barWidth, barHeight); // Draw each bar
        x += barWidth + 1; // Move the x position for the next bar
      }
    };

    // Start drawing when the audio plays
    if (audioElement) {
      audioElement.onplay = () => {
        drawWaveform();
      };
    }

    // Cleanup when the component unmounts
    return () => {
      if (audioElement) {
        audioElement.onplay = null;
      }
    };
  }, [audioUrl]);

  const handlePlayPause = () => {
    const audioElement = audioRef.current;
    if (audioElement.paused) {
      audioElement.play();
      setIsPlaying(true);
    } else {
      audioElement.pause();
      setIsPlaying(false);
    }
  };

  return (
    <div>
      <audio ref={audioRef} src={audioUrl} />
      <div>
        <button onClick={handlePlayPause}>{isPlaying ? 'Pause' : 'Play'}</button>
      </div>
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <h3>{isPlaying ? '🎶 Playing Audio...' : '🎵 Press Play to Start'}</h3>
        <canvas ref={canvasRef} width="800" height="100" style={{ border: '1px solid black' }} />
      </div>
    </div>
  );
}

export default AudioWaveform;
