"use client";

import { useEffect, useState, Suspense, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { getConsent } from '../actions';

// Import html2pdf dynamically to avoid SSR issues
// We'll use a dynamic import or require inside the handler

function PrintConsentContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const [consent, setConsent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!id) return;
    
    getConsent(id).then((result) => {
        if (result.success) {
            setConsent(result.data);
        }
        setLoading(false);
    });
  }, [id]);

  const handleDownloadPDF = async () => {
    if (!contentRef.current) return;
    
    // Dynamic import to avoid SSR errors
    const html2pdf = (await import('html2pdf.js')).default;
    
    const element = contentRef.current;
    const opt = {
      margin: 10,
      filename: `consent_${consent.participantId}_${consent.participantName.replace(/\s+/g, '_')}.pdf`,
      image: { type: 'jpeg' as const, quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm' as const, format: 'a4' as const, orientation: 'portrait' as const }
    };

    html2pdf().set(opt).from(element).save();
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) return <div className="p-8">Loading consent form...</div>;
  if (!consent) return <div className="p-8 text-red-500">Consent form not found.</div>;

  const formattedDate = new Date(consent.timestamp).toLocaleDateString();

  return (
    <div className="min-h-screen bg-white text-black p-8 max-w-4xl mx-auto print:p-0 print:max-w-none">
      <div className="mb-8 print:hidden flex justify-between items-center bg-gray-100 p-4 rounded-lg shadow-sm">
        <div>
            <h1 className="text-xl font-bold">Consent Form Viewer</h1>
            <p className="text-sm text-gray-500">Previewing form for {consent.participantName}</p>
        </div>
        <div className="flex gap-2">
            <Button onClick={handlePrint} variant="outline">
              Print / Save as PDF
            </Button>
            <Button onClick={handleDownloadPDF} className="bg-blue-600 hover:bg-blue-700 text-white">
              Download PDF File
            </Button>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
        @media print {
          .print\\:hidden { display: none !important; }
          body { font-size: 12pt; }
        }
      `}} />

      {/* The Printable Content */}
      <div ref={contentRef} className="bg-white p-8 border print:border-0 shadow-lg print:shadow-none">
        <div className="space-y-6">
            <div className="text-center mb-8">
            <h2 className="text-2xl font-bold uppercase mb-2">Informed Consent Form</h2>
            <p className="text-lg italic">The Relationship Between Short-Form Video Content and Social Media Addiction</p>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm mb-6">
            <div>
                <h3 className="font-bold">Principle Investigator, Affiliation and Contact Information:</h3>
                <p>Joshua Zamora, Barbers Hill High School, (832) 984-2275</p>
            </div>
            <div className="text-right">
                <h3 className="font-bold">Institutional Contact:</h3>
                <p>Institutional Review Board, Barbers Hill High School, (281) 576-2221</p>
            </div>
            </div>
            
            <Separator className="my-4"/>

            <div className="space-y-4 text-sm">
                <div>
                    <h3 className="font-bold mb-1">1. Introduction and Purpose of the Study</h3>
                    <p>I want to understand if there is a link between what students watch on social media apps (like TikTok or Instagram Reels) and their feelings about using those apps. I am trying to find out if certain types of short videos (like funny clips, news clips, or aspirational clips) are more related to compulsive or "addictive" scrolling habits. The goal is to help counselors and educators give better, more specific advice to students instead of just saying "don't scroll."</p>
                </div>
                <div>
                    <h3 className="font-bold mb-1">2. Description of the Research</h3>
                    <p>When you enter into the program, you will be asked to complete a questionnaire. You will then be asked to participate in watching 10 minutes of short form video content. After you have completed the intervention, you will be asked to complete one more questionnaire.</p>
                </div>
                <div>
                    <h3 className="font-bold mb-1">3. Subject Participation</h3>
                    <p>We estimate that 20 participants who are Barbers Hill High School students will enroll in this study. Participants must have motor ability in both hands and can verbally communicate. Your participation will involve one visit, approximately 30 minutes in length.</p>
                </div>
                <div>
                    <h3 className="font-bold mb-1">4. Potential Risks and Discomforts</h3>
                    <p>There are no known major risks to this study. However, some participants may feel mild emotional discomfort. The questionaire asks questions about social media habits that might make some students feel self-conscious. The experiment includes content that could be perceived as negative or upsetting (like news clips or "doomscrolling" content).</p>
                </div>
                <div>
                    <h3 className="font-bold mb-1">5. Potential Benefits</h3>
                    <p>People who participate in this study may have a better understanding of additional treatment methods for short form video content specifically that enable individuals to experience and increase their overall sense of well being.</p>
                </div>
                <div>
                    <h3 className="font-bold mb-1">6. Confidentiality:</h3>
                    <p>Your responses and experiment results are completely anonymous. No personal identifying information will be collected except grade level. Data will be aggregated via statistical software. Quantitative and qualitative results will be shared with the AP Research department and College Board.</p>
                </div>
                <div>
                    <h3 className="font-bold mb-1">7. Authorization</h3>
                    <p>By signing this form, you authorize the use of any records, any observations, and findings found during the course of this study for education, publication and/or presentation.</p>
                </div>
                <div>
                    <h3 className="font-bold mb-1">8. Compensation</h3>
                    <p>Subjects will not be compensated for participation in this study.</p>
                </div>
                <div>
                    <h3 className="font-bold mb-1">9. Voluntary Participation and Authorization</h3>
                    <p>Your decision to participate in this study is completely voluntary. If you decide to not participate in this study, it will not affect the care, services, or benefits to which you are entitled.</p>
                </div>
                <div>
                    <h3 className="font-bold mb-1">10. Withdrawal from the Study and/or Withdrawal of Authorization:</h3>
                    <p>If you decide to participate in this study, you may withdraw from your participation at any time during the questionnaires and experiment without penalty. Any data collected before withdrawal will NOT be included in the study and destroyed.</p>
                </div>
            </div>

            <Separator className="my-6"/>

            <div className="space-y-4">
                <div className="flex items-center gap-2">
                    <div className="h-4 w-4 border border-black flex items-center justify-center text-xs">
                        {consent.agreed ? 'X' : ''}
                    </div>
                    <p className="text-sm font-bold">
                        I have read and understand the above information and agree to participate in the study.
                    </p>
                </div>
                
                {consent.parentalConsentAgreed && (
                    <div className="flex items-center gap-2">
                         <div className="h-4 w-4 border border-black flex items-center justify-center text-xs">X</div>
                         <p className="text-sm font-bold">
                             I am under 18 and have obtained parental consent to participate.
                         </p>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-2 gap-8 mt-12">
                <div>
                    <div className="border-b border-black mb-2 pb-1 font-script text-lg">{consent.participantName}</div>
                    <p className="text-xs uppercase">Participant Signature</p>
                </div>
                <div>
                    <div className="border-b border-black mb-2 pb-1">{formattedDate}</div>
                    <p className="text-xs uppercase">Date</p>
                </div>
            </div>
            
            <div className="mt-8 text-xs text-gray-500">
                <p>Participant ID: {consent.participantId}</p>
                <p>Timestamp: {consent.timestamp}</p>
            </div>
        </div>
      </div>
    </div>
  );
}

export default function PrintConsentPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PrintConsentContent />
    </Suspense>
  );
}
