# anche_screen — 马蹄智检运营中心数据大屏

Vue 3 + ECharts 5 科技感数据可视化大屏，包含 2D/3D 中国地图切换、数字面板、排名展示等模块。部署在 GitHub Pages。

## 项目结构

```
src/
├── components/           # Vue 组件 (17个)
│   ├── DashboardLayout.vue    # 主布局 (CSS Grid: header + left/center/right)
│   ├── DashboardHeader.vue    # 顶部标题栏 + 实时时钟
│   ├── LeftPanel.vue          # 左侧 → 全国:7项指标卡片 / 下钻:省份4项指标 + 返回按钮
│   ├── CenterPanel.vue        # 中部 → 2D/3D 切换按钮 + ChinaMap / ChinaMap3D 互斥渲染
│   ├── RightPanel.vue         # 右侧 → TrendChart + ProvinceRanking + ProvinceTable
│   ├── ChinaMap.vue           # 2D 地图: map series + 涟漪散点 + 飞线 + 边界呼吸 + 省份轮播
│   ├── ChinaMap3D.vue         # 3D 地图: map3D + scatter3D + lines3D + 省份下钻 (viewDistance 140→60)
│   ├── MapNebula.vue          # Canvas 星云粒子背景层 (dust粒子80 + flow粒子15)
│   ├── NumberCard.vue         # 指标卡片: 四态 (loading/error/empty/normal) + 数字滚动动画
│   ├── TrendChart.vue         # 双轴趋势图: 柱状图(订单金额) + 折线图(订单量)
│   ├── ProvinceRanking.vue    # TOP10 省份活跃度排名: 进度条 + 排名趋势箭头(▲/▼/—)
│   ├── ProvinceTable.vue      # 省份订单排名表格: 无缝自动滚动 (RAF驱动, 鼠标悬停暂停)
│   ├── ProvinceDetail.vue     # 省份详情悬浮面板 (地图底部居中 glass-panel, 点击下钻后显示)
│   ├── ParticleBackground.vue # 全局 Canvas 粒子背景 (50粒子 + 近距离连线)
│   ├── SkeletonLoader.vue     # Loading 骨架屏 (card/chart/table/map 四种变体)
│   ├── ErrorDisplay.vue       # 错误状态: 完整模式(图标+文字+重试按钮) / compact模式(仅图标)
│   └── ScalingContainer.vue   # 自适应缩放容器 (⚠️ 已定义但未在当前布局中使用)
├── composables/          # 组合式函数
│   ├── useMockData.js         # 核心数据层: 四态 + 定时轮询(5s/10s/15s) + 异常模拟(3%) + 省份下钻
│   ├── useScaling.js          # 大屏自适应缩放 (cover 模式, requestAnimationFrame)
│   ├── useCountUp.js          # 数字滚动动画 (共享RAF循环, ease-out cubic缓动)
│   └── useInteraction.js      # 交互工具: debounce + throttle + 触屏检测 + 按压态管理
├── mock/                 # 模拟数据层
│   ├── index.js               # 导出聚合 (getTopActiveProvinces / getOrderRanking 等辅助函数)
│   ├── orderData.js           # 7项汇总指标: 基准值 ±2% 随机浮动
│   ├── provinceData.js        # 34省份: 随机游走持久化 + 排名快照对比 + 去重 (福建省误重复)
│   └── trendData.js           # 近7天趋势: 日期x7 + 订单金额(柱) + 订单量(线)
├── utils/
│   ├── geoJSONLoader.js       # 地图 GeoJSON 加载: local(重试3次) → CDN(aliyun datav) → localStorage
│   └── numberFormat.js        # 数字格式化: 千分位/¥前缀/单位缩写(万/亿)/百分比
├── assets/
│   ├── styles/global.css      # CSS变量(:root) + @font-face + 扫描线 + 6个公共keyframes + .glass-panel
│   └── fonts/Orbitron-*.ttf   # 科技感字体: Regular/Bold/Black (3个字重)
├── App.vue                    # 根组件: 三层结构 (粒子z-0 + 扫描线z-1 + DashboardLayout z-2)
└── main.js                    # 入口: createApp + mount + 导入全局CSS
public/
└── geojson/china.json         # 中国地图 GeoJSON (~2MB)
```

## 技术栈

- **Vue 3** (Composition API, `<script setup>`)
- **Vite 5** + `@vitejs/plugin-vue`
- **ECharts 5** + **echarts-gl** (3D 地图) + **vue-echarts** 封装
- **纯 CSS 变量** 主题系统（无 UI 框架依赖）

## 渲染层级

App.vue 使用 z-index 分层：
- z-index: 0 — 全局粒子背景 (`#particles-canvas` fixed)
- z-index: 1 — 扫描线动画 (`.scan-line` fixed)
- z-index: 2 — 应用层 (`.app-layer` → DashboardLayout)

DashboardLayout 使用 CSS Grid (`grid-template-columns: 1fr 2fr 1.4fr`)，三列布局带渐入动画（stagger 0.1s）。

## 核心架构模式

### 数据流

```
useMockData() → provide('mockData') → inject('mockData') 各组件
```

`useMockData` 是唯一的数据层 (composable)，在 App.vue setup 中调用并通过 provide/inject 下发给所有子组件。返回的数据结构：
- **状态**: `loading`, `error`, `hasError` (computed)
- **数据**: `orderSummary`, `provinceStats`, `trendData`, `indicators` (computed派生)
- **模块级错误**: `summaryError`, `provinceError`, `trendError` — 各组件只订阅自己关心的错误
- **操作**: `retryAll`, `retrySummary`, `retryProvince`, `retryTrend`
- **省份下钻**: `selectProvince(name)` / `clearSelection()`
- **调试**: `simulateErrorEnabled` (ref, 默认true)

### 定时轮询

- 汇总指标 (orderSummary): 5s — `NumberCard` 数字滚动动画响应变化
- 趋势数据 (trendData): 10s — `TrendChart` 整图刷新
- 省份数据 (provinceStats): 15s — `ChinaMap`/`ChinaMap3D`/`ProvinceRanking`/`ProvinceTable` 联动更新

异常模拟逻辑 (`simulateErrorEnabled` 开启后):
- 每次刷新 ~3% 概率触发 (`Math.random() < 0.03`)
- 额外每30次刷新强制触发一次错误

### 组件四态

所有数据组件遵循同一模式：

```
loading: true  → SkeletonLoader (card/chart/table/map)
error:   true  → ErrorDisplay (message + retry按钮)
empty:   true  → "暂无数据" / "--" (各组件自行判断)
normal:        → ECharts 图表 / 数据列表正常渲染
```

模块级错误隔离：summaryError 只影响 LeftPanel 的指标卡片，不影响 CenterPanel 和 RightPanel。retry 也是模块级的（`retrySummary`/`retryProvince`/`retryTrend`），不会触发全量重载。

### 省份下钻流程

1. 用户点击 2D/3D 地图省份 → `mockData.selectProvince(name)`
2. `selectedProvince` 变化触发联动：
   - **LeftPanel**: 切换到省份详情视图（4项指标 + 返回按钮）
   - **ChinaMap2D/3D**: 地图下钻（3D 中 `viewDistance` 140→60）
   - **ProvinceDetail**: 地图内悬浮面板显示4项数据
   - **ProvinceRanking/ProvinceTable**: 选中行高亮
3. 点击已选中省份/空白/返回按钮 → `mockData.clearSelection()` → 恢复全国视图

### 地图注册

GeoJSON 通过 `geoJSONLoader.js` 加载，降级链：
1. 检查是否已注册 (2D/3D 地图可能先加载) → 直接返回
2. localStorage 缓存 (key: `anche_china_geojson`)
3. 本地文件 (重试3次, 间隔2s)
4. CDN (aliyun datav)
5. 全部失败 → 返回 `{ success: false, error }` → 组件显示 ErrorDisplay

### 大屏自适应

`useScaling(1920, 1080)` + `ScalingContainer` 使用 CSS `transform: scale()` 等比缩放 1920×1080 设计稿（cover 模式: `Math.max(sx, sy)`）。使用 `requestAnimationFrame` 去抖 resize。

⚠️ 当前 `ScalingContainer` 已实现但未在 App.vue 中使用 —— DashboardLayout 直接渲染，大屏目前不缩放。

## 组件详情

### ChinaMap.vue (2D)

- **数据**: `mapData` (省份→热力色), `scatterData` (TOP8涟漪散点), `linesData` (TOP5→北京飞线)
- **边界呼吸**: `startBorderBreathe()` 每100ms `setOption` 更新 borderColor alpha (正弦波)
- **省份轮播**: `startCarousel()` 每3s dispatchAction highlight 下一个省份
- **交互**: 鼠标悬停暂停轮播+暂停呼吸，离开恢复；点击省份下钻，空白取消
- **Geo阴影**: 底层 `geo` 组件提供投影 (shadowOffsetY: 8, shadowBlur: 20)
- **省份详情**: 下钻后底部显示 `ProvinceDetail` 悬浮面板

### ChinaMap3D.vue (3D)

- **架构**: `geo3D`(坐标系,不可见) + `map3D`(视觉层,交互源) + `scatter3D` + `lines3D`
- **下钻距离**: `DRILL_DISTANCE=60`, `DEFAULT_DISTANCE=140`
- **选中/轮播省份**: 通过 `map3DData` 中动态 `height`(14 vs 1) + `itemStyle` 实现高亮
- **轮播**: 通过 `carouselProvince` ref 驱动，不使用 dispatchAction (GL初始化期可能报错)
- **3D视图**: `autoRotate: true`(全国), 下钻时关闭autoRotate
- `autoRotateSpeed: 6`, `alpha: 35`, `beta: 0`

### MapNebula.vue

Canvas 星云粒子背景，渲染在 ECharts 下方 (z-index:0)：
- **DustParticle** (80个): 微小发光点 + 径向渐变光晕 + 闪烁(twinkle)
- **FlowParticle** (15个): 拖尾粒子 + 轨迹线 (slight upward drift)
- 近距离连线: 粒子间 < 80px 距离绘制半透明连线
- 使用 `ResizeObserver` 监听容器大小变化重建粒子

### NumberCard.vue

指标卡片组件，完整四态 + 数字滚动动画：
- **loading**: SkeletonLoader type="card"
- **error**: 标题 + ErrorDisplay compact模式
- **empty**: 标题 + "--"
- **normal**: 标题 + 数字(useCountUp动画) + 背景暗影数字(phantom) + 底部发光槽(glow-bar) + CRT扫描线纹理
- **交互**: 点击触发闪烁动画 (`flash-cyan` keyframe) + emit('click')
- **视觉**: 伪元素科技角标(::before/::after) + hover悬浮效果

### useCountUp.js

共享 RAF 循环的数字滚动动画：
- 全局单例 RAF 循环 — 所有 NumberCard 实例共享一个 `requestAnimationFrame`
- `Set<anim>` 管理活跃动画，无动画时自动停止RAF
- ease-out cubic 缓动 (`1 - (1-t)³`)
- 增量动画：从当前值滚到新值，即使上一个动画未完成也能正确衔接

### useInteraction.js

交互工具 composable：
- `debounce(fn)`: 返回 debounced 函数 (默认500ms)
- `throttle(fn, ms)`: 返回 throttled 函数 (默认100ms)
- `isTouchDevice`: Computed, 检测触屏设备
- `isPressed`: Computed, 触屏按压状态
- `touchHandlers()`: 返回 `{ onTouchstart, onTouchend, onTouchcancel }`

### ProvinceRanking.vue

TOP10 省份活跃度排名：
- 使用 `getTopActiveProvinces(stats, 10)` 提取+排序
- 进度条宽度 = `activeSites / maxSites * 100%`
- 排名趋势箭头: `activeRank < prevActiveRank` → ▲(绿), `>` → ▼(红), `=` → —(灰)
- 点击选中省份 → `mockData.selectProvince()` / `clearSelection()`
- 触屏支持 (`touchedRow` ref + touchstart/touchend)

### ProvinceTable.vue

省份订单排名表格，无缝自动滚动：
- 数据源: `getOrderRanking(stats)` 按订单金额排序，过滤无数据省份(台湾)
- 滚动: RAF 驱动 `requestAnimationFrame`，`SCROLL_SPEED=30px/s`
- 无缝: `displayRows = [...sortedRows, ...sortedRows]` 复制两份，滚动到末尾时重置
- 鼠标悬停暂停 (`isPaused`)，离开恢复
- 行高: `rowHeight=31px` (硬编码匹配CSS)

### ProvinceDetail.vue

省份详情悬浮面板 (地图内)：
- 位置: 地图底部居中 (`position: absolute; bottom: 16px; left: 50%; transform: translateX(-50%)`)
- 样式: glass-panel + 入场动画 (`detail-in`)
- 显示: 省份名 + 排名 + 4项指标 (活跃/上线站点, 订单数/金额)
- 缩写规则: ≥10000显示"w"(万), ≥1000显示"k"; 金额≥1亿显示"亿", ≥1万显示"万"

### LeftPanel.vue

三路渲染：
- `selectedProvince != null`: 省份详情模式 (省份名header + 4个NumberCard + 返回按钮)
- `loading`: 7个骨架卡片
- `panelError`: ErrorDisplay (retry → retrySummary)
- 正常: 7个NumberCard (indicators)

### CenterPanel.vue

管理 2D/3D 切换状态 (`mapMode` ref)，两个地图组件 `v-if` 互斥渲染。

### App.vue

三层渲染 + 全局数据注入：
```
<ParticleBackground />  // z-index:0
<div class="scan-line" /> // z-index:1
<div class="app-layer">   // z-index:2
  <DashboardLayout />
</div>
```

## mock 数据细节

### provinceData.js — 随机游走模型

- 首次加载: 从 `PROVINCE_BASE` 初始化 `provinceState` (持久化对象)
- 后续刷新: 每个省份每项数据 ±12% 漂移 (`Math.random() * 0.24 - 0.12`)
- `lastRankMap`: 跨轮次排名快照，用于计算 `prevActiveRank`→趋势箭头
- 去重: 福建省在 PROVINCE_BASE 中出现两次，dedup 逻辑自动移除
- 辅助导出: `getTopActiveProvinces(stats, n)`, `getOrderRanking(stats)`

### orderData.js

7项汇总指标，基准值 `BASE` ±2% 浮动 (`Math.random() * 0.04 - 0.02`)。

### trendData.js

近7天趋势，日期用 `new Date()` 往前推算，订单金额 120-210万，订单量 5000-9000。

## 本地开发

```bash
npm install
npm run dev        # → http://localhost:5173
npm run build      # 输出到 dist/
```

## 部署

推送 `master` 分支 → GitHub Actions (`deploy.yml`) 自动 build 并部署到 `gh-pages` 分支 (`peaceiris/actions-gh-pages@v4`)。

`vite.config.js`:
- `base: '/anche_screen_demo/'` — GitHub Pages 子路径
- `server.host: '0.0.0.0'` — 局域网可访问

## 注意事项

- 地图 GeoJSON 文件较大 (~2MB)，`echarts-gl` 也较大，首屏加载需注意
- 2D/3D 切换时两个地图组件 v-if 互斥，切换会重新初始化图表实例和异步数据
- 鼠标悬停 2D 地图时暂停边界呼吸 `setOption`，避免 GeoModel regions 空指针（见 e601e16）
- 3D 地图省份轮播通过数据驱动 (`carouselProvince` ref → `map3DData`)，不使用 `dispatchAction`
- `ProvinceTable` 使用 `[...arr].sort()` 或 `toSorted()` 避免修改原数组
- `ScalingContainer` 组件已实现但未在当前 App.vue 中接线——大屏不缩放
- `provinceData.js` 中的 `福建省` 被定义两次，`dedup` 逻辑已处理
- `NumberCard` 的 `useCountUp` 使用全局共享 RAF 循环——所有卡片实例共享一个 `requestAnimationFrame`
- `useMockData.simulateErrorEnabled` 默认 `true`，~3% 概率触发，生产环境应关闭
