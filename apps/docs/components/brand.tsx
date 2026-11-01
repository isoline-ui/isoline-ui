import type { SVGProps } from 'react';
export function BrandMark(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 36 36" fill="none" aria-hidden="true" {...props}>
      <path
        d="M8 26C1 17 10 1 22 5c13 4 11 23 0 26C13 34 4 24 9 15c4-9 16-7 17 2 1 8-9 12-13 6-4-5 2-12 7-8 4 3 0 8-3 6"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}
export function Brand() {
  return (
    <span className="brand">
      <BrandMark width={31} height={31} />
      <span>
        isoline<span className="brand-ui"> ui</span>
      </span>
    </span>
  );
}
