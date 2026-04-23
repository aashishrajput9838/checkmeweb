export const pollService = {
  async getPoll() {
    const res = await fetch('/api/poll');
    if (!res.ok) throw new Error('Failed to fetch poll');
    return res.json();
  },

  async vote(userId: string, selectedOption: string) {
    const res = await fetch('/api/vote', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, selectedOption }),
    });
    if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Vote failed');
    }
    return res.json();
  }
};
