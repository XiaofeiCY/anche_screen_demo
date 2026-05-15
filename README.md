# 马蹄智检运营中心数据大屏

基于 Vue 3 + ECharts 的科技感数据可视化大屏，包含中国地图粒子特效、数字面板、排名数据等模块。

## 在线预览

🔗 **[https://xiaofeicy.github.io/anche_screen_demo/](https://xiaofeicy.github.io/anche_screen_demo/)**

## 仓库地址

🔗 **[https://github.com/XiaofeiCY/anche_screen_demo](https://github.com/XiaofeiCY/anche_screen_demo)**

## 技术栈

- **框架**: Vue 3 + Vite 5
- **图表**: ECharts 5 + vue-echarts
- **部署**: GitHub Pages + GitHub Actions

## 本地运行

```bash
# 1. 安装依赖
npm install

# 2. 启动开发服务器
npm run dev

# 3. 访问 http://localhost:5173
```

## 构建与部署

```bash
# 生产构建
npm run build
```

推送 `master` 分支后，GitHub Actions 自动执行构建并部署到 GitHub Pages（`gh-pages` 分支），无需手动操作。

## 项目结构

```
anche_screen_demo/
├── public/
│   └── geojson/china.json    # 中国地图 GeoJSON 数据
├── src/
│   ├── components/           # Vue 组件
│   ├── composables/          # 组合式函数
│   ├── mock/                 # 模拟数据
│   ├── utils/                # 工具函数（地图加载器等）
│   ├── assets/               # 静态资源
│   ├── App.vue
│   └── main.js
├── .github/workflows/        # GitHub Actions 自动部署
├── vite.config.js
└── package.json
```

## 功能特性

- **中国地图 3.0** — Canvas 星云粒子层 + 边界呼吸辉光
- **左侧数字面板** — 星际穿越发光效果
- **活跃度进度条** — 可视化活跃指标
- **排名数据面板** — 动态排名展示

## License

MIT
