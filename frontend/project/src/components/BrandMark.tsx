/**
 * Share Cafe's real logo — cropped from a photo of the gold swan monogram on the
 * shop's signage (public/share-logo.png). Renders the full badge (image fills the
 * container edge-to-edge); size/rounding is controlled entirely via `className`.
 */
export function BrandMark({ className = 'h-9 w-9 rounded-xl' }: { className?: string }) {
  return <img src="/share-logo.png" alt="Share Cafe" className={`${className} object-cover shadow-glow`} />;
}
