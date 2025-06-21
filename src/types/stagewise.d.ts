declare module '@stagewise/toolbar-react' {
  import { ReactNode } from 'react';
  
  export interface ToolbarConfig {
    plugins?: any[];
    [key: string]: any;
  }
  
  export interface StagewiseToolbarProps {
    config?: ToolbarConfig;
    enabled?: boolean;
  }
  
  export function StagewiseToolbar(props: StagewiseToolbarProps): ReactNode;
}

declare module '@stagewise-plugins/react' {
  export const ReactPlugin: any;
}