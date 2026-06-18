import { redirect } from "next/navigation";
import { Logo } from "@/components/logo";
import { OnboardingForm } from "@/components/onboarding-form";
import { Card, CardContent } from "@/components/ui/card";
import { ensureProfile } from "@/lib/profile";

export const metadata = { title: "Welcome" };

export default async function OnboardingPage() {
  const profile = await ensureProfile();
  if (!profile) redirect("/sign-in");
  if (profile.onboarded) redirect("/dashboard");

  return (
    <div className="grid min-h-dvh place-items-center bg-aurora px-4 py-10">
      <div className="w-full max-w-md space-y-6">
        <div className="flex flex-col items-center gap-3 text-center">
          <Logo href="/dashboard" />
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Welcome to Tet ✨
            </h1>
            <p className="mt-1 text-muted-foreground">
              Two quick questions and you&apos;re creating.
            </p>
          </div>
        </div>
        <Card>
          <CardContent className="p-6">
            <OnboardingForm initialName={profile.full_name ?? ""} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
