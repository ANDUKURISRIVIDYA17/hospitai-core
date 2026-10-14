import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { processAmbientTranscript } from './server/geminiService.js';
import { taskStore } from './server/taskStore.js';
import { ExtractedTaskRecord } from './server/types.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '10mb' }));

// Health Check Endpoint
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    service: 'HospitAI Frontline Emotional Workforce Intelligence Engine',
    model: 'gemini-2.5-flash',
    gemini_key_configured: Boolean(process.env.GEMINI_API_KEY),
    timestamp: new Date().toISOString(),
  });
});

// Primary Core Endpoint: Extract Clean Task JSON from Ambient Frontline Hotel Transcripts
app.post('/api/extract-tasks', async (req: Request, res: Response) => {
  try {
    const { transcript, location, staffId, autoSave = true, model = 'gemini-2.5-flash' } = req.body;

    if (!transcript || typeof transcript !== 'string' || !transcript.trim()) {
      res.status(400).json({
        success: false,
        error: 'Transcript is required and must be a non-empty string.',
      });
      return;
    }

    const result = await processAmbientTranscript(transcript.trim(), {
      location,
      staffId,
      model,
    });

    const now = new Date();
    const id = `task-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;

    const fullRecord: ExtractedTaskRecord = {
      id,
      task_type: result.task.task_type,
      room_number: result.task.room_number,
      urgency: result.task.urgency,
      notes: result.task.notes,
      ...result.analysis,
      raw_transcript: transcript.trim(),
      location_context: location || 'Ambient Frontline Mic',
      audio_timestamp: now.toTimeString().split(' ')[0],
      status: result.analysis.is_actionable ? 'pending' : 'dismissed',
      created_at: now.toISOString(),
      updated_at: now.toISOString(),
      model_used: result.modelUsed,
      execution_time_ms: result.executionTimeMs,
    };

    if (autoSave) {
      taskStore.add(fullRecord);
    }

    // Return the clean JSON prominently with the requested exact keys
    res.json({
      success: true,
      // The exact requested clean JSON object:
      task: result.task,
      clean_json: result.rawJsonString,
      // Full emotional workforce analysis and operational metadata:
      analysis: result.analysis,
      record: fullRecord,
      execution_time_ms: result.executionTimeMs,
      model: result.modelUsed,
    });
  } catch (error: any) {
    console.error('[HospitAI] /api/extract-tasks error:', error);
    res.status(500).json({
      success: false,
      error: error?.message || 'Failed to process ambient hotel transcript.',
    });
  }
});

// Batch Ambient Processing Endpoint (Multiple microphone channels across hotel)
app.post('/api/batch-extract', async (req: Request, res: Response) => {
  try {
    const { items, model = 'gemini-2.5-flash' } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      res.status(400).json({
        success: false,
        error: 'Body must contain an array of "items" with transcripts.',
      });
      return;
    }

    const results = await Promise.all(
      items.map(async (item: { transcript: string; location?: string; staffId?: string }, index: number) => {
        try {
          const resExtraction = await processAmbientTranscript(item.transcript, {
            location: item.location || `Channel ${index + 1}`,
            staffId: item.staffId,
            model,
          });

          const now = new Date();
          const id = `batch-${Date.now().toString(36)}-${index}`;
          const record: ExtractedTaskRecord = {
            id,
            task_type: resExtraction.task.task_type,
            room_number: resExtraction.task.room_number,
            urgency: resExtraction.task.urgency,
            notes: resExtraction.task.notes,
            ...resExtraction.analysis,
            raw_transcript: item.transcript,
            location_context: item.location || `Mic Array #${index + 1}`,
            audio_timestamp: now.toTimeString().split(' ')[0],
            status: resExtraction.analysis.is_actionable ? 'pending' : 'dismissed',
            created_at: now.toISOString(),
            updated_at: now.toISOString(),
            model_used: resExtraction.modelUsed,
            execution_time_ms: resExtraction.executionTimeMs,
          };

          taskStore.add(record);
          return {
            success: true,
            task: resExtraction.task,
            analysis: resExtraction.analysis,
            record,
          };
        } catch (err: any) {
          return {
            success: false,
            transcript: item.transcript,
            error: err.message,
          };
        }
      })
    );

    res.json({
      success: true,
      processed_count: results.length,
      results,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error?.message || 'Batch extraction failed.',
    });
  }
});

// Operational Tasks Management API
app.get('/api/tasks', (req: Request, res: Response) => {
  res.json({
    success: true,
    tasks: taskStore.getAll(),
  });
});

app.post('/api/tasks', (req: Request, res: Response) => {
  const { task_type, room_number, urgency, notes, location_context, assigned_to } = req.body;
  if (!task_type || !notes) {
    res.status(400).json({ success: false, error: 'task_type and notes are required.' });
    return;
  }

  const now = new Date();
  const newRecord: ExtractedTaskRecord = {
    id: `manual-${Date.now().toString(36)}`,
    task_type,
    room_number: room_number || 'N/A',
    urgency: urgency || 'Medium',
    notes,
    guest_sentiment: 'Manual Entry',
    guest_sentiment_score: 0,
    staff_empathy_score: 8.5,
    small_talk_detected: [],
    is_actionable: true,
    department_category: 'Operations',
    recommended_staff_role: 'Operations Staff',
    estimated_duration_mins: 15,
    raw_transcript: notes,
    location_context: location_context || 'Manual Dispatch',
    audio_timestamp: now.toTimeString().split(' ')[0],
    status: 'pending',
    assigned_to,
    created_at: now.toISOString(),
    updated_at: now.toISOString(),
    model_used: 'manual-dispatch',
    execution_time_ms: 0,
  };

  taskStore.add(newRecord);
  res.status(201).json({ success: true, task: newRecord });
});

app.patch('/api/tasks/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const updated = taskStore.update(id, req.body);
  if (!updated) {
    res.status(404).json({ success: false, error: 'Task not found' });
    return;
  }
  res.json({ success: true, task: updated });
});

app.delete('/api/tasks/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const deleted = taskStore.delete(id);
  if (!deleted) {
    res.status(404).json({ success: false, error: 'Task not found' });
    return;
  }
  res.json({ success: true, message: 'Task deleted successfully' });
});

app.post('/api/tasks/seed', (req: Request, res: Response) => {
  const resetTasks = taskStore.resetToDefault();
  res.json({ success: true, tasks: resetTasks });
});

app.get('/api/metrics', (req: Request, res: Response) => {
  res.json({
    success: true,
    metrics: taskStore.getMetrics(),
  });
});

// Serve frontend with Vite middlewares in dev, or dist in production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[HospitAI] Server actively listening at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('[HospitAI] Fatal server startup error:', err);
});
