import express from 'express';
import { GoogleGenAI, Type } from '@google/genai';
import { authMiddleware, teacherOnly } from '../middleware/auth.js';

const router = express.Router();
router.use(authMiddleware);
router.use(teacherOnly);

router.post('/refine-groups', async (req, res) => {
  try {
    const { students, groups } = req.body;
    const apiKey = (process.env.GEMINI_API_KEY || '').trim();
    if (!apiKey) {
      return res.status(503).json({
        error: 'AI service not configured. Add GEMINI_API_KEY to server/.env (get one at https://aistudio.google.com/apikey)'
      });
    }

    const ai = new GoogleGenAI({ apiKey });

    const studentDataSummary = students.map((s) => ({
      id: s.id,
      skills: s.skills || [],
      cgpa: s.cgpa
    }));

    const prompt = `I have formed student groups based on CGPA balance. 
Please review these groups and provide a short summary of the "vibe" or "skill balance" for each group.

Students: ${JSON.stringify(studentDataSummary)}
Proposed Groups: ${JSON.stringify(groups)}

Return a JSON object where the key is the group name (e.g. "Team 1", "Team 2") and the value is a one-sentence "Smart Analysis" of why this group works well or what their collective strength is based on their skills.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          description: 'Analysis for each group name',
          properties: groups.reduce((acc, g) => {
            acc[g.name] = { type: Type.STRING };
            return acc;
          }, {})
        }
      }
    });

    let text = '';
    if (response.text != null) {
      text = typeof response.text === 'function' ? response.text() : String(response.text);
    }
    if (!text) {
      const candidates = response.candidates || [];
      const content = candidates[0]?.content?.parts?.[0];
      if (content?.text) text = content.text;
    }
    if (!text || !text.trim()) {
      throw new Error('Empty response from AI model');
    }
    const parsed = JSON.parse(text.trim());
    res.json(parsed);
  } catch (err) {
    console.error('AI Group Refinement Error:', err);
    const msg = err.message || 'AI refinement failed.';
    res.status(500).json({ error: msg });
  }
});

export default router;
