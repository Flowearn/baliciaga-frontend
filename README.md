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

## Key Features & Recent Updates

* **Core Stack:** Built with React, TypeScript, and Vite for a fast development experience and optimized production builds.

* **UI & Styling:** Utilizes shadcn/ui component library and Tailwind CSS for a modern, responsive user interface. Icons by Lucide React.

* **Routing:** Implements client-side SPA routing using React Router DOM, with `vercel.json` configured for correct deep linking on Vercel.

* **Data Handling:** Uses TanStack React Query for efficient server state management, data fetching (from backend API via `cafeService.ts`), and caching.

* **Cafe Discovery & Display:**
  * Displays a list of cafes on the homepage (`Index.tsx`) with individual cards (`CafeCard.tsx`).
  * Provides a detailed view for each cafe (`CafeDetailPage.tsx` + `CafeDetail.tsx`).
  * Image carousels for cafe photos with autoplay functionality.
  * Optimized WebP images (restaurant photos and static maps) served from S3 (via backend API).

* **Interactive UX Features:**
  * **Geolocation & Distance Sorting:** Automatically sorts cafes by distance from the user's current location (with permission), refreshes stale location data on tab focus, and gracefully falls back to default sort if location is unavailable. Distances are displayed.
  * **Search Functionality:** Modal-based search on the homepage, triggered by an icon, with real-time filtering and navigation to detail pages from results.
  * **Native Share Functionality:** Implemented on detail pages using the Web Share API, with a clipboard fallback.
  * **Scroll-to-Top:** Clicking the "Baliciaga" logo in headers scrolls the page to the top.
  * **Consistent Headers:** Sticky header on detail page, refined layouts and padding on both homepage and detail page headers.
  * **Dynamic Content Display:** Shows real-time open/closed status, formatted opening hours, and cafe attributes (dog-friendly, outdoor seating, vegetarian options).

* **Deployment:** Deployed on Vercel, utilizing environment variables for API configuration.

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

### 2025-06-16 本地开发提醒

**热更新机制**
- 修改代码后**无需重启** Vite 开发服务器
- 保存文件即可触发热更新，浏览器自动刷新
- 仅在修改核心配置文件 (vite.config.ts, package.json) 时需要重启服务

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

### 2025-06-16 组件概览

#### 租赁模块核心组件

**ListingCard** (`src/features/rentals/components/ListingCard.tsx`)
- **责任**：展示房源卡片，包含标题、图片、价格、状态胶囊
- **图片比例**：4:3 (`aspect-[4/3]`)
- **状态胶囊**：绝对定位 `top-5 right-5`，包含占用状态和可用性信息

**EditListingForm** (`src/features/rentals/components/EditListingForm.tsx`)
- **责任**：房源编辑表单，支持图片上传、价格设置、详情修改
- **关联页面**：EditListingPage.tsx 作为页面容器

**CreateListingPage** (`src/features/rentals/pages/CreateListingPage.tsx`)
- **责任**：新建房源页面，集成AI辅助表单和图片处理
- **特性**：支持拖拽上传、智能信息提取

**MyApplicationCard** (`src/features/rentals/components/MyApplicationCard.tsx`)
- **责任**：显示用户申请记录，包含房源信息和申请状态
- **图片比例**：16:9 (`aspect-video`)
- **状态管理**：支持取消申请、状态追踪

### 2025-06-16 共享样式约定

#### Tailwind CSS 颜色规范

**品牌核心色彩**
- **绿色成功状态**：`bg-green-500` (对应 #22C55E)
- **玫红警告/取消**：`bg-rose-500`
- **CTA主色调**：`#B7AC93` (金棕色，用于按钮和强调元素)

**状态胶囊颜色映射**
- `active` 状态：`bg-green-500` (活跃房源)
- `closed` 状态：`bg-gray-600` (已完成)
- `cancelled` 状态：`bg-rose-500` (已取消)

#### 图片比例标准

**列表卡片图片**：4:3 比例 (`aspect-[4/3]`)
- 用于 ListingCard 主图显示
- 确保网格布局一致性

**申请卡片图片**：16:9 比例 (`aspect-video`)
- 用于 MyApplicationCard 缩略图
- 适配横向布局展示

#### 状态胶囊实现

**绝对定位规范**
```tsx
className="absolute top-5 right-5 z-[2] rounded-full px-3 py-0.5 text-xs font-semibold text-white shadow-md shadow-black/20"
```

**逻辑来源**：根据 `listing.status` 和 `acceptedApplicantsCount/totalSpots` 计算
**颜色映射**：按状态自动分配对应的 Tailwind 背景色类
**层级控制**：使用 `z-[2]` 确保胶囊在图片上层显示

### 2025-06-16 价格格式化工具

#### formatPrice 函数 (`src/utils/currencyUtils.ts`)

**函数签名**
```typescript
formatPrice(amount: number, currency: string = 'IDR'): string
```

**输出格式**
- **IDR**：`Rp 25,000k` (千位简化显示)
- **USD**：`$1,234` (标准货币格式)
- **其他货币**：遵循 Intl.NumberFormat 标准

**使用示例**
```typescript
formatPrice(25000000, 'IDR') // => "Rp 25,000k"
formatPrice(1234, 'USD')     // => "$1,234"
```

**错误处理**：对于无效金额返回 'Price Unavailable'，不支持的货币使用回退格式

## 近期主要更新 (自2025年5月下旬以来)

### **核心功能与用户体验增强**

#### **分类切换功能 (`Index.tsx`)**
* 首页顶部新增 "Cafe" 和 "Bar" 分类切换按钮，允许用户浏览不同类型的地点列表
* `cafeService.ts` 和 `Index.tsx` 中的数据请求逻辑已更新，能根据所选分类从后端API (`/api/places?type=cafe|bar`) 获取对应数据
* URL参数自动同步分类状态，支持直接访问 `/?type=bar` 或 `/?type=cafe`

#### **滚动恢复机制 (`App.tsx`, `Index.tsx`)**
* **架构升级**: 前端路由从传统的 `<BrowserRouter>` 迁移到使用 `createBrowserRouter` (React Router v6 Data Router)
* 在根布局中集成了 `<ScrollRestoration getKey={(location) => location.pathname + location.search} />` 组件，实现更准确的滚动位置恢复
* **用户位置优化**: 优化了 `Index.tsx` 中 `userLocation` 状态的初始化逻辑，通过 `sessionStorage` 快速恢复最近的用户位置（15分钟"新鲜度"检查），为滚动恢复提供稳定的初始布局
* **智能地理位置管理**: 
  - 组件挂载时自动从缓存恢复位置，并根据缓存状态调整获取新位置的延迟（有缓存时2秒延迟，无缓存时100ms延迟）
  - 标签页可见性变化时，检查位置数据是否过期并按需更新
  - 增强的错误处理，区分不同的 `GeolocationPositionError` 类型，提供智能的存储清理策略

#### **图片加载策略优化 (`Index.tsx`, `CafeCard.tsx`)**
* 移除了 `Index.tsx` 中原有的、可能导致加载顺序不符合预期的 JavaScript 图片预加载逻辑
* 现在主要依赖 `CafeCard.tsx` 中 `<img>` 标签的 `loading="lazy"` 属性进行浏览器原生懒加载，实现"视口优先"的图片加载
* **骨架屏组件**: 新增 `CafeCardSkeleton.tsx` 组件，在数据加载时显示，改善用户体验和布局稳定性（辅助滚动恢复）

#### **详情页交互增强 (`CafeDetail.tsx`)**
* 新增 "Book a table" 按钮，当地点数据中包含有效的 `table` 字段（预订URL）时显示，直接链接到预订页面
* 优化了操作按钮行（包含 "Delivery", "Share", "Book a table"）中各按钮内部图标与文字的间距和对齐

#### **全局分享功能**
* 在主导航的下拉菜单中新增"Share"按钮，允许用户分享当前的首页URL
* 能正确区分并分享 `/?type=cafe` 或 `/?type=bar` 的URL
* 使用 Web Share API 并包含剪贴板回退机制

### **UI样式与交互改进**
* 对 "Cafe" / "Bar" 分类切换按钮的选中和未选中状态进行了多轮样式优化
* 改进了搜索模态框的用户体验，支持分类特定的搜索提示文本
* 优化了各种错误状态的用户反馈，使用 Toast 通知提供清晰的错误指引

### **技术架构升级**
* **路由**: 升级到 React Router v6 Data Router (`createBrowserRouter`)
* **状态管理**: 继续使用 React Hooks + TanStack Query (`useQuery`)
* **错误处理**: 增强的地理位置错误处理，包含失败计数跟踪和智能重试机制
* **性能优化**: 通过 `sessionStorage` 缓存和智能延迟策略，提升应用响应性

### **已知依赖与关键组件**
* 路由: `react-router-dom` (v6 Data Router)
* 状态管理: React Hooks, TanStack Query (`useQuery`)
* UI组件库: `shadcn/ui`, `lucide-react` (图标)
* 地理位置: 浏览器原生 `navigator.geolocation` API
* 持久化: `sessionStorage` 用于用户位置缓存

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
- **`src/models/BaliciagaCafe.js`
