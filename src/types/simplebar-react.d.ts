declare module 'simplebar-react' {
  import { ComponentType, ReactNode } from 'react';

  export interface SimpleBarProps {
    children?: ReactNode;
    className?: string;
    style?: React.CSSProperties;
    scrollableNodeProps?: Record<string, any>;
    options?: Record<string, any>;
    clickOnTrack?: boolean;
  }

  const SimpleBar: ComponentType<SimpleBarProps>;
  export default SimpleBar;
}
