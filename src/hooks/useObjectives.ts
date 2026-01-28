import { useCallback, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase, isSupabaseConfigured } from "@/integrations/supabase/client";
import { Objective, ProgressLog, ObjectiveValueType, ObjectiveStatus, CommercialDataSource } from "@/types";
import { useLeads } from "./useLeads";
import { useClients } from "./useClients";
import { useCompany } from "@/contexts/CompanyContext";
import { toast } from "sonner";

const OBJECTIVES_QUERY_KEY = 'objectives';

function calculateStatus(currentValue: number, targetValue: number, deadline: string): ObjectiveStatus {
  if (targetValue === 0) return "on_track";
  const progress = (currentValue / targetValue) * 100;
  const now = new Date();
  const deadlineDate = new Date(deadline);
  
  // Usar o início do ano atual como base para o cálculo de progresso esperado
  const startOfYear = new Date(now.getFullYear(), 0, 1); 
  
  const totalDays = (deadlineDate.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24);
  const daysElapsed = (now.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24);
  
  if (totalDays <= 0 || daysElapsed <= 0) {
    // Se o prazo já passou ou ainda não começou o ano, basear apenas no progresso
    if (progress >= 100) return "on_track";
    if (progress >= 75) return "at_risk";
    return "behind";
  }
  
  const expectedProgress = (daysElapsed / totalDays) * 100;

  if (progress >= expectedProgress - 10) return "on_track";
  if (progress >= expectedProgress - 25) return "at_risk";
  return "behind";
}

const fetchObjectives = async (spaceId: string): Promise<Objective[]> => {
  if (!isSupabaseConfigured) return [];
  
  const { data, error } = await supabase
    .from('objectives')
    .select(`
      *,
      progressLogs:progress_logs(*)
    `)
    .eq('space_id', spaceId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  
  return data.map(obj => ({
    ...obj,
    company_id: obj.space_id,
    valueType: obj.value_type,
    targetValue: obj.target_value,
    currentValue: obj.current_value,
    isCommercial: obj.is_commercial,
    dataSources: obj.data_sources,
    progressLogs: obj.progressLogs || [],
  })) as Objective[];
};

export function useObjectives() {
  const queryClient = useQueryClient();
  const { leads } = useLeads();
  const { clients } = useClients();
  const { currentCompany, isLoading: companyLoading } = useCompany();
  const userId = supabase.auth.getUser()?.id;

  const { data: objectives = [], isLoading } = useQuery<Objective[]>({
    queryKey: [OBJECTIVES_QUERY_KEY, currentCompany],
    queryFn: () => fetchObjectives(currentCompany),
    enabled: isSupabaseConfigured && !!currentCompany && !companyLoading,
    staleTime: 1000 * 60, // 1 minute
  });

  const invalidateObjectives = () => {
    queryClient.invalidateQueries({ queryKey: [OBJECTIVES_QUERY_KEY, currentCompany] });
  };

  // Calcula valor automático para metas comerciais
  const calculateCommercialValue = useCallback(
    (dataSources: CommercialDataSource[], valueType: ObjectiveValueType): number => {
      let value = 0;

      if (dataSources.includes("crm")) {
        const wonLeads = leads.filter((l) => l.stage === "won");
        if (valueType === "financial") {
          value += wonLeads.reduce((sum, l) => sum + l.value, 0);
        } else if (valueType === "quantity") {
          value += wonLeads.length;
        }
      }

      if (dataSources.includes("clients")) {
        const activeClients = clients.filter((c) => c.status === "active");
        if (valueType === "financial") {
          value += activeClients.reduce((sum, c) => sum + c.monthlyValue, 0);
        } else if (valueType === "quantity") {
          value += activeClients.length;
        }
      }

      return value;
    },
    [leads, clients]
  );

  // Objetivos com valores comerciais calculados automaticamente
  const objectivesWithCommercialValues = useMemo(() => {
    return objectives.map((obj) => {
      if (obj.isCommercial && obj.dataSources.length > 0) {
        const calculatedValue = calculateCommercialValue(obj.dataSources, obj.valueType);
        const status = calculateStatus(calculatedValue, obj.targetValue, obj.deadline);
        
        // Se o valor calculado for diferente do valor atual no DB, atualiza o DB em background
        if (calculatedValue !== obj.currentValue || status !== obj.status) {
          // Não usamos mutation aqui para evitar loop, apenas um update simples
          supabase
            .from('objectives')
            .update({ current_value: calculatedValue, status })
            .eq('id', obj.id)
            .then(({ error }) => {
              if (error) console.error("Erro ao atualizar valor comercial automático:", error);
            });
        }
        
        return { ...obj, currentValue: calculatedValue, status };
      }
      return { ...obj, status: calculateStatus(obj.currentValue, obj.targetValue, obj.deadline) };
    });
  }, [objectives, calculateCommercialValue]);

  const addMutation = useMutation({
    mutationFn: async (data: Omit<Objective, "id" | "createdAt" | "progressLogs" | "currentValue" | "status" | "project_id" | "user_id" | "company_id">) => {
      if (!userId) throw new Error("Usuário não autenticado.");
      
      const initialValue = data.isCommercial && data.dataSources.length > 0
        ? calculateCommercialValue(data.dataSources, data.valueType)
        : 0;
        
      const newObjectiveData = {
        ...data,
        space_id: currentCompany,
        user_id: userId,
        value_type: data.valueType,
        target_value: data.targetValue,
        current_value: initialValue,
        is_commercial: data.isCommercial,
        data_sources: data.dataSources,
        status: calculateStatus(initialValue, data.targetValue, data.deadline),
      };
      
      const { data: newObjective, error } = await supabase
        .from('objectives')
        .insert(newObjectiveData)
        .select()
        .single();

      if (error) throw error;
      return newObjective;
    },
    onSuccess: () => {
      invalidateObjectives();
      toast.success("Objetivo criado com sucesso!");
    },
    onError: (error) => {
      toast.error(`Erro ao criar objetivo: ${error.message}`);
    }
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string, data: Partial<Omit<Objective, "id" | "createdAt" | "progressLogs" | "project_id" | "user_id" | "company_id">>) => {
      const updateData = {
        ...data,
        value_type: data.valueType,
        target_value: data.targetValue,
        is_commercial: data.isCommercial,
        data_sources: data.dataSources,
        // current_value e status serão recalculados no fetch/memo
      };
      
      const { error } = await supabase
        .from('objectives')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      invalidateObjectives();
      toast.success("Objetivo atualizado com sucesso!");
    },
    onError: (error) => {
      toast.error(`Erro ao atualizar objetivo: ${error.message}`);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('objectives')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      invalidateObjectives();
      toast.success("Objetivo excluído com sucesso!");
    },
    onError: (error) => {
      toast.error(`Erro ao excluir objetivo: ${error.message}`);
    }
  });

  const addProgressLogMutation = useMutation({
    mutationFn: async ({ objectiveId, month, year, value, description }: { objectiveId: string, month: number, year: number, value: number, description: string }) => {
      const logData = {
        objective_id: objectiveId,
        month,
        year,
        value,
        description,
        recorded_at: new Date().toISOString(),
      };
      
      // Tenta inserir, se falhar por UNIQUE constraint (objective_id, month, year), tenta atualizar
      const { error: insertError } = await supabase
        .from('progress_logs')
        .insert(logData);

      if (insertError) {
        if (insertError.code === '23505') { // Unique violation
          const { error: updateError } = await supabase
            .from('progress_logs')
            .update(logData)
            .eq('objective_id', objectiveId)
            .eq('month', month)
            .eq('year', year);
          
          if (updateError) throw updateError;
        } else {
          throw insertError;
        }
      }
      
      // Recalcular currentValue e status no servidor (ou no hook após invalidação)
      return { objectiveId, value };
    },
    onSuccess: () => {
      invalidateObjectives();
      toast.success("Progresso registrado!");
    },
    onError: (error) => {
      toast.error(`Erro ao registrar progresso: ${error.message}`);
    }
  });

  const deleteProgressLogMutation = useMutation({
    mutationFn: async ({ objectiveId, month, year }: { objectiveId: string, month: number, year: number }) => {
      const { error } = await supabase
        .from('progress_logs')
        .delete()
        .eq('objective_id', objectiveId)
        .eq('month', month)
        .eq('year', year);

      if (error) throw error;
      return objectiveId;
    },
    onSuccess: () => {
      invalidateObjectives();
      toast.success("Registro de progresso excluído!");
    },
    onError: (error) => {
      toast.error(`Erro ao excluir progresso: ${error.message}`);
    }
  });

  const addObjective = useCallback((data: Omit<Objective, "id" | "createdAt" | "progressLogs" | "currentValue" | "status" | "project_id" | "user_id" | "company_id">) => {
    addMutation.mutate(data);
  }, [addMutation]);

  const updateObjective = useCallback((id: string, data: Partial<Omit<Objective, "id" | "createdAt" | "progressLogs" | "project_id" | "user_id" | "company_id">>) => {
    updateMutation.mutate({ id, data });
  }, [updateMutation]);

  const deleteObjective = useCallback((id: string) => {
    deleteMutation.mutate(id);
  }, [deleteMutation]);

  const addProgressLog = useCallback((objectiveId: string, month: number, year: number, value: number, description: string) => {
    addProgressLogMutation.mutate({ objectiveId, month, year, value, description });
  }, [addProgressLogMutation]);

  const updateProgressLog = useCallback((objectiveId: string, month: number, year: number, value: number, description: string) => {
    // Como a lógica de upsert é a mesma, usamos a mesma mutation
    addProgressLogMutation.mutate({ objectiveId, month, year, value, description });
  }, [addProgressLogMutation]);

  const deleteProgressLog = useCallback((objectiveId: string, month: number, year: number) => {
    deleteProgressLogMutation.mutate({ objectiveId, month, year });
  }, [deleteProgressLogMutation]);

  const getMonthlyProgress = useCallback((objective: Objective, month: number, year: number) => {
    return objective.progressLogs.find((log) => log.month === month && log.year === year);
  }, []);

  const getProgress = useCallback((objective: Objective) => {
    return Math.round((objective.currentValue / objective.targetValue) * 100);
  }, []);

  const getStats = useCallback(() => {
    const total = objectivesWithCommercialValues.length;
    const onTrack = objectivesWithCommercialValues.filter((o) => o.status === "on_track").length;
    const atRisk = objectivesWithCommercialValues.filter((o) => o.status === "at_risk").length;
    const behind = objectivesWithCommercialValues.filter((o) => o.status === "behind").length;
    return { total, onTrack, atRisk, behind };
  }, [objectivesWithCommercialValues]);

  return {
    objectives: objectivesWithCommercialValues,
    isLoading,
    addObjective,
    updateObjective,
    deleteObjective,
    addProgressLog,
    updateProgressLog,
    deleteProgressLog,
    getMonthlyProgress,
    getProgress,
    getStats,
  };
}