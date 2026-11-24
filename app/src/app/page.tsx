import Search from "@/components/Search";
import HomeFeature from "@/components/HomeFeature";
import { CATEGORIES, CORE, INDICATORS, SITE, fmt } from "@/lib/data";

export default function Home() {
  const s = SITE.stats;
  const latestSorted = [...INDICATORS].sort((a, b) => b.latest_province_year - a.latest_province_year || (a.core === b.core ? 0 : a.core ? -1 : 1));
  return (
    <>
      <section className="wrap pt-10 pb-8">
        <p className="kicker">China Data Atlas · 中国数据地图</p>
        <h1 className="text-3xl sm:text-4xl font-bold mt-2 leading-tight max-w-3xl">让中国的统计数据<br className="sm:hidden" />看得懂、查得到、能追溯</h1>
        <p className="mt-3 text-[--muted] max-w-2xl">我们把国家统计局发布的分省年度数据整理成可比较、可下载、可引用的数据产品。每个数字都标明统计年份、口径和官方表格位置；缺失就是缺失，绝不插值或估算。</p>
        <div className="mt-6 max-w-2xl"><Search autoFocus={false} /></div>
        <dl className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl" data-testid="home-stats">
          <div><dt className="text-xs text-[--muted]">核心指标</dt><dd className="text-2xl font-semibold tabular-nums">{s.core_indicators}<span className="text-sm font-normal"> / 12</span></dd></div>
          <div><dt className="text-xs text-[--muted]">省级行政区</dt><dd className="text-2xl font-semibold tabular-nums">{s.regions}</dd></div>
          <div><dt className="text-xs text-[--muted]">有效观测值</dt><dd className="text-2xl font-semibold tabular-nums">{s.unique_valid_observations.toLocaleString("zh-CN")}</dd></div>
          <div><dt className="text-xs text-[--muted]">年份范围</dt><dd className="text-2xl font-semibold tabular-nums">{s.earliest_year}—{s.latest_year}</dd></div>
        </dl>
      </section>

      <section className="wrap mt-4" aria-labelledby="cat-h">
        <h2 id="cat-h" className="sr-only">分类</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {CATEGORIES.map((c) => (
            <a key={c.id} href={`/indicators/#${c.id}`} className="block border border-[--line] bg-white rounded-lg p-4 hover:border-[--accent]">
              <div className="text-lg font-semibold">{c.zh} <span className="text-xs font-normal text-[--muted]">{c.en}</span></div>
              <div className="text-xs text-[--muted] mt-1">{c.blurb}</div>
              <div className="text-xs mt-2">{CORE.filter((i) => i.category === c.id).length} 项核心指标</div>
            </a>
          ))}
        </div>
      </section>

      <section className="wrap mt-10" aria-labelledby="feat-h">
        <h2 id="feat-h" className="text-xl font-bold mb-3">各省最新数据一览</h2>
        <HomeFeature />
      </section>

      <section className="wrap mt-10 grid lg:grid-cols-[3fr_2fr] gap-8">
        <div>
          <h2 className="text-xl font-bold mb-1">数据里的发现</h2>
          <p className="text-xs text-[--muted] mb-3">以下句子全部由数据自动计算生成，年份与单位如文所示；“倍数”“差值”属于衍生计算，不是官方发布值。</p>
          <ul className="space-y-3" data-testid="home-findings">
            {SITE.home_findings.map((f, i) => (
              <li key={i} className="border-l-2 border-[--accent] pl-3"><a href={`/indicators/${f.indicator}/`} className="hover:underline">{f.text}</a><div className="text-[11px] text-[--muted]">{f.name_zh} · 来源：国家统计局</div></li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="text-xl font-bold mb-3">最新数据年份</h2>
          <table className="tbl" data-testid="latest-table">
            <caption className="sr-only">各指标最新数据年份</caption>
            <thead><tr><th>指标</th><th className="text-right">全国</th><th className="text-right">省级</th><th className="text-right">省级覆盖</th></tr></thead>
            <tbody>{latestSorted.map((i) => (
              <tr key={i.id}><td><a className="hover:underline" href={`/indicators/${i.id}/`}>{i.name_zh}</a></td><td className="text-right tabular-nums">{i.latest_national_year}</td><td className="text-right tabular-nums">{i.latest_province_year}</td><td className="text-right tabular-nums">{Math.round(i.latest_province_coverage * 31)}/31</td></tr>
            ))}</tbody>
          </table>
        </div>
      </section>

      <section className="wrap mt-12 grid md:grid-cols-3 gap-6 text-sm">
        <div className="bg-white border border-[--line] rounded-lg p-4">
          <h3 className="font-semibold">来源可追溯</h3>
          <p className="text-[--muted] mt-1">全部数值取自国家统计局“国家数据”数据库，每个单元格都能查看表格路径、原始单位、转换公式和获取日期。</p>
        </div>
        <div className="bg-white border border-[--line] rounded-lg p-4">
          <h3 className="font-semibold">独立抽样核验</h3>
          <p className="text-[--muted] mt-1">另以《中国统计年鉴2025》表格逐点核对 {s.verified_observations} 个数据点（覆盖全部12项指标）。核对结果可下载：<a className="underline" href="/downloads/data_validation_samples.csv">核验样本 CSV</a>。</p>
        </div>
        <div className="bg-white border border-[--line] rounded-lg p-4">
          <h3 className="font-semibold">开放下载与引用</h3>
          <p className="text-[--muted] mt-1">每个指标页都可下载与筛选结果完全一致的 CSV，并提供推荐引用格式。<a className="underline" href="/explorer/">打开数据浏览器 →</a></p>
        </div>
      </section>
      <p className="wrap mt-6 text-xs text-[--muted]">全国最新：常住人口 {fmt(INDICATORS.find((i) => i.id === "population")?.national_latest, "万人")} 万人（{INDICATORS.find((i) => i.id === "population")?.latest_national_year}年末）。</p>
    </>
  );
}
