import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { buildCreativePrompt } from "@/lib/prompt-engine";
import { createServerSupabase } from "@/lib/supabase/server";

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let payload: { seed?: string; medium?: string | null; is_public?: boolean };
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  let prompt;
  try {
    prompt = buildCreativePrompt(payload.seed ?? "", payload.medium ?? null);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Bad input" },
      { status: 422 },
    );
  }

  const user = await currentUser();
  const authorName =
    [user?.firstName, user?.lastName].filter(Boolean).join(" ") ||
    user?.username ||
    "A Tet creator";

  const supabase = await createServerSupabase();
  const { data, error } = await supabase
    .from("prompts")
    .insert({
      user_id: userId,
      author_name: authorName,
      medium: prompt.medium,
      seed: prompt.seed,
      body: prompt.body,
      details: prompt.details,
      is_public: payload.is_public ?? false,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ prompt: data }, { status: 201 });
}
