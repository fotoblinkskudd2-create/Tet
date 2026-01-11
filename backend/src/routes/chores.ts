import express, { Request, Response } from 'express';

const router = express.Router();

interface Chore {
  id: string;
  userId: string;
  title: string;
  emoji: string;
  points: number;
  completed: boolean;
  difficulty: 'easy' | 'medium' | 'hard';
  createdAt: Date;
  completedAt?: Date;
}

interface UserChoreStats {
  userId: string;
  totalPoints: number;
  streak: number;
  level: number;
  completedToday: number;
  totalCompleted: number;
}

// In-memory storage (replace with database in production)
const chores: Chore[] = [];
const userStats: Map<string, UserChoreStats> = new Map();

// Get all chores for a user
router.get('/chores', async (req: Request, res: Response) => {
  try {
    const userId = req.query.userId as string;

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const userChores = chores.filter(chore => chore.userId === userId);

    res.json({
      success: true,
      chores: userChores,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch chores' });
  }
});

// Create a new chore
router.post('/chores', async (req: Request, res: Response) => {
  try {
    const { userId, title, emoji, points, difficulty } = req.body;

    if (!userId || !title || !emoji || !points || !difficulty) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const newChore: Chore = {
      id: `chore_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      title,
      emoji,
      points,
      completed: false,
      difficulty,
      createdAt: new Date(),
    };

    chores.push(newChore);

    res.status(201).json({
      success: true,
      chore: newChore,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create chore' });
  }
});

// Mark chore as completed/uncompleted
router.patch('/chores/:choreId/toggle', async (req: Request, res: Response) => {
  try {
    const { choreId } = req.params;
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const choreIndex = chores.findIndex(c => c.id === choreId && c.userId === userId);

    if (choreIndex === -1) {
      return res.status(404).json({ error: 'Chore not found' });
    }

    const chore = chores[choreIndex];
    chore.completed = !chore.completed;
    chore.completedAt = chore.completed ? new Date() : undefined;

    // Update user stats
    let stats = userStats.get(userId) || {
      userId,
      totalPoints: 0,
      streak: 0,
      level: 1,
      completedToday: 0,
      totalCompleted: 0,
    };

    if (chore.completed) {
      stats.totalPoints += chore.points;
      stats.completedToday += 1;
      stats.totalCompleted += 1;
      stats.level = Math.floor(stats.totalPoints / 100) + 1;
    } else {
      stats.totalPoints = Math.max(0, stats.totalPoints - chore.points);
      stats.completedToday = Math.max(0, stats.completedToday - 1);
      stats.totalCompleted = Math.max(0, stats.totalCompleted - 1);
      stats.level = Math.floor(stats.totalPoints / 100) + 1;
    }

    userStats.set(userId, stats);

    res.json({
      success: true,
      chore,
      stats,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to toggle chore' });
  }
});

// Get user statistics
router.get('/stats', async (req: Request, res: Response) => {
  try {
    const userId = req.query.userId as string;

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const stats = userStats.get(userId) || {
      userId,
      totalPoints: 0,
      streak: 0,
      level: 1,
      completedToday: 0,
      totalCompleted: 0,
    };

    res.json({
      success: true,
      stats,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// Delete a chore
router.delete('/chores/:choreId', async (req: Request, res: Response) => {
  try {
    const { choreId } = req.params;
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const choreIndex = chores.findIndex(c => c.id === choreId && c.userId === userId);

    if (choreIndex === -1) {
      return res.status(404).json({ error: 'Chore not found' });
    }

    chores.splice(choreIndex, 1);

    res.json({
      success: true,
      message: 'Chore deleted successfully',
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete chore' });
  }
});

export default router;
