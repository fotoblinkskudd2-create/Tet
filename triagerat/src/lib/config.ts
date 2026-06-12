import { getSupabaseServerClient } from "./supabase";

export interface RepoConfig {
  repoFullName: string;
  githubToken: string;
  anthropicApiKey: string;
}

/**
 * Resolve the active repo configuration.
 * Looks up the most recently updated row in `repo_configs`, falling back to
 * GITHUB_REPO / GITHUB_TOKEN / ANTHROPIC_API_KEY env vars for any missing piece.
 */
export async function getRepoConfig(): Promise<RepoConfig> {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("repo_configs")
    .select("repo_full_name, github_token, anthropic_api_key")
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to load repo config: ${error.message}`);
  }

  const repoFullName = data?.repo_full_name || process.env.GITHUB_REPO || "";
  const githubToken = data?.github_token || process.env.GITHUB_TOKEN || "";
  const anthropicApiKey = data?.anthropic_api_key || process.env.ANTHROPIC_API_KEY || "";

  if (!repoFullName) {
    throw new Error("No repository configured. Set it on the Settings page or via GITHUB_REPO.");
  }
  if (!githubToken) {
    throw new Error("No GitHub token configured. Set it on the Settings page or via GITHUB_TOKEN.");
  }
  if (!anthropicApiKey) {
    throw new Error("No Anthropic API key configured. Set it on the Settings page or via ANTHROPIC_API_KEY.");
  }

  return { repoFullName, githubToken, anthropicApiKey };
}

export async function upsertRepoConfig(config: Partial<RepoConfig> & { repoFullName: string }): Promise<void> {
  const supabase = getSupabaseServerClient();

  const { data: existing, error: fetchError } = await supabase
    .from("repo_configs")
    .select("github_token, anthropic_api_key")
    .eq("repo_full_name", config.repoFullName)
    .maybeSingle();

  if (fetchError) {
    throw new Error(`Failed to load existing repo config: ${fetchError.message}`);
  }

  const { error } = await supabase.from("repo_configs").upsert(
    {
      repo_full_name: config.repoFullName,
      github_token: config.githubToken || existing?.github_token || null,
      anthropic_api_key: config.anthropicApiKey || existing?.anthropic_api_key || null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "repo_full_name" }
  );

  if (error) {
    throw new Error(`Failed to save repo config: ${error.message}`);
  }
}

export async function getRepoConfigForDisplay(): Promise<{ repoFullName: string; hasGithubToken: boolean; hasAnthropicKey: boolean }> {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("repo_configs")
    .select("repo_full_name, github_token, anthropic_api_key")
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to load repo config: ${error.message}`);
  }

  return {
    repoFullName: data?.repo_full_name || process.env.GITHUB_REPO || "",
    hasGithubToken: Boolean(data?.github_token || process.env.GITHUB_TOKEN),
    hasAnthropicKey: Boolean(data?.anthropic_api_key || process.env.ANTHROPIC_API_KEY),
  };
}
