"use client";
import { useSession, signOut } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();

  if (isPending) return <div>Chargement...</div>;

  return (
    <div>
      <h1>Dashboard</h1>
      <p>Connecté en tant que : {session?.user.email}</p>
      <button
        onClick={async () => {
          await signOut();
          router.push("/login");
        }}
      >
        Se déconnecter
      </button>
    </div>
  );
}
