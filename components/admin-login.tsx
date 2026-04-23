'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

export function AdminLogin({ isStaff = false }: { isStaff?: boolean }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const { toast } = useToast();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            await signInWithEmailAndPassword(auth, email, password);
            toast({
                title: 'Welcome Back!',
                description: `Signed in as ${email === 'staff@checkme.com' ? 'Staff' : 'Admin'}.`,
            });
            router.push(email === 'staff@checkme.com' ? '/dashboard/mess' : '/dashboard/admin'); 
        } catch (error: any) {
            console.error('Login error:', error);
            let errorMessage = 'Failed to sign in. Please check your credentials.';
            if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
                errorMessage = 'Invalid email or password.';
            } else if (error.code === 'auth/invalid-credential') {
                 errorMessage = 'Invalid credentials provided.';
            }
            toast({
                variant: 'destructive',
                title: 'Login Failed',
                description: errorMessage,
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleLogin} className="space-y-4 px-4 py-2">
            <div>
                <Input
                    type="email"
                    placeholder="Email Address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-400"
                />
            </div>
            <div>
                <Input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-400"
                />
            </div>
            <Button
                type="submit"
                disabled={isLoading}
                className={`w-full font-semibold ${isStaff ? 'bg-yellow-500 hover:bg-yellow-600 text-black' : 'bg-red-500 hover:bg-red-600 text-white'}`}
            >
                {isLoading ? 'Signing in...' : `Sign in as ${isStaff ? 'Staff' : 'Admin'}`}
            </Button>
        </form>
    );
}
