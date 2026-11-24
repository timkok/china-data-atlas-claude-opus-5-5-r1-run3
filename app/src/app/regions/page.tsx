import type { Metadata } from "next";
import { PROVINCES, REGION7 } from "@/lib/data";
export const metadata: Metadata = { title: "31个省级行政区", description: "按七大地区浏览中国大陆31个省级行政区的统计数据。", alternates: { canonical: "/regions/" } };
export default function Regions() {
  return (
    <div className="wrap pt-8">
      <h1 className="text-2xl font-bold">地区</h1>
      <p className="text-sm text-[var(--muted)] mt-1">统计覆盖中国大陆31个省级行政区（行政区划代码 GB/T 2260）。香港、澳门特别行政区和台湾省的数据不在本数据库统计范围内，这是统计覆盖说明，不涉及地理归属判断。</p>
      {REGION7.map((r) => (
        <section key={r} className="mt-6">
          <h2 className="font-semibold">{r}</h2>
          <div className="flex flex-wrap gap-2 mt-2">{PROVINCES.filter((p) => p.region7 === r).map((p) => <a key={p.geo_code} className="chip" href={`/regions/${p.geo_code}/`}>{p.name_zh}</a>)}</div>
        </section>
      ))}
      <p className="text-xs text-[var(--muted)] mt-6">七大地区分组：华北（京津冀晋蒙）、东北（辽吉黑）、华东（沪苏浙皖闽赣鲁）、华中（豫鄂湘）、华南（粤桂琼）、西南（渝川贵云藏）、西北（陕甘青宁新）。这是常用地理分区，非官方统计分组。</p>
    </div>
  );
}
