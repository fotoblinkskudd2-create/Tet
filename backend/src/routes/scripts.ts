import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import pool from '../db';
import { generateMovieScript, regenerateScene } from '../services/scriptGenerator';
import { authMiddleware } from './auth';
import {
  ScriptGenerationRequest,
  SceneRegenerationRequest,
  CastingRequest,
  Script,
  Scene,
  Character,
} from '../types/script';

const router = Router();

// Generate a new movie script
router.post('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { genre, location, main_conflict } = req.body as ScriptGenerationRequest;
    const userId = (req as any).userId;

    if (!genre || !location || !main_conflict) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    console.log(`✨ Generating script: ${genre} at ${location}...`);

    // Generate script using Claude
    const generatedScript = await generateMovieScript(genre, location, main_conflict);

    // Insert script into database
    const scriptResult = await pool.query(
      `INSERT INTO scripts (id, user_id, title, genre, location, main_conflict)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [uuidv4(), userId, generatedScript.title, genre, location, main_conflict]
    );

    const script = scriptResult.rows[0];

    // Insert scenes
    const scenePromises = generatedScript.scenes.map((scene) =>
      pool.query(
        `INSERT INTO scenes (id, script_id, scene_number, location, time_of_day, description, camera_angle, dialogue)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING *`,
        [
          uuidv4(),
          script.id,
          scene.scene_number,
          scene.location,
          scene.time_of_day,
          scene.description,
          scene.camera_angle,
          JSON.stringify(scene.dialogue),
        ]
      )
    );

    // Insert characters
    const characterPromises = generatedScript.characters.map((char) =>
      pool.query(
        `INSERT INTO characters (id, script_id, name, description)
         VALUES ($1, $2, $3, $4)
         RETURNING *`,
        [uuidv4(), script.id, char.name, char.description]
      )
    );

    const [sceneResults, characterResults] = await Promise.all([
      Promise.all(scenePromises),
      Promise.all(characterPromises),
    ]);

    const scenes = sceneResults.map((r) => ({
      ...r.rows[0],
      dialogue: r.rows[0].dialogue,
    }));
    const characters = characterResults.map((r) => r.rows[0]);

    console.log(`✨ Script generated successfully: ${script.title}`);

    res.json({
      script,
      scenes,
      characters,
    });
  } catch (error) {
    console.error('Error generating script:', error);
    res.status(500).json({ error: 'Failed to generate script' });
  }
});

// Get all scripts for the authenticated user
router.get('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;

    const result = await pool.query(
      'SELECT * FROM scripts WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching scripts:', error);
    res.status(500).json({ error: 'Failed to fetch scripts' });
  }
});

// Get a specific script with all scenes and characters
router.get('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).userId;

    const scriptResult = await pool.query(
      'SELECT * FROM scripts WHERE id = $1 AND user_id = $2',
      [id, userId]
    );

    if (scriptResult.rows.length === 0) {
      return res.status(404).json({ error: 'Script not found' });
    }

    const script = scriptResult.rows[0];

    const [scenesResult, charactersResult] = await Promise.all([
      pool.query(
        'SELECT * FROM scenes WHERE script_id = $1 ORDER BY scene_number ASC',
        [id]
      ),
      pool.query('SELECT * FROM characters WHERE script_id = $1', [id]),
    ]);

    const scenes = scenesResult.rows.map((scene) => ({
      ...scene,
      dialogue: scene.dialogue,
    }));

    res.json({
      script,
      scenes,
      characters: charactersResult.rows,
    });
  } catch (error) {
    console.error('Error fetching script:', error);
    res.status(500).json({ error: 'Failed to fetch script' });
  }
});

// Regenerate a specific scene
router.put('/:id/scenes/:sceneNumber', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { id, sceneNumber } = req.params;
    const { prompt } = req.body as SceneRegenerationRequest;
    const userId = (req as any).userId;

    // Verify script ownership
    const scriptResult = await pool.query(
      'SELECT * FROM scripts WHERE id = $1 AND user_id = $2',
      [id, userId]
    );

    if (scriptResult.rows.length === 0) {
      return res.status(404).json({ error: 'Script not found' });
    }

    const script = scriptResult.rows[0];

    // Get surrounding scenes for context
    const scenesResult = await pool.query(
      'SELECT * FROM scenes WHERE script_id = $1 ORDER BY scene_number ASC',
      [id]
    );

    const sceneContext = scenesResult.rows
      .map((s) => `Scene ${s.scene_number}: ${s.description}`)
      .join('\n');

    console.log(`✨ Regenerating scene ${sceneNumber}...`);

    // Regenerate the scene
    const newScene = await regenerateScene(
      sceneContext,
      parseInt(sceneNumber),
      script.genre,
      prompt
    );

    // Update the scene in database
    const updateResult = await pool.query(
      `UPDATE scenes
       SET location = $1, time_of_day = $2, description = $3, camera_angle = $4, dialogue = $5
       WHERE script_id = $6 AND scene_number = $7
       RETURNING *`,
      [
        newScene.location,
        newScene.time_of_day,
        newScene.description,
        newScene.camera_angle,
        JSON.stringify(newScene.dialogue),
        id,
        sceneNumber,
      ]
    );

    if (updateResult.rows.length === 0) {
      return res.status(404).json({ error: 'Scene not found' });
    }

    const updatedScene = {
      ...updateResult.rows[0],
      dialogue: updateResult.rows[0].dialogue,
    };

    console.log(`✨ Scene ${sceneNumber} regenerated successfully`);

    res.json(updatedScene);
  } catch (error) {
    console.error('Error regenerating scene:', error);
    res.status(500).json({ error: 'Failed to regenerate scene' });
  }
});

// Cast an actor for a character
router.put('/:id/characters/:characterName/cast', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { id, characterName } = req.params;
    const { actor_name } = req.body as CastingRequest;
    const userId = (req as any).userId;

    // Verify script ownership
    const scriptResult = await pool.query(
      'SELECT * FROM scripts WHERE id = $1 AND user_id = $2',
      [id, userId]
    );

    if (scriptResult.rows.length === 0) {
      return res.status(404).json({ error: 'Script not found' });
    }

    // Update character casting
    const result = await pool.query(
      `UPDATE characters
       SET actor_name = $1
       WHERE script_id = $2 AND name = $3
       RETURNING *`,
      [actor_name, id, decodeURIComponent(characterName)]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Character not found' });
    }

    console.log(`✨ Cast ${actor_name} as ${characterName}`);

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error casting character:', error);
    res.status(500).json({ error: 'Failed to cast character' });
  }
});

// Delete a script
router.delete('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).userId;

    const result = await pool.query(
      'DELETE FROM scripts WHERE id = $1 AND user_id = $2 RETURNING *',
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Script not found' });
    }

    res.json({ message: 'Script deleted successfully' });
  } catch (error) {
    console.error('Error deleting script:', error);
    res.status(500).json({ error: 'Failed to delete script' });
  }
});

export default router;
