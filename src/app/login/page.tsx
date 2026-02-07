import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/login-form";

export default async function LoginPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // If user is already authenticated, redirect to home
  if (user) {
    redirect("/");
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <LoginForm />
    </div>
  );
}
