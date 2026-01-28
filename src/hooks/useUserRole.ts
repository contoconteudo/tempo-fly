import { useState, useEffect, useCallback } from "react";
import { useAuth } from "./useAuth";
import { supabase, isSupabaseConfigured } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

// Re-exportando tipos para uso externo
export type AppRole = "admin" | "gestor" | "comercial" | "analista";
export type ModulePermission = "dashboard" | "crm" | "clients" | "objectives" | "strategy" | "settings" | "admin";
export type CompanyAccess = string; // ID do espaço/empresa

interface UserPermissionsData {
  role: AppRole;
  modules: ModulePermission[];
  spaces: CompanyAccess[];
}

interface UseUserRoleReturn {
  role: AppRole | null;
  isLoading: boolean;
  isAdmin: boolean;
  isGestor: boolean;
  isComercial: boolean;
  isAnalista: boolean;
  hasRole: (role: AppRole) => boolean;
  canAccessModule: (module: ModulePermission) => boolean;
  canAccessCompany: (company: CompanyAccess) => boolean;
  getUserModules: () => ModulePermission[];
  getUserCompanies: () => CompanyAccess[];
  // Funções de Admin (CRUD de usuários)
  getAllUsers: () => any[]; // Retorna dados mockados para AdminDashboard, pois não temos todos os users no frontend
  updateUserPermissions: (userId: string, modules: ModulePermission[], companies: CompanyAccess[]) => void;
  updateUserRole: (userId: string, role: AppRole) => void;
}

// Função de fetch para roles e permissions
const fetchUserPermissions = async (userId: string | undefined): Promise<UserPermissionsData> => {
  if (!userId || !isSupabaseConfigured) {
    // Retorna permissões mínimas se não autenticado ou Supabase não configurado
    return { role: "analista", modules: ["dashboard", "settings"], spaces: [] };
  }

  // 1. Buscar Role
  const { data: roleData, error: roleError } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', userId)
    .limit(1)
    .single();

  if (roleError) {
    console.error("Erro ao buscar role:", roleError);
    // Fallback para analista em caso de erro
    return { role: "analista", modules: ["dashboard", "settings"], spaces: [] };
  }

  const role = roleData?.role as AppRole || "analista";

  // 2. Buscar Permissões Granulares (Módulos e Espaços)
  const { data: permsData, error: permsError } = await supabase
    .from('user_permissions')
    .select('modules, spaces')
    .eq('user_id', userId)
    .limit(1)
    .single();

  if (permsError && permsError.code !== 'PGRST116') { // PGRST116 = No rows found
    console.error("Erro ao buscar permissões:", permsError);
  }

  let modules: ModulePermission[] = (permsData?.modules as ModulePermission[] || []);
  let spaces: CompanyAccess[] = (permsData?.spaces as CompanyAccess[] || []);

  // 3. Regras de Admin
  if (role === 'admin') {
    // Admin tem acesso a todos os módulos e espaços (hardcoded para evitar dependência circular)
    modules = ["dashboard", "strategy", "crm", "clients", "settings", "admin"];
    spaces = ["conto", "amplia"]; // Hardcoded spaces for mock compatibility, should fetch all spaces in production
  }

  // 4. Regras de Default (se não houver permissões granulares salvas)
  if (role !== 'admin' && modules.length === 0) {
    // Usar defaults baseados na role se não houver permissões granulares
    const defaultModules = {
      gestor: ["dashboard", "strategy", "crm", "clients", "settings"],
      comercial: ["dashboard", "crm", "clients", "settings"],
      analista: ["dashboard", "settings"],
    };
    modules = defaultModules[role] || ["dashboard", "settings"];
  }

  return { role, modules, spaces };
};

export function useUserRole(): UseUserRoleReturn {
  const { user, isLoading: authLoading } = useAuth();
  const queryClient = useQueryClient();

  const { data, isLoading: permsLoading } = useQuery({
    queryKey: ['userPermissions', user?.id],
    queryFn: () => fetchUserPermissions(user?.id),
    enabled: !!user?.id && isSupabaseConfigured,
    staleTime: 1000 * 60 * 5, // 5 minutes
    initialData: { role: null, modules: [], spaces: [] } as UserPermissionsData,
  });

  const role = data?.role || null;
  const userModules = data?.modules || [];
  const userCompanies = data?.spaces || [];
  const isLoading = authLoading || permsLoading;

  const isAdmin = role === "admin";
  const isGestor = role === "gestor";
  const isComercial = role === "comercial";
  const isAnalista = role === "analista";

  const hasRole = useCallback((checkRole: AppRole): boolean => {
    return role === checkRole;
  }, [role]);

  const canAccessModule = useCallback((module: ModulePermission): boolean => {
    if (!role) return false;
    if (isAdmin) return true;
    return userModules.includes(module);
  }, [role, isAdmin, userModules]);

  const canAccessCompany = useCallback((company: CompanyAccess): boolean => {
    if (!role) return false;
    if (isAdmin) return true;
    return userCompanies.includes(company);
  }, [role, isAdmin, userCompanies]);

  const getUserModules = useCallback((): ModulePermission[] => {
    return userModules;
  }, [userModules]);

  const getUserCompanies = useCallback((): CompanyAccess[] => {
    return userCompanies;
  }, [userCompanies]);

  // --- Admin Actions (Simulação de CRUD de usuários) ---
  
  // Em um ambiente real, esta função faria uma chamada RPC ou buscaria dados de uma tabela 'profiles'
  // Como não temos acesso a todos os usuários do auth.users no frontend (por RLS), mantemos um mock simples para a UI
  const getAllUsers = useCallback((): any[] => {
    // Em produção, o AdminDashboard deve buscar dados de perfis e roles via Edge Function ou Service Role
    // Por enquanto, retornamos um array vazio para evitar erros, já que MOCK_USERS está vazio.
    return [];
  }, []);

  const updateUserPermissions = useCallback(async (userId: string, modules: ModulePermission[], companies: CompanyAccess[]) => {
    if (!isAdmin) {
      toast.error("Apenas administradores podem alterar permissões.");
      return;
    }
    
    const { error } = await supabase
      .from('user_permissions')
      .upsert({ user_id: userId, modules, spaces: companies }, { onConflict: 'user_id' });

    if (error) {
      toast.error(`Erro ao salvar permissões: ${error.message}`);
    } else {
      // Invalida a query para o usuário afetado (se for o próprio admin, ele verá a mudança)
      queryClient.invalidateQueries({ queryKey: ['userPermissions', userId] });
    }
  }, [isAdmin, queryClient]);

  const updateUserRole = useCallback(async (userId: string, newRole: AppRole) => {
    if (!isAdmin) {
      toast.error("Apenas administradores podem alterar roles.");
      return;
    }
    
    const { error } = await supabase
      .from('user_roles')
      .update({ role: newRole })
      .eq('user_id', userId);

    if (error) {
      toast.error(`Erro ao salvar role: ${error.message}`);
    } else {
      queryClient.invalidateQueries({ queryKey: ['userPermissions', userId] });
    }
  }, [isAdmin, queryClient]);

  return {
    role,
    isLoading,
    isAdmin,
    isGestor,
    isComercial,
    isAnalista,
    hasRole,
    canAccessModule,
    canAccessCompany,
    getUserModules,
    getUserCompanies,
    getAllUsers,
    updateUserPermissions,
    updateUserRole,
  };
}