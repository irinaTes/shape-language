'use client';
// import GlowCard from '@/slices/WorkListing/GlowCard';

export default function MobileHero() {
  return (
    <div
      className="flex flex-col justify-between min-h-screen px-[22px] pt-[env(safe-area-inset-top,0px)] pb-[env(safe-area-inset-bottom,0px)]"
      style={{ paddingTop: 'calc(20px + env(safe-area-inset-top, 0px))', paddingBottom: 'calc(18px + env(safe-area-inset-bottom, 0px))' }}
    >
      {/* Main content */}
      <main className="flex flex-col justify-center flex-1 py-6">
        {/* Eyebrow */}
        <div className="flex items-center gap-[10px] mb-7 ml-4 mt-3.5">
          <span className="w-7 h-px bg-[#1C2029]" />
          <span
            className="text-[10px] uppercase tracking-[0.18em] text-[#6E7785]"
            style={{ fontFamily: 'var(--font-space-mono)' }}
          >
            Film &amp; design
          </span>
        </div>

        {/* Headline */}
        <h1
          className="leading-[0.95] tracking-[-0.035em] text-[#E6EAF2]"
          style={{
            fontFamily: 'var(--font-space-grotesk)',
            fontWeight: 400,
            fontSize: 'clamp(56px, 17vw, 84px)',
          }}
        >
          Shape
          <br />
          <span
            className="text-[#6E7785] tracking-[-0.03em]"
            style={{ fontWeight: 300 }}
          >
            language,
          </span>
          <br />
          shape reality.
        </h1>

        {/* Lede */}
        <p
          className="mt-8 text-base leading-[1.55] tracking-[-0.005em] text-[#E6EAF2] max-w-[32ch]"
          style={{ fontFamily: 'var(--font-space-grotesk)', fontWeight: 300 }}
        >
          We make work that is{' '}
          <em className="not-italic font-normal text-[#6E7785]">built like film</em>
          {' '}— deliberate, unhurried, composed frame by frame.
        </p>

        {/* Meta stack */}
        <div
          className="mt-10 border-t border-[#1C2029] pt-4 grid gap-[10px]"
          style={{ fontFamily: 'var(--font-space-mono)' }}
        >
          {[
            ['Est.', 'MMXXI'],
            ['Discipline', 'Film · Identity'],
            ['Status', 'Open · 2026'],
          ].map(([k, v]) => (
            <div key={k} className="flex justify-between gap-3 text-[10px] uppercase tracking-[0.05em] text-[#6E7785]">
              <span>{k}</span>
              <span className="text-[#E6EAF2]">{v}</span>
            </div>
          ))}
        </div>

        {/* CTA */}
        {/* <GlowCard className="mt-7 rounded-full">
          <a
            href="#reel"
            className="flex items-center justify-between w-full px-[18px] py-4 border border-[#1C2029] rounded-full text-[#E6EAF2] no-underline text-[11px] uppercase tracking-[0.18em]"
            style={{ fontFamily: 'var(--font-space-mono)' }}
          >
            <span>View Reel</span>
            <span className="w-[22px] h-[22px] rounded-full border border-[#1C2029] grid place-items-center">
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                <path d="M2 8L8 2M8 2H3.5M8 2V6.5" stroke="currentColor" strokeWidth="1" />
              </svg>
            </span>
          </a>
        </GlowCard> */}
      </main>

      {/* Footer bar */}
      <footer className="border-t border-[#1C2029] pt-[14px] flex justify-between items-center">
        <div
          className="flex gap-[14px] items-center text-[10px] uppercase tracking-[0.18em] text-[#6E7785]"
          style={{ fontFamily: 'var(--font-space-mono)' }}
        >
          <span>© Studio</span>
          <span>Vol. 01</span>
        </div>
        <div
          className="flex gap-[14px] items-center text-[10px] uppercase tracking-[0.18em] text-[#6E7785]"
          style={{ fontFamily: 'var(--font-space-mono)' }}
        >
          <span>N 40.71</span>
          {/* crosshair */}
          <span className="relative w-[14px] h-[14px]">
            <span className="absolute left-1/2 top-0 bottom-0 w-px bg-[#6E7785] -translate-x-1/2" />
            <span className="absolute top-1/2 left-0 right-0 h-px bg-[#6E7785] -translate-y-1/2" />
          </span>
        </div>
      </footer>
    </div>
  );
}
