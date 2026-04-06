import { PLATFORMS, Platform } from '../types/social';

interface PlatformBadgeProps {
  platform: Platform;
  selected?: boolean;
  onClick?: () => void;
  size?: 'small' | 'medium' | 'large';
}

export default function PlatformBadge({ platform, selected, onClick, size = 'medium' }: PlatformBadgeProps) {
  const config = PLATFORMS.find((p) => p.id === platform);
  if (!config) return null;

  const sizeClass = `platform-badge-${size}`;

  return (
    <button
      type="button"
      className={`platform-badge ${sizeClass} ${selected ? 'selected' : ''}`}
      style={{
        borderColor: selected ? config.color : undefined,
        backgroundColor: selected ? `${config.color}15` : undefined,
      }}
      onClick={onClick}
    >
      <span className="platform-badge-icon">{config.icon}</span>
      <span className="platform-badge-name">{config.name}</span>
    </button>
  );
}
