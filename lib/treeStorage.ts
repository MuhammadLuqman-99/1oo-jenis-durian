import { TreeInfo } from "@/types/tree";

const STORAGE_KEY = "durian_trees_data";

export const getStoredTrees = (): TreeInfo[] | null => {
  if (typeof window === "undefined") return null;

  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return null;

  try {
    return JSON.parse(stored);
  } catch {
    return null;
  }
};

export const saveTreesToStorage = (trees: TreeInfo[]): void => {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(trees));
};

export const updateTreeInStorage = (treeId: string, updates: Partial<TreeInfo>): boolean => {
  const trees = getStoredTrees();
  if (!trees) return false;

  const index = trees.findIndex(t => t.id === treeId);
  if (index === -1) return false;

  trees[index] = { ...trees[index], ...updates, updatedAt: new Date().toISOString().split('T')[0] };
  saveTreesToStorage(trees);
  return true;
};

export const clearTreeStorage = (): void => {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
};
