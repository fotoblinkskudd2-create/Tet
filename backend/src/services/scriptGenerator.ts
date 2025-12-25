import Anthropic from '@anthropic-ai/sdk';
import dotenv from 'dotenv';
import { DialogueLine } from '../types/script';

dotenv.config();

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export interface GeneratedScene {
  scene_number: number;
  location: string;
  time_of_day: string;
  description: string;
  camera_angle: string;
  dialogue: DialogueLine[];
}

export interface GeneratedScript {
  title: string;
  scenes: GeneratedScene[];
  characters: { name: string; description: string }[];
}

export async function generateMovieScript(
  genre: string,
  location: string,
  mainConflict: string
): Promise<GeneratedScript> {
  const prompt = `You are an expert screenwriter. Generate a short movie script with the following parameters:

Genre: ${genre}
Setting/Location: ${location}
Main Conflict: ${mainConflict}

Create a script with 10-15 scenes. For each scene, provide:
- Scene number
- Location
- Time of day (INT/EXT, DAY/NIGHT, etc.)
- Scene description (2-3 sentences)
- Camera angle/shot type
- Dialogue (if applicable)

Also identify 3-5 main characters with brief descriptions.

Format your response as a valid JSON object with this structure:
{
  "title": "Movie Title",
  "characters": [
    {
      "name": "Character Name",
      "description": "Brief character description"
    }
  ],
  "scenes": [
    {
      "scene_number": 1,
      "location": "Location name",
      "time_of_day": "INT. DAY",
      "description": "Scene description",
      "camera_angle": "WIDE SHOT, CLOSE-UP, etc.",
      "dialogue": [
        {
          "character": "Character Name",
          "line": "What they say"
        }
      ]
    }
  ]
}

Make the script creative, engaging, and cinematic. Include dynamic camera work and compelling dialogue.`;

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-5-20250929',
    max_tokens: 8000,
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
  });

  const content = message.content[0];
  if (content.type !== 'text') {
    throw new Error('Unexpected response type from Claude');
  }

  // Parse the JSON response
  const jsonMatch = content.text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('Could not parse JSON from Claude response');
  }

  const script: GeneratedScript = JSON.parse(jsonMatch[0]);
  return script;
}

export async function regenerateScene(
  sceneContext: string,
  sceneNumber: number,
  genre: string,
  customPrompt?: string
): Promise<GeneratedScene> {
  const prompt = `You are an expert screenwriter. Regenerate scene ${sceneNumber} for a ${genre} movie.

${customPrompt ? `Special instructions: ${customPrompt}\n\n` : ''}

Context of surrounding scenes:
${sceneContext}

Generate a NEW version of scene ${sceneNumber} that fits the story but offers a fresh take.

Provide the scene in this JSON format:
{
  "scene_number": ${sceneNumber},
  "location": "Location name",
  "time_of_day": "INT. DAY",
  "description": "Scene description",
  "camera_angle": "WIDE SHOT, CLOSE-UP, etc.",
  "dialogue": [
    {
      "character": "Character Name",
      "line": "What they say"
    }
  ]
}

Make it creative and cinematic.`;

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-5-20250929',
    max_tokens: 2000,
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
  });

  const content = message.content[0];
  if (content.type !== 'text') {
    throw new Error('Unexpected response type from Claude');
  }

  const jsonMatch = content.text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('Could not parse JSON from Claude response');
  }

  const scene: GeneratedScene = JSON.parse(jsonMatch[0]);
  return scene;
}
