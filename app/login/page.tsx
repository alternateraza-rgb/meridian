import Link from "next/link";

import { Brand } from "@/components/brand";
import { AuthForm } from "@/components/auth-form";

export default function LoginPage() {
  return (
    <>
      <header className="container">
        <nav className="nav">
          <Brand />
          <Link className="button" href="/app">
            Continue in demo mode
          </Link>
        </nav>
      </header>
      <AuthForm mode="login" />
    </>
  );
}
