/** DIO Implant — yeni kullanıcı davet e-postası */

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

export type UserInviteEmailContent = {
  subject: string;
  text: string;
  html: string;
};

export function buildUserInviteEmail(
  setupUrl: string,
  firstName: string,
  lastName: string,
  email: string,
  expiresDays = 7,
): UserInviteEmailContent {
  const safeUrl = escapeHtml(setupUrl);
  const fullName = [firstName.trim(), lastName.trim()].filter(Boolean).join(" ");
  const greeting = firstName.trim() ? `Merhaba ${firstName.trim()},` : "Merhaba,";

  const subject = `${BRAND.name} — Yönetim paneli hesabınız`;

  const text = `${greeting}

${BRAND.name} yönetim paneline davet edildiniz.

Ad soyad: ${fullName}
E-posta: ${email}

Parolanızı belirlemek ve hesabınızı tamamlamak için bağlantıyı açın (bağlantı ${expiresDays} gün geçerlidir):

${setupUrl}

Bu daveti beklemiyorsanız bu e-postayı yok sayabilirsiniz.

— ${BRAND.name} Yönetim Paneli`;

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
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:520px;margin:0 auto;">
          <tr>
            <td style="background:linear-gradient(165deg,${BRAND.panel} 0%,${BRAND.bg} 100%);border:1px solid ${BRAND.border};border-radius:18px 18px 0 0;padding:28px 32px 24px;text-align:center;">
              <img src="${BRAND.logoUrl}" width="140" height="auto" alt="${BRAND.name}" style="display:block;margin:0 auto 16px;border:0;" />
              <p style="margin:0 0 6px;font-size:11px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:${BRAND.accent};">Yönetim Paneli</p>
              <h1 style="margin:0;font-size:22px;font-weight:700;color:${BRAND.text};">Hesap davetiniz</h1>
            </td>
          </tr>
          <tr>
            <td style="height:3px;background:linear-gradient(90deg,${BRAND.accentDark},${BRAND.accent},${BRAND.accentDark});font-size:0;">&nbsp;</td>
          </tr>
          <tr>
            <td style="background-color:${BRAND.panel};border-left:1px solid ${BRAND.border};border-right:1px solid ${BRAND.border};padding:32px;">
              <p style="margin:0 0 16px;font-size:16px;color:${BRAND.text};">${escapeHtml(greeting)}</p>
              <p style="margin:0 0 20px;font-size:15px;line-height:1.6;color:${BRAND.textSecondary};">
                Yönetim paneline davet edildiniz. Hesabınızı tamamlamak için aşağıdaki mavi butona tıklayın.
              </p>
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:${BRAND.panelSoft};border:1px solid ${BRAND.border};border-radius:10px;margin-bottom:28px;">
                <tr>
                  <td style="padding:14px 16px;font-size:14px;color:${BRAND.textSecondary};">
                    <p style="margin:0 0 8px;"><strong style="color:${BRAND.text};">Ad soyad:</strong> ${escapeHtml(fullName)}</p>
                    <p style="margin:0;"><strong style="color:${BRAND.text};">E-posta:</strong> ${escapeHtml(email)}</p>
                  </td>
                </tr>
              </table>
              <!-- Bulletproof CTA (Outlook + mobil) -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin:0 0 28px;">
                <tr>
                  <td align="center" style="padding:4px 0 8px;">
                    <!--[if mso]>
                    <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="${safeUrl}" style="height:52px;v-text-anchor:middle;width:320px;" arcsize="14%" strokecolor="${BRAND.accentDark}" fillcolor="${BRAND.accentDark}">
                      <w:anchorlock/>
                      <center style="color:#ffffff;font-family:Segoe UI,sans-serif;font-size:16px;font-weight:bold;">Parolamı belirle ve hesabı aç</center>
                    </v:roundrect>
                    <![endif]-->
                    <!--[if !mso]><!-->
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center">
                      <tr>
                        <td
                          align="center"
                          bgcolor="${BRAND.accentDark}"
                          style="background-color:${BRAND.accentDark};border-radius:12px;border:2px solid #7aa8ff;mso-padding-alt:0;"
                        >
                          <a
                            href="${safeUrl}"
                            target="_blank"
                            rel="noopener noreferrer"
                            style="display:inline-block;min-width:280px;max-width:100%;padding:16px 36px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:16px;font-weight:700;line-height:1.3;color:#ffffff !important;text-decoration:none;text-align:center;border-radius:12px;background-color:${BRAND.accentDark};border:2px solid #7aa8ff;box-shadow:0 6px 22px rgba(59,109,232,0.55);letter-spacing:0.01em;"
                          >
                            Parolamı belirle ve hesabı aç
                          </a>
                        </td>
                      </tr>
                    </table>
                    <!--<![endif]-->
                  </td>
                </tr>
              </table>
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:${BRAND.panelSoft};border:1px solid ${BRAND.border};border-radius:10px;margin-bottom:20px;">
                <tr>
                  <td style="padding:14px 16px;">
                    <p style="margin:0 0 6px;font-size:11px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:${BRAND.muted};">Bağlantı süresi</p>
                    <p style="margin:0;font-size:14px;line-height:1.5;color:${BRAND.textSecondary};">
                      Bu bağlantı <strong style="color:${BRAND.text};">${expiresDays} gün</strong> geçerlidir.
                    </p>
                  </td>
                </tr>
              </table>
              <p style="margin:0 0 12px;font-size:13px;line-height:1.5;color:${BRAND.muted};">
                Buton görünmüyorsa veya tıklanmıyorsa aşağıdaki adresi tarayıcınıza kopyalayın:
              </p>
              <p style="margin:0;padding:12px 14px;background-color:${BRAND.panelSoft};border:1px solid ${BRAND.border};border-radius:8px;font-size:12px;line-height:1.5;word-break:break-all;">
                <a href="${safeUrl}" style="color:${BRAND.accent};text-decoration:underline;font-weight:600;">${safeUrl}</a>
              </p>
            </td>
          </tr>
          <tr>
            <td style="background-color:${BRAND.panelSoft};border:1px solid ${BRAND.border};border-top:none;border-radius:0 0 18px 18px;padding:20px 32px;text-align:center;">
              <p style="margin:0;font-size:12px;color:${BRAND.muted};">© ${new Date().getFullYear()} ${BRAND.name}</p>
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
