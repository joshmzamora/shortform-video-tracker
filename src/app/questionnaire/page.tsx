"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { saveQuestionnaireData } from './actions';
import { Loader2, PartyPopper } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';

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

export default function QuestionnairePage() {
  const { toast } = useToast();
  const [participantId, setParticipantId] = useState('');
  const [answers, setAnswers] = useState<{[key: string]: string}>({});
  const [parentConsent, setParentConsent] = useState(false);
  const [submissionState, setSubmissionState] = useState<'idle' | 'submitting' | 'submitted'>('idle');

  const handleAnswerChange = (questionId: string, value: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };
  
  const allQuestionsAnswered = Object.keys(answers).length === questions.length;
  const canSubmit = participantId.trim() !== '' && allQuestionsAnswered && parentConsent;

  const handleSubmit = async () => {
    if (!canSubmit) {
        toast({
            variant: "destructive",
            title: "Incomplete Form",
            description: "Please enter your Participant ID, confirm parental consent, and answer all questions before submitting.",
        });
        return;
    }
    
    setSubmissionState('submitting');

    const dataToSave = {
      participantId: participantId.trim(),
      answers,
      parentConsent,
      timestamp: new Date().toISOString(),
    };

    const result = await saveQuestionnaireData(dataToSave);

    if (result.success) {
      setSubmissionState('submitted');
    } else {
      setSubmissionState('idle');
      toast({
        variant: "destructive",
        title: "Submission Error",
        description: result.message || "Could not save your responses. Please try again.",
      });
    }
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
              <CardDescription>Your responses have been successfully recorded. You may now close this window.</CardDescription>
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
                <div className="flex items-center space-x-2">
                    <Checkbox id="parent-consent" checked={parentConsent} onCheckedChange={(checked) => setParentConsent(checked === true)} />
                    <Label htmlFor="parent-consent" className="font-bold cursor-pointer">I have obtained parental consent to participate in this study.</Label>
                </div>
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
