import site from "@/data/site.json";

export type Region = {
  geo_code: string; nbs_code: string; level: "national" | "province";
  name_zh: string; short_zh: string; name_en: string; region7: string | null; zone4: string | null;
};
export type Finding = { zh: string; type: "fact" | "calculation" };
export type Indicator = {
  id: string; core: boolean; category: string; name_zh: string; name_en: string; unit: string; unit_en: string;
  agg: string; definition_zh: string; official_name_zh: string; years: number[]; first_year: number;
  latest_province_year: number; latest_national_year: number; national_latest: number | null; national_prev: number | null;
  yoy_comparable: boolean; latest_province_coverage: number; continuity_since_2015: number; valid_observations: number;
  ranking: { geo: string; rank: number | null; value: number | null }[]; findings: Finding[];
  source: {
    province_table: string; national_table: string; province_url: string | null; national_url: string | null;
    province_transformation: string; national_transformation: string; province_orig_unit: string; national_orig_unit: string;
    retrieved_at: string | null; province_cid: string; national_cid: string;
    province_ids: Record<string, string>; national_ids: Record<string, string>;
  };
};
export type SeriesFile = {
  id: string; years: number[];
  matrix: Record<string, Record<string, number | null>>;
  status: Record<string, Record<string, string>>; // e.g. "fv" = final+verified
};

type Site = {
  generated_at: string; methodology_version: string; regions: Region[]; indicators: Indicator[];
  home_findings: { indicator: string; name_zh: string; text: string }[];
  stats: Record<string, number>;
};
export const SITE = site as unknown as Site;
export const REGIONS = SITE.regions;
export const PROVINCES = REGIONS.filter((r) => r.level === "province");
export const GEO: Record<string, Region> = Object.fromEntries(REGIONS.map((r) => [r.geo_code, r]));
export const INDICATORS = SITE.indicators;
export const CORE = INDICATORS.filter((i) => i.core);
export const getIndicator = (id: string) => INDICATORS.find((i) => i.id === id);

export const REGION7 = ["华北", "东北", "华东", "华中", "华南", "西南", "西北"] as const;
export const CATEGORIES: { id: string; zh: string; en: string; blurb: string }[] = [
  { id: "population", zh: "人口", en: "Population", blurb: "常住人口、出生率、城镇化与老龄化" },
  { id: "economy", zh: "经济", en: "Economy", blurb: "地区生产总值、人均GDP、收入与消费" },
  { id: "education", zh: "教育", en: "Education", blurb: "普通高等学校与在校生" },
  { id: "health", zh: "医疗", en: "Health", blurb: "执业（助理）医师与医疗机构床位" },
];

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "").replace(/\/$/, "");
export const STATUS_LABEL: Record<string, string> = { f: "终值", p: "初步", r: "修订", u: "未知" };
export const VERIF_LABEL: Record<string, string> = { v: "已独立核验", p: "部分核验", u: "未逐点核验" };

const DECIMALS: Record<string, number> = { "万人": 0, "‰": 2, "%": 2, "亿元": 1, "元": 0, "人": 0, "所": 0, "人/千人": 2, "张/千人": 2 };
export function fmt(v: number | null | undefined, unit?: string): string {
  if (v === null || v === undefined || Number.isNaN(v)) return "—";
  const d = unit ? DECIMALS[unit] ?? 2 : 2;
  return v.toLocaleString("zh-CN", { minimumFractionDigits: d, maximumFractionDigits: d });
}
export function citation(ind: Indicator, retrieved?: string | null): string {
  const d = (retrieved || SITE.generated_at).slice(0, 10);
  return `国家统计局. ${ind.official_name_zh}（分省年度数据、年度数据）. 国家数据 data.stats.gov.cn. 获取日期 ${d}. 经 China Data Atlas | 中国数据地图 整理（方法版本 ${SITE.methodology_version}）.`;
}
