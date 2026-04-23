'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Users, UserCheck, UserX, Bell, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { AnalyticsChart } from '@/components/modules/AnalyticsChart';
import { db } from '@/lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { useEffect, useState } from 'react';

// Mock data for the warden dashboard
const studentsData = [
  { id: 1, name: 'John Doe', room: 'A-101', attendance: 'present' },
  { id: 2, name: 'Jane Smith', room: 'B-205', attendance: 'absent' },
  { id: 3, name: 'Robert Johnson', room: 'C-302', attendance: 'present' },
  { id: 4, name: 'Emily Davis', room: 'A-103', attendance: 'present' },
  { id: 5, name: 'Michael Wilson', room: 'B-207', attendance: 'absent' },
  { id: 6, name: 'Sarah Brown', room: 'C-301', attendance: 'present' },
  { id: 7, name: 'David Taylor', room: 'A-105', attendance: 'present' },
  { id: 8, name: 'Lisa Anderson', room: 'B-209', attendance: 'present' },
];

export default function WardenDashboard() {
  const { toast } = useToast();
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribePdf = onSnapshot(doc(db, 'menus', 'pdfContent'), (docSnap) => {
      if (docSnap.exists() && docSnap.data().url) {
        setPdfUrl(docSnap.data().url);
      }
    });
    return () => unsubscribePdf();
  }, []);
  
  // Calculate stats
  const totalStudents = studentsData.length;
  const presentCount = studentsData.filter(student => student.attendance === 'present').length;
  const absentCount = totalStudents - presentCount;

  const handleAttendanceToggle = (studentId: number, currentStatus: string) => {
    const newStatus = currentStatus === 'present' ? 'absent' : 'present';
    toast({
      title: 'Attendance Updated!',
      description: `Attendance for ${studentsData.find(s => s.id === studentId)?.name} marked as ${newStatus}.`,
    });
  };

  const handleNoticeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: 'Notice Sent!',
      description: 'Your notice has been broadcasted to all students.',
    });
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Warden Dashboard</h1>
          <p className="text-muted-foreground">Monitor and manage hostel operations</p>
        </div>

        {/* Official PDF Menu Notice */}
        {pdfUrl && (
          <div className="mb-6">
            <Alert className="border-blue-200 bg-blue-50 flex items-center justify-between p-4">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-600" />
                <AlertDescription className="text-blue-700 font-medium">
                  An official PDF menu has been uploaded by the Mess Representative.
                </AlertDescription>
              </div>
              <Button 
                variant="outline"
                className="text-blue-600 border-blue-200 hover:bg-blue-100"
                onClick={() => window.open(pdfUrl, '_blank')}
              >
                View PDF
              </Button>
            </Alert>
          </div>
        )}

        {/* Quick Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-blue-800">Total Students</CardTitle>
              <Users className="h-5 w-5 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalStudents}</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-green-800">Present Today</CardTitle>
              <UserCheck className="h-5 w-5 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{presentCount}</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-red-800">Absent Today</CardTitle>
              <UserX className="h-5 w-5 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{absentCount}</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Digital Attendance Tracker */}
          <div className="lg:col-span-1">
            <Card className="h-full border-2 border-gray-200">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <UserCheck className="h-5 w-5" />
                  <CardTitle>Digital Attendance Tracker</CardTitle>
                </div>
                <p className="text-sm text-muted-foreground">Mark attendance for students</p>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Room No.</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {studentsData.map((student) => (
                      <TableRow key={student.id}>
                        <TableCell className="font-medium">{student.name}</TableCell>
                        <TableCell>{student.room}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant={student.attendance === 'present' ? 'default' : 'outline'}
                              size="sm"
                              onClick={() => handleAttendanceToggle(student.id, student.attendance)}
                              className={student.attendance === 'present' 
                                ? 'bg-green-500 hover:bg-green-600' 
                                : 'bg-gray-100 hover:bg-gray-200 text-gray-800'}
                            >
                              Present
                            </Button>
                            <Button
                              variant={student.attendance === 'absent' ? 'default' : 'outline'}
                              size="sm"
                              onClick={() => handleAttendanceToggle(student.id, student.attendance)}
                              className={student.attendance === 'absent' 
                                ? 'bg-red-500 hover:bg-red-600' 
                                : 'bg-gray-100 hover:bg-gray-200 text-gray-800'}
                            >
                              Absent
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>

          {/* Broadcast Notice */}
          <div className="lg:col-span-1">
            <Card className="h-full border-2 border-dashed border-yellow-300">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  <CardTitle>Broadcast Notice</CardTitle>
                </div>
                <p className="text-sm text-muted-foreground">Send alerts to all students</p>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleNoticeSubmit}>
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="noticeTitle" className="block text-sm font-medium mb-1">
                        Title
                      </label>
                      <Input id="noticeTitle" placeholder="Enter notice title" />
                    </div>
                    <div>
                      <label htmlFor="noticeContent" className="block text-sm font-medium mb-1">
                        Content
                      </label>
                      <Textarea 
                        id="noticeContent" 
                        placeholder="Enter notice content" 
                        rows={6}
                      />
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full bg-yellow-500 hover:bg-yellow-600 text-black"
                    >
                      Send Notice
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}