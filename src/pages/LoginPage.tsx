import { Authenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthenticator } from '@aws-amplify/ui-react';

const formFields = {
  signUp: {
    email: {
      order: 1,
      isRequired: true,
    },
    password: {
      order: 2,
      isRequired: true,
    },
    confirm_password: {
      order: 3,
      isRequired: true,
    },
  },
};

const components = {
  Header() {
    return null; // 隐藏默认头部，使用我们自定义的
  },
  SignIn: {
    Header() {
      return null;
    },
  },
  SignUp: {
    Header() {
      return null;
    },
  },
};

const LoginPage = () => {
  const navigate = useNavigate();
  const { user } = useAuthenticator((context) => [context.user]);

  // Redirect to home page if user is already logged in
  useEffect(() => {
    if (user) {
      navigate('/', { replace: true });
    }
  }, [user, navigate]);

  // Replace authentication text for consistency
  useEffect(() => {
    const replaceAuthText = () => {
      // 替换标签页文本
      const tabs = document.querySelectorAll('[data-amplify-authenticator-tab]');
      tabs.forEach(tab => {
        if (tab.textContent?.includes('Sign In')) {
          tab.textContent = tab.textContent.replace('Sign In', 'Log In');
        }
        if (tab.textContent?.includes('Create Account')) {
          tab.textContent = tab.textContent.replace('Create Account', 'Sign Up');
        }
      });

      // 替换按钮文本
      const buttons = document.querySelectorAll('button[type="submit"]');
      buttons.forEach(button => {
        if (button.textContent?.includes('Sign in')) {
          button.textContent = button.textContent.replace('Sign in', 'Log In');
        }
        if (button.textContent?.includes('Create Account')) {
          button.textContent = button.textContent.replace('Create Account', 'Sign Up');
        }
      });

      // 替换其他可能的认证相关文本
      const allElements = document.querySelectorAll('*');
      allElements.forEach(element => {
        if (element.children.length === 0) {
          const text = element.textContent?.trim();
          if (text === 'Sign In') {
            element.textContent = 'Log In';
          } else if (text === 'Sign in') {
            element.textContent = 'Log In';
          } else if (text === 'Create Account') {
            element.textContent = 'Sign Up';
          }
        }
      });
    };

    // 初始替换
    const timer = setTimeout(replaceAuthText, 100);

    // 监听 DOM 变化
    const observer = new MutationObserver(replaceAuthText);
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true
    });

    return () => {
      clearTimeout(timer);
      observer.disconnect();
    };
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Log in to Baliciaga
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Access all features including room applications and property listings
          </p>
        </div>
        <div className="mt-8">
          <Authenticator 
            formFields={formFields}
            loginMechanisms={['email']}
            hideSignUp={false}
            components={components}
          />
        </div>
      </div>
    </div>
  );
};

export default LoginPage; 