/**
 * Hook para gerenciar espaços (empresas) do sistema.
 */

import { useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase, isSupabaseConfigured } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useUserRole } from "./useUserRole";

export interface Space {
  id: string;
  label: string;
  description: string;
  color: string;
  created_at: string;
}

// Cores disponíveis para novos espaços
export const SPACE_COLORS = [
  { value: "bg-primary", label: "Magenta" },
  { value: "bg-blue-600", label: "Azul" },
  { value: "bg-green-600", label: "Verde" },
  { value: "bg-purple-600", label: "Roxo" },
  { value: "bg-orange-600", label: "Laranja" },
  { value: "bg-cyan-600", label: "Ciano" },
  { value: "bg-rose-600", label: "Rosa" },
  { value: "bg-amber-600", label: "Âmbar" },
];

// Função de fetch para espaços
const fetchSpaces = async (): Promise<Space[]> => {
  if (!isSupabaseConfigured) return [];
  
  const { data, error } = await supabase
    .from('spaces')
    .select('*')
    .order('label', { ascending: true });

  if (error) {
    console.error("Erro ao buscar espaços:", error);
    throw new Error("Falha ao carregar espaços.");
  }
  return data as Space[];
};

// Função para gerar ID único baseado no nome
const generateSpaceId = (name: string): string => {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove acentos
    .replace(/[^a-z0-9]/g, "-") // Substitui caracteres especiais por hífen
    .replace(/-+/g, "-") // Remove hífens duplicados
    .replace(/^-|-$/g, ""); // Remove hífens no início/fim
};

export function useSpaces() {
  const queryClient = useQueryClient();
  const { isAdmin } = useUserRole();

  const { data: spaces = [], isLoading } = useQuery<Space[]>({
    queryKey: ['spaces'],
    queryFn: fetchSpaces,
    enabled: isSupabaseConfigured,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });

  const invalidateSpaces = () => {
    queryClient.invalidateQueries({ queryKey: ['spaces'] });
  };

  const createMutation = useMutation({
    mutationFn: async (data: { label: string; description: string; color: string }) => {
      if (!isAdmin) throw new Error("Apenas administradores podem criar espaços.");
      
      const id = generateSpaceId(data.label);
      
      if (spaces.some(s => s.id === id)) {
        throw new Error("Já existe um espaço com nome similar.");
      }

      const { error } = await supabase
        .from('spaces')
        .insert({ id, label: data.label, description: data.description, color: data.color });

      if (error) throw error;
      return { id, ...data };
    },
    onSuccess: () => {
      invalidateSpaces();
    },
    onError: (error) => {
      toast.error(`Erro ao criar espaço: ${error.message}`);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!isAdmin) throw new Error("Apenas administradores podem excluir espaços.");
      if (spaces.length <= 1) throw new Error("Não é possível excluir o último espaço.");
      
      const { error } = await supabase
        .from('spaces')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      invalidateSpaces();
      // Disparar evento para CompanyContext atualizar
      window.dispatchEvent(new CustomEvent("spaces-changed"));
    },
    onError: (error) => {
      toast.error(`Erro ao excluir espaço: ${error.message}`);
    }
  });

  const createSpace = useCallback((label: string, description: string, color: string) => {
    createMutation.mutate({ label, description, color });
    return { success: !createMutation.isError, error: createMutation.error?.message };
  }, [createMutation]);

  const deleteSpace = useCallback((id: string) => {
    deleteMutation.mutate(id);
    return { success: !deleteMutation.isError, error: deleteMutation.error?.message };
  }, [deleteMutation]);

  const getSpaceIds = useCallback((): string[] => {
    return spaces.map(s => s.id);
  }, [spaces]);

  return {
    spaces,
    isLoading,
    createSpace,
    deleteSpace,
    getSpaceIds,
    SPACE_COLORS,
  };
}

// Exportar função para uso em contextos sem hook (apenas para inicialização)
export const getAllSpaces = async (): Promise<Space[]> => {
  if (!isSupabaseConfigured) return [];
  const { data } = await supabase.from('spaces').select('*');
  return data as Space[] || [];
};