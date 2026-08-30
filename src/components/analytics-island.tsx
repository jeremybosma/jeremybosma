import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";

type AnalyticsIslandProps = {
  route?: string;
};

export default function AnalyticsIsland({ route }: AnalyticsIslandProps) {
  return (
    <>
      <Analytics />
      <SpeedInsights route={route} />
    </>
  );
}
