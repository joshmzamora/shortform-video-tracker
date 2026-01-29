"use client";

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft } from 'lucide-react';

export default function ConsentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const participantId = searchParams.get('participantId');
  const isExperimentFlow = !!participantId;
  
  const [agreed, setAgreed] = useState(false);
  const [participantName, setParticipantName] = useState('');
  const [witnessName, setWitnessName] = useState('');
  const [pocName, setPocName] = useState('');
  const [currentDate, setCurrentDate] = useState('');

  useEffect(() => {
    setCurrentDate(new Date().toLocaleDateString());
  }, []);

  const handleContinue = () => {
    if (agreed && participantId && participantName.trim()) {
      router.push(`/session?participantId=${encodeURIComponent(participantId)}`);
    }
  };
  
  const canContinue = isExperimentFlow && agreed && participantName.trim() !== '';

  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-4 md:p-8">
      <Card className="w-full max-w-4xl shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-headline text-center">Informed Consent Form</CardTitle>
          <CardDescription className="text-center">
            The Relationship Between Short-Form Video Content and Social Media Addiction
          </CardDescription>
        </CardHeader>
        <CardContent>
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
          {isExperimentFlow ? (
            <div className="mt-6 space-y-4">
              <p>I voluntarily agree to participate in this research program and I understand that I will be given a copy of this signed Consent Form.</p>
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
                      <Input id="participant-name" value={participantName} onChange={(e) => setParticipantName(e.target.value)} placeholder="John Doe" />
                      <p className="text-sm text-muted-foreground">Signature: (type name to sign)</p>
                  </div>
                   <div className="space-y-2">
                      <Label>Date:</Label>
                      <Input value={currentDate} readOnly disabled />
                  </div>
                   <div className="space-y-2">
                      <Label htmlFor="witness-name">Name of Witness (print):</Label>
                      <Input id="witness-name" value={witnessName} onChange={(e) => setWitnessName(e.target.value)} placeholder="Jane Smith" />
                      <p className="text-sm text-muted-foreground">Signature: (type name to sign)</p>
                  </div>
                   <div className="space-y-2">
                      <Label>Date:</Label>
                      <Input value={currentDate} readOnly disabled />
                  </div>
                  <div className="space-y-2">
                      <Label htmlFor="poc-name">Person Obtaining Consent:</Label>
                      <Input id="poc-name" value={pocName} onChange={(e) => setPocName(e.target.value)} placeholder="Dr. Investigator" />
                      <p className="text-sm text-muted-foreground">Signature: (type name to sign)</p>
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
          ) : (
            <div className="mt-6 text-center text-muted-foreground">
                <p>This is a preview of the consent form. To participate in the experiment, please start from the main menu.</p>
            </div>
          )}
        </CardContent>
        <CardFooter>
            {isExperimentFlow ? (
                <Button className="w-full" onClick={handleContinue} disabled={!canContinue}>
                    I Agree, Continue to Experiment
                </Button>
            ) : (
                <Button className="w-full" variant="outline" onClick={() => router.push('/')}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Main Menu
                </Button>
            )}
        </CardFooter>
      </Card>
    </main>
  );
}
