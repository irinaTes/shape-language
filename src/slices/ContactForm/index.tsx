"use client";

import { FC, FormEvent, useState } from "react";
import { Content } from "@prismicio/client";
import { PrismicRichText, SliceComponentProps } from "@prismicio/react";
import { AnimatePresence, motion } from "framer-motion";

export type ContactFormProps = SliceComponentProps<Content.ContactFormSlice>;

type Status = "idle" | "submitting" | "success" | "error";
type FieldErrors = Partial<Record<"name" | "email" | "message", string>>;

const MAX_MESSAGE = 5000;

const ContactForm: FC<ContactFormProps> = ({ slice }) => {
  const {
    title,
    description,
    name_label,
    email_label,
    message_label,
    submit_label,
    success_title,
    success_message,
    send_another_label,
  } = slice.primary;

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [company, setCompany] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [errorBanner, setErrorBanner] = useState<string | null>(null);

  const reset = () => {
    setName("");
    setEmail("");
    setMessage("");
    setCompany("");
    setErrors({});
    setErrorBanner(null);
    setStatus("idle");
  };

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (status === "submitting") return;
    setStatus("submitting");
    setErrors({});
    setErrorBanner(null);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message, company }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        error?: string;
        errors?: FieldErrors;
      };

      if (res.ok && data.ok) {
        setStatus("success");
        return;
      }

      if (res.status === 400 && data.errors) {
        setErrors(data.errors);
        setStatus("idle");
        return;
      }

      if (res.status === 429) {
        setErrorBanner("Too many attempts. Please wait a few minutes and try again.");
      } else {
        setErrorBanner("Something went wrong. Please try again later.");
      }
      setStatus("error");
    } catch {
      setErrorBanner("Network error. Please check your connection and try again.");
      setStatus("error");
    }
  };

  const submitting = status === "submitting";
  const submitLabel = submit_label || "Send";
  const successTitle = success_title || "Thanks — your message is on its way.";
  const successBody = success_message || "We'll get back to you shortly.";
  const sendAnotherLabel = send_another_label || "Send another message";

  return (
    <section
      data-slice-type={slice.slice_type}
      data-slice-variation={slice.variation}
      className="relative w-full px-4 lg:px-20 py-20"
    >
      <div className="mx-auto max-w-2xl">
        {title && (
          <h2 className="text-4xl lg:text-6xl font-black text-white mb-4">
            {title}
          </h2>
        )}
        {description && (
          <div className="text-white/70 mb-10 text-lg">
            <PrismicRichText field={description} />
          </div>
        )}

        <AnimatePresence mode="wait" initial={false}>
          {status === "success" ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              className="rounded-lg border border-white/20 bg-white/5 p-8"
              role="status"
              aria-live="polite"
            >
              <h3 className="text-2xl font-bold text-white mb-2">{successTitle}</h3>
              <p className="text-white/70 mb-6">{successBody}</p>
              <button
                type="button"
                onClick={reset}
                className="inline-flex items-center rounded-md border border-white/30 px-5 py-3 text-white hover:bg-white/10 transition-colors"
              >
                {sendAnotherLabel}
              </button>
            </motion.div>
          ) : (
            <motion.form
              key="form"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              onSubmit={onSubmit}
              noValidate
              className="flex flex-col gap-5"
            >
              <div
                aria-hidden="true"
                style={{
                  position: "absolute",
                  left: "-10000px",
                  top: "auto",
                  width: "1px",
                  height: "1px",
                  overflow: "hidden",
                }}
              >
                <label>
                  Company
                  <input
                    type="text"
                    name="company"
                    tabIndex={-1}
                    autoComplete="off"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                  />
                </label>
              </div>

              <Field
                id="contact-name"
                label={name_label || "Name"}
                error={errors.name}
              >
                <input
                  id="contact-name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                  maxLength={120}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  aria-invalid={Boolean(errors.name)}
                  aria-describedby={errors.name ? "contact-name-error" : undefined}
                  className="w-full rounded-md bg-transparent border border-white/30 px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-white transition-colors"
                />
              </Field>

              <Field
                id="contact-email"
                label={email_label || "Email"}
                error={errors.email}
              >
                <input
                  id="contact-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  maxLength={254}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  aria-invalid={Boolean(errors.email)}
                  aria-describedby={errors.email ? "contact-email-error" : undefined}
                  className="w-full rounded-md bg-transparent border border-white/30 px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-white transition-colors"
                />
              </Field>

              <Field
                id="contact-message"
                label={message_label || "Message"}
                error={errors.message}
              >
                <textarea
                  id="contact-message"
                  name="message"
                  required
                  rows={6}
                  maxLength={MAX_MESSAGE}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  aria-invalid={Boolean(errors.message)}
                  aria-describedby={errors.message ? "contact-message-error" : undefined}
                  className="w-full rounded-md bg-transparent border border-white/30 px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-white transition-colors resize-y"
                />
              </Field>

              <div aria-live="polite" className="min-h-[1.25rem]">
                {errorBanner && (
                  <p className="text-red-400 text-sm">{errorBanner}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center justify-center rounded-md bg-white px-6 py-3 font-semibold text-black hover:bg-white/90 disabled:opacity-60 disabled:cursor-not-allowed transition-colors self-start"
              >
                {submitting ? "Sending…" : submitLabel}
              </button>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
};

type FieldProps = {
  id: string;
  label: string;
  error?: string;
  children: React.ReactNode;
};

const Field: FC<FieldProps> = ({ id, label, error, children }) => (
  <div className="flex flex-col gap-2">
    <label htmlFor={id} className="text-sm uppercase tracking-wider text-white/70">
      {label}
    </label>
    {children}
    {error && (
      <p id={`${id}-error`} className="text-red-400 text-sm">
        {error}
      </p>
    )}
  </div>
);

export default ContactForm;
