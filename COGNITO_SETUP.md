# AWS Cognito 配置说明

## 获取 Cognito 配置信息

当前 `src/amplify-config.ts` 文件中使用的是占位符值，需要替换为实际的 AWS Cognito 资源 ID。

### 方法一：从 AWS CloudFormation 控制台获取

1. 登录 AWS 控制台
2. 前往 CloudFormation 服务
3. 找到名为 `baliciaga-backend-dev` 的堆栈
4. 点击 "Outputs" 标签页
5. 查找以下两个值：
   - `CognitoUserPoolId` 
   - `CognitoUserPoolClientId`

### 方法二：使用 AWS CLI 获取

```bash
# 获取 User Pool ID
aws cloudformation describe-stacks \
  --stack-name baliciaga-backend-dev \
  --query 'Stacks[0].Outputs[?OutputKey==`CognitoUserPoolId`].OutputValue' \
  --output text

# 获取 User Pool Client ID  
aws cloudformation describe-stacks \
  --stack-name baliciaga-backend-dev \
  --query 'Stacks[0].Outputs[?OutputKey==`CognitoUserPoolClientId`].OutputValue' \
  --output text
```

### 方法三：从 Serverless 部署输出获取

运行后端部署后，在终端输出中查找：

```
Stack Outputs:
CognitoUserPoolId: ap-southeast-1_xxxxxxxxx
CognitoUserPoolClientId: xxxxxxxxxxxxxxxxxxxxxxxxxx
```

## 更新配置文件

获得实际值后，更新 `src/amplify-config.ts` 文件：

```typescript
const amplifyConfig = {
  Auth: {
    Cognito: {
      userPoolId: 'ap-southeast-1_YOUR_ACTUAL_USER_POOL_ID',
      userPoolClientId: 'YOUR_ACTUAL_USER_POOL_CLIENT_ID',
      // ... 其他配置保持不变
    },
  },
};
```

## 功能验证

配置完成后，应用启动时会自动显示登录界面，包括：
- ✅ 用户注册
- ✅ 邮箱验证  
- ✅ 用户登录
- ✅ 忘记密码
- ✅ 退出登录

只有成功登录的用户才能访问主应用内容。 