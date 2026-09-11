# 这是用于爬取并统计datawhale组织下相关仓库，以及外部组织仓库的项目

## 目录介绍
- app目录是使用nextjs构建的可视化项目
- scripts/fetchData下是从github上抓取数据的脚本
- scripts/analysisData是将抓取的数据转换为可视化项目可消费的数据格式的脚本
- scripts/datawhaleYearly2024是用于抓取年度贡献数据

## 启动命令
`pnpm run dev`启动项目

## 抓取数据
先执行 `pnpm install` 安装依赖，在项目根目录新建 `key.txt` 并写入 GitHub Token。随后按需修改 `fetchOrganization.config.js` 中的组织名、当前及上一期快照日期，运行 `pnpm fetch:organization`。脚本会抓取组织仓库、Star 明细及榜单，结果写入 `data/allOrganization`、`data/repo` 和 `data/organization_datasource.json`。
