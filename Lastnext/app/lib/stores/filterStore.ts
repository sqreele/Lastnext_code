import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface FilterState {
  status: string;
  frequency: string;
  search: string;
  startDate: string;
  endDate: string;
  page: number;
  pageSize: number;
  machine: string;
  topic: string;
}

interface FilterStore extends FilterState {
  // Actions
  setCurrentFilters: (filters: Partial<FilterState>) => void;
  clearFilters: () => void;
  updateFilter: (key: keyof FilterState, value: string | number) => void;
  resetPage: () => void;
  
  // Getters
  get currentFilters(): FilterState;
}

const defaultFilters: FilterState = {
  status: '',
  frequency: '',
  search: '',
  startDate: '',
  endDate: '',
  page: 1,
  pageSize: 10,
  machine: '',
  topic: '',
};

export const useFilterStore = create<FilterStore>()(
  persist(
    (set, get) => ({
      ...defaultFilters,

      setCurrentFilters: (filters) => {
        set((state) => ({
          ...state,
          ...filters,
        }));
      },

      clearFilters: () => {
        set((state) => ({
          ...state,
          ...defaultFilters,
        }));
      },

      updateFilter: (key, value) => {
        set((state) => ({
          ...state,
          [key]: value,
          // Reset page when filter changes (except when updating page itself)
          ...(key !== 'page' && key !== 'pageSize' && { page: 1 }),
        }));
      },

      resetPage: () => {
        set((state) => ({
          ...state,
          page: 1,
        }));
      },

      get currentFilters(): FilterState {
        return get();
      },
    }),
    {
      name: 'filter-store',
      partialize: (state) => ({
        status: state.status,
        frequency: state.frequency,
        search: state.search,
        startDate: state.startDate,
        endDate: state.endDate,
        pageSize: state.pageSize,
        machine: state.machine,
        topic: state.topic,
        // Don't persist page to avoid issues on page refresh
      }),
    }
  )
); 