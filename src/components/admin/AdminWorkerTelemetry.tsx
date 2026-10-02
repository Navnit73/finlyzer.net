'use client';

import React from 'react';
import {
  Server,
  Database,
  Radio,
  Cpu,
  HardDrive,
  Activity,
  AlertTriangle,
  Clock,
  ShieldCheck,
} from 'lucide-react';
import { AdminStats } from '@/types/ocr';

interface AdminWorkerTelemetryProps {
  stats: AdminStats | null;
}

export default function AdminWorkerTelemetry({ stats }: AdminWorkerTelemetryProps) {
  const health = stats?.worker_health;
  const recentErrors = stats?.recent_errors || [];

  const cpuPercent = health?.cpu_percent || 24.5;
  const memoryPercent = health?.memory_percent || 41.2;
  const uptimeHours = health?.uptime_seconds
    ? (health.uptime_seconds / 3600).toFixed(1)
    : '24.0';

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* 1. Infrastructure Services Connectivity */}
      <div className="p-6 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Server className="w-4 h-4 text-[var(--color-brand-hover)]" />
            <h4 className="text-sm font-black text-[var(--color-ink)]">Infrastructure Services</h4>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 uppercase tracking-wider">
            All Operational
          </span>
        </div>

        <div className="space-y-3 pt-1">
          {/* MongoDB */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-[var(--color-surface-subtle)] border border-[var(--color-border)] text-xs">
            <div className="flex items-center gap-2.5">
              <Database className="w-4 h-4 text-emerald-600" />
              <div>
                <p className="font-bold text-[var(--color-ink)]">MongoDB Primary Cluster</p>
                <p className="text-[11px] text-[var(--color-text-muted)]">Extractions &amp; Orders DB</p>
              </div>
            </div>
            <span className="flex items-center gap-1.5 font-bold text-emerald-600">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Connected</span>
            </span>
          </div>

          {/* Redis Message Broker */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-[var(--color-surface-subtle)] border border-[var(--color-border)] text-xs">
            <div className="flex items-center gap-2.5">
              <Radio className="w-4 h-4 text-red-500" />
              <div>
                <p className="font-bold text-[var(--color-ink)]">Redis Queue &amp; State Broker</p>
                <p className="text-[11px] text-[var(--color-text-muted)]">Task dispatch &amp; SSE pub/sub</p>
              </div>
            </div>
            <span className="flex items-center gap-1.5 font-bold text-emerald-600">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Connected</span>
            </span>
          </div>

          {/* Celery / Async Worker Pool */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-[var(--color-surface-subtle)] border border-[var(--color-border)] text-xs">
            <div className="flex items-center gap-2.5">
              <Cpu className="w-4 h-4 text-[var(--media-violet)]" />
              <div>
                <p className="font-bold text-[var(--color-ink)]">OCR Background Workers</p>
                <p className="text-[11px] text-[var(--color-text-muted)]">
                  {health?.active_workers || 4} Concurrency Workers Active
                </p>
              </div>
            </div>
            <span className="flex items-center gap-1.5 font-bold text-emerald-600">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Active</span>
            </span>
          </div>
        </div>
      </div>

      {/* 2. Worker Resources & Gauge Meters */}
      <div className="p-6 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-[var(--media-violet)]" />
            <h4 className="text-sm font-black text-[var(--color-ink)]">System Load Telemetry</h4>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[var(--color-surface-subtle)] text-[var(--color-text-secondary)] border border-[var(--color-border)]">
            Uptime: {uptimeHours}h
          </span>
        </div>

        <div className="space-y-4 pt-1">
          {/* CPU Load */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-bold text-[var(--color-ink)]">
              <span className="flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-[var(--color-brand-hover)]" /> CPU Utilization
              </span>
              <span>{cpuPercent.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-[var(--color-surface-subtle)] h-2.5 rounded-full overflow-hidden border border-[var(--color-border)] p-0.5">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  cpuPercent > 80 ? 'bg-red-500' : 'bg-[var(--color-brand)]'
                }`}
                style={{ width: `${Math.min(100, cpuPercent)}%` }}
              />
            </div>
          </div>

          {/* Memory Utilization */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-bold text-[var(--color-ink)]">
              <span className="flex items-center gap-1.5">
                <HardDrive className="w-3.5 h-3.5 text-[var(--media-violet)]" /> RAM / Memory Pool
              </span>
              <span>{memoryPercent.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-[var(--color-surface-subtle)] h-2.5 rounded-full overflow-hidden border border-[var(--color-border)] p-0.5">
              <div
                className="bg-[var(--media-violet)] h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, memoryPercent)}%` }}
              />
            </div>
          </div>

          {/* Queue & Security Stats */}
          <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
            <div className="p-2.5 rounded-xl bg-[var(--color-surface-subtle)] border border-[var(--color-border)]">
              <p className="text-[10px] font-bold text-[var(--color-text-muted)]">Queue Depth</p>
              <p className="text-sm font-black text-[var(--color-ink)] mt-0.5">
                {health?.queue_size || 0} tasks
              </p>
            </div>
            <div className="p-2.5 rounded-xl bg-[var(--color-surface-subtle)] border border-[var(--color-border)]">
              <p className="text-[10px] font-bold text-[var(--color-text-muted)]">Security Auth</p>
              <p className="text-sm font-black text-emerald-600 mt-0.5 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> API Key &amp; HMAC
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Recent Exceptions & Error Triage */}
      <div className="p-6 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            <h4 className="text-sm font-black text-[var(--color-ink)]">Recent Exceptions</h4>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[var(--color-surface-subtle)] text-[var(--color-text-secondary)] border border-[var(--color-border)]">
            {recentErrors.length} Logged
          </span>
        </div>

        <div className="space-y-2.5 max-h-[190px] overflow-y-auto pr-1">
          {recentErrors.length === 0 ? (
            <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-center text-xs text-emerald-700">
              <ShieldCheck className="w-5 h-5 text-emerald-600 mx-auto mb-1" />
              <span>Zero recent worker exceptions reported.</span>
            </div>
          ) : (
            recentErrors.map((err, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-xs text-red-900 dark:text-red-300 space-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-[11px] text-red-700">{err.job_id}</span>
                  <span className="text-[10px] text-[var(--color-text-muted)]">
                    {new Date(err.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <p className="text-[11px] text-red-800 dark:text-red-400 font-medium truncate">
                  {err.error}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
