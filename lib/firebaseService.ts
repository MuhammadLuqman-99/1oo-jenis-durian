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

const TREES_COLLECTION = "trees";
const ACTIVITIES_COLLECTION = "activities";
const HEALTH_RECORDS_COLLECTION = "healthRecords";

// Trees Operations
export const getAllTrees = async (): Promise<TreeInfo[]> => {
  try {
    const treesRef = collection(db, TREES_COLLECTION);
    const q = query(treesRef, orderBy("bil", "asc"));
    const snapshot = await getDocs(q);

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as TreeInfo[];
  } catch (error) {
    console.error("Error getting trees:", error);
    return [];
  }
};

export const getTreeById = async (treeId: string): Promise<TreeInfo | null> => {
  try {
    const treeRef = doc(db, TREES_COLLECTION, treeId);
    const snapshot = await getDoc(treeRef);

    if (snapshot.exists()) {
      return {
        id: snapshot.id,
        ...snapshot.data()
      } as TreeInfo;
    }
    return null;
  } catch (error) {
    console.error("Error getting tree:", error);
    return null;
  }
};

export const updateTree = async (treeId: string, updates: Partial<TreeInfo>): Promise<boolean> => {
  try {
    const treeRef = doc(db, TREES_COLLECTION, treeId);
    await updateDoc(treeRef, {
      ...updates,
      updatedAt: new Date().toISOString().split('T')[0]
    });
    return true;
  } catch (error) {
    console.error("Error updating tree:", error);
    return false;
  }
};

export const createTree = async (tree: TreeInfo): Promise<boolean> => {
  try {
    const treeRef = doc(db, TREES_COLLECTION, tree.id);
    await setDoc(treeRef, tree);
    return true;
  } catch (error) {
    console.error("Error creating tree:", error);
    return false;
  }
};

export const deleteTree = async (treeId: string): Promise<boolean> => {
  try {
    const treeRef = doc(db, TREES_COLLECTION, treeId);
    await deleteDoc(treeRef);
    return true;
  } catch (error) {
    console.error("Error deleting tree:", error);
    return false;
  }
};

// Initialize trees in Firebase (run once to populate database)
export const initializeTreesInFirebase = async (trees: TreeInfo[]): Promise<boolean> => {
  try {
    const promises = trees.map(tree => createTree(tree));
    await Promise.all(promises);
    console.log("Trees initialized in Firebase");
    return true;
  } catch (error) {
    console.error("Error initializing trees:", error);
    return false;
  }
};

// Activities Operations
export const getAllActivities = async (): Promise<FarmActivity[]> => {
  try {
    const activitiesRef = collection(db, ACTIVITIES_COLLECTION);
    const q = query(activitiesRef, orderBy("date", "desc"));
    const snapshot = await getDocs(q);

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as FarmActivity[];
  } catch (error) {
    console.error("Error getting activities:", error);
    return [];
  }
};

export const createActivity = async (activity: FarmActivity): Promise<boolean> => {
  try {
    const activityRef = doc(db, ACTIVITIES_COLLECTION, activity.id);
    await setDoc(activityRef, activity);
    return true;
  } catch (error) {
    console.error("Error creating activity:", error);
    return false;
  }
};

export const deleteActivity = async (activityId: string): Promise<boolean> => {
  try {
    const activityRef = doc(db, ACTIVITIES_COLLECTION, activityId);
    await deleteDoc(activityRef);
    return true;
  } catch (error) {
    console.error("Error deleting activity:", error);
    return false;
  }
};

// Health Records Operations
export const getAllHealthRecords = async (): Promise<TreeHealthRecord[]> => {
  try {
    const healthRef = collection(db, HEALTH_RECORDS_COLLECTION);
    const q = query(healthRef, orderBy("inspectionDate", "desc"));
    const snapshot = await getDocs(q);

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as TreeHealthRecord[];
  } catch (error) {
    console.error("Error getting health records:", error);
    return [];
  }
};

export const getHealthRecordById = async (recordId: string): Promise<TreeHealthRecord | null> => {
  try {
    const recordRef = doc(db, HEALTH_RECORDS_COLLECTION, recordId);
    const snapshot = await getDoc(recordRef);

    if (snapshot.exists()) {
      return {
        id: snapshot.id,
        ...snapshot.data()
      } as TreeHealthRecord;
    }
    return null;
  } catch (error) {
    console.error("Error getting health record:", error);
    return null;
  }
};

export const getHealthRecordsByTreeId = async (treeId: string): Promise<TreeHealthRecord[]> => {
  try {
    const healthRef = collection(db, HEALTH_RECORDS_COLLECTION);
    const snapshot = await getDocs(healthRef);

    return snapshot.docs
      .map(doc => ({
        id: doc.id,
        ...doc.data()
      }) as TreeHealthRecord)
      .filter(record => record.treeId === treeId)
      .sort((a, b) => new Date(b.inspectionDate).getTime() - new Date(a.inspectionDate).getTime());
  } catch (error) {
    console.error("Error getting health records by tree:", error);
    return [];
  }
};

export const createHealthRecord = async (record: TreeHealthRecord): Promise<boolean> => {
  try {
    const recordRef = doc(db, HEALTH_RECORDS_COLLECTION, record.id);
    await setDoc(recordRef, record);
    return true;
  } catch (error) {
    console.error("Error creating health record:", error);
    return false;
  }
};

export const updateHealthRecord = async (recordId: string, updates: Partial<TreeHealthRecord>): Promise<boolean> => {
  try {
    const recordRef = doc(db, HEALTH_RECORDS_COLLECTION, recordId);
    await updateDoc(recordRef, {
      ...updates,
      updatedAt: new Date().toISOString()
    });
    return true;
  } catch (error) {
    console.error("Error updating health record:", error);
    return false;
  }
};

export const deleteHealthRecord = async (recordId: string): Promise<boolean> => {
  try {
    const recordRef = doc(db, HEALTH_RECORDS_COLLECTION, recordId);
    await deleteDoc(recordRef);
    return true;
  } catch (error) {
    console.error("Error deleting health record:", error);
    return false;
  }
};
