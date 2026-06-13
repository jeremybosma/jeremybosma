import BaseLayout from "@/components/layouts/base";
import ClientShell from "@/components/layouts/client-shell";
import WritingPageContent from "@/components/pages/writing-page";
import { getAllPosts } from "@/lib/blog";

export default function Page() {
  const posts = getAllPosts();

  return (
    <BaseLayout
      title="Writing"
      description="Essays and notes by Jeremy Bosma."
      pathname="/writing"
    >
      <ClientShell client:load pathname="/writing">
        <WritingPageContent client:load posts={posts} />
      </ClientShell>
    </BaseLayout>
  );
}
