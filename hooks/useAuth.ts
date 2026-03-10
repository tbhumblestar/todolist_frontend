import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { authApi, userApi } from "@/lib/api";
import { authStorage } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { User } from "@/types/user";

export const useAuth = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  const meQuery = useQuery({
    queryKey: ["me"],
    queryFn: userApi.getMe,
    enabled: authStorage.isLoggedIn(),
    retry: false,
  });

  const signupMutation = useMutation({
    mutationFn: ({ email, password, name }: { email: string; password: string; name: string }) =>
      authApi.signup(email, password, name),
    onSuccess: (data) => {
      authStorage.setToken(data.token);
      queryClient.invalidateQueries({ queryKey: ["me"] });
      router.push("/");
    },
  });

  const loginMutation = useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      authApi.login(email, password),
    onSuccess: (data) => {
      authStorage.setToken(data.token);
      queryClient.invalidateQueries({ queryKey: ["me"] });
      router.push("/");
    },
  });

  const logout = () => {
    authStorage.removeToken();
    queryClient.setQueryData<User | null>(["me"], null);
    queryClient.clear();
    router.push("/login");
  };

  return {
    user: meQuery.data ?? null,
    isLoading: meQuery.isLoading,
    isLoggedIn: authStorage.isLoggedIn(),
    signup: signupMutation.mutate,
    signupError: signupMutation.error?.message ?? null,
    login: loginMutation.mutate,
    loginError: loginMutation.error?.message ?? null,
    logout,
  };
};
