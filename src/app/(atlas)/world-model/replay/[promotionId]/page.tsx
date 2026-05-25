'use client';

import dynamic from 'next/dynamic';
import { Suspense } from 'react';
const ReplayPage = dynamic(() => import('./ReplayPage.client'), { ssr: false });
export default function Page({ params }:{ params:{ promotionId:string }}) {
  return <Suspense fallback={<div className="p-6">Loading replayâ€¦</div>}>
    <ReplayPage promotionId={params.promotionId} />
  </Suspense>;
}