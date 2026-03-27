import { sitePopupService } from "../../../services/site-popup.service";
import { jsonError, jsonOk } from "../../../lib/http";
import { createSitePopupSchema } from "../../../validations/site-popup.validation";

export async function GET() {
  try {
    const rows = await sitePopupService.listAll();
    return jsonOk(rows);
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const input = createSitePopupSchema.parse(payload);

    const created = await sitePopupService.create(input);
    return jsonOk(created, 201);
  } catch (error) {
    return jsonError(error);
  }
}

