const express = require('express');
const router = express.Router();
const Summary = require('../models/Summary');
const Groq = require('groq-sdk');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// helper to call Groq LLM
async function callGroqChat(messages) {
  const res = await groq.chat.completions.create({
    model: 'llama3-8b-8192', // or "mixtral-8x7b-32768"
    messages,
    max_tokens: 800,
    temperature: 0.8,   // more variety
    top_p: 1.0,         // allow broader diversity
  });
  return res;
}

router.post('/generate', async (req, res) => {
  try {
    const { transcript = '', prompt = '' } = req.body;
    let system = '';
    let user_msg = '';

    if (prompt && prompt.trim() !== '') {
      // 🔹 If user gave a custom instruction → fully follow it
      system = `Follow the user's instructions exactly. 
Do not add extra formatting unless asked.`;

      user_msg = `${prompt}\n\nTranscript:\n${transcript}`;
    } else {
      // 🔹 Default fallback structure
      system = `You are an assistant that converts meeting transcripts into a structured summary.
Output must be plain text. Provide:
1) Title line
2) Short summary (2-4 lines)
3) Action Items as a numbered list with owner (if any) and due date (if present in text)
4) Decisions made as bullet points
5) Key points / bullet summary
Do not include disclaimers. Keep concise.`;

      user_msg = `Transcript:\n${transcript}\n\nPlease produce a clear structured summary with headings:
Title:, Summary:, Action Items:, Decisions:, Key Points:.`;
    }

    const messages = [
      { role: 'system', content: system },
      { role: 'user', content: user_msg },
    ];

    const aiResp = await callGroqChat(messages);
    const aiText = aiResp.choices?.[0]?.message?.content ?? '';

    const doc = await Summary.create({
      transcript,
      prompt,
      generated: aiText,
      edited: aiText,
      updatedAt: new Date(),
    });

    res.json({ ok: true, summaryId: doc._id, generated: aiText });
  } catch (err) {
    console.error('Groq error:', err);
    res.status(500).json({ ok: false, error: err.message || 'server error' });
  }
});

router.post('/save', async (req, res) => {
  try {
    const { summaryId, edited } = req.body;
    if (!summaryId) {
      return res.status(400).json({ ok: false, error: 'missing summaryId' });
    }
    const doc = await Summary.findByIdAndUpdate(
      summaryId,
      { edited, updatedAt: new Date() },
      { new: true }
    );
    res.json({ ok: true, doc });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const doc = await Summary.findById(req.params.id);
    if (!doc) return res.status(404).json({ ok: false, error: 'not found' });
    res.json({ ok: true, doc });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

module.exports = router;
