export const surveyService = {
    async submitVote(monthId: string, userId: string, selections: any) {
        const res = await fetch('/api/survey/vote', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ monthId, userId, selections })
        });
        if (!res.ok) throw new Error('Vote submission failed');
        return await res.json();
    }
};
