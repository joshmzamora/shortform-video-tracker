"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { ArrowRight } from 'lucide-react';

export default function Home() {
  const [participantId, setParticipantId] = useState('');
  const router = useRouter();

  const handleStart = () => {
    if (participantId.trim()) {
      router.push(`/session?participantId=${encodeURIComponent(participantId.trim())}`);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-headline">VideoFlow Insights</CardTitle>
          <CardDescription>Welcome to the user engagement study. Please enter your participant ID to begin.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={(e) => { e.preventDefault(); handleStart(); }}>
            <div className="space-y-2">
              <Label htmlFor="participantId">Participant ID</Label>
              <Input
                id="participantId"
                placeholder="e.g., user_001"
                value={participantId}
                onChange={(e) => setParticipantId(e.target.value)}
                autoFocus
                required
              />
            </div>
          </form>
        </CardContent>
        <CardFooter>
          <Button className="w-full" onClick={handleStart} disabled={!participantId.trim()}>
            Start Experiment <ArrowRight className="ml-2" />
          </Button>
        </CardFooter>
      </Card>
    </main>
  );
}
