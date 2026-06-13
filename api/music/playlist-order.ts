import { handlePlaylistOrder } from "../../src/server/handlers/playlist-order";

type VercelRequest = {
  method?: string;
};

type VercelResponse = {
  status: (code: number) => VercelResponse;
  setHeader: (name: string, value: string) => void;
  send: (body: string) => void;
  json: (body: unknown) => void;
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const response = await handlePlaylistOrder();
  const body = await response.text();

  res.status(response.status);
  response.headers.forEach((value, key) => {
    res.setHeader(key, value);
  });
  res.send(body);
}
