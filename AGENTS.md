# anche_screen — 马蹄智检运营中心数据大屏

Vue 3 + ECharts 5 科技感数据可视化大屏，包含 2D/3D 中国地图切换、数字面板、排名展示等模块。部署在 GitHub Pages。

## 项目结构

```
src/
├── components/        # Vue 组件
│   ├── DashboardLayout.vue   # 主布局 (grid: header + left/center/right)
│   ├── DashboardHeader.vue   # 顶部标题栏
│   ├── LeftPanel.vue         # 左侧 → NumberCard 指标卡片
│   ├── CenterPanel.vue       # 中部 → ChinaMap / ChinaMap3D 切换 + 趋势图
│   ├── RightPanel.vue        # 右侧 → ProvinceRanking + ProvinceTable
│   ├── ChinaMap.vue          # 2D 地图 (map series + 涟漪散点 + 飞线 + 边界呼吸)
│   ├── ChinaMap3D.vue        # 3D 地图 (echarts-gl geo3D + scatter3D + lines3D)
│   ├── MapNebula.vue         # Canvas 星云粒子背景层
│   ├── NumberCard.vue        # 指标卡片组件
│   ├── TrendChart.vue        # 趋势折线图
│   ├── ProvinceRanking.vue   # 省份活跃度排名
│   ├── ProvinceTable.vue     # 省份数据表格
│   ├── ParticleBackground.vue # 全局 Canvas 粒子背景
│   ├── SkeletonLoader.vue    # Loading 骨架屏
│   ├── ErrorDisplay.vue      # 错误状态展示 + retry
│   └── ScalingContainer.vue  # 自适应缩放容器
├── composables/
│   ├── useMockData.js        # 核心数据管理：四态 + 定时轮询 + 异常模拟 + 省份下钻
│   ├── useScaling.js         # 大屏自适应缩放 (cover 模式)
│   ├── useCountUp.js         # 数字滚动动画
│   └── useInteraction.js     # 交互状态管理
├── mock/
│   ├── index.js              # 导出聚合
│   ├── orderData.js          # 汇总指标模拟
│   ├── provinceData.js       # 省份数据模拟
│   └── trendData.js          # 趋势数据模拟
├── utils/
│   ├── geoJSONLoader.js      # 地图 GeoJSON 加载 (local→CDN→localStorage 降级)
│   └── numberFormat.js       # 数字格式化工具
├── assets/
│   ├── styles/global.css     # 全局样式 + CSS 变量 + 公共动画
│   └── fonts/Orbitron-*.ttf  # 科技感字体
├── App.vue                   # 根组件：provide mockData + 粒子背景 + 扫描线
└── main.js                   # 入口：createApp + mount
public/
└── geojson/china.json        # 中国地图 GeoJSON
```

## 技术栈

- **Vue 3** (Composition API, `<script setup>`)
- **Vite 5** + `@vitejs/plugin-vue`
- **ECharts 5** + **echarts-gl** (3D 地图) + **vue-echarts** 封装
- **纯 CSS 变量** 主题系统（无 UI 框架依赖）

## 核心架构模式

### 数据流

```
useMockData() → provide('mockData') → inject('mockData') 各组件
```

`useMockData` 是唯一的数据层，管理：
- **四态**：`loading → error | empty | normal`
- **定时轮询**：汇总 5s / 趋势 10s / 省份 15s
- **异常模拟**：约 3% 概率触发模拟错误（可开关 `simulateErrorEnabled`）
- **省份下钻**：`selectProvince(name)` / `clearSelection()` → 驱动 3D 地图钻取

### 组件四态

所有数据组件遵循同一模式：`SkeletonLoader`(loading) → `ErrorDisplay`(error) + retry → 正常渲染。

### 地图注册

GeoJSON 通过 `geoJSONLoader.js` 加载，降级链：本地文件 → CDN (aliyun datav) → localStorage 缓存（key: `anche_china_geojson`）。加载成功后调用 `echarts.registerMap('china', geoJSON)`，2D 和 3D 地图共用此注册。

### 大屏自适应

`ScalingContainer` + `useScaling` 使用 CSS transform scale 将 1920×1080 设计稿等比缩放填充视口（cover 模式）。

### 视觉主题

CSS 变量定义在 `global.css` 的 `:root` 中：
- 主色调：`--accent-cyan: #00d4ff`、`--accent-blue: #0a6eff`
- 玻璃态面板：`.glass-panel`，带伪元素科技角标
- 扫描线动画：`.scan-line`
- 数字呼吸发光：`number-glow-breathe` keyframes
- 科技字体：Orbitron (Regular/Bold/Black)

## 本地开发

```bash
npm install
npm run dev        # → http://localhost:5173
npm run build      # 输出到 dist/
```

## 部署

推送 `master` 分支 → GitHub Actions 自动 build 并部署到 `gh-pages` 分支 (`peaceiris/actions-gh-pages@v4`)。

`vite.config.js` 中 `base: '/anche_screen_demo/'` 对应 GitHub Pages 路径，本地开发时需注意资源路径。

## 注意事项

- 地图 GeoJSON 文件较大（~2MB），`echarts-gl` 也较大，首屏加载需注意
- 2D/3D 切换时两个地图组件互斥渲染，不会同时存在
- 鼠标悬停地图时暂停边界呼吸 `setOption`，避免 GeoModel regions 空指针（见 e601e16）
- mock 数据每轮刷新会生成随机值，排名和指标实时变化是预期行为
- `ProvinceTable` 等组件使用 `.sort()` 排序，注意会修改原数组 — 使用 `[...arr].sort()` 或 `toSorted()`
