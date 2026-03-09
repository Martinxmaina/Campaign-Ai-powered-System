"use client";

interface CountyData {
    id: string;
    name: string;
    support: number; // 0–100
}

const counties: CountyData[] = [
    { id: "nairobi", name: "Nairobi", support: 68 },
    { id: "mombasa", name: "Mombasa", support: 72 },
    { id: "kisumu", name: "Kisumu", support: 45 },
    { id: "nakuru", name: "Nakuru", support: 58 },
    { id: "eldoret", name: "Uasin Gishu (Eldoret)", support: 65 },
    { id: "kiambu", name: "Kiambu", support: 74 },
    { id: "machakos", name: "Machakos", support: 52 },
    { id: "meru", name: "Meru", support: 61 },
    { id: "kakamega", name: "Kakamega", support: 49 },
    { id: "nyeri", name: "Nyeri", support: 70 },
    { id: "kilifi", name: "Kilifi", support: 55 },
    { id: "bungoma", name: "Bungoma", support: 48 },
    { id: "siaya", name: "Siaya", support: 43 },
    { id: "garissa", name: "Garissa", support: 38 },
    { id: "turkana", name: "Turkana", support: 32 },
    { id: "kajiado", name: "Kajiado", support: 59 },
    { id: "kirinyaga", name: "Kirinyaga", support: 67 },
    { id: "embu", name: "Embu", support: 63 },
];

function getColor(support: number): string {
    if (support >= 70) return "#1d4ed8"; // deep blue
    if (support >= 60) return "#3b82f6"; // blue
    if (support >= 50) return "#93c5fd"; // light blue
    if (support >= 40) return "#dbeafe"; // very light blue
    return "#f1f5f9";                    // near-white (low/opposition)
}

function getTextColor(support: number): string {
    return support >= 55 ? "white" : "#334155";
}

interface TooltipState {
    name: string;
    support: number;
    x: number;
    y: number;
}

import { useState } from "react";

export default function KenyaHeatmap() {
    const [tooltip, setTooltip] = useState<TooltipState | null>(null);
    const [selected, setSelected] = useState<string | null>(null);

    const countyMap = Object.fromEntries(counties.map((c) => [c.id, c]));

    const handleEnter = (id: string, e: React.MouseEvent) => {
        const c = countyMap[id];
        if (!c) return;
        setTooltip({ name: c.name, support: c.support, x: e.clientX, y: e.clientY });
    };
    const handleMove = (e: React.MouseEvent) => {
        setTooltip((t) => t ? { ...t, x: e.clientX, y: e.clientY } : null);
    };
    const handleLeave = () => setTooltip(null);
    const handleClick = (id: string) => setSelected((s) => s === id ? null : id);

    const pathStyle = (id: string) => {
        const c = countyMap[id];
        const support = c?.support ?? 40;
        const isSelected = selected === id;
        return {
            fill: getColor(support),
            stroke: isSelected ? "#1e40af" : "#94a3b8",
            strokeWidth: isSelected ? 2 : 0.8,
            cursor: "pointer",
            transition: "fill 0.2s, stroke 0.2s",
            filter: isSelected ? "drop-shadow(0 0 4px rgba(37,99,235,0.5))" : undefined,
        };
    };

    return (
        <div className="relative w-full select-none" onMouseMove={handleMove}>
            {/* Legend */}
            <div className="flex items-center gap-4 mb-4 flex-wrap">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
                    Support Level
                </span>
                {[
                    { label: "70%+", color: "#1d4ed8" },
                    { label: "60–70%", color: "#3b82f6" },
                    { label: "50–60%", color: "#93c5fd" },
                    { label: "40–50%", color: "#dbeafe" },
                    { label: "< 40%", color: "#f1f5f9", border: true },
                ].map((l) => (
                    <div key={l.label} className="flex items-center gap-1.5">
                        <div
                            className="w-3.5 h-3.5 rounded-sm"
                            style={{
                                backgroundColor: l.color,
                                border: l.border ? "1px solid #cbd5e1" : undefined,
                            }}
                        />
                        <span className="text-[11px] text-slate-600">{l.label}</span>
                    </div>
                ))}
            </div>

            {/* SVG Map of Kenya (simplified county shapes) */}
            <svg
                viewBox="0 0 520 600"
                className="w-full h-auto max-h-[480px]"
                style={{ fontFamily: "inherit" }}
            >
                {/* ── County paths (simplified Kenya approximate geometry) ── */}

                {/* Turkana - large NW */}
                <path id="turkana" style={pathStyle("turkana")}
                    d="M60,30 L200,30 L220,80 L210,140 L170,160 L120,180 L70,160 L50,120 Z"
                    onMouseEnter={(e) => handleEnter("turkana", e)} onMouseLeave={handleLeave} onClick={() => handleClick("turkana")} />

                {/* West Pokot */}
                <path style={{ fill: getColor(35), stroke: "#94a3b8", strokeWidth: 0.8, cursor: "pointer" }}
                    d="M120,180 L170,160 L210,140 L220,200 L180,220 L130,210 Z"
                    onMouseEnter={() => setTooltip({ name: "West Pokot", support: 35, x: 0, y: 0 })} onMouseLeave={handleLeave} />

                {/* Trans-Nzoia */}
                <path style={{ fill: getColor(50), stroke: "#94a3b8", strokeWidth: 0.8, cursor: "pointer" }}
                    d="M130,210 L180,220 L190,260 L140,265 L120,240 Z"
                    onMouseEnter={() => setTooltip({ name: "Trans-Nzoia", support: 50, x: 0, y: 0 })} onMouseLeave={handleLeave} />

                {/* Uasin Gishu (Eldoret) */}
                <path id="eldoret" style={pathStyle("eldoret")}
                    d="M140,265 L190,260 L205,295 L165,310 L140,295 Z"
                    onMouseEnter={(e) => handleEnter("eldoret", e)} onMouseLeave={handleLeave} onClick={() => handleClick("eldoret")} />

                {/* Kakamega */}
                <path id="kakamega" style={pathStyle("kakamega")}
                    d="M80,260 L140,265 L140,295 L120,315 L75,300 L65,275 Z"
                    onMouseEnter={(e) => handleEnter("kakamega", e)} onMouseLeave={handleLeave} onClick={() => handleClick("kakamega")} />

                {/* Bungoma */}
                <path id="bungoma" style={pathStyle("bungoma")}
                    d="M55,230 L120,240 L140,265 L80,260 L65,245 Z"
                    onMouseEnter={(e) => handleEnter("bungoma", e)} onMouseLeave={handleLeave} onClick={() => handleClick("bungoma")} />

                {/* Siaya */}
                <path id="siaya" style={pathStyle("siaya")}
                    d="M65,300 L120,315 L115,345 L70,355 L55,330 Z"
                    onMouseEnter={(e) => handleEnter("siaya", e)} onMouseLeave={handleLeave} onClick={() => handleClick("siaya")} />

                {/* Kisumu */}
                <path id="kisumu" style={pathStyle("kisumu")}
                    d="M115,345 L140,295 L165,310 L175,345 L150,370 L120,365 Z"
                    onMouseEnter={(e) => handleEnter("kisumu", e)} onMouseLeave={handleLeave} onClick={() => handleClick("kisumu")} />

                {/* Nandi */}
                <path style={{ fill: getColor(55), stroke: "#94a3b8", strokeWidth: 0.8 }}
                    d="M165,310 L205,295 L220,330 L195,355 L175,345 Z"
                    onMouseEnter={() => setTooltip({ name: "Nandi", support: 55, x: 0, y: 0 })} onMouseLeave={handleLeave} />

                {/* Nakuru */}
                <path id="nakuru" style={pathStyle("nakuru")}
                    d="M195,355 L220,330 L265,340 L285,375 L255,400 L220,390 L200,375 Z"
                    onMouseEnter={(e) => handleEnter("nakuru", e)} onMouseLeave={handleLeave} onClick={() => handleClick("nakuru")} />

                {/* Baringo */}
                <path style={{ fill: getColor(42), stroke: "#94a3b8", strokeWidth: 0.8 }}
                    d="M220,200 L280,200 L295,260 L265,280 L220,270 L210,240 Z"
                    onMouseEnter={() => setTooltip({ name: "Baringo", support: 42, x: 0, y: 0 })} onMouseLeave={handleLeave} />

                {/* Laikipia */}
                <path style={{ fill: getColor(58), stroke: "#94a3b8", strokeWidth: 0.8 }}
                    d="M280,200 L340,190 L360,240 L320,260 L295,260 Z"
                    onMouseEnter={() => setTooltip({ name: "Laikipia", support: 58, x: 0, y: 0 })} onMouseLeave={handleLeave} />

                {/* Rift Valley / Samburu */}
                <path style={{ fill: getColor(37), stroke: "#94a3b8", strokeWidth: 0.8 }}
                    d="M280,60 L400,50 L420,130 L380,160 L340,190 L280,200 L265,150 L270,100 Z"
                    onMouseEnter={() => setTooltip({ name: "Samburu", support: 37, x: 0, y: 0 })} onMouseLeave={handleLeave} />

                {/* Nyeri */}
                <path id="nyeri" style={pathStyle("nyeri")}
                    d="M340,190 L380,160 L410,200 L395,250 L360,240 Z"
                    onMouseEnter={(e) => handleEnter("nyeri", e)} onMouseLeave={handleLeave} onClick={() => handleClick("nyeri")} />

                {/* Meru */}
                <path id="meru" style={pathStyle("meru")}
                    d="M360,240 L395,250 L430,240 L450,280 L410,300 L380,285 L360,265 Z"
                    onMouseEnter={(e) => handleEnter("meru", e)} onMouseLeave={handleLeave} onClick={() => handleClick("meru")} />

                {/* Kirinyaga */}
                <path id="kirinyaga" style={pathStyle("kirinyaga")}
                    d="M320,260 L360,265 L355,300 L320,305 L305,285 Z"
                    onMouseEnter={(e) => handleEnter("kirinyaga", e)} onMouseLeave={handleLeave} onClick={() => handleClick("kirinyaga")} />

                {/* Embu */}
                <path id="embu" style={pathStyle("embu")}
                    d="M355,300 L380,285 L410,300 L420,330 L390,345 L360,335 Z"
                    onMouseEnter={(e) => handleEnter("embu", e)} onMouseLeave={handleLeave} onClick={() => handleClick("embu")} />

                {/* Tharaka-Nithi */}
                <path style={{ fill: getColor(56), stroke: "#94a3b8", strokeWidth: 0.8 }}
                    d="M380,285 L450,280 L465,310 L440,330 L420,330 L410,300 Z"
                    onMouseEnter={() => setTooltip({ name: "Tharaka-Nithi", support: 56, x: 0, y: 0 })} onMouseLeave={handleLeave} />

                {/* Kiambu */}
                <path id="kiambu" style={pathStyle("kiambu")}
                    d="M305,285 L320,305 L315,335 L290,340 L275,315 L285,290 Z"
                    onMouseEnter={(e) => handleEnter("kiambu", e)} onMouseLeave={handleLeave} onClick={() => handleClick("kiambu")} />

                {/* Nairobi */}
                <path id="nairobi" style={{ ...pathStyle("nairobi"), strokeWidth: 1.5 }}
                    d="M290,340 L315,335 L320,355 L300,365 L285,360 Z"
                    onMouseEnter={(e) => handleEnter("nairobi", e)} onMouseLeave={handleLeave} onClick={() => handleClick("nairobi")} />

                {/* Kajiado */}
                <path id="kajiado" style={pathStyle("kajiado")}
                    d="M255,400 L285,375 L300,365 L320,355 L340,370 L360,420 L320,450 L275,440 L250,420 Z"
                    onMouseEnter={(e) => handleEnter("kajiado", e)} onMouseLeave={handleLeave} onClick={() => handleClick("kajiado")} />

                {/* Machakos */}
                <path id="machakos" style={pathStyle("machakos")}
                    d="M320,355 L360,335 L390,345 L420,380 L410,420 L380,435 L360,420 L340,370 Z"
                    onMouseEnter={(e) => handleEnter("machakos", e)} onMouseLeave={handleLeave} onClick={() => handleClick("machakos")} />

                {/* Makueni */}
                <path style={{ fill: getColor(48), stroke: "#94a3b8", strokeWidth: 0.8 }}
                    d="M360,420 L410,420 L430,460 L400,485 L360,475 L340,450 Z"
                    onMouseEnter={() => setTooltip({ name: "Makueni", support: 48, x: 0, y: 0 })} onMouseLeave={handleLeave} />

                {/* Garissa */}
                <path id="garissa" style={pathStyle("garissa")}
                    d="M420,130 L490,120 L510,200 L490,280 L450,280 L430,240 L410,200 L380,160 Z"
                    onMouseEnter={(e) => handleEnter("garissa", e)} onMouseLeave={handleLeave} onClick={() => handleClick("garissa")} />

                {/* Marsabit - far north */}
                <path style={{ fill: getColor(30), stroke: "#94a3b8", strokeWidth: 0.8 }}
                    d="M200,30 L400,50 L420,130 L380,160 L340,190 L280,200 L220,200 L210,140 L200,80 Z"
                    onMouseEnter={() => setTooltip({ name: "Marsabit / Isiolo", support: 30, x: 0, y: 0 })} onMouseLeave={handleLeave} />

                {/* Tana River */}
                <path style={{ fill: getColor(36), stroke: "#94a3b8", strokeWidth: 0.8 }}
                    d="M450,280 L490,280 L500,360 L470,390 L440,380 L420,330 L440,330 Z"
                    onMouseEnter={() => setTooltip({ name: "Tana River", support: 36, x: 0, y: 0 })} onMouseLeave={handleLeave} />

                {/* Kilifi */}
                <path id="kilifi" style={pathStyle("kilifi")}
                    d="M440,380 L470,390 L490,430 L470,470 L440,475 L420,450 L430,420 L420,380 Z"
                    onMouseEnter={(e) => handleEnter("kilifi", e)} onMouseLeave={handleLeave} onClick={() => handleClick("kilifi")} />

                {/* Kwale */}
                <path style={{ fill: getColor(53), stroke: "#94a3b8", strokeWidth: 0.8 }}
                    d="M400,485 L430,475 L440,510 L410,525 L385,510 Z"
                    onMouseEnter={() => setTooltip({ name: "Kwale", support: 53, x: 0, y: 0 })} onMouseLeave={handleLeave} />

                {/* Mombasa */}
                <path id="mombasa" style={{ ...pathStyle("mombasa"), strokeWidth: 1.5 }}
                    d="M440,475 L470,470 L480,495 L455,510 L440,510 Z"
                    onMouseEnter={(e) => handleEnter("mombasa", e)} onMouseLeave={handleLeave} onClick={() => handleClick("mombasa")} />

                {/* Nairobi label */}
                <text x="295" y="356" textAnchor="middle" fontSize="6" fontWeight="700"
                    fill={getTextColor(68)} pointerEvents="none">NBI</text>

                {/* Mombasa label */}
                <text x="456" y="496" textAnchor="middle" fontSize="5.5" fontWeight="700"
                    fill="white" pointerEvents="none">MSA</text>

                {/* Kisumu label */}
                <text x="140" y="352" textAnchor="middle" fontSize="6" fontWeight="700"
                    fill={getTextColor(45)} pointerEvents="none">KSM</text>

                {/* Nakuru label */}
                <text x="240" y="375" textAnchor="middle" fontSize="6" fontWeight="700"
                    fill={getTextColor(58)} pointerEvents="none">NKR</text>
            </svg>

            {/* Floating tooltip */}
            {tooltip && (tooltip.x > 0 || tooltip.y > 0) && (
                <div
                    className="fixed z-50 pointer-events-none bg-slate-900 text-white text-xs px-3 py-2 rounded-lg shadow-xl"
                    style={{ left: tooltip.x + 12, top: tooltip.y - 40 }}
                >
                    <p className="font-semibold">{tooltip.name}</p>
                    <p className="text-slate-300 mt-0.5">Support: <span className="text-white font-bold">{tooltip.support}%</span></p>
                    <div className="mt-1.5 w-full bg-slate-700 rounded-full h-1.5">
                        <div
                            className="h-full rounded-full"
                            style={{ width: `${tooltip.support}%`, backgroundColor: tooltip.support >= 60 ? "#60a5fa" : tooltip.support >= 50 ? "#93c5fd" : "#fbbf24" }}
                        />
                    </div>
                </div>
            )}

            {/* Selected county detail */}
            {selected && countyMap[selected] && (
                <div className="mt-3 px-4 py-3 bg-blue-50 border border-blue-200 rounded-xl">
                    <p className="text-sm font-semibold text-blue-900">{countyMap[selected].name}</p>
                    <div className="flex items-center gap-4 mt-1 text-xs text-blue-700">
                        <span>Voter support: <strong>{countyMap[selected].support}%</strong></span>
                        <span className={`font-medium ${countyMap[selected].support >= 60 ? "text-emerald-600" : countyMap[selected].support >= 50 ? "text-amber-600" : "text-red-500"}`}>
                            {countyMap[selected].support >= 60 ? "Strong Support" : countyMap[selected].support >= 50 ? "Swing County" : "Opposition Area"}
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
}
