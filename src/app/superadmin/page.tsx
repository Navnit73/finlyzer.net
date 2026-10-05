import AdminDashboardView from '@/components/admin/AdminDashboardView';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'SuperAdmin System & Worker Monitoring — Finlyzer',
  description: 'Real-time database metrics, background Celery worker telemetry, and global system event stream.',
};

export default function SuperAdminPage() {
  return (
    <div className="w-full pb-16">
      <AdminDashboardView />
    </div>
  );
}
