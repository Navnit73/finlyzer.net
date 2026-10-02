import AdminDashboardView from '@/components/admin/AdminDashboardView';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'SuperAdmin System & Worker Monitoring — Finlyzer',
  description: 'Real-time database metrics, background Celery worker telemetry, and global system event stream.',
};

export default function SuperAdminPage() {
  return (
    <div className="site-container py-6 sm:py-8">
      <AdminDashboardView />
    </div>
  );
}
