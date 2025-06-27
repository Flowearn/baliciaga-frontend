import { Theme } from '@aws-amplify/ui-react';

export const baliciagaAmplifyTheme: Theme = {
  name: 'baliciaga-glassmorphism-theme',
  tokens: {
    colors: {
      brand: {
        primary: {
          10: { value: 'rgba(255, 255, 255, 0.1)' },
          20: { value: 'rgba(255, 255, 255, 0.2)' },
          30: { value: 'rgba(255, 255, 255, 0.3)' },
          40: { value: 'rgba(255, 255, 255, 0.4)' },
          60: { value: 'rgba(255, 255, 255, 0.6)' },
          80: { value: 'rgba(255, 255, 255, 0.8)' },
          90: { value: 'rgba(255, 255, 255, 0.9)' },
          100: { value: 'rgba(255, 255, 255, 1)' },
        },
        destructive: {
          20: { value: 'rgba(239, 68, 68, 0.2)' },
          30: { value: 'rgba(239, 68, 68, 0.3)' },
          40: { value: 'rgba(239, 68, 68, 0.4)' },
          50: { value: 'rgba(239, 68, 68, 0.5)' },
        },
      },
    },
    components: {
      button: {
        // 默认样式 - 玻璃态效果
        backgroundColor: { value: 'rgba(255, 255, 255, 0.2)' },
        color: { value: '#ffffff' },
        borderColor: { value: 'rgba(255, 255, 255, 0.3)' },
        borderWidth: { value: '1px' },
        borderStyle: { value: 'solid' },
        borderRadius: { value: '9999px' }, // 完全圆角
        backdropFilter: { value: 'blur(8px)' },
        fontWeight: { value: '600' },
        fontSize: { value: '0.875rem' },
        paddingInline: { value: '1rem' },
        paddingBlock: { value: '0.5rem' },
        transition: { value: 'all 0.2s ease-in-out' },
        cursor: { value: 'pointer' },
        
        // 悬停状态
        _hover: {
          backgroundColor: { value: 'rgba(255, 255, 255, 0.3)' },
          borderColor: { value: 'rgba(255, 255, 255, 0.5)' },
        },
        
        // 聚焦状态
        _focus: {
          outline: { value: 'none' },
          boxShadow: { value: '0 0 0 2px rgba(59, 130, 246, 0.5)' },
        },
        
        // 禁用状态
        _disabled: {
          opacity: { value: '0.6' },
          cursor: { value: 'not-allowed' },
        },
        
        // Primary 变体
        primary: {
          backgroundColor: { value: 'rgba(255, 255, 255, 0.3)' },
          _hover: {
            backgroundColor: { value: 'rgba(255, 255, 255, 0.4)' },
          },
        },
        
        // Destructive 变体
        destructive: {
          backgroundColor: { value: 'rgba(239, 68, 68, 0.2)' },
          borderColor: { value: 'rgba(239, 68, 68, 0.3)' },
          _hover: {
            backgroundColor: { value: 'rgba(239, 68, 68, 0.3)' },
            borderColor: { value: 'rgba(239, 68, 68, 0.5)' },
          },
        },
        
        // Small 尺寸
        small: {
          fontSize: { value: '0.8125rem' },
          paddingInline: { value: '0.75rem' },
          paddingBlock: { value: '0.375rem' },
          height: { value: '2rem' },
        },
      },
    },
  },
};