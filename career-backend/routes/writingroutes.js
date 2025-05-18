// const express = require('express');
// const bodyParser = require('body-parser');
// const axios = require('axios');

// const app = express();
// const port = 5000;

// const TOGETHER_API_KEY = "tgp_v1_9oyojAXWPruYUbQWWaK-dw15u6gIAz_vkIMHOgm1RaM";
// const TOGETHER_AI_URL = "https://api.together.xyz/v1/chat/completions";

// app.use(bodyParser.json());

// // Endpoint to fetch tasks
// app.post('/tasks', async (req, res) => {
//   try {
//     const response = await axios.post(TOGETHER_AI_URL, {
//       model: "mistralai/Mixtral-8x7B-Instruct-v0.1",
//       messages: [
//         { role: "system", content: "You are an English teacher creating multiple-choice questions." },
//         { role: "user", content: `
//   Generate 10 mixed-difficulty English questions for children (grades 2-8). 
//   Each question must include:
//   - A clear question
//   - 4 options (A, B, C, D)
//   - The correct answer letter (A/B/C/D)

//   Return ONLY JSON array like:
//   [
//     {
//       "question": "What is the synonym of 'happy'?",
//       "options": ["sad", "joyful", "angry", "tired"],
//       "answer": "B"
//     },
//     ...
//   ]
//         `},
//       ],
//       temperature: 0.7,
//     }, {
//       headers: { 'Authorization': `Bearer ${TOGETHER_API_KEY}` },
//     });

//     const tasks = JSON.parse(response.data.choices[0].message.content.trim());
//     res.json({ tasks });
//   } catch (error) {
//     console.error(error);
//     res.status(500).send("Error fetching tasks");
//   }
// });

// // Endpoint to fetch story starter
// app.post('/storyStarter', async (req, res) => {
//   try {
//     const response = await axios.post(TOGETHER_AI_URL, {
//       model: "meta-llama/Llama-3.3-70B-Instruct-Turbo-Free",
//       messages: [
//         { role: "system", content: "You are a creative writing coach." },
//         { role: "user", content: `
//   Give one mysterious story starter sentence for middle schoolers, no extra words.
//   Example: "Under the bed, something was breathing..."
//         `},
//       ],
//       temperature: 0.8,
//     }, {
//       headers: { 'Authorization': `Bearer ${TOGETHER_API_KEY}` },
//     });

//     const starter = response.data.choices[0].message.content.trim();
//     res.json({ starter });
//   } catch (error) {
//     console.error(error);
//     res.status(500).send("Error fetching story starter");
//   }
// });

// // Endpoint to evaluate level 1 answers
// app.post('/evaluateLevel1', async (req, res) => {
//   const { answers } = req.body;

//   try {
//     const response = await axios.post(TOGETHER_AI_URL, {
//       model: "meta-llama/Llama-3.3-70B-Instruct-Turbo-Free",
//       messages: [
//         { role: "system", content: "You are an expert English teacher grading MCQ exams." },
//         { role: "user", content: `
//   Grade the following answers. Give a total score out of 75.
  
//   ${JSON.stringify(answers)}
  
//   Only return JSON like:
//   {
//     "score": 65
//   }
//         `},
//       ],
//       temperature: 0.5,
//     }, {
//       headers: { 'Authorization': `Bearer ${TOGETHER_API_KEY}` },
//     });

//     const result = JSON.parse(response.data.choices[0].message.content.trim());
//     res.json({ score: result.score || 0 });
//   } catch (error) {
//     console.error(error);
//     res.status(500).send("Error evaluating Level 1 answers");
//   }
// });

// // Endpoint to evaluate level 2 writing
// app.post('/evaluateLevel2', async (req, res) => {
//   const { writing } = req.body;

//   try {
//     const response = await axios.post(TOGETHER_AI_URL, {
//       model: "meta-llama/Llama-3.3-70B-Instruct-Turbo-Free",
//       messages: [
//         { role: "system", content: "You are an English teacher grading creative writing." },
//         { role: "user", content: `
//   Grade the following writing based on creativity, grammar, and engagement.
//   Respond with a score out of 25 and a feedback note for the student.
  
//   Writing: ${writing}
//         `},
//       ],
//       temperature: 0.7,
//     }, {
//       headers: { 'Authorization': `Bearer ${TOGETHER_API_KEY}` },
//     });

//     const result = JSON.parse(response.data.choices[0].message.content.trim());
//     res.json({
//       creativity: result.creativity || 0,
//       grammar: result.grammar || 0,
//       engagement: result.engagement || 0,
//       feedback: result.feedback || "No feedback.",
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).send("Error evaluating Level 2 writing");
//   }
// });

// app.listen(port, () => {
//   console.log(`Backend is running on http://localhost:${port}`);
// });
