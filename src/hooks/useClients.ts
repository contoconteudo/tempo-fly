import { useCallback, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase, isSupabaseConfigured } from "@/integrations/supabase/client";
import { Client, NPSRecord, ClientStatus } from "@/types";
import { useCompany } from "@/contexts/CompanyContext";
import { toast } from "sonner";

const CLIENTS_QUERY_KEY = 'clients';

// Helper function to calculate average NPS from history
export function calculateClientNPS(npsHistory: NPSRecord[]): number {
  if (npsHistory.length === 0) return 0;
  const sum = npsHistory.reduce((acc, record) => acc + record.score, 0);
  return Math.round((sum / npsHistory.length) * 10) / 10;
}

// Helper function to get the latest NPS score
export function getLatestNPS(npsHistory: NPSRecord[]): number | null {
  if (npsHistory.length === 0) return null;
  const sorted = [...npsHistory].sort((a, b) => {
    if (a.year !== b.year) return b.year - a.year;
    return b.month - a.month;
  });
  return sorted[0].score;
}

const fetchClients = async (spaceId: string): Promise<Client[]> => {
  if (!isSupabaseConfigured) return [];
  
  // Fetch clients and their related NPS records
  const { data: clientsData, error } = await supabase
    .from('clients')
    .select(`
      *,
      npsHistory:nps_records(*)
    `)
    .eq('space_id', spaceId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  
  // Map the data structure to match the Client type
  return clientsData.map(client => ({
    ...client,
    company_id: client.space_id, // Renomear space_id para company_id para compatibilidade
    npsHistory: client.npsHistory || [],
  })) as Client[];
};

export function useClients() {
  const queryClient = useQueryClient();
  const { currentCompany, isLoading: companyLoading } = useCompany();
  const userId = supabase.auth.getUser()?.id;

  const { data: clients = [], isLoading } = useQuery<Client[]>({
    queryKey: [CLIENTS_QUERY_KEY, currentCompany],
    queryFn: () => fetchClients(currentCompany),
    enabled: isSupabaseConfigured && !!currentCompany && !companyLoading,
    staleTime: 1000 * 60, // 1 minute
  });

  const invalidateClients = () => {
    queryClient.invalidateQueries({ queryKey: [CLIENTS_QUERY_KEY, currentCompany] });
  };

  const addClientMutation = useMutation({
    mutationFn: async (data: Omit<Client, "id" | "npsHistory" | "project_id" | "user_id" | "company_id">) => {
      if (!userId) throw new Error("Usuário não autenticado.");
      
      const newClientData = {
        ...data,
        space_id: currentCompany,
        user_id: userId,
        monthly_value: data.monthlyValue, // Supabase usa snake_case
        start_date: data.startDate,
      };
      
      const { data: newClient, error } = await supabase
        .from('clients')
        .insert(newClientData)
        .select()
        .single();

      if (error) throw error;
      return newClient;
    },
    onSuccess: () => {
      invalidateClients();
      toast.success("Cliente criado com sucesso!");
    },
    onError: (error) => {
      toast.error(`Erro ao adicionar cliente: ${error.message}`);
    }
  });

  const updateClientMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string, data: Partial<Omit<Client, "id" | "npsHistory" | "project_id" | "user_id" | "company_id">> }) => {
      const updateData = {
        ...data,
        monthly_value: data.monthlyValue,
        start_date: data.startDate,
      };
      
      const { error } = await supabase
        .from('clients')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      invalidateClients();
      toast.success("Cliente atualizado com sucesso!");
    },
    onError: (error) => {
      toast.error(`Erro ao atualizar cliente: ${error.message}`);
    }
  });

  const deleteClientMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      invalidateClients();
      toast.success("Cliente excluído com sucesso!");
    },
    onError: (error) => {
      toast.error(`Erro ao excluir cliente: ${error.message}`);
    }
  });

  const addNPSRecordMutation = useMutation({
    mutationFn: async ({ clientId, record }: { clientId: string, record: Omit<NPSRecord, "id" | "client_id"> }) => {
      const recordData = {
        ...record,
        client_id: clientId,
        recorded_at: new Date().toISOString(),
      };
      
      // Tenta inserir, se falhar por UNIQUE constraint (client_id, month, year), tenta atualizar
      const { error: insertError } = await supabase
        .from('nps_records')
        .insert(recordData);

      if (insertError) {
        if (insertError.code === '23505') { // Unique violation
          const { error: updateError } = await supabase
            .from('nps_records')
            .update(recordData)
            .eq('client_id', clientId)
            .eq('month', record.month)
            .eq('year', record.year);
          
          if (updateError) throw updateError;
        } else {
          throw insertError;
        }
      }
      return record;
    },
    onSuccess: () => {
      invalidateClients();
      toast.success("Registro de NPS salvo!");
    },
    onError: (error) => {
      toast.error(`Erro ao salvar NPS: ${error.message}`);
    }
  });

  const deleteNPSRecordMutation = useMutation({
    mutationFn: async (recordId: string) => {
      const { error } = await supabase
        .from('nps_records')
        .delete()
        .eq('id', recordId);

      if (error) throw error;
      return recordId;
    },
    onSuccess: () => {
      invalidateClients();
      toast.success("Registro de NPS excluído!");
    },
    onError: (error) => {
      toast.error(`Erro ao excluir registro de NPS: ${error.message}`);
    }
  });

  const addClient = useCallback((data: Omit<Client, "id" | "npsHistory" | "project_id" | "user_id" | "company_id">) => {
    addClientMutation.mutate(data);
  }, [addClientMutation]);

  const updateClient = useCallback((id: string, data: Partial<Omit<Client, "id" | "npsHistory" | "project_id" | "user_id" | "company_id">>) => {
    updateClientMutation.mutate({ id, data });
  }, [updateClientMutation]);

  const deleteClient = useCallback((id: string) => {
    deleteClientMutation.mutate(id);
  }, [deleteClientMutation]);

  const addNPSRecord = useCallback((clientId: string, record: Omit<NPSRecord, "id" | "client_id">) => {
    addNPSRecordMutation.mutate({ clientId, record });
  }, [addNPSRecordMutation]);

  const deleteNPSRecord = useCallback((clientId: string, recordId: string) => {
    deleteNPSRecordMutation.mutate(recordId);
  }, [deleteNPSRecordMutation]);

  const getStats = useCallback(() => {
    const activeClients = clients.filter((c) => c.status === "active");
    const totalMRR = activeClients.reduce((sum, c) => sum + c.monthlyValue, 0);
    const avgTicket = activeClients.length > 0 ? Math.round(totalMRR / activeClients.length) : 0;
    
    // Calculate global average NPS from all clients' histories
    const allNPSScores = clients.flatMap((c) => c.npsHistory.map((r) => r.score));
    const avgNPS = allNPSScores.length > 0 
      ? Math.round((allNPSScores.reduce((sum, s) => sum + s, 0) / allNPSScores.length) * 10) / 10 
      : 0;

    return {
      activeCount: activeClients.length,
      inactiveCount: clients.filter((c) => c.status === "inactive").length,
      churnCount: clients.filter((c) => c.status === "churn").length,
      totalMRR,
      avgTicket,
      avgNPS,
    };
  }, [clients]);

  // Get clients sorted by latest NPS (for quick registration view)
  const clientsWithNPSInfo = useMemo(() => {
    return clients.map((client) => ({
      ...client,
      latestNPS: getLatestNPS(client.npsHistory),
      avgNPS: calculateClientNPS(client.npsHistory),
    }));
  }, [clients]);

  return {
    clients,
    clientsWithNPSInfo,
    isLoading,
    addClient,
    updateClient,
    deleteClient,
    addNPSRecord,
    deleteNPSRecord,
    getStats,
  };
}