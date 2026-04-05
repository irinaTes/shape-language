'use client';

const REPEAT = 50;

export default function TextBackground() {
  return (
    <div className="absolute inset-0 z-[1] pointer-events-none px-4 lg:px-20 overflow-hidden">
      {Array.from({ length: REPEAT }).map((_, i) => (
        <div key={i} className="flex flex-col gap-0" style={{ opacity: 0.1 }}>
          <span
            className="text-[200px] lg:text-[150px] xl:text-[350px] font-black leading-none text-transparent uppercase"
            style={{ WebkitTextStroke: '2px white' }}
          >
            BUILT LIKE FILM.
          </span>
          <span className="text-[200px] lg:text-[150px] xl:text-[350px] font-black leading-none text-white text-right uppercase">
            SEEN LIKE REALITY.
          </span>
        </div>
      ))}
    </div>
  );
}
