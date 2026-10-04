import { Mission, UserProfile } from "../types";

export function generateWeeklyMissions(_profile: UserProfile): Mission[] {
  return [
    { 
      id: 'm1', 
      title: 'Use public transport twice', 
      description: 'Log 2 commutes via Metro or Bus', 
      target: 2, current: 0, 
      completed: false, 
      xpReward: 150, 
      ecoPointsReward: 300,
      category: 'Transport' 
    },
    { 
      id: 'm2', 
      title: 'Reduce electricity usage by 10%', 
      description: 'Lower your average daily consumption', 
      target: 1, current: 0, 
      completed: false, 
      xpReward: 200, 
      ecoPointsReward: 450,
      category: 'Home Energy' 
    },
    { 
       id: 'm3', 
       title: 'Avoid food delivery for 3 days', 
       description: 'Cook at home to reduce packaging waste', 
       target: 3, current: 0, 
       completed: false, 
       xpReward: 120, 
       ecoPointsReward: 250,
       category: 'Food' 
    },
  ];
}
