import { jsonError, jsonOk } from "@/lib/http";
import { digitalLibraryService } from "@/services/digital-library.service";

export const runtime = "nodejs";

export async function GET() {
  try {
    const row = await digitalLibraryService.get();
    return jsonOk({
      zipUrl: row?.zipUrl ?? "",
      pptUrl: row?.pptUrl ?? "",
    });
  } catch (e) {
    return jsonError(e);
  }
}
