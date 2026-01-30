import { Storage } from '@/lib/storage';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const sessions = await Storage.Sessions.getAll();
  const questionnaires = await Storage.Questionnaires.getAll();

  // Helper to format date
  const formatDate = (iso: string) => new Date(iso).toLocaleString();

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
      
      <Tabs defaultValue="questionnaires" className="w-full">
        <TabsList>
          <TabsTrigger value="questionnaires">Questionnaires ({questionnaires.length})</TabsTrigger>
          <TabsTrigger value="sessions">Sessions ({sessions.length})</TabsTrigger>
        </TabsList>
        
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
