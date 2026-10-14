/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { MetricsBar } from './components/MetricsBar';
import { AmbientExtractor } from './components/AmbientExtractor';
import { CleanJsonViewer } from './components/CleanJsonViewer';
import { TaskBoard } from './components/TaskBoard';
import { BatchProcessingModal } from './components/BatchProcessingModal';
import { ApiDocsModal } from './components/ApiDocsModal';
import { CleanTaskJson, EmotionalWorkforceAnalysis, ExtractedTaskRecord } from '../server/types';
import { Layers, Sparkles, CheckCircle, AlertTriangle } from 'lucide-react';

export default function App() {
  const [tasks, setTasks] = useState<ExtractedTaskRecord[]>([]);
  const [currentTask, setCurrentTask] = useState<CleanTaskJson | null>(null);
  const [currentAnalysis, setCurrentAnalysis] = useState<EmotionalWorkforceAnalysis | null>(null);
  const [rawJsonString, setRawJsonString] = useState<string>('');
  const [executionTimeMs, setExecutionTimeMs] = useState<number | undefined>(undefined);
  const [modelUsed, setModelUsed] = useState<string>('gemini-2.5-flash');

  const [isLoading, setIsLoading] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [isBatchOpen, setIsBatchOpen] = useState(false);
  const [isBatchProcessing, setIsBatchProcessing] = useState(false);
  const [isApiDocsOpen, setIsApiDocsOpen] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const [healthStatus, setHealthStatus] = useState<{
    status: string;
    model: string;
    gemini_key_configured: boolean;
  } | null>(null);

  const [metrics, setMetrics] = useState({
    total: 4,
    actionable: 3,
    noise_filtered_items: 8,
    small_talk_ratio_pct: 25,
    immediate_urgency: 1,
    high_urgency: 2,
    pending: 1,
    in_progress: 1,
    completed: 1,
    average_empathy_score: 9.1,
  });

  // Fetch initial tasks, metrics, and health status
  const fetchAllData = async () => {
    try {
      const [tasksRes, metricsRes, healthRes] = await Promise.all([
        fetch('/api/tasks').then((r) => r.json()),
        fetch('/api/metrics').then((r) => r.json()),
        fetch('/api/health').then((r) => r.json()),
      ]);

      if (tasksRes.success) {
        setTasks(tasksRes.tasks);
        if (tasksRes.tasks.length > 0 && !currentTask) {
          const first = tasksRes.tasks[0];
          setCurrentTask({
            task_type: first.task_type,
            room_number: first.room_number,
            urgency: first.urgency,
            notes: first.notes,
          });
          setCurrentAnalysis({
            guest_sentiment: first.guest_sentiment,
            guest_sentiment_score: first.guest_sentiment_score,
            staff_empathy_score: first.staff_empathy_score,
            small_talk_detected: first.small_talk_detected,
            is_actionable: first.is_actionable,
            department_category: first.department_category,
            recommended_staff_role: first.recommended_staff_role,
            estimated_duration_mins: first.estimated_duration_mins,
          });
          setExecutionTimeMs(first.execution_time_ms);
          setModelUsed(first.model_used);
        }
      }

      if (metricsRes.success) {
        setMetrics(metricsRes.metrics);
      }

      if (healthRes.status === 'ok') {
        setHealthStatus(healthRes);
      }
    } catch (err) {
      console.error('Failed to load initial data:', err);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  // Handle ambient transcript extraction
  const handleExtract = async ({
    transcript,
    location,
    model,
  }: {
    transcript: string;
    location: string;
    model: string;
  }) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/extract-tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript, location, model }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Extraction failed');
      }

      setCurrentTask(data.task);
      setCurrentAnalysis(data.analysis);
      setRawJsonString(data.clean_json);
      setExecutionTimeMs(data.execution_time_ms);
      setModelUsed(data.model);

      // Refresh task board and metrics
      await fetchAllData();
      showNotification(`Extracted clean JSON for ${data.task.room_number || 'hotel task'} using ${data.model}!`);
    } catch (err: any) {
      console.error('Extraction error:', err);
      showNotification(err.message || 'Error processing ambient transcript', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle multi-channel batch extraction
  const handleBatchExtract = async (items: Array<{ transcript: string; location: string }>) => {
    setIsBatchProcessing(true);
    try {
      const res = await fetch('/api/batch-extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items, model: 'gemini-2.5-flash' }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Batch extraction failed');
      }

      await fetchAllData();
      setIsBatchOpen(false);
      showNotification(`Processed ${data.processed_count} ambient hotel microphone channels concurrently!`);
    } catch (err: any) {
      console.error('Batch error:', err);
      showNotification(err.message || 'Batch extraction error', 'error');
    } finally {
      setIsBatchProcessing(false);
    }
  };

  // Update task status
  const handleUpdateStatus = async (
    id: string,
    status: 'pending' | 'in_progress' | 'completed' | 'dismissed'
  ) => {
    try {
      const res = await fetch(`/api/tasks/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      if (res.ok) {
        setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, status } : t)));
        // Refresh metrics
        fetch('/api/metrics')
          .then((r) => r.json())
          .then((data) => data.success && setMetrics(data.metrics));
      }
    } catch (err) {
      console.error('Status update error:', err);
    }
  };

  // Assign staff
  const handleAssignStaff = async (id: string, staffName: string) => {
    try {
      const res = await fetch(`/api/tasks/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assigned_to: staffName, status: staffName ? 'in_progress' : 'pending' }),
      });

      if (res.ok) {
        setTasks((prev) =>
          prev.map((t) => (t.id === id ? { ...t, assigned_to: staffName, status: staffName ? 'in_progress' : t.status } : t))
        );
      }
    } catch (err) {
      console.error('Staff assign error:', err);
    }
  };

  // Delete task
  const handleDeleteTask = async (id: string) => {
    try {
      const res = await fetch(`/api/tasks/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setTasks((prev) => prev.filter((t) => t.id !== id));
        fetch('/api/metrics')
          .then((r) => r.json())
          .then((data) => data.success && setMetrics(data.metrics));
        showNotification('Task deleted from operational board.');
      }
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  // Reset seed data
  const handleResetSeedData = async () => {
    setIsResetting(true);
    try {
      const res = await fetch('/api/tasks/seed', { method: 'POST' });
      if (res.ok) {
        await fetchAllData();
        showNotification('Hotel demo scenarios reloaded.');
      }
    } catch (err) {
      console.error('Reset error:', err);
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col font-sans selection:bg-amber-500/30 selection:text-amber-200">
      {/* Toast Notification */}
      {notification && (
        <div
          className={`fixed bottom-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl border shadow-2xl text-xs font-medium animate-in slide-in-from-bottom duration-300 ${
            notification.type === 'success'
              ? 'bg-emerald-950/95 border-emerald-800 text-emerald-200'
              : 'bg-rose-950/95 border-rose-800 text-rose-200'
          }`}
        >
          {notification.type === 'success' ? (
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
          )}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Main App Navigation Header */}
      <Header
        onOpenApiDocs={() => setIsApiDocsOpen(true)}
        onResetSeedData={handleResetSeedData}
        isResetting={isResetting}
        healthStatus={healthStatus}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Top Operational Metrics */}
        <MetricsBar metrics={metrics} />

        {/* Feature Sub-Header with Batch Mode Trigger */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400"></span>
            <span className="text-xs font-semibold uppercase tracking-wider text-stone-300">
              Live Ambient Intelligence Console
            </span>
          </div>

          <button
            onClick={() => setIsBatchOpen(true)}
            className="self-start sm:self-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-850 text-amber-300 border border-amber-900/40 text-xs font-medium transition cursor-pointer hover:border-amber-700/60"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Simulate Multi-Zone Hotel Ingestion (4 Mics)</span>
          </button>
        </div>

        {/* Two-Column Workspace: Left = Ambient Extractor, Right = Clean JSON Output */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Left Column: Ambient Transcript Ingestion (7 cols) */}
          <div className="lg:col-span-7 h-full">
            <AmbientExtractor onExtract={handleExtract} isLoading={isLoading} />
          </div>

          {/* Right Column: Clean JSON Output & Emotional Intelligence (5 cols) */}
          <div className="lg:col-span-5 h-full">
            <CleanJsonViewer
              task={currentTask}
              analysis={currentAnalysis}
              rawJsonString={rawJsonString}
              executionTimeMs={executionTimeMs}
              modelUsed={modelUsed}
            />
          </div>
        </div>

        {/* Operational Task Board (Full Width Below) */}
        <TaskBoard
          tasks={tasks}
          onUpdateStatus={handleUpdateStatus}
          onAssignStaff={handleAssignStaff}
          onDeleteTask={handleDeleteTask}
        />
      </main>

      {/* Modals */}
      <BatchProcessingModal
        isOpen={isBatchOpen}
        onClose={() => setIsBatchOpen(false)}
        onRunBatch={handleBatchExtract}
        isProcessing={isBatchProcessing}
      />

      <ApiDocsModal isOpen={isApiDocsOpen} onClose={() => setIsApiDocsOpen(false)} />

      {/* Footer */}
      <footer className="border-t border-stone-800/80 bg-stone-950 py-4 mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-stone-500">
          <div>
            HospitAI • Frontline Emotional Workforce Management & Ambient Noise Suppression
          </div>
          <div className="font-mono text-[11px] text-stone-400">
            Powered by Gemini 2.5 Flash (`gemini-2.5-flash`)
          </div>
        </div>
      </footer>
    </div>
  );
}
