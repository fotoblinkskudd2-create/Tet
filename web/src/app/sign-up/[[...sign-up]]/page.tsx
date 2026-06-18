import { SignUp } from "@clerk/nextjs";
import { Logo } from "@/components/logo";

export default function SignUpPage() {
  return (
    <div className="grid min-h-dvh place-items-center bg-aurora px-4 py-10">
      <div className="flex flex-col items-center gap-6">
        <Logo />
        <SignUp />
      </div>
    </div>
  );
}
