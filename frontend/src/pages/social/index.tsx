import { useState, useEffect } from 'react';
import SocialLayout from '../../components/SocialLayout';
import PostCard from '../../components/PostCard';
import { ScheduledPost, PLATFORMS, DEFAULT_POSTING_TIMES } from '../../types/social';
import { useRouter } from 'next/router';

export default function SocialDashboard() {
  const router = useRouter();
  const [posts, setPosts] = useState<ScheduledPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [todayStats, setTodayStats] = useState({ scheduled: 0, published: 0, remaining: 4 });

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const response = await fetch('/api/social/posts');
      if (response.ok) {
        const data = await response.json();
        setPosts(data);
        calculateStats(data);
      }
    } catch {
      // Use empty state on error
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (allPosts: ScheduledPost[]) => {
    const today = new Date().toISOString().split('T')[0];
    const todayPosts = allPosts.filter((p) => p.scheduledAt.startsWith(today));
    const published = todayPosts.filter((p) => p.status === 'published').length;
    const scheduled = todayPosts.filter((p) => p.status === 'scheduled').length;
    setTodayStats({
      scheduled,
      published,
      remaining: Math.max(0, DEFAULT_POSTING_TIMES.length - published - scheduled),
    });
  };

  const handlePublish = async (postId: string) => {
    try {
      const response = await fetch(`/api/social/posts/${postId}/publish`, { method: 'POST' });
      if (response.ok) {
        fetchPosts();
      }
    } catch {
      // Ignore
    }
  };

  const handleDelete = async (postId: string) => {
    try {
      const response = await fetch(`/api/social/posts/${postId}`, { method: 'DELETE' });
      if (response.ok) {
        setPosts((prev) => prev.filter((p) => p.id !== postId));
      }
    } catch {
      // Ignore
    }
  };

  const upcomingPosts = posts
    .filter((p) => p.status === 'scheduled' || p.status === 'draft')
    .slice(0, 5);

  const recentPosts = posts.filter((p) => p.status === 'published').slice(0, 5);

  return (
    <SocialLayout title="SocialPoster">
      <div className="dashboard">
        {/* Stats overview */}
        <section className="stats-grid">
          <div className="stat-card">
            <span className="stat-number">{todayStats.scheduled}</span>
            <span className="stat-label">Planlagt i dag</span>
          </div>
          <div className="stat-card">
            <span className="stat-number">{todayStats.published}</span>
            <span className="stat-label">Publisert i dag</span>
          </div>
          <div className="stat-card">
            <span className="stat-number">{todayStats.remaining}</span>
            <span className="stat-label">Gjenstår</span>
          </div>
          <div className="stat-card">
            <span className="stat-number">{PLATFORMS.length}</span>
            <span className="stat-label">Plattformer</span>
          </div>
        </section>

        {/* Quick action */}
        <section className="quick-action">
          <button className="btn-create-post" onClick={() => router.push('/social/compose')}>
            ✏️ Opprett nytt innlegg
          </button>
        </section>

        {/* Platform overview */}
        <section className="platform-overview">
          <h2>Plattformer</h2>
          <div className="platform-row">
            {PLATFORMS.map((platform) => (
              <div key={platform.id} className="platform-pill" style={{ borderColor: platform.color }}>
                <span>{platform.icon}</span>
                <span>{platform.name}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Today's schedule */}
        <section className="schedule-preview">
          <div className="section-header">
            <h2>Dagens publiseringstider</h2>
          </div>
          <div className="time-slots">
            {DEFAULT_POSTING_TIMES.map((time, i) => {
              const today = new Date().toISOString().split('T')[0];
              const matchingPost = posts.find(
                (p) =>
                  p.scheduledAt.startsWith(today) &&
                  new Date(p.scheduledAt).toTimeString().slice(0, 5) === time
              );
              return (
                <div key={i} className={`time-slot ${matchingPost ? 'filled' : 'empty'}`}>
                  <span className="slot-time">{time}</span>
                  <span className="slot-status">
                    {matchingPost ? matchingPost.status === 'published' ? '✅' : '⏳' : '➕'}
                  </span>
                  <span className="slot-label">
                    {matchingPost
                      ? matchingPost.content.slice(0, 30) + (matchingPost.content.length > 30 ? '...' : '')
                      : 'Ledig'}
                  </span>
                </div>
              );
            })}
          </div>
        </section>

        {/* Upcoming posts */}
        {upcomingPosts.length > 0 && (
          <section className="post-list">
            <h2>Kommende innlegg</h2>
            {upcomingPosts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                onEdit={() => router.push(`/social/compose?edit=${post.id}`)}
                onDelete={() => handleDelete(post.id)}
                onPublish={() => handlePublish(post.id)}
              />
            ))}
          </section>
        )}

        {/* Recent posts */}
        {recentPosts.length > 0 && (
          <section className="post-list">
            <h2>Nylig publisert</h2>
            {recentPosts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </section>
        )}

        {/* Empty state */}
        {loading && <p className="loading-text">Laster...</p>}
        {!loading && posts.length === 0 && (
          <div className="empty-state">
            <p className="empty-icon">📱</p>
            <h3>Velkommen til SocialPoster!</h3>
            <p>
              Planlegg og publiser innhold til 5 plattformer, opptil 4 ganger om dagen.
            </p>
            <button className="btn-create-post" onClick={() => router.push('/social/compose')}>
              Opprett ditt første innlegg
            </button>
          </div>
        )}
      </div>
    </SocialLayout>
  );
}
