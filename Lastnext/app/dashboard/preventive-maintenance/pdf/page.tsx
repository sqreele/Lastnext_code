'use client';

import React from 'react';
import { useFilterStore } from '@/app/lib/stores/filterStore';
import PDFMaintenanceGenerator from '@/app/components/ducument/ PDFMaintenanceGenerator';

export default function PDFGeneratorPage() {
  const { currentFilters } = useFilterStore();

  // ✅ Correct: The 'PDFMaintenanceGenerator' component accepts the initialFilters prop.
  return <PDFMaintenanceGenerator initialFilters={{ ...currentFilters, machineId: currentFilters.machine }} />;
}