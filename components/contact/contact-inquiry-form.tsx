"use client";

import { useState } from "react";
import { LegalModal } from "@/components/common/legal-modals";

type FormState = "idle" | "submitting" | "success" | "error";

function IconMail() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="2" y="4" width="20" height="16" rx="3" stroke="currentColor" strokeWidth="1.75" />
      <path
        d="m2 7 10 6 10-6"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconMessage() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconCheck() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M20 6 9 17l-5-5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ContactInquiryForm() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [website, setWebsite] = useState("");
  const [kvkkAccepted, setKvkkAccepted] = useState(false);
  const [kvkkModalOpen, setKvkkModalOpen] = useState(false);
  const [state, setState] = useState<FormState>("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg(null);

    if (!kvkkAccepted) {
      setErrorMsg("KVKK aydınlatma metnini onaylamanız gerekir.");
      return;
    }

    setState("submitting");

    try {
      const res = await fetch("/api/contact-inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, message, website, kvkkAccepted: true }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };

      if (!res.ok) {
        setState("error");
        setErrorMsg(
          (data as { error?: string }).error ??
            "Mesaj gönderilemedi. Lütfen tekrar deneyin.",
        );
        return;
      }

      setState("success");
      setEmail("");
      setMessage("");
      setWebsite("");
      setKvkkAccepted(false);
    } catch {
      setState("error");
      setErrorMsg("Bağlantı hatası. Lütfen tekrar deneyin.");
    }
  }

  if (state === "success") {
    return (
      <div className="ct-inquiry-success" role="status">
        <span className="ct-inquiry-success__icon" aria-hidden="true">
          <IconCheck />
        </span>
        <h3 className="ct-inquiry-success__title">Mesajınız alındı</h3>
        <p className="ct-inquiry-success__text">
          En kısa sürede size dönüş yapacağız. İlginiz için teşekkür ederiz.
        </p>
        <button
          type="button"
          className="ct-inquiry-btn ct-inquiry-btn--ghost"
          onClick={() => setState("idle")}
        >
          Yeni mesaj gönder
        </button>
      </div>
    );
  }

  return (
    <form className="ct-inquiry-form" onSubmit={(ev) => void handleSubmit(ev)} noValidate>
      <div className="ct-inquiry-form__honeypot" aria-hidden="true">
        <label htmlFor="ct-inquiry-website">Web sitesi</label>
        <input
          id="ct-inquiry-website"
          type="text"
          name="website"
          tabIndex={-1}
          autoComplete="off"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
        />
      </div>

      <div className="ct-inquiry-field">
        <label className="ct-inquiry-field__label" htmlFor="ct-inquiry-email">
          <span className="ct-inquiry-field__icon" aria-hidden="true">
            <IconMail />
          </span>
          E-posta adresiniz
        </label>
        <input
          id="ct-inquiry-email"
          type="email"
          className="ct-inquiry-field__input"
          placeholder="ornek@klinik.com"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={state === "submitting"}
        />
      </div>

      <div className="ct-inquiry-field">
        <label className="ct-inquiry-field__label" htmlFor="ct-inquiry-message">
          <span className="ct-inquiry-field__icon" aria-hidden="true">
            <IconMessage />
          </span>
          Mesajınız
        </label>
        <textarea
          id="ct-inquiry-message"
          className="ct-inquiry-field__textarea"
          placeholder="Sorunuzu veya talebinizi kısaca yazın…"
          rows={6}
          required
          minLength={10}
          maxLength={5000}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          disabled={state === "submitting"}
        />
        <span className="ct-inquiry-field__hint">{message.length} / 5000</span>
      </div>

      <div className="ct-inquiry-consent">
        <label className="ct-inquiry-consent__label">
          <input
            type="checkbox"
            className="ct-inquiry-consent__checkbox"
            checked={kvkkAccepted}
            onChange={(e) => setKvkkAccepted(e.target.checked)}
            disabled={state === "submitting"}
            required
          />
          <span className="ct-inquiry-consent__text">
            <button
              type="button"
              className="ct-inquiry-consent__link"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setKvkkModalOpen(true);
              }}
            >
              KVKK Aydınlatma Metni
            </button>
            &apos;ni okudum ve kişisel verilerimin tarafıma geri dönüş yapılabilmesi amacıyla
            işlenmesini kabul ediyorum.
          </span>
        </label>
      </div>

      {errorMsg ? (
        <p className="ct-inquiry-form__error" role="alert">
          {errorMsg}
        </p>
      ) : null}

      <button
        type="submit"
        className="ct-inquiry-btn ct-inquiry-btn--primary"
        disabled={state === "submitting" || !kvkkAccepted}
      >
        {state === "submitting" ? "Gönderiliyor…" : "Mesajı gönder"}
      </button>

      <LegalModal doc="kvkk" open={kvkkModalOpen} onClose={() => setKvkkModalOpen(false)} />
    </form>
  );
}
