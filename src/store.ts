import { create } from 'zustand';
import { UserProfile, CarbonData, Mission, INITIAL_USER, INITIAL_CARBON_DATA, ActionItem, Achievement, DEFAULT_ACHIEVEMENTS, Habit, DEFAULT_HABITS, DailyRecord, TreeEntry } from './types';
import axios from 'axios';
import { db, auth } from './lib/firebase';
import { doc, getDoc, setDoc, updateDoc, collection, getDocs, query, orderBy, limit, addDoc, onSnapshot, serverTimestamp } from 'firebase/firestore';

import { handleFirestoreError, OperationType } from './lib/firestore-utils';
import { applyMonthlySavings } from './lib/carbon-engine';
import { ecoLevelFromLifetimeXp, CO2_PER_TREE } from './lib/utils';

function normalizeLevelFromLifetimeXp(user: UserProfile): UserProfile {
  if (typeof user.lifetimeXp === 'number' && user.lifetimeXp > 0) {
    const derivedLevel = ecoLevelFromLifetimeXp(user.lifetimeXp);
    if (derivedLevel !== user.level) {
      return {
        ...user,
        level: derivedLevel,
        xp: user.lifetimeXp % 500
      };
    }
  }
  return user;
}

function getDaysDifference(date1Str: string, date2Str: string): number {
  const d1 = new Date(date1Str);
  const d2 = new Date(date2Str);
  const utc1 = Date.UTC(d1.getFullYear(), d1.getMonth(), d1.getDate());
  const utc2 = Date.UTC(d2.getFullYear(), d2.getMonth(), d2.getDate());
  return Math.floor((utc2 - utc1) / (1000 * 60 * 60 * 24));
}

function recomputeCarbonData(
  breakdown: CarbonData['breakdown'],
  habits: Habit[],
  actions: ActionItem[],
  budget: number
): Pick<CarbonData, 'total' | 'spent'> {
  const rawTotal = Object.values(breakdown).reduce((sum, v) => sum + (v || 0), 0);
  const completedHabitCount = habits.filter(h => h.completed).length;
  const actionSavings = actions.filter(a => a.completed).reduce((sum, a) => sum + (a.carbonReduction || 0), 0);
  const total = applyMonthlySavings(Math.round(rawTotal), completedHabitCount, actionSavings);
  return { total, spent: Math.min(total, budget) };
}

axios.defaults.timeout = 10000;

interface Activity {
  id: string;
  type: string;
  title: string;
  description: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

interface Notification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  link?: string;
}

interface AppState {
  user: UserProfile;
  carbonData: CarbonData;
  missions: Mission[];
  actions: ActionItem[];
  achievements: Achievement[];
  habits: Habit[];
  activities: Activity[];
  notifications: Notification[];
  dailyHistory: DailyRecord[];
  treesPlanted: number;
  treesOffsetKg: number;
  treeEntries: TreeEntry[];
  isLoading: boolean;
  
  // Actions
  setUser: (user: Partial<UserProfile>) => void;
  syncWithFirebase: (uid: string) => Promise<void>;
  setOnboardingComplete: (complete: boolean) => Promise<void>;
  updateCarbonData: () => Promise<void>;
  completeAction: (id: string) => Promise<void>;
  fetchRecommendations: () => Promise<void>;
  fetchMissions: () => Promise<void>;
  checkAchievements: () => Promise<void>;
  toggleHabit: (id: string) => Promise<void>;
  addHabit: (habit: Habit) => Promise<void>;
  removeHabit: (id: string) => Promise<void>;
  setReductionGoal: (goal: number) => Promise<void>;
  completeMission: (id: string) => Promise<void>;
  addActivity: (type: 'action' | 'mission' | 'habit' | 'profile' | 'badge' | 'level' | 'tree', title: string, description: string, metadata?: Record<string, unknown>) => Promise<void>;
  addNotification: (title: string, message: string, link?: string) => Promise<void>;
  markNotificationRead: (id: string) => Promise<void>;
  addXPEcoPoints: (xpGain: number, ecoPointsGain: number) => Promise<void>;
  updateStreak: () => Promise<void>;
  checkDailyReset: () => Promise<void>;
  updateMissionProgress: () => void;
  addTree: (count: number, date: string, notes?: string) => Promise<void>;
  clearStore: () => void;
}

let unsubscribeActivities: (() => void) | null = null;
let unsubscribeNotifications: (() => void) | null = null;
let unsubscribeUser: (() => void) | null = null;

// Account/session isolation guard. Every user-scoped async operation captures
// the current generation: if it changed (sign-out, sign-in as another account,
// app reset), stale reads/snapshots are discarded instead of writing data from
// a previous account into the store.
let syncGeneration = 0;

// Returns true only while the given uid is still the authenticated account for
// the current sync generation. Avoids stale async results polluting the store.
function isCurrentUid(uid: string | undefined | null): boolean {
  return !!uid && auth.currentUser?.uid === uid;
}

export const useAppStore = create<AppState>((set, get) => ({
  user: INITIAL_USER,
  carbonData: INITIAL_CARBON_DATA,
  missions: [],
  actions: [],
  achievements: DEFAULT_ACHIEVEMENTS,
  habits: DEFAULT_HABITS,
  activities: [],
  notifications: [],
  dailyHistory: [],
  treesPlanted: 0,
  treesOffsetKg: 0,
  treeEntries: [],
  isLoading: false,

  clearStore: () => {
    // Invalidate every pending async operation from the previous session.
    syncGeneration += 1;
    if (unsubscribeActivities) unsubscribeActivities();
    if (unsubscribeNotifications) unsubscribeNotifications();
    if (unsubscribeUser) unsubscribeUser();
    unsubscribeActivities = null;
    unsubscribeNotifications = null;
    unsubscribeUser = null;
    set({
      user: INITIAL_USER,
      carbonData: INITIAL_CARBON_DATA,
      missions: [],
      actions: [],
      achievements: DEFAULT_ACHIEVEMENTS,
      habits: DEFAULT_HABITS,
      activities: [],
      notifications: [],
      dailyHistory: [],
      treesPlanted: 0,
      treesOffsetKg: 0,
      treeEntries: [],
      isLoading: false,
    });
  },

  syncWithFirebase: async (uid) => {
    // Invalidate any in-flight sync/snapshots so a previous account's data
    // cannot race into the store after this account loads.
    const generation = ++syncGeneration;

    // Detach all previous listeners and reset user-scoped state immediately,
    // so the dashboard never renders the previous account's data.
    if (unsubscribeActivities) unsubscribeActivities();
    if (unsubscribeNotifications) unsubscribeNotifications();
    if (unsubscribeUser) unsubscribeUser();
    unsubscribeActivities = null;
    unsubscribeNotifications = null;
    unsubscribeUser = null;
    set({
      user: INITIAL_USER,
      carbonData: INITIAL_CARBON_DATA,
      missions: [],
      actions: [],
      achievements: DEFAULT_ACHIEVEMENTS,
      habits: DEFAULT_HABITS,
      activities: [],
      notifications: [],
      dailyHistory: [],
      treesPlanted: 0,
      treesOffsetKg: 0,
      treeEntries: [],
      isLoading: true,
    });

    const isCurrent = () => syncGeneration === generation && auth.currentUser?.uid === uid;

    try {
      const userRef = doc(db, 'users', uid);

      // Perform initial fetch to ensure store is hydrated immediately
      const initialSnap = await getDoc(userRef);
      if (!isCurrent()) return;
      if (initialSnap.exists()) {
        const data = initialSnap.data();
        set({ 
          user: normalizeLevelFromLifetimeXp({ 
            ...INITIAL_USER, 
            ...data, 
            name: data.name || INITIAL_USER.name || "Eco Champion"
          }), 
          carbonData: data.carbonData || INITIAL_CARBON_DATA,
          missions: data.missions || [],
          achievements: data.achievements || DEFAULT_ACHIEVEMENTS,
          habits: data.habits || DEFAULT_HABITS,
          actions: data.actions?.length ? data.actions : [],
          treesPlanted: Number(data.treesPlanted) || 0,
          treesOffsetKg: Number(data.treesOffsetKg) || 0
        });
      }
      
      // Fetch dailyHistory once
      const dailyHistoryQuery = query(collection(db, `users/${uid}/dailyHistory`), orderBy('date', 'desc'), limit(100));
      try {
        const dailyHistorySnap = await getDocs(dailyHistoryQuery);
        if (!isCurrent()) return;
        const dailyHistory = dailyHistorySnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as DailyRecord));
        set({ dailyHistory });
      } catch (error) {
        if (!isCurrent()) return;
        handleFirestoreError(error, OperationType.LIST, `users/${uid}/dailyHistory`);
      }

      // Fetch tree entries once and recompute totals
      const treesQuery = query(collection(db, `users/${uid}/trees`), orderBy('createdAt', 'desc'), limit(200));
      try {
        const treesSnap = await getDocs(treesQuery);
        if (!isCurrent()) return;
        const treeEntries = treesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as TreeEntry));
        const treesPlanted = treeEntries.reduce((sum, t) => sum + (Number(t.count) || 0), 0);
        const treesOffsetKg = Math.round(treeEntries.reduce((sum, t) => sum + (Number(t.offsetKg) || 0), 0));
        set({ treeEntries, treesPlanted, treesOffsetKg });
      } catch (error) {
        if (!isCurrent()) return;
        handleFirestoreError(error, OperationType.LIST, `users/${uid}/trees`);
      }

      // Run daily reset check
      await get().checkDailyReset();
      if (!isCurrent()) return;

      unsubscribeUser = onSnapshot(userRef, (userSnap) => {
        if (!isCurrent()) return;
        if (userSnap.exists()) {
          const data = userSnap.data();
          set({ 
            user: normalizeLevelFromLifetimeXp({ 
              ...INITIAL_USER, 
              ...data, 
              name: data.name || INITIAL_USER.name || "Eco Champion"
            }), 
            carbonData: data.carbonData || INITIAL_CARBON_DATA,
            missions: data.missions || [],
            achievements: data.achievements || DEFAULT_ACHIEVEMENTS,
            habits: data.habits || DEFAULT_HABITS,
            actions: data.actions?.length ? data.actions : [],
            treesPlanted: Number(data.treesPlanted) || get().treesPlanted || 0,
            treesOffsetKg: Number(data.treesOffsetKg) || get().treesOffsetKg || 0
          });
        }
      }, (error) => {
        if (!isCurrent()) return;
        handleFirestoreError(error, OperationType.GET, `users/${uid}`);
      });
      
      if (unsubscribeNotifications) unsubscribeNotifications();

      // Fetch activities once instead of real-time listener
      const activitiesQuery = query(collection(db, `users/${uid}/activities`), orderBy('timestamp', 'desc'), limit(50));
      getDocs(activitiesQuery).then((snap) => {
        if (!isCurrent()) return;
        const activities = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Activity));
        set({ activities });
      }).catch((error) => {
        if (!isCurrent()) return;
        handleFirestoreError(error, OperationType.LIST, `users/${uid}/activities`);
      });
      unsubscribeActivities = null;

      const notificationsQuery = query(collection(db, `users/${uid}/notifications`), orderBy('timestamp', 'desc'), limit(50));
      unsubscribeNotifications = onSnapshot(notificationsQuery, (snap) => {
        if (!isCurrent()) return;
        const notifications = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Notification));
        set({ notifications });
      }, (error) => {
        if (!isCurrent()) return;
        handleFirestoreError(error, OperationType.LIST, `users/${uid}/notifications`);
      });
    } catch (error) {
      if (!isCurrent()) return;
      handleFirestoreError(error, OperationType.GET, `users/${uid}`);
    } finally {
      if (isCurrent()) set({ isLoading: false });
    }
  },

  setUser: async (userUpdate) => {
    const { user } = get();
    const newUser = { ...user, ...userUpdate };
    set({ user: newUser });
    
    if (auth.currentUser) {
      try {
        const userRef = doc(db, 'users', auth.currentUser.uid);
        await updateDoc(userRef, userUpdate);
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, `users/${auth.currentUser.uid}`);
      }
    }
  },

  setOnboardingComplete: async (complete) => {
    set({ isLoading: true });
    try {
      const { user } = get();
      const updatedUser = { ...user, completedOnboarding: complete };
      set({ user: updatedUser });
      
      if (auth.currentUser) {
        const userRef = doc(db, 'users', auth.currentUser.uid);
        await updateDoc(userRef, { completedOnboarding: complete });
      }

      await get().updateCarbonData();
      await Promise.all([
        get().fetchRecommendations(),
        get().fetchMissions()
      ]);
      await get().checkAchievements();
      
      await get().addActivity('profile', 'Onboarding Completed', 'You have successfully set up your green profile!');
    } finally {
      set({ isLoading: false });
    }
  },

  updateCarbonData: async () => {
    const uid = auth.currentUser?.uid;
    const { user, carbonData, habits, actions } = get();
    try {
      const response = await axios.post("/api/carbon/calculate", { profile: user });
      if (!isCurrentUid(uid)) return;
      const { breakdown } = response.data;

      const budget = 300;
      const { total: adjustedTotal, spent } = recomputeCarbonData(breakdown, habits, actions, budget);

      const newCarbonData = {
        ...carbonData,
        total: adjustedTotal,
        spent,
        budget,
        breakdown
      };

      set({ carbonData: newCarbonData });

      if (auth.currentUser) {
        try {
          const userRef = doc(db, 'users', auth.currentUser.uid);
          await updateDoc(userRef, { carbonData: newCarbonData });

          const lbRef = doc(db, 'leaderboard', auth.currentUser.uid);
          await setDoc(lbRef, {
            uid: auth.currentUser.uid,
            name: user.name,
            photoURL: auth.currentUser.photoURL,
            level: user.level,
            ecoPoints: user.ecoPoints,
            lifetimeXp: user.lifetimeXp || 0,
            streak: user.streak || 0,
            updatedAt: serverTimestamp()
          }, { merge: true });
        } catch (error) {
          handleFirestoreError(error, OperationType.WRITE, `users/${auth.currentUser.uid}/carbonData`);
        }
      }

      await get().checkAchievements();
    } catch (error: unknown) {
      console.error("Failed to update carbon data", error instanceof Error ? error.message : String(error));
    }
  },

  fetchRecommendations: async () => {
    const uid = auth.currentUser?.uid;
    const { user, carbonData, actions: existingActions } = get();
    try {
      const completedIds = existingActions.filter(a => a.completed).map(a => a.id);
      const response = await axios.post("/api/recommendations", { 
        profile: user, 
        footprint: carbonData.breakdown,
        completedIds
      });
      if (!isCurrentUid(uid)) return;
      const incoming = response.data as ActionItem[];

      // Fresh recommendations with completion status restored.
      const fresh = incoming.map((action) => {
        const prev = existingActions.find(a => a.id === action.id);
        return prev && prev.completed ? { ...action, completed: true } : action;
      });

      // Promote any locally-completed action the engine no longer returns
      // (it is excluded as "permanently completed") so its card stays visible.
      const completed = existingActions.filter(a => a.completed);

      // Completed cards come first so they are never dropped by the 8-cap;
      // the remaining slots belong to the fresh, uncompleted recommendations.
      const merged = [...completed, ...fresh.filter(a => !a.completed)];
      const capped = merged.slice(0, 8);
      set({ actions: capped });

      if (auth.currentUser && capped.length > 0) {
        try {
          const userRef = doc(db, 'users', auth.currentUser.uid);
          await updateDoc(userRef, { actions: capped });
        } catch (error) {
          handleFirestoreError(error, OperationType.UPDATE, `users/${auth.currentUser.uid}/actions`);
        }
      }
    } catch (error) {
      console.error("Failed to fetch recommendations", error);
    }
  },

  fetchMissions: async () => {
    const uid = auth.currentUser?.uid;
    const { user, missions: existingMissions } = get();
    try {
      const response = await axios.post("/api/missions", { profile: user });
      if (!isCurrentUid(uid)) return;
      const incomingMissions = response.data;
      
      const mergedMissions = incomingMissions.map((incoming: Mission) => {
        const existing = existingMissions.find(m => m.id === incoming.id);
        return existing ? existing : incoming;
      });

      set({ missions: mergedMissions });
      
      if (auth.currentUser) {
        try {
          const userRef = doc(db, 'users', auth.currentUser.uid);
          await updateDoc(userRef, { missions: mergedMissions });
        } catch (error) {
          handleFirestoreError(error, OperationType.UPDATE, `users/${auth.currentUser.uid}/missions`);
        }
      }
    } catch (error) {
      console.error("Failed to fetch missions", error);
    }
  },

completeAction: async (id) => {
    const { actions } = get();
    const action = actions.find(a => a.id === id);
    if (!action || action.completed) return;

    // Mark only this action as completed; the rest of the list stays intact.
    const newActions = actions.map(a => a.id === id ? { ...a, completed: true } : a);
    set({ actions: newActions });

    // Persist completion in Firestore so it survives a reload.
    if (auth.currentUser) {
      try {
        const userRef = doc(db, 'users', auth.currentUser.uid);
        await updateDoc(userRef, { actions: newActions, completedActionIds: newActions.filter(a => a.completed).map(a => a.id) });
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, `users/${auth.currentUser.uid}/actions`);
      }
    }

    // Add XP and EcoPoints for completing an action
    await get().addXPEcoPoints(15, 20);
    await get().updateStreak();
    await get().updateMissionProgress();
    await get().addActivity('action', 'Action Completed', `You completed: ${action.title}`);
    await get().checkAchievements();

    // Reduce today's carbon footprint from the completed action's savings.
    await get().updateCarbonData();

    // Refresh recommendations — completed action stays excluded from the engine
    // while every other recommendation remains visible.
    await get().fetchRecommendations();
  },

  checkAchievements: async () => {
    const { carbonData, achievements, user, missions } = get();
    const baseline = 350;
    const historyValues = carbonData.history || [];
    const totalSpent = historyValues.reduce((sum, h) => sum + h.value, 0);
    const totalPotential = historyValues.length * baseline;
    const totalSaved = Math.max(0, totalPotential - totalSpent + (baseline - carbonData.total));
    const lifetimeXp = user.lifetimeXp || 0;
    const currentStreak = user.streak || 0;
    const completedMissionsCount = missions.filter(m => m.completed).length;

    let newlyUnlocked = false;
    const updatedAchievements = achievements.map(ach => {
      if (ach.unlockedAt) return ach;

      let unlocked = false;
      if (ach.type === 'carbon') {
        unlocked = totalSaved >= (ach.milestoneKg ?? Infinity);
      } else if (ach.type === 'xp') {
        unlocked = lifetimeXp >= (ach.milestoneXp ?? Infinity);
      } else if (ach.type === 'streak') {
        unlocked = currentStreak >= (ach.milestoneStreak ?? Infinity);
      } else if (ach.type === 'mission') {
        unlocked = completedMissionsCount >= (ach.milestoneMissions ?? Infinity);
      }

      if (unlocked) {
        newlyUnlocked = true;
        const timestamp = new Date().toISOString();
        get().addActivity('badge', 'Badge Unlocked', `Unlocked: ${ach.title}`);
        get().addNotification('New Badge!', `You've earned the ${ach.title} badge.`);
        return { ...ach, unlockedAt: timestamp };
      }
      return ach;
    });

    if (newlyUnlocked) {
      set({ achievements: updatedAchievements });
      if (auth.currentUser) {
        try {
          const userRef = doc(db, 'users', auth.currentUser.uid);
          await updateDoc(userRef, { achievements: updatedAchievements });
        } catch (error) {
          handleFirestoreError(error, OperationType.UPDATE, `users/${auth.currentUser.uid}/achievements`);
        }
      }
    }
  },

  updateMissionProgress: () => {
    const { missions, actions, habits } = get();
    const categoryHabitMap: Record<string, string[]> = {
      'Transport': ['h4'],
      'Home Energy': ['h3'],
      'Food': ['h2', 'h5'],
      'Shopping': ['h1'],
      'Waste': ['h2']
    };
    const updatedMissions = missions.map(m => {
      if (m.completed) return m;
      const habitIds = categoryHabitMap[m.category] || [];
      const habitProgress = habits.filter(h => habitIds.includes(h.id) && h.completed).length;
      const actionProgress = actions.filter(a => a.category === m.category && a.completed).length;
      const current = Math.min(m.target, Math.max(m.current, habitProgress + actionProgress));
      return { ...m, current };
    });
    set({ missions: updatedMissions });
  },

  toggleHabit: async (id) => {
    const { habits, actions, carbonData } = get();
    const habitToToggle = habits.find(h => h.id === id);
    if (!habitToToggle) return;
    
    const isCompleting = !habitToToggle.completed;
    const newHabits = habits.map(h => h.id === id ? { ...h, completed: isCompleting } : h);
    set({ habits: newHabits });
    
    if (isCompleting) {
      await get().addXPEcoPoints(5, 5); // +XP
      await get().updateStreak();
      await get().updateMissionProgress();
    }
    
    // Completing a habit lowers today's emissions; skipping raises them.
    const { total, spent } = recomputeCarbonData(carbonData.breakdown, newHabits, actions, carbonData.budget || 300);
    const updatedCarbon = { ...carbonData, total, spent };
    set({ carbonData: updatedCarbon });

    if (auth.currentUser) {
      try {
        const userRef = doc(db, 'users', auth.currentUser.uid);
        await updateDoc(userRef, { habits: newHabits, carbonData: updatedCarbon });
        const lbRef = doc(db, 'leaderboard', auth.currentUser.uid);
        await updateDoc(lbRef, { updatedAt: serverTimestamp() });
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, `users/${auth.currentUser.uid}/habits`);
      }
    }
  },

  addHabit: async (habit) => {
    const { habits } = get();
    if (habits.find(h => h.id === habit.id)) return; // Already exists
    
    const newHabits = [...habits, habit];
    set({ habits: newHabits });
    
    if (auth.currentUser) {
      try {
        const userRef = doc(db, 'users', auth.currentUser.uid);
        await updateDoc(userRef, { habits: newHabits });
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, `users/${auth.currentUser.uid}/habits`);
      }
    }
  },

  removeHabit: async (id) => {
    const { habits, actions, carbonData } = get();
    const habitToRemove = habits.find(h => h.id === id);
    if (!habitToRemove) return;
    
    if (habitToRemove.completed) {
      await get().addXPEcoPoints(-5, -5);
    }
    
    const newHabits = habits.filter(h => h.id !== id);
    set({ habits: newHabits });

    const { total, spent } = recomputeCarbonData(carbonData.breakdown, newHabits, actions, carbonData.budget || 300);
    const updatedCarbon = { ...carbonData, total, spent };
    set({ carbonData: updatedCarbon });
    
    if (auth.currentUser) {
      try {
        const userRef = doc(db, 'users', auth.currentUser.uid);
        await updateDoc(userRef, { habits: newHabits, carbonData: updatedCarbon });
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, `users/${auth.currentUser.uid}/habits`);
      }
    }
  },
  
  setReductionGoal: async (goal) => {
    const { carbonData } = get();
    const previousGoal = carbonData.reductionGoal && !isNaN(Number(carbonData.reductionGoal))
      ? Number(carbonData.reductionGoal)
      : 50;

    let validatedGoal = Number(goal);
    if (goal === null || goal === undefined || isNaN(validatedGoal) || String(goal).trim() === '') {
      validatedGoal = previousGoal;
    }

    if (validatedGoal <= 0) {
      validatedGoal = previousGoal;
    }

    const newCarbonData = { ...carbonData, reductionGoal: validatedGoal };
    set({ carbonData: newCarbonData });
    
    if (auth.currentUser) {
      try {
        const userRef = doc(db, 'users', auth.currentUser.uid);
        await updateDoc(userRef, { 'carbonData.reductionGoal': validatedGoal });
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, `users/${auth.currentUser.uid}/carbonData.reductionGoal`);
      }
    }
  },

  completeMission: async (id) => {
    const { missions } = get();
    const mission = missions.find(m => m.id === id);
    if (!mission || mission.completed) return;
    if (!mission.current || mission.current < mission.target) return;

    const newMissions = missions.map(m => m.id === id ? { ...m, completed: true, current: m.target } : m);
    set({ missions: newMissions });
    
    await get().addXPEcoPoints(mission.xpReward, mission.ecoPointsReward);
    await get().updateStreak();

    if (auth.currentUser) {
      try {
        const userRef = doc(db, 'users', auth.currentUser.uid);
        await updateDoc(userRef, { missions: newMissions });
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, `users/${auth.currentUser.uid}/mission_completion`);
      }
    }

    await get().addActivity('mission', 'Mission Accomplished', `Completed: ${mission.title}`);
    await get().checkAchievements();
  },

  addXPEcoPoints: async (xpGain, ecoPointsGain) => {
    const { user } = get();
    if (!user) return;
    
    let action = 'habit';
    if (xpGain === 15) {
      action = 'action';
    } else if (xpGain > 15) {
      action = 'mission';
    } else if (xpGain === 0) {
      action = 'level_bonus';
    }

    try {
      const response = await axios.post('/api/xp/award', { action, xpGain, ecoPointsGain });
      const { verified, xpGain: verifiedXP, ecoPointsGain: verifiedEcoPoints } = response.data;
      if (!verified) {
        console.error("XP validation failed.");
        return;
      }
      xpGain = verifiedXP;
      ecoPointsGain = verifiedEcoPoints;
    } catch (e: unknown) {
      console.error("XP verification failed. Fraud attempt blocked.", e instanceof Error ? e.message : String(e));
      return;
    }

const newLifetimeXp = Math.max(0, (user.lifetimeXp || 0) + Math.max(0, xpGain));
    const newEcoPoints = Math.max(0, (user.ecoPoints || 0) + ecoPointsGain);

    // Eco Level depends ONLY on Lifetime XP and never decreases.
    const newLevel = ecoLevelFromLifetimeXp(newLifetimeXp);
    const newXp = newLifetimeXp % 500;

    const leveledUp = newLevel > (user.level || 1);
    if (leveledUp) {
      get().addActivity('level', 'Level Up!', `You've reached Level ${newLevel}`);
      get().addNotification('Level Up!', `Congratulations! You are now level ${newLevel}.`);
    }

    const newUser = { ...user, xp: newXp, level: newLevel, ecoPoints: newEcoPoints, lifetimeXp: newLifetimeXp };
    set({ user: newUser });
    
    if (auth.currentUser) {
      try {
        const userRef = doc(db, 'users', auth.currentUser.uid);
        await updateDoc(userRef, { 
          xp: newXp,
          level: newLevel,
          ecoPoints: newEcoPoints,
          lifetimeXp: newLifetimeXp
        });
        
        // Update leaderboard
        const lbRef = doc(db, 'leaderboard', auth.currentUser.uid);
        await updateDoc(lbRef, { 
          level: newLevel, 
          ecoPoints: newEcoPoints,
          lifetimeXp: newLifetimeXp,
          streak: user.streak || 0,
          updatedAt: serverTimestamp()
        });

        // After updating user stats, recalculate mission progress and unlock if needed
  
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, `users/${auth.currentUser.uid}/stats`);
      }
    }
  },

  updateStreak: async () => {
    const { user } = get();
    const today = new Date().toISOString().split('T')[0];
    const lastActivity = user.lastActivityDate;

    let newStreak = user.streak || 0;

    if (!lastActivity) {
      newStreak = 1;
    } else {
      const diffDays = getDaysDifference(lastActivity, today);

      if (diffDays === 1) {
        newStreak += 1;
      } else if (diffDays > 1) {
        newStreak = 1;
      }
    }

    const newLongestStreak = Math.max(user.longestStreak || 0, newStreak);
    const newTotalActiveDays = (user.totalActiveDays || 0) + (lastActivity === today ? 0 : 1);

    if (lastActivity !== today) {
       get().setUser({
         streak: newStreak,
         longestStreak: newLongestStreak,
         totalActiveDays: newTotalActiveDays,
         lastActivityDate: today
       });

       if (auth.currentUser) {
         try {
           const userRef = doc(db, 'users', auth.currentUser.uid);
           await updateDoc(userRef, {
             streak: newStreak,
             longestStreak: newLongestStreak,
             totalActiveDays: newTotalActiveDays,
             lastActivityDate: today
           });
           const lbRef = doc(db, 'leaderboard', auth.currentUser.uid);
           await updateDoc(lbRef, {
             streak: newStreak,
             updatedAt: serverTimestamp()
           });
         } catch(e) {
           handleFirestoreError(e, OperationType.WRITE, `users/${auth.currentUser.uid}/streak`);
         }
       }
    }
  },

  // Daily reset: archive yesterday's data, reset habits, and update last activity date.
  checkDailyReset: async () => {
    const { user, habits, missions, carbonData, dailyHistory } = get();
    if (!auth.currentUser) return;
    const todayStr = new Date().toISOString().split('T')[0];
    const lastActivity = user.lastActivityDate;

    // If no prior activity recorded, just set today as last activity.
    if (!lastActivity) {
      await get().setUser({ lastActivityDate: todayStr });
      return;
    }
    // No reset needed if already up‑to‑date.
    if (lastActivity === todayStr) return;

    // Archive the previous day's snapshot.
    const archiveDate = lastActivity;
    const completedHabits = habits.filter(h => h.completed).map(h => h.id);
    const completedMissions = missions.filter(m => m.completed).map(m => m.id);
    const savings = Math.max(0, (carbonData.budget || 0) - (carbonData.spent || carbonData.total));
    const newRecord: DailyRecord = {
      id: '', // Firestore will assign ID
      date: archiveDate,
      carbon: Math.round(carbonData.total),
      savings: Math.round(savings),
      xp: user.xp || 0,
      level: user.level || 1,
      streak: user.streak || 0,
      remainingBudget: Math.round(Math.max(0, (carbonData.budget || 0) - (carbonData.spent || carbonData.total))),
      completedHabits: completedHabits,
      completedMissions: completedMissions,
      timestamp: new Date().toISOString()
    };
    try {
      const recordRef = await addDoc(collection(db, `users/${auth.currentUser.uid}/dailyHistory`), {
        ...newRecord,
        createdAt: serverTimestamp()
      });
      const savedRecord = { id: recordRef.id, ...newRecord } as DailyRecord;
      set({ dailyHistory: [savedRecord, ...dailyHistory] });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `users/${auth.currentUser.uid}/dailyHistory`);
    }

    // Reset daily mutable states.
    const resetHabits = habits.map(h => ({ ...h, completed: false }));
    set({ habits: resetHabits });
    if (auth.currentUser) {
      try {
        const userRef = doc(db, 'users', auth.currentUser.uid);
        await updateDoc(userRef, { habits: resetHabits });
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, `users/${auth.currentUser.uid}/habits`);
      }
    }

    // Update user's last activity date to today. Streak will be refreshed on next activity.
    await get().setUser({ lastActivityDate: todayStr });
    if (auth.currentUser) {
      try {
        const userRef = doc(db, 'users', auth.currentUser.uid);
        await updateDoc(userRef, { lastActivityDate: todayStr });
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, `users/${auth.currentUser.uid}/lastActivityDate`);
      }
    }
  },

  addActivity: async (type, title, description, metadata) => {
    if (!auth.currentUser) return;
    try {
      const activitiesRef = collection(db, `users/${auth.currentUser.uid}/activities`);
      const newActivityDoc = {
        type,
        title,
        description,
        timestamp: new Date().toISOString(),
        metadata: metadata || {}
      };
      
      const docRef = await addDoc(activitiesRef, {
        ...newActivityDoc,
        timestamp: serverTimestamp()
      });

      // Appending to the local activities state immediately for instant feedback
      const { activities } = get();
      set({
        activities: [
          { id: docRef.id, ...newActivityDoc } as Activity,
          ...activities
        ].slice(0, 50)
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `users/${auth.currentUser.uid}/activities`);
    }
  },

  addNotification: async (title, message, link) => {
    if (!auth.currentUser) return;
    try {
      const notificationsRef = collection(db, `users/${auth.currentUser.uid}/notifications`);
      await addDoc(notificationsRef, {
        title,
        message,
        link: link || '',
        read: false,
        timestamp: serverTimestamp()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `users/${auth.currentUser.uid}/notifications`);
    }
  },

  markNotificationRead: async (id) => {
    if (!auth.currentUser) return;
    try {
      const notifRef = doc(db, `users/${auth.currentUser.uid}/notifications`, id);
      await updateDoc(notifRef, { read: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${auth.currentUser.uid}/notifications/${id}`);
    }
  },

  addTree: async (count, date, notes) => {
    const uid = auth.currentUser?.uid;
    let safeCount = Math.max(1, Math.floor(Number(count) || 0));
    if (!uid || safeCount <= 0) return;

    // Estimated annual carbon offset per tree (kg CO2 absorbed per tree per year).
    const offsetEach = CO2_PER_TREE;
    const offsetKg = Math.round(safeCount * offsetEach * 10) / 10;
    safeCount = Math.min(safeCount, 10000);

    const entry: TreeEntry = {
      count: safeCount,
      date: date || new Date().toISOString().split('T')[0],
      notes: notes || '',
      offsetKg,
      createdAt: new Date().toISOString()
    };

    const { treeEntries, treesPlanted, treesOffsetKg } = get();
    const newTreeEntries = [entry, ...treeEntries].slice(0, 200);
    const newTreesPlanted = (treesPlanted || 0) + safeCount;
    const newTreesOffsetKg = Math.round(((treesOffsetKg || 0) + offsetKg) * 10) / 10;

    // Optimistic update so the dashboard reflects the change immediately.
    set({ treeEntries: newTreeEntries, treesPlanted: newTreesPlanted, treesOffsetKg: newTreesOffsetKg });

    try {
      await addDoc(collection(db, `users/${uid}/trees`), {
        count: safeCount,
        date: entry.date,
        notes: notes || '',
        offsetKg,
        createdAt: serverTimestamp()
      });

      const userRef = doc(db, 'users', uid);
      await updateDoc(userRef, { treesPlanted: newTreesPlanted, treesOffsetKg: newTreesOffsetKg });

      await get().addActivity(
        'tree',
        'Trees Planted',
        `You planted ${safeCount} tree${safeCount === 1 ? '' : 's'} — offsetting approximately ${offsetKg} kg CO₂e per year.`,
        { count: safeCount, date: entry.date, offsetKg }
      );
    } catch (error) {
      // Roll back the optimistic update on failure.
      set({ treeEntries, treesPlanted: treesPlanted || 0, treesOffsetKg: treesOffsetKg || 0 });
      handleFirestoreError(error, OperationType.WRITE, `users/${uid}/trees`);
    }
  },
}));
