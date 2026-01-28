import { useCallback, useMemo, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase, isSupabaseConfigured } from "@/integrations/supabase/client";
import { Lead, LeadStage } from "@/types";
import { AUTOMATION_CONFIG } from "@/lib/constants";
import { useCompany } from "@/contexts/CompanyContext";
import { toast } from "sonner";

const LEADS_QUERY_KEY = 'leads';

const fetchLeads = async (spaceId: string): Promise<Lead[]> => {
  if (!isSupabaseConfigured) return [];
  
  const { data, error } = await supabase
    .from('leads')
    .select('*')
    .eq('space_id', spaceId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as Lead[];
};

export function useLeads() {
  const queryClient = useQueryClient();
  const { currentCompany, isLoading: companyLoading } = useCompany();
  const userId = supabase.auth.getUser()?.id;

  const { data: leads = [], isLoading } = useQuery<Lead[]>({
    queryKey: [LEADS_QUERY_KEY, currentCompany],
    queryFn: () => fetchLeads(currentCompany),
    enabled: isSupabaseConfigured && !!currentCompany && !companyLoading,
    staleTime: 1000 * 60, // 1 minute
  });

  const invalidateLeads = () => {
    queryClient.invalidateQueries({ queryKey: [LEADS_QUERY_KEY, currentCompany] });
  };

  const addMutation = useMutation({
    mutationFn: async (data: Omit<Lead, "id" | "createdAt" | "stageChangedAt" | "project_id" | "user_id" | "company_id">) => {
      if (!userId) throw new Error("Usuário não autenticado.");
      
      const newLeadData = {
        ...data,
        space_id: currentCompany,
        user_id: userId,
        stage_changed_at: new Date().toISOString(),
      };
      
      const { data: newLead, error } = await supabase
        .from('leads')
        .insert(newLeadData)
        .select()
        .single();

      if (error) throw error;
      return newLead as Lead;
    },
    onSuccess: () => {
      invalidateLeads();
      toast.success("Lead adicionado com sucesso!");
    },
    onError: (error) => {
      toast.error(`Erro ao adicionar lead: ${error.message}`);
    }
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string, data: Partial<Omit<Lead, "id" | "createdAt" | "project_id" | "user_id" | "company_id">> }) => {
      const { error } = await supabase
        .from('leads')
        .update(data)
        .eq('id', id);

      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      invalidateLeads();
      toast.success("Lead atualizado com sucesso!");
    },
    onError: (error) => {
      toast.error(`Erro ao atualizar lead: ${error.message}`);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('leads')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      invalidateLeads();
      toast.success("Lead excluído com sucesso!");
    },
    onError: (error) => {
      toast.error(`Erro ao excluir lead: ${error.message}`);
    }
  });

  const moveLeadToStageMutation = useMutation({
    mutationFn: async ({ id, stage }: { id: string, stage: LeadStage }) => {
      const { error } = await supabase
        .from('leads')
        .update({ stage, stage_changed_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;
      return { id, stage };
    },
    onSuccess: (data) => {
      invalidateLeads();
      toast.success(`Lead movido para ${data.stage}`);
    },
    onError: (error) => {
      toast.error(`Erro ao mover lead: ${error.message}`);
    }
  });

  const addLead = useCallback((data: Omit<Lead, "id" | "createdAt" | "stageChangedAt" | "project_id" | "user_id" | "company_id">) => {
    addMutation.mutate(data);
  }, [addMutation]);

  const updateLead = useCallback((id: string, data: Partial<Omit<Lead, "id" | "createdAt" | "project_id" | "user_id" | "company_id">>) => {
    updateMutation.mutate({ id, data });
  }, [updateMutation]);

  const deleteLead = useCallback((id: string) => {
    deleteMutation.mutate(id);
  }, [deleteMutation]);

  const moveLeadToStage = useCallback((id: string, stage: LeadStage) => {
    moveLeadToStageMutation.mutate({ id, stage });
  }, [moveLeadToStageMutation]);

  const getLeadsByStage = useCallback(
    (stage: LeadStage) => {
      return leads.filter((lead) => lead.stage === stage);
    },
    [leads]
  );

  const getPipelineStats = useCallback(() => {
    const activeLeads = leads.filter((l) => l.stage !== "lost");
    const totalValue = activeLeads.reduce((sum, l) => sum + l.value, 0);
    const proposalsSent = leads.filter((l) => ["proposal", "negotiation", "won"].includes(l.stage)).length;
    const won = leads.filter((l) => l.stage === "won");
    const conversionRate = leads.length > 0 ? Math.round((won.length / leads.length) * 100) : 0;
    const inNegotiation = leads.filter((l) => l.stage !== "won" && l.stage !== "lost").length;

    return {
      totalLeads: activeLeads.length,
      totalValue,
      proposalsSent,
      conversionRate,
      inNegotiation,
      wonCount: won.length,
      wonValue: won.reduce((sum, l) => sum + l.value, 0),
    };
  }, [leads]);

  // Automação: mover leads de "proposal" para "followup" após período configurado
  // Em produção, isso deve ser feito via Edge Function ou Trigger, mas mantemos o cliente
  // side check para o modo de demonstração/desenvolvimento.
  useEffect(() => {
    if (!isSupabaseConfigured) return;
    
    const checkAndMoveLeads = async () => {
      const now = new Date().getTime();
      const thresholdMs = AUTOMATION_CONFIG.PROPOSAL_TO_FOLLOWUP_HOURS * 60 * 60 * 1000;

      const leadsToMove = leads.filter((lead) => {
        if (lead.stage === "proposal") {
          const stageTime = new Date(lead.stageChangedAt).getTime();
          return now - stageTime >= thresholdMs;
        }
        return false;
      });

      if (leadsToMove.length > 0) {
        console.log(`[useLeads] Movendo ${leadsToMove.length} leads para 'followup' via automação.`);
        
        // Usar Promise.all para atualizar em lote
        const updates = leadsToMove.map(lead => 
          supabase
            .from('leads')
            .update({ stage: 'followup' as LeadStage, stage_changed_at: new Date().toISOString() })
            .eq('id', lead.id)
        );
        
        await Promise.all(updates);
        invalidateLeads();
      }
    };

    // Verificar no intervalo configurado
    const interval = setInterval(checkAndMoveLeads, AUTOMATION_CONFIG.AUTOMATION_CHECK_INTERVAL);

    // Verificar imediatamente ao carregar
    checkAndMoveLeads();

    return () => clearInterval(interval);
  }, [leads, invalidateLeads]);

  return {
    leads,
    isLoading,
    addLead,
    updateLead,
    deleteLead,
    moveLeadToStage,
    getLeadsByStage,
    getPipelineStats,
  };
}