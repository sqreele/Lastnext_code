import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Property {
  property_id: string;
  name: string;
  description?: string | null;
  users?: number[];
  created_at?: string;
  id: string | number;
}

interface PropertyStore {
  // State
  selectedProperty: string | null;
  userProperties: Property[];
  
  // Computed
  hasProperties: boolean;
  
  // Actions
  setSelectedProperty: (propertyId: string | null) => void;
  setUserProperties: (properties: Property[]) => void;
  clearProperties: () => void;
  selectFirstProperty: () => void;
}

export const usePropertyStore = create<PropertyStore>()(
  persist(
    (set, get) => ({
      selectedProperty: null,
      userProperties: [],
      
      get hasProperties() {
        return get().userProperties.length > 0;
      },

      setSelectedProperty: (propertyId) => {
        const { userProperties } = get();
        
        if (!propertyId || propertyId === "") {
          set({ selectedProperty: null });
          return;
        }
        
        // Validate that the property exists in user properties
        const propertyExists = userProperties.some(p => p.property_id === propertyId);
        
        if (propertyExists) {
          set({ selectedProperty: propertyId });
        } else {
          console.warn(`Property ID not found in user properties:`, propertyId);
        }
      },

      setUserProperties: (properties) => {
        // Normalize properties to ensure consistent property_id
        const normalizedProperties = properties.map((prop: any) => {
          const propertyId = prop.property_id ? String(prop.property_id) : 
                             prop.id ? String(prop.id) : 
                             (typeof prop === 'string' || typeof prop === 'number') ? String(prop) : null;
          
          return {
            ...prop,
            property_id: propertyId || '1',
            name: prop.name || `Property ${propertyId || 'Unknown'}`
          };
        });
        
        set({ userProperties: normalizedProperties });
        
        // Auto-select first property if none selected and properties exist
        const { selectedProperty } = get();
        if (normalizedProperties.length > 0 && !selectedProperty) {
          set({ selectedProperty: normalizedProperties[0].property_id });
        }
      },

      clearProperties: () => {
        set({ userProperties: [], selectedProperty: null });
      },

      selectFirstProperty: () => {
        const { userProperties } = get();
        if (userProperties.length > 0) {
          set({ selectedProperty: userProperties[0].property_id });
        }
      },
    }),
    {
      name: 'property-store',
      partialize: (state) => ({
        selectedProperty: state.selectedProperty,
        // Don't persist userProperties as they come from session
      }),
    }
  )
); 