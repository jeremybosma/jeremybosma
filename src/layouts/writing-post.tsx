import type { LayoutProps } from "@fulldotdev/sitex";
import { SitexPageShell } from "@/components/layouts/sitex-page";
import WritingPostPage from "@/components/pages/writing-post-page";
import { getPostBySlug } from "@/lib/blog";

type WritingPostLayoutProps = LayoutProps<{ slug: string }>;

export default async function WritingPostLayout({
  slug,
  title,
  description,
  path,
  noindex,
}: WritingPostLayoutProps) {
  const post = await getPostBySlug(slug);

  return (
    <SitexPageShell
      title={title}
      description={description}
      path={path}
      noIndex={noindex}
    >
      <WritingPostPage post={post} />
    </SitexPageShell>
  );
}
