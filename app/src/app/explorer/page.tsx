import type { Metadata } from "next";
import DataTable from "@/components/DataTable";
export const metadata: Metadata = { title: "数据浏览器", description: "按指标、地区、年份筛选全部分省统计数据，下载与筛选结果一致的CSV。", alternates: { canonical: "/explorer/" } };
export default function Explorer() {
  return (
    <div className="wrap pt-8">
      <h1 className="text-2xl font-bold">数据浏览器</h1>
      <p className="text-sm text-[--muted] mt-1 mb-4">选择一个或多个指标，按地区与年份筛选。每一行都可查看官方来源；下载的 CSV 与当前筛选结果完全一致。完整数据集：<a className="underline" href="/downloads/observations.csv">observations.csv</a>。</p>
      <DataTable initialIndicators={["population"]} allowIndicatorPick />
    </div>
  );
}
