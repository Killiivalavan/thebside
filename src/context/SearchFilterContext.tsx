import { createContext, useContext, useState, ReactNode } from 'react';

export type SearchFilters = {
  tracks: boolean;
  albums: boolean;
  artists: boolean;
  playlists: boolean;
  users: boolean;
};

type SearchFilterContextType = {
  filters: SearchFilters;
  toggleFilter: (key: keyof SearchFilters) => void;
  resetFilters: () => void;
};

const SearchFilterContext = createContext<SearchFilterContextType | undefined>(undefined);

const defaultFilters: SearchFilters = {
  tracks: true,
  albums: true,
  artists: true,
  playlists: true,
  users: true,
};

export function SearchFilterProvider({ children }: { children: ReactNode }) {
  const [filters, setFilters] = useState<SearchFilters>(defaultFilters);

  const toggleFilter = (key: keyof SearchFilters) => {
    setFilters(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const resetFilters = () => {
    setFilters(defaultFilters);
  };

  return (
    <SearchFilterContext.Provider value={{ filters, toggleFilter, resetFilters }}>
      {children}
    </SearchFilterContext.Provider>
  );
}

export function useSearchFilters() {
  const context = useContext(SearchFilterContext);
  if (!context) {
    throw new Error('useSearchFilters must be used within SearchFilterProvider');
  }
  return context;
}
