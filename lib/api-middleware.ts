import { NextResponse } from 'next/server';
import admin from 'firebase-admin';
import { resolveUserRole } from './roles';

// Initialize Admin SDK if not already done
const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID;

if (!admin.apps.length) {
    if (!projectId) {
        console.error('FIREBASE_PROJECT_ID is not defined in environment variables');
    }
    
    try {
        admin.initializeApp({
            projectId: projectId,
        });
        console.log('Firebase Admin initialized for project:', projectId);
    } catch (error) {
        console.error('Firebase Admin initialization failed:', error);
    }
}

export async function verifyAuth(request: Request, allowedRoles?: string[]) {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return { error: 'Unauthorized', status: 401 };
    }

    const token = authHeader.split('Bearer ')[1];
    
    if (!token || token === 'undefined' || token === 'null') {
        console.error('verifyAuth: Invalid token string in header');
        return { error: 'Unauthorized', status: 401 };
    }

    try {
        let decodedToken;
        try {
            decodedToken = await admin.auth().verifyIdToken(token);
        } catch (adminError) {
            console.warn('verifyAuth: Admin SDK verification failed, trying REST fallback...', adminError);
            
            // Fallback to REST API verification (works in local dev without service accounts)
            const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
            const restRes = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${apiKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ idToken: token })
            });
            
            if (!restRes.ok) {
                throw new Error('REST verification failed');
            }
            
            const restData = await restRes.json();
            if (!restData.users || restData.users.length === 0) {
                throw new Error('User not found in REST response');
            }
            
            decodedToken = {
                email: restData.users[0].email,
                uid: restData.users[0].localId,
                // Add other fields as needed by your logic
            };
            console.log('verifyAuth: REST fallback successful for:', decodedToken.email);
        }

        const email = decodedToken.email;
        if (!email) {
            console.error('verifyAuth: No email in token');
            return { error: 'Invalid token', status: 401 };
        }

        if (allowedRoles) {
            const userDoc = await admin.firestore().collection('users').doc(email).get();
            const firestoreRole = userDoc.exists ? userDoc.data()?.role : null;
            const userRole = resolveUserRole(email, firestoreRole);

            if (!allowedRoles.includes(userRole)) {
                console.warn(`verifyAuth: Role ${userRole} not in allowed roles ${allowedRoles} for ${email}`);
                return { error: 'Forbidden', status: 403 };
            }
        }

        return { user: decodedToken };
    } catch (error: any) {
        console.error('verifyAuth: All verification methods failed:', error);
        return { 
            error: 'Invalid or expired token', 
            reason: error.message || 'Unknown verification error',
            status: 401 
        };
    }
}
