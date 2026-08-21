type StaticProsePageProps = {
  html: string;
};

export default function StaticProsePage({ html }: StaticProsePageProps) {
  return (
    <article className="page-panel-vt prose text-[17px]">
      <div dangerouslySetInnerHTML={{ __html: html }} />
    </article>
  );
}
