import "server-only";
import { z } from "zod";
import { buildContactInquiryEmail } from "@/lib/email-templates/contact-inquiry-email";
import { AppError } from "@/lib/errors";
import { sendMail } from "@/lib/mail";
import type { ContactInquiryInput } from "@/validations/contact-inquiry.validation";

const recipientSchema = z.string().email();

function getContactInquiryRecipient(): string {
  const raw = process.env.CONTACT_INQUIRY_TO?.trim();
  if (!raw) {
    throw new AppError(
      "İletişim formu alıcı adresi tanımlı değil (CONTACT_INQUIRY_TO)",
      503,
    );
  }
  const parsed = recipientSchema.safeParse(raw);
  if (!parsed.success) {
    throw new AppError("CONTACT_INQUIRY_TO geçerli bir e-posta adresi olmalıdır", 503);
  }
  return parsed.data;
}

export const contactInquiryService = {
  async sendInquiry(input: ContactInquiryInput): Promise<void> {
    const to = getContactInquiryRecipient();
    const email = input.email.trim().toLowerCase();
    const message = input.message.trim();
    const { subject, text, html } = buildContactInquiryEmail(email, message);

    await sendMail({
      to,
      subject,
      text,
      html,
      replyTo: email,
    });
  },
};
