'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, doc, setDoc, onSnapshot } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Check, X, Search, Loader2, Edit2, Save } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { updateDoc } from 'firebase/firestore';
import * as XLSX from 'xlsx';

interface Student {
  email: string;
  name: string;
  room: string;
}

export function AttendanceMarker() {
  const [students, setStudents] = useState<Student[]>([]);
  const [attendance, setAttendance] = useState<Record<string, 'Present' | 'Absent'>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingRoom, setEditingRoom] = useState<string | null>(null); // email of student being edited
  const [tempRoom, setTempRoom] = useState('');
  const { toast } = useToast();
  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch All Students
        const studentSnap = await getDocs(query(collection(db, 'users'), where('role', '==', 'student')));
        const studentList = studentSnap.docs.map(d => ({ email: d.id, ...d.data() } as Student));
        setStudents(studentList);

        // Fetch Today's Attendance if exists
        const attRef = doc(db, 'attendance', today);
        const unsubscribe = onSnapshot(attRef, (snap) => {
          if (snap.exists()) {
            setAttendance(snap.data().records || {});
          }
        });

        setLoading(false);
        return unsubscribe;
      } catch (error) {
        console.error("Error fetching attendance data:", error);
        setLoading(false);
      }
    };

    fetchData();
  }, [today]);

  const toggleAttendance = async (email: string, status: 'Present' | 'Absent') => {
    const newAttendance = { ...attendance, [email]: status };
    setAttendance(newAttendance);

    // Save immediately or wait for Save All button? 
    // Usually immediate is better for real-time, but batch is safer.
    // Let's do batch for better UX (less toast noise).
  };

  const saveTodayAttendance = async () => {
    setSaving(true);
    try {
      // 1. Save Group Attendance (for Warden)
      await setDoc(doc(db, 'attendance', today), {
        date: today,
        records: attendance,
        updatedAt: new Date().toISOString()
      }, { merge: true });

      // 2. Save Individual History (for Student Dashboard)
      // We only save for those who were actually marked in this session
      const updatePromises = Object.entries(attendance).map(([email, status]) => {
        return setDoc(doc(db, 'users', email, 'attendance_history', today), {
            date: today,
            status,
            recordedAt: new Date().toISOString()
        });
      });
      
      await Promise.all(updatePromises);

      toast({
        title: 'Attendance Saved!',
        description: `Records for ${today} updated successfully.`,
      });
    } catch (error) {
      console.error("Error saving attendance:", error);
      toast({
        title: 'Save Failed',
        description: 'Check your permissions.',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateRoom = async (email: string) => {
    if (!tempRoom.trim()) return;
    try {
        await updateDoc(doc(db, 'users', email), {
            room: tempRoom.trim()
        });
        setStudents(prev => prev.map(s => s.email === email ? { ...s, room: tempRoom.trim() } : s));
        setEditingRoom(null);
        toast({ title: 'Room Updated', description: `Student assigned to ${tempRoom}` });
    } catch (error) {
        toast({ title: 'Update Failed', variant: 'destructive' });
    }
  };

  const downloadXLSX = () => {
    const data = filteredStudents.map(s => ({
        'Student Name': s.name,
        'Email': s.email,
        'Room': s.room || 'N/A',
        'Status': attendance[s.email] || 'Not Marked'
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Attendance");
    
    // Auto-size columns
    const max_width = data.reduce((w, r) => Math.max(w, r['Student Name'].length), 10);
    worksheet["!cols"] = [ { wch: max_width + 5 }, { wch: 30 }, { wch: 10 }, { wch: 15 } ];

    XLSX.writeFile(workbook, `Attendance_Report_${today}.xlsx`);
    
    toast({
        title: 'Report Downloaded',
        description: `File saved as Attendance_Report_${today}.xlsx`
    });
  };

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.room.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin h-8 w-8 text-blue-500" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-4 px-4">
        <div className="relative w-full md:max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <Input 
                placeholder="Search by name, email or room..." 
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
        </div>
        <div className="flex gap-2 w-full md:w-auto">
            <Button 
                variant="outline"
                onClick={downloadXLSX}
                className="border-blue-200 text-blue-700 hover:bg-blue-50"
            >
                Download Sheet (.xlsx)
            </Button>
            <Button 
                onClick={saveTodayAttendance} 
                disabled={saving}
                className="bg-blue-600 hover:bg-blue-700 grow md:grow-0"
            >
                {saving ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : 'Save Attendance'}
            </Button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-zinc-50 border-b border-zinc-200">
              <th className="p-4 text-xs font-bold uppercase tracking-wider text-zinc-500">Student Info</th>
              <th className="p-4 text-xs font-bold uppercase tracking-wider text-zinc-500">Room</th>
              <th className="p-4 text-xs font-bold uppercase tracking-wider text-zinc-500 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {filteredStudents.map((student) => (
              <tr key={student.email} className="hover:bg-zinc-50/50 transition-colors">
                <td className="p-4">
                  <p className="font-bold text-zinc-900">{student.name}</p>
                  <p className="text-xs text-zinc-500">{student.email}</p>
                </td>
                <td className="p-4">
                  {editingRoom === student.email ? (
                    <div className="flex items-center gap-1">
                        <Input 
                            value={tempRoom}
                            onChange={(e) => setTempRoom(e.target.value)}
                            className="h-8 w-24 text-xs"
                            placeholder="Room #"
                            autoFocus
                        />
                        <button onClick={() => handleUpdateRoom(student.email)} className="p-1 text-green-600">
                            <Save className="h-4 w-4" />
                        </button>
                    </div>
                  ) : (
                    <div 
                        className="group flex items-center gap-2 cursor-pointer"
                        onClick={() => {
                            setEditingRoom(student.email);
                            setTempRoom(student.room || 'Not Assigned');
                        }}
                    >
                        <span className="bg-zinc-100 px-2 py-1 rounded text-xs font-medium group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                            {student.room || 'Not Assigned'}
                        </span>
                        <Edit2 className="h-3 w-3 text-zinc-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  )}
                </td>
                <td className="p-4">
                  <div className="flex justify-center gap-2">
                    <button 
                        onClick={() => toggleAttendance(student.email, 'Present')}
                        className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                            attendance[student.email] === 'Present' 
                            ? 'bg-green-500 text-white shadow-md' 
                            : 'bg-zinc-100 text-zinc-400 hover:bg-green-50'
                        }`}
                    >
                        <Check className="h-3 w-3" /> Present
                    </button>
                    <button 
                        onClick={() => toggleAttendance(student.email, 'Absent')}
                        className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                            attendance[student.email] === 'Absent' 
                            ? 'bg-red-500 text-white shadow-md' 
                            : 'bg-zinc-100 text-zinc-400 hover:bg-red-50'
                        }`}
                    >
                        <X className="h-3 w-3" /> Absent
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
