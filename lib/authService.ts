/**
 * Firebase Authentication Service
 * Handles user authentication, registration, and session management
 */

import { auth, db } from './firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
  updateProfile,
  sendPasswordResetEmail,
  updatePassword,
} from 'firebase/auth';
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  serverTimestamp,
} from 'firebase/firestore';
import { User, UserRole, UserPermissions } from '@/types/tree';
import { logActivity } from './activityLog';

// Re-export UserRole for external use
export type { UserRole };

// User profile stored in Firestore (extends base User type)
export interface UserProfile extends Omit<User, 'id'> {
  uid: string;
  isActive: boolean;
}

const USERS_COLLECTION = 'users';

/**
 * Register a new user
 */
export async function registerUser(
  email: string,
  password: string,
  displayName: string,
  role: UserRole = 'worker'
): Promise<{ success: boolean; user?: UserProfile; error?: string }> {
  try {
    // Create Firebase Auth user
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Update display name
    await updateProfile(user, { displayName });

    // Create user profile in Firestore
    const userProfile: UserProfile = {
      uid: user.uid,
      email: user.email!,
      name: displayName, // User type uses 'name', not 'displayName'
      role,
      status: 'active' as const, // Add required status field
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isActive: true,
      permissions: getDefaultPermissions(role),
    };

    await setDoc(doc(db, USERS_COLLECTION, user.uid), {
      ...userProfile,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return { success: true, user: userProfile };
  } catch (error: any) {
    console.error('Registration error:', error);
    return {
      success: false,
      error: getAuthErrorMessage(error.code),
    };
  }
}

/**
 * Sign in user
 */
export async function loginUser(
  email: string,
  password: string
): Promise<{ success: boolean; user?: UserProfile; error?: string }> {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Get user profile from Firestore
    const userProfile = await getUserProfile(user.uid);

    if (!userProfile) {
      await signOut(auth);
      return {
        success: false,
        error: 'User profile not found. Please contact administrator.',
      };
    }

    if (!userProfile.isActive) {
      await signOut(auth);
      return {
        success: false,
        error: 'Your account has been deactivated. Please contact administrator.',
      };
    }

    // Update last login
    await updateDoc(doc(db, USERS_COLLECTION, user.uid), {
      lastLogin: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    // Log login activity
    logActivity(
      userProfile.name,
      'login',
      'Authentication',
      `${userProfile.name} logged in`,
      {
        severity: 'info',
        entityType: 'system',
        metadata: { role: userProfile.role, email: userProfile.email }
      }
    );

    return { success: true, user: userProfile };
  } catch (error: any) {
    console.error('Login error:', error);
    return {
      success: false,
      error: getAuthErrorMessage(error.code),
    };
  }
}

/**
 * Sign out current user
 */
export async function logoutUser(): Promise<{ success: boolean; error?: string }> {
  try {
    const user = auth.currentUser;
    if (user) {
      const userProfile = await getUserProfile(user.uid);
      if (userProfile) {
        // Log logout activity
        logActivity(
          userProfile.name,
          'logout',
          'Authentication',
          `${userProfile.name} logged out`,
          {
            severity: 'info',
            entityType: 'system',
          }
        );
      }
    }

    await signOut(auth);
    return { success: true };
  } catch (error: any) {
    console.error('Logout error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get user profile from Firestore
 */
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  try {
    const docRef = doc(db, USERS_COLLECTION, uid);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return docSnap.data() as UserProfile;
    }
    return null;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
}

/**
 * Get all users (admin only)
 */
export async function getAllUsers(): Promise<UserProfile[]> {
  try {
    const querySnapshot = await getDocs(collection(db, USERS_COLLECTION));
    return querySnapshot.docs.map(doc => doc.data() as UserProfile);
  } catch (error) {
    console.error('Error fetching users:', error);
    return [];
  }
}

/**
 * Update user profile
 */
export async function updateUserProfile(
  uid: string,
  updates: Partial<UserProfile>
): Promise<{ success: boolean; error?: string }> {
  try {
    await updateDoc(doc(db, USERS_COLLECTION, uid), {
      ...updates,
      updatedAt: serverTimestamp(),
    });
    return { success: true };
  } catch (error: any) {
    console.error('Error updating user profile:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Update user role
 */
export async function updateUserRole(
  uid: string,
  role: UserRole
): Promise<{ success: boolean; error?: string }> {
  try {
    await updateDoc(doc(db, USERS_COLLECTION, uid), {
      role,
      permissions: getDefaultPermissions(role),
      updatedAt: serverTimestamp(),
    });
    return { success: true };
  } catch (error: any) {
    console.error('Error updating user role:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Deactivate user account
 */
export async function deactivateUser(uid: string): Promise<{ success: boolean; error?: string }> {
  try {
    await updateDoc(doc(db, USERS_COLLECTION, uid), {
      isActive: false,
      updatedAt: serverTimestamp(),
    });
    return { success: true };
  } catch (error: any) {
    console.error('Error deactivating user:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Reactivate user account
 */
export async function reactivateUser(uid: string): Promise<{ success: boolean; error?: string }> {
  try {
    await updateDoc(doc(db, USERS_COLLECTION, uid), {
      isActive: true,
      updatedAt: serverTimestamp(),
    });
    return { success: true };
  } catch (error: any) {
    console.error('Error reactivating user:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Send password reset email
 */
export async function resetPassword(email: string): Promise<{ success: boolean; error?: string }> {
  try {
    await sendPasswordResetEmail(auth, email);
    return { success: true };
  } catch (error: any) {
    console.error('Password reset error:', error);
    return {
      success: false,
      error: getAuthErrorMessage(error.code),
    };
  }
}

/**
 * Change user password
 */
export async function changePassword(
  newPassword: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const user = auth.currentUser;
    if (!user) {
      return { success: false, error: 'No user logged in' };
    }

    await updatePassword(user, newPassword);
    return { success: true };
  } catch (error: any) {
    console.error('Password change error:', error);
    return {
      success: false,
      error: getAuthErrorMessage(error.code),
    };
  }
}

/**
 * Get current authenticated user
 */
export function getCurrentUser(): FirebaseUser | null {
  return auth.currentUser;
}

/**
 * Listen to auth state changes
 */
export function onAuthChange(callback: (user: FirebaseUser | null) => void) {
  return onAuthStateChanged(auth, callback);
}

/**
 * Get default permissions based on role
 */
function getDefaultPermissions(role: UserRole): UserPermissions {
  switch (role) {
    case 'owner':
      return {
        viewTrees: true,
        addTrees: true,
        editTrees: true,
        deleteTrees: true,
        viewInventory: true,
        addInventory: true,
        editInventory: true,
        deleteInventory: true,
        viewHealthRecords: true,
        addHealthRecords: true,
        editHealthRecords: true,
        deleteHealthRecords: true,
        viewPurchaseOrders: true,
        createPurchaseOrders: true,
        approvePurchaseOrders: true,
        viewHarvest: true,
        recordHarvest: true,
        editHarvest: true,
        viewReports: true,
        exportData: true,
        viewUsers: true,
        manageUsers: true,
        viewActivityLog: true,
        manageBackups: true,
        systemSettings: true,
      };
    case 'manager':
      return {
        viewTrees: true,
        addTrees: true,
        editTrees: true,
        deleteTrees: false,
        viewInventory: true,
        addInventory: true,
        editInventory: true,
        deleteInventory: false,
        viewHealthRecords: true,
        addHealthRecords: true,
        editHealthRecords: true,
        deleteHealthRecords: false,
        viewPurchaseOrders: true,
        createPurchaseOrders: true,
        approvePurchaseOrders: true,
        viewHarvest: true,
        recordHarvest: true,
        editHarvest: true,
        viewReports: true,
        exportData: true,
        viewUsers: true,
        manageUsers: false,
        viewActivityLog: true,
        manageBackups: false,
        systemSettings: false,
      };
    case 'worker':
      return {
        viewTrees: true,
        addTrees: false,
        editTrees: true,
        deleteTrees: false,
        viewInventory: true,
        addInventory: true,
        editInventory: false,
        deleteInventory: false,
        viewHealthRecords: true,
        addHealthRecords: true,
        editHealthRecords: false,
        deleteHealthRecords: false,
        viewPurchaseOrders: true,
        createPurchaseOrders: false,
        approvePurchaseOrders: false,
        viewHarvest: true,
        recordHarvest: true,
        editHarvest: false,
        viewReports: false,
        exportData: false,
        viewUsers: false,
        manageUsers: false,
        viewActivityLog: false,
        manageBackups: false,
        systemSettings: false,
      };
    case 'viewer':
      return {
        viewTrees: true,
        addTrees: false,
        editTrees: false,
        deleteTrees: false,
        viewInventory: true,
        addInventory: false,
        editInventory: false,
        deleteInventory: false,
        viewHealthRecords: true,
        addHealthRecords: false,
        editHealthRecords: false,
        deleteHealthRecords: false,
        viewPurchaseOrders: true,
        createPurchaseOrders: false,
        approvePurchaseOrders: false,
        viewHarvest: true,
        recordHarvest: false,
        editHarvest: false,
        viewReports: true,
        exportData: false,
        viewUsers: false,
        manageUsers: false,
        viewActivityLog: false,
        manageBackups: false,
        systemSettings: false,
      };
    default:
      return getDefaultPermissions('viewer');
  }
}

/**
 * Get user-friendly error messages
 */
function getAuthErrorMessage(errorCode: string): string {
  switch (errorCode) {
    case 'auth/email-already-in-use':
      return 'This email is already registered.';
    case 'auth/invalid-email':
      return 'Invalid email address.';
    case 'auth/operation-not-allowed':
      return 'Email/password accounts are not enabled.';
    case 'auth/weak-password':
      return 'Password is too weak. Use at least 6 characters.';
    case 'auth/user-disabled':
      return 'This account has been disabled.';
    case 'auth/user-not-found':
      return 'No account found with this email.';
    case 'auth/wrong-password':
      return 'Incorrect password.';
    case 'auth/too-many-requests':
      return 'Too many failed attempts. Please try again later.';
    case 'auth/network-request-failed':
      return 'Network error. Please check your connection.';
    default:
      return 'An error occurred. Please try again.';
  }
}

/**
 * Check if user has permission
 */
export function hasPermission(user: UserProfile | null, permission: keyof UserProfile['permissions']): boolean {
  if (!user) return false;
  return user.permissions[permission] === true;
}

/**
 * Check if user is owner
 */
export function isOwner(user: UserProfile | null): boolean {
  return user?.role === 'owner';
}

/**
 * Check if user is manager or above
 */
export function isManagerOrAbove(user: UserProfile | null): boolean {
  return user?.role === 'owner' || user?.role === 'manager';
}
