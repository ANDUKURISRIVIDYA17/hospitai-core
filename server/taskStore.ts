import { ExtractedTaskRecord } from './types.js';

class TaskStore {
  private tasks: ExtractedTaskRecord[] = [];

  constructor() {
    this.seedDefaultTasks();
  }

  private seedDefaultTasks() {
    const now = Date.now();
    this.tasks = [
      {
        id: 'task-101',
        task_type: 'Maintenance',
        room_number: '418',
        urgency: 'Immediate',
        notes: 'Repair leaking bathtub faucet and dangerously gurgling bathroom drain with pipe snake.',
        guest_sentiment: 'Anxious / Concerned',
        guest_sentiment_score: -0.4,
        staff_empathy_score: 9.2,
        small_talk_detected: ['London rain and dreary weather', 'Heathrow terminal 2 delays', 'Restaurant pasta recommendation'],
        is_actionable: true,
        department_category: 'Engineering & Maintenance',
        recommended_staff_role: 'Maintenance Technician',
        estimated_duration_mins: 25,
        raw_transcript: 'Welcome Mr. Henderson! Oh gosh, did you fly through Heathrow? The rain was dreadful this morning. Before you head up, the bathtub faucet in room 418 started dripping again and the drain is gurgling like it might overflow. Could we get engineering up immediately with a pipe snake? Also chef Marco has wonderful pasta tonight!',
        location_context: 'Front Desk Terminal 1',
        audio_timestamp: '14:22:10',
        status: 'in_progress',
        assigned_to: 'Carlos Ruiz (Lead Engineer)',
        created_at: new Date(now - 1000 * 60 * 18).toISOString(),
        updated_at: new Date(now - 1000 * 60 * 5).toISOString(),
        model_used: 'gemini-2.5-flash',
        execution_time_ms: 380,
      },
      {
        id: 'task-102',
        task_type: 'Housekeeping',
        room_number: '602',
        urgency: 'High',
        notes: 'Deliver 4 bottles of chilled sparkling water, 2 fresh plush bath towel sets, and 1 ergonomic desk chair before 2:00 PM for urgent executive presentation.',
        guest_sentiment: 'Pressured / Busy',
        guest_sentiment_score: -0.1,
        staff_empathy_score: 8.8,
        small_talk_detected: ['Real Madrid match recap', 'Lunch break schedule chit-chat'],
        is_actionable: true,
        department_category: 'Housekeeping',
        recommended_staff_role: 'Floor Housekeeper',
        estimated_duration_mins: 15,
        raw_transcript: 'Hi Maria, happy Tuesday! Did you catch that match last night? Real Madrid was incredible! By the way, the guest in 602 stopped me in the hallway. He has an urgent presentation and requested four extra bottles of sparkling water, two sets of bath towels, and an ergonomic desk chair before 2:00 PM.',
        location_context: '6th Floor Service Hallway Mic',
        audio_timestamp: '14:05:40',
        status: 'pending',
        assigned_to: 'Elena Vance (Floor 6 Housekeeper)',
        created_at: new Date(now - 1000 * 60 * 35).toISOString(),
        updated_at: new Date(now - 1000 * 60 * 35).toISOString(),
        model_used: 'gemini-2.5-flash',
        execution_time_ms: 410,
      },
      {
        id: 'task-103',
        task_type: 'Room Service',
        room_number: '714',
        urgency: 'High',
        notes: 'Deliver 1 dairy-free club sandwich, truffle fries, and chilled Pinot Noir. CRITICAL: Severe peanut allergy alert for kitchen.',
        guest_sentiment: 'Celebratory & Grateful',
        guest_sentiment_score: 0.8,
        staff_empathy_score: 9.5,
        small_talk_detected: ['Anniversary congratulations', 'Autumn leaves in Paris', 'Rooftop bar closing hours'],
        is_actionable: true,
        department_category: 'Food & Beverage',
        recommended_staff_role: 'In-Room Dining Runner',
        estimated_duration_mins: 30,
        raw_transcript: 'Room service, happy anniversary to you both! Paris is gorgeous with the autumn foliage. For room 714, could you send up one dairy-free club sandwich, hot truffle fries, and a chilled bottle of Pinot Noir? The guest has a severe peanut allergy, so please alert the kitchen.',
        location_context: 'PBX / Dining Order Mic',
        audio_timestamp: '13:50:12',
        status: 'completed',
        assigned_to: 'Jean-Luc Moreau',
        created_at: new Date(now - 1000 * 60 * 60).toISOString(),
        updated_at: new Date(now - 1000 * 60 * 20).toISOString(),
        model_used: 'gemini-2.5-flash',
        execution_time_ms: 365,
      },
      {
        id: 'task-104',
        task_type: 'None',
        room_number: 'N/A',
        urgency: 'Low',
        notes: 'No operational action required. Ambient social conversation and pleasantries between staff and guest in lobby.',
        guest_sentiment: 'Relaxed / Happy',
        guest_sentiment_score: 0.9,
        staff_empathy_score: 9.0,
        small_talk_detected: ['Sunny morning weather', 'Lobby roast coffee aroma', 'Weekend plans'],
        is_actionable: false,
        department_category: 'Front Office',
        recommended_staff_role: 'None Required',
        estimated_duration_mins: 0,
        raw_transcript: 'Good morning Tom! Beautiful sunny morning on the terrace, isn’t it? The espresso beans they roasted today smell fantastic. Hope you have a wonderful shift!',
        location_context: 'Lobby Central Ambient Array',
        audio_timestamp: '13:30:00',
        status: 'dismissed',
        created_at: new Date(now - 1000 * 60 * 90).toISOString(),
        updated_at: new Date(now - 1000 * 60 * 90).toISOString(),
        model_used: 'gemini-2.5-flash',
        execution_time_ms: 290,
      },
    ];
  }

  public getAll(): ExtractedTaskRecord[] {
    return [...this.tasks].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  public getById(id: string): ExtractedTaskRecord | undefined {
    return this.tasks.find((t) => t.id === id);
  }

  public add(task: ExtractedTaskRecord): ExtractedTaskRecord {
    this.tasks.unshift(task);
    return task;
  }

  public update(id: string, updates: Partial<ExtractedTaskRecord>): ExtractedTaskRecord | null {
    const index = this.tasks.findIndex((t) => t.id === id);
    if (index === -1) return null;
    this.tasks[index] = {
      ...this.tasks[index],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    return this.tasks[index];
  }

  public delete(id: string): boolean {
    const index = this.tasks.findIndex((t) => t.id === id);
    if (index === -1) return false;
    this.tasks.splice(index, 1);
    return true;
  }

  public resetToDefault(): ExtractedTaskRecord[] {
    this.seedDefaultTasks();
    return this.getAll();
  }

  public getMetrics() {
    const total = this.tasks.length;
    const actionable = this.tasks.filter((t) => t.is_actionable).length;
    const immediate = this.tasks.filter((t) => t.urgency === 'Immediate').length;
    const high = this.tasks.filter((t) => t.urgency === 'High').length;
    const pending = this.tasks.filter((t) => t.status === 'pending').length;
    const inProgress = this.tasks.filter((t) => t.status === 'in_progress').length;
    const completed = this.tasks.filter((t) => t.status === 'completed').length;
    
    const empathyAvg = total > 0
      ? Number((this.tasks.reduce((acc, t) => acc + (t.staff_empathy_score || 8), 0) / total).toFixed(1))
      : 8.5;

    const noiseFilterCount = this.tasks.reduce((acc, t) => acc + (t.small_talk_detected?.length || 0), 0);

    return {
      total,
      actionable,
      noise_filtered_items: noiseFilterCount,
      small_talk_ratio_pct: total > 0 ? Math.round(((total - actionable) / total) * 100) : 0,
      immediate_urgency: immediate,
      high_urgency: high,
      pending,
      in_progress: inProgress,
      completed,
      average_empathy_score: empathyAvg,
    };
  }
}

export const taskStore = new TaskStore();
