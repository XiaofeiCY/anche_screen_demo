# 工作进度记录

更新时间：2026-05-28

## 当前状态

本轮 3D 地图交互调整已通过用户验收。

核心目标是让 3D 全国地图支持广东省地级市下钻：

1. 全国 3D 地图点击“广东省”进入广东省市级 3D 地图。
2. 广东省地图展示 21 个地级市边界和城市标签。
3. 点击城市后高亮该城市，其他城市变暗，并展示城市详情。
4. 再次点击同一城市取消选中。
5. 中心地图“返回全国”和左侧面板“返回全国”均可回到全国 3D 地图。
6. 2D/3D 切换会清理选中态，避免下钻状态残留。

## 已验收通过

1. 返回全国后不再残留广东市级地图。
2. 广东省进入后默认展示全省视角，用户确认通过。
3. 点击城市后不会再出现地图跑丢。
4. 城市详情不再出现 `#undefined`。
5. 广东 GeoJSON 使用本地优先加载。
6. `vite build` 通过。

## 当前实现取舍

城市“移动到 C 位”的强聚焦方案已降级。

原因：

1. 之前尝试把城市经纬度直接写入 `map3D.viewControl.center`。
2. ECharts GL 的 `viewControl.center` 不是直接的 GeoJSON 经纬度居中接口。
3. 该方案会导致地图相机中心偏移失控，用户看到“地图跑丢”。

当前稳定方案：

1. 广东视图 `center` 固定为 `[0, 0, 0]`。
2. 广东视图 `distance` 固定为 `160`。
3. 广东视图 `alpha` 固定为 `75`，偏俯视。
4. 点击城市只更新高亮、透明度和详情面板，不移动相机。

后续如要重新做 C 位聚焦，需要先确认 ECharts GL `map3D.viewControl.center` 的实际坐标体系，不能直接使用经纬度。

## 关键文件

1. `src/components/ChinaMap3D.vue`
   - 3D 全国/广东两级视图切换。
   - 广东市级地图 option。
   - 城市点击、高亮、详情、返回全国逻辑。
   - 使用 `:key="mapLevel"` 和 `notMerge: true` 避免全国/广东 GL 场景残留。

2. `src/components/CenterPanel.vue`
   - 2D/3D 切换时调用 `mockData.clearSelection()`，避免状态残留。

3. `src/utils/geoJSONLoader.js`
   - 新增 `loadProvinceGeoJSON(adcode, mapName)`。
   - 省级 GeoJSON 加载顺序为本地文件优先，然后 localStorage，最后 CDN。

4. `src/mock/guangdongCityData.js`
   - 广东 21 个地级市 mock 数据。
   - 包含 `activeRank`，供详情卡排名展示。

5. `public/geojson/provinces/440000_full.json`
   - 广东省地级市 GeoJSON，本地化资源。

## 验证记录

构建验证：

```bash
node .\node_modules\vite\bin\vite.js build
```

结果：构建通过，892 modules transformed。

用户浏览器验收：

1. 返回全国 bug 已确认没问题。
2. 广东全省默认视角通过。
3. 城市点击不跑丢，通过。

## 后续建议

1. 如果继续扩展，下一个阶段可以复制广东方案，按省份 adcode 增加更多省份地级市 GeoJSON 和 mock 数据。
2. 暂时不要恢复经纬度驱动的 C 位聚焦。
3. 如果要做城市聚焦，优先调研 ECharts GL 坐标转换或改用更可控的 2D/Canvas overlay 方案。
4. 每次改 3D 交互后，必须浏览器实测：广东下钻、城市点击、中心返回、左侧返回、2D/3D 切换。
