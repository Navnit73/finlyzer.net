import AdminDashboardView from '@/components/admin/AdminDashboardView';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'System dashboard',
  description: 'Job volume, worker health and processing queue.',
  robots: { index: false, follow: false },
};

export default function SuperAdminPage() {
  return (
    <div className="w-full pb-16">
      <AdminDashboardView />
    </div>
  );
}
