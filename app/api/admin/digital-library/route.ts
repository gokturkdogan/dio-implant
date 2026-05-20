import { auditAdminAction } from "@/lib/admin-audit";
import { requireAdminApi } from "@/lib/require-admin-api";
import { jsonError, jsonOk } from "@/lib/http";
import { digitalLibraryService } from "@/services/digital-library.service";

export const runtime = "nodejs";

export async function GET() {
  try {
    if (!(await requireAdminApi())) return jsonOk({ error: "Yetkisiz" }, 401);
    const row = await digitalLibraryService.get();
    return jsonOk({
      digitalLibrary: {
        zipUrl: row?.zipUrl ?? "",
        pptUrl: row?.pptUrl ?? "",
      },
    });
  } catch (e) {
    return jsonError(e);
  }
}

export async function PUT(request: Request) {
  try {
    if (!(await requireAdminApi())) return jsonOk({ error: "Yetkisiz" }, 401);
    const body = (await request.json()) as {
      zipUrl?: unknown;
      pptUrl?: unknown;
    };
    const zipUrl = typeof body.zipUrl === "string" ? body.zipUrl : "";
    const pptUrl = typeof body.pptUrl === "string" ? body.pptUrl : "";
    if (zipUrl.length > 2048 || pptUrl.length > 2048) {
      return jsonOk({ error: "URL çok uzun (en fazla 2048 karakter)." }, 400);
    }
    const updated = await digitalLibraryService.upsert({ zipUrl, pptUrl });
    await auditAdminAction({
      action: "update",
      resourceType: "digital_library",
      resourceLabel: "Dijital kütüphane bağlantıları",
    });
    return jsonOk({
      ok: true,
      digitalLibrary: {
        zipUrl: updated.zipUrl,
        pptUrl: updated.pptUrl,
      },
    });
  } catch (e) {
    return jsonError(e);
  }
}
