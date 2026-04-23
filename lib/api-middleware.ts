import { NextResponse } from 'next/server';
import admin from 'firebase-admin';

// Initialize Admin SDK if not already done
if (!admin.apps.length) {
    admin.initializeApp({
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        // For production, you should use a service account JSON in an env var
        // For now, we'll assume it's running in an environment with default credentials
    });
}

export async function verifyAuth(request: Request, allowedRoles?: string[]) {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return { error: 'Unauthorized', status: 401 };
    }

    const token = authHeader.split('Bearer ')[1];
    try {
        const decodedToken = await admin.auth().verifyIdToken(token);
        const email = decodedToken.email;

        if (!email) return { error: 'Invalid token', status: 401 };

        if (allowedRoles) {
            const userDoc = await admin.firestore().collection('users').doc(email).get();
            const userRole = userDoc.exists ? userDoc.data()?.role : 'student';

            if (!allowedRoles.includes(userRole)) {
                return { error: 'Forbidden', status: 403 };
            }
        }

        return { user: decodedToken };
    } catch (error) {
        console.error('Auth verification error:', error);
        return { error: 'Invalid or expired token', status: 401 };
    }
}
