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
                <h3 className="font-bold">Principle Investigator:</h3>
                <p>Joshua Zamora</p>
                <p>Barbers Hill High School</p>
                <p>(832) 984-2275</p>
            </div>
            <div className="text-right">
                <h3 className="font-bold">Institutional Contact:</h3>
                <p>Institutional Review Board</p>
                <p>(281) 576-2221</p>
            </div>
            </div>

            <Separator className="my-4" />

            <div className="space-y-4 text-sm text-justify">
            <p><strong>1. Introduction and Purpose:</strong> I want to understand if there is a link between what students watch on social media apps and their feelings about using those apps.</p>

            <p><strong>2. Description:</strong> Participants will complete a questionnaire, watch 10 minutes of video content, and complete a final questionnaire.</p>

            <p><strong>3. Participation:</strong> Approx. 20 Barbers Hill High School students. One visit, ~30 mins.</p>

            <p><strong>4. Risks:</strong> Mild emotional discomfort possible due to self-reflection or content.</p>

            <p><strong>5. Benefits:</strong> Better understanding of treatment methods for short-form video addiction.</p>

            <p><strong>6. Confidentiality:</strong> Responses are anonymous. Data aggregated.</p>

            <p><strong>7. Authorization:</strong> By signing, you authorize use of records for education/publication.</p>

            <p><strong>8. Compensation:</strong> None.</p>

            <p><strong>9. Voluntary:</strong> Participation is voluntary. Refusal does not affect benefits.</p>

            <p><strong>10. Withdrawal:</strong> May withdraw at any time without penalty.</p>
            </div>

            <Separator className="my-8" />

            <div className="space-y-6 mt-8">
            <div className="flex items-center gap-2">
                <div className="h-5 w-5 border border-black flex items-center justify-center">
                {consent.parentalConsentAgreed ? "✓" : ""}
                </div>
                <span className="font-bold">I have obtained parental consent to participate in this study.</span>
            </div>

            <p>I voluntarily agree to participate in this research program and I understand that I will be given a copy of this signed Consent Form.</p>

            <div className="flex items-center gap-8">
                <div className="flex items-center gap-2">
                <div className="h-5 w-5 border border-black flex items-center justify-center">
                    {consent.agreed ? "✓" : ""}
                </div>
                <span>Yes, I agree</span>
                </div>
                <div className="flex items-center gap-2">
                <div className="h-5 w-5 border border-black flex items-center justify-center">
                    {!consent.agreed ? "✓" : ""}
                </div>
                <span>No</span>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-12 pt-8">
                <div>
                <p className="font-bold mb-2">Participant Name:</p>
                <div className="border-b border-black pb-1 font-mono text-lg">{consent.participantName}</div>
                </div>
                <div>
                <p className="font-bold mb-2">Participant ID:</p>
                <div className="border-b border-black pb-1 font-mono text-lg">{consent.participantId}</div>
                </div>

                <div>
                <p className="font-bold mb-2">Witness Name:</p>
                <div className="border-b border-black pb-1 font-mono text-lg">{consent.witnessName || "N/A"}</div>
                </div>
                <div>
                <p className="font-bold mb-2">Date:</p>
                <div className="border-b border-black pb-1 font-mono text-lg">{formattedDate}</div>
                </div>

                <div>
                <p className="font-bold mb-2">Person Obtaining Consent:</p>
                <div className="border-b border-black pb-1 font-mono text-lg">{consent.pocName || "N/A"}</div>
                </div>
                <div>
                <p className="font-bold mb-2">Date:</p>
                <div className="border-b border-black pb-1 font-mono text-lg">{formattedDate}</div>
                </div>
            </div>

            <div className="mt-12 text-xs text-gray-500">
                <p>Electronically signed and recorded at {new Date(consent.timestamp).toLocaleString()}</p>
                <p>ShortForm Video Tracker System v1.0</p>
            </div>
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
