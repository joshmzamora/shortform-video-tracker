"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, PlaySquare, ListChecks, Loader2 } from 'lucide-react';

export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  const handleNavigation = (path: string) => {
    if (loading) return;
    setLoading(path);
    router.push(path);
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-headline text-center">AP Research Short Form Engagement Experiment</CardTitle>
          <CardDescription className="text-center pt-1">Main Menu</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 pt-4">
          <Button size="lg" onClick={() => handleNavigation('/start')} disabled={!!loading}>
            {loading === '/start' ? <Loader2 className="mr-2 animate-spin" /> : <PlaySquare className="mr-2" />}
            {loading === '/start' ? 'Loading...' : 'Experiment'}
          </Button>
          <Button size="lg" variant="outline" onClick={() => handleNavigation('/consent')} disabled={!!loading}>
             {loading === '/consent' ? <Loader2 className="mr-2 animate-spin" /> : <FileText className="mr-2" />}
             {loading === '/consent' ? 'Loading...' : 'Consent Form'}
          </Button>
          <Button size="lg" variant="outline" onClick={() => handleNavigation('/questionnaire')} disabled={!!loading}>
            {loading === '/questionnaire' ? <Loader2 className="mr-2 animate-spin" /> : <ListChecks className="mr-2" />}
            {loading === '/questionnaire' ? 'Loading...' : 'Questionnaire'}
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
