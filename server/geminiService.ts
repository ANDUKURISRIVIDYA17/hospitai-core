import { GoogleGenAI, Type } from '@google/genai';
import { CleanTaskJson, EmotionalWorkforceAnalysis, ExtractedTaskRecord } from './types.js';

// Initialize the GoogleGenAI instance with telemetry User-Agent header
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

const DEFAULT_MODEL = 'gemini-2.5-flash';

// System prompt emphasizing ambient filtering, ignoring small talk, and producing clean JSON
const SYSTEM_INSTRUCTION = `You are HospitAI, an advanced ambient conversation intelligence and Emotional Workforce Management System for luxury and busy frontline hotels.
Your task is to analyze ambient frontline conversation transcripts (captured from front desk, hallways, bellhop stations, room service phone lines, concierge, and restaurant areas).

CRITICAL DIRECTIVES:
1. FILTER OUT SMALL TALK & NOISE:
   Hotel conversations often contain greetings, weather commentary, flight delays, pleasantries, sports scores, and social banter. You must completely strip away this small talk from the operational notes.
   Document the small talk topics you detected in 'small_talk_detected'.

2. CLEAN OUTPUT SCHEMA:
   You must produce structured operational task records with the following core keys:
   - 'task_type': The operational category (e.g., 'Housekeeping', 'Maintenance', 'Room Service', 'Front Desk', 'Luggage Assistance', 'Concierge', 'Guest Recovery', or 'None' if purely social).
   - 'room_number': The specific room number, suite, or area (e.g., '304', 'Suite 1201', 'Penthouse B', 'Pool Cabana 4', or 'N/A').
   - 'urgency': Must be strictly one of: 'Immediate', 'High', 'Medium', 'Low'.
     * 'Immediate': Safety issues, water leaks, lockouts, medical, extreme guest distress, VIP emergencies.
     * 'High': Time-sensitive requests, food orders, allergies, VIP priority, urgent luggage.
     * 'Medium': Routine housekeeping deliveries, standard maintenance, turn-down.
     * 'Low': General inquiries, later schedule requests, informational.
   - 'notes': A pristine, concise operational instruction for the hotel frontline staff. Must contain ONLY the actionable task. Absolutely NO pleasantries or filler.

3. EMOTIONAL WORKFORCE INTELLIGENCE:
   - Evaluate guest emotional sentiment (e.g., 'Frustrated / Urgent', 'Delighted', 'Fatigued / Anxious', 'Calm / Neutral').
   - Rate staff empathy and composure from 1 to 10 based on how frontline staff handle the interaction.
   - Flag if the transcript contains a genuine operational task ('is_actionable': true), or if it is merely social chit-chat ('is_actionable': false).`;

export async function processAmbientTranscript(
  transcript: string,
  context?: { location?: string; staffId?: string; model?: string }
): Promise<{
  task: CleanTaskJson;
  analysis: EmotionalWorkforceAnalysis;
  rawJsonString: string;
  modelUsed: string;
  executionTimeMs: number;
}> {
  const startTime = Date.now();
  const selectedModel = context?.model || DEFAULT_MODEL;

  // If no Gemini API key is configured, fallback to intelligent heuristic parsing
  if (!process.env.GEMINI_API_KEY) {
    console.warn('[HospitAI] GEMINI_API_KEY not found in environment. Using fallback ambient parser.');
    const fallbackResult = parseHeuristically(transcript, context?.location);
    const executionTimeMs = Date.now() - startTime;
    return {
      ...fallbackResult,
      modelUsed: 'heuristic-local-parser (GEMINI_API_KEY unset)',
      executionTimeMs,
    };
  }

  const candidateModels = [
    selectedModel,
    selectedModel !== 'gemini-3.8-flash' ? 'gemini-3.8-flash' : null,
    'gemini-flash-latest',
  ].filter(Boolean) as string[];

  let lastError: any = null;
  let activeModelUsed = selectedModel;

  for (const modelToTry of candidateModels) {
    try {
      const response = await ai.models.generateContent({
        model: modelToTry,
        contents: `Analyze this frontline hotel ambient transcript and extract the operational task, filtering out all small talk:\n\n"""\n${transcript}\n"""\nContext Location: ${context?.location || 'Hotel Frontline'}`,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          temperature: 0.1, // low temperature for consistent, structured extraction
          responseMimeType: 'application/json',
          responseSchema: {
          type: Type.OBJECT,
          properties: {
            task_type: {
              type: Type.STRING,
              description: 'The operational hotel category: Housekeeping, Maintenance, Room Service, Front Desk, Luggage Assistance, Concierge, Guest Recovery, or None.',
            },
            room_number: {
              type: Type.STRING,
              description: "The room number, suite, or hotel location (e.g. '304', 'Suite 1201', 'Penthouse B', 'Lobby', or 'N/A').",
            },
            urgency: {
              type: Type.STRING,
              description: "Urgency level: strictly 'Immediate', 'High', 'Medium', or 'Low'.",
            },
            notes: {
              type: Type.STRING,
              description: 'Clear, concise actionable instructions with all small talk, pleasantries, and conversational noise filtered out.',
            },
            small_talk_detected: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'List of small talk topics or conversational pleasantries identified and filtered out.',
            },
            guest_sentiment: {
              type: Type.STRING,
              description: 'Guest emotional state (e.g. Frustrated, Delighted, Anxious, Impatient, Calm).',
            },
            guest_sentiment_score: {
              type: Type.NUMBER,
              description: 'Numerical sentiment rating from -1.0 (very negative) to +1.0 (very positive).',
            },
            staff_empathy_score: {
              type: Type.NUMBER,
              description: 'Rating from 1 to 10 evaluating the frontline staff empathy, politeness, and calm under pressure.',
            },
            is_actionable: {
              type: Type.BOOLEAN,
              description: 'True if there is an operational task to dispatch; false if purely social conversation.',
            },
            department_category: {
              type: Type.STRING,
              description: 'Target hotel department (Housekeeping, Engineering, Food & Beverage, Front Office, Concierge).',
            },
            recommended_staff_role: {
              type: Type.STRING,
              description: 'Job role that should be dispatched (e.g., Housekeeper, Plumber, Room Service Runner, Duty Manager).',
            },
            estimated_duration_mins: {
              type: Type.NUMBER,
              description: 'Estimated minutes needed to resolve the task.',
            },
          },
          required: ['task_type', 'room_number', 'urgency', 'notes'],
        },
      },
    });

    const executionTimeMs = Date.now() - startTime;
    const textOutput = response.text || '{}';
    const parsed = JSON.parse(textOutput);

    // Normalize urgency to strictly typed values
    let normalizedUrgency: 'Immediate' | 'High' | 'Medium' | 'Low' = 'Medium';
    const rawUrgency = String(parsed.urgency || '').toLowerCase();
    if (rawUrgency.includes('immed') || rawUrgency.includes('crit') || rawUrgency.includes('emerg')) {
      normalizedUrgency = 'Immediate';
    } else if (rawUrgency.includes('high') || rawUrgency.includes('urgent')) {
      normalizedUrgency = 'High';
    } else if (rawUrgency.includes('low') || rawUrgency.includes('info')) {
      normalizedUrgency = 'Low';
    } else {
      normalizedUrgency = 'Medium';
    }

    const cleanTask: CleanTaskJson = {
      task_type: parsed.task_type || 'General Support',
      room_number: parsed.room_number || 'N/A',
      urgency: normalizedUrgency,
      notes: parsed.notes || 'No actionable task details found.',
    };

    const emotionalAnalysis: EmotionalWorkforceAnalysis = {
      guest_sentiment: parsed.guest_sentiment || 'Neutral',
      guest_sentiment_score: typeof parsed.guest_sentiment_score === 'number' ? parsed.guest_sentiment_score : 0,
      staff_empathy_score: typeof parsed.staff_empathy_score === 'number' ? parsed.staff_empathy_score : 8,
      small_talk_detected: Array.isArray(parsed.small_talk_detected) ? parsed.small_talk_detected : [],
      is_actionable: parsed.is_actionable !== undefined ? Boolean(parsed.is_actionable) : cleanTask.task_type.toLowerCase() !== 'none',
      department_category: parsed.department_category || inferDepartment(cleanTask.task_type),
      recommended_staff_role: parsed.recommended_staff_role || inferRole(cleanTask.task_type),
      estimated_duration_mins: typeof parsed.estimated_duration_mins === 'number' ? parsed.estimated_duration_mins : 15,
    };

    const cleanJsonOnly = JSON.stringify(cleanTask, null, 2);

      return {
        task: cleanTask,
        analysis: emotionalAnalysis,
        rawJsonString: cleanJsonOnly,
        modelUsed: modelToTry,
        executionTimeMs,
      };
    } catch (error: any) {
      console.warn(`[HospitAI] Gemini API execution failed with candidate model ${modelToTry}:`, error?.message || error);
      lastError = error;
    }
  }

  // If all candidate models failed, invoke intelligent graceful fallback
  const fallbackResult = parseHeuristically(transcript, context?.location);
  const executionTimeMs = Date.now() - startTime;
  return {
    ...fallbackResult,
    modelUsed: `${selectedModel} (Fallback: ${lastError?.message || 'API error'})`,
    executionTimeMs,
  };
}

function inferDepartment(taskType: string): string {
  const t = taskType.toLowerCase();
  if (t.includes('housekeep') || t.includes('towel') || t.includes('clean') || t.includes('pillow')) return 'Housekeeping';
  if (t.includes('maint') || t.includes('plumb') || t.includes('leak') || t.includes('repair') || t.includes('ac')) return 'Engineering & Maintenance';
  if (t.includes('room service') || t.includes('food') || t.includes('wine') || t.includes('dining')) return 'Food & Beverage';
  if (t.includes('luggage') || t.includes('bell') || t.includes('bag')) return 'Bell Desk';
  if (t.includes('concierge') || t.includes('tour') || t.includes('limo') || t.includes('ticket')) return 'Concierge';
  if (t.includes('recovery') || t.includes('complaint') || t.includes('keycard')) return 'Duty Manager / Front Office';
  return 'Front Office';
}

function inferRole(taskType: string): string {
  const t = taskType.toLowerCase();
  if (t.includes('housekeep')) return 'Floor Housekeeper';
  if (t.includes('maint')) return 'Maintenance Technician';
  if (t.includes('room service')) return 'In-Room Dining Runner';
  if (t.includes('luggage')) return 'Bellhop';
  if (t.includes('concierge')) return 'Head Concierge';
  if (t.includes('recovery')) return 'Duty Operations Manager';
  return 'Front Desk Agent';
}

// Fallback intelligent heuristic extractor if Gemini API key is missing or encounters network timeouts
function parseHeuristically(transcript: string, locationContext?: string): {
  task: CleanTaskJson;
  analysis: EmotionalWorkforceAnalysis;
  rawJsonString: string;
} {
  const text = transcript.toLowerCase();

  // Extract Room Number
  const roomMatch = transcript.match(/(?:room|suite|penthouse|cabin|cabana)\s*(?:number|no\.?|#)?\s*([a-z0-9\-]+)/i);
  const explicitNumber = transcript.match(/\b\d{3,4}\b/);
  const room_number = roomMatch ? roomMatch[0].trim() : explicitNumber ? explicitNumber[0] : (locationContext || 'N/A');

  // Determine Task Type & Urgency
  let task_type = 'Front Desk Support';
  let urgency: 'Immediate' | 'High' | 'Medium' | 'Low' = 'Medium';
  let notes = '';
  const small_talk_detected: string[] = [];

  // Small talk detection
  if (text.includes('weather') || text.includes('rain') || text.includes('sunny')) small_talk_detected.push('Weather discussion');
  if (text.includes('flight') || text.includes('traffic') || text.includes('airport')) small_talk_detected.push('Travel / flight chatter');
  if (text.includes('match') || text.includes('game') || text.includes('score')) small_talk_detected.push('Sports chatter');
  if (text.includes('good morning') || text.includes('good afternoon') || text.includes('how are you')) small_talk_detected.push('Polite greetings & pleasantries');

  // Specific domain matches
  if (text.includes('leak') || text.includes('overflow') || text.includes('broken') || text.includes('drain') || text.includes('faucet') || text.includes('plumb') || text.includes('pipe') || text.includes('a/c') || text.includes('ac')) {
    task_type = 'Maintenance';
    urgency = (text.includes('leak') || text.includes('overflow') || text.includes('immediately')) ? 'Immediate' : 'High';
    notes = 'Inspect and repair plumbing/fixture issue reported by guest; check for potential leaks or overflows.';
  } else if (text.includes('towel') || text.includes('pillow') || text.includes('blanket') || text.includes('clean') || text.includes('sparkling water') || text.includes('shampoo')) {
    task_type = 'Housekeeping';
    urgency = text.includes('urgent') || text.includes('asap') ? 'High' : 'Medium';
    notes = 'Deliver requested guest amenities and fresh linens/towels to room.';
  } else if (text.includes('sandwich') || text.includes('wine') || text.includes('dinner') || text.includes('food') || text.includes('burger') || text.includes('fries') || text.includes('allergy')) {
    task_type = 'Room Service';
    urgency = text.includes('allergy') ? 'High' : 'Medium';
    notes = text.includes('allergy') 
      ? 'Expedite room service dining order; NOTE SEVERE ALLERGY requirements with culinary team.'
      : 'Deliver room service dining order.';
  } else if (text.includes('keycard') || text.includes('locked out') || text.includes('furious') || text.includes('unacceptable')) {
    task_type = 'Guest Recovery';
    urgency = 'Immediate';
    notes = 'VIP guest lockout or severe service grievance. Dispatch duty manager immediately with re-encoded keys.';
  } else if (text.includes('luggage') || text.includes('bags') || text.includes('valet') || text.includes('limo')) {
    task_type = 'Luggage Assistance';
    urgency = text.includes('flight') || text.includes('terminal') ? 'High' : 'Medium';
    notes = 'Assist guest with luggage transfer and coordinate valet / transport departure.';
  } else if (text.includes('hello') && text.includes('coffee') && !text.includes('room') && !text.includes('need') && !text.includes('please')) {
    task_type = 'None';
    urgency = 'Low';
    notes = 'No operational task required. Ambient conversational pleasantries.';
  } else {
    task_type = 'Concierge / Front Office';
    urgency = 'Low';
    notes = 'Follow up with guest on concierge inquiry or general frontline request.';
  }

  // Refine notes if room present
  if (room_number !== 'N/A' && !notes.includes(room_number)) {
    notes = `[${room_number}] ` + notes;
  }

  const cleanTask: CleanTaskJson = {
    task_type,
    room_number,
    urgency,
    notes,
  };

  const analysis: EmotionalWorkforceAnalysis = {
    guest_sentiment: urgency === 'Immediate' ? 'Urgent / Distressed' : 'Polite / Inquiring',
    guest_sentiment_score: urgency === 'Immediate' ? -0.6 : 0.4,
    staff_empathy_score: 8.5,
    small_talk_detected: small_talk_detected.length > 0 ? small_talk_detected : ['Standard hospitality greetings filtered'],
    is_actionable: task_type !== 'None',
    department_category: inferDepartment(task_type),
    recommended_staff_role: inferRole(task_type),
    estimated_duration_mins: urgency === 'Immediate' ? 10 : 20,
  };

  return {
    task: cleanTask,
    analysis,
    rawJsonString: JSON.stringify(cleanTask, null, 2),
  };
}
