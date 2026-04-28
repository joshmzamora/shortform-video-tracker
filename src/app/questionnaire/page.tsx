"use client";

import { useState, useEffect, Suspense } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/hooks/use-toast';
import { saveQuestionnaireData } from './actions';
import { useSession } from '@/lib/session-context';
import { Loader2, PartyPopper, Upload, Smartphone } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { useSearchParams, useRouter } from 'next/navigation';

type Question = {
  id: string;
  text: string;
  dimension: 'Preoccupation' | 'Tolerance' | 'Withdrawal' | 'Persistence' | 'Mood Modification' | 'Conflict';
};

const questions: Question[] = [
  { id: 'q1', dimension: 'Preoccupation', text: "I find myself thinking about social media even when I'm not using it." },
  { id: 'q2', dimension: 'Preoccupation', text: "I feel an urge to check social media as soon as I wake up." },
  { id: 'q3', dimension: 'Preoccupation', text: "I plan my day around when I can use social media." },
  { id: 'q4', dimension: 'Tolerance', text: "I need to spend more and more time on social media to feel satisfied." },
  { id: 'q5', dimension: 'Tolerance', text: "I find myself scrolling for longer than I originally intended." },
  { id: 'q6', dimension: 'Tolerance', text: "The time I spend on social media has increased over the past year." },
  { id: 'q7', dimension: 'Withdrawal', text: "I feel restless or irritable when I can't access social media." },
  { id: 'q8', dimension: 'Withdrawal', text: "I feel anxious if I haven't checked my notifications for a while." },
  { id: 'q9', dimension: 'Withdrawal', text: "When I am not on social media, I feel out of touch with everything." },
  { id: 'q10', dimension: 'Persistence', text: "I have tried to spend less time on social media but failed." },
  { id: 'q11', dimension: 'Persistence', text: "My friends or family have told me I should use social media less." },
  { id: 'q12', dimension: 'Persistence', text: "I find it difficult to stop using social media even when I know I should." },
  { id: 'q13', dimension: 'Mood Modification', text: "I use social media to escape from negative feelings or problems." },
  { id: 'q14', dimension: 'Mood Modification', text: "Scrolling through my feed makes me feel better when I'm down." },
  { id: 'q15', dimension: 'Mood Modification', text: "I feel a 'high' or a 'buzz' when I get likes or positive comments." },
  { id: 'q16', dimension: 'Conflict', text: "My use of social media has caused arguments with my family or friends." },
  { id: 'q17', dimension: 'Conflict', text: "I have neglected my schoolwork or chores because I was on social media." },
  { id: 'q18', dimension: 'Conflict', text: "I prefer spending time on social media over spending time with others in person." },
];

const likertOptions = [
  { id: '1', label: 'Strongly Disagree' },
  { id: '2', label: 'Disagree' },
  { id: '3', label: 'Neutral' },
  { id: '4', label: 'Agree' },
  { id: '5', label: 'Strongly Agree' },
];

function QuestionnaireContent() {
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { participantId: contextParticipantId, setQuestionnaire } = useSession();

  const [participantId, setParticipantId] = useState('');
  const [answers, setAnswers] = useState(() => {
    const initialAnswers: { [key: string]: string } = {};
    questions.forEach(q => {
      initialAnswers[q.id] = '';
    });
    return initialAnswers;
  });
  const [screenTime, setScreenTime] = useState({
    tiktok: '',
    instagram: '',
    youtube: '',
    snapchat: ''
  });
  const [shortFormPercentage, setShortFormPercentage] = useState([50]);
  const [screenshot, setScreenshot] = useState<string | null>(null);
  const [submissionState, setSubmissionState] = useState<'idle' | 'submitting' | 'submitted'>('idle');

  useEffect(() => {
    // Prefer Context ID if available, otherwise URL param
    if (contextParticipantId) {
      setParticipantId(contextParticipantId);
    } else {
      const id = searchParams.get('participantId');
      if (id) {
        setParticipantId(id);
      }
    }
  }, [searchParams, contextParticipantId]);

  const handleAnswerChange = (questionId: string, value: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const handleScreenTimeChange = (app: keyof typeof screenTime, value: string) => {
    setScreenTime(prev => ({ ...prev, [app]: value }));
  };

  const handleScreenshotUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setScreenshot(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const allQuestionsAnswered = Object.keys(answers).length === questions.length;
  const screenTimeFilled = Object.values(screenTime).every(val => val.trim() !== '');
  const canSubmit = participantId.trim() !== '' && allQuestionsAnswered && screenTimeFilled;

  const handleSubmit = async () => {
    if (!canSubmit) {
      toast({
        variant: "destructive",
        title: "Incomplete Form",
        description: "Please enter your Participant ID, answer all questions, and provide screen time data.",
      });
      return;
    }

    setSubmissionState('submitting');

    const dataToSave = {
      participantId: participantId.trim(),
      answers,
      screenTime,
      shortFormPercentage: shortFormPercentage[0],
      screenTimeScreenshot: screenshot || undefined,
      timestamp: new Date().toISOString(),
    };

    // 1. Save to In-Memory Context
    setQuestionnaire(dataToSave);

    // 2. Transmit to Server
    let serverSuccess = false;
    try {
      const result = await saveQuestionnaireData(dataToSave);
      serverSuccess = result.success;
    } catch (e) {
      console.warn("Server save failed");
    }

    // 3. Download if Server Fail
    if (!serverSuccess) {
      const blob = new Blob([JSON.stringify(dataToSave, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `questionnaire-${participantId.trim()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Transmission Error - Manual Backup",
        description: "Server unavailable. Data downloaded securely for manual transfer.",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Questionnaire Submitted",
        description: "Responses securely transmitted.",
      });
    }

    setSubmissionState('submitted');
    setTimeout(() => {
      router.push(`/session?participantId=${encodeURIComponent(participantId.trim())}`);
    }, 2000);
  };

  if (submissionState === 'submitted') {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background p-4">
        <Card className="w-full max-w-lg text-center shadow-lg">
          <CardHeader>
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-accent/50">
              <PartyPopper className="h-8 w-8 text-accent-foreground" />
            </div>
            <CardTitle className="mt-4 text-2xl font-headline">Thank You!</CardTitle>
            <CardDescription>Your responses have been recorded. Redirecting to the experiment...</CardDescription>
          </CardHeader>
        </Card>
      </main>
    );
  }


  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-4 md:p-8">
      <Card className="w-full max-w-4xl shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-headline">Social Media Addiction Questionnaire</CardTitle>
          <CardDescription>
            Please answer based on your habits over the last month. For some questions, you may need to refer to your phone's 'Screen Time' (iOS) or 'Digital Wellbeing' (Android) data.
            <br />
            <em className="text-xs mt-2 block">This questionnaire is based on the dimensions of the Social Media Addiction Scale by Malhotra and Pattnaik (2023).</em>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="space-y-4">
            <div>
              <Label htmlFor="participantId" className="font-bold text-base">Participant ID</Label>
              <Input
                id="participantId"
                placeholder="Enter your assigned participant ID"
                value={participantId}
                onChange={(e) => setParticipantId(e.target.value)}
                className="mt-2"
                required
              />
            </div>
          </div>

          <Separator />

          <div className="space-y-8">
            {questions.map((q, index) => (
              <div key={q.id} className="space-y-4">
                <Label className="font-semibold text-base">{index + 1}. {q.text}</Label>
                <RadioGroup
                  className="flex flex-col space-y-2 md:flex-row md:space-y-0 md:items-center md:gap-x-8"
                  onValueChange={(value) => handleAnswerChange(q.id, value)}
                  value={answers[q.id]}
                >
                  {likertOptions.map(option => (
                    <div key={option.id} className="flex items-center space-x-2">
                      <RadioGroupItem value={option.id} id={`${q.id}-${option.id}`} />
                      <Label htmlFor={`${q.id}-${option.id}`} className="font-normal cursor-pointer">{option.label}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            ))}
          </div>

          <Separator />

          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <Smartphone className="h-5 w-5" />
              <h3 className="text-lg font-bold">Screen Time Report</h3>
            </div>

            <div className="bg-muted/50 p-4 rounded-lg text-sm text-muted-foreground">
              Please open your device settings and navigate to <strong>Screen Time</strong> (iOS) or <strong>Digital Wellbeing</strong> (Android).
              View your data for the <strong>last full week</strong>.
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="tiktok-time">TikTok Time (e.g. 5h 30m)</Label>
                <Input
                  id="tiktok-time"
                  placeholder="0h 0m"
                  value={screenTime.tiktok}
                  onChange={(e) => handleScreenTimeChange('tiktok', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="instagram-time">Instagram Time</Label>
                <Input
                  id="instagram-time"
                  placeholder="0h 0m"
                  value={screenTime.instagram}
                  onChange={(e) => handleScreenTimeChange('instagram', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="youtube-time">YouTube Time</Label>
                <Input
                  id="youtube-time"
                  placeholder="0h 0m"
                  value={screenTime.youtube}
                  onChange={(e) => handleScreenTimeChange('youtube', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="snapchat-time">Snapchat Time</Label>
                <Input
                  id="snapchat-time"
                  placeholder="0h 0m"
                  value={screenTime.snapchat}
                  onChange={(e) => handleScreenTimeChange('snapchat', e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-4 pt-4">
              <Label>What percentage of your time on these apps is spent watching short-form videos (Reels, TikToks, Shorts)?</Label>
              <div className="flex items-center gap-4">
                <span className="font-bold w-12">{shortFormPercentage[0]}%</span>
                <Slider
                  value={shortFormPercentage}
                  onValueChange={setShortFormPercentage}
                  max={100}
                  step={5}
                  className="flex-1"
                />
              </div>
              <p className="text-xs text-muted-foreground">Estimate to the best of your ability.</p>
            </div>

            <div className="space-y-2 pt-4">
              <Label>Upload Screen Time Screenshot (Optional)</Label>
              <div className="flex items-center gap-4">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleScreenshotUpload}
                  className="cursor-pointer"
                />
              </div>
              {screenshot && (
                <p className="text-xs text-green-600 font-medium flex items-center gap-1">
                  <Upload className="h-3 w-3" /> Image attached successfully
                </p>
              )}
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button className="w-full" onClick={handleSubmit} disabled={!canSubmit || submissionState === 'submitting'}>
            {submissionState === 'submitting' ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : "Submit Responses"}
          </Button>
        </CardFooter>
      </Card>
    </main>
  );
}

export default function QuestionnairePage() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>}>
      <QuestionnaireContent />
    </Suspense>
  );
}
