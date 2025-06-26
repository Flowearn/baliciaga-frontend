/**
 * Applies a dynamic immersive theme by overriding Amplify's root CSS variables.
 * @param pantoneColor The random background color for the theme.
 */
export const applyImmersiveTheme = (pantoneColor: string): void => {
  const root = document.documentElement;
  
  // --- 这里是魔法发生的地方 ---
  // 我们直接告诉Amplify，它的主要和次要背景色现在是什么
  root.style.setProperty('--amplify-colors-background-primary', pantoneColor);
  root.style.setProperty('--amplify-colors-background-secondary', pantoneColor);

  // 同时，我们强制所有主要的文字颜色变为白色，以确保可读性
  root.style.setProperty('--amplify-colors-font-primary', '#FFFFFF');
  root.style.setProperty('--amplify-colors-font-secondary', '#FFFFFF');
  root.style.setProperty('--amplify-colors-font-inverse', '#FFFFFF');

  // 为了整体协调，我们也可以一并更新边框颜色
  root.style.setProperty('--amplify-colors-border-primary', pantoneColor);
  root.style.setProperty('--amplify-colors-border-secondary', 'rgba(255, 255, 255, 0.5)');
};

/**
 * Resets the immersive theme by removing the overridden CSS variables,
 * allowing the default Amplify theme to take over again.
 */
export const resetDefaultTheme = (): void => {
  const root = document.documentElement;

  // 移除我们所有自定义的属性，让一切恢复默认
  root.style.removeProperty('--amplify-colors-background-primary');
  root.style.removeProperty('--amplify-colors-background-secondary');
  root.style.removeProperty('--amplify-colors-font-primary');
  root.style.removeProperty('--amplify-colors-font-secondary');
  root.style.removeProperty('--amplify-colors-font-inverse');
  root.style.removeProperty('--amplify-colors-border-primary');
  root.style.removeProperty('--amplify-colors-border-secondary');
};