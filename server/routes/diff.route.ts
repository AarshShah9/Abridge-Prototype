import express, { Request, Response } from 'express';
import GeminiTranscriptionService from '../services/geminiTranscription';
import { client } from '../prisma/client';

const router = express.Router();

// Generate visit diff between prior note and current transcript
router.post('/', async (req: Request, res: Response) => {
  try {
    const { prior_note, current_transcript, transcriptionId } = req.body as { prior_note: string; current_transcript: string; transcriptionId?: string };
    if (!prior_note || !current_transcript) {
      return res.status(400).json({ error: 'prior_note and current_transcript are required' });
    }
    const gemini = GeminiTranscriptionService.getInstance();
    const output = await gemini.generateVisitDiff(prior_note, current_transcript);

    // Persist analysis if transcriptionId provided
    if (transcriptionId) {
      await client.transcriptionAnalysis.upsert({
        where: { transcriptionId },
        update: {
          deltaSummary: output.delta_summary,
          changesNew: output.changes.new,
          changesResolved: output.changes.resolved,
          changesWorsened: output.changes.worsened,
          changesImproved: output.changes.improved,
          changesUnchanged: output.changes.unchanged,
        },
        create: {
          transcriptionId,
          deltaSummary: output.delta_summary,
          changesNew: output.changes.new,
          changesResolved: output.changes.resolved,
          changesWorsened: output.changes.worsened,
          changesImproved: output.changes.improved,
          changesUnchanged: output.changes.unchanged,
        }
      });
    }

    return res.status(200).json(output);
  } catch (error) {
    console.error('Error generating visit diff:', error);
    res.status(500).json({ error: 'Failed to generate visit diff' });
  }
});

export default router;
