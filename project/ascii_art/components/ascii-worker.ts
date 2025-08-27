// Web Worker for ASCII Art conversion to improve performance on large images
// This runs in a separate thread to avoid blocking the main UI thread

interface WorkerMessage {
  imageData: ImageData;
  asciiChars: string;
  monospaceAspectRatio: number;
  luminosityWeights: { r: number; g: number; b: number };
}

interface WorkerResponse {
  asciiArt: string;
  error?: string;
}

self.addEventListener('message', (event: MessageEvent<WorkerMessage>) => {
  try {
    const { imageData, asciiChars, luminosityWeights } = event.data;
    const { data, width, height } = imageData;
    
    const asciiCharsLengthMinusOne = asciiChars.length - 1;
    const asciiLines: string[] = [];
    
    // Process image data in the worker thread
    for (let y = 0; y < height; y++) {
      const row: string[] = [];
      const rowStartIndex = y * width * 4;
      
      for (let x = 0; x < width; x++) {
        const pixelIndex = rowStartIndex + (x * 4);
        const r = data[pixelIndex];
        const g = data[pixelIndex + 1];
        const b = data[pixelIndex + 2];

        // Calculate grayscale using luminosity formula
        const gray = luminosityWeights.r * r + luminosityWeights.g * g + luminosityWeights.b * b;
        
        // Convert grayscale to ASCII character index
        const charIndex = Math.floor((gray / 255) * asciiCharsLengthMinusOne);
        row.push(asciiChars[charIndex]);
      }
      asciiLines.push(row.join(''));
    }
    
    const response: WorkerResponse = {
      asciiArt: asciiLines.join('\n')
    };
    
    self.postMessage(response);
  } catch (error) {
    const response: WorkerResponse = {
      asciiArt: '',
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
    self.postMessage(response);
  }
});

export {};
