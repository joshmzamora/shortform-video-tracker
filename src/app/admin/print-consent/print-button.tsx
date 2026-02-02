"use client";

import { Button } from '@/components/ui/button';
import { Printer } from 'lucide-react';

export default function PrintButton() {
  return (
    <Button onClick={() => window.print()} className="print-button">
      <Printer className="mr-2 h-4 w-4" />
      Print / Save as PDF
    </Button>
  );
}
