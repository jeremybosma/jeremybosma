import type { LayoutProps } from "@fulldotdev/sitex";
import { SitexPageShell } from "@/components/layouts/sitex-page";
import WritingPageContent from "@/components/pages/writing-page";
import { getAllPosts } from "@/lib/blog";

export default function WritingLayout({ title, description, path }: LayoutProps) {
  const posts = getAllPosts();

  return (
    <SitexPageShell title={title} description={description} path={path}>
      <WritingPageContent client:load posts={posts} />
    </SitexPageShell>
  );
}
