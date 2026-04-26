import { NextRequest, NextResponse } from "next/server";
import nodemailer, { Transporter } from "nodemailer";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_NAME = 120;
const MAX_EMAIL = 254;
const MAX_MESSAGE = 5000;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;

type FieldErrors = Partial<Record<"name" | "email" | "message", string>>;

const globalForRateLimit = globalThis as unknown as {
  __contactRateLimit?: Map<string, number[]>;
  __contactTransporter?: Transporter;
};

function getRateLimitStore(): Map<string, number[]> {
  if (!globalForRateLimit.__contactRateLimit) {
    globalForRateLimit.__contactRateLimit = new Map();
  }
  return globalForRateLimit.__contactRateLimit;
}

function isRateLimited(ip: string): boolean {
  const store = getRateLimitStore();
  const now = Date.now();
  const windowStart = now - RATE_LIMIT_WINDOW_MS;
  const hits = (store.get(ip) ?? []).filter((t) => t > windowStart);
  if (hits.length >= RATE_LIMIT_MAX) {
    store.set(ip, hits);
    return true;
  }
  hits.push(now);
  store.set(ip, hits);
  return false;
}

function getClientIp(req: NextRequest): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0]!.trim();
  return req.headers.get("x-real-ip")?.trim() || "unknown";
}

function isSameOrigin(req: NextRequest): boolean {
  const origin = req.headers.get("origin");
  if (!origin) return false;
  const host = req.headers.get("host");
  if (!host) return false;
  try {
    const originHost = new URL(origin).host;
    return originHost === host;
  } catch {
    return false;
  }
}

function getTransporter(): Transporter {
  if (globalForRateLimit.__contactTransporter) {
    return globalForRateLimit.__contactTransporter;
  }
  const port = Number(process.env.SMTP_PORT ?? 465);
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure: process.env.SMTP_SECURE
      ? process.env.SMTP_SECURE === "true"
      : port === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
  globalForRateLimit.__contactTransporter = transporter;
  return transporter;
}

function validate(input: {
  name: unknown;
  email: unknown;
  message: unknown;
}): { errors: FieldErrors; valid: { name: string; email: string; message: string } | null } {
  const errors: FieldErrors = {};
  const name = typeof input.name === "string" ? input.name.trim() : "";
  const email = typeof input.email === "string" ? input.email.trim() : "";
  const message = typeof input.message === "string" ? input.message.trim() : "";

  if (!name) errors.name = "Please enter your name.";
  else if (name.length > MAX_NAME) errors.name = `Name is too long (max ${MAX_NAME}).`;

  if (!email) errors.email = "Please enter your email.";
  else if (email.length > MAX_EMAIL || !EMAIL_REGEX.test(email))
    errors.email = "Please enter a valid email address.";

  if (!message) errors.message = "Please enter a message.";
  else if (message.length > MAX_MESSAGE)
    errors.message = `Message is too long (max ${MAX_MESSAGE}).`;

  if (Object.keys(errors).length) return { errors, valid: null };
  return { errors, valid: { name, email, message } };
}

export async function POST(req: NextRequest) {
  if (!isSameOrigin(req)) {
    return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
  }

  const ip = getClientIp(req);
  if (isRateLimited(ip)) {
    return NextResponse.json({ ok: false, error: "rate_limited" }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  if (!body || typeof body !== "object") {
    return NextResponse.json({ ok: false, error: "invalid_body" }, { status: 400 });
  }

  const payload = body as Record<string, unknown>;

  if (typeof payload.company === "string" && payload.company.trim() !== "") {
    return NextResponse.json({ ok: true });
  }

  const { errors, valid } = validate({
    name: payload.name,
    email: payload.email,
    message: payload.message,
  });
  if (!valid) {
    return NextResponse.json({ ok: false, error: "validation", errors }, { status: 400 });
  }

  const to = process.env.CONTACT_TO_EMAIL;
  const from = process.env.CONTACT_FROM_EMAIL;
  if (!to || !from || !process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.error("contact: missing SMTP configuration");
    return NextResponse.json({ ok: false, error: "send_failed" }, { status: 500 });
  }

  try {
    const transporter = getTransporter();
    await transporter.sendMail({
      from,
      to,
      replyTo: valid.email,
      subject: "New contact form submission",
      text: `Name: ${valid.name}\nEmail: ${valid.email}\n\nMessage:\n${valid.message}\n`,
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("contact: send failed", { code: (err as { code?: string })?.code });
    return NextResponse.json({ ok: false, error: "send_failed" }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ ok: false, error: "method_not_allowed" }, { status: 405 });
}
