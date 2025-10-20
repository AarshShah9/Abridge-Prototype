// index.ts
import cors from "cors";
import express, { NextFunction, Request, Response } from "express";
import { client } from "./prisma/client";
import morgan from "morgan";
import http from "http";
import AudioTranscriptionService from "./websocket/audioTranscription";

// Import routes
import patientRoutes from "./routes/patient.route";
import diffRoutes from "./routes/diff.route";

const app = express();
const port = "3000";
app.use(morgan("dev"));

// middleware
app.use(
  cors({
    origin: "*",
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "ngrok-skip-browser-warning"
    ],
  }),
);

app.use(express.json()); // parsing JSON in the request body
app.use(express.urlencoded({ extended: true })); // parsing URL-encoded form data
app.use((req: Request, res: Response, next: NextFunction) => {
  res.header("Content-Type", "application/json");
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept",
  );
  next();
});

// Routes
app.use('/api/patients', patientRoutes);
app.use('/api/diff', diffRoutes);

// Health check
app.get('/api/health', async (req: Request, res: Response) => {
  try {
    // check if the database is connected
    await client.$connect();
    await client.$disconnect();
    res.status(200).json({ status: 'ok' });
  } catch (error) {
    console.error('Database connection failed', error);
    res.status(500).json({ error: 'Database connection failed' });
  }
});

// Create HTTP server
const httpServer = http.createServer(app);

// server start
const server = httpServer.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
  console.log(`WebSocket server ready for audio transcription`);
});

// Initialize WebSocket audio transcription service
new AudioTranscriptionService(app, httpServer);

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION!');
  console.error(err.name, err.message);
  console.error('Stack:', err.stack);
  // Continue running the server instead of crashing
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err: Error) => {
  console.error('UNHANDLED REJECTION!');
  console.error(err.name, err.message);
  console.error('Stack:', err.stack);
  // Continue running the server instead of crashing
});

// Graceful shutdown
const gracefulShutdown = () => {
  console.log('\nGracefully shutting down...');
  server.close(async () => {
    try {
      await client.$disconnect();
      console.log('Prisma client disconnected');
      process.exit(0);
    } catch (err) {
      console.error('Error during shutdown:', err);
      process.exit(1);
    }
  });

  // Force shutdown after 10 seconds
  setTimeout(() => {
    console.error('Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

export default app;
export { server };