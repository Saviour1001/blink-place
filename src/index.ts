import Jimp from "jimp";

// Initialize image with fixed size
const width = 800;
const height = 600;
let image: Jimp;

// Array to store added words
const addedWords: Array<{
  word: string;
  fontSize: number;
  color: number;
  x: number;
  y: number;
}> = [];

// Function to generate a random vibrant color (non-white)
function getRandomColor(): number {
  const hue = Math.random();
  const saturation = 0.5 + Math.random() * 0.5; // 50-100% saturation
  const value = 0.3 + Math.random() * 0.6; // 30-90% value
  return Jimp.rgbaToInt(...hsvToRgb(hue, saturation, value), 255);
}

// Function to convert HSV to RGB
function hsvToRgb(h: number, s: number, v: number): [number, number, number] {
  let r, g, b;
  const i = Math.floor(h * 6);
  const f = h * 6 - i;
  const p = v * (1 - s);
  const q = v * (1 - f * s);
  const t = v * (1 - (1 - f) * s);
  switch (i % 6) {
    case 0:
      [r, g, b] = [v, t, p];
      break;
    case 1:
      [r, g, b] = [q, v, p];
      break;
    case 2:
      [r, g, b] = [p, v, t];
      break;
    case 3:
      [r, g, b] = [p, q, v];
      break;
    case 4:
      [r, g, b] = [t, p, v];
      break;
    case 5:
      [r, g, b] = [v, p, q];
      break;
  }
  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

// Function to get the appropriate Jimp font based on fontSize
async function getFontForSize(fontSize: number): Promise<any> {
  if (fontSize <= 16) return await Jimp.loadFont(Jimp.FONT_SANS_16_BLACK);
  if (fontSize <= 32) return await Jimp.loadFont(Jimp.FONT_SANS_32_BLACK);
  if (fontSize <= 64) return await Jimp.loadFont(Jimp.FONT_SANS_64_BLACK);
  return await Jimp.loadFont(Jimp.FONT_SANS_128_BLACK);
}

// Function to add a word to the image
async function addWord(word: string, fontSize: number) {
  if (!image) {
    image = new Jimp(width, height, 0xffffffff);
  }

  const color = getRandomColor();
  const font = await getFontForSize(fontSize);

  const textWidth = Jimp.measureText(font, word);
  const textHeight = Jimp.measureTextHeight(font, word, width);

  // Find a random position for the word
  const x = Math.floor(Math.random() * (width - textWidth));
  const y = Math.floor(Math.random() * (height - textHeight));

  const textImage = new Jimp(textWidth, textHeight);
  textImage.print(
    font,
    0,
    0,
    {
      text: word,
      alignmentX: Jimp.HORIZONTAL_ALIGN_LEFT,
      alignmentY: Jimp.VERTICAL_ALIGN_MIDDLE,
    },
    textWidth
  );

  textImage.scan(0, 0, textWidth, textHeight, function (x, y, idx) {
    if (this.bitmap.data[idx + 3] !== 0) {
      this.bitmap.data[idx] = (color >> 16) & 255;
      this.bitmap.data[idx + 1] = (color >> 8) & 255;
      this.bitmap.data[idx + 2] = color & 255;
    }
  });

  image.composite(textImage, x, y, {
    mode: Jimp.BLEND_SOURCE_OVER,
    opacitySource: 1,
    opacityDest: 1,
  });

  addedWords.push({ word, fontSize, color, x, y });

  console.log(
    `Added "${word}" to the image at (${x}, ${y}) with font size ${fontSize} and color: #${color
      .toString(16)
      .padStart(6, "0")}`
  );
}

// Example usage
async function main() {
  const words = [
    { word: "Hello", size: 64 },
    { word: "World", size: 48 },
    { word: "Node.js", size: 80 },
    { word: "TypeScript", size: 56 },
    { word: "Jimp", size: 72 },
    { word: "Colors", size: 40 },
    { word: "Random", size: 32 },
    { word: "Cloud", size: 88 },
    { word: "Generator", size: 24 },
    { word: "Image", size: 64 },
    { word: "Processing", size: 40 },
    { word: "Algorithm", size: 56 },
    { word: "Placement", size: 48 },
    { word: "Whitespace", size: 32 },
    { word: "Filling", size: 40 },
    { word: "Words", size: 36 },
    { word: "Text", size: 44 },
    { word: "Visual", size: 60 },
    { word: "Data", size: 28 },
    { word: "Representation", size: 36 },
    { word: "Dynamic", size: 52 },
    { word: "Resizing", size: 48 },
    { word: "Adaptive", size: 40 },
    { word: "Layout", size: 56 },
  ];

  // Shuffle the words array to randomize placement
  words.sort(() => Math.random() - 0.5);

  for (const { word, size } of words) {
    await addWord(word, size);
  }

  // Save the final image
  await image.writeAsync("./word_cloud.png");
  console.log(`Final image size: ${width}x${height}`);
  console.log("Image updated. Check word_cloud.png");
}

main().catch(console.error);
