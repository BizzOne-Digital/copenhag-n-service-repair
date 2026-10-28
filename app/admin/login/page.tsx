import { databaseEnabled } from "@/lib/runtime-config";
import { LoginForm } from "@/components/admin/LoginForm";
export default function Login() {
  return (
    <main className="login-page">
      <LoginForm
        configured={
          databaseEnabled() &&
          !!process.env.SESSION_SECRET &&
          process.env.SESSION_SECRET.length >= 32
        }
      />
    </main>
  );
}
