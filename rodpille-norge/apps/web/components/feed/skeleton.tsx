export function FeedSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="card-brutal p-4">
          <div className="flex gap-4">
            {/* Vote skeleton */}
            <div className="flex flex-col items-center gap-2">
              <div className="w-8 h-8 skeleton" />
              <div className="w-8 h-4 skeleton" />
              <div className="w-8 h-8 skeleton" />
            </div>

            {/* Content skeleton */}
            <div className="flex-1 space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-20 h-4 skeleton" />
                <div className="w-24 h-4 skeleton" />
              </div>
              <div className="w-3/4 h-6 skeleton" />
              <div className="w-full h-4 skeleton" />
              <div className="w-2/3 h-4 skeleton" />
              <div className="flex gap-2">
                <div className="w-16 h-6 skeleton rounded-full" />
                <div className="w-20 h-6 skeleton rounded-full" />
                <div className="w-14 h-6 skeleton rounded-full" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export function PostSkeleton() {
  return (
    <div className="card-brutal p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 skeleton rounded-full" />
        <div className="space-y-2">
          <div className="w-32 h-4 skeleton" />
          <div className="w-24 h-3 skeleton" />
        </div>
      </div>

      {/* Title */}
      <div className="w-3/4 h-8 skeleton" />

      {/* Content */}
      <div className="space-y-2">
        <div className="w-full h-4 skeleton" />
        <div className="w-full h-4 skeleton" />
        <div className="w-full h-4 skeleton" />
        <div className="w-2/3 h-4 skeleton" />
      </div>

      {/* Tags */}
      <div className="flex gap-2">
        <div className="w-20 h-6 skeleton rounded-full" />
        <div className="w-24 h-6 skeleton rounded-full" />
        <div className="w-16 h-6 skeleton rounded-full" />
      </div>

      {/* Actions */}
      <div className="flex gap-4 pt-4 border-t border-pille-border">
        <div className="w-16 h-8 skeleton" />
        <div className="w-16 h-8 skeleton" />
        <div className="w-16 h-8 skeleton" />
      </div>
    </div>
  )
}
