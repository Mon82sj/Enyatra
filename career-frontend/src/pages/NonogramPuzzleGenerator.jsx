import { askAI } from './NonogramAi';
const MAX_RETRIES = 5;

export async function askAIWithRetry(message) {
  let retries = 0;
  while (retries < MAX_RETRIES) {
    try {
      return await askAI(message);
    } catch (error) {
      if (error.response?.status === 429) {
        retries += 1;
        const delay = Math.pow(2, retries) * 1000;
        console.log(`Rate limit hit. Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        throw error;
      }
    }
  }
  throw new Error('Max retries reached.');
}

export async function generatePuzzleBatch() {
  const prompt = `
Generate 3 Nonogram puzzle grids:
- One 5x5 (easy), one 8x8 (medium), one 10x10 (hard)
- Each should be a JS array of 1s and 0s like:
[
  [1, 0, 1, 0, 0],
  ...
]
Return them in this format:
{
  "easy": [...],
  "medium": [...],
  "hard": [...]
}
Only include valid JSON. No explanations.
  `;

  const response = await askAIWithRetry(prompt);
  try {
    const json = JSON.parse(response.match(/{[\s\S]*}/)[0]);
    return json;
  } catch (e) {
    console.error("Error parsing AI batch response:", e);
    return null;
  }
}
