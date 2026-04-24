import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, where, onSnapshot, doc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { surveyService } from '@/lib/services/surveyService';

export function useMonthlySurvey(userEmail: string | undefined) {
    const { toast } = useToast();
    const [activeSurvey, setActiveSurvey] = useState<any>(null);
    const [currentUserVote, setCurrentUserVote] = useState<any>(null);
    const [surveySelections, setSurveySelections] = useState<any>({});
    const [isSubmittingVote, setIsSubmittingVote] = useState(false);

    useEffect(() => {
        if (!userEmail) return;

        let unsubVote: (() => void) | undefined;

        const unsubSurvey = onSnapshot(query(collection(db, 'monthly_surveys'), where('status', '==', 'active')), (snap) => {
            if (!snap.empty) {
                const survey = { id: snap.docs[0].id, ...snap.docs[0].data() };
                setActiveSurvey(survey);

                // Cleanup previous vote listener if survey changes
                if (unsubVote) unsubVote();

                unsubVote = onSnapshot(doc(db, 'monthly_surveys', survey.id, 'votes', userEmail), (vSnap) => {
                    setCurrentUserVote(vSnap.exists() ? vSnap.data() : null);
                });
            } else {
                setActiveSurvey(null);
                setCurrentUserVote(null);
                if (unsubVote) {
                    unsubVote();
                    unsubVote = undefined;
                }
            }
        });

        return () => {
            unsubSurvey();
            if (unsubVote) unsubVote();
        };
    }, [userEmail]);

    const handleSurveySelect = (slotId: string, choice: string) => {
        setSurveySelections(prev => ({ ...prev, [slotId]: choice }));
    };

    const submitVote = async () => {
        if (!activeSurvey || !userEmail) return;
        setIsSubmittingVote(true);
        try {
            await surveyService.submitVote(activeSurvey.id, userEmail, surveySelections);
            toast({ title: 'Vote Confirmed!', description: 'Your preferences have been recorded.' });
        } catch (error: any) {
            toast({ title: 'Error', description: error.message, variant: 'destructive' });
        } finally {
            setIsSubmittingVote(false);
        }
    };

    return { activeSurvey, currentUserVote, surveySelections, isSubmittingVote, handleSurveySelect, submitVote };
}
