export type PostMeta = {
  slug: string;
  title: string;
  date: string;
  description: string;
  draft: boolean;
};

export type Post = PostMeta & {
  contentHtml: string;
};
