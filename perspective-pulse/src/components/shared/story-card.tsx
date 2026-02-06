"use client";

import Link from "next/link";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatRelativeTime } from "@/lib/utils";
import type { StoryCardData } from "@/types";

interface StoryCardProps {
  story: StoryCardData;
}

function perspectiveBadgeVariant(
  type: string
): "progressive" | "conservative" | "international" {
  switch (type) {
    case "PROGRESSIVE":
      return "progressive";
    case "CONSERVATIVE":
      return "conservative";
    case "INTERNATIONAL":
      return "international";
    default:
      return "international";
  }
}

export function StoryCard({ story }: StoryCardProps) {
  return (
    <Link href={`/story/${story.id}`}>
      <Card className="group cursor-pointer transition-all hover:shadow-md hover:border-foreground/20">
        {story.imageUrl && (
          <div className="relative h-48 w-full overflow-hidden rounded-t-xl">
            <Image
              src={story.imageUrl}
              alt={story.title}
              fill
              className="object-cover transition-transform group-hover:scale-105"
            />
          </div>
        )}
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="outline" className="text-xs">
              {story.category}
            </Badge>
            <span className="text-xs text-muted-foreground">
              {story.region}
            </span>
            <span className="text-xs text-muted-foreground ml-auto">
              {formatRelativeTime(story.publishedAt)}
            </span>
          </div>
          <CardTitle className="text-lg leading-tight group-hover:text-primary transition-colors">
            {story.title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
            {story.summary}
          </p>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">
              {story.sourceCount} sources
            </span>
            <div className="flex gap-1 ml-auto">
              {story.perspectiveTypes.map((type) => (
                <Badge
                  key={type}
                  variant={perspectiveBadgeVariant(type)}
                  className="text-[10px] px-1.5"
                >
                  {type.charAt(0)}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
