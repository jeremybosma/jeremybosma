import { handleSupplyPurchase } from "../../src/server/handlers/supply-purchase";

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
  const response = await handleSupplyPurchase(req as Parameters<typeof handleSupplyPurchase>[0]);
  const body = await response.text();

  res.status(response.status);
  response.headers.forEach((value, key) => {
    res.setHeader(key, value);
  });
  res.send(body);
}
