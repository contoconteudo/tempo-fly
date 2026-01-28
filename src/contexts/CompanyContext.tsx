import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { useUserRole, CompanyAccess } from "@/hooks/useUserRole";
import { useSpaces, Space } from "@/hooks/useSpaces";
import { toast } from "sonner";

export type Company = CompanyAccess;

interface CompanyContextType {
  currentCompany: Company;
  setCurrentCompany: (company: Company) => void;
  allowedCompanies: Company[];
  availableSpaces: Space[];
  isAdmin: boolean;
  isLoading: boolean;
}

const CompanyContext = createContext<CompanyContextType | undefined>(undefined);

const STORAGE_KEY = "conto-company-selection";

interface CompanyProviderProps {
  children: ReactNode;
}

export function CompanyProvider({ children }: CompanyProviderProps) {
  const { spaces: availableSpaces, isLoading: spacesLoading } = useSpaces();
  const { 
    isAdmin, 
    getUserCompanies, 
    isLoading: roleLoading, 
    isAuthenticated 
  } = useUserRole();
  
  const [currentCompany, setCurrentCompanyState] = useState<Company>("conto");
  const [allowedCompanies, setAllowedCompanies] = useState<Company[]>([]);
  
  const isLoading = spacesLoading || roleLoading;

  // 1. Determinar espaços permitidos e ajustar currentCompany
  const updateCompanyAccess = useCallback(() => {
    const spaceIds = availableSpaces.map(s => s.id);
    const userPermittedSpaces = getUserCompanies();
    
    let newAllowedCompanies: Company[];

    if (isAdmin) {
      newAllowedCompanies = spaceIds;
    } else if (userPermittedSpaces.length > 0) {
      // Filtrar apenas espaços que existem
      newAllowedCompanies = userPermittedSpaces.filter((c: string) => spaceIds.includes(c));
    } else {
      // Se não for admin e não tiver permissões, não pode acessar nada
      newAllowedCompanies = [];
    }

    setAllowedCompanies(newAllowedCompanies);

    // 2. Ajustar currentCompany
    const savedCompany = localStorage.getItem(STORAGE_KEY) as Company | null;
    
    if (savedCompany && newAllowedCompanies.includes(savedCompany)) {
      setCurrentCompanyState(savedCompany);
    } else if (newAllowedCompanies.length > 0) {
      // Se a empresa salva não for válida ou não existir, usar a primeira permitida
      const defaultCompany = newAllowedCompanies[0];
      setCurrentCompanyState(defaultCompany);
      localStorage.setItem(STORAGE_KEY, defaultCompany);
    } else if (spaceIds.length > 0) {
      // Fallback para o primeiro espaço se o usuário for admin ou se for o primeiro login
      setCurrentCompanyState(spaceIds[0]);
      localStorage.setItem(STORAGE_KEY, spaceIds[0]);
    } else {
      setCurrentCompanyState("conto"); // Default fallback
    }
  }, [availableSpaces, isAdmin, getUserCompanies]);

  useEffect(() => {
    if (!isLoading) {
      updateCompanyAccess();
    }
  }, [isLoading, updateCompanyAccess]);

  // Escutar evento de mudança de permissões (AdminDashboard)
  useEffect(() => {
    const handlePermsChange = () => {
      updateCompanyAccess();
    };

    window.addEventListener("auth-user-changed", handlePermsChange);
    window.addEventListener("spaces-changed", handlePermsChange);
    return () => {
      window.removeEventListener("auth-user-changed", handlePermsChange);
      window.removeEventListener("spaces-changed", handlePermsChange);
    };
  }, [updateCompanyAccess]);

  const setCurrentCompany = (company: Company) => {
    if (!isAdmin && !allowedCompanies.includes(company)) {
      toast.error(`Você não tem permissão para acessar o espaço ${company}`);
      return;
    }
    
    setCurrentCompanyState(company);
    localStorage.setItem(STORAGE_KEY, company);
  };

  return (
    <CompanyContext.Provider
      value={{
        currentCompany,
        setCurrentCompany,
        allowedCompanies,
        availableSpaces,
        isAdmin,
        isLoading,
      }}
    >
      {children}
    </CompanyContext.Provider>
  );
}

export function useCompany() {
  const context = useContext(CompanyContext);
  if (context === undefined) {
    throw new Error("useCompany must be used within a CompanyProvider");
  }
  return context;
}