import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const TIER_CONFIG: Record<string, { color: string; bg: string; label: string }> = {
  GOD_TIER: { color: "#ffb020", bg: "#2a1f00", label: "GOD TIER" },
  HIGH_AURA: { color: "#39ff88", bg: "#001a0d", label: "HIGH AURA" },
  BASED: { color: "#22d3ee", bg: "#001a22", label: "BASED" },
  MID: { color: "#d1f5d3", bg: "#0a1a0c", label: "MID" },
  LOW_AURA: { color: "#5b7a5f", bg: "#0a120b", label: "LOW AURA" },
  NO_AURA: { color: "#ff4d6d", bg: "#1a0008", label: "NO AURA" },
};

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ mint: string }> },
) {
  const { mint } = await params;

  // Fetch aura data from our own API
  const host = req.headers.get("host") ?? "localhost:3000";
  const proto = req.headers.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  let symbol = "TOKEN";
  let score = 0;
  let tier = "MID";
  let buyPressure = 50;
  let holders = 0;
  let priceChange = 0;

  try {
    const res = await fetch(`${proto}://${host}/api/aura/${mint}`, {
      cache: "no-store",
    });
    if (res.ok) {
      const data = await res.json();
      symbol = data.symbol ?? "TOKEN";
      score = data.score ?? 0;
      tier = data.tier ?? "MID";
      buyPressure = data.signals?.buyPressurePct ?? 50;
      holders = data.signals?.totalHolders ?? 0;
      priceChange = data.signals?.priceChange24h ?? 0;
    }
  } catch {
    // Use defaults
  }

  const config = TIER_CONFIG[tier] ?? TIER_CONFIG.MID!;

  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          background: `linear-gradient(135deg, #0a0f0d 0%, ${config.bg} 50%, #0a0f0d 100%)`,
          fontFamily: "monospace",
          position: "relative",
        }}
      >
        {/* Scanline overlay */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "repeating-linear-gradient(to bottom, rgba(57,255,136,0.02) 0px, rgba(57,255,136,0.02) 1px, transparent 1px, transparent 3px)",
            display: "flex",
          }}
        />

        {/* Top bar */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "24px 40px",
            borderBottom: "1px solid rgba(57,255,136,0.15)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                backgroundColor: "#39ff88",
                boxShadow: "0 0 8px rgba(57,255,136,0.6)",
                display: "flex",
              }}
            />
            <span
              style={{
                color: "#39ff88",
                fontSize: "14px",
                letterSpacing: "0.35em",
                fontWeight: 700,
              }}
            >
              AURA
            </span>
            <span
              style={{
                color: "rgba(209,245,211,0.4)",
                fontSize: "11px",
                letterSpacing: "0.2em",
              }}
            >
              // BAGS.FM TERMINAL
            </span>
          </div>
          <span
            style={{
              color: "rgba(209,245,211,0.3)",
              fontSize: "11px",
              letterSpacing: "0.2em",
            }}
          >
            VIBE CHECK PROTOCOL
          </span>
        </div>

        {/* Main content */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "16px",
          }}
        >
          {/* Tier badge */}
          <div
            style={{
              display: "flex",
              padding: "6px 20px",
              border: `1px solid ${config.color}80`,
              color: config.color,
              fontSize: "13px",
              letterSpacing: "0.3em",
              fontWeight: 700,
            }}
          >
            {config.label}
          </div>

          {/* Token symbol */}
          <div
            style={{
              color: "white",
              fontSize: "42px",
              fontWeight: 700,
              letterSpacing: "0.1em",
            }}
          >
            ${symbol}
          </div>

          {/* Giant score */}
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              gap: "8px",
            }}
          >
            <span
              style={{
                color: config.color,
                fontSize: "160px",
                fontWeight: 700,
                lineHeight: 1,
                letterSpacing: "-0.05em",
                textShadow: `0 0 60px ${config.color}60`,
              }}
            >
              {score}
            </span>
            <span
              style={{
                color: "rgba(209,245,211,0.4)",
                fontSize: "28px",
                letterSpacing: "0.2em",
              }}
            >
              /100
            </span>
          </div>
        </div>

        {/* Bottom stats */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            display: "flex",
            justifyContent: "center",
            gap: "48px",
            padding: "24px 40px",
            borderTop: "1px solid rgba(57,255,136,0.15)",
          }}
        >
          <StatBox label="BUY PRESSURE" value={`${buyPressure.toFixed(0)}%`} />
          <StatBox label="HOLDERS" value={formatNum(holders)} />
          <StatBox
            label="24H"
            value={`${priceChange > 0 ? "+" : ""}${priceChange.toFixed(1)}%`}
          />
          <StatBox label="AURA" value={config.label} color={config.color} />
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    },
  );
}

function StatBox({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color?: string;
}) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "4px",
      }}
    >
      <span
        style={{
          color: "rgba(209,245,211,0.35)",
          fontSize: "10px",
          letterSpacing: "0.25em",
        }}
      >
        {label}
      </span>
      <span
        style={{
          color: color ?? "#d1f5d3",
          fontSize: "18px",
          fontWeight: 700,
          letterSpacing: "0.1em",
        }}
      >
        {value}
      </span>
    </div>
  );
}

function formatNum(n: number): string {
  if (n >= 1e6) return (n / 1e6).toFixed(1) + "M";
  if (n >= 1e3) return (n / 1e3).toFixed(1) + "K";
  return n.toLocaleString();
}
