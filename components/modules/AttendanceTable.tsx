import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CalendarDays } from 'lucide-react';

interface AttendanceRecord {
  date: string;
  status: 'Present' | 'Absent';
}

interface AttendanceTableProps {
  title?: string;
  records: AttendanceRecord[];
  className?: string;
}

export function AttendanceTable({ 
  title = 'My Attendance', 
  records, 
  className 
}: AttendanceTableProps) {
  return (
    <Card className={`h-full border-2 border-gray-200 ${className}`}>
      <CardHeader>
        <div className="flex items-center gap-2">
          <CalendarDays className="h-5 w-5" />
          <CardTitle>{title}</CardTitle>
        </div>
        <p className="text-sm text-muted-foreground">Attendance record</p>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {records.map((record, index) => (
              <TableRow key={index}>
                <TableCell>{record.date}</TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    record.status === 'Present' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {record.status}
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}