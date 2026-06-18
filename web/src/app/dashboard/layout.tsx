import { redirect } from "next/navigation";
import { DashboardNav } from "@/components/dashboard-nav";
import { ensureProfile } from "@/lib/profile";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await ensureProfile();
  if (!profile) redirect("/sign-in");
  if (!profile.onboarded) redirect("/onboarding");

  return (
    <div className="flex min-h-dvh flex-col">
      <DashboardNav isAdmin={profile.role === "admin"} />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">
        {children}
      </main>
    </div>
  );
}
