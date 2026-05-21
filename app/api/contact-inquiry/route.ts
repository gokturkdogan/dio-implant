import { jsonError, jsonOk } from "@/lib/http";
import { contactInquiryService } from "@/services/contact-inquiry.service";
import { contactInquirySchema } from "@/validations/contact-inquiry.validation";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as unknown;
    const input = contactInquirySchema.parse(body);

    if (input.website?.trim()) {
      return jsonOk({ ok: true });
    }

    await contactInquiryService.sendInquiry(input);
    return jsonOk({ ok: true });
  } catch (e) {
    return jsonError(e);
  }
}
