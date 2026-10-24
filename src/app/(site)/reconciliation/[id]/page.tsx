'use client';

import React, { use } from 'react';
import ReconciliationReport from '@/components/reconciliation/ReconciliationReport';

export default function ReconciliationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <ReconciliationReport id={id} />;
}
