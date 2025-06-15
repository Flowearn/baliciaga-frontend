# 前端部署配置指南

## 🚀 后端部署信息

**已成功部署的后端信息：**
- **Stage**: `dev`
- **Region**: `ap-southeast-1`
- **API Gateway 基础URL**: `https://77z66u4qd6.execute-api.ap-southeast-1.amazonaws.com/dev`

## 📋 需要完成的配置

### 1. 获取 Cognito 配置

您需要获取实际的 Cognito User Pool 配置并更新 `src/amplify-config.ts` 文件。

#### 方法一：AWS Console
1. 登录 [AWS Console](https://console.aws.amazon.com)
2. 前往 **Cognito** 服务
3. 在 **ap-southeast-1** 区域查找名为 `baliciaga-user-pool-dev` 的 User Pool
4. 记录下 **User Pool ID** (格式：`ap-southeast-1_xxxxxxxxx`)
5. 进入该 User Pool，查看 **App Integration** 标签页
6. 找到 App Client 并记录下 **Client ID**

#### 方法二：AWS CLI
```bash
# 获取 User Pool ID
aws cognito-idp list-user-pools --max-results 10 --region ap-southeast-1 --query 'UserPools[?contains(Name, `baliciaga-user-pool-dev`)].{Name:Name,Id:Id}' --output table

# 获取 Client ID (替换 USER_POOL_ID)
aws cognito-idp list-user-pool-clients --user-pool-id USER_POOL_ID --region ap-southeast-1 --query 'UserPoolClients[0].ClientId' --output text
```

#### 方法三：Serverless 输出（如果可用）
```bash
cd backend
npx serverless info --stage dev
```

### 2. 更新配置文件

获得实际值后，更新 `src/amplify-config.ts` 文件：

```typescript
const amplifyConfig = {
  Auth: {
    Cognito: {
      userPoolId: 'ap-southeast-1_YOUR_ACTUAL_USER_POOL_ID', // 替换这里
      userPoolClientId: 'YOUR_ACTUAL_CLIENT_ID', // 替换这里
      // ... 其他配置保持不变
    },
  },
};
```

## ✅ 已完成的配置

- ✅ **API Client**: 已配置 axios 客户端连接到后端 API
- ✅ **认证拦截器**: 自动添加 JWT token 到 API 请求
- ✅ **API 方法**: 预定义了所有后端 API 的调用方法
- ✅ **错误处理**: 统一的 HTTP 错误处理

## 🧪 测试连接

配置完成后，您可以测试前端与后端的连接：

1. 启动前端开发服务器：
   ```bash
   npm run dev
   ```

2. 访问应用，应该会看到 Amplify 提供的登录界面

3. 注册新用户或登录，验证认证流程是否正常

4. 登录后应该能访问主应用，且能正常调用后端 API

## 📝 API 端点

后端提供以下 API 端点：

### 公开端点（无需认证）
- `GET /places` - 获取所有场所
- `GET /places/{placeId}` - 获取特定场所详情
- `GET /listings` - 获取所有房源
- `GET /listings/{listingId}` - 获取特定房源详情

### 需要认证的端点
- `GET /users/me` - 获取用户资料
- `POST /listings` - 创建房源
- `POST /listings/{listingId}/applications` - 申请房源
- `GET /listings/{listingId}/applications` - 获取房源的申请（仅房主）
- `GET /users/me/applications` - 获取用户的申请
- `PUT /applications/{applicationId}` - 更新申请状态

## 🎯 下一步

配置完成后，您就可以：
1. 开发用户界面组件
2. 集成房源列表和详情页面
3. 实现用户申请流程
4. 添加房源管理功能 