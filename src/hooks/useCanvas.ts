import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useGetLatestDrawing() {
  return useQuery({
    queryKey: ["shared_canvas"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("shared_canvas")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
  });
}

export function useSaveDrawing() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (drawing_data: string) => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("shared_canvas")
        .insert([
          {
            user_id: userData.user.id,
            drawing_data,
          },
        ])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shared_canvas"] });
    },
  });
}
