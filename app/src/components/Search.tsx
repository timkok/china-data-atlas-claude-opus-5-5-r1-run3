"use client";
import { useMemo, useRef, useState } from "react";
import { INDICATORS, PROVINCES } from "@/lib/data";

const ALIASES: Record<string, string> = {
  population: "人口 常住 总人口 population 人数", birth_rate: "出生 生育 新生儿 birth fertility", urbanization_rate: "城镇化 城市化 城镇人口 urban",
  population_65plus: "老龄化 老年 65岁 养老 aging elderly", gdp: "GDP 经济总量 生产总值 地区生产总值", gdp_per_capita: "人均GDP 人均 生产总值 per capita",
  disposable_income: "收入 可支配 工资 income", retail_sales: "消费 零售 社零 retail", higher_education_students: "大学生 在校生 高校 本科 专科 university students",
  higher_education_institutions: "大学 高校 学校数量 university", physicians_per_1000: "医生 医师 执业医师 doctor physician", hospital_beds_per_1000: "床位 病床 医院 bed hospital",
  death_rate: "死亡 death", natural_growth_rate: "自然增长 人口增长 负增长 growth",
};

export default function Search({ autoFocus = false, compact = false }: { autoFocus?: boolean; compact?: boolean }) {
  const [q, setQ] = useState("");
  const [active, setActive] = useState(0);
  const ref = useRef<HTMLInputElement>(null);
  const results = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return [];
    const inds = INDICATORS.filter((i) => `${i.name_zh} ${i.name_en} ${i.id} ${ALIASES[i.id] || ""}`.toLowerCase().includes(t)).map((i) => ({ href: `/indicators/${i.id}/`, label: i.name_zh, sub: `${i.core ? "核心指标" : "扩展指标"} · ${i.unit}` }));
    const regs = PROVINCES.filter((p) => `${p.name_zh} ${p.name_en} ${p.geo_code}`.toLowerCase().includes(t)).map((p) => ({ href: `/regions/${p.geo_code}/`, label: p.name_zh, sub: `省级行政区 · ${p.region7}` }));
    return [...inds, ...regs].slice(0, 10);
  }, [q]);
  const go = (href: string) => { window.location.href = href; };
  return (
    <div className="relative w-full" role="search">
      <label htmlFor={compact ? "q2" : "q"} className="sr-only">搜索指标或省份</label>
      <input id={compact ? "q2" : "q"} ref={ref} autoFocus={autoFocus} data-testid="site-search" value={q} autoComplete="off"
        onChange={(e) => { setQ(e.target.value); setActive(0); }}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown") { e.preventDefault(); setActive((a) => Math.min(a + 1, results.length - 1)); }
          if (e.key === "ArrowUp") { e.preventDefault(); setActive((a) => Math.max(a - 1, 0)); }
          if (e.key === "Enter" && results[active]) go(results[active].href);
          if (e.key === "Escape") setQ("");
        }}
        role="combobox" aria-expanded={results.length > 0} aria-controls="search-results" aria-activedescendant={results[active] ? `sr-${active}` : undefined}
        placeholder={compact ? "搜索指标或省份" : "搜索指标或省份，例如：人口、人均GDP、医生、广东"}
        className={`w-full border border-[var(--line)] bg-white rounded-md ${compact ? "px-3 py-1.5 text-sm" : "px-4 py-3 text-base"} focus:outline-none focus:ring-2 focus:ring-[var(--accent)]`} />
      {results.length > 0 && (
        <ul id="search-results" role="listbox" className="absolute z-40 left-0 right-0 mt-1 bg-white border border-[var(--line)] rounded-md shadow-lg overflow-hidden" data-testid="search-results">
          {results.map((r, i) => (
            <li key={r.href} id={`sr-${i}`} role="option" aria-selected={i === active}>
              <a href={r.href} className={`flex justify-between px-3 py-2 text-sm ${i === active ? "bg-[var(--paper)]" : ""}`}>{r.label}<span className="text-xs text-[var(--muted)]">{r.sub}</span></a>
            </li>
          ))}
        </ul>
      )}
      {q.trim() && results.length === 0 && <p className="absolute mt-1 text-xs text-[var(--muted)] bg-white px-2">无匹配结果。当前收录 {INDICATORS.length} 个指标、31 个省级行政区。</p>}
    </div>
  );
}
