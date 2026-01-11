import { useState, useEffect } from 'react';
import Link from 'next/link';
import '../../styles/tasks.css';

interface Task {
  id: string;
  title: string;
  description?: string;
  difficulty: number;
  category: string;
  status: 'todo' | 'in_progress' | 'completed';
  points: number;
  createdAt: string;
  completedAt?: string;
  deadline?: string;
}

interface UserProgress {
  totalPoints: number;
  level: number;
  currentStreak: number;
  longestStreak: number;
  tasksCompleted: number;
  achievements: Achievement[];
}

interface Achievement {
  id: string;
  achievementType: string;
  achievementName: string;
  earnedAt: string;
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [showNewTaskForm, setShowNewTaskForm] = useState(false);
  const [celebration, setCelebration] = useState<string | null>(null);

  // New task form state
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    difficulty: 3,
    category: 'work',
  });

  useEffect(() => {
    loadTasks();
    loadProgress();
  }, []);

  const loadTasks = async () => {
    try {
      const response = await fetch('/api/tasks', {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setTasks(data);
      }
    } catch (error) {
      console.error('Failed to load tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadProgress = async () => {
    try {
      const response = await fetch('/api/tasks/progress', {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setProgress(data);
      }
    } catch (error) {
      console.error('Failed to load progress:', error);
    }
  };

  const createTask = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(newTask),
      });

      if (response.ok) {
        const task = await response.json();
        setTasks([...tasks, task]);
        setNewTask({ title: '', description: '', difficulty: 3, category: 'work' });
        setShowNewTaskForm(false);
      }
    } catch (error) {
      console.error('Failed to create task:', error);
    }
  };

  const updateTaskStatus = async (taskId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        const data = await response.json();
        setTasks(tasks.map((t) => (t.id === taskId ? data.task : t)));

        // Show celebration if task was completed
        if (newStatus === 'completed') {
          const messages = [
            `🎉 +${data.pointsEarned} points! You're unstoppable!`,
            `💪 Crushed it! +${data.pointsEarned} points earned!`,
            `🌟 Amazing work! +${data.pointsEarned} points!`,
            `🚀 You're on fire! +${data.pointsEarned} points!`,
            `⭐ Legendary! +${data.pointsEarned} points earned!`,
          ];
          const randomMessage = messages[Math.floor(Math.random() * messages.length)];

          let celebrationText = randomMessage;
          if (data.leveledUp) {
            celebrationText += `\n🎊 LEVEL UP! You're now level ${data.level}!`;
          }
          if (data.newAchievements && data.newAchievements.length > 0) {
            celebrationText += `\n🏆 New Achievement: ${data.newAchievements[0].achievementName}!`;
          }
          if (data.streak > 1) {
            celebrationText += `\n🔥 ${data.streak} day streak!`;
          }

          setCelebration(celebrationText);
          setTimeout(() => setCelebration(null), 5000);
          loadProgress();
        }
      }
    } catch (error) {
      console.error('Failed to update task:', error);
    }
  };

  const deleteTask = async (taskId: string) => {
    if (!confirm('Are you sure you want to delete this task?')) return;

    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (response.ok) {
        setTasks(tasks.filter((t) => t.id !== taskId));
      }
    } catch (error) {
      console.error('Failed to delete task:', error);
    }
  };

  const getDifficultyStars = (difficulty: number) => {
    return '⭐'.repeat(difficulty);
  };

  const getCategoryEmoji = (category: string) => {
    const emojis: Record<string, string> = {
      work: '💼',
      health: '🏃',
      learning: '📚',
      creative: '🎨',
      personal: '🌱',
      social: '👥',
    };
    return emojis[category] || '✨';
  };

  const getProgressToNextLevel = () => {
    if (!progress) return 0;
    const pointsForCurrentLevel = (progress.level - 1) * 500;
    const pointsForNextLevel = progress.level * 500;
    const pointsInLevel = progress.totalPoints - pointsForCurrentLevel;
    const pointsNeeded = pointsForNextLevel - pointsForCurrentLevel;
    return (pointsInLevel / pointsNeeded) * 100;
  };

  if (loading) {
    return <div className="tasks-page">Loading your epic quest...</div>;
  }

  const todoTasks = tasks.filter((t) => t.status === 'todo');
  const inProgressTasks = tasks.filter((t) => t.status === 'in_progress');
  const completedTasks = tasks.filter((t) => t.status === 'completed');

  return (
    <div className="tasks-page">
      <header className="tasks-header">
        <h1>🎮 Quest Board</h1>
        <p className="tagline">Turn your hard tasks into epic wins!</p>
      </header>

      {celebration && (
        <div className="celebration-banner">
          {celebration.split('\n').map((line, i) => (
            <div key={i}>{line}</div>
          ))}
        </div>
      )}

      {progress && (
        <div className="progress-card">
          <div className="progress-stats">
            <div className="stat">
              <div className="stat-label">Level</div>
              <div className="stat-value">{progress.level}</div>
            </div>
            <div className="stat">
              <div className="stat-label">Total Points</div>
              <div className="stat-value">{progress.totalPoints}</div>
            </div>
            <div className="stat">
              <div className="stat-label">Streak 🔥</div>
              <div className="stat-value">{progress.currentStreak} days</div>
            </div>
            <div className="stat">
              <div className="stat-label">Completed</div>
              <div className="stat-value">{progress.tasksCompleted}</div>
            </div>
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${getProgressToNextLevel()}%` }}></div>
          </div>
          <div className="progress-label">
            {Math.round(getProgressToNextLevel())}% to Level {progress.level + 1}
          </div>
        </div>
      )}

      <button className="btn-primary" onClick={() => setShowNewTaskForm(!showNewTaskForm)}>
        {showNewTaskForm ? '✕ Cancel' : '+ New Quest'}
      </button>

      {showNewTaskForm && (
        <form className="new-task-form" onSubmit={createTask}>
          <h3>Create New Quest</h3>
          <input
            type="text"
            placeholder="Quest title (e.g., 'Finish project report')"
            value={newTask.title}
            onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
            required
          />
          <textarea
            placeholder="Quest details (optional)"
            value={newTask.description}
            onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
          />
          <div className="form-row">
            <label>
              Difficulty {getDifficultyStars(newTask.difficulty)}
              <input
                type="range"
                min="1"
                max="5"
                value={newTask.difficulty}
                onChange={(e) => setNewTask({ ...newTask, difficulty: parseInt(e.target.value) })}
              />
              <span className="points-preview">({newTask.difficulty * 100} points)</span>
            </label>
            <label>
              Category
              <select
                value={newTask.category}
                onChange={(e) => setNewTask({ ...newTask, category: e.target.value })}
              >
                <option value="work">💼 Work</option>
                <option value="health">🏃 Health</option>
                <option value="learning">📚 Learning</option>
                <option value="creative">🎨 Creative</option>
                <option value="personal">🌱 Personal</option>
                <option value="social">👥 Social</option>
              </select>
            </label>
          </div>
          <button type="submit" className="btn-success">Create Quest</button>
        </form>
      )}

      <div className="tasks-columns">
        <div className="task-column">
          <h2>📋 To Do ({todoTasks.length})</h2>
          {todoTasks.map((task) => (
            <div key={task.id} className="task-card">
              <div className="task-header">
                <span className="task-category">{getCategoryEmoji(task.category)}</span>
                <span className="task-difficulty">{getDifficultyStars(task.difficulty)}</span>
              </div>
              <h3>{task.title}</h3>
              {task.description && <p className="task-description">{task.description}</p>}
              <div className="task-footer">
                <span className="task-points">{task.points} pts</span>
                <div className="task-actions">
                  <button onClick={() => updateTaskStatus(task.id, 'in_progress')}>Start</button>
                  <button onClick={() => deleteTask(task.id)}>✕</button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="task-column">
          <h2>🚀 In Progress ({inProgressTasks.length})</h2>
          {inProgressTasks.map((task) => (
            <div key={task.id} className="task-card in-progress">
              <div className="task-header">
                <span className="task-category">{getCategoryEmoji(task.category)}</span>
                <span className="task-difficulty">{getDifficultyStars(task.difficulty)}</span>
              </div>
              <h3>{task.title}</h3>
              {task.description && <p className="task-description">{task.description}</p>}
              <div className="task-footer">
                <span className="task-points">{task.points} pts</span>
                <div className="task-actions">
                  <button className="btn-success" onClick={() => updateTaskStatus(task.id, 'completed')}>
                    Complete
                  </button>
                  <button onClick={() => updateTaskStatus(task.id, 'todo')}>Back</button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="task-column">
          <h2>✅ Completed ({completedTasks.length})</h2>
          {completedTasks.slice(0, 10).map((task) => (
            <div key={task.id} className="task-card completed">
              <div className="task-header">
                <span className="task-category">{getCategoryEmoji(task.category)}</span>
                <span className="task-difficulty">{getDifficultyStars(task.difficulty)}</span>
              </div>
              <h3>{task.title}</h3>
              <div className="task-footer">
                <span className="task-points">✓ {task.points} pts</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {progress && progress.achievements.length > 0 && (
        <div className="achievements-section">
          <h2>🏆 Achievements</h2>
          <div className="achievements-grid">
            {progress.achievements.map((achievement) => (
              <div key={achievement.id} className="achievement-badge">
                <div className="achievement-icon">🏆</div>
                <div className="achievement-name">{achievement.achievementName}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
