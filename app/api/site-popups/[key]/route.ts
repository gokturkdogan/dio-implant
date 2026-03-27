import { sitePopupService } from "../../../../services/site-popup.service";
import { jsonError, jsonOk } from "../../../../lib/http";
import {
  sitePopupKeySchema,
  updateSitePopupSchema,
} from "../../../../validations/site-popup.validation";

type SitePopupKeyParams = {
  params: Promise<{
    key: string;
  }>;
};

export async function GET(_: Request, { params }: SitePopupKeyParams) {
  try {
    const { key } = await params;
    const parsedKey = sitePopupKeySchema.parse(key);
    const row = await sitePopupService.getByKey(parsedKey);
    return jsonOk(row);
  } catch (error) {
    return jsonError(error);
  }
}

export async function PATCH(request: Request, { params }: SitePopupKeyParams) {
  try {
    const { key } = await params;
    const parsedKey = sitePopupKeySchema.parse(key);
    const payload = await request.json();
    const input = updateSitePopupSchema.parse(payload);

    const upserted = await sitePopupService.upsertByKey(parsedKey, input);
    return jsonOk(upserted);
  } catch (error) {
    return jsonError(error);
  }
}

