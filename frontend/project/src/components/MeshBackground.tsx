/**
 * Animated mesh-gradient background with floating blobs.
 * Fixed, behind everything (z -1). Purely decorative.
 */
export function MeshBackground({ dark = false }: { dark?: boolean }) {
  return (
    <div className="mesh-bg" aria-hidden>
      {dark ? (
        <>
          <div
            className="mesh-blob animate-float-slow"
            style={{
              top: '-10%',
              left: '-8%',
              width: '46vw',
              height: '46vw',
              background:
                'radial-gradient(circle at 30% 30%, #7a2340, transparent 70%)',
              opacity: 0.5,
            }}
          />
          <div
            className="mesh-blob animate-float"
            style={{
              top: '20%',
              right: '-12%',
              width: '40vw',
              height: '40vw',
              background:
                'radial-gradient(circle at 70% 30%, #c08f1e, transparent 70%)',
              opacity: 0.4,
            }}
          />
          <div
            className="mesh-blob animate-float-slow"
            style={{
              bottom: '-18%',
              left: '30%',
              width: '50vw',
              height: '50vw',
              background:
                'radial-gradient(circle at 50% 50%, #451322, transparent 70%)',
              opacity: 0.6,
            }}
          />
        </>
      ) : (
        <>
          <div
            className="mesh-blob animate-float-slow"
            style={{
              top: '-12%',
              left: '-10%',
              width: '42vw',
              height: '42vw',
              background:
                'radial-gradient(circle at 30% 30%, #e6a8b3, transparent 70%)',
            }}
          />
          <div
            className="mesh-blob animate-float"
            style={{
              top: '8%',
              right: '-14%',
              width: '38vw',
              height: '38vw',
              background:
                'radial-gradient(circle at 70% 30%, #f3da85, transparent 70%)',
            }}
          />
          <div
            className="mesh-blob animate-float-slow"
            style={{
              bottom: '-20%',
              left: '25%',
              width: '46vw',
              height: '46vw',
              background:
                'radial-gradient(circle at 50% 50%, #f4d4d9, transparent 70%)',
            }}
          />
          <div
            className="mesh-blob animate-float"
            style={{
              top: '40%',
              left: '55%',
              width: '26vw',
              height: '26vw',
              background:
                'radial-gradient(circle at 50% 50%, #faedc0, transparent 70%)',
              opacity: 0.5,
            }}
          />
        </>
      )}
    </div>
  );
}
