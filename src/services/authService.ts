/**
 * 认证服务 - 无密码认证流程
 * 
 * 提供基于邮箱+验证码的两步认证流程：
 * 1. 发送验证码到邮箱
 * 2. 验证输入的验证码
 */

import { signIn, signUp, confirmSignIn, confirmSignUp } from 'aws-amplify/auth';

export interface AuthStep1Response {
  success: boolean;
  challengeName?: string;
  session?: string;
  error?: string;
}

export interface AuthStep2Response {
  success: boolean;
  user?: any; // eslint-disable-line @typescript-eslint/no-explicit-any
  error?: string;
}

/**
 * 第一步：发送验证码到用户邮箱
 * 
 * @param email 用户邮箱地址
 * @returns Promise<AuthStep1Response>
 */
export const sendVerificationCode = async (email: string): Promise<AuthStep1Response> => {
  try {
    console.log('🔐 发送验证码到邮箱:', email);
    
    // 调用 signIn() 会触发我们的自定义认证流程
    // 这会自动调用后端的 CreateAuthChallenge，向邮箱发送验证码
    // 使用 CUSTOM_WITHOUT_SRP 流程，这是 AWS Amplify v6 中无密码认证的关键
    const result = await signIn({
      username: email,
      options: {
        authFlowType: 'CUSTOM_WITHOUT_SRP'
      }
    });
    
    console.log('✅ 验证码发送成功，结果:', result);
    console.log('📊 详细分析 nextStep:', result.nextStep);
    console.log('📊 isSignedIn:', result.isSignedIn);
    console.log('📊 signInStep:', result.nextStep?.signInStep);
    
    if (result.isSignedIn) {
      // 如果已经登录，直接返回成功
      return {
        success: true
      };
    } else if (result.nextStep?.signInStep === 'CONFIRM_SIGN_IN_WITH_CUSTOM_CHALLENGE') {
      // 需要完成自定义挑战（验证码验证）
      return {
        success: true,
        challengeName: 'CUSTOM_CHALLENGE',
        session: 'session'
      };
    } else if (result.nextStep) {
      // 如果有 nextStep 但不是我们期望的类型，仍然认为成功（可能是不同的挑战类型）
      console.log('⚠️ 意外的 signInStep 类型，但继续流程:', result.nextStep.signInStep);
      return {
        success: true,
        challengeName: 'CUSTOM_CHALLENGE',
        session: 'session'
      };
    } else {
      console.error('❌ 没有有效的 nextStep:', result);
      return {
        success: false,
        error: '登录流程异常，请重试'
      };
    }
    
  } catch (error: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
    console.error('❌ 发送验证码失败:', error);
    
    // 处理不同类型的错误
    let errorMessage = '发送验证码失败，请稍后重试';
    
    if (error.name === 'UserNotFoundException') {
      errorMessage = '用户不存在，请先注册';
    } else if (error.name === 'UserNotConfirmedException') {
      errorMessage = '账户未激活，请先确认邮箱';
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
 * 第二步：验证用户输入的验证码
 * 
 * @param verificationCode 用户输入的6位验证码
 * @returns Promise<AuthStep2Response>
 */
export const verifyCode = async (
  verificationCode: string
): Promise<AuthStep2Response> => {
  try {
    console.log('🔐 验证输入的验证码:', verificationCode);
    
    // 发送验证码到后端进行验证
    // 这会调用我们的 VerifyAuthChallengeResponse 触发器
    const result = await confirmSignIn({
      challengeResponse: verificationCode
    });
    
    console.log('✅ 验证码验证成功，用户已登录:', result);
    
    if (result.isSignedIn) {
      return {
        success: true,
        user: result
      };
    } else {
      return {
        success: false,
        error: '验证失败，请重试'
      };
    }
    
  } catch (error: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
    console.error('❌ 验证码验证失败:', error);
    
    // 处理不同类型的错误
    let errorMessage = '验证码错误，请重新输入';
    
    if (error.name === 'NotAuthorizedException') {
      errorMessage = '验证码错误或已过期';
    } else if (error.name === 'CodeMismatchException') {
      errorMessage = '验证码错误，请检查后重新输入';
    } else if (error.name === 'ExpiredCodeException') {
      errorMessage = '验证码已过期，请重新发送';
    } else if (error.name === 'TooManyFailedAttemptsException') {
      errorMessage = '尝试次数过多，请稍后再试';
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
 * 验证OTP验证码（按照用户要求的新函数）
 * 
 * @param code 用户输入的6位验证码
 * @returns Promise with isSignedIn and nextStep
 */
export const verifyOtpCode = async (code: string) => {
  try {
    // 首先尝试作为登录确认（对于已存在且已确认的用户）
    try {
      const { isSignedIn, nextStep } = await confirmSignIn({ challengeResponse: code });
      console.log('[authService] Login verification successful:', { isSignedIn, nextStep });
      return { isSignedIn, nextStep };
    } catch (signInError: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
      console.log('[authService] confirmSignIn failed, trying confirmSignUp:', signInError.name);
      
      // 如果登录确认失败，可能是新用户需要先确认注册
      if (signInError.name === 'SignInException') {
        console.log('[authService] Attempting confirmSignUp for new user verification...');
        
        // 我们需要先从某个地方获取用户名，这里使用最后使用的邮箱
        // 在实际应用中，您可能需要将邮箱存储在组件状态中
        const username = localStorage.getItem('currentVerificationEmail') || '';
        
        const signUpResult = await confirmSignUp({
          username: username,
          confirmationCode: code
        });
        
        console.log('[authService] Sign up confirmation successful:', signUpResult);
        
        // 确认注册成功后，立即尝试登录
        if (signUpResult.isSignUpComplete) {
          console.log('[authService] Sign up complete, attempting login...');
          
          const loginResult = await signIn({
            username: username,
            options: {
              authFlowType: 'CUSTOM_WITHOUT_SRP'
            }
          });
          
          console.log('[authService] Auto-login after signup confirmation:', loginResult);
          
          if (loginResult.isSignedIn) {
            return { isSignedIn: true, nextStep: loginResult.nextStep };
          } else if (loginResult.nextStep?.signInStep === 'CONFIRM_SIGN_IN_WITH_CUSTOM_CHALLENGE') {
            // 需要再次验证同一个验证码
            const finalResult = await confirmSignIn({ challengeResponse: code });
            console.log('[authService] Final verification successful:', finalResult);
            return { isSignedIn: finalResult.isSignedIn, nextStep: finalResult.nextStep };
          }
        }
        
        // 如果上述流程都失败了，返回注册确认的结果
        return { isSignedIn: false, nextStep: undefined };
      } else {
        // 重新抛出其他类型的错误
        throw signInError;
      }
    }
  } catch (error) {
    console.error('[authService] Error verifying code:', error);
    throw error;
  }
};

/**
 * 注册新用户（如果需要）
 * 
 * @param email 用户邮箱
 * @returns Promise<AuthStep1Response>
 */
export const registerUser = async (email: string): Promise<AuthStep1Response> => {
  try {
    console.log('🔐 注册新用户:', email);
    
    // 使用邮箱作为用户名进行注册
    // 在无密码系统中，我们需要提供一个临时密码但用户不会使用它
    const tempPassword = Math.random().toString(36).slice(-12) + 'A1!'; // 临时密码（符合AWS要求）
    
    const result = await signUp({
      username: email,
      password: tempPassword,
      options: {
        userAttributes: {
          email: email
        },
        autoSignIn: false // 禁用自动登录，因为我们将使用自定义流程
      }
    });
    
    console.log('✅ 用户注册成功:', result);
    
    // 注册成功后，直接尝试发送验证码
    return await sendVerificationCode(email);
    
  } catch (error: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
    console.error('❌ 用户注册失败:', error);
    
    let errorMessage = '注册失败，请稍后重试';
    
    if (error.name === 'UsernameExistsException') {
      // 用户已存在，直接尝试发送验证码
      console.log('ℹ️ 用户已存在，尝试发送验证码');
      return await sendVerificationCode(email);
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
 * 使用邮箱和密码注册新用户
 * 
 * @param email 用户邮箱
 * @param password 用户密码
 * @returns Promise<AuthStep1Response>
 */
export const signUpWithPassword = async (email: string, password: string): Promise<AuthStep1Response> => {
  try {
    console.log('🔐 使用密码注册新用户:', email);
    
    const result = await signUp({
      username: email,
      password,
      options: {
        userAttributes: {
          email,
        },
      },
    });
    
    console.log('✅ 密码注册成功:', result);
    
    return {
      success: true,
      challengeName: 'PASSWORD_SIGNUP',
      session: 'session'
    };
    
  } catch (error: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
    console.error('❌ 密码注册失败:', error);
    
    let errorMessage = '注册失败，请稍后重试';
    
    if (error.name === 'UsernameExistsException') {
      errorMessage = '该邮箱已注册，请尝试登录';
    } else if (error.name === 'InvalidParameterException') {
      errorMessage = '邮箱格式不正确或密码不符合要求';
    } else if (error.name === 'InvalidPasswordException') {
      errorMessage = '密码必须至少8位，包含大小写字母、数字和特殊字符';
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
 * 使用邮箱和密码登录
 * 
 * @param email 用户邮箱
 * @param password 用户密码
 * @returns Promise<AuthStep2Response>
 */
export const signInWithPassword = async (email: string, password: string): Promise<AuthStep2Response> => {
  try {
    console.log('🔐 使用密码登录:', email);
    
    const result = await signIn({ 
      username: email, 
      password 
    });
    
    console.log('✅ 密码登录成功:', result);
    
    if (result.isSignedIn) {
      return {
        success: true,
        user: result
      };
    } else {
      return {
        success: false,
        error: '登录失败，请重试'
      };
    }
    
  } catch (error: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
    console.error('❌ 密码登录失败:', error);
    
    let errorMessage = '登录失败，请检查邮箱和密码';
    
    if (error.name === 'UserNotFoundException') {
      errorMessage = '用户不存在，请先注册';
    } else if (error.name === 'NotAuthorizedException') {
      errorMessage = '邮箱或密码错误';
    } else if (error.name === 'UserNotConfirmedException') {
      errorMessage = '账户未激活，请先确认邮箱';
    } else if (error.name === 'TooManyRequestsException') {
      errorMessage = '尝试次数过多，请稍后再试';
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    return {
      success: false,
      error: errorMessage
    };
  }
}; 