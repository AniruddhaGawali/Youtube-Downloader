'use client';

import DownloadForm from '@/components/download-form';
import Header from '@/components/header';
import LinkForm from '@/components/link-form';
import { useState } from 'react';

export default function Home() {
  const [details, setDetails] = useState<VideoDetails | null>(null);
  const [link, setLink] = useState<string>('');

  return (
    <main className="flex min-h-screen flex-col items-center justify-start gap-10 p-24 text-left">
      <Header />
      <LinkForm setDetails={setDetails} setLink={setLink} />
      <DownloadForm
        details={details}
        link={link}
      />
    </main>
  );
}
