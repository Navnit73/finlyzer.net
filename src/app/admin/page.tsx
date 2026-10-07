import AdminDashboardView from '@/components/admin/AdminDashboardView';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'SuperAdmin System & Worker Monitoring — Finlyzers',
  description: 'Real-time database metrics, background Celery worker telemetry, and global system event stream.',
  robots: { index: false, follow: false },
};

export default function AdminPage() {
  return (
    <div className="w-full pb-16">
      <AdminDashboardView />
    </div>
  );
}
