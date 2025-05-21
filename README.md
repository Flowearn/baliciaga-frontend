# Baliciaga Frontend

一个优雅且用户友好的网页应用，用于发现和浏览巴厘岛苍古(Canggu)地区的精选咖啡馆。提供咖啡馆列表、详情查看、筛选和搜索功能，帮助用户找到符合自己偏好的高质量咖啡体验。

## 技术栈

* Vite (v5.x) - 构建工具和开发服务器
* React (v18.x) - UI库, 使用Hooks和函数组件
* TypeScript - 类型安全
* Tailwind CSS (v3.x) - 原子化CSS框架
* Shadcn UI - 基于Radix UI的UI组件库
* React Router DOM (v6.x) - 用于客户端路由
* React Query (v5.x) - 用于数据获取、缓存和状态管理
* Lucide React - 图标库
* React Hook Form - 表单管理
* Zod - 表单验证
* Sonner - 通知组件

## 项目设置与运行

### 先决条件

1. 安装 [Node.js](https://nodejs.org/) (版本 18.x 或更高，与Vite和项目依赖兼容的版本)。
2. (可选) 安装 [Bun](https://bun.sh/) 作为更快的包管理器和运行时。

### 本地设置与运行

1. **克隆仓库 (如果适用) 或导航到项目目录:**
   ```bash
   cd path/to/BALICIAGA/frontend
   ```

2. **创建 `.env` 文件 (用于Google Maps Static API密钥):**
   在 `BALICIAGA/frontend/` 目录下创建一个名为 `.env` 的文件，并添加您的Google Maps API密钥：
   ```env
   VITE_Maps_API_KEY=YOUR_ACTUAL_Maps_API_KEY
   ```
   将 `YOUR_ACTUAL_Maps_API_KEY` 替换为您的真实密钥。注意变量名必须以`VITE_`开头才能被Vite正确加载。

3. **安装依赖:**
   ```bash
   npm install
   ```
   或者，如果您使用Bun:
   ```bash
   bun install
   ```

4. **启动开发服务器:**
   ```bash
npm run dev
```
   或者使用Bun:
   ```bash
   bun dev
   ```
   服务启动后，前端应用将在 `http://localhost:8080` 上运行 (在vite.config.ts中配置的端口)。

## 与后端API的交互

* 前端通过调用运行在 `http://localhost:3006` 的后端API来获取咖啡馆数据。
* 在开发环境中，Vite配置了一个代理，所有对 `/api/*` 的请求都会被转发到后端服务。
* 主要端点：
  * `/api/cafes` - 获取所有咖啡馆列表
  * `/api/cafes/{placeId}` - 获取单个咖啡馆详情
* API调用逻辑主要封装在 `src/services/cafeService.ts` 中。
* 数据状态和缓存由 `@tanstack/react-query` 管理，减少不必要的API请求并提升用户体验。

## 项目结构

* `public/`: 存放静态资源。
* `src/`: 主要源代码目录。
  * `components/`: 可复用的UI组件。
    * `ui/`: Shadcn UI组件。
    * 其他业务组件，如 `CafeCard.tsx`, `CafeList.tsx` 等。
  * `hooks/`: 自定义React Hooks，包括toast通知等功能。
  * `lib/`: 通用工具函数和辅助函数。
  * `pages/`: 页面级组件，包括首页、详情页等。
  * `services/`: 包含API调用逻辑，如 `cafeService.ts`。
  * `App.tsx`: 应用的主组件，包含路由配置和全局上下文Provider。
  * `main.tsx`: React应用的入口点。
  * `index.css`: 全局CSS样式，包含Tailwind指令。
* `vite.config.ts`: Vite的配置文件，包含开发服务器设置和API代理配置。
* `tailwind.config.ts`: Tailwind CSS的配置文件，包含主题和插件设置。
* `components.json`: Shadcn UI组件配置。
* `package.json`: 项目依赖和脚本。
* `.env`: 存储环境变量（本地开发，不提交到Git）

## 主要功能

* 咖啡馆列表浏览 - 查看所有可用的咖啡馆
* 咖啡馆详情查看 - 点击列表项查看更详细的信息
* 搜索功能 - 按名称搜索咖啡馆
* 响应式设计 - 在移动设备和桌面设备上都有良好的体验
* 状态指示 - 显示咖啡馆是否营业中
* 评分和价格等级 - 直观地显示质量和价格信息

## 注意事项

* 确保您的Google Maps API密钥安全。`.env`文件已在`.gitignore`中配置为忽略。
* 在启动前端开发服务器前，请确保后端API服务 (通过 `serverless-offline` 运行在 `http://localhost:3006`) 已经启动，以便前端能够获取数据。
* 如果您需要更改开发服务器端口，请修改 `vite.config.ts` 文件中的 `server.port` 值。
* 该项目使用了React Query的数据预取和缓存优化，以提供更流畅的用户体验，特别是在咖啡馆列表和详情页之间导航时。

## 构建生产版本

要构建生产版本的应用，运行：

```bash
npm run build
```

这将在 `dist` 目录下生成优化后的生产构建文件，可以部署到任何静态文件托管服务。

# 项目开发进展和更新日志

## 项目概述与目标回顾

Baliciaga项目是一个专注于展示和管理巴厘岛Canggu地区咖啡馆信息的平台，通过精选的咖啡馆数据，为用户提供高质量、准确的咖啡馆信息。

## 主要技术栈与关键服务

- **后端**：Node.js, Serverless Framework (AWS Lambda, API Gateway), AWS S3 (用于存储最终数据和图片)
- **数据源**：Google Places API，主要使用 `searchText` 和 `searchNearby` 端点
- **核心数据处理**：`BaliciagaCafe.js` 模型类，以及多个用于数据获取、充实、上传的脚本

## 开发历程中的重要里程碑与决策

### Google Places API 分页问题攻坚

- 尝试了多种参数组合（`searchText`, `searchNearby`, `fieldMasks`, `rankPreference`, `includedTypes`, 半径调整）试图解决单次查询无法获取超过20条数据及 `nextPageToken` 的问题
- **最终结论**：对于项目目标区域的单次大范围查询，Google API未返回分页令牌

### 数据获取策略的演进

- 从最初的单次API调用尝试
- 演变为"定点爆破"/"细分搜索区域"策略，通过多次小范围 `searchNearby` (按热门度，特定类型) 调用来收集初步名单
- 后续使用 `searchText` 针对特定关键词（如 "bali canggu cafe"）或特定咖啡馆名称进行补充搜索

### 数据充实流程

- 初步名单 (`placeId`, `name`) -> 调用 `getPlaceDetails` 获取详细信息
- 详细讨论并最终确定了 `getPlaceDetails` 的 `fieldMask`，以平衡信息全面性和API成本
- 实现了 `enrichCafeData.js` 脚本，用于批量获取详情并处理数据（包括保留用户手动添加的 `instagram` 链接，添加 `openingPeriods` 等）

### 图片处理流程

- 实现了 `downloadCafePhotos.js` 脚本，用于从Google照片链接下载图片到本地，并按 `{处理后的名称}_{placeId}` 格式的子文件夹存放
- 讨论并实现了 `renameScreenshotFiles.js` (或 `renameManualPhotos.js`) 脚本，用于将用户手动截图的图片重命名为 `photo_a`, `photo_b` 等格式
- 实现了 `uploadAssetsToS3.js` 脚本，用于：
  - 将本地 `cafe_images` 目录下的图片上传到AWS S3 (`baliciaga-database` 桶的 `image/` 目录下)
  - 更新JSON数据文件中的 `photos` 数组为S3链接，并按"字母后缀优先"规则排序

### 最终数据源切换

- 最终的咖啡馆数据 (包含所有详情和S3图片链接) 存储在S3上的一个JSON文件 (例如 `s3://baliciaga-database/data/cafes.json`)
- 后端API (`WorkspaceCangguCafes.js`) 已重构为从S3读取这个JSON文件，不再实时调用Google Places API获取列表

### 实时营业状态计算 (`isOpenNow`)

- 讨论了三种方案（前端计算、后端API实时计算、后端Lambda定期任务更新S3）
- 当前 `WorkspaceCangguCafes.js` 的实现是在API被调用时，根据S3 JSON中的 `openingPeriods` 和当前巴厘岛时间**实时计算 `isOpenNow`**
- 用户倾向于未来采用**方案C（后台Lambda定期任务）**，目前API层的实时计算是过渡或基础

## 当前后端主要功能模块/文件

- **`src/utils/config.js`**: 存储API密钥配置名、S3桶名、搜索参数配置（例如 `SEARCH_CONFIG.canggu` 用于手动指定测试区域和参数）
- **`src/api/placesApiService.js`**:
  - 封装了对Google Places API的调用。包含 `searchNearbyPlaces`, `searchTextPlaces`, `getPlaceDetails`, `getPhotoUrl` 等函数
  - `getPlaceDetails` 使用了优化后的 `fieldMask`
- **`src/models/BaliciagaCafe.js`**: 定义了咖啡馆数据模型，处理从API原始数据到应用所需数据结构的转换，包含 `openingPeriods` 和 `instagram` 字段
- **`src/fetchCangguCafes.js`** (或 `handler.js`中的核心逻辑):
  - `/dev/cafes` 等接口的实现
  - **当前已修改为从S3读取 `data/cafes.json` 作为数据源**
  - 实现了 `isOpenNow` 的实时计算
  - 包含内存缓存机制（例如5分钟TTL）
- **`scripts/` 目录下的辅助脚本**:
  - `enrichCafeData.js`: 批量获取地点详情并合并数据
  - `downloadCafePhotos.js`: 下载Google图片到本地
  - `renameScreenshotFiles.js` (或 `renameManualPhotos.js`): 重命名本地截图文件
  - `uploadAssetsToS3.js`: 上传图片到S3并更新JSON中的图片链接

## 重要注意事项和未来工作提示

- **API密钥管理**：`.env` 文件需要正确配置 `MAPS_API_KEY`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION`, `S3_BUCKET_NAME`
- **S3权限配置**：S3存储桶策略需要允许对 `image/*` 的公共读取，以及Lambda执行角色需要有读取 `data/cafes.json` 的权限
- **数据一致性**：如果手动修改了S3上的 `data/cafes.json` 或图片，需要有流程确保所有引用该数据的地方都能获取最新状态
- **未来可实现的 `isOpenNow` 状态的后台定期更新Lambda**：这是计划中的优化方向
- **本地脚本的运行环境**：脚本通常在 `BALICIAGA/backend/` 或 `BALICIAGA/backend/scripts/` 目录下通过 `node` 运行，依赖于根目录或 `backend` 目录下的 `.env` 文件

## 前端开发进展更新 (2025年5月20日)

### 项目概述与目标回顾

Baliciaga的前端设计专注于为用户提供直观、美观的界面，用于展示和浏览巴厘岛苍古(Canggu)地区的精选咖啡馆，通过高质量的UI和良好的用户体验，帮助用户快速找到符合自己需求的咖啡馆。

### 主要技术栈与关键库

- **核心技术**：React, TypeScript, Vite, Tailwind CSS
- **UI库**：`shadcn/ui` 组件库（基于Radix UI的可定制组件）
- **图标**：`lucide-react` 图标库
- **轮播**：`embla-carousel-react` 用于图片轮播
- **数据获取**：React Query 用于数据获取、缓存和状态管理
- **路由**：React Router DOM 用于页面导航

### 开发历程中的重要UI调整与决策

#### 首页 (`Index.tsx`)

- 实现了吸顶头部，包含标题、Slogan、下拉式"Contact"菜单按钮和搜索框
- 解决了吸顶头部在滚动时两侧"露边"的问题（通过调整最外层容器和吸顶容器自身的 `padding/margin`）
- 咖啡馆卡片 (`CafeCard.tsx`) 图片容器的高度调整为响应式（16:9宽高比，有最大高度限制）

#### 详情页 (`CafeDetailPage.tsx`, `CafeDetail.tsx`)

- 解决了最初因内容不足导致的页面底部"露白"或"露底"问题（通过调整页面级容器和内容组件的高度与滚动逻辑）
- 图片容器 (`floating-image-container`) 实现了响应式高度（4:3宽高比，有最大高度限制），并解决了其右侧视觉间距偏大的问题（通过统一父级 `px-4` 并移除子级 `mx-4`）
- 对图片下方的两排按钮（第一排Info/Share，第二排Tel/Web/Instagram）进行了多次UI微调：
  - 按钮高度、内部图标与文字间距、按钮间距、按钮弹性宽度和两端对齐
  - 按钮文本（中英文切换）
  - 按钮颜色样式（例如，"浅灰底、白色字"）
- 调整了评分信息的垂直位置
- 移除了"Menu"按钮和联系信息区的固有标题及多余内容
- 实现了营业时间的折叠/展开显示

#### 地图功能

- 前端通过 `placeId` (或地点名称/地址) 构建链接以跳转到Google Maps
- 详情页展示静态地图图片 (Static Map API)，并计划将这些图片及链接存储到S3

#### 数据获取

- 前端通过 `cafeService.ts` 调用后端API (`/dev/cafes` 或 `/dev/cafes/:placeId`) 获取数据
- 后端API已切换为从S3读取JSON数据

### 当前前端主要组件结构与功能

- **`App.tsx`**: 路由和全局Provider
- **`pages/Index.tsx`**: 首页，包含吸顶头部、搜索、咖啡馆卡片列表
- **`pages/CafeDetailPage.tsx`**: 详情页的页面级容器，负责背景和整体布局
- **`components/CafeCard.tsx`**: 首页咖啡馆卡片组件
- **`components/CafeDetail.tsx`**: 详情页核心内容组件，包含图片轮播、所有文本信息、按钮、地图等
- **`components/ui/`**: `shadcn/ui` 组件
- **`services/cafeService.ts`**: 封装了对后端API的调用
- **`types.ts`**: 定义了如 `Cafe` 等TypeScript类型

### 重要注意事项和未来工作提示

- **环境变量**：前端可能需要通过 `.env` 文件配置 `VITE_MAPS_API_KEY` (用于静态地图等) 和后端API的基础URL
- **图片加载**：目前图片链接最终应指向S3
- **`isOpenNow`状态**：前端直接使用从后端获取的 `isOpenNow` 布尔值，该值由后端（未来是定期任务）计算
- **按距离排序功能**：这是用户提出的未来需求，需要在前端获取用户位置，并传递给后端API来实现
- **响应式设计**：虽然已对手机端做了很多调整，但后续适配平板和PC端时，首页卡片列表的列数（一行多个卡片）和整体布局可能需要进一步的响应式处理
