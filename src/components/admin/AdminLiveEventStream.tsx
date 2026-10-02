'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Terminal,
  Play,
  Pause,
  Trash2,
  Radio,
  Filter,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  Layers,
} from 'lucide-react';
import { AdminSystemEvent } from '@/types/ocr';

export default function AdminLiveEventStream() {
  const [events, setEvents] = useState<AdminSystemEvent[]>([]);
  const [isPaused, setIsPaused] = useState(false);
  const [filterType, setFilterType] = useState<string>('all');
  const [isConnected, setIsConnected] = useState(false);

  const eventSourceRef = useRef<EventSource | null>(null);
  const logContainerRef = useRef<HTMLDivElement>(null);

  const addEvent = useCallback((eventItem: AdminSystemEvent) => {
    setEvents((prev) => {
      const updated = [eventItem, ...prev];
      return updated.slice(0, 200); // keep last 200 events
    });
  }, []);

  useEffect(() => {
    if (isPaused) {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
      setIsConnected(false);
      return;
    }

    try {
      const es = new EventSource('/api/admin/events');
      eventSourceRef.current = es;

      es.onopen = () => {
        setIsConnected(true);
        addEvent({
          event: 'admin.connected',
          timestamp: new Date().toISOString(),
          message: 'Connected to Global Admin Live SSE Event Stream.',
        });
      };

      es.addEventListener('ocr.job.started', (e: MessageEvent) => {
        try {
          const data = JSON.parse(e.data);
          addEvent({ ...data, event: 'ocr.job.started' });
        } catch {
          // Ignore
        }
      });

      es.addEventListener('ocr.job.progress', (e: MessageEvent) => {
        try {
          const data = JSON.parse(e.data);
          addEvent({ ...data, event: 'ocr.job.progress' });
        } catch {
          // Ignore
        }
      });

      es.addEventListener('ocr.job.completed', (e: MessageEvent) => {
        try {
          const data = JSON.parse(e.data);
          addEvent({ ...data, event: 'ocr.job.completed' });
        } catch {
          // Ignore
        }
      });

      es.addEventListener('ocr.job.failed', (e: MessageEvent) => {
        try {
          const data = JSON.parse(e.data);
          addEvent({ ...data, event: 'ocr.job.failed' });
        } catch {
          // Ignore
        }
      });

      es.addEventListener('admin.heartbeat', (e: MessageEvent) => {
        try {
          const data = JSON.parse(e.data);
          addEvent({ ...data, event: 'admin.heartbeat' });
        } catch {
          // Ignore
        }
      });

      es.onerror = () => {
        setIsConnected(false);
      };
    } catch {
      setIsConnected(false);
    }

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
    };
  }, [isPaused, addEvent]);

  const filteredEvents = events.filter((e) => {
    if (filterType === 'all') return true;
    return e.event.includes(filterType);
  });

  return (
    <div className="rounded-2xl bg-[var(--color-ink)] text-white border border-[var(--color-border)] shadow-xl overflow-hidden">
      {/* Stream Terminal Top Bar */}
      <div className="p-4 bg-zinc-900 border-b border-zinc-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-red-500/80" />
            <span className="w-3 h-3 rounded-full bg-yellow-500/80" />
            <span className="w-3 h-3 rounded-full bg-green-500/80" />
          </div>

          <div className="flex items-center gap-2 pl-2 border-l border-zinc-700">
            <Terminal className="w-4 h-4 text-[var(--color-brand)]" />
            <span className="text-xs font-mono font-bold text-zinc-200">
              Live Global Event Stream (SSE)
            </span>
          </div>

          <div className="flex items-center gap-1.5 ml-2">
            <span
              className={`w-2 h-2 rounded-full ${
                isConnected ? 'bg-[var(--color-brand)] animate-ping' : 'bg-zinc-600'
              }`}
            />
            <span
              className={`text-[10px] font-mono uppercase tracking-wider font-bold ${
                isConnected ? 'text-[var(--color-brand)]' : 'text-zinc-500'
              }`}
            >
              {isConnected ? 'ONLINE STREAMING' : isPaused ? 'PAUSED' : 'CONNECTING...'}
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Event Filter */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-2.5 py-1 rounded-lg bg-zinc-800 border border-zinc-700 text-[11px] font-mono text-zinc-300 focus:outline-none focus:border-[var(--color-brand)]"
          >
            <option value="all">All Events ({events.length})</option>
            <option value="started">Job Started</option>
            <option value="progress">Job Progress</option>
            <option value="completed">Job Completed</option>
            <option value="failed">Job Failed</option>
          </select>

          <button
            onClick={() => setIsPaused(!isPaused)}
            className={`btn btn-xs rounded-lg px-2.5 font-mono flex items-center gap-1 text-[11px] cursor-pointer ${
              isPaused
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300'
            }`}
          >
            {isPaused ? <Play className="w-3 h-3" /> : <Pause className="w-3 h-3" />}
            <span>{isPaused ? 'Resume' : 'Pause'}</span>
          </button>

          <button
            onClick={() => setEvents([])}
            className="btn btn-xs rounded-lg px-2.5 font-mono bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white flex items-center gap-1 text-[11px] cursor-pointer"
            title="Clear Stream Logs"
          >
            <Trash2 className="w-3 h-3" />
            <span>Clear</span>
          </button>
        </div>
      </div>

      {/* Terminal Log Console */}
      <div
        ref={logContainerRef}
        className="p-4 font-mono text-xs max-h-[340px] min-h-[220px] overflow-y-auto space-y-2 select-text"
      >
        {filteredEvents.length === 0 ? (
          <div className="py-12 text-center text-zinc-600 space-y-2">
            <Radio className="w-8 h-8 mx-auto animate-pulse text-zinc-700" />
            <p>Listening for real-time background OCR worker events...</p>
            <p className="text-[10px] text-zinc-700">Events appear live as workers process jobs</p>
          </div>
        ) : (
          filteredEvents.map((evt, idx) => {
            const isCompleted = evt.event === 'ocr.job.completed';
            const isFailed = evt.event === 'ocr.job.failed';
            const isProgress = evt.event === 'ocr.job.progress';
            const isStarted = evt.event === 'ocr.job.started';

            return (
              <div
                key={idx}
                className="flex items-start gap-3 p-2 rounded-lg bg-zinc-900/80 border border-zinc-800/80 hover:border-zinc-700 transition"
              >
                <span className="text-[10px] text-zinc-500 shrink-0 pt-0.5">
                  {new Date(evt.timestamp).toLocaleTimeString()}
                </span>

                <span
                  className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider shrink-0 ${
                    isCompleted
                      ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                      : isFailed
                      ? 'bg-red-950 text-red-400 border border-red-800'
                      : isProgress
                      ? 'bg-blue-950 text-blue-400 border border-blue-800'
                      : isStarted
                      ? 'bg-purple-950 text-purple-400 border border-purple-800'
                      : 'bg-zinc-800 text-zinc-300'
                  }`}
                >
                  {evt.event}
                </span>

                <div className="flex-1 overflow-x-auto">
                  <div className="flex items-center gap-2">
                    {evt.job_id && (
                      <span className="text-[var(--color-brand)] font-bold">{evt.job_id}</span>
                    )}
                    {evt.progress !== undefined && (
                      <span className="text-zinc-400">[{evt.progress}%]</span>
                    )}
                    <span className="text-zinc-300">
                      {typeof evt.message === 'string' ? evt.message : isCompleted ? 'Document processing complete' : ''}
                    </span>
                  </div>
                  {evt.error && <p className="text-red-400 text-[11px] mt-0.5">{String(evt.error)}</p>}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
