'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, Trash2, Radio } from 'lucide-react';
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

  const statusLabel = isConnected ? 'Streaming' : isPaused ? 'Paused' : 'Connecting…';
  const statusDot = isConnected
    ? 'bg-[var(--color-success)]'
    : isPaused
    ? 'bg-[var(--color-border-hover)]'
    : 'bg-[var(--color-warning)] animate-pulse';

  const controlClass =
    'inline-flex h-8 items-center gap-1.5 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-3 text-[13px] font-medium text-[var(--color-ink)] transition-colors hover:bg-[var(--color-surface-subtle)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-brand)] cursor-pointer';

  return (
    <div className="card-surface overflow-hidden">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--color-border)] px-4 py-3 sm:px-5">
        <div className="flex min-w-0 items-center gap-3">
          <span className="text-sm font-medium text-[var(--color-ink)]">Live global event stream (SSE)</span>
          <span className="flex items-center gap-1.5 text-[13px] text-[var(--color-text-muted)]" role="status">
            <span className={`h-2 w-2 rounded-full ${statusDot}`} aria-hidden="true" />
            <span>{statusLabel}</span>
          </span>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            aria-label="Filter events by type"
            className="h-8 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] pl-2.5 pr-7 text-[13px] text-[var(--color-ink)] focus:border-[var(--color-brand)] focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-brand)] cursor-pointer"
          >
            <option value="all">All events ({events.length})</option>
            <option value="started">Job started</option>
            <option value="progress">Job progress</option>
            <option value="completed">Job completed</option>
            <option value="failed">Job failed</option>
          </select>

          <button
            type="button"
            onClick={() => setIsPaused(!isPaused)}
            aria-label={isPaused ? 'Resume live event stream' : 'Pause live event stream'}
            aria-pressed={isPaused}
            className={controlClass}
          >
            {isPaused ? <Play className="h-3.5 w-3.5" aria-hidden="true" /> : <Pause className="h-3.5 w-3.5" aria-hidden="true" />}
            <span>{isPaused ? 'Resume' : 'Pause'}</span>
          </button>

          <button
            type="button"
            onClick={() => setEvents([])}
            aria-label="Clear stream logs"
            className={controlClass}
            title="Clear stream logs"
          >
            <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Clear</span>
          </button>
        </div>
      </div>

      {/* Log console */}
      <div
        ref={logContainerRef}
        role="log"
        aria-live="polite"
        aria-label="System event logs"
        tabIndex={0}
        className="max-h-[360px] min-h-[220px] overflow-y-auto bg-[var(--color-surface-subtle)] font-mono text-[12px] leading-5 select-text focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[var(--color-brand)]"
      >
        {filteredEvents.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 px-4 py-14 text-center font-sans">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-surface-muted)] text-[var(--color-text-muted)]">
              <Radio className="h-5 w-5" aria-hidden="true" />
            </span>
            <p className="text-[15px] font-semibold text-[var(--color-ink)]">Listening for real-time background OCR worker events…</p>
            <p className="text-[13px] text-[var(--color-text-muted)]">Events appear live as workers process jobs</p>
          </div>
        ) : (
          <ol className="divide-y divide-[var(--color-border)]">
            {filteredEvents.map((evt, idx) => {
              const isCompleted = evt.event === 'ocr.job.completed';
              const isFailed = evt.event === 'ocr.job.failed';
              const isProgress = evt.event === 'ocr.job.progress';
              const isStarted = evt.event === 'ocr.job.started';

              const eventColor = isCompleted
                ? 'text-[var(--color-success)]'
                : isFailed
                ? 'text-[var(--color-danger)]'
                : isProgress
                ? 'text-[var(--color-brand-dark)]'
                : isStarted
                ? 'text-[var(--color-ink)]'
                : 'text-[var(--color-text-muted)]';

              return (
                <li
                  key={idx}
                  className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-0.5 px-4 py-2 sm:grid-cols-[88px_168px_1fr] sm:px-5"
                >
                  <time className="tabular-nums text-[var(--color-text-muted)]" dateTime={evt.timestamp}>
                    {new Date(evt.timestamp).toLocaleTimeString()}
                  </time>

                  <span className={`truncate ${eventColor}`} title={evt.event}>
                    {evt.event}
                  </span>

                  <div className="col-span-2 min-w-0 sm:col-span-1">
                    <div className="flex flex-wrap items-baseline gap-x-2">
                      {evt.job_id && <span className="text-[var(--color-text-secondary)]">{evt.job_id}</span>}
                      {evt.progress !== undefined && (
                        <span className="tabular-nums text-[var(--color-text-muted)]">[{evt.progress}%]</span>
                      )}
                      <span className="break-words text-[var(--color-ink)]">
                        {typeof evt.message === 'string' ? evt.message : isCompleted ? 'Document processing complete' : ''}
                      </span>
                    </div>
                    {evt.error && <p className="mt-0.5 break-words text-[var(--color-danger)]">{String(evt.error)}</p>}
                  </div>
                </li>
              );
            })}
          </ol>
        )}
      </div>
    </div>
  );
}
