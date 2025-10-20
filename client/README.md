# Abridge Visit Diff

A prototype application for clinical visit comparison and transcription analysis.

## Overview

The Abridge Visit Diff application helps clinicians quickly see what has changed since a patient's last visit. The application includes:

- Patient management
- Past transcription viewing
- Live audio transcription (AI Scribe)
- Visit difference analysis
- Documentation suggestions

## Features

- **Patient Selection:** Browse and search through the patient list
- **Past Transcriptions:** Access previous visit notes for context
- **Live Audio Recording:** Record and transcribe the current visit
- **Delta Analysis:** See what changed between visits
- **Documentation Nudges:** Get suggestions to improve clinical documentation

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository
   ```
   git clone <repository-url>
   ```

2. Navigate to the client directory
   ```
   cd Abridge-Prototype/client
   ```

3. Install dependencies
   ```
   npm install
   ```

4. Start the development server
   ```
   npm run dev
   ```

5. Open [http://localhost:5173](http://localhost:5173) in your browser

## Application Structure

The application consists of two main pages:

1. **Patient List Page** - Shows all patients with search functionality
2. **Visit Diff Page** - Shows the visit diff functionality for a selected patient

## Usage

1. **Browse Patients:** View the list of patients and search by name or MRN
2. **Select a Patient:** Click on a patient to navigate to their Visit Diff page
3. **Review Past Transcriptions:** See previous visit notes on the Visit Diff page
4. **Record or Enter New Transcript:** Use the audio recorder or type manually
5. **Generate Visit Diff:** Analyze differences between visits
6. **View Results:** See delta summary, changes, and documentation nudges

## Mock Data

The application currently uses mock data for demonstration purposes. In a production environment, it would connect to actual patient records and use a real speech-to-text service.

## Project Structure

- `src/pages/` - Page components for different routes
- `src/components/` - React components
- `src/contexts/` - React context for state management
- `src/lib/` - Types, utilities, and API calls
- `src/mocks/` - Mock data and API response simulation

## Next Steps

1. **Backend Implementation:**
   - Create Express/Node.js server
   - Connect to Gemini 1.5 LLM
   - Implement proper validation

2. **Extended Features:**
   - Real-time streaming updates
   - Template support for specialty visits
   - Expanded analytics

## License

MIT License

## Disclaimer

Demo only. Not for clinical use. No real patient data is used.