import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CATEGORIES, GEO, INDICATORS, PROVINCES, fmt } from "@/lib/data";
import { readSeries } from "@/lib/server";

export function generateStaticParams() { return PROVINCES.map((p) => ({ code: p.geo_code })); }
export async function generateMetadata({ params }: { params: Promise<{ code: string }> }): Promise<Metadata> {
  const { code } = await params; const g = GEO[code]; if (!g) return {};
  return { title: `${g.name_zh}统计数据：人口、GDP、收入、教育、医疗`, description: `${g.name_zh}最新可用的常住人口、人均地区生产总值、居民人均可支配收入、高等教育与医疗资源等指标及全国排名，来源国家统计局。`, alternates: { canonical: `/regions/${code}/` } };
}
export default async function RegionPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params; const g = GEO[code];
  if (!g || g.level !== "province") notFound();
  return (
    <div className="wrap pt-8">
      <nav className="text-xs text-[--muted]"><a href="/">首页</a> / <a href="/regions/">地区</a> / {g.short_zh}</nav>
      <h1 className="text-2xl font-bold mt-2">{g.name_zh}</h1>
      <p className="text-sm text-[--muted]">{g.name_en} · 代码 {g.geo_code} · {g.region7}地区 · 国家统计局四大区域：{g.zone4}</p>
      {CATEGORIES.map((c) => (
        <section key={c.id} className="sec">
          <h2>{c.zh}</h2>
          <div className="overflow-x-auto"><table className="tbl mt-2" data-testid="region-table">
            <thead><tr><th>指标</th><th className="text-right">最新值</th><th>单位</th><th className="text-right">统计年份</th><th className="text-right">全国排名</th><th className="text-right">全国同年</th><th>来源</th></tr></thead>
            <tbody>{INDICATORS.filter((i) => i.category === c.id).map((i) => {
              const s = readSeries(i.id); const y = i.latest_province_year;
              const v = s.matrix[code]?.[String(y)] ?? null; const nat = s.matrix["000000"]?.[String(y)] ?? null;
              const rk = i.ranking.find((r) => r.geo === code)?.rank;
              return (<tr key={i.id} data-ind={i.id}><td><a className="underline-offset-2 hover:underline" href={`/indicators/${i.id}/#rankings`}>{i.name_zh}</a></td>
                <td className="text-right tabular-nums font-semibold" data-value={v ?? ""}>{fmt(v, i.unit)}</td><td className="text-xs">{i.unit}</td><td className="text-right tabular-nums">{y}</td>
                <td className="text-right tabular-nums">{rk ? `${rk}/31` : "—"}</td><td className="text-right tabular-nums">{fmt(nat, i.unit)}</td>
                <td className="text-xs"><a className="underline" href={i.source.province_url || "#"} target="_blank" rel="noopener noreferrer" title={i.source.province_table}>国家统计局 ↗</a></td></tr>);
            })}</tbody></table></div>
        </section>
      ))}
      <p className="text-xs text-[--muted] mt-4">排名为降序（数值最高=第1名），不代表优劣。表格路径见各指标页“方法与来源”。</p>
    </div>
  );
}
