"use client";

import { FC, FormEvent, useEffect, useState } from "react";
import { Content } from "@prismicio/client";
import { SliceComponentProps } from "@prismicio/react";
import { AnimatePresence, motion, type Easing } from "framer-motion";

export type ContactFormProps = SliceComponentProps<Content.ContactFormSlice>;

type Status = "idle" | "submitting" | "success" | "error";
type FieldErrors = Partial<Record<"name" | "email" | "message", string>>;

const MAX_MESSAGE = 600;

const FIELD_VARIANTS = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.45, ease: "easeOut" as Easing },
  }),
};

// ── Corner tick ──────────────────────────────────────────────────────────────
const Corner = ({ pos }: { pos: "tl" | "tr" | "bl" | "br" }) => {
  const base: React.CSSProperties = { position: "absolute", width: 16, height: 16, borderColor: "var(--cyber-cyan)", borderStyle: "solid", borderWidth: 0 };
  const map: Record<string, React.CSSProperties> = {
    tl: { top: -1, left: -1, borderTopWidth: 1, borderLeftWidth: 1 },
    tr: { top: -1, right: -1, borderTopWidth: 1, borderRightWidth: 1 },
    bl: { bottom: -1, left: -1, borderBottomWidth: 1, borderLeftWidth: 1 },
    br: { bottom: -1, right: -1, borderBottomWidth: 1, borderRightWidth: 1 },
  };
  return <span aria-hidden="true" style={{ ...base, ...map[pos] }} />;
};

// ── Form field ───────────────────────────────────────────────────────────────
type FieldProps = {
  id: string;
  label: string;
  index: string;
  error?: string;
  children: React.ReactNode;
  custom: number;
};

const Field: FC<FieldProps> = ({ id, label, index, error, children, custom }) => (
  <motion.div
    className="cf-field group"
    variants={FIELD_VARIANTS}
    custom={custom}
  >
    <div className="flex justify-between items-baseline mb-2">
      <label
        htmlFor={id}
        className="text-[10px] tracking-[0.22em] uppercase text-white/40"
        style={{ fontFamily: "var(--font-space-mono)" }}
      >
        {label}
      </label>
      <span
        className="text-[10px] tracking-[0.18em] text-white/20"
        style={{ fontFamily: "var(--font-space-mono)" }}
      >
        {index}
      </span>
    </div>
    {children}
    {error && (
      <p className="text-red-400 text-xs mt-1" style={{ fontFamily: "var(--font-space-mono)" }}>
        {error}
      </p>
    )}
    <span className="cf-caret" aria-hidden="true" />
  </motion.div>
);

const sharedInputClass =
  "w-full bg-transparent border-0 outline-none text-white/90 placeholder-white/20 text-lg py-1";

// ── Main component ───────────────────────────────────────────────────────────
const ContactForm: FC<ContactFormProps> = ({ slice }) => {
  const { name_label, email_label, message_label, submit_label, success_title, success_message } =
    slice.primary;

  const [name, setName]       = useState("");
  const [email, setEmail]     = useState("");
  const [message, setMessage] = useState("");
  const [company, setCompany] = useState("");
  const [status, setStatus]   = useState<Status>("idle");
  const [errors, setErrors]   = useState<FieldErrors>({});
  const [errorBanner, setErrorBanner] = useState<string | null>(null);
  const [utc, setUtc]         = useState("--:--:--");

  useEffect(() => {
    const pad = (n: number) => String(n).padStart(2, "0");
    const tick = () => {
      const d = new Date();
      setUtc(`${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}:${pad(d.getUTCSeconds())}`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const reset = () => {
    setName(""); setEmail(""); setMessage(""); setCompany("");
    setErrors({}); setErrorBanner(null); setStatus("idle");
  };

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (status === "submitting") return;
    setStatus("submitting"); setErrors({}); setErrorBanner(null);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message, company }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean; error?: string; errors?: FieldErrors;
      };
      if (res.ok && data.ok) { setStatus("success"); return; }
      if (res.status === 400 && data.errors) { setErrors(data.errors); setStatus("idle"); return; }
      setErrorBanner(res.status === 429
        ? "Too many attempts — please wait a few minutes."
        : "Something went wrong. Please try again.");
      setStatus("error");
    } catch {
      setErrorBanner("Network error. Check your connection and try again.");
      setStatus("error");
    }
  };

  const submitting = status === "submitting";

  return (
    <section
      data-slice-type={slice.slice_type}
      data-slice-variation={slice.variation}
      className="relative w-full min-h-screen flex items-center px-8 lg:px-16 xl:px-24 py-24"
    >
      <div className="cf-grid w-full grid gap-16 lg:gap-20" style={{ gridTemplateColumns: "1fr 1fr" }}>

        {/* ── LEFT ─────────────────────────────────────────────────── */}
        <div className="flex flex-col justify-between gap-16">

          {/* meta row */}
          <motion.div
            className="flex gap-6 flex-wrap"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }}
            style={{ fontFamily: "var(--font-space-mono)", fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(255,255,255,0.35)" }}
          >
            <span><span className="text-white/80">§ 04</span> &nbsp;Direct Line</span>
            <span><span className="text-white/80">UTC</span> &nbsp;{utc}</span>
            <span><span className="text-white/80">SIG</span> &nbsp;Stable</span>
          </motion.div>

          {/* display heading */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" as const, delay: 0.1 }}
          >
            <h1
              className="leading-[0.88] tracking-[-0.04em] font-bold"
              data-text="Open"
              style={{ fontSize: "clamp(72px, 7vw + 2vh, 200px)" }}
            >
              <span
                className="block"
                style={{ color: "transparent", WebkitTextStroke: "1.5px rgba(0,245,255,0.25)" }}
              >
                Open
              </span>
              <span className="block text-white">
                a channel
                <span
                  aria-hidden="true"
                  className="cf-blink inline-block rounded-full ml-2 align-middle"
                  style={{ width: 14, height: 14, background: "var(--cyber-cyan)", boxShadow: "0 0 12px var(--cyber-cyan-glow-strong)", marginBottom: 4 }}
                />
              </span>
              <span
                className="block"
                style={{ color: "transparent", WebkitTextStroke: "1.5px rgba(0,245,255,0.25)" }}
              >
                we&nbsp;listen.
              </span>
            </h1>
          </motion.div>

          {/* meta bottom */}
          {/* <motion.div
            className="grid grid-cols-2 gap-8 pt-6 border-t border-white/[0.06]"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 0.3 }}
          >
            {[
              { label: "Studio", value: "Bucharest, Romania", sub: "Europe · UTC+3" },
              { label: "Direct", value: "hello@shapelanguage.co", sub: "Available Mon – Fri" },
            ].map(({ label, value, sub }) => (
              <div key={label}>
                <span
                  className="block mb-2 text-[10px] tracking-[0.16em] uppercase text-white/20"
                  style={{ fontFamily: "var(--font-space-mono)" }}
                >
                  {label}
                </span>
                <span className="block text-white/80 text-base" style={{ fontFamily: "var(--font-space-grotesk)" }}>
                  {value}
                  <small
                    className="block mt-1 text-xs text-white/35 tracking-[0.1em] uppercase"
                    style={{ fontFamily: "var(--font-space-mono)" }}
                  >
                    {sub}
                  </small>
                </span>
              </div>
            ))}
          </motion.div> */}
        </div>

        {/* ── RIGHT — panel ────────────────────────────────────────── */}
        <motion.div
          className="relative glow-card border border-white/[0.08]"
          style={{ background: "linear-gradient(160deg, rgba(0,245,255,0.02) 0%, rgba(0,0,0,0) 60%), #080808", padding: "48px 48px 40px", alignSelf: "center" }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" as const }}
        >
          <Corner pos="tl" /><Corner pos="tr" /><Corner pos="bl" /><Corner pos="br" />

          {/* panel header */}
          <div className="flex justify-between items-start pb-7 mb-1 border-b border-white/[0.06]">
            <div>
              <h2 className="text-2xl font-semibold tracking-[-0.02em] text-white/90">
                Transmission form
              </h2>
              <div className="flex items-center gap-2 mt-2">
                <span
                  className="cf-pulse cf-blink block rounded-full"
                  style={{ width: 6, height: 6, background: "var(--cyber-cyan)" }}
                  aria-hidden="true"
                />
                <span
                  className="text-[10px] tracking-[0.2em] uppercase text-white/35"
                  style={{ fontFamily: "var(--font-space-mono)" }}
                >
                  Receiving
                </span>
              </div>
            </div>
            <div
              className="text-right text-[10px] tracking-[0.18em] uppercase text-white/30"
              style={{ fontFamily: "var(--font-space-mono)" }}
            >
              REQ{" "}
              <b className="neon-text" style={{ fontWeight: 500 }}>
                #SL-2026
              </b>
              <br />
              ENC · TLS 1.3
            </div>
          </div>

          {/* form / success */}
          <AnimatePresence mode="wait" initial={false}>
            {status === "success" ? (

              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4, ease: "easeOut" as const }}
                className="flex flex-col items-center justify-center gap-5 py-16"
                role="status"
                aria-live="polite"
              >
                <div
                  className="neon-border grid place-items-center rounded-full"
                  style={{ width: 72, height: 72, border: "1px solid", boxShadow: "0 0 20px var(--cyber-cyan-glow)" }}
                >
                  <span
                    aria-hidden="true"
                    style={{ display: "block", width: 20, height: 10, borderLeft: "1.5px solid var(--cyber-cyan)", borderBottom: "1.5px solid var(--cyber-cyan)", transform: "rotate(-45deg) translate(2px,-3px)" }}
                  />
                </div>
                <h3 className="text-2xl font-semibold tracking-[-0.02em] text-white/90 mt-2">
                  {success_title || "Signal received."}
                </h3>
                <p
                  className="text-[10px] tracking-[0.2em] uppercase text-white/35"
                  style={{ fontFamily: "var(--font-space-mono)" }}
                >
                  {success_message || "REPLY · INBOUND · ≤ 48H"}
                </p>
                <button
                  type="button"
                  onClick={reset}
                  className="mt-4 border border-white/20 px-5 py-2.5 text-[10px] tracking-[0.2em] uppercase text-white/40 hover:border-white/40 hover:text-white/70 transition-colors"
                  style={{ fontFamily: "var(--font-space-mono)" }}
                >
                  Send another
                </button>
              </motion.div>

            ) : (

              <motion.form
                key="form"
                initial="hidden"
                animate="visible"
                exit={{ opacity: 0 }}
                onSubmit={onSubmit}
                noValidate
                autoComplete="off"
                className="pt-2"
              >
                {/* honeypot */}
                <div aria-hidden="true" style={{ position: "absolute", left: -9999, width: 1, height: 1, overflow: "hidden" }}>
                  <input type="text" name="company" tabIndex={-1} autoComplete="off" value={company} onChange={(e) => setCompany(e.target.value)} />
                </div>

                <Field id="cf-name" label={name_label || "Identifier"} index="01 / 03" error={errors.name} custom={0}>
                  <input
                    id="cf-name" name="name" type="text"
                    placeholder="Your name, or the one you go by"
                    required maxLength={120}
                    value={name} onChange={(e) => setName(e.target.value)}
                    aria-invalid={Boolean(errors.name)}
                    className={`${sharedInputClass} cf-input`}
                  />
                </Field>

                <Field id="cf-email" label={email_label || "Return Path"} index="02 / 03" error={errors.email} custom={1}>
                  <input
                    id="cf-email" name="email" type="email"
                    placeholder="you@somewhere.earth"
                    required maxLength={254}
                    value={email} onChange={(e) => setEmail(e.target.value)}
                    aria-invalid={Boolean(errors.email)}
                    className={`${sharedInputClass} cf-input`}
                  />
                </Field>

                <Field id="cf-message" label={message_label || "Payload"} index="03 / 03" error={errors.message} custom={2}>
                  <textarea
                    id="cf-message" name="message"
                    placeholder="Tell us what you're building, the shape of it, when it needs to land."
                    required maxLength={MAX_MESSAGE}
                    value={message} onChange={(e) => setMessage(e.target.value)}
                    aria-invalid={Boolean(errors.message)}
                    className={`${sharedInputClass} cf-input resize-none`}
                    style={{ minHeight: 120, lineHeight: 1.5 }}
                  />
                  {/* counter */}
                  <div
                    className="flex items-center gap-4 mt-2 text-[10px] tracking-[0.16em] uppercase text-white/20"
                    style={{ fontFamily: "var(--font-space-mono)" }}
                  >
                    <span>Bytes</span>
                    <span className="flex-1 h-px bg-white/[0.06] relative overflow-hidden block">
                      <span
                        className="absolute inset-y-0 left-0 transition-all duration-150"
                        style={{ width: `${(message.length / MAX_MESSAGE) * 100}%`, background: "var(--cyber-cyan)", boxShadow: "0 0 6px var(--cyber-cyan-glow)" }}
                      />
                    </span>
                    <span>{message.length} / {MAX_MESSAGE}</span>
                  </div>
                </Field>

                {errorBanner && (
                  <motion.p
                    initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                    className="text-red-400 text-xs mt-4 tracking-wide"
                    style={{ fontFamily: "var(--font-space-mono)" }}
                  >
                    {errorBanner}
                  </motion.p>
                )}

                <motion.div
                  className="flex justify-between items-center gap-6 mt-10"
                  variants={FIELD_VARIANTS} custom={3}
                >
                  <p
                    className="text-[10px] tracking-[0.14em] uppercase text-white/20 leading-relaxed max-w-[220px]"
                    style={{ fontFamily: "var(--font-space-mono)" }}
                  >
                    Human reply within 48&nbsp;hrs. No mailing list.
                  </p>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="cf-submit relative flex-shrink-0 flex items-center gap-4 border border-white/30 px-6 py-4 text-white/80 text-sm font-medium tracking-wide transition-colors duration-300 disabled:opacity-50"
                    style={{ fontFamily: "var(--font-space-grotesk)" }}
                  >
                    <span>{submitting ? "Transmitting…" : (submit_label || "Transmit")}</span>
                    <span aria-hidden="true" className="relative inline-block" style={{ width: 24, height: 1, background: "currentColor" }}>
                      <span style={{ position: "absolute", right: 0, top: -3, width: 7, height: 7, borderTop: "1px solid currentColor", borderRight: "1px solid currentColor", transform: "rotate(45deg)", display: "block" }} />
                    </span>
                  </button>
                </motion.div>
              </motion.form>

            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
};

export default ContactForm;
