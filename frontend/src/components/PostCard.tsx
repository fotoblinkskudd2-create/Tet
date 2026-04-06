import { ScheduledPost, PLATFORMS } from '../types/social';

interface PostCardProps {
  post: ScheduledPost;
  onEdit?: () => void;
  onDelete?: () => void;
  onPublish?: () => void;
}

const statusLabels: Record<string, { text: string; className: string }> = {
  draft: { text: 'Utkast', className: 'status-draft' },
  scheduled: { text: 'Planlagt', className: 'status-scheduled' },
  published: { text: 'Publisert', className: 'status-published' },
  failed: { text: 'Feilet', className: 'status-failed' },
};

export default function PostCard({ post, onEdit, onDelete, onPublish }: PostCardProps) {
  const scheduledDate = new Date(post.scheduledAt);
  const statusInfo = statusLabels[post.status] || statusLabels.draft;

  return (
    <div className="post-card">
      <div className="post-card-header">
        <div className="post-platforms">
          {post.platforms.map((pid) => {
            const platform = PLATFORMS.find((p) => p.id === pid);
            return platform ? (
              <span key={pid} className="post-platform-icon" title={platform.name}>
                {platform.icon}
              </span>
            ) : null;
          })}
        </div>
        <span className={`post-status ${statusInfo.className}`}>{statusInfo.text}</span>
      </div>

      <p className="post-content">{post.content}</p>

      {post.hashtags.length > 0 && (
        <div className="post-hashtags">
          {post.hashtags.map((tag) => (
            <span key={tag} className="hashtag">
              {tag}
            </span>
          ))}
        </div>
      )}

      <div className="post-card-footer">
        <span className="post-time">
          {scheduledDate.toLocaleDateString('nb-NO')} kl.{' '}
          {scheduledDate.toLocaleTimeString('nb-NO', { hour: '2-digit', minute: '2-digit' })}
        </span>
        <div className="post-actions">
          {post.status !== 'published' && onPublish && (
            <button className="btn-publish" onClick={onPublish}>
              Publiser
            </button>
          )}
          {onEdit && (
            <button className="btn-edit" onClick={onEdit}>
              Rediger
            </button>
          )}
          {onDelete && (
            <button className="btn-delete" onClick={onDelete}>
              Slett
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
