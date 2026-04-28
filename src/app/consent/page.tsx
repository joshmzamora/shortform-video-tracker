"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Loader2 } from 'lucide-react';
import { saveConsentData, createParticipantId } from './actions';
import { useSession } from '@/lib/session-context';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function ConsentPage() {
  const router = useRouter();
  const { setParticipantId: setContextParticipantId, setConsent } = useSession();

  const [agreed, setAgreed] = useState(false);
  const [parentalConsentAgreed, setParentalConsentAgreed] = useState(false);
  const [participantId, setParticipantId] = useState('');
  const [participantName, setParticipantName] = useState('');
  const [isHighSchoolStudent, setIsHighSchoolStudent] = useState(false);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const currentDate = new Date().toLocaleDateString();
  const { toast } = useToast();

  const handleContinue = async () => {
    if (agreed && parentalConsentAgreed && (isAnonymous || participantName.trim()) && isHighSchoolStudent && !isLoading) {
      setIsLoading(true);

      const newParticipantId = await createParticipantId();
      setParticipantId(newParticipantId);

      const consentData = {
        participantId: newParticipantId,
        participantName: isAnonymous ? 'Anonymous' : participantName.trim(),
        parentalConsentAgreed,
        agreed,
        timestamp: new Date().toISOString(),
        isHighSchoolStudent,
        isAnonymous,
      };

      // 1. Update In-Memory Session Context (Secure, non-persistent)
      setContextParticipantId(newParticipantId);
      setConsent(consentData);

      // 2. Transmit to Server Immediately
      let serverSuccess = false;
      try {
        const result = await saveConsentData(consentData);
        serverSuccess = result.success;
      } catch (e) {
        console.warn("Server transmission failed");
      }

      // 3. Fallback Transmission: Secure Download
      if (!serverSuccess) {
        const blob = new Blob([JSON.stringify(consentData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `consent-${newParticipantId}.json`;
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
          title: "Results Submitted",
          description: "Joshua Zamora has finished conducting AP Research, but thank you for submitting and testing this out.",
        });
      }

      setIsLoading(false);
      setShowSuccessDialog(true);
    }
  };

  const canContinue = agreed && parentalConsentAgreed && (isAnonymous || participantName.trim() !== '') && isHighSchoolStudent;

  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-4 md:p-8">
      <AlertDialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <AlertDialogContent className="max-w-lg">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl">Results Submitted</AlertDialogTitle>
            <AlertDialogDescription className="space-y-4 pt-4 text-left">
              <div className="bg-muted p-4 rounded-md border">
                <p className="font-semibold text-foreground">Your Participant ID is: <span className="font-bold text-primary text-lg tracking-wider">{participantId}</span></p>
                <p className="text-sm mt-1 text-muted-foreground">Please save this. You will need it for the next steps.</p>
              </div>

              <div className="space-y-2">
                <p>Joshua Zamora has finished conducting AP Research, but thank you for submitting and testing this out.</p>
                <p className="text-sm text-muted-foreground pt-2">You can still continue to the questionnaire or close this window and come back later.</p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="sm:justify-start gap-2 pt-4">
            <Button onClick={() => router.push(`/questionnaire?participantId=${participantId}`)}>
              Continue to Questionnaire
            </Button>
            <Button variant="outline" onClick={() => setShowSuccessDialog(false)}>
              Close & Continue Later
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Card className="w-full max-w-4xl shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-headline text-center">Informed Consent Form</CardTitle>
          <CardDescription className="text-center">
            The Relationship Between Short-Form Video Content and Social Media Addiction
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800 flex items-start">
            <div className="mr-3 mt-0.5">⚠️</div>
            <div>
              <strong>Action Required:</strong> Please ensure your "Screen Time" (iOS) or "Digital Wellbeing" (Android) feature is enabled on your device. This will be needed immediately before the experiment begins.
            </div>
          </div>

          <ScrollArea className="h-[50vh] w-full rounded-md border p-4">
            <div className="space-y-6 text-sm">
              <div>
                <h3 className="font-semibold">Principle Investigator, Affiliation and Contact Information:</h3>
                <p>Joshua Zamora, Barbers Hill High School, (832) 984-2275</p>
              </div>
              <div>
                <h3 className="font-semibold">Institutional Contact:</h3>
                <p>Institutional Review Board, Barbers Hill High School, (281) 576-2221</p>
              </div>

              <Separator />

              <div>
                <h3 className="font-bold mb-2">1. Introduction and Purpose of the Study</h3>
                <p>I want to understand if there is a link between what students watch on social media apps (like TikTok or Instagram Reels) and their feelings about using those apps. I am trying to find out if certain types of short videos (like funny clips, news clips, or aspirational clips) are more related to compulsive or "addictive" scrolling habits. The goal is to help counselors and educators give better, more specific advice to students instead of just saying "don't scroll."</p>
              </div>
              <div>
                <h3 className="font-bold mb-2">2. Description of the Research</h3>
                <p>When you enter into the program, you will be asked to complete a questionnaire. You will then be asked to participate in watching 10 minutes of short form video content. After you have completed the intervention, you will be asked to complete one more questionnaire.</p>
              </div>
              <div>
                <h3 className="font-bold mb-2">3. Subject Participation</h3>
                <p>We estimate that 20 participants who are Barbers Hill High School students will enroll in this study. Participants must have motor ability in both hands and can verbally communicate. Your participation will involve one visit, approximately 30 minutes in length.</p>
              </div>
              <div>
                <h3 className="font-bold mb-2">4. Potential Risks and Discomforts</h3>
                <p>There are no known major risks to this study. However, some participants may feel mild emotional discomfort. The questionaire asks questions about social media habits that might make some students feel self-conscious. The experiment includes content that could be perceived as negative or upsetting (like news clips or "doomscrolling" content).</p>
              </div>
              <div>
                <h3 className="font-bold mb-2">5. Potential Benefits</h3>
                <p>People who participate in this study may have a better understanding of additional treatment methods for short form video content specifically that enable individuals to experience and increase their overall sense of well being.</p>
              </div>
              <div>
                <h3 className="font-bold mb-2">6. Confidentiality:</h3>
                <p>Your responses and experiment results are completely anonymous. No personal identifying information will be collected except grade level. Data will be aggregated via statistical software. Quantitative and qualitative results will be shared with the AP Research department and College Board.</p>
              </div>
              <div>
                <h3 className="font-bold mb-2">7. Authorization</h3>
                <p>By signing this form, you authorize the use of any records, any observations, and findings found during the course of this study for education, publication and/or presentation.</p>
              </div>
              <div>
                <h3 className="font-bold mb-2">8. Compensation</h3>
                <p>Subjects will not be compensated for participation in this study.</p>
              </div>
              <div>
                <h3 className="font-bold mb-2">9. Voluntary Participation and Authorization</h3>
                <p>Your decision to participate in this study is completely voluntary. If you decide to not participate in this study, it will not affect the care, services, or benefits to which you are entitled.</p>
              </div>
              <div>
                <h3 className="font-bold mb-2">10. Withdrawal from the Study and/or Withdrawal of Authorization:</h3>
                <p>If you decide to participate in this study, you may withdraw from your participation at any time during the questionnaires and experiment without penalty. Any data collected before withdrawal will NOT be included in the study and destroyed.</p>
              </div>
              <div>
                <h3 className="font-bold mb-2">11. Cost/Reimbursements</h3>
                <p>There is no cost for participating or materials needed in this study. Transportation to and from Barbers Hill High School is required. Any medical expenses resulting from participation in this study will not be reimbursed by the investigators.</p>
              </div>
            </div>
          </ScrollArea>
          <div className="mt-6 space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox id="parent-consent" checked={parentalConsentAgreed} onCheckedChange={(checked) => setParentalConsentAgreed(checked === true)} />
              <Label htmlFor="parent-consent" className="font-bold cursor-pointer">I have obtained parental consent to participate in this study.</Label>
            </div>

            <Separator />

            <p>I voluntarily agree to participate in this research program and I understand that I will be given a copy of this signed Consent Form.</p>
            <div className="flex items-center space-x-2">
                <Checkbox id="is-high-school-student" checked={isHighSchoolStudent} onCheckedChange={(checked) => setIsHighSchoolStudent(checked === true)} />
                <Label htmlFor="is-high-school-student" className="font-bold cursor-pointer">I am a high school student with experience with short form video content.</Label>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Checkbox id="consent-yes" checked={agreed} onCheckedChange={(checked) => setAgreed(checked === true)} />
                <Label htmlFor="consent-yes">Yes</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="consent-no" checked={!agreed} onCheckedChange={(checked) => setAgreed(checked !== true)} />
                <Label htmlFor="consent-no">No</Label>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
              <div className="space-y-2">
                <Label htmlFor="participant-name">Name of Participant (print):</Label>
                <Input id="participant-name" value={isAnonymous ? 'Anonymous' : participantName} onChange={(e) => setParticipantName(e.target.value)} placeholder="John Doe" disabled={isAnonymous} />
                <p className="text-sm text-muted-foreground">Signature: (type name to sign)</p>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="is-anonymous" checked={isAnonymous} onCheckedChange={(checked) => setIsAnonymous(checked === true)} />
                <Label htmlFor="is-anonymous" className="font-bold cursor-pointer">Remain Anonymous</Label>
              </div>
              <div className="space-y-2">
                <Label>Date:</Label>
                <Input value={currentDate} readOnly disabled />
              </div>
            </div>

            <p className="text-xs text-muted-foreground pt-4">
              Note: A copy of the signed, dated consent form must be kept by the Principle Investigator(s) and a copy must be given to the participant.
            </p>
          </div>
        </CardContent>
        <CardFooter>
          <Button className="w-full" onClick={handleContinue} disabled={!canContinue || isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              "I Agree, Continue to Experiment"
            )}
          </Button>
        </CardFooter>
      </Card>
    </main>
  );
}
