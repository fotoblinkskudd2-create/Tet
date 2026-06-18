import { Router, Response } from 'express';
import { pool } from '../db';
import { AuthedRequest, authMiddleware } from '../middleware/auth';

const router = Router();
const VALID_STATUSES = ['planned', 'in_progress', 'completed', 'cancelled'];

router.use(authMiddleware);

function validateProjectBody(body: any, { partial = false } = {}) {
  if (!partial && !body?.name) {
    throw new Error('name is required');
  }
  if (body?.status !== undefined && !VALID_STATUSES.includes(body.status)) {
    throw new Error(`status must be one of: ${VALID_STATUSES.join(', ')}`);
  }
}

router.get('/', async (req: AuthedRequest, res: Response) => {
  const result = await pool.query(
    'SELECT * FROM projects WHERE owner_id = $1 ORDER BY created_at DESC',
    [req.userId]
  );
  res.json(result.rows);
});

router.get('/:id', async (req: AuthedRequest, res: Response) => {
  const result = await pool.query('SELECT * FROM projects WHERE id = $1 AND owner_id = $2', [
    req.params.id,
    req.userId,
  ]);
  const project = result.rows[0];
  if (!project) {
    return res.status(404).json({ error: 'Project not found' });
  }
  res.json(project);
});

router.post('/', async (req: AuthedRequest, res: Response) => {
  try {
    validateProjectBody(req.body);
    const { name, address, status, startDate, endDate, budget, currentValue } = req.body;

    const result = await pool.query(
      `INSERT INTO projects (owner_id, name, address, status, start_date, end_date, budget, current_value)
       VALUES ($1, $2, $3, COALESCE($4, 'planned'), $5, $6, $7, $8)
       RETURNING *`,
      [
        req.userId,
        name,
        address ?? null,
        status ?? null,
        startDate ?? null,
        endDate ?? null,
        budget ?? null,
        currentValue ?? null,
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
});

router.put('/:id', async (req: AuthedRequest, res: Response) => {
  try {
    validateProjectBody(req.body, { partial: true });

    const existing = await pool.query('SELECT * FROM projects WHERE id = $1 AND owner_id = $2', [
      req.params.id,
      req.userId,
    ]);
    if (!existing.rowCount) {
      return res.status(404).json({ error: 'Project not found' });
    }
    const current = existing.rows[0];
    const { name, address, status, startDate, endDate, budget, currentValue } = req.body;

    const result = await pool.query(
      `UPDATE projects
       SET name = $1, address = $2, status = $3, start_date = $4, end_date = $5,
           budget = $6, current_value = $7
       WHERE id = $8 AND owner_id = $9
       RETURNING *`,
      [
        name ?? current.name,
        address ?? current.address,
        status ?? current.status,
        startDate ?? current.start_date,
        endDate ?? current.end_date,
        budget ?? current.budget,
        currentValue ?? current.current_value,
        req.params.id,
        req.userId,
      ]
    );

    res.json(result.rows[0]);
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
});

router.delete('/:id', async (req: AuthedRequest, res: Response) => {
  const result = await pool.query('DELETE FROM projects WHERE id = $1 AND owner_id = $2', [
    req.params.id,
    req.userId,
  ]);
  if (!result.rowCount) {
    return res.status(404).json({ error: 'Project not found' });
  }
  res.status(204).end();
});

export default router;
