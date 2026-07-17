import type { LayoutProps } from "@fulldotdev/sitex";
import { SitexPageShell } from "@/components/layouts/sitex-page";
import HomePage from "@/components/pages/home-page";

export default function HomeLayout({ description, path }: LayoutProps) {
  return (
    <SitexPageShell description={description} path={path}>
      <HomePage client:load />
    </SitexPageShell>
  );
}
