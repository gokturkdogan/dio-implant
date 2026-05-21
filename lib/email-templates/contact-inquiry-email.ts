/** DIO Implant — Bize Ulaşın formu bildirim e-postası */

const BRAND = {
  name: "DIO Implant",
  logoUrl:
    "https://res.cloudinary.com/drjz8v617/image/upload/w_200,q_auto/dio-logo-light.webp",
  bg: "#090e1a",
  panel: "#0f1629",
  panelSoft: "#161d33",
  text: "#e8ecf4",
  textSecondary: "#c3cad7",
  muted: "#7b8ba5",
  accent: "#5b8def",
  accentDark: "#3b6de8",
  border: "rgba(148, 163, 184, 0.2)",
};

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function formatSentAt(): string {
  return new Intl.DateTimeFormat("tr-TR", {
    dateStyle: "full",
    timeStyle: "short",
  }).format(new Date());
}

export type ContactInquiryEmailContent = {
  subject: string;
  text: string;
  html: string;
};

export function buildContactInquiryEmail(
  senderEmail: string,
  message: string,
): ContactInquiryEmailContent {
  const safeEmail = escapeHtml(senderEmail);
  const safeMessage = escapeHtml(message).replace(/\n/g, "<br />");
  const sentAt = formatSentAt();

  const subject = `${BRAND.name} — Yeni iletişim formu mesajı`;

  const text = `Bize Ulaşın formundan yeni bir mesaj alındı.

Gönderim: ${sentAt}
E-posta: ${senderEmail}

Mesaj:
${message}

—
Bu e-postaya doğrudan yanıt vererek gönderene ulaşabilirsiniz.`;

  const html = `<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(subject)}</title>
</head>
<body style="margin:0;padding:0;background-color:${BRAND.bg};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:${BRAND.bg};">
    <tr>
      <td align="center" style="padding:32px 16px;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:560px;margin:0 auto;">
          <tr>
            <td style="background:linear-gradient(165deg,${BRAND.panel} 0%,${BRAND.bg} 100%);border:1px solid ${BRAND.border};border-radius:18px 18px 0 0;padding:28px 32px 22px;text-align:center;">
              <img src="${BRAND.logoUrl}" width="140" height="auto" alt="${BRAND.name}" style="display:block;margin:0 auto 14px;border:0;" />
              <p style="margin:0 0 6px;font-size:11px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:${BRAND.accent};">Bize Ulaşın</p>
              <h1 style="margin:0;font-size:22px;font-weight:700;color:${BRAND.text};">Yeni form mesajı</h1>
            </td>
          </tr>
          <tr>
            <td style="height:3px;background:linear-gradient(90deg,${BRAND.accentDark},${BRAND.accent},${BRAND.accentDark});font-size:0;line-height:0;">&nbsp;</td>
          </tr>
          <tr>
            <td style="background-color:${BRAND.panel};border-left:1px solid ${BRAND.border};border-right:1px solid ${BRAND.border};padding:28px 32px;">
              <p style="margin:0 0 20px;font-size:14px;line-height:1.55;color:${BRAND.textSecondary};">
                Web sitesindeki iletişim formundan yeni bir mesaj alındı. Yanıtlamak için bu e-postaya doğrudan cevap verebilirsiniz.
              </p>
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom:16px;">
                <tr>
                  <td style="padding:14px 16px;background-color:${BRAND.panelSoft};border:1px solid ${BRAND.border};border-radius:10px;">
                    <p style="margin:0 0 6px;font-size:11px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:${BRAND.muted};">Gönderim zamanı</p>
                    <p style="margin:0;font-size:14px;color:${BRAND.text};">${escapeHtml(sentAt)}</p>
                  </td>
                </tr>
              </table>
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom:20px;">
                <tr>
                  <td style="padding:14px 16px;background-color:${BRAND.panelSoft};border:1px solid ${BRAND.border};border-radius:10px;">
                    <p style="margin:0 0 6px;font-size:11px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:${BRAND.muted};">E-posta adresi</p>
                    <p style="margin:0;font-size:15px;font-weight:600;">
                      <a href="mailto:${safeEmail}" style="color:${BRAND.accent};text-decoration:none;">${safeEmail}</a>
                    </p>
                  </td>
                </tr>
              </table>
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td style="padding:16px 18px;background-color:${BRAND.panelSoft};border:1px solid ${BRAND.border};border-radius:10px;">
                    <p style="margin:0 0 10px;font-size:11px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:${BRAND.muted};">Mesaj</p>
                    <p style="margin:0;font-size:15px;line-height:1.65;color:${BRAND.text};">${safeMessage}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="background-color:${BRAND.panelSoft};border:1px solid ${BRAND.border};border-top:none;border-radius:0 0 18px 18px;padding:18px 32px 24px;text-align:center;">
              <p style="margin:0;font-size:12px;line-height:1.5;color:${BRAND.muted};">
                © ${new Date().getFullYear()} ${BRAND.name} · İletişim formu bildirimi
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  return { subject, text, html };
}
