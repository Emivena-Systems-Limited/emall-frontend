import { ghanaMapRegions } from '../../constants/ghanaMapRegions'

export default function GhanaMapIllustration() {
  return (
    <div className="relative mx-auto flex h-[32rem] w-full max-w-lg items-center justify-center sm:h-[36rem]">
      <div
        aria-hidden="true"
        className="absolute inset-0 rounded-3xl opacity-20"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(199,59,45,0.45) 1px, transparent 1.6px)',
          backgroundSize: '14px 14px',
        }}
      />
      <div
        aria-hidden="true"
        className="absolute inset-1/4 rounded-full bg-brand/10 blur-3xl"
      />
      <svg
        viewBox="0 0 370 610"
        role="img"
        aria-label="Ghana regional map illustration"
        className="relative h-[30rem] w-full max-w-[19rem] drop-shadow-[0_0_50px_rgba(199,59,45,0.22)] sm:h-[34rem] sm:max-w-[22rem]"
      >
        <defs>
          <filter id="ghanaMapShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="12" stdDeviation="12" floodColor="#7f1d1d" floodOpacity="0.35" />
          </filter>
        </defs>
        <g filter="url(#ghanaMapShadow)">
          {ghanaMapRegions.map((region) => (
            <path
              key={region.name}
              d={region.path}
              fill={region.fill}
              stroke="rgba(255,255,255,0.18)"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
          ))}
        </g>
        {ghanaMapRegions.map((region) => (
          <text
            key={`${region.name}-label`}
            x={region.label.x}
            y={region.label.y}
            textAnchor="middle"
            fill="rgba(255,255,255,0.9)"
            fontWeight="600"
            className="select-none"
            style={{ fontSize: region.label.size - 1 }}
          >
            {region.name}
          </text>
        ))}
      </svg>
    </div>
  )
}
