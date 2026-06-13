import { ExpandableMedia } from "@/components/expandable-media";

type ExpandablePhotoProps = {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  loading?: "eager" | "lazy";
  fetchPriority?: "high" | "low" | "auto";
};

export function ExpandablePhoto({
  className = "",
  ...props
}: ExpandablePhotoProps) {
  return (
    <ExpandableMedia
      {...props}
      className="shrink-0"
      thumbnailClassName={className}
    />
  );
}
