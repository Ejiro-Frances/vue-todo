import { useMutation, useQueryClient, useQuery } from "@tanstack/vue-query";
import { login, signup, profile } from "@/services/authservice";
import type { LoginFormData, SignupFormData } from "@/types";

export function useAuth() {
  const queryClient = useQueryClient();

  const loginMutation = useMutation({
    mutationFn: (payload: LoginFormData) => login(payload),
    onSuccess: (data) => {
      console.log("Login success:", data);
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });

  const signupMutation = useMutation({
    mutationFn: (payload: SignupFormData) => signup(payload),
    onSuccess: (data) => {
      console.log("Signup success:", data);
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });

  const profileQuery = useQuery({
    queryKey: ["profile"],
    queryFn: profile,
  });

  return {
    loginMutation,
    signupMutation,
    profileQuery,
  };
}
