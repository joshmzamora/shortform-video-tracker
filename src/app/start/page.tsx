"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { ArrowRight, Loader2 } from 'lucide-react';

export default function StartPage() {
  const [participantId, setParticipantId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleStart = () => {
    if (participantId.trim() && !isLoading) {
      setIsLoading(true);
      router.push(`/session?participantId=${encodeURIComponent(participantId.trim())}`);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-headline">Start Experiment</CardTitle>
          <CardDescription>Please enter your participant ID to begin the experiment session.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={(e) => { e.preventDefault(); document.getElementById('start-button')?.click(); }}>
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
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button id="start-button" className="w-full" disabled={!participantId.trim() || isLoading}>
                {isLoading ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Starting...
                    </>
                ) : (
                    <>
                        Start Experiment <ArrowRight className="ml-2" />
                    </>
                )}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Experiment Instructions</AlertDialogTitle>
                <AlertDialogDescription asChild>
                  <div className="space-y-3 pt-2 text-sm text-foreground">
                    <p><strong>Experiment Duration:</strong> The experiment is expected to last approximately 10 minutes.</p>
                    <p><strong>Interface Restrictions:</strong> Standard TikTok interactions (like, comment, share) are disabled.</p>
                    <p><strong>Navigation:</strong> Please use the up and down arrow buttons on the side to move between videos.</p>
                    <p><strong>Data Anonymity:</strong> All data collected is completely anonymous and cannot be linked to you.</p>
                    <p><strong>Your Task:</strong> Please engage with the content as naturally as you would on the actual platform.</p>
                  </div>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogAction onClick={handleStart} className="w-full">
                  Continue
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardFooter>
      </Card>
    </main>
  );
}
