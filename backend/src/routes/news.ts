import { Router, Request, Response } from 'express';
import { query } from '../utils/database';

const router = Router();

// GET /api/news - Get latest news articles
router.get('/', async (req: Request, res: Response) => {
  try {
    const {
      region,
      category,
      source,
      limit = '50',
      offset = '0',
    } = req.query;

    let queryText = `
      SELECT id, title, url, source, region, published_at,
             filtered_content, summary, category, is_verified
      FROM articles
      WHERE 1=1
    `;
    const params: any[] = [];
    let paramIndex = 1;

    if (region) {
      queryText += ` AND region = $${paramIndex}`;
      params.push(region);
      paramIndex++;
    }

    if (category) {
      queryText += ` AND category = $${paramIndex}`;
      params.push(category);
      paramIndex++;
    }

    if (source) {
      queryText += ` AND source = $${paramIndex}`;
      params.push(source);
      paramIndex++;
    }

    queryText += ` ORDER BY published_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(parseInt(limit as string), parseInt(offset as string));

    const result = await query(queryText, params);

    res.json({
      articles: result.rows,
      count: result.rowCount,
      limit: parseInt(limit as string),
      offset: parseInt(offset as string),
    });
  } catch (error) {
    console.error('Error fetching news:', error);
    res.status(500).json({ error: 'Failed to fetch news' });
  }
});

// GET /api/news/stats - Get statistics about news sources
router.get('/stats', async (req: Request, res: Response) => {
  try {
    const regionStats = await query(`
      SELECT region, COUNT(*) as count
      FROM articles
      GROUP BY region
      ORDER BY count DESC
    `);

    const categoryStats = await query(`
      SELECT category, COUNT(*) as count
      FROM articles
      WHERE category IS NOT NULL
      GROUP BY category
      ORDER BY count DESC
    `);

    const sourceStats = await query(`
      SELECT source, region, COUNT(*) as count
      FROM articles
      GROUP BY source, region
      ORDER BY count DESC
    `);

    const recentStats = await query(`
      SELECT
        DATE(published_at) as date,
        COUNT(*) as count
      FROM articles
      WHERE published_at > NOW() - INTERVAL '7 days'
      GROUP BY DATE(published_at)
      ORDER BY date DESC
    `);

    res.json({
      byRegion: regionStats.rows,
      byCategory: categoryStats.rows,
      bySource: sourceStats.rows,
      recent: recentStats.rows,
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

// GET /api/news/:id - Get single article by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const result = await query(
      `SELECT * FROM articles WHERE id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Article not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching article:', error);
    res.status(500).json({ error: 'Failed to fetch article' });
  }
});

// GET /api/news/search - Search articles
router.get('/search/query', async (req: Request, res: Response) => {
  try {
    const { q, limit = '20', offset = '0' } = req.query;

    if (!q) {
      return res.status(400).json({ error: 'Search query required' });
    }

    const result = await query(
      `SELECT id, title, url, source, region, published_at,
              filtered_content, summary, category
       FROM articles
       WHERE title ILIKE $1 OR filtered_content ILIKE $1 OR summary ILIKE $1
       ORDER BY published_at DESC
       LIMIT $2 OFFSET $3`,
      [`%${q}%`, parseInt(limit as string), parseInt(offset as string)]
    );

    res.json({
      articles: result.rows,
      count: result.rowCount,
      query: q,
    });
  } catch (error) {
    console.error('Error searching articles:', error);
    res.status(500).json({ error: 'Failed to search articles' });
  }
});

// GET /api/news/regions - Get available regions
router.get('/meta/regions', async (req: Request, res: Response) => {
  try {
    const result = await query(`
      SELECT DISTINCT region
      FROM articles
      ORDER BY region
    `);

    res.json(result.rows.map((r) => r.region));
  } catch (error) {
    console.error('Error fetching regions:', error);
    res.status(500).json({ error: 'Failed to fetch regions' });
  }
});

// GET /api/news/sources - Get available sources
router.get('/meta/sources', async (req: Request, res: Response) => {
  try {
    const result = await query(`
      SELECT DISTINCT source, region
      FROM articles
      ORDER BY source
    `);

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching sources:', error);
    res.status(500).json({ error: 'Failed to fetch sources' });
  }
});

export default router;
