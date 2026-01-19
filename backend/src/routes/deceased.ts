import { Router, Request, Response } from 'express';
import { v4 as uuid } from 'uuid';
import { query } from '../db';
import { authMiddleware } from '../middleware/auth';
import { apiLimiter } from '../middleware/rateLimit';
import { DeceasedPerson } from '../types';

const router = Router();

// All routes require authentication
router.use(authMiddleware);
router.use(apiLimiter);

/**
 * GET /deceased - List all deceased persons for current user
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const persons = await query<DeceasedPerson>(
      `SELECT * FROM deceased_persons
       WHERE user_id = $1
       ORDER BY last_interaction_at DESC NULLS LAST, created_at DESC`,
      [req.userId]
    );

    res.json(persons);
  } catch (error) {
    console.error('Failed to list deceased persons:', error);
    res.status(500).json({ error: 'Failed to fetch deceased persons' });
  }
});

/**
 * GET /deceased/:id - Get a specific deceased person
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const persons = await query<DeceasedPerson>(
      `SELECT * FROM deceased_persons
       WHERE id = $1 AND user_id = $2`,
      [id, req.userId]
    );

    if (persons.length === 0) {
      return res.status(404).json({ error: 'Deceased person not found' });
    }

    res.json(persons[0]);
  } catch (error) {
    console.error('Failed to get deceased person:', error);
    res.status(500).json({ error: 'Failed to fetch deceased person' });
  }
});

/**
 * POST /deceased - Create a new deceased person
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const {
      name,
      nickname,
      birthDate,
      deathDate,
      relationship,
      profilePhotoUrl,
      dialect,
    } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    // Check subscription limits
    const existingCount = await query<{ count: string }>(
      'SELECT COUNT(*) as count FROM deceased_persons WHERE user_id = $1',
      [req.userId]
    );

    const count = parseInt(existingCount[0].count, 10);
    const tier = req.user?.subscriptionTier || 'free';
    const maxAllowed = tier === 'free' ? 1 : tier === 'premium' ? 10 : 50;

    if (count >= maxAllowed) {
      return res.status(403).json({
        error: `You have reached the limit of ${maxAllowed} deceased persons for ${tier} tier`,
        currentCount: count,
        maxAllowed,
      });
    }

    const [person] = await query<DeceasedPerson>(
      `INSERT INTO deceased_persons
       (id, user_id, name, nickname, birth_date, death_date, relationship, profile_photo_url, dialect, favorite_phrases)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [
        uuid(),
        req.userId,
        name,
        nickname || null,
        birthDate || null,
        deathDate || null,
        relationship || null,
        profilePhotoUrl || null,
        dialect || null,
        [],
      ]
    );

    res.status(201).json(person);
  } catch (error) {
    console.error('Failed to create deceased person:', error);
    res.status(500).json({ error: 'Failed to create deceased person' });
  }
});

/**
 * PATCH /deceased/:id - Update a deceased person
 */
router.patch('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Verify ownership
    const existing = await query<DeceasedPerson>(
      'SELECT * FROM deceased_persons WHERE id = $1 AND user_id = $2',
      [id, req.userId]
    );

    if (existing.length === 0) {
      return res.status(404).json({ error: 'Deceased person not found' });
    }

    // Build update query dynamically
    const allowedFields = [
      'name',
      'nickname',
      'birth_date',
      'death_date',
      'relationship',
      'profile_photo_url',
      'personality_summary',
      'voice_characteristics',
      'favorite_phrases',
      'emotional_patterns',
      'dialect',
    ];

    const updateFields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    for (const field of allowedFields) {
      if (updates[field] !== undefined) {
        updateFields.push(`${field} = $${paramIndex}`);
        values.push(updates[field]);
        paramIndex++;
      }
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }

    values.push(id);
    values.push(req.userId);

    const [updated] = await query<DeceasedPerson>(
      `UPDATE deceased_persons
       SET ${updateFields.join(', ')}, updated_at = NOW()
       WHERE id = $${paramIndex} AND user_id = $${paramIndex + 1}
       RETURNING *`,
      values
    );

    res.json(updated);
  } catch (error) {
    console.error('Failed to update deceased person:', error);
    res.status(500).json({ error: 'Failed to update deceased person' });
  }
});

/**
 * DELETE /deceased/:id - Delete a deceased person and all associated data
 */
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Verify ownership
    const existing = await query<DeceasedPerson>(
      'SELECT * FROM deceased_persons WHERE id = $1 AND user_id = $2',
      [id, req.userId]
    );

    if (existing.length === 0) {
      return res.status(404).json({ error: 'Deceased person not found' });
    }

    // Delete (cascades to all related data due to foreign keys)
    await query('DELETE FROM deceased_persons WHERE id = $1', [id]);

    res.json({ message: 'Deceased person deleted successfully' });
  } catch (error) {
    console.error('Failed to delete deceased person:', error);
    res.status(500).json({ error: 'Failed to delete deceased person' });
  }
});

/**
 * GET /deceased/:id/stats - Get statistics for a deceased person
 */
router.get('/:id/stats', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Verify ownership
    const persons = await query<DeceasedPerson>(
      'SELECT * FROM deceased_persons WHERE id = $1 AND user_id = $2',
      [id, req.userId]
    );

    if (persons.length === 0) {
      return res.status(404).json({ error: 'Deceased person not found' });
    }

    // Get memory count
    const memoryCount = await query<{ count: string }>(
      'SELECT COUNT(*) as count FROM memories WHERE deceased_person_id = $1',
      [id]
    );

    // Get conversation count
    const conversationCount = await query<{ count: string }>(
      'SELECT COUNT(*) as count FROM conversations WHERE deceased_person_id = $1',
      [id]
    );

    // Get message count
    const messageCount = await query<{ count: string }>(
      `SELECT COUNT(*) as count FROM messages m
       JOIN conversations c ON m.conversation_id = c.id
       WHERE c.deceased_person_id = $1`,
      [id]
    );

    // Get data sources
    const dataSources = await query<{ source_type: string; count: string }>(
      `SELECT source_type, COUNT(*) as count
       FROM data_sources
       WHERE deceased_person_id = $1
       GROUP BY source_type`,
      [id]
    );

    res.json({
      memoryCount: parseInt(memoryCount[0].count, 10),
      conversationCount: parseInt(conversationCount[0].count, 10),
      messageCount: parseInt(messageCount[0].count, 10),
      dataSources: dataSources.map((ds) => ({
        type: ds.source_type,
        count: parseInt(ds.count, 10),
      })),
    });
  } catch (error) {
    console.error('Failed to get stats:', error);
    res.status(500).json({ error: 'Failed to get statistics' });
  }
});

export default router;
