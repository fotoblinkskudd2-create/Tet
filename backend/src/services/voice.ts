import { config } from '../config';
import { query } from '../db';
import { VoiceSample } from '../types';

/**
 * ElevenLabs Voice Cloning Service
 */

interface ElevenLabsVoice {
  voice_id: string;
  name: string;
  category: string;
}

/**
 * Clone a voice using ElevenLabs Voice Design API
 */
export async function cloneVoice(
  deceasedPersonId: string,
  voiceSampleUrls: string[],
  voiceName: string
): Promise<string> {
  if (!config.elevenlabs.apiKey) {
    throw new Error('ElevenLabs API key not configured');
  }

  if (voiceSampleUrls.length === 0) {
    throw new Error('At least one voice sample is required');
  }

  try {
    // Download voice samples
    const sampleFiles = await Promise.all(
      voiceSampleUrls.map(async (url) => {
        const response = await fetch(url);
        const buffer = await response.arrayBuffer();
        return new Blob([buffer], { type: 'audio/mpeg' });
      })
    );

    // Create FormData for voice cloning
    const formData = new FormData();
    formData.append('name', voiceName);

    sampleFiles.forEach((blob, index) => {
      formData.append('files', blob, `sample_${index}.mp3`);
    });

    // Add optional metadata
    formData.append('description', `Voice clone for ${voiceName}`);

    // Call ElevenLabs API to create voice
    const response = await fetch('https://api.elevenlabs.io/v1/voices/add', {
      method: 'POST',
      headers: {
        'xi-api-key': config.elevenlabs.apiKey,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`ElevenLabs API error: ${error}`);
    }

    const data = await response.json();
    const voiceId = data.voice_id;

    // Store voice ID in database
    await query(
      `UPDATE deceased_persons
       SET voice_characteristics = COALESCE(voice_characteristics, '{}'::jsonb) || $1::jsonb
       WHERE id = $2`,
      [JSON.stringify({ elevenlabsVoiceId: voiceId }), deceasedPersonId]
    );

    return voiceId;
  } catch (error) {
    console.error('Voice cloning failed:', error);
    throw error;
  }
}

/**
 * Generate speech from text using cloned voice
 */
export async function generateSpeech(
  voiceId: string,
  text: string,
  stability: number = 0.5,
  similarityBoost: number = 0.75
): Promise<Buffer> {
  if (!config.elevenlabs.apiKey) {
    throw new Error('ElevenLabs API key not configured');
  }

  try {
    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': config.elevenlabs.apiKey,
        },
        body: JSON.stringify({
          text,
          model_id: 'eleven_multilingual_v2', // Supports Norwegian
          voice_settings: {
            stability,
            similarity_boost: similarityBoost,
            style: 0.5,
            use_speaker_boost: true,
          },
        }),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`ElevenLabs TTS error: ${error}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
  } catch (error) {
    console.error('Speech generation failed:', error);
    throw error;
  }
}

/**
 * Get or create voice ID for a deceased person
 */
export async function getVoiceId(deceasedPersonId: string): Promise<string | null> {
  const [person] = await query<any>(
    `SELECT voice_characteristics FROM deceased_persons WHERE id = $1`,
    [deceasedPersonId]
  );

  if (!person || !person.voice_characteristics) {
    return null;
  }

  return person.voice_characteristics.elevenlabsVoiceId || null;
}

/**
 * Analyze voice sample quality
 * Returns a score from 0-1 indicating how good the sample is for cloning
 */
export function analyzeVoiceSampleQuality(
  durationSeconds: number,
  hasBackgroundNoise: boolean,
  speakerCount: number
): number {
  let score = 1.0;

  // Duration: ideal is 10-60 seconds
  if (durationSeconds < 5) {
    score -= 0.3;
  } else if (durationSeconds < 10) {
    score -= 0.1;
  } else if (durationSeconds > 120) {
    score -= 0.2;
  }

  // Background noise
  if (hasBackgroundNoise) {
    score -= 0.3;
  }

  // Multiple speakers
  if (speakerCount > 1) {
    score -= 0.4;
  }

  return Math.max(0, Math.min(1, score));
}

/**
 * Store voice sample in database
 */
export async function storeVoiceSample(
  deceasedPersonId: string,
  fileUrl: string,
  durationSeconds: number | null,
  transcript: string | null,
  qualityScore: number | null
): Promise<VoiceSample> {
  const [sample] = await query<VoiceSample>(
    `INSERT INTO voice_samples
     (deceased_person_id, file_url, duration_seconds, transcript, quality_score)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [deceasedPersonId, fileUrl, durationSeconds, transcript, qualityScore]
  );

  return sample;
}

/**
 * Get best voice samples for cloning
 * Returns samples sorted by quality score
 */
export async function getBestVoiceSamples(
  deceasedPersonId: string,
  limit: number = 5
): Promise<VoiceSample[]> {
  const samples = await query<VoiceSample>(
    `SELECT * FROM voice_samples
     WHERE deceased_person_id = $1
     ORDER BY quality_score DESC NULLS LAST, duration_seconds DESC
     LIMIT $2`,
    [deceasedPersonId, limit]
  );

  return samples;
}

/**
 * List available ElevenLabs voices (for fallback if no cloning)
 */
export async function listAvailableVoices(): Promise<ElevenLabsVoice[]> {
  if (!config.elevenlabs.apiKey) {
    throw new Error('ElevenLabs API key not configured');
  }

  try {
    const response = await fetch('https://api.elevenlabs.io/v1/voices', {
      headers: {
        'xi-api-key': config.elevenlabs.apiKey,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch voices');
    }

    const data = await response.json();
    return data.voices || [];
  } catch (error) {
    console.error('Failed to list voices:', error);
    return [];
  }
}

/**
 * Delete a cloned voice
 */
export async function deleteVoice(voiceId: string): Promise<void> {
  if (!config.elevenlabs.apiKey) {
    throw new Error('ElevenLabs API key not configured');
  }

  try {
    const response = await fetch(
      `https://api.elevenlabs.io/v1/voices/${voiceId}`,
      {
        method: 'DELETE',
        headers: {
          'xi-api-key': config.elevenlabs.apiKey,
        },
      }
    );

    if (!response.ok) {
      const error = await response.text();
      console.error('Failed to delete voice:', error);
    }
  } catch (error) {
    console.error('Voice deletion failed:', error);
  }
}
