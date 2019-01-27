// https://gist.githubusercontent.com/lkpttn/63eb3f16e0c46b42226728f5977bd62a/raw/6aa14fccf0ec753a2dab2bc2ce6695e95f356ca1/sketch.js
// https://twitter.com/friendofpixels/status/1080316256098701312

const canvasSketch = require('canvas-sketch');
const { lerp } = require('canvas-sketch-util/math');
const random = require('canvas-sketch-util/random');
const palettes = require('nice-color-palettes');

const settings = {
  // Defines settings for canvas size, exports, etc
  // dimensions: [2048, 2048],

  // iPhone XS Max
  dimensions: [1242, 2688],
};

// Encapsulates the entire project in a single function.
const sketch = () => {
  // Picks a random 5 color palette from the library
  const palette = random.pick(palettes);

  const symbols = [];

  ['🦄', '✨', '🎉'].forEach(symbol => {
    symbols.push({ value: symbol, weight: 50 });
  });

  ['▬', '‑', '‒', '—', '‑', '‒', '—', '▲', '●'].forEach(symbol => {
    symbols.push({ value: symbol, weight: 200 });
  });

  // Create an array of points
  // We want to set up all the data in one place, and keep it separate from the rendering
  // All randomness and generation happens here, not in the render function
  const createGrid = () => {
    const points = [];
    const count = 45;

    // Nested for loop to create x and y coordinates
    for (let x = 0; x < count; x++) {
      for (let y = 0; y < count; y++) {
        // Working in uv space instead of final pixel coordinates
        // For added flexibility
        const u = count <= 1 ? 0.5 : x / (count - 1);
        const v = count <= 1 ? 0.5 : y / (count - 1);

        // Using 2D noise will return relatively similar values that move slowly between -1 and 1
        const radius = 0.03 + Math.abs(random.noise2D(u, v, 2) * 0.05);
        points.push({
          radius: radius,
          color: random.pick(palette),
          rotation: random.noise2D(u, v),
          character: random.weightedSet(symbols),
          postion: [u, v],
        });
      }
    }
    return points;
  };

  // Filter will return an array based on the function it recieves
  // Here it's removing grid points randomly, about half
  const points = createGrid().filter(() => random.value() > 0.5);
  const margin = 0;

  // Returns a function, a render function
  // Feed it "props"
  return ({ context, width, height }) => {
    context.fillStyle = '#212529';
    context.fillRect(0, 0, width, height);

    points.forEach(data => {
      // Destructure the data parameter so we can access the grid object properties
      const { postion, color, radius, rotation, character } = data;
      const [u, v] = postion;

      // Need to turn uv values back into real pixels
      // Using linear interpolation to start the grid
      // Lerp returns a value between min and max, interpolated by t
      // From our earlier function, the uv values are between 0 and 1, suitable for interpolation
      const x = lerp(margin, width - margin, u);
      const y = lerp(margin, height - margin, v);

      context.save();
      context.fillStyle = color;
      context.font = `${radius * width}px "Arial"`;
      context.translate(x, y);
      context.rotate(rotation);
      context.fillText(character, 0, 0);
      context.restore();

      // context.beginPath();
      // context.arc(x, y, radius * width, 0, Math.PI * 2, false);
      // context.fillStyle = color;
      // context.fill();
    });
  };
};

canvasSketch(sketch, settings);
