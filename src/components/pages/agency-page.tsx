const AGENCY_URL = "https://internet-engineering.com";

export default function AgencyPage() {
  return (
    <iframe
      src={AGENCY_URL}
      title="Internet Engineering"
      className="agency-iframe bg-background"
      loading="eager"
      referrerPolicy="no-referrer-when-downgrade"
      allow="fullscreen"
    />
  );
}
