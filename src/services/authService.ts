/**
 * 认证服务 - 传统密码认证流程
 * 
 * 提供基于邮箱+密码的注册和登录功能：
 * 1. 注册新用户
 * 2. 确认邮箱验证码
 * 3. 密码登录
 */

import { signIn, signUp, confirmSignUp, signOut, getCurrentUser } from 'aws-amplify/auth';

export interface AuthResponse {
  success: boolean;
  user?: any;
  error?: string;
  needsConfirmation?: boolean;
}

/**
 * 注册新用户
 * @param email 用户邮箱
 * @param password 用户密码
 * @returns Promise<AuthResponse>
 */
export const signUpWithPassword = async (
  email: string,
  password: string
): Promise<AuthResponse> => {
  try {
    console.log('📝 注册新用户:', email);
    
    const result = await signUp({
      username: email,
      password: password,
      options: {
        userAttributes: {
          email: email
        }
      }
    });
    
    console.log('✅ 注册成功，需要邮箱确认:', result);
    
    return {
      success: true,
      needsConfirmation: !result.isSignUpComplete,
      user: result
    };
  } catch (error: any) {
    console.error('❌ 注册失败:', error);
    
    let errorMessage = '注册失败，请稍后重试';
    
    if (error.name === 'UsernameExistsException') {
      errorMessage = '该邮箱已被注册';
    } else if (error.name === 'InvalidPasswordException') {
      errorMessage = '密码不符合要求（至少8位，包含大小写字母和数字）';
    } else if (error.name === 'InvalidParameterException') {
      errorMessage = '邮箱格式不正确';
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    return {
      success: false,
      error: errorMessage
    };
  }
};

/**
 * 确认注册（验证邮箱）
 * @param email 用户邮箱
 * @param code 验证码
 * @returns Promise<AuthResponse>
 */
export const confirmSignUpCode = async (
  email: string,
  code: string
): Promise<AuthResponse> => {
  try {
    console.log('🔐 确认注册验证码:', email);
    
    const result = await confirmSignUp({
      username: email,
      confirmationCode: code
    });
    
    console.log('✅ 邮箱验证成功:', result);
    
    return {
      success: true,
      user: result
    };
  } catch (error: any) {
    console.error('❌ 验证失败:', error);
    
    let errorMessage = '验证失败，请重试';
    
    if (error.name === 'CodeMismatchException') {
      errorMessage = '验证码错误';
    } else if (error.name === 'ExpiredCodeException') {
      errorMessage = '验证码已过期，请重新发送';
    } else if (error.name === 'NotAuthorizedException') {
      errorMessage = '该账户已经验证过了';
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    return {
      success: false,
      error: errorMessage
    };
  }
};

/**
 * 用户登录
 * @param email 用户邮箱
 * @param password 用户密码
 * @returns Promise<AuthResponse>
 */
export const signInWithPassword = async (
  email: string,
  password: string
): Promise<AuthResponse> => {
  try {
    console.log('🔐 用户登录:', email);
    
    const result = await signIn({
      username: email,
      password: password
    });
    
    console.log('✅ 登录成功:', result);
    
    if (result.isSignedIn) {
      return {
        success: true,
        user: result
      };
    } else if (result.nextStep?.signInStep === 'CONFIRM_SIGN_UP') {
      return {
        success: false,
        needsConfirmation: true,
        error: '请先验证您的邮箱'
      };
    } else {
      return {
        success: false,
        error: '登录失败，请重试'
      };
    }
  } catch (error: any) {
    console.error('❌ 登录失败:', error);
    
    let errorMessage = '登录失败，请检查邮箱和密码';
    
    if (error.name === 'NotAuthorizedException') {
      errorMessage = '邮箱或密码错误';
    } else if (error.name === 'UserNotFoundException') {
      errorMessage = '用户不存在，请先注册';
    } else if (error.name === 'UserNotConfirmedException') {
      return {
        success: false,
        needsConfirmation: true,
        error: '请先验证您的邮箱'
      };
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    return {
      success: false,
      error: errorMessage
    };
  }
};

/**
 * 登出用户
 * @returns Promise<void>
 */
export const signOutUser = async (): Promise<void> => {
  try {
    await signOut();
    console.log('✅ 用户已登出');
  } catch (error) {
    console.error('❌ 登出失败:', error);
    throw error;
  }
};

/**
 * 获取当前登录用户
 * @returns Promise<any>
 */
export const fetchCurrentUser = async (): Promise<any> => {
  try {
    const user = await getCurrentUser();
    return user;
  } catch (error) {
    console.error('获取当前用户失败:', error);
    return null;
  }
};

/**
 * 请求重置密码（发送验证码）
 * @param email 用户邮箱
 * @returns Promise<AuthResponse>
 */
export const requestPasswordReset = async (email: string): Promise<AuthResponse> => {
  try {
    console.log('🔑 请求重置密码:', email);
    
    const { resetPassword } = await import('aws-amplify/auth');
    const result = await resetPassword({
      username: email
    });
    
    console.log('✅ 重置码已发送:', result);
    
    return {
      success: true,
      user: result
    };
  } catch (error: any) {
    console.error('❌ 发送重置码失败:', error);
    
    let errorMessage = '发送重置码失败，请稍后重试';
    
    if (error.name === 'UserNotFoundException') {
      errorMessage = '该邮箱未注册';
    } else if (error.name === 'LimitExceededException') {
      errorMessage = '请求过于频繁，请稍后再试';
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    return {
      success: false,
      error: errorMessage
    };
  }
};

/**
 * 确认重置密码（使用验证码设置新密码）
 * @param email 用户邮箱
 * @param code 验证码
 * @param newPassword 新密码
 * @returns Promise<AuthResponse>
 */
export const confirmPasswordReset = async (
  email: string,
  code: string,
  newPassword: string
): Promise<AuthResponse> => {
  try {
    console.log('🔐 确认密码重置:', email);
    
    const { confirmResetPassword } = await import('aws-amplify/auth');
    await confirmResetPassword({
      username: email,
      confirmationCode: code,
      newPassword: newPassword
    });
    
    console.log('✅ 密码重置成功');
    
    return {
      success: true
    };
  } catch (error: any) {
    console.error('❌ 密码重置失败:', error);
    
    let errorMessage = '密码重置失败，请重试';
    
    if (error.name === 'CodeMismatchException') {
      errorMessage = '验证码错误';
    } else if (error.name === 'ExpiredCodeException') {
      errorMessage = '验证码已过期，请重新发送';
    } else if (error.name === 'InvalidPasswordException') {
      errorMessage = '新密码不符合要求（至少8位，包含大小写字母和数字）';
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    return {
      success: false,
      error: errorMessage
    };
  }
};