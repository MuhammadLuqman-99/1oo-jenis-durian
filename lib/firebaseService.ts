import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  Timestamp
} from "firebase/firestore";
import { db } from "./firebase";
import { TreeInfo, FarmActivity, TreeHealthRecord } from "@/types/tree";
import { Result, success, error, tryCatch } from "@/types/result";
import { logActivity } from "./activityLog";
import { getCurrentUser, getUserProfile } from "./authService";

const TREES_COLLECTION = "trees";
const ACTIVITIES_COLLECTION = "activities";
const HEALTH_RECORDS_COLLECTION = "healthRecords";

// Trees Operations
export const getAllTrees = async (): Promise<Result<TreeInfo[]>> => {
  return tryCatch(async () => {
    const treesRef = collection(db, TREES_COLLECTION);
    const q = query(treesRef, orderBy("bil", "asc"));
    const snapshot = await getDocs(q);

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as TreeInfo[];
  }, "Failed to load trees");
};

export const getTreeById = async (treeId: string): Promise<Result<TreeInfo>> => {
  return tryCatch(async () => {
    const treeRef = doc(db, TREES_COLLECTION, treeId);
    const snapshot = await getDoc(treeRef);

    if (!snapshot.exists()) {
      throw new Error("Tree not found");
    }

    return {
      id: snapshot.id,
      ...snapshot.data()
    } as TreeInfo;
  }, `Failed to load tree ${treeId}`);
};

export const updateTree = async (treeId: string, updates: Partial<TreeInfo>): Promise<Result<TreeInfo>> => {
  return tryCatch(async () => {
    const treeRef = doc(db, TREES_COLLECTION, treeId);
    const updatedData = {
      ...updates,
      updatedAt: new Date().toISOString().split('T')[0]
    };

    await updateDoc(treeRef, updatedData);

    // Return the updated tree
    const snapshot = await getDoc(treeRef);
    const updatedTree = {
      id: snapshot.id,
      ...snapshot.data()
    } as TreeInfo;

    // Log activity
    try {
      const user = getCurrentUser();
      if (user) {
        const userProfile = await getUserProfile(user.uid);
        if (userProfile) {
          logActivity(
            userProfile.name,
            'update',
            'Tree Management',
            `Updated tree #${updatedTree.bil} - ${updatedTree.name}`,
            {
              severity: 'info',
              entityType: 'tree',
              entityId: treeId,
              metadata: { updates: Object.keys(updates) }
            }
          );
        }
      }
    } catch (err) {
      console.error('Failed to log activity:', err);
    }

    return updatedTree;
  }, `Failed to update tree ${treeId}`);
};

export const createTree = async (tree: TreeInfo): Promise<Result<TreeInfo>> => {
  return tryCatch(async () => {
    const treeRef = doc(db, TREES_COLLECTION, tree.id);
    await setDoc(treeRef, tree);

    // Log activity
    try {
      const user = getCurrentUser();
      if (user) {
        const userProfile = await getUserProfile(user.uid);
        if (userProfile) {
          logActivity(
            userProfile.name,
            'create',
            'Tree Management',
            `Created new tree #${tree.bil} - ${tree.name}`,
            {
              severity: 'success',
              entityType: 'tree',
              entityId: tree.id,
              metadata: { variety: tree.name, zone: tree.zone }
            }
          );
        }
      }
    } catch (err) {
      console.error('Failed to log activity:', err);
    }

    return tree;
  }, "Failed to create tree");
};

export const deleteTree = async (treeId: string): Promise<Result<void>> => {
  return tryCatch(async () => {
    // Get tree info before deleting
    const treeSnapshot = await getDoc(doc(db, TREES_COLLECTION, treeId));
    const treeInfo = treeSnapshot.exists() ? treeSnapshot.data() as TreeInfo : null;

    const treeRef = doc(db, TREES_COLLECTION, treeId);
    await deleteDoc(treeRef);

    // Log activity
    try {
      const user = getCurrentUser();
      if (user) {
        const userProfile = await getUserProfile(user.uid);
        if (userProfile && treeInfo) {
          logActivity(
            userProfile.name,
            'delete',
            'Tree Management',
            `Deleted tree #${treeInfo.bil} - ${treeInfo.name}`,
            {
              severity: 'warning',
              entityType: 'tree',
              entityId: treeId,
            }
          );
        }
      }
    } catch (err) {
      console.error('Failed to log activity:', err);
    }
  }, `Failed to delete tree ${treeId}`);
};

export const initializeTreesInFirebase = async (trees: TreeInfo[]): Promise<Result<void>> => {
  return tryCatch(async () => {
    const promises = trees.map(tree => {
      const treeRef = doc(db, TREES_COLLECTION, tree.id);
      return setDoc(treeRef, tree);
    });
    await Promise.all(promises);
  }, "Failed to initialize trees");
};

// Health Records Operations
export const getAllHealthRecords = async (): Promise<Result<TreeHealthRecord[]>> => {
  return tryCatch(async () => {
    const recordsRef = collection(db, HEALTH_RECORDS_COLLECTION);
    const q = query(recordsRef, orderBy("inspectionDate", "desc"));
    const snapshot = await getDocs(q);

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as TreeHealthRecord[];
  }, "Failed to load health records");
};

export const getHealthRecordById = async (recordId: string): Promise<Result<TreeHealthRecord>> => {
  return tryCatch(async () => {
    const recordRef = doc(db, HEALTH_RECORDS_COLLECTION, recordId);
    const snapshot = await getDoc(recordRef);

    if (!snapshot.exists()) {
      throw new Error("Health record not found");
    }

    return {
      id: snapshot.id,
      ...snapshot.data()
    } as TreeHealthRecord;
  }, `Failed to load health record ${recordId}`);
};

export const createHealthRecord = async (record: TreeHealthRecord): Promise<Result<TreeHealthRecord>> => {
  return tryCatch(async () => {
    const recordRef = doc(db, HEALTH_RECORDS_COLLECTION, record.id);
    await setDoc(recordRef, record);

    // Log activity
    try {
      const user = getCurrentUser();
      if (user) {
        const userProfile = await getUserProfile(user.uid);
        if (userProfile) {
          logActivity(
            userProfile.name,
            'create',
            'Health Records',
            `Added health record for tree #${record.treeNo}`,
            {
              severity: record.healthStatus === 'Critical' ? 'error' : 'info',
              entityType: 'health',
              entityId: record.id,
              metadata: { healthStatus: record.healthStatus, treeNo: record.treeNo }
            }
          );
        }
      }
    } catch (err) {
      console.error('Failed to log activity:', err);
    }

    return record;
  }, "Failed to create health record");
};

export const updateHealthRecord = async (
  recordId: string,
  updates: Partial<TreeHealthRecord>
): Promise<Result<TreeHealthRecord>> => {
  return tryCatch(async () => {
    const recordRef = doc(db, HEALTH_RECORDS_COLLECTION, recordId);
    const updatedData = {
      ...updates,
      updatedAt: new Date().toISOString()
    };

    await updateDoc(recordRef, updatedData);

    const snapshot = await getDoc(recordRef);
    const updatedRecord = {
      id: snapshot.id,
      ...snapshot.data()
    } as TreeHealthRecord;

    // Log activity
    try {
      const user = getCurrentUser();
      if (user) {
        const userProfile = await getUserProfile(user.uid);
        if (userProfile) {
          logActivity(
            userProfile.name,
            'update',
            'Health Records',
            `Updated health record for tree #${updatedRecord.treeNo}`,
            {
              severity: updates.healthStatus === 'Critical' ? 'error' : 'info',
              entityType: 'health',
              entityId: recordId,
              metadata: { updates: Object.keys(updates) }
            }
          );
        }
      }
    } catch (err) {
      console.error('Failed to log activity:', err);
    }

    return updatedRecord;
  }, `Failed to update health record ${recordId}`);
};

export const deleteHealthRecord = async (recordId: string): Promise<Result<void>> => {
  return tryCatch(async () => {
    // Get record info before deleting
    const recordSnapshot = await getDoc(doc(db, HEALTH_RECORDS_COLLECTION, recordId));
    const recordInfo = recordSnapshot.exists() ? recordSnapshot.data() as TreeHealthRecord : null;

    const recordRef = doc(db, HEALTH_RECORDS_COLLECTION, recordId);
    await deleteDoc(recordRef);

    // Log activity
    try {
      const user = getCurrentUser();
      if (user) {
        const userProfile = await getUserProfile(user.uid);
        if (userProfile && recordInfo) {
          logActivity(
            userProfile.name,
            'delete',
            'Health Records',
            `Deleted health record for tree #${recordInfo.treeNo}`,
            {
              severity: 'warning',
              entityType: 'health',
              entityId: recordId,
            }
          );
        }
      }
    } catch (err) {
      console.error('Failed to log activity:', err);
    }
  }, `Failed to delete health record ${recordId}`);
};

// Farm Activities Operations
export const getAllActivities = async (): Promise<Result<FarmActivity[]>> => {
  return tryCatch(async () => {
    const activitiesRef = collection(db, ACTIVITIES_COLLECTION);
    const q = query(activitiesRef, orderBy("date", "desc"));
    const snapshot = await getDocs(q);

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as FarmActivity[];
  }, "Failed to load activities");
};

export const createActivity = async (activity: FarmActivity): Promise<Result<FarmActivity>> => {
  return tryCatch(async () => {
    const activityRef = doc(db, ACTIVITIES_COLLECTION, activity.id);
    await setDoc(activityRef, activity);
    return activity;
  }, "Failed to create activity");
};

export const updateActivity = async (
  activityId: string,
  updates: Partial<FarmActivity>
): Promise<Result<FarmActivity>> => {
  return tryCatch(async () => {
    const activityRef = doc(db, ACTIVITIES_COLLECTION, activityId);
    await updateDoc(activityRef, updates);

    const snapshot = await getDoc(activityRef);
    return {
      id: snapshot.id,
      ...snapshot.data()
    } as FarmActivity;
  }, `Failed to update activity ${activityId}`);
};

export const deleteActivity = async (activityId: string): Promise<Result<void>> => {
  return tryCatch(async () => {
    const activityRef = doc(db, ACTIVITIES_COLLECTION, activityId);
    await deleteDoc(activityRef);
  }, `Failed to delete activity ${activityId}`);
};
