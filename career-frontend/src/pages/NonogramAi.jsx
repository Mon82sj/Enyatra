import axios from 'axios';

const TOGETHER_AI_URL = "https://api.together.xyz/v1/chat/completions";
const TOGETHER_API_KEY = "tgp_v1_9oyojAXWPruYUbQWWaK-dw15u6gIAz_vkIMHOgm1RaM";

export async function askAI(message) {
  const response = await axios.post(
    TOGETHER_AI_URL,
    {
      model: "mistralai/Mixtral-8x7B-Instruct-v0.1",
      messages: [{ role: "user", content: message }],
    },
    {
      headers: {
        "Authorization": `Bearer ${TOGETHER_API_KEY}`,
        "Content-Type": "application/json",
      }
    }
  );

  return response.data.choices[0].message.content;
}
