import { create } from 'zustand';

interface JobStore {
  // State
  jobCreationCount: number;
  
  // Actions
  triggerJobCreation: () => void;
  resetJobCreationCount: () => void;
  setJobCreationCount: (count: number) => void;
}

export const useJobStore = create<JobStore>((set) => ({
  jobCreationCount: 0,

  triggerJobCreation: () => {
    set((state) => ({
      jobCreationCount: state.jobCreationCount + 1,
    }));
  },

  resetJobCreationCount: () => {
    set({ jobCreationCount: 0 });
  },

  setJobCreationCount: (count) => {
    set({ jobCreationCount: count });
  },
})); 