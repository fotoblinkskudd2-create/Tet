import { PromptGenerator } from "@/components/prompt-generator";

export const metadata = { title: "Create a prompt" };

export default function NewPromptPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Create a prompt</h1>
        <p className="text-muted-foreground">
          Describe an idea, then save it privately or share it with the
          community.
        </p>
      </div>
      <PromptGenerator canSave />
    </div>
  );
}
