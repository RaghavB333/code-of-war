import React, { Suspense } from 'react';
import ProblemsPageClient from './ProblemsPageClient';

export default function ProblemsPage() {


  return (
    <Suspense fallback={<div>Loading Problems...</div>}>
      <ProblemsPageClient />
    </Suspense>
  );
}
