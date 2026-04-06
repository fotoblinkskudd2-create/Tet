import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import SocialLayout from '../../components/SocialLayout';
import PostCard from '../../components/PostCard';
import { ScheduledPost, DEFAULT_POSTING_TIMES, PLATFORMS } from '../../types/social';

interface ScheduleSlot {
  id: string;
  time: string;
  post: ScheduledPost | null;
}

export default function SchedulePage() {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [slots, setSlots] = useState<ScheduleSlot[]>([]);
  const [allPosts, setAllPosts] = useState<ScheduledPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'day' | 'week'>('day');

  useEffect(() => {
    fetchSchedule();
  }, [selectedDate]);

  const fetchSchedule = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/social/schedule?date=${selectedDate}`);
      if (response.ok) {
        const data = await response.json();
        setSlots(data.slots);
      }

      const postsRes = await fetch('/api/social/posts');
      if (postsRes.ok) {
        setAllPosts(await postsRes.json());
      }
    } catch {
      // Use defaults
      setSlots(
        DEFAULT_POSTING_TIMES.map((time, i) => ({
          id: `slot-${i}`,
          time,
          post: null,
        }))
      );
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async (postId: string) => {
    try {
      await fetch(`/api/social/posts/${postId}/publish`, { method: 'POST' });
      fetchSchedule();
    } catch {
      // Ignore
    }
  };

  const handleDelete = async (postId: string) => {
    try {
      await fetch(`/api/social/posts/${postId}`, { method: 'DELETE' });
      fetchSchedule();
    } catch {
      // Ignore
    }
  };

  const navigateDate = (direction: number) => {
    const date = new Date(selectedDate);
    date.setDate(date.getDate() + direction);
    setSelectedDate(date.toISOString().split('T')[0]);
  };

  const isToday = selectedDate === new Date().toISOString().split('T')[0];

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + 'T12:00:00');
    return date.toLocaleDateString('nb-NO', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    });
  };

  // Get week dates for week view
  const getWeekDates = () => {
    const start = new Date(selectedDate);
    start.setDate(start.getDate() - start.getDay() + 1); // Monday
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(start);
      d.setDate(d.getDate() + i);
      return d.toISOString().split('T')[0];
    });
  };

  const getPostsForDate = (date: string) => {
    return allPosts.filter((p) => p.scheduledAt.startsWith(date));
  };

  return (
    <SocialLayout title="Publiseringsplan">
      <div className="schedule-page">
        {/* Date navigation */}
        <div className="date-nav">
          <button className="btn-nav" onClick={() => navigateDate(-1)}>
            ◀
          </button>
          <div className="date-display">
            <span className="date-text">{formatDate(selectedDate)}</span>
            {isToday && <span className="today-badge">I dag</span>}
          </div>
          <button className="btn-nav" onClick={() => navigateDate(1)}>
            ▶
          </button>
        </div>

        {/* View toggle */}
        <div className="view-toggle">
          <button
            className={`toggle-btn ${viewMode === 'day' ? 'active' : ''}`}
            onClick={() => setViewMode('day')}
          >
            Dag
          </button>
          <button
            className={`toggle-btn ${viewMode === 'week' ? 'active' : ''}`}
            onClick={() => setViewMode('week')}
          >
            Uke
          </button>
        </div>

        {loading && <p className="loading-text">Laster plan...</p>}

        {/* Day view */}
        {!loading && viewMode === 'day' && (
          <div className="day-schedule">
            <div className="schedule-summary">
              <span>
                {slots.filter((s) => s.post).length} / {DEFAULT_POSTING_TIMES.length} tidsluker fylt
              </span>
            </div>

            {slots.map((slot) => (
              <div key={slot.id} className={`schedule-slot ${slot.post ? 'has-post' : 'empty'}`}>
                <div className="slot-time-marker">
                  <span className="time-dot" />
                  <span className="time-label">{slot.time}</span>
                </div>

                {slot.post ? (
                  <PostCard
                    post={slot.post}
                    onEdit={() => router.push(`/social/compose?edit=${slot.post!.id}`)}
                    onDelete={() => handleDelete(slot.post!.id)}
                    onPublish={() => handlePublish(slot.post!.id)}
                  />
                ) : (
                  <button
                    className="empty-slot-btn"
                    onClick={() => router.push(`/social/compose?time=${slot.time}&date=${selectedDate}`)}
                  >
                    <span className="plus-icon">+</span>
                    <span>Opprett innlegg for {slot.time}</span>
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Week view */}
        {!loading && viewMode === 'week' && (
          <div className="week-schedule">
            {getWeekDates().map((date) => {
              const datePosts = getPostsForDate(date);
              const isSelected = date === selectedDate;
              const dayDate = new Date(date + 'T12:00:00');
              return (
                <div
                  key={date}
                  className={`week-day ${isSelected ? 'selected' : ''}`}
                  onClick={() => {
                    setSelectedDate(date);
                    setViewMode('day');
                  }}
                >
                  <span className="week-day-name">
                    {dayDate.toLocaleDateString('nb-NO', { weekday: 'short' })}
                  </span>
                  <span className="week-day-number">{dayDate.getDate()}</span>
                  <div className="week-day-dots">
                    {datePosts.map((p) => (
                      <span
                        key={p.id}
                        className={`day-dot ${p.status}`}
                        title={p.content.slice(0, 40)}
                      />
                    ))}
                    {Array.from({ length: Math.max(0, 4 - datePosts.length) }).map((_, i) => (
                      <span key={`empty-${i}`} className="day-dot empty" />
                    ))}
                  </div>
                  <span className="week-day-count">{datePosts.length}/4</span>
                </div>
              );
            })}
          </div>
        )}

        {/* Quick create */}
        <button className="btn-create-floating" onClick={() => router.push('/social/compose')}>
          + Nytt innlegg
        </button>
      </div>
    </SocialLayout>
  );
}
