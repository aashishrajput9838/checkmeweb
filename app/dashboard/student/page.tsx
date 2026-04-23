'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSearchParams } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Megaphone } from 'lucide-react';

// UI Components
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { UserAvatar } from '@/components/user-avatar';
import { AttendanceTable } from '@/components/modules/AttendanceTable';
import { FoodPoll } from '@/components/modules/FoodPoll';

// Dashboard Components
import { OverviewTab } from '@/components/dashboard/student/OverviewTab';
import { MenuTab } from '@/components/dashboard/student/MenuTab';
import { VotingTab } from '@/components/dashboard/student/VotingTab';
import { ReviewMenuModal } from '@/components/dashboard/student/ReviewMenuModal';

// Hooks & Services
import { useStudentData } from '@/hooks/dashboard/useStudentData';
import { useMessMenu } from '@/hooks/dashboard/useMessMenu';
import { useMonthlySurvey } from '@/hooks/dashboard/useMonthlySurvey';
import { messService } from '@/lib/services/messService';
import { utils, writeFile } from 'xlsx';

export default function StudentDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const currentTab = searchParams.get('tab') || 'overview';

  // Custom Hooks
  const { attendanceData, latestNotice, isRep } = useStudentData(user);
  const { todaysMenu, weeklyMenu, timings, loadingMenu, pdfUrl, activeMealInfo } = useMessMenu();
  const { activeSurvey, currentUserVote, surveySelections, isSubmittingVote, handleSurveySelect, submitVote } = useMonthlySurvey(user?.email!);

  // Local State for File Processing
  const [isProcessing, setIsProcessing] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [parsedMenu, setParsedMenu] = useState<any>(null);
  const [isReviewing, setIsReviewing] = useState(false);
  const [isSavingParsed, setIsSavingParsed] = useState(false);

  // Handlers
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setFile(e.target.files[0]);
  };

  const handleProcessMenu = async () => {
    if (!file) return;
    setIsProcessing(true);
    try {
        const formData = new FormData();
        formData.append('file', file);
        const res = await fetch('/api/mess/upload', { method: 'POST', body: formData });
        const data = await res.json();
        if (data.error) throw new Error(data.error);
        setParsedMenu(data.menu);
        setIsReviewing(true);
    } catch (err: any) {
        toast({ title: 'Upload Failed', description: err.message, variant: 'destructive' });
    } finally {
        setIsProcessing(false);
    }
  };

  const handleSaveParsedMenu = async () => {
    setIsSavingParsed(true);
    try {
        await messService.saveWeeklyMenu(parsedMenu);
        if (file?.type === 'application/pdf') {
            await messService.uploadOfficialPdf(file, user?.email!);
        }
        toast({ title: 'Success', description: 'Menu has been updated and published.' });
        setIsReviewing(false);
    } catch (err: any) {
        toast({ title: 'Save Failed', description: err.message, variant: 'destructive' });
    } finally {
        setIsSavingParsed(false);
    }
  };

  const handleDownloadReceipt = () => {
      if (!currentUserVote) return;
      const data = Object.entries(currentUserVote.selections).map(([slot, choice]) => ({
          Slot: slot,
          Selection: choice
      }));
      const ws = utils.json_to_sheet(data);
      const wb = utils.book_new();
      utils.book_append_sheet(wb, ws, "MyBallot");
      writeFile(wb, `CheckMe_Ballot_${user?.email?.split('@')[0]}.xlsx`);
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-6 relative">
      <UserAvatar />
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Student Dashboard</h1>
          <p className="text-muted-foreground">Manage your hostel life efficiently</p>
        </div>

        {latestNotice && (currentTab === 'overview' || currentTab === 'hub') && (
          <Alert className="mb-8 bg-zinc-900 border-zinc-800 text-white p-6 rounded-2xl shadow-xl border-l-4 border-l-blue-500 overflow-hidden relative">
            <Megaphone className="h-5 w-5 text-blue-400" />
            <AlertTitle className="text-blue-400 font-black uppercase tracking-widest text-xs mb-2">Official Warden Notice</AlertTitle>
            <AlertDescription className="text-xl font-medium">"{latestNotice.message}"</AlertDescription>
          </Alert>
        )}

        {currentTab === 'overview' && <OverviewTab user={user} attendanceCount={attendanceData.length} />}
        
        {currentTab === 'menu' && (
            <MenuTab 
                todaysMenu={todaysMenu}
                weeklyMenu={weeklyMenu}
                timings={timings}
                loadingMenu={loadingMenu}
                pdfUrl={pdfUrl}
                isRep={isRep}
                onProcessMenu={handleProcessMenu}
                onManualEntry={() => { setParsedMenu(weeklyMenu); setIsReviewing(true); }}
                onEditActiveMenu={() => { setParsedMenu(weeklyMenu); setIsReviewing(true); }}
                onFileChange={handleFileChange}
                isProcessing={isProcessing}
                file={file}
                activeMealInfo={activeMealInfo}
                userEmail={user?.email!}
            />
        )}

        {currentTab === 'polls' && (
            <div className="max-w-4xl mx-auto space-y-6">
                <FoodPoll userId={user?.email!} pollId="sunday_brunch" />
                <FoodPoll userId={user?.email!} pollId="sunday_snacks" />
                <FoodPoll userId={user?.email!} pollId="sunday_dinner" />
            </div>
        )}

        {currentTab === 'attendance' && (
            <div className="max-w-4xl mx-auto">
                <AttendanceTable records={attendanceData} />
            </div>
        )}

        {currentTab === 'voting' && (
            <VotingTab 
                currentUserVote={currentUserVote}
                activeSurvey={activeSurvey}
                surveySelections={surveySelections}
                isSubmittingVote={isSubmittingVote}
                onSurveySelect={handleSurveySelect}
                onSubmitVote={submitVote}
                onDownloadReceipt={handleDownloadReceipt}
            />
        )}

        <ReviewMenuModal 
            parsedMenu={parsedMenu}
            onSetParsedMenu={setParsedMenu}
            onCancel={() => setIsReviewing(false)}
            onSave={handleSaveParsedMenu}
            isSaving={isSavingParsed}
        />
      </div>
    </div>
  );
}