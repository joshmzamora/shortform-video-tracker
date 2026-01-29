"use client";

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, PlaySquare, ListChecks } from 'lucide-react';

export default function Home() {
  const router = useRouter();

  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-headline text-center">VideoFlow Insights</CardTitle>
          <CardDescription className="text-center pt-1">Main Menu</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 pt-4">
          <Button size="lg" onClick={() => router.push('/consent')}>
            <PlaySquare className="mr-2" />
            Experiment
          </Button>
          <Button size="lg" variant="outline" onClick={() => router.push('/consent')}>
            <FileText className="mr-2" />
            Consent Form
          </Button>
          <Button size="lg" variant="outline" disabled>
            <ListChecks className="mr-2" />
            Questionnaire
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
