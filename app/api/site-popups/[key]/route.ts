import { NextResponse } from "next/server";
import { publicCdnCacheHeaders } from "@/lib/cdn-cache";
import { auditAdminAction } from "@/lib/admin-audit";
import { requireAdminApi } from "@/lib/require-admin-api";
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

/**
 * Ana sayfa popup'ı — ana sayfaya gelen her ziyaretçi çağırır. Yanıt CDN'de 60 sn
 * saklanır; böylece her ziyarette fonksiyon + DB sorgusu çalışmaz. Admin panelindeki
 * değişiklik ziyaretçilere en geç ~1 dk içinde yansır. Admin paneli güncel veriyi
 * önbelleksiz `/api/admin/site-popups/[key]` ucundan okur.
 */
export async function GET(_: Request, { params }: SitePopupKeyParams) {
  try {
    const { key } = await params;
    const parsedKey = sitePopupKeySchema.parse(key);
    const row = await sitePopupService.getByKey(parsedKey);
    return NextResponse.json(row, { status: 200, headers: publicCdnCacheHeaders(60) });
  } catch (error) {
    return jsonError(error);
  }
}

export async function PATCH(request: Request, { params }: SitePopupKeyParams) {
  try {
    if (!(await requireAdminApi())) {
      return jsonOk({ error: "Yetkisiz" }, 401);
    }
    const { key } = await params;
    const parsedKey = sitePopupKeySchema.parse(key);
    const payload = await request.json();
    const input = updateSitePopupSchema.parse(payload);

    const upserted = await sitePopupService.upsertByKey(parsedKey, input);
    await auditAdminAction({
      action: "update",
      resourceType: "site_popup",
      resourceId: parsedKey,
      resourceLabel: "Anasayfa popup",
      metadata: {
        enabled: upserted.enabled,
        hasImage: Boolean(upserted.imageUrl),
      },
    });
    return jsonOk(upserted);
  } catch (error) {
    return jsonError(error);
  }
}

