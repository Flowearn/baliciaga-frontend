# Baliciaga Frontend - 租赁功能文档

## 概述

本文档介绍 Baliciaga 前端租赁功能的核心组件、关键功能实现和重要的 UI 修复。该文档面向前端开发者，旨在帮助理解和维护租赁相关的前端代码。

## 核心组件

### OptimizedImage.tsx

**位置**: `src/components/OptimizedImage.tsx`

**描述**: 这是我们全站统一的图片渲染组件，旨在提供极致的性能和用户体验。

**核心技术**:
- 从原生的 `loading="lazy"` 升级为使用自定义的 **IntersectionObserver**，实现更精确、可控的懒加载
- 使用 React Hooks (`useEffect`, `useState`) 管理图片加载状态
- 支持动态切换图片源而不重新创建 DOM 元素

**关键配置**:
- `rootMargin` 设置为 `'350px'`，优化快速滚动时的预加载体验
- 当图片进入视口前 350px 时开始加载，确保用户滚动到图片时已经加载完成

**内置功能**:
- 自带骨架屏（Skeleton）加载状态，提供流畅的加载体验
- 支持错误处理和重试机制
- 自动适配不同尺寸和纵横比

**使用示例**:
```tsx
<OptimizedImage
  src={imageUrl}
  alt="Property image"
  className="w-full h-48 object-cover"
/>
```

## 新功能：租赁时长选择 (Lease Duration Feature)

### 可复用组件：LeaseDurationSelector.tsx

**位置**: `src/features/rentals/components/LeaseDurationSelector.tsx`

**描述**: 负责渲染 5 个租赁时长选项的按钮组，提供统一的租期选择体验。

**选项**:
1. 1-3 months (短租)
2. 4-6 months (中短期)
3. 7-11 months (中期)
4. 1 year (年租)
5. Negotiable (可协商)

### 发布流程集成

**位置**: `src/features/rentals/pages/CreateListingPage.tsx`

在发布房源时，`LeaseDurationSelector` 组件被用于让发布者**必须**选择一个租期：
- 作为表单的必填项
- 选中的值会存储在 `leaseDuration` 字段
- 提交时会进行验证，确保已选择租期

### 申请流程集成

**位置**: `src/features/rentals/components/ApplicationModal.tsx`

在申请房源时，`LeaseDurationSelector` 组件被**条件渲染**：
- 仅当房源的 `leaseDuration` 为 "Negotiable" 时出现
- 成为申请人的必选项
- 申请人选择的期望租期会随申请一起提交

### 展示逻辑

在以下组件中，通过"徽章(Badge)"的形式展示租期信息：

**ListingCard.tsx**:
- 租期徽章叠放在主图的左上角
- 使用半透明背景确保在各种图片上都清晰可见
- 根据租期类型显示不同的颜色

**ListingDetailPage.tsx**:
- 在详情页的图片轮播上显示租期徽章
- 在房源信息区域也有文字说明
- 为 "Negotiable" 类型特别标注，提示申请人可以选择期望租期

## 性能优化：图片轮播预加载

### 问题背景

在卡片组件（如房源卡片、咖啡馆卡片）上快速左右滑动图片时，用户会遇到加载延迟，影响体验。

### 解决方案

在轮播组件中实现了 `n+1` 图片智能预加载逻辑：

**实现位置**: 
- `src/features/cafes/components/CafeCard.tsx`
- `src/features/rentals/components/ListingCard.tsx`

**核心逻辑**:
```tsx
useEffect(() => {
  // 预加载下一张图片
  if (images && currentIndex < images.length - 1) {
    const nextImage = new Image();
    nextImage.src = images[currentIndex + 1];
  }
}, [currentIndex, images]);
```

**优化效果**:
- 当用户查看当前图片时，下一张图片已在后台加载
- 切换图片时实现无缝过渡
- 不会过度预加载，避免浪费带宽

## 重要修复总结

### 1. 全局主题统一

**修改文件**: `src/index.css`

**问题**: 原有的"奶油色"背景与现代设计趋势不符

**解决方案**:
- 修改 CSS 变量，将全局背景色从"奶油色"统一为纯白色
- 更新相关组件的背景色配置
- 确保所有页面保持一致的视觉风格

### 2. 全局页头优化

**修改文件**: 
- `src/App.tsx` (MainLayout 组件)
- `src/components/GlobalHeader.tsx`

**问题**: 
- 页头高度不自适应内容
- 页头与内容区之间缺少合适的间距

**解决方案**:
- 重构 `MainLayout` 布局结构，使用 Flexbox 实现自适应高度
- 在 `GlobalHeader` 中移除固定高度，让内容决定高度
- 添加适当的 padding 和 margin，确保视觉层次清晰

### 3. 响应式布局改进

**影响范围**: 所有列表页和详情页

**改进内容**:
- 优化移动端的间距和字体大小
- 改进平板设备上的网格布局
- 确保所有交互元素在触摸设备上有足够的点击区域

## 开发指南

### 组件复用原则

1. **优先使用 OptimizedImage**: 所有图片展示都应使用此组件，确保性能一致性
2. **保持组件单一职责**: 如 `LeaseDurationSelector` 只负责租期选择，不处理业务逻辑
3. **统一的加载状态**: 使用项目中定义的 Skeleton 组件，保持加载体验一致

### 性能优化建议

1. **图片优化**:
   - 使用适当的图片格式（WebP 优先）
   - 提供多种尺寸的图片源
   - 实施渐进式加载策略

2. **代码分割**:
   - 对大型组件使用动态导入
   - 路由级别的代码分割已通过 React Router 实现

3. **状态管理**:
   - 使用 React Query 缓存 API 数据
   - 避免不必要的组件重渲染

### 测试重点

1. **图片加载测试**:
   - 验证懒加载功能正常工作
   - 测试网络慢速情况下的体验
   - 确保错误处理机制有效

2. **租期功能测试**:
   - 测试所有租期选项的选择和提交
   - 验证条件渲染逻辑（特别是 Negotiable 情况）
   - 确保数据正确保存和展示

3. **响应式测试**:
   - 在各种设备尺寸上测试布局
   - 验证触摸交互的可用性
   - 确保性能在移动设备上可接受

## 未来改进方向

1. **图片 CDN 集成**: 计划集成图片 CDN 服务，提供自动优化和全球加速
2. **虚拟滚动**: 对于大量房源列表，实施虚拟滚动以提升性能
3. **离线支持**: 使用 Service Worker 实现基本的离线浏览功能
4. **A/B 测试框架**: 建立前端 A/B 测试能力，优化用户体验

## 相关文档

- [API 文档](../api/README.md)
- [设计系统](../design-system/README.md)
- [部署指南](../deployment/README.md)

---

最后更新：2024-06-25