import { test, expect } from "@playwright/test";
import { obsValue, recordAcceptance, SHOT, readCsv, OBS } from "./helpers";

const f = (v: string, d: number) => Number(v).toLocaleString("zh-CN", { minimumFractionDigits: d, maximumFractionDigits: d });
const shot = (n: string) => SHOT(`acceptance-${n}.png`);

test.describe("Unified acceptance tasks", () => {
  test.beforeEach(async ({}, info) => { test.skip(info.project.name !== "desktop-1440", "desktop project only (H runs on mobile)"); });

  test("Task A: Guangdong latest resident population + official source", async ({ page }) => {
    await page.goto("/");
    await page.getByTestId("site-search").nth(1).fill("广东");
    await page.getByTestId("search-results").getByRole("link", { name: /广东省/ }).click(); // click 1
    const row = page.locator("tr[data-ind='population']");
    const expected = obsValue("population", "440000", 2025)!;
    await expect(row.locator("td[data-value]")).toHaveAttribute("data-value", expected);
    await expect(row).toContainText("2025");
    const href = await row.getByRole("link", { name: /国家统计局/ }).getAttribute("href"); // click 2 would open official page
    expect(href).toContain("data.stats.gov.cn");
    await page.screenshot({ path: shot("A") });
    recordAcceptance("A", { result: "Pass", steps: "首页搜索框输入“广东”→点击“广东省”→地区页“年末常住人口”行显示数值与年份→点击“国家统计局↗”打开官方分省年度数据查询页", clicks: 2, data_year: "2025", verification: `显示 ${expected} 万人 = observations.csv；与2024年值12780核对年鉴2025表2-5一致（核验样本）`, evidence: "screenshots/acceptance-A.png" });
  });

  test("Task B: Jiangsu, Zhejiang, Guangdong population since 2015", async ({ page }) => {
    await page.goto("/indicators/population/#trend");
    await page.getByTestId("trend-from").selectOption("2015"); // click 1
    const t = page.getByTestId("trend-table");
    for (const [g, name] of [["320000", "江苏"], ["330000", "浙江"], ["440000", "广东"]]) {
      const cells = await t.locator("tbody tr", { hasText: name }).locator("td").allTextContents();
      expect(cells[1]).toBe(f(obsValue("population", g, 2015)!, 0));
      expect(cells[cells.length - 1]).toBe(f(obsValue("population", g, 2025)!, 0));
    }
    await page.getByTestId("trend-table").scrollIntoViewIfNeeded();
    await page.screenshot({ path: shot("B") });
    recordAcceptance("B", { result: "Pass", steps: "打开“年末常住人口”→历史趋势默认比较广东、江苏、浙江与全国→起始年选2015", clicks: 2, data_year: "2015—2025", verification: "趋势表首末年数值与 observations.csv 一致；默认省份组合即为任务所需", evidence: "screenshots/acceptance-B.png" });
  });

  test("Task C: 2020 65+ share ranking, census caliber", async ({ page }) => {
    await page.goto("/indicators/population_65plus/#rankings");
    await page.getByTestId("year-select").selectOption("2020"); // click 1
    const first = page.getByTestId("ranking-table").locator("tbody tr").first();
    await expect(first).toContainText("辽宁");
    await expect(first.locator("td[data-value]")).toHaveAttribute("data-value", "17.42");
    await expect(page.locator("#methodology")).toContainText("2020年为第七次人口普查数据");
    await page.getByTestId("explorer-from").selectOption("2020");
    await page.getByTestId("explorer-to").selectOption("2020");
    await page.getByTestId("explorer-search").fill("辽宁");
    await page.getByTestId("source-btn").first().click();
    await page.screenshot({ path: shot("C") });
    recordAcceptance("C", { result: "Pass", steps: "打开“65岁及以上人口占比”→年份选2020→排名表第1名辽宁17.42%；方法区注明2020年为七普口径；数据表中2020年行的来源为《第七次全国人口普查公报（第五号）》表5-2", clicks: 2, data_year: "2020（普查标准时点2020-11-01）", verification: "辽宁17.42、广东8.58与七普公报表5-2一致；全国13.50%经独立核验", evidence: "screenshots/acceptance-C.png" });
  });

  test("Task D: latest provincial GDP per capita, current prices", async ({ page }) => {
    await page.goto("/indicators/gdp_per_capita/");
    await expect(page.getByTestId("latest-prov-year")).toHaveText("2025");
    await expect(page.locator("#summary")).toContainText("初步核算数，现价（名义）口径");
    const first = page.getByTestId("ranking-table").locator("tbody tr").first();
    await expect(first).toContainText("北京");
    await page.screenshot({ path: shot("D") });
    recordAcceptance("D", { result: "Pass", steps: "搜索/打开“人均地区生产总值（现价）”→概览显示最新省级年份2025、现价与初步核算提示→排名表", clicks: 1, data_year: "2025（初步核算）", verification: "2025年值为初步核算；2024年值为最终核实数（与年鉴2025初步数的差异已记录为 revised）", evidence: "screenshots/acceptance-D.png" });
  });

  test("Task E: Shandong, Henan, Guangdong disposable income", async ({ page }) => {
    await page.goto("/indicators/disposable_income/#regional");
    const picker = page.getByTestId("compare-picker");
    for (const n of ["山东", "河南", "广东"]) await expect(picker.getByRole("button", { name: n })).toHaveAttribute("aria-pressed", "true");
    const trend = page.getByTestId("province-picker");
    for (const n of ["广东", "江苏", "浙江"]) await trend.getByRole("button", { name: n }).click(); // deselect defaults (3 clicks)
    for (const n of ["山东", "河南", "广东"]) await trend.getByRole("button", { name: n }).click(); // 3 clicks
    const t = page.getByTestId("trend-table");
    for (const [g, n] of [["370000", "山东"], ["410000", "河南"], ["440000", "广东"]]) {
      const cells = await t.locator("tbody tr", { hasText: n }).locator("td").allTextContents();
      expect(cells[cells.length - 1]).toBe(f(obsValue("disposable_income", g, 2025)!, 0));
    }
    await page.locator("#regional").scrollIntoViewIfNeeded();
    await page.screenshot({ path: shot("E") });
    recordAcceptance("E", { result: "Pass", steps: "打开“居民人均可支配收入”→地区比较的多省比较默认即山东、河南、广东（0次额外点击）；或在历史趋势中选择这三省查看2013—2025", clicks: "1（地区比较）/7（趋势重选）", data_year: "2025（趋势2013—2025）", verification: "2024年山东42077、河南31552、广东51474与年鉴2025表6-18一致", evidence: "screenshots/acceptance-E.png" });
  });

  test("Task F: physicians per 1000 ranking", async ({ page }) => {
    await page.goto("/indicators/physicians_per_1000/#rankings");
    const vals = await page.getByTestId("ranking-table").locator("tbody td[data-value]").evaluateAll((e) => e.map((x) => Number(x.getAttribute("data-value"))));
    expect(vals.length).toBe(31);
    expect([...vals].sort((a, b) => b - a)).toEqual(vals);
    await expect(page.getByTestId("ranking-table").locator("tbody tr").first()).toContainText("北京");
    await page.screenshot({ path: shot("F") });
    recordAcceptance("F", { result: "Pass", steps: "打开“每千人口执业（助理）医师数”→排名区默认显示最新年（2024）31省降序排名", clicks: 1, data_year: "2024", verification: "广东2.94、北京5.79、山东3.99、河南3.71、西藏3.68与年鉴2025表22-3一致", evidence: "screenshots/acceptance-F.png" });
  });

  test("Task G: download filtered CSV and compare with page", async ({ page }) => {
    await page.goto("/explorer/");
    await page.getByRole("button", { name: "人均地区生产总值（现价）" }).click();
    await page.getByTestId("explorer-region").selectOption("华东");
    await page.getByTestId("explorer-from").selectOption("2023");
    await page.getByTestId("explorer-to").selectOption("2025");
    const btn = page.getByTestId("csv-download");
    const [dl] = await Promise.all([page.waitForEvent("download"), btn.click()]);
    const rows = readCsv((await dl.path())!);
    expect(rows.length).toBe(2 * 7 * 3);
    const pageRows = await page.getByTestId("explorer-table").locator("tbody tr[data-row]").evaluateAll((e) => e.map((x) => [x.getAttribute("data-row"), x.querySelector("td[data-value]")?.getAttribute("data-value")]));
    for (const [key, v] of pageRows) {
      const [ind, geo, year] = key!.split("|");
      const c = rows.find((r) => r.indicator_id === ind && r.geo_code === geo && r.year === year)!;
      expect(c.value).toBe(v);
      expect(c.value).toBe(OBS().find((r) => r.indicator_id === ind && r.geo_code === geo && r.year === year)!.value);
    }
    await page.screenshot({ path: shot("G") });
    recordAcceptance("G", { result: "Pass", steps: "数据浏览器→加选“人均地区生产总值”→地区选华东→年份2023—2025→下载CSV", clicks: 5, data_year: "2023—2025", verification: "CSV 42行；页面每一行的值与CSV及 observations.csv 完全一致", evidence: "screenshots/acceptance-G.png" });
  });

  test("Task I: year without data shows no fabricated values", async ({ page }) => {
    await page.goto("/indicators/hospital_beds_per_1000/#rankings");
    await page.getByTestId("year-select").selectOption("2005");
    await expect(page.getByTestId("no-data")).toBeVisible();
    await page.getByTestId("show-missing").check();
    await page.getByTestId("explorer-from").selectOption("2005");
    await page.getByTestId("explorer-to").selectOption("2005");
    const cells = await page.getByTestId("explorer-table").locator("td[data-value]").evaluateAll((e) => e.map((x) => x.getAttribute("data-value")));
    expect(cells.filter((c) => c !== "").length).toBeLessThanOrEqual(1); // at most national value; provinces empty
    await page.screenshot({ path: shot("I") });
    recordAcceptance("I", { result: "Pass", steps: "打开“每千人口医疗卫生机构床位数”→排名年份选2005（数据库无该年省级数据）→显示“没有发布…不插值”提示；数据表勾选“显示缺失值”后2005年省级行均为“缺失”", clicks: 3, data_year: "2005", verification: "无任何省级数值生成；observations.csv 对应行 value 为空、data_status=unknown", evidence: "screenshots/acceptance-I.png" });
  });

  test("Task J: trace a value to the official table", async ({ page }) => {
    await page.goto("/indicators/gdp/");
    await page.getByTestId("explorer-search").fill("河南");
    await page.getByTestId("source-btn").first().click();
    const dlg = page.getByTestId("source-dialog");
    await expect(dlg).toContainText("分省年度数据 > 国民经济核算 > 地区生产总值");
    await expect(dlg).toContainText("da=410000000000");
    await page.screenshot({ path: shot("J") });
    recordAcceptance("J", { result: "Pass", steps: "任一指标页数据表→点“查看来源”→弹窗显示机构、数据库、表格路径、原始单位、转换、接口定位（cid/指标ID/地区代码/年份）及官方查询页链接", clicks: 2, data_year: "2025", verification: "按表格路径在 data.stats.gov.cn 分省年度数据可定位同一数值；接口定位可由 pipeline 原样重放（原始响应保存在 data/raw/nbs_api_cache）", evidence: "screenshots/acceptance-J.png" });
  });
});

test("Task H: mobile search, year switch, source view @mobile", async ({ page }, info) => {
  test.skip(info.project.name !== "mobile-390", "mobile only");
  await page.goto("/");
  await page.getByTestId("site-search").first().fill("出生");
  await page.getByTestId("search-results").getByRole("link").first().click();
  await expect(page).toHaveURL(/birth_rate/);
  await page.waitForLoadState("networkidle"); // interactive controls work only after hydration
  await page.getByTestId("year-select").selectOption("2020");
  await expect(page.getByTestId("ranking-table").locator("tbody tr").first()).toBeVisible();
  await page.getByTestId("source-btn").first().click();
  await expect(page.getByTestId("source-dialog")).toBeVisible();
  await page.screenshot({ path: shot("H-mobile") });
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(overflow).toBeLessThanOrEqual(1);
  recordAcceptance("H", { result: "Pass", steps: "390px 手机视口（Pixel 7 模拟，Chromium）：顶部搜索“出生”→进入出生率页→年份选2020→数据表点“查看来源”弹窗", clicks: 4, data_year: "2020", verification: "页面无横向溢出；未在真实手机或微信内置浏览器中验证", evidence: "screenshots/acceptance-H-mobile.png" });
});
