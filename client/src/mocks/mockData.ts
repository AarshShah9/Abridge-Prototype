import type { Patient, VisitDiffOutput } from '../lib/types';

// Mock visit diff response
export const mockVisitDiffResponse: VisitDiffOutput = {
  delta_summary: [
    "New intermittent chest tightness on exertion",
    "Fatigue persists, now 2 weeks",
    "No edema or orthopnea",
    "Plan includes CBC and TSH, add echo referral",
    "Follow up in 2 weeks"
  ],
  changes: {
    new: ["chest tightness on exertion"],
    resolved: ["ankle swelling"],
    worsened: ["fatigue"],
    improved: [],
    unchanged: ["no medication changes"]
  },
  nudges: [
    {
      title: "E M code support: history details",
      description: "Document pertinent negatives for cardiopulmonary ROS to support complexity.",
      category: "billing_or_completeness",
      evidence_span: "Denies edema, denies orthopnea"
    }
  ],
  safe_disclaimer: "Demo only. Not for clinical use."
};

// Mock patients data
export const mockPatients: Patient[] = [
  {
    id: "p1",
    name: "John Smith",
    age: 45,
    gender: "Male",
    mrn: "MRN78901",
    dob: "1980-05-15",
    lastVisit: "2025-09-30",
    upcomingVisit: "2025-10-30",
    transcriptions: [
      {
        id: "t1",
        date: "2025-09-30",
        title: "Follow-up visit",
        content: "Fatigue for 1 week. Ankle swelling present. No chest pain. Trial of lifestyle measures. Follow up PRN."
      },
      {
        id: "t2",
        date: "2025-08-15",
        title: "Initial consultation",
        content: "Patient presents with fatigue and occasional dizziness. Blood pressure slightly elevated at 140/90. Recommended dietary changes and moderate exercise."
      }
    ]
  },
  {
    id: "p2",
    name: "Sarah Johnson",
    age: 35,
    gender: "Female",
    mrn: "MRN23456",
    dob: "1990-08-12",
    lastVisit: "2025-10-05",
    transcriptions: [
      {
        id: "t3",
        date: "2025-10-05",
        title: "Annual physical",
        content: "Patient reports occasional headaches. No other significant complaints. All vitals normal. Recommended regular exercise and adequate hydration."
      }
    ]
  },
  {
    id: "p3",
    name: "Robert Williams",
    age: 67,
    gender: "Male",
    mrn: "MRN34567",
    dob: "1958-02-28",
    lastVisit: "2025-09-25",
    upcomingVisit: "2025-10-25",
    transcriptions: [
      {
        id: "t4",
        date: "2025-09-25",
        title: "Diabetes follow-up",
        content: "Blood sugar levels improved since last visit. Currently at 130-150 mg/dL range. Maintaining medication regimen. Foot exam normal. Continue current management plan."
      },
      {
        id: "t5",
        date: "2025-08-25",
        title: "Diabetes check-up",
        content: "Blood sugar elevated at 160-180 mg/dL range. Adjusting insulin dosage. Discussed importance of diet control. Schedule follow-up in one month."
      },
      {
        id: "t6",
        date: "2025-07-25",
        title: "Initial diabetes assessment",
        content: "New diagnosis of Type 2 diabetes. HbA1c at 7.8%. Starting on metformin. Detailed dietary counseling provided. Referral to diabetes education program."
      }
    ]
  },
  {
    id: "p4",
    name: "Maria Garcia",
    age: 28,
    gender: "Female",
    mrn: "MRN45678",
    dob: "1997-11-03",
    lastVisit: "2025-10-10",
    transcriptions: [
      {
        id: "t7",
        date: "2025-10-10",
        title: "Prenatal visit",
        content: "20 weeks pregnant. Fetal heart rate normal at 150 bpm. Maternal weight gain appropriate. No concerns reported. Scheduled anatomy scan for next week."
      }
    ]
  },
  {
    id: "p5",
    name: "David Lee",
    age: 52,
    gender: "Male",
    mrn: "MRN56789",
    dob: "1973-04-19",
    lastVisit: "2025-09-15",
    upcomingVisit: "2025-10-20",
    transcriptions: [
      {
        id: "t8",
        date: "2025-09-15",
        title: "Hypertension follow-up",
        content: "Blood pressure improved to 135/85. Continuing with lisinopril 10mg daily. Discussed sodium reduction strategies. Weight down by 3 pounds."
      }
    ]
  }
];

// Mock sample data for the visit diff input
export function getSampleData(): { priorNote: string; currentTranscript: string } {
  return {
    priorNote: 'Fatigue for 1 week. Ankle swelling present. No chest pain. Trial of lifestyle measures. Follow up PRN.',
    currentTranscript: 'I am still tired for two weeks now. No ankle swelling this week. I sometimes feel chest tightness when walking upstairs. Let us order CBC and TSH. Follow up in two weeks.'
  };
}

// This is a simple mock implementation of audio transcription
export async function mockTranscribeAudio(audioBlob: Blob): Promise<string> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Return mock transcription
  return "I am still tired for two weeks now. No ankle swelling this week. I sometimes feel chest tightness when walking upstairs.";
}

// This is a simple mock implementation until the real backend is ready
export async function mockGenerateVisitDiff(): Promise<VisitDiffOutput> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Return mock data
  return mockVisitDiffResponse;
}
