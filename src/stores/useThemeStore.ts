import { create } from 'zustand';

// 定义"沉浸式主题"对象的结构
export interface ImmersiveTheme {
  backgroundColor: string;
  foregroundColor: string;
}

// 定义State和Actions的接口
interface ThemeState {
  activeTheme: ImmersiveTheme | null;
  setImmersiveTheme: (theme: ImmersiveTheme | null) => void;
}

/**
 * 一个用于管理全局页头沉浸式主题的Zustand store。
 * `activeTheme` 为null时，表示使用默认主题。
 * `activeTheme` 为一个对象时，表示使用沉浸式主题。
 */
export const useThemeStore = create<ThemeState>((set) => ({
  activeTheme: null,
  setImmersiveTheme: (theme) => set({ activeTheme: theme }),
})); 