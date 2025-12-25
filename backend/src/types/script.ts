export interface Script {
  id: string;
  user_id: string;
  title: string;
  genre: string;
  location: string;
  main_conflict: string;
  created_at: Date;
  updated_at: Date;
}

export interface DialogueLine {
  character: string;
  line: string;
}

export interface Scene {
  id: string;
  script_id: string;
  scene_number: number;
  location: string;
  time_of_day?: string;
  description: string;
  camera_angle?: string;
  dialogue: DialogueLine[];
  created_at: Date;
  updated_at: Date;
}

export interface Character {
  id: string;
  script_id: string;
  name: string;
  description?: string;
  actor_name?: string;
  created_at: Date;
  updated_at: Date;
}

export interface ScriptGenerationRequest {
  genre: string;
  location: string;
  main_conflict: string;
}

export interface SceneRegenerationRequest {
  scene_number: number;
  prompt?: string;
}

export interface CastingRequest {
  character_name: string;
  actor_name: string;
}
