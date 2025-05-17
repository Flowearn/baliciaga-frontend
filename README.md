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
* `.env`: 存储环境变量（本地开发，不提交到Git）。

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
