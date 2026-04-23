'use client';

import { ProtectedRoute } from '@/components/protected-route';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, FileText, Settings, ShieldAlert, BadgeCheck, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { doc, setDoc, collection, query, where, onSnapshot, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';

export default function AdminDashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [repEmail, setRepEmail] = useState('');
  const [isAssigning, setIsAssigning] = useState(false);
  const [reps, setReps] = useState<any[]>([]);

  useEffect(() => {
    // Extra layer of protection: only admin@checkme.com can view this page
    if (!loading) {
      if (user?.email !== 'admin@checkme.com') {
        router.push('/'); // Kick out normal users
      } else {
        setIsCheckingAuth(false);
      }
    }
  }, [user, loading, router]);

  useEffect(() => {
    // Query users collection for anyone with role: 'representative'
    const q = query(collection(db, 'users'), where('role', '==', 'representative'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const repData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setReps(repData);
    });

    return () => unsubscribe();
  }, []);

  const handleAssignRep = async () => {
    if (!repEmail || !repEmail.includes('@')) {
      toast({
        title: 'Invalid Email',
        description: 'Please enter a valid email address.',
        variant: 'destructive'
      });
      return;
    }

    setIsAssigning(true);
    try {
      // Using email as the document ID for simple role lookups
      await setDoc(doc(db, 'users', repEmail.toLowerCase()), {
        role: 'representative',
        assignedBy: user?.email,
        assignedAt: new Date()
      }, { merge: true });

      toast({
        title: 'Success!',
        description: `${repEmail} is now a Mess Representative.`,
      });
      setRepEmail('');
    } catch (error) {
      console.error('Error assigning rep:', error);
      toast({
        title: 'Assignment Failed',
        description: 'Could not update user role. Check permissions.',
        variant: 'destructive'
      });
    } finally {
      setIsAssigning(false);
    }
  };

  const handleRemoveRep = async (email: string) => {
    try {
      // Instead of deleting the user doc completely, we just remove the role
      await updateDoc(doc(db, 'users', email), {
        role: null
      });
      toast({
        title: 'Role Removed',
        description: `${email} is no longer a representative.`
      });
    } catch (error) {
      console.error("Error removing rep:", error);
      toast({
        title: 'Error',
        description: 'Failed to remove representative.',
        variant: 'destructive'
      });
    }
  };

  if (loading || isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background p-4 md:p-6 lg:ml-64">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8 flex items-center gap-3">
            <ShieldAlert className="h-8 w-8 text-red-600" />
            <div>
              <h1 className="text-3xl font-bold">Admin Dashboard</h1>
              <p className="text-muted-foreground">Superuser controls and system management</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <Card className="border-t-4 border-t-yellow-500 hover:shadow-md transition-shadow flex flex-col">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <BadgeCheck className="h-5 w-5 text-yellow-500" /> Assign Mess Rep
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col flex-grow">
                <p className="text-sm text-muted-foreground mb-4">Grant a student permission to upload official menu PDFs.</p>
                <div className="flex gap-2 mb-6">
                  <Input 
                    placeholder="student@example.com" 
                    value={repEmail}
                    onChange={(e) => setRepEmail(e.target.value)}
                  />
                  <Button 
                    onClick={handleAssignRep} 
                    disabled={isAssigning}
                    className="bg-yellow-500 hover:bg-yellow-600 text-black"
                  >
                    {isAssigning ? 'Saving...' : 'Assign'}
                  </Button>
                </div>

                <div className="flex-grow">
                  <h4 className="text-sm font-semibold mb-3 border-b pb-2">Current Representatives</h4>
                  {reps.length === 0 ? (
                    <p className="text-sm text-muted-foreground italic">No representatives assigned yet.</p>
                  ) : (
                    <ul className="space-y-2">
                      {reps.map(rep => (
                        <li key={rep.id} className="flex items-center justify-between bg-zinc-50 p-2 rounded text-sm border">
                          <span className="truncate mr-2 font-medium">{rep.id}</span>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleRemoveRep(rep.id)}
                            className="h-8 w-8 text-red-500 hover:bg-red-50 hover:text-red-600"
                            title="Remove Role"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="border-t-4 border-t-blue-500 hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Users className="h-5 w-5 text-blue-500" /> User Management
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">View, add, or remove students and staff accounts.</p>
              </CardContent>
            </Card>

            <Card className="border-t-4 border-t-green-500 hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="h-5 w-5 text-green-500" /> System Logs
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Monitor system activity and attendance reports.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
