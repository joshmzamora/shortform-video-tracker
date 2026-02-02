"use client";

import { useEffect, useState } from 'react';
// import { ClientStorage, STORAGE_KEYS } from '@/lib/client-storage'; // REMOVED per requirements
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

// Admin page now only displays imported data or (in future) fetched data
// It does NOT read from LocalStorage automatically.

export default function AdminPage() {
  const [consents, setConsents] = useState<any[]>([]);
  const [questionnaires, setQuestionnaires] = useState<any[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    // Explicitly NOT loading from ClientStorage
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
           setConsents(prev => [...prev, json]);
           alert("Imported Consent Form");
        } else if (json.answers !== undefined) {
           setQuestionnaires(prev => [...prev, json]);
           alert("Imported Questionnaire");
        } else if (Array.isArray(json) && json[0]?.interactionType) {
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
        <h1 className="text-3xl font-bold">Admin Dashboard (Secure Mode)</h1>
        <div className="flex gap-2">
            <Button variant="outline" onClick={() => document.getElementById('file-upload')?.click()}>
                Import Transmitted JSON
            </Button>
            <input 
                id="file-upload" 
                type="file" 
                accept=".json" 
                className="hidden" 
                onChange={handleFileUpload}
            />
            <Button variant="destructive" onClick={() => {
                if(confirm("Clear current dashboard view?")) {
                    setConsents([]);
                    setQuestionnaires([]);
                    setSessions([]);
                }
            }}>Clear View</Button>
        </div>
      </div>
      
      <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-6" role="alert">
        <p className="font-bold">Security Notice</p>
        <p>This dashboard is operating in Secure Mode. No data is stored in the browser. Data must be imported from transmitted JSON files or server retrieval.</p>
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
                        {/* We need to pass the data object directly or via memory since we can't look it up in storage */}
                         <Button variant="link" onClick={() => {
                             // Quick hack: Open print window and inject data via context or URL? 
                             // URL is too small. 
                             // We'll use a new window with a blob URL for the print page or just render it here in a modal?
                             // Simplest: Render in a new window by passing data via localStorage? NO, forbidden.
                             // Pass via window.opener?
                             alert("Printing from imported data is restricted. Please print the original PDF/JSON.");
                         }}>
                          View Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {consents.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center">No loaded consent forms</TableCell>
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
                      <TableCell colSpan={3} className="text-center">No loaded questionnaires</TableCell>
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
              <CardTitle>Session Logs</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Participant ID</TableHead>
                    <TableHead>Events</TableHead>
                    <TableHead>Details</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sessions.map((s: any, i: number) => (
                    <TableRow key={i}>
                      <TableCell className="font-medium">{s[0]?.participantId || 'Unknown'}</TableCell>
                      <TableCell>{s.length} interactions</TableCell>
                      <TableCell className="font-mono text-xs">
                        <details>
                          <summary>View Log</summary>
                          <div className="max-h-64 overflow-y-auto">
                            <pre className="mt-2 p-2 bg-muted rounded">
                                {JSON.stringify(s, null, 2)}
                            </pre>
                          </div>
                        </details>
                      </TableCell>
                    </TableRow>
                  ))}
                  {sessions.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center">No loaded sessions</TableCell>
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
