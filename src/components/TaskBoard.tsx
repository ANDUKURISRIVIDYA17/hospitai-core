import React, { useState } from 'react';
import { 
  ClipboardList, 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  UserCheck, 
  VolumeX, 
  Trash2, 
  ChevronDown, 
  ChevronUp, 
  Sparkles,
  MapPin,
  Calendar,
  Filter
} from 'lucide-react';
import { ExtractedTaskRecord } from '../../server/types';

interface TaskBoardProps {
  tasks: ExtractedTaskRecord[];
  onUpdateStatus: (id: string, status: 'pending' | 'in_progress' | 'completed' | 'dismissed') => Promise<void>;
  onAssignStaff: (id: string, staffName: string) => Promise<void>;
  onDeleteTask: (id: string) => Promise<void>;
}

const HOTEL_STAFF_DIRECTORY = [
  'Carlos Ruiz (Lead Engineer)',
  'Elena Vance (Floor 6 Housekeeper)',
  'Jean-Luc Moreau (In-Room Dining)',
  'Amina Khan (Duty Manager)',
  'Marcus Brody (Bell Captain)',
  'Sophie Laurent (Head Concierge)',
  'Liam O’Connor (HVAC Technician)',
];

export const TaskBoard: React.FC<TaskBoardProps> = ({
  tasks,
  onUpdateStatus,
  onAssignStaff,
  onDeleteTask,
}) => {
  const [filterUrgency, setFilterUrgency] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterDepartment, setFilterDepartment] = useState<string>('all');
  const [expandedTranscriptId, setExpandedTranscriptId] = useState<string | null>(null);

  const filteredTasks = tasks.filter((task) => {
    if (filterUrgency !== 'all' && task.urgency.toLowerCase() !== filterUrgency.toLowerCase()) return false;
    if (filterStatus !== 'all' && task.status !== filterStatus) return false;
    if (filterDepartment !== 'all' && !task.department_category.toLowerCase().includes(filterDepartment.toLowerCase())) return false;
    return true;
  });

  const getUrgencyBadge = (urgency: string) => {
    switch (urgency) {
      case 'Immediate':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse';
      case 'High':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      case 'Medium':
        return 'bg-sky-500/20 text-sky-300 border-sky-500/40';
      default:
        return 'bg-stone-600/20 text-stone-300 border-stone-600/40';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
      case 'in_progress':
        return 'bg-amber-500/15 text-amber-300 border-amber-500/30';
      case 'dismissed':
        return 'bg-stone-700/20 text-stone-400 border-stone-700/30';
      default:
        return 'bg-sky-500/15 text-sky-300 border-sky-500/30';
    }
  };

  return (
    <div className="bg-stone-900/90 border border-stone-800 rounded-2xl p-5 shadow-xl mt-6">
      {/* Board Header & Filters */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-stone-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-stone-800 flex items-center justify-center text-amber-400">
            <ClipboardList className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-stone-100 flex items-center gap-2">
              Operational Dispatch Feed
              <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-stone-800 text-stone-400">
                {filteredTasks.length} active
              </span>
            </h2>
            <p className="text-xs text-stone-400">
              Filtered tasks dispatched directly from ambient conversation intelligence
            </p>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Urgency Filter */}
          <select
            value={filterUrgency}
            onChange={(e) => setFilterUrgency(e.target.value)}
            className="bg-stone-950 border border-stone-800 text-xs text-stone-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-amber-500"
          >
            <option value="all">All Urgencies</option>
            <option value="immediate">Immediate (P0)</option>
            <option value="high">High Urgency</option>
            <option value="medium">Medium Urgency</option>
            <option value="low">Low Urgency</option>
          </select>

          {/* Department Filter */}
          <select
            value={filterDepartment}
            onChange={(e) => setFilterDepartment(e.target.value)}
            className="bg-stone-950 border border-stone-800 text-xs text-stone-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-amber-500"
          >
            <option value="all">All Departments</option>
            <option value="housekeep">Housekeeping</option>
            <option value="engineering">Engineering / Maintenance</option>
            <option value="food">Food & Beverage</option>
            <option value="front">Front Office</option>
            <option value="concierge">Concierge / Valet</option>
          </select>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-stone-950 border border-stone-800 text-xs text-stone-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-amber-500"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="dismissed">Dismissed (Noise)</option>
          </select>
        </div>
      </div>

      {/* Tasks Grid */}
      {filteredTasks.length === 0 ? (
        <div className="py-12 text-center text-stone-500">
          <p className="text-sm">No tasks match the selected filter criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-4">
          {filteredTasks.map((task) => {
            const isExpanded = expandedTranscriptId === task.id;

            return (
              <div
                key={task.id}
                className="bg-stone-950/70 border border-stone-800/90 hover:border-stone-700/80 rounded-xl p-4 flex flex-col justify-between transition shadow-md"
              >
                <div>
                  {/* Card Top: Badges */}
                  <div className="flex items-center justify-between gap-2 mb-2.5">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-xs font-bold text-amber-400 bg-amber-950/40 border border-amber-800/40 px-2 py-0.5 rounded-md">
                        {task.room_number || 'N/A'}
                      </span>
                      <span className="text-xs font-medium text-stone-300 bg-stone-900 border border-stone-800 px-2 py-0.5 rounded-md">
                        {task.task_type}
                      </span>
                    </div>

                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded border uppercase tracking-wider ${getUrgencyBadge(task.urgency)}`}>
                      {task.urgency}
                    </span>
                  </div>

                  {/* Clean Notes (Operational Core) */}
                  <div className="bg-stone-900/60 rounded-lg p-2.5 border border-stone-800/60 mb-3">
                    <span className="text-[10px] font-mono uppercase text-stone-400 block mb-1">
                      Actionable Instructions (Small Talk Filtered):
                    </span>
                    <p className="text-xs text-stone-100 font-sans leading-relaxed">
                      {task.notes}
                    </p>
                  </div>

                  {/* Emotional Sentiment & Empathy Info */}
                  <div className="flex items-center justify-between text-[11px] text-stone-400 py-1 border-t border-stone-900">
                    <span title="Guest Emotional State">
                      Guest: <strong className="text-stone-300">{task.guest_sentiment || 'Neutral'}</strong>
                    </span>
                    <span title="Frontline Staff Composure Rating">
                      Empathy: <strong className="text-emerald-400">{task.staff_empathy_score || 8.5}/10</strong>
                    </span>
                  </div>

                  {/* Ignored Small Talk Preview */}
                  {task.small_talk_detected && task.small_talk_detected.length > 0 && (
                    <div className="mt-2 text-[10px] text-stone-400 flex items-center gap-1">
                      <VolumeX className="w-3 h-3 text-amber-500 shrink-0" />
                      <span className="truncate">
                        Suppressed: {task.small_talk_detected.join(', ')}
                      </span>
                    </div>
                  )}

                  {/* Expandable Raw Ambient Transcript */}
                  <div className="mt-3">
                    <button
                      onClick={() => setExpandedTranscriptId(isExpanded ? null : task.id)}
                      className="text-[11px] text-amber-400/90 hover:text-amber-300 flex items-center gap-1 transition cursor-pointer"
                    >
                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      <span>{isExpanded ? 'Hide Raw Audio Transcript' : 'View Ambient Audio Transcript'}</span>
                    </button>

                    {isExpanded && (
                      <div className="mt-2 p-2.5 bg-stone-900/90 border border-stone-800 rounded-lg text-xs text-stone-400 italic leading-relaxed">
                        <div className="text-[10px] font-mono not-italic text-stone-400 mb-1 flex items-center justify-between">
                          <span>MIC: {task.location_context}</span>
                          <span>{task.audio_timestamp}</span>
                        </div>
                        "{task.raw_transcript}"
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer Controls: Status & Assignment */}
                <div className="mt-4 pt-3 border-t border-stone-800/80 flex flex-col gap-2">
                  <div className="flex items-center justify-between gap-2">
                    {/* Status Toggle */}
                    <div className="flex items-center gap-1">
                      {task.status !== 'completed' && task.status !== 'dismissed' ? (
                        <>
                          <button
                            onClick={() => onUpdateStatus(task.id, task.status === 'pending' ? 'in_progress' : 'completed')}
                            className="text-xs px-2.5 py-1 rounded-md bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 font-medium transition cursor-pointer"
                          >
                            {task.status === 'pending' ? 'Mark In Progress' : 'Mark Resolved'}
                          </button>
                          <button
                            onClick={() => onUpdateStatus(task.id, 'dismissed')}
                            className="text-xs px-2 py-1 rounded-md text-stone-400 hover:text-stone-300 hover:bg-stone-900 transition cursor-pointer"
                            title="Dismiss task as non-operational"
                          >
                            Dismiss
                          </button>
                        </>
                      ) : (
                        <span className={`text-[11px] font-medium px-2 py-0.5 rounded border capitalize ${getStatusBadge(task.status)}`}>
                          {task.status}
                        </span>
                      )}
                    </div>

                    {/* Delete button */}
                    <button
                      onClick={() => onDeleteTask(task.id)}
                      className="p-1 text-stone-400 hover:text-rose-400 transition cursor-pointer"
                      title="Delete task record"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Assignee Selection */}
                  <div className="flex items-center gap-1.5 text-xs text-stone-400">
                    <UserCheck className="w-3.5 h-3.5 text-stone-500 shrink-0" />
                    <select
                      value={task.assigned_to || ''}
                      onChange={(e) => onAssignStaff(task.id, e.target.value)}
                      className="w-full bg-stone-900/90 border border-stone-800 rounded px-2 py-1 text-[11px] text-stone-300 focus:outline-none focus:border-amber-500"
                    >
                      <option value="">Unassigned</option>
                      {HOTEL_STAFF_DIRECTORY.map((staff) => (
                        <option key={staff} value={staff}>
                          {staff}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
