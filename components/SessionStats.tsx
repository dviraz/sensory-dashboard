'use client';

import { useState } from 'react';
import { useAudioStore } from '@/lib/store';

export default function SessionStats() {
  const { sessions } = useAudioStore();
  const [isOpen, setIsOpen] = useState(false);

  // Calculate stats
  const completedSessions = sessions.filter(s => s.completed);
  const totalFocusTime = completedSessions.reduce((acc, s) => acc + s.duration, 0);
  const workSessions = completedSessions.filter(s => s.type === 'work');
  const breakSessions = completedSessions.filter(s => s.type === 'break');

  const totalWorkTime = workSessions.reduce((acc, s) => acc + s.duration, 0);
  const totalBreakTime = breakSessions.reduce((acc, s) => acc + s.duration, 0);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return `Today at ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
    } else if (diffDays === 1) {
      return `Yesterday at ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    }
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  if (sessions.length === 0) {
    return null; // Don't show if no sessions yet
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="bg-zinc-950/80 border border-zinc-800 rounded-xl p-4 backdrop-blur-md shadow-2xl">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <svg className="w-5 h-5 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <div className="text-left">
              <h3 className="text-lg font-semibold text-zinc-100">Session Stats</h3>
              <p className="text-sm text-zinc-500">
                {completedSessions.length} session{completedSessions.length !== 1 ? 's' : ''} • {formatTime(totalFocusTime)} total
              </p>
            </div>
          </div>
          <svg className={`w-5 h-5 text-zinc-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {isOpen && (
          <div className="mt-4 pt-4 border-t border-zinc-800 space-y-4">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-zinc-900/50 rounded-lg p-3 border border-zinc-800">
                <div className="text-2xl font-bold text-blue-400">{completedSessions.length}</div>
                <div className="text-xs text-zinc-500">Total Sessions</div>
              </div>

              <div className="bg-zinc-900/50 rounded-lg p-3 border border-zinc-800">
                <div className="text-2xl font-bold text-green-400">{formatTime(totalFocusTime)}</div>
                <div className="text-xs text-zinc-500">Total Time</div>
              </div>

              <div className="bg-zinc-900/50 rounded-lg p-3 border border-zinc-800">
                <div className="text-2xl font-bold text-purple-400">{workSessions.length}</div>
                <div className="text-xs text-zinc-500">Work Sessions</div>
              </div>

              <div className="bg-zinc-900/50 rounded-lg p-3 border border-zinc-800">
                <div className="text-2xl font-bold text-orange-400">{breakSessions.length}</div>
                <div className="text-xs text-zinc-500">Break Sessions</div>
              </div>
            </div>

            {/* Time Breakdown */}
            {totalWorkTime > 0 && (
              <div className="bg-zinc-900/50 rounded-lg p-3 border border-zinc-800">
                <div className="text-sm text-zinc-400 mb-2">Time Breakdown</div>
                <div className="flex gap-4 text-sm">
                  <div>
                    <span className="text-zinc-500">Work: </span>
                    <span className="text-purple-400 font-medium">{formatTime(totalWorkTime)}</span>
                  </div>
                  <div>
                    <span className="text-zinc-500">Break: </span>
                    <span className="text-orange-400 font-medium">{formatTime(totalBreakTime)}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Recent Sessions */}
            <div>
              <h4 className="text-sm font-medium text-zinc-400 mb-2">Recent Sessions</h4>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {[...completedSessions]
                  .reverse()
                  .slice(0, 10)
                  .map((session) => (
                    <div
                      key={session.id}
                      className="flex items-center justify-between p-2 bg-zinc-900/50 rounded border border-zinc-800"
                    >
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${session.type === 'work' ? 'bg-purple-400' : 'bg-orange-400'}`} />
                        <span className="text-sm text-zinc-300 capitalize">{session.type}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-zinc-500 font-mono">{formatDuration(session.duration)}</span>
                        <span className="text-xs text-zinc-600">{formatDate(session.startTime)}</span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
