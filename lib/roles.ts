/**
 * Centralized role detection logic.
 * Priorities:
 * 1. Hardcoded system emails (Staff, Warden, Admin)
 * 2. Firestore document role
 * 3. Default fallback (Student)
 */

export type UserRole = 'student' | 'staff' | 'warden' | 'admin' | 'representative';

export function getRoleByEmail(email: string | null | undefined): UserRole | null {
    if (!email) return null;
    
    const emailLower = email.toLowerCase();
    
    if (emailLower === 'staff@checkme.com') return 'staff';
    if (emailLower === 'warden@checkme.com') return 'warden';
    if (emailLower === 'admin@checkme.com') return 'admin';
    
    if (emailLower.endsWith('@ug.sharda.ac.in')) return 'student';
    
    return null;
}

export function resolveUserRole(email: string | null | undefined, firestoreRole?: string | null): UserRole {
    // 1. Check hardcoded system emails first to ensure core accounts always work
    const emailRole = getRoleByEmail(email);
    if (emailRole && emailRole !== 'student') return emailRole;
    
    // 2. Use Firestore role if available
    if (firestoreRole) return firestoreRole as UserRole;
    
    // 3. Fallback to email-based detection (for students)
    if (emailRole) return emailRole;
    
    // 4. Final fallback
    return 'student';
}
