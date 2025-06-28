# Baliciaga Frontend Deployment Guide

## Production Environment Variables

The following environment variables need to be configured in Vercel:

```
VITE_COGNITO_USER_POOL_ID=ap-southeast-1_5ZYL8OsmV
VITE_COGNITO_CLIENT_ID=3n9so3j4rlh21mebhjo39nperk
VITE_API_BASE_URL=https://p49odugj92.execute-api.ap-southeast-1.amazonaws.com/prod
```

## Setting Environment Variables in Vercel

1. Go to your Vercel project dashboard
2. Navigate to Settings → Environment Variables
3. Add each of the above variables:
   - Select "Production" environment
   - Add the variable name and value
   - Click "Save"

4. Trigger a new deployment to apply the changes:
   - Either push a new commit
   - Or click "Redeploy" in the Vercel dashboard

## Verifying the Configuration

After deployment, the avatar upload functionality should work correctly. The network error (ERR_NETWORK) was caused by the incorrect API URL configuration.

## Backend API Endpoint

The production API endpoint is deployed at:
- `https://p49odugj92.execute-api.ap-southeast-1.amazonaws.com/prod`

This was retrieved using:
```bash
aws cloudformation describe-stacks --stack-name baliciaga-backend-prod --region ap-southeast-1
```