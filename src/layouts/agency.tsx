import type { LayoutProps } from "@fulldotdev/sitex";
import { SitexPageShell } from "@/components/layouts/sitex-page";
import AgencyPage from "@/components/pages/agency-page";

export default function AgencyLayout({ title, description, path }: LayoutProps) {
  return (
    <SitexPageShell title={title} description={description} path={path}>
      <AgencyPage />
    </SitexPageShell>
  );
}
