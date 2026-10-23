"use client";

import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from "react";

type Series = { name: string; values: number[]; highlight?: boolean };

// Emphasis line chart for MDX:
// <LineChart
//   x={["Start", "Middle", "End"]}
//   series={[{ name: "Theory", values: [2.1, 3.5, 3.7] }, { name: "Coding", values: [1.5, 2.5, 2.2], highlight: true }]}
//   yDomain={[1, 5]}
//   reference={{ value: 3, label: "Neutral" }}
//   caption="..."
// />
// The `highlight` series gets the accent color and an end label; the rest stay gray as context.
// Hovering the plot (or focusing it and using the arrow keys) shows every value at that point,
// and hovering a legend entry brings that line forward.
type Props = {
  x: string[];
  series: Series[];
  yDomain: [number, number];
  reference?: { value: number; label: string };
  caption?: string;
  decimals?: number;
};

// Line colors, checked for contrast and color-blind separation on both page backgrounds.
const ACCENT = "light-dark(#1f7a57, #2fae78)";
const CONTEXT = "light-dark(#8a8a84, #75756f)";

const HEIGHT = 260;
const MARGIN = { top: 16, right: 16, bottom: 32, left: 32 };
const END_LABEL_SPACE = 108;
const INSET = 24; // keeps the first and last points off the plot edges

export function LineChart({
  x,
  series,
  yDomain,
  reference,
  caption,
  decimals = 2,
}: Props) {
  const plotRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(640); // replaced by the real width once mounted
  const [active, setActive] = useState<number | null>(null); // x index under the pointer
  const [focused, setFocused] = useState<string | null>(null); // series picked in the legend

  useEffect(() => {
    const el = plotRef.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const [y0, y1] = yDomain;
  const highlighted = series.find((s) => s.highlight);
  const plotWidth = Math.max(0, width - MARGIN.left - MARGIN.right - (highlighted ? END_LABEL_SPACE : 0));
  const plotHeight = HEIGHT - MARGIN.top - MARGIN.bottom;
  const px = (i: number) =>
    MARGIN.left + INSET + (x.length > 1 ? (i * (plotWidth - 2 * INSET)) / (x.length - 1) : 0);
  const py = (v: number) => MARGIN.top + ((y1 - v) / (y1 - y0)) * plotHeight;
  const ticks = Array.from({ length: Math.floor(y1 - y0) + 1 }, (_, i) => y0 + i);
  const format = (v: number) => v.toFixed(decimals);

  const colorOf = (s: Series) => (s.highlight ? ACCENT : s.name === focused ? "var(--fg)" : CONTEXT);
  // Context lines first, so the highlighted and legend-focused series draw on top.
  const weight = (s: Series) => (s.name === focused ? 2 : s.highlight ? 1 : 0);
  const drawOrder = [...series].sort((a, b) => weight(a) - weight(b));

  function pointAt(event: PointerEvent<SVGRectElement>) {
    const box = event.currentTarget.ownerSVGElement!.getBoundingClientRect();
    const localX = ((event.clientX - box.left) / box.width) * width;
    let nearest = 0;
    x.forEach((_, i) => {
      if (Math.abs(px(i) - localX) < Math.abs(px(nearest) - localX)) nearest = i;
    });
    setActive(nearest);
  }

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "Escape") return setActive(null);
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    const step = event.key === "ArrowRight" ? 1 : -1;
    setActive((i) => (i === null ? 0 : Math.min(x.length - 1, Math.max(0, i + step))));
  }

  const last = highlighted ? highlighted.values.length - 1 : 0;

  return (
    <figure className="not-prose my-8">
      <ul className="mb-3 flex flex-wrap gap-x-4 gap-y-1 text-sm">
        {series.map((s) => (
          <li key={s.name}>
            <button
              type="button"
              className={`flex items-center gap-2 hover:text-fg focus-visible:text-fg ${s.highlight ? "text-fg" : "text-muted"}`}
              onPointerEnter={() => setFocused(s.name)}
              onPointerLeave={() => setFocused(null)}
              onFocus={() => setFocused(s.name)}
              onBlur={() => setFocused(null)}
            >
              <span className="h-0.5 w-4 rounded-full" style={{ background: colorOf(s) }} />
              {s.name}
            </button>
          </li>
        ))}
      </ul>

      <div
        ref={plotRef}
        tabIndex={0}
        aria-label={caption}
        onKeyDown={onKeyDown}
        onFocus={() => setActive((i) => i ?? 0)}
        onBlur={() => setActive(null)}
        className="relative rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-accent"
      >
        <svg width="100%" height={HEIGHT} viewBox={`0 0 ${width} ${HEIGHT}`} className="block" aria-hidden>
          {ticks.map((t) => (
            <g key={t}>
              {t !== reference?.value && (
                <line
                  x1={MARGIN.left}
                  x2={MARGIN.left + plotWidth}
                  y1={py(t)}
                  y2={py(t)}
                  strokeWidth={1}
                  shapeRendering="crispEdges"
                  style={{ stroke: "var(--line)" }}
                />
              )}
              <text
                x={MARGIN.left - 8}
                y={py(t)}
                textAnchor="end"
                dominantBaseline="middle"
                fontSize={11}
                className="tabular-nums"
                style={{ fill: "var(--muted)" }}
              >
                {t}
              </text>
            </g>
          ))}

          {reference && (
            <g>
              <line
                x1={MARGIN.left}
                x2={MARGIN.left + plotWidth}
                y1={py(reference.value)}
                y2={py(reference.value)}
                strokeWidth={1}
                shapeRendering="crispEdges"
                style={{ stroke: "var(--faint)" }}
              />
              <text
                x={MARGIN.left + plotWidth}
                y={py(reference.value) - 6}
                textAnchor="end"
                fontSize={11}
                style={{ fill: "var(--muted)" }}
              >
                {reference.label}
              </text>
            </g>
          )}

          {x.map((label, i) => (
            <text
              key={label}
              x={px(i)}
              y={HEIGHT - 10}
              textAnchor="middle"
              fontSize={12}
              style={{ fill: active === i ? "var(--fg)" : "var(--muted)" }}
            >
              {label}
            </text>
          ))}

          {active !== null && (
            <line
              x1={px(active)}
              x2={px(active)}
              y1={MARGIN.top}
              y2={MARGIN.top + plotHeight}
              strokeWidth={1}
              style={{ stroke: "var(--faint)" }}
            />
          )}

          {drawOrder.map((s) => (
            <g
              key={s.name}
              style={{ opacity: focused && s.name !== focused ? 0.25 : 1, transition: "opacity 150ms" }}
            >
              <polyline
                points={s.values.map((v, i) => `${px(i)},${py(v)}`).join(" ")}
                fill="none"
                strokeWidth={2}
                strokeLinejoin="round"
                strokeLinecap="round"
                style={{ stroke: colorOf(s) }}
              />
              {s.values.map((v, i) => (
                <circle
                  key={i}
                  cx={px(i)}
                  cy={py(v)}
                  r={active === i ? 5 : 4}
                  strokeWidth={2}
                  style={{ fill: colorOf(s), stroke: "var(--bg)" }}
                />
              ))}
            </g>
          ))}

          {highlighted && (
            <text x={px(last) + 12} y={py(highlighted.values[last])} dominantBaseline="middle" fontSize={12}>
              <tspan fontWeight={600} className="tabular-nums" style={{ fill: "var(--fg)" }}>
                {format(highlighted.values[last])}
              </tspan>
              <tspan dx={6} style={{ fill: "var(--muted)" }}>
                {highlighted.name}
              </tspan>
            </text>
          )}

          <rect
            x={MARGIN.left}
            y={MARGIN.top}
            width={plotWidth}
            height={plotHeight}
            fill="transparent"
            onPointerMove={pointAt}
            onPointerDown={pointAt}
            onPointerLeave={() => setActive(null)}
          />
        </svg>

        {active !== null && (
          <div
            aria-hidden
            className="pointer-events-none absolute top-2 z-10 rounded-lg border border-line bg-bg px-3 py-2 text-xs shadow-sm"
            style={{
              left: px(active),
              transform: px(active) > width / 2 ? "translateX(calc(-100% - 12px))" : "translateX(12px)",
            }}
          >
            <p className="mb-1.5 text-muted">{x[active]}</p>
            <ul className="space-y-1">
              {series.map((s) => (
                <li key={s.name} className="flex items-center gap-2 whitespace-nowrap">
                  <span className="h-0.5 w-3 shrink-0 rounded-full" style={{ background: colorOf(s) }} />
                  <span className="font-semibold tabular-nums text-fg">{format(s.values[active])}</span>
                  <span className="text-muted">{s.name}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {caption && <figcaption className="mt-2 text-center text-sm text-muted">{caption}</figcaption>}

      {/* The chart's values for screen readers, which skip the SVG and the hover tooltip. */}
      <table className="sr-only">
        <thead>
          <tr>
            <th scope="col" />
            {x.map((label) => (
              <th key={label} scope="col">
                {label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {series.map((s) => (
            <tr key={s.name}>
              <th scope="row">{s.name}</th>
              {s.values.map((v, i) => (
                <td key={i}>{format(v)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}
