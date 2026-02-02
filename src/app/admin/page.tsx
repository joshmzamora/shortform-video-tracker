"use client";

import { useEffect, useState } from 'react';
import { ClientStorage, STORAGE_KEYS } from '@/lib/client-storage';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export default function AdminPage() {
  const [consents, setConsents] = useState<any[]>([]);
  const [questionnaires, setQuestionnaires] = useState<any[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    // Load data from LocalStorage
    setConsents(ClientStorage.get(STORAGE_KEYS.CONSENTS));
    setQuestionnaires(ClientStorage.get(STORAGE_KEYS.QUESTIONNAIRES));
    setSessions(ClientStorage.get(STORAGE_KEYS.SESSIONS));
  }, []);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target?.result as string);
        // Heuristics to determine type
        if (json.agreed !== undefined) {
           ClientStorage.save(STORAGE_KEYS.CONSENTS, json);
           setConsents(prev => [...prev, json]);
           alert("Imported Consent Form");
        } else if (json.answers !== undefined) {
           ClientStorage.save(STORAGE_KEYS.QUESTIONNAIRES, json);
           setQuestionnaires(prev => [...prev, json]);
           alert("Imported Questionnaire");
        } else if (Array.isArray(json) && json[0]?.interactionType) {
           ClientStorage.save(STORAGE_KEYS.SESSIONS, json);
           setSessions(prev => [...prev, json]);
           alert("Imported Session");
        } else {
           alert("Unknown JSON format");
        }
      } catch (err) {
        alert("Failed to parse JSON");
      }
    };
    reader.readAsText(file);
  };

  // Helper to format date
  const formatDate = (iso: string) => {
      try {
          return new Date(iso).toLocaleString();
      } catch (e) {
          return 'Invalid Date';
      }
  };

  if (!isClient) return <div className="p-10">Loading Admin Dashboard...</div>;

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Admin Dashboard (Local Storage)</h1>
        <div className="flex gap-2">
            <Button variant="outline" onClick={() => document.getElementById('file-upload')?.click()}>
                Import JSON Data
            </Button>
            <input 
                id="file-upload" 
                type="file" 
                accept=".json" 
                className="hidden" 
                onChange={handleFileUpload}
            />
            <Button variant="destructive" onClick={() => {
                if(confirm("Clear all local data?")) {
                    ClientStorage.clear(STORAGE_KEYS.CONSENTS);
                    ClientStorage.clear(STORAGE_KEYS.QUESTIONNAIRES);
                    ClientStorage.clear(STORAGE_KEYS.SESSIONS);
                    window.location.reload();
                }
            }}>Clear Data</Button>
        </div>
      </div>

      <Tabs defaultValue="questionnaires" className="w-full">
        <TabsList>
          <TabsTrigger value="consents">Consents ({consents.length})</TabsTrigger>
          <TabsTrigger value="questionnaires">Questionnaires ({questionnaires.length})</TabsTrigger>
          <TabsTrigger value="sessions">Sessions ({sessions.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="consents">
          <Card>
            <CardHeader>
              <CardTitle>Signed Consent Forms</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Participant ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Parental Consent</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {consents.map((c: any, i: number) => (
                    <TableRow key={i}>
                      <TableCell className="font-medium">{c.participantId}</TableCell>
                      <TableCell>{c.participantName}</TableCell>
                      <TableCell>{formatDate(c.timestamp)}</TableCell>
                      <TableCell>{c.parentalConsentAgreed ? "Yes" : "No"}</TableCell>
                      <TableCell>
                        <a
                          href={`/admin/print-consent?id=${c.participantId}`}
                          target="_blank"
                          className="text-blue-500 hover:underline text-sm"
                        >
                          View / Print PDF
                        </a>
                      </TableCell>
                    </TableRow>
                  ))}
                  {consents.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center">No consent forms found</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="questionnaires">
          <Card>
            <CardHeader>
              <CardTitle>Questionnaire Responses</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Participant ID</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Answers (JSON)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {questionnaires.map((q: any, i: number) => (
                    <TableRow key={i}>
                      <TableCell className="font-medium">{q.participantId}</TableCell>
                      <TableCell>{formatDate(q.timestamp)}</TableCell>
                      <TableCell className="font-mono text-xs">
                        <details>
                          <summary>View Answers</summary>
                          <pre className="mt-2 p-2 bg-muted rounded">
                            {JSON.stringify(q.answers, null, 2)}
                          </pre>
                        </details>
                      </TableCell>
                    </TableRow>
                  ))}
                  {questionnaires.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center">No data found</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sessions">
          <Card>
            <CardHeader>
              <CardTitle>Session Data</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Participant ID</TableHead>
                    <TableHead>Events Count</TableHead>
                    <TableHead>First Event</TableHead>
                    <TableHead>Data</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sessions.map((session: any[], i: number) => {
                    // Session is an array of interactions
                    const firstEvent = session[0];
                    const pid = firstEvent?.participantId || 'Unknown';
                    const timestamp = firstEvent?.timestamp || '';

                    return (
                      <TableRow key={i}>
                        <TableCell className="font-medium">{pid}</TableCell>
                        <TableCell>{session.length}</TableCell>
                        <TableCell>{timestamp ? formatDate(timestamp) : 'N/A'}</TableCell>
                        <TableCell className="font-mono text-xs">
                          <details>
                            <summary>View Events</summary>
                            <div className="max-h-60 overflow-y-auto mt-2">
                              <pre className="p-2 bg-muted rounded">
                                {JSON.stringify(session, null, 2)}
                              </pre>
                            </div>
                          </details>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {sessions.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center">No data found</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
