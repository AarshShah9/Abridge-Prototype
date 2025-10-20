import express, { Request, Response } from 'express';
import { client } from '../prisma/client';

const router = express.Router();

// Get all patients
router.get('/', async (req: Request, res: Response) => {
  try {
    const patients = await client.patient.findMany({
      select: {
        id: true,
        mrn: true,
        name: true,
        gender: true,
        age: true,
        dob: true,
      },
      orderBy: {
        name: 'asc'
      }
    });

    res.status(200).json(patients);
  } catch (error) {
    console.error('Error fetching patients:', error);
    res.status(500).json({ error: 'Failed to fetch patients' });
  }
});

// Get patient by ID with detailed information including visits and transcriptions
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const patientId = req.params.id;
    
    const patient = await client.patient.findUnique({
      where: {
        id: patientId
      },
      include: {
        transcriptions: true
      }
    });

    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    res.status(200).json(patient);
  } catch (error) {
    console.error('Error fetching patient details:', error);
    res.status(500).json({ error: 'Failed to fetch patient details' });
  }
});

// Get patient's transcriptions
router.get('/:id/transcriptions', async (req: Request, res: Response) => {
  try {
    const patientId = req.params.id;
    
    const transcriptions = await client.transcription.findMany({
      where: {
        patientId
      },
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        analysis: true
      }
    });

    res.status(200).json(transcriptions);
  } catch (error) {
    console.error('Error fetching patient transcriptions:', error);
    res.status(500).json({ error: 'Failed to fetch patient transcriptions' });
  }
});

export default router;
