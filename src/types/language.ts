// Language-related types

export interface LanguageInfo {
  label: string;
  value: string;
  icon: string;
}

export interface LanguageChangeEvent {
  previousLanguage: string;
  newLanguage: string;
  timestamp: Date;
}

export interface QueryInvalidationOptions {
  refetchCritical?: boolean;
  refetchType?: 'all' | 'active' | 'inactive' | 'none';
  includeLanguageSpecific?: boolean;
}

export interface LanguageContextType {
  currentLanguage: string;
  onLanguageChange: (newLang: string) => Promise<void>;
  refetchAllData: () => void;
  invalidateQueries: (type?: string) => void;
  isChangingLanguage: boolean;
}

export interface LanguageAwareComponentProps {
  onLanguageChange?: (event: LanguageChangeEvent) => void;
  autoRefetchOnLanguageChange?: boolean;
  refetchQueries?: string[];
}
