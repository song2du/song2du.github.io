import type { SVGProps } from "react";

function Icon(props: SVGProps<SVGSVGElement>) {
  return <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor" aria-hidden="true" {...props} />;
}

export const PlayIcon = () => (
  <Icon>
    <path d="M4.5 2.8v10.4c0 .5.6.8 1 .5l8-5.2a.6.6 0 0 0 0-1L5.5 2.3c-.4-.3-1 0-1 .5Z" />
  </Icon>
);

export const PauseIcon = () => (
  <Icon>
    <rect x="3.5" y="2.5" width="3" height="11" rx="1" />
    <rect x="9.5" y="2.5" width="3" height="11" rx="1" />
  </Icon>
);

export const PrevIcon = () => (
  <Icon>
    <rect x="2.5" y="3" width="1.8" height="10" rx=".9" />
    <path d="M13 3.6v8.8c0 .5-.6.8-1 .5L6 8.5a.6.6 0 0 1 0-1l6-4.4c.4-.3 1 0 1 .5Z" />
  </Icon>
);

export const NextIcon = () => (
  <Icon>
    <rect x="11.7" y="3" width="1.8" height="10" rx=".9" />
    <path d="M3 3.6v8.8c0 .5.6.8 1 .5l6-4.4a.6.6 0 0 0 0-1L4 3.1c-.4-.3-1 0-1 .5Z" />
  </Icon>
);

export const RestartIcon = () => (
  <Icon fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2.8 8a5.2 5.2 0 1 0 1.6-3.8" />
    <path d="M2.5 2.5v3h3" />
  </Icon>
);
