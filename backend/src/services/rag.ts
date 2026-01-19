import OpenAI from 'openai';
import { Pinecone } from '@pinecone-database/pinecone';
import { config } from '../config';
import { query } from '../db';
import { Memory, RAGContext, Message } from '../types';

const openai = new OpenAI({ apiKey: config.openai.apiKey });
const pinecone = new Pinecone({ apiKey: config.pinecone.apiKey });

let pineconeIndex: any = null;

// Initialize Pinecone index
export async function initPinecone(): Promise<void> {
  try {
    pineconeIndex = pinecone.index(config.pinecone.indexName);
    console.log('Pinecone initialized successfully');
  } catch (error) {
    console.error('Failed to initialize Pinecone:', error);
    throw error;
  }
}

/**
 * Generate embedding for a text using OpenAI
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  try {
    const response = await openai.embeddings.create({
      model: config.openai.embeddingModel,
      input: text.substring(0, 8000), // Limit input length
    });

    return response.data[0].embedding;
  } catch (error) {
    console.error('Failed to generate embedding:', error);
    throw error;
  }
}

/**
 * Store memory with embedding in both PostgreSQL and Pinecone
 */
export async function storeMemoryWithEmbedding(
  memory: Omit<Memory, 'id' | 'createdAt'>
): Promise<Memory> {
  // Generate embedding
  const embedding = await generateEmbedding(memory.content);

  // Store in PostgreSQL
  const [storedMemory] = await query<Memory>(
    `INSERT INTO memories (
      deceased_person_id, data_source_id, memory_type, content, content_language,
      timestamp, participants, location, emotion_detected, context, media_urls,
      embedding, metadata
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
    RETURNING *`,
    [
      memory.deceasedPersonId,
      memory.dataSourceId,
      memory.memoryType,
      memory.content,
      memory.contentLanguage,
      memory.timestamp,
      memory.participants,
      memory.location,
      memory.emotionDetected,
      memory.context,
      memory.mediaUrls,
      `[${embedding.join(',')}]`, // Store as text representation
      JSON.stringify(memory.metadata),
    ]
  );

  // Store in Pinecone for fast similarity search
  if (pineconeIndex) {
    try {
      await pineconeIndex.upsert([
        {
          id: storedMemory.id,
          values: embedding,
          metadata: {
            deceasedPersonId: memory.deceasedPersonId,
            content: memory.content.substring(0, 1000), // Limit metadata size
            timestamp: memory.timestamp?.toISOString(),
            emotion: memory.emotionDetected,
            memoryType: memory.memoryType,
          },
        },
      ]);
    } catch (pineconeError) {
      console.error('Failed to store in Pinecone:', pineconeError);
      // Don't fail the whole operation if Pinecone fails
    }
  }

  return storedMemory;
}

/**
 * Find relevant memories using semantic search
 */
export async function findRelevantMemories(
  deceasedPersonId: string,
  query: string,
  limit: number = 10
): Promise<Memory[]> {
  // Generate embedding for the query
  const queryEmbedding = await generateEmbedding(query);

  // Search in Pinecone for fast results
  if (pineconeIndex) {
    try {
      const searchResults = await pineconeIndex.query({
        vector: queryEmbedding,
        topK: limit,
        filter: { deceasedPersonId: { $eq: deceasedPersonId } },
        includeMetadata: true,
      });

      // Fetch full memories from PostgreSQL
      const memoryIds = searchResults.matches.map((m: any) => m.id);

      if (memoryIds.length === 0) {
        return [];
      }

      const memories = await query<Memory>(
        `SELECT * FROM memories
         WHERE id = ANY($1)
         ORDER BY ARRAY_POSITION($1, id::text)`,
        [memoryIds]
      );

      return memories;
    } catch (error) {
      console.error('Pinecone search failed, falling back to PostgreSQL:', error);
    }
  }

  // Fallback: use PostgreSQL with cosine similarity (requires pgvector)
  // This is slower but works without Pinecone
  const memories = await query<Memory>(
    `SELECT *,
     1 - (embedding <=> $1::vector) as similarity
     FROM memories
     WHERE deceased_person_id = $2
     ORDER BY embedding <=> $1::vector
     LIMIT $3`,
    [`[${queryEmbedding.join(',')}]`, deceasedPersonId, limit]
  );

  return memories;
}

/**
 * Build RAG context for a conversation
 * Combines relevant memories, personality traits, and conversation history
 */
export async function buildRAGContext(
  deceasedPersonId: string,
  userMessage: string,
  conversationHistory: Message[] = []
): Promise<RAGContext> {
  // Find relevant memories
  const relevantMemories = await findRelevantMemories(
    deceasedPersonId,
    userMessage,
    15
  );

  // Get deceased person's personality data
  const [person] = await query<any>(
    `SELECT personality_summary, voice_characteristics, favorite_phrases,
     emotional_patterns, dialect, name, nickname, relationship
     FROM deceased_persons
     WHERE id = $1`,
    [deceasedPersonId]
  );

  if (!person) {
    throw new Error('Deceased person not found');
  }

  // Extract personality traits
  const personalityTraits: string[] = [];
  if (person.personality_summary) {
    personalityTraits.push(person.personality_summary);
  }
  if (person.favorite_phrases && person.favorite_phrases.length > 0) {
    personalityTraits.push(
      `Ofte brukte uttrykk: ${person.favorite_phrases.join(', ')}`
    );
  }
  if (person.dialect) {
    personalityTraits.push(`Dialekt: ${person.dialect}`);
  }
  if (person.voice_characteristics) {
    const vc = person.voice_characteristics;
    if (vc.speechPatterns) {
      personalityTraits.push(`Talemønster: ${vc.speechPatterns.join(', ')}`);
    }
    if (vc.fillerWords) {
      personalityTraits.push(`Fylleord: ${vc.fillerWords.join(', ')}`);
    }
  }

  // Determine emotional context
  let emotionalContext = 'neutral';
  if (person.emotional_patterns) {
    const ep = person.emotional_patterns;
    // Analyze user message to determine appropriate emotional response
    const lowerMessage = userMessage.toLowerCase();

    if (ep.happinessTriggers?.some((t: string) => lowerMessage.includes(t.toLowerCase()))) {
      emotionalContext = 'happy';
    } else if (ep.angerTriggers?.some((t: string) => lowerMessage.includes(t.toLowerCase()))) {
      emotionalContext = 'angry';
    } else if (ep.sadnessTriggers?.some((t: string) => lowerMessage.includes(t.toLowerCase()))) {
      emotionalContext = 'sad';
    }
  }

  return {
    relevantMemories,
    personalityTraits,
    emotionalContext,
    conversationHistory: conversationHistory.slice(-10), // Last 10 messages
  };
}

/**
 * Analyze personality from memories to populate deceased_person profile
 */
export async function analyzePersonality(deceasedPersonId: string): Promise<{
  personalitySummary: string;
  favoritePhrases: string[];
  emotionalPatterns: any;
}> {
  // Get all memories for this person
  const memories = await query<Memory>(
    `SELECT content, emotion_detected, timestamp
     FROM memories
     WHERE deceased_person_id = $1
     ORDER BY timestamp DESC
     LIMIT 1000`,
    [deceasedPersonId]
  );

  if (memories.length === 0) {
    throw new Error('No memories found for personality analysis');
  }

  // Extract favorite phrases (words/phrases that appear frequently)
  const phraseCounts = new Map<string, number>();
  const wordPattern = /\b[\wæøåÆØÅ]+\b/gi;

  memories.forEach((m) => {
    const words = m.content.match(wordPattern) || [];
    words.forEach((word) => {
      const lower = word.toLowerCase();
      if (lower.length > 3) {
        // Ignore very short words
        phraseCounts.set(lower, (phraseCounts.get(lower) || 0) + 1);
      }
    });
  });

  // Get top phrases (excluding common words)
  const commonWords = new Set([
    'ikke', 'være', 'dette', 'skal', 'hvor', 'eller', 'også', 'over',
    'etter', 'kunne', 'ville', 'gjøre', 'være', 'kommer', 'bare',
  ]);

  const favoritePhrases = Array.from(phraseCounts.entries())
    .filter(([word]) => !commonWords.has(word))
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20)
    .map(([word]) => word);

  // Analyze emotional patterns
  const emotionCounts = new Map<string, number>();
  memories.forEach((m) => {
    if (m.emotionDetected) {
      emotionCounts.set(
        m.emotionDetected,
        (emotionCounts.get(m.emotionDetected) || 0) + 1
      );
    }
  });

  const emotionalPatterns = {
    dominantEmotion: Array.from(emotionCounts.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] || 'neutral',
    emotionDistribution: Object.fromEntries(emotionCounts),
  };

  // Generate summary (this could use an LLM for better results)
  const personalitySummary = `Basert på ${memories.length} minner. ` +
    `Dominerende følelse: ${emotionalPatterns.dominantEmotion}. ` +
    `Hyppige uttrykk identifisert.`;

  return {
    personalitySummary,
    favoritePhrases: favoritePhrases.slice(0, 10),
    emotionalPatterns,
  };
}
