import { Router, Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { v4 as uuid } from 'uuid';

interface Task {
  id: string;
  userId: string;
  title: string;
  description?: string;
  difficulty: number;
  category: string;
  status: 'todo' | 'in_progress' | 'completed';
  points: number;
  createdAt: Date;
  completedAt?: Date;
  deadline?: Date;
}

interface Achievement {
  id: string;
  userId: string;
  achievementType: string;
  achievementName: string;
  earnedAt: Date;
}

interface UserProgress {
  totalPoints: number;
  level: number;
  currentStreak: number;
  longestStreak: number;
  lastTaskDate?: Date;
}

const tasks = new Map<string, Task>();
const achievements = new Map<string, Achievement>();
const userProgress = new Map<string, UserProgress>();

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';
const COOKIE_NAME = 'session';

function parseTokenFromRequest(req: Request): string | undefined {
  const fromCookie = (req as any).cookies?.[COOKIE_NAME];
  if (fromCookie) return fromCookie;

  const header = req.headers.authorization;
  if (!header) return undefined;
  const [, token] = header.split(' ');
  return token;
}

function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const token = parseTokenFromRequest(req);
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET) as { userId: string };
    (req as any).userId = payload.userId;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

function calculatePoints(difficulty: number): number {
  return difficulty * 100;
}

function calculateLevel(totalPoints: number): number {
  return Math.floor(totalPoints / 500) + 1;
}

function getUserProgress(userId: string): UserProgress {
  if (!userProgress.has(userId)) {
    userProgress.set(userId, {
      totalPoints: 0,
      level: 1,
      currentStreak: 0,
      longestStreak: 0,
    });
  }
  return userProgress.get(userId)!;
}

function updateStreak(userId: string): { newStreak: number; achievement?: Achievement } {
  const progress = getUserProgress(userId);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (!progress.lastTaskDate) {
    progress.currentStreak = 1;
  } else {
    const lastDate = new Date(progress.lastTaskDate);
    lastDate.setHours(0, 0, 0, 0);
    const daysDiff = Math.floor((today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));

    if (daysDiff === 1) {
      progress.currentStreak += 1;
    } else if (daysDiff === 0) {
      // Same day, don't change streak
    } else {
      progress.currentStreak = 1;
    }
  }

  progress.lastTaskDate = today;
  if (progress.currentStreak > progress.longestStreak) {
    progress.longestStreak = progress.currentStreak;
  }

  let achievement: Achievement | undefined;
  if (progress.currentStreak === 7 && !hasAchievement(userId, 'week_streak')) {
    achievement = {
      id: uuid(),
      userId,
      achievementType: 'week_streak',
      achievementName: '7-Day Warrior',
      earnedAt: new Date(),
    };
    achievements.set(achievement.id, achievement);
  }

  return { newStreak: progress.currentStreak, achievement };
}

function hasAchievement(userId: string, achievementType: string): boolean {
  return [...achievements.values()].some(
    (a) => a.userId === userId && a.achievementType === achievementType
  );
}

function checkAchievements(userId: string): Achievement[] {
  const newAchievements: Achievement[] = [];
  const userTasks = [...tasks.values()].filter((t) => t.userId === userId && t.status === 'completed');
  const progress = getUserProgress(userId);

  // First task achievement
  if (userTasks.length === 1 && !hasAchievement(userId, 'first_task')) {
    const achievement = {
      id: uuid(),
      userId,
      achievementType: 'first_task',
      achievementName: 'Getting Started',
      earnedAt: new Date(),
    };
    achievements.set(achievement.id, achievement);
    newAchievements.push(achievement);
  }

  // 10 tasks achievement
  if (userTasks.length >= 10 && !hasAchievement(userId, 'ten_tasks')) {
    const achievement = {
      id: uuid(),
      userId,
      achievementType: 'ten_tasks',
      achievementName: 'Task Master',
      earnedAt: new Date(),
    };
    achievements.set(achievement.id, achievement);
    newAchievements.push(achievement);
  }

  // Level 5 achievement
  if (progress.level >= 5 && !hasAchievement(userId, 'level_5')) {
    const achievement = {
      id: uuid(),
      userId,
      achievementType: 'level_5',
      achievementName: 'Rising Star',
      earnedAt: new Date(),
    };
    achievements.set(achievement.id, achievement);
    newAchievements.push(achievement);
  }

  // Hard task achievement
  if (userTasks.some((t) => t.difficulty === 5) && !hasAchievement(userId, 'hard_task')) {
    const achievement = {
      id: uuid(),
      userId,
      achievementType: 'hard_task',
      achievementName: 'Challenge Accepted',
      earnedAt: new Date(),
    };
    achievements.set(achievement.id, achievement);
    newAchievements.push(achievement);
  }

  return newAchievements;
}

// Get all tasks for the current user
router.get('/', authMiddleware, (req: Request, res: Response) => {
  const userId = (req as any).userId as string;
  const userTasks = [...tasks.values()].filter((t) => t.userId === userId);
  res.json(userTasks);
});

// Create a new task
router.post('/', authMiddleware, (req: Request, res: Response) => {
  const userId = (req as any).userId as string;
  const { title, description, difficulty, category, deadline } = req.body;

  if (!title || !difficulty || !category) {
    return res.status(400).json({ error: 'Title, difficulty, and category are required' });
  }

  if (difficulty < 1 || difficulty > 5) {
    return res.status(400).json({ error: 'Difficulty must be between 1 and 5' });
  }

  const points = calculatePoints(difficulty);
  const newTask: Task = {
    id: uuid(),
    userId,
    title,
    description,
    difficulty,
    category,
    status: 'todo',
    points,
    createdAt: new Date(),
    deadline: deadline ? new Date(deadline) : undefined,
  };

  tasks.set(newTask.id, newTask);
  res.status(201).json(newTask);
});

// Update task status
router.patch('/:id', authMiddleware, (req: Request, res: Response) => {
  const userId = (req as any).userId as string;
  const taskId = req.params.id;
  const { status } = req.body;

  const task = tasks.get(taskId);
  if (!task) {
    return res.status(404).json({ error: 'Task not found' });
  }

  if (task.userId !== userId) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  if (status && !['todo', 'in_progress', 'completed'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }

  const wasCompleted = task.status === 'completed';
  task.status = status || task.status;

  const response: any = { task };

  // Award points and check for achievements when completing a task
  if (status === 'completed' && !wasCompleted) {
    task.completedAt = new Date();
    const progress = getUserProgress(userId);
    progress.totalPoints += task.points;
    const oldLevel = progress.level;
    progress.level = calculateLevel(progress.totalPoints);

    const { newStreak, achievement: streakAchievement } = updateStreak(userId);
    const newAchievements = checkAchievements(userId);

    if (streakAchievement) {
      newAchievements.push(streakAchievement);
    }

    response.pointsEarned = task.points;
    response.totalPoints = progress.totalPoints;
    response.level = progress.level;
    response.leveledUp = progress.level > oldLevel;
    response.streak = newStreak;
    response.newAchievements = newAchievements;
  }

  tasks.set(taskId, task);
  res.json(response);
});

// Delete a task
router.delete('/:id', authMiddleware, (req: Request, res: Response) => {
  const userId = (req as any).userId as string;
  const taskId = req.params.id;

  const task = tasks.get(taskId);
  if (!task) {
    return res.status(404).json({ error: 'Task not found' });
  }

  if (task.userId !== userId) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  tasks.delete(taskId);
  res.status(204).send();
});

// Get user progress
router.get('/progress', authMiddleware, (req: Request, res: Response) => {
  const userId = (req as any).userId as string;
  const progress = getUserProgress(userId);
  const userAchievements = [...achievements.values()].filter((a) => a.userId === userId);
  const completedTasks = [...tasks.values()].filter(
    (t) => t.userId === userId && t.status === 'completed'
  ).length;

  res.json({
    ...progress,
    achievements: userAchievements,
    tasksCompleted: completedTasks,
  });
});

// Get user achievements
router.get('/achievements', authMiddleware, (req: Request, res: Response) => {
  const userId = (req as any).userId as string;
  const userAchievements = [...achievements.values()].filter((a) => a.userId === userId);
  res.json(userAchievements);
});

export default router;
