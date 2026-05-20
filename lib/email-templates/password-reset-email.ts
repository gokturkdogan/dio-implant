/** DIO Implant — parola sıfırlama e-postası (inline HTML, istemci uyumlu). */

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

export type PasswordResetEmailContent = {
  subject: string;
  text: string;
  html: string;
};

export function buildPasswordResetEmail(
  resetUrl: string,
  firstName: string,
  expiresHours = 1,
): PasswordResetEmailContent {
  const safeUrl = escapeHtml(resetUrl);
  const greeting = firstName.trim()
    ? `Merhaba ${firstName.trim()},`
    : "Merhaba,";

  const subject = `${BRAND.name} — Parola sıfırlama`;

  const text = `${greeting}

${BRAND.name} yönetim paneli için parola sıfırlama talebiniz alındı.

Yeni parolanızı belirlemek için aşağıdaki bağlantıyı açın (bağlantı ${expiresHours} saat geçerlidir):

${resetUrl}

Bu talebi siz yapmadıysanız bu e-postayı yok sayabilirsiniz; parolanız değişmeyecektir.

— ${BRAND.name} Yönetim Paneli`;

  const html = `<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="color-scheme" content="light dark" />
  <meta name="supported-color-schemes" content="light dark" />
  <title>${escapeHtml(subject)}</title>
</head>
<body style="margin:0;padding:0;background-color:${BRAND.bg};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:${BRAND.bg};min-height:100%;">
    <tr>
      <td align="center" style="padding:32px 16px;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:520px;margin:0 auto;">
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(165deg,${BRAND.panel} 0%,${BRAND.bg} 100%);border:1px solid ${BRAND.border};border-radius:18px 18px 0 0;padding:28px 32px 24px;text-align:center;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td align="center" style="padding-bottom:16px;">
                    <img src="${BRAND.logoUrl}" width="140" height="auto" alt="${BRAND.name}" style="display:block;border:0;max-width:140px;height:auto;" />
                  </td>
                </tr>
                <tr>
                  <td align="center">
                    <p style="margin:0 0 6px;font-size:11px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:${BRAND.accent};">Yönetim Paneli</p>
                    <h1 style="margin:0;font-size:22px;font-weight:700;letter-spacing:-0.02em;color:${BRAND.text};line-height:1.3;">Parola sıfırlama</h1>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Accent bar -->
          <tr>
            <td style="height:3px;background:linear-gradient(90deg,${BRAND.accentDark},${BRAND.accent},${BRAND.accentDark});font-size:0;line-height:0;">&nbsp;</td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="background-color:${BRAND.panel};border-left:1px solid ${BRAND.border};border-right:1px solid ${BRAND.border};padding:32px;">
              <p style="margin:0 0 16px;font-size:16px;line-height:1.5;color:${BRAND.text};">${escapeHtml(greeting)}</p>
              <p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:${BRAND.textSecondary};">
                Hesabınız için parola sıfırlama talebi alındı. Aşağıdaki butona tıklayarak yeni parolanızı güvenli şekilde belirleyebilirsiniz.
              </p>
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" style="margin:0 auto 28px;">
                <tr>
                  <td align="center" style="border-radius:10px;background:linear-gradient(180deg,${BRAND.accent} 0%,${BRAND.accentDark} 100%);">
                    <a href="${safeUrl}" target="_blank" rel="noopener noreferrer" style="display:inline-block;padding:14px 32px;font-size:15px;font-weight:600;color:#ffffff;text-decoration:none;border-radius:10px;">
                      Parolamı sıfırla
                    </a>
                  </td>
                </tr>
              </table>
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:${BRAND.panelSoft};border:1px solid ${BRAND.border};border-radius:10px;margin-bottom:24px;">
                <tr>
                  <td style="padding:14px 16px;">
                    <p style="margin:0 0 6px;font-size:11px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:${BRAND.muted};">Bağlantı süresi</p>
                    <p style="margin:0;font-size:14px;line-height:1.5;color:${BRAND.textSecondary};">
                      Bu bağlantı <strong style="color:${BRAND.text};">${expiresHours} saat</strong> geçerlidir. Süre dolduysa şifremi unuttum sayfasından yeniden talep edebilirsiniz.
                    </p>
                  </td>
                </tr>
              </table>
              <p style="margin:0 0 12px;font-size:13px;line-height:1.5;color:${BRAND.muted};">
                Buton çalışmıyorsa aşağıdaki adresi tarayıcınıza kopyalayın:
              </p>
              <p style="margin:0;padding:12px 14px;background-color:${BRAND.panelSoft};border:1px solid ${BRAND.border};border-radius:8px;font-size:12px;line-height:1.5;word-break:break-all;">
                <a href="${safeUrl}" style="color:${BRAND.accent};text-decoration:none;">${safeUrl}</a>
              </p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background-color:${BRAND.panelSoft};border:1px solid ${BRAND.border};border-top:none;border-radius:0 0 18px 18px;padding:20px 32px 28px;text-align:center;">
              <p style="margin:0 0 8px;font-size:13px;line-height:1.5;color:${BRAND.muted};">
                Bu talebi siz yapmadıysanız bu e-postayı dikkate almayın; hesabınız güvende kalır.
              </p>
              <p style="margin:0;font-size:12px;color:${BRAND.muted};">
                © ${new Date().getFullYear()} ${BRAND.name}
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
