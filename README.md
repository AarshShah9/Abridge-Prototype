# Abridge Visit Diff

This project is a prototype for Abridge's "Visit Diff" feature, which helps clinicians quickly see what has changed between visits. It includes an AI scribe functionality for real-time audio transcription using Gemini.

## Project Structure

This project consists of two main parts:

1. **Client**: React application with UI for patient management, visit diff analysis, and audio transcription
2. **Server**: Node.js backend with Prisma ORM, API routes, and WebSocket for real-time transcription

## Features

- **Patient Management**: View and select patients from a database
- **Visit Diff**: Compare prior notes with current transcripts to see what's changed
- **AI Scribe**: Real-time audio transcription using WebSockets and Gemini
- **Delta Summary**: Get a concise summary of changes between visits
- **Documentation Nudges**: Get suggestions to improve clinical documentation

## Setup

### Prerequisites

- Node.js 18+
- PostgreSQL 14+
- npm or yarn
- Google Generative AI API key (for Gemini integration)

### Backend Setup

1. Navigate to the server directory:
   ```bash
   cd server
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file with the following content:
   ```
   DB_URL=postgresql://username:password@localhost:5432/abridge?schema=public
   PORT=3000
   NODE_ENV=development
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

4. Run database migrations:
   ```bash
   npx prisma migrate dev --name init
   ```

5. Seed the database:
   ```bash
   npx prisma db seed
   ```

6. Start the server:
   ```bash
   npm run dev
   ```

### Frontend Setup

1. Navigate to the client directory:
   ```bash
   cd client
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file with the following content (optional):
   ```
   VITE_API_URL=http://localhost:3000
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:5173](http://localhost:5173) in your browser

## Using the Application

1. **Browse Patients**: On the main page, you'll see a list of patients.
2. **Select a Patient**: Click on a patient to go to their Visit Diff page.
3. **View Past Transcriptions**: Select from previous visit transcriptions.
4. **Record Audio**: Use the microphone button to record a current visit.
5. **Generate Visit Diff**: Compare past notes with the current transcript.
6. **View Analysis**: See the delta summary, changes, and documentation nudges.

## AI Features

### Gemini Integration

This project uses Google's Gemini 1.5 Pro model for:
1. **Speech-to-Text**: Converts spoken audio to text transcriptions
2. **Text Analysis**: Analyzes differences between past and current visits
3. **Documentation Suggestions**: Provides nudges for better clinical documentation

To use Gemini features:
1. Get an API key from [Google AI Studio](https://ai.google.dev/)
2. Add the key to your server's `.env` file as `GEMINI_API_KEY`

## License

MIT License

## Disclaimer

This is a prototype only and not for clinical use. No real patient data is used.

## Tech Stack

- **Frontend**: React, TypeScript, Tailwind CSS, Socket.IO Client, WaveSurfer.js
- **Backend**: Node.js, Express, Prisma, PostgreSQL, Socket.IO, Google Generative AI