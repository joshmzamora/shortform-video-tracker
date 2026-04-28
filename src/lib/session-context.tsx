"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';

// Define types for our data
interface ConsentData {
  participantId: string;
  participantName: string;
  witnessName?: string;
  pocName?: string;
  parentalConsentAgreed: boolean;
  agreed: boolean;
  timestamp: string;
}

interface QuestionnaireData {
  participantId: string;
  answers: { [key: string]: string };
  screenTime: {
    tiktok: string;
    instagram: string;
    youtube: string;
    snapchat: string;
  };
  shortFormPercentage: number;
  screenTimeScreenshot?: string;
  timestamp: string;
}

interface SessionData {
  videoId: string;
  interactionType: 'view' | 'like' | 'skip' | 'comment' | 'share';
  watchTimeMs: number;
  participantId: string;
  genre: string;
  timestamp: string;
}

interface SessionContextType {
  participantId: string | null;
  setParticipantId: (id: string) => void;
  consent: ConsentData | null;
  setConsent: (data: ConsentData) => void;
  questionnaire: QuestionnaireData | null;
  setQuestionnaire: (data: QuestionnaireData) => void;
  sessionEvents: SessionData[];
  addSessionEvent: (event: SessionData) => void;
  clearSession: () => void;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [participantId, setParticipantId] = useState<string | null>(null);
  const [consent, setConsent] = useState<ConsentData | null>(null);
  const [questionnaire, setQuestionnaire] = useState<QuestionnaireData | null>(null);
  const [sessionEvents, setSessionEvents] = useState<SessionData[]>([]);

  const addSessionEvent = (event: SessionData) => {
    setSessionEvents((prev) => [...prev, event]);
  };

  const clearSession = () => {
    setParticipantId(null);
    setConsent(null);
    setQuestionnaire(null);
    setSessionEvents([]);
  };

  return (
    <SessionContext.Provider
      value={{
        participantId,
        setParticipantId,
        consent,
        setConsent,
        questionnaire,
        setQuestionnaire,
        sessionEvents,
        addSessionEvent,
        clearSession,
      }}
    >
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
}
