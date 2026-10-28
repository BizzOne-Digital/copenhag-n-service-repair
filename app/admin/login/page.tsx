import { LoginForm } from "@/components/admin/LoginForm";
export default function Login() {
  return (
    <main className="login-page">
      <LoginForm
        configured={
          !!process.env.MONGODB_URI &&
          !!process.env.SESSION_SECRET &&
          process.env.SESSION_SECRET.length >= 32
        }
      />
    </main>
  );
}
