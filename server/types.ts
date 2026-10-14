export interface CleanTaskJson {
  task_type: string;
  room_number: string;
  urgency: 'Immediate' | 'High' | 'Medium' | 'Low';
  notes: string;
}

export interface EmotionalWorkforceAnalysis {
  guest_sentiment: string;
  guest_sentiment_score: number; // -1.0 to 1.0
  staff_empathy_score: number; // 1 to 10
  small_talk_detected: string[];
  is_actionable: boolean;
  department_category: string;
  recommended_staff_role: string;
  estimated_duration_mins: number;
}

export interface ExtractedTaskRecord extends CleanTaskJson, EmotionalWorkforceAnalysis {
  id: string;
  raw_transcript: string;
  location_context?: string;
  audio_timestamp?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'dismissed';
  assigned_to?: string;
  created_at: string;
  updated_at: string;
  model_used: string;
  execution_time_ms: number;
}

export interface ExtractionResponse {
  success: boolean;
  task: CleanTaskJson;
  analysis: EmotionalWorkforceAnalysis;
  full_record: ExtractedTaskRecord;
  execution_time_ms: number;
  model: string;
  raw_json_string: string;
}
