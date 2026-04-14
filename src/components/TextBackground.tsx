'use client';

const REPEAT = 50;

export default function TextBackground() {
  return (
    <div className="fixed inset-0 z-[1] pointer-events-none px-4 lg:px-20 overflow-hidden">
      {Array.from({ length: REPEAT }).map((_, i) => (
        <div key={i} className="flex flex-col gap-0" style={{ opacity: 0.1 }}>
          <span
            className="text-[200px] lg:text-[150px] xl:text-[350px] font-black leading-none text-transparent uppercase"
            style={{ WebkitTextStroke: '2px #00f5ff' }}
          >
            BUILT LIKE FILM.
          </span>
          <span
            className="text-[200px] lg:text-[150px] xl:text-[350px] font-black leading-none text-right uppercase"
            style={{ color: '#00f5ff' }}
          >
            SEEN LIKE REALITY.
          </span>
        </div>
      ))}
    </div>
  );
}
