"use client";
import { useEffect, useRef } from "react";
import * as echarts from "echarts/core";
import { BarChart, LineChart, ScatterChart } from "echarts/charts";
import { GridComponent, TooltipComponent, LegendComponent, MarkLineComponent, DataZoomComponent, TitleComponent } from "echarts/components";
import { SVGRenderer } from "echarts/renderers";
import type { EChartsCoreOption } from "echarts/core";

echarts.use([BarChart, LineChart, ScatterChart, GridComponent, TooltipComponent, LegendComponent, MarkLineComponent, DataZoomComponent, TitleComponent, SVGRenderer]);

export default function EChart({ option, height = 360, label, onClickName }: { option: EChartsCoreOption; height?: number; label: string; onClickName?: (name: string) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const chart = useRef<echarts.ECharts | null>(null);
  useEffect(() => {
    if (!ref.current) return;
    chart.current = echarts.init(ref.current, undefined, { renderer: "svg" });
    const ro = new ResizeObserver(() => chart.current?.resize());
    ro.observe(ref.current);
    return () => { ro.disconnect(); chart.current?.dispose(); };
  }, []);
  useEffect(() => {
    chart.current?.setOption(option, true);
    chart.current?.off("click");
    if (onClickName) chart.current?.on("click", (p: { name?: string }) => { if (p.name) onClickName(p.name); });
  }, [option, onClickName]);
  return <div ref={ref} role="img" aria-label={label} style={{ width: "100%", height }} data-testid="echart" />;
}
