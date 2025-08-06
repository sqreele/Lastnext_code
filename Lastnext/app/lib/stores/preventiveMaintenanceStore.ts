import { create } from 'zustand';
import { 
  PreventiveMaintenance, 
  FrequencyType, 
  ServiceResponse,
  itemMatchesMachine
} from '@/app/lib/preventiveMaintenanceModels';
import { 
  preventiveMaintenanceService,
  CreatePreventiveMaintenanceData, 
  UpdatePreventiveMaintenanceData,
  CompletePreventiveMaintenanceData,
  DashboardStats
} from '@/app/lib/PreventiveMaintenanceService';
import TopicService from '@/app/lib/TopicService';
import MachineService, { Machine } from '@/app/lib/MachineService';
import { Topic } from '@/app/lib/TopicService';

export interface SearchParams {
  status?: string;
  frequency?: string;
  page?: number;
  page_size?: number;
  search?: string;
  start_date?: string;
  end_date?: string;
  property_id?: string;
  topic_id?: string;
  machine_id?: string;
}

export type PreventiveMaintenanceRequest = CreatePreventiveMaintenanceData;
export type PreventiveMaintenanceUpdateRequest = UpdatePreventiveMaintenanceData;
export type PreventiveMaintenanceCompleteRequest = CompletePreventiveMaintenanceData;

interface PreventiveMaintenanceState {
  // State
  maintenanceItems: PreventiveMaintenance[];
  topics: Topic[];
  machines: Machine[];
  statistics: DashboardStats | null;
  selectedMaintenance: PreventiveMaintenance | null;
  totalCount: number;
  isLoading: boolean;
  error: string | null;
  filterParams: SearchParams;
}

interface PreventiveMaintenanceActions {
  // Actions
  setMaintenanceItems: (items: PreventiveMaintenance[]) => void;
  setTopics: (topics: Topic[]) => void;
  setMachines: (machines: Machine[]) => void;
  setStatistics: (stats: DashboardStats | null) => void;
  setSelectedMaintenance: (maintenance: PreventiveMaintenance | null) => void;
  setTotalCount: (count: number) => void;
  setIsLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setFilterParams: (params: SearchParams) => void;
  clearError: () => void;
  
  // Async Actions
  fetchMaintenanceItems: (params?: SearchParams) => Promise<void>;
  fetchStatistics: () => Promise<void>;
  fetchMaintenanceById: (pmId: string) => Promise<PreventiveMaintenance | null>;
  fetchMaintenanceByMachine: (machineId: string) => Promise<void>;
  createMaintenance: (data: PreventiveMaintenanceRequest) => Promise<PreventiveMaintenance | null>;
  updateMaintenance: (pmId: string, data: PreventiveMaintenanceUpdateRequest) => Promise<PreventiveMaintenance | null>;
  deleteMaintenance: (pmId: string) => Promise<boolean>;
  completeMaintenance: (pmId: string, data: PreventiveMaintenanceCompleteRequest) => Promise<PreventiveMaintenance | null>;
  fetchTopics: () => Promise<void>;
  fetchMachines: (propertyId?: string) => Promise<void>;
  debugMachineFilter: (machineId: string) => Promise<void>;
  testMachineFiltering: () => void;
}

type PreventiveMaintenanceStore = PreventiveMaintenanceState & PreventiveMaintenanceActions;

const initialState: PreventiveMaintenanceState = {
  maintenanceItems: [],
  topics: [],
  machines: [],
  statistics: null,
  selectedMaintenance: null,
  totalCount: 0,
  isLoading: false,
  error: null,
  filterParams: {
    status: '',
    page: 1,
    page_size: 10,
  },
};

export const usePreventiveMaintenanceStore = create<PreventiveMaintenanceStore>((set, get) => ({
  ...initialState,

  // State setters
  setMaintenanceItems: (items) => set({ maintenanceItems: items }),
  setTopics: (topics) => set({ topics }),
  setMachines: (machines) => set({ machines }),
  setStatistics: (stats) => set({ statistics: stats }),
  setSelectedMaintenance: (maintenance) => set({ selectedMaintenance: maintenance }),
  setTotalCount: (count) => set({ totalCount: count }),
  setIsLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  setFilterParams: (params) => set((state) => ({ 
    filterParams: { ...state.filterParams, ...params } 
  })),
  clearError: () => set({ error: null }),

  // Async Actions
  fetchMaintenanceItems: async (params) => {
    const { filterParams, clearError, setMaintenanceItems, setTotalCount, setIsLoading, setError } = get();
    
    setIsLoading(true);
    clearError();

    try {
      const fetchParams = { ...filterParams, ...params };
      console.log('🔄 Fetching maintenance items with params:', fetchParams);

      const queryParams: Record<string, string | number> = {};
      if (fetchParams.status) queryParams.status = fetchParams.status;
      if (fetchParams.frequency) queryParams.frequency = fetchParams.frequency;
      if (fetchParams.search) queryParams.search = fetchParams.search;
      if (fetchParams.start_date) queryParams.date_from = fetchParams.start_date;
      if (fetchParams.end_date) queryParams.date_to = fetchParams.end_date;
      if (fetchParams.property_id) queryParams.property_id = fetchParams.property_id;
      if (fetchParams.topic_id) queryParams.topic_id = fetchParams.topic_id;

      let finalItems: PreventiveMaintenance[] = [];
      let finalCount = 0;

      if (fetchParams.machine_id) {
        console.log(`🎯 Machine filter detected: ${fetchParams.machine_id}`);
        console.log('📡 Getting all data for client-side machine filtering...');
        
        const response = await preventiveMaintenanceService.getAllPreventiveMaintenance(queryParams);
        
        if (response.success && response.data) {
          let allItems: PreventiveMaintenance[] = [];
          
          if (Array.isArray(response.data)) {
            allItems = response.data;
          } else if (response.data && 'results' in response.data) {
            allItems = (response.data as any).results;
          }
          
          console.log(`📡 Got ${allItems.length} total items`);
          
          finalItems = allItems.filter(item => {
            const matches = itemMatchesMachine(item, fetchParams.machine_id!);
            return matches;
          });
          
          finalCount = finalItems.length;
          
          console.log(`✅ Client-side machine filtering result: ${allItems.length} -> ${finalItems.length} items`);
        }
      } else {
        if (fetchParams.page) queryParams.page = fetchParams.page;
        if (fetchParams.page_size) queryParams.page_size = fetchParams.page_size;
        
        const response = await preventiveMaintenanceService.getAllPreventiveMaintenance(queryParams);

        if (response.success && response.data) {
          if (Array.isArray(response.data)) {
            finalItems = response.data;
            finalCount = finalItems.length;
          } else if (response.data && 'results' in response.data) {
            finalItems = (response.data as any).results;
            finalCount = (response.data as any).count || finalItems.length;
          }
        } else {
          throw new Error(response.message || 'Failed to fetch maintenance items');
        }
      }

      setMaintenanceItems(finalItems);
      setTotalCount(finalCount);
      
      console.log(`📊 Final result: ${finalItems.length} items loaded, total count: ${finalCount}`);
      
    } catch (err: any) {
      console.error('❌ Error fetching maintenance items:', err);
      setError(err.message || 'Failed to fetch maintenance items');
      setMaintenanceItems([]);
      setTotalCount(0);
    } finally {
      setIsLoading(false);
    }
  },

  fetchStatistics: async () => {
    const { setStatistics, setError, setIsLoading } = get();
    
    try {
      setIsLoading(true);
      const response = await preventiveMaintenanceService.getMaintenanceStatistics();
      
      if (response.success && response.data) {
        setStatistics(response.data);
      } else {
        throw new Error(response.message || 'Failed to fetch statistics');
      }
    } catch (err: any) {
      console.error('Error fetching statistics:', err);
      setError(err.message || 'Failed to fetch statistics');
    } finally {
      setIsLoading(false);
    }
  },

  fetchMaintenanceById: async (pmId) => {
    const { setSelectedMaintenance, setError } = get();
    
    try {
      const response = await preventiveMaintenanceService.getPreventiveMaintenanceById(pmId);
      
      if (response.success && response.data) {
        setSelectedMaintenance(response.data);
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to fetch maintenance item');
      }
    } catch (err: any) {
      console.error('Error fetching maintenance by ID:', err);
      setError(err.message || 'Failed to fetch maintenance item');
      return null;
    }
  },

  fetchMaintenanceByMachine: async (machineId) => {
    const { fetchMaintenanceItems, setFilterParams } = get();
    
    setFilterParams({ machine_id: machineId });
    await fetchMaintenanceItems({ machine_id: machineId });
  },

  createMaintenance: async (data) => {
    const { fetchMaintenanceItems, setError } = get();
    
    try {
      const response = await preventiveMaintenanceService.createPreventiveMaintenance(data);
      
      if (response.success && response.data) {
        await fetchMaintenanceItems();
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to create maintenance item');
      }
    } catch (err: any) {
      console.error('Error creating maintenance:', err);
      setError(err.message || 'Failed to create maintenance item');
      return null;
    }
  },

  updateMaintenance: async (pmId, data) => {
    const { fetchMaintenanceItems, setError } = get();
    
    try {
      const response = await preventiveMaintenanceService.updatePreventiveMaintenance(pmId, data);
      
      if (response.success && response.data) {
        await fetchMaintenanceItems();
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to update maintenance item');
      }
    } catch (err: any) {
      console.error('Error updating maintenance:', err);
      setError(err.message || 'Failed to update maintenance item');
      return null;
    }
  },

  deleteMaintenance: async (pmId) => {
    const { fetchMaintenanceItems, setError } = get();
    
    try {
      const response = await preventiveMaintenanceService.deletePreventiveMaintenance(pmId);
      
      if (response.success) {
        await fetchMaintenanceItems();
        return true;
      } else {
        throw new Error(response.message || 'Failed to delete maintenance item');
      }
    } catch (err: any) {
      console.error('Error deleting maintenance:', err);
      setError(err.message || 'Failed to delete maintenance item');
      return false;
    }
  },

  completeMaintenance: async (pmId, data) => {
    const { fetchMaintenanceItems, setError } = get();
    
    try {
      const response = await preventiveMaintenanceService.completePreventiveMaintenance(pmId, data);
      
      if (response.success && response.data) {
        await fetchMaintenanceItems();
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to complete maintenance item');
      }
    } catch (err: any) {
      console.error('Error completing maintenance:', err);
      setError(err.message || 'Failed to complete maintenance item');
      return null;
    }
  },

  fetchTopics: async () => {
    const { setTopics, setError } = get();
    
    try {
      const topicService = new TopicService();
      const response = await topicService.getTopics();
      
      if (response.success && response.data) {
        setTopics(response.data);
      } else {
        console.warn('Failed to fetch topics:', response.message);
        setTopics([]);
      }
    } catch (err: any) {
      console.warn('Error fetching topics:', err.message);
      setTopics([]);
    }
  },

  fetchMachines: async (propertyId) => {
    const { setMachines, setError } = get();
    
    try {
      console.log('🏭 Fetching machines...');
      const machineService = new MachineService();
      const response = await machineService.getMachines(propertyId);

      if (response.success && response.data) {
        console.log(`✅ Loaded ${response.data.length} machines:`, response.data);
        setMachines(response.data);
      } else {
        console.warn('⚠️ Failed to fetch machines:', response.message);
        setMachines([]);
      }
    } catch (err: any) {
      console.warn('⚠️ Error fetching machines:', err.message);
      setMachines([]);
    }
  },

  debugMachineFilter: async (machineId) => {
    const { maintenanceItems } = get();
    console.log('🔍 Debugging machine filter for:', machineId);
    console.log('Current items:', maintenanceItems.map(item => ({
      id: item.pm_id,
      title: item.pmtitle,
      machines: item.machines?.map(m => `${m.name} (${m.machine_id})`)
    })));
  },

  testMachineFiltering: () => {
    const { maintenanceItems } = get();
    console.log('🧪 Testing machine filtering...');
    console.log('All items:', maintenanceItems.length);
    console.log('Items with machines:', maintenanceItems.filter(item => item.machines && item.machines.length > 0).length);
  },
})); 