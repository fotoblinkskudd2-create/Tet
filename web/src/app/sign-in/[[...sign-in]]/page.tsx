import { SignIn } from "@clerk/nextjs";
import { Logo } from "@/components/logo";

export default function SignInPage() {
  return (
    <div className="grid min-h-dvh place-items-center bg-aurora px-4 py-10">
      <div className="flex flex-col items-center gap-6">
        <Logo />
        <SignIn />
      </div>
    </div>
  );
}
