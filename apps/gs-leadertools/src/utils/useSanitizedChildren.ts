import { Children, cloneElement, FunctionComponent, isValidElement, ReactElement, ReactNode, useMemo } from 'react';

interface useSanitizedChildrenProps {
  children: ReactNode;
  AllowedComponent: FunctionComponent;
  mergeProps?(el?: ReactElement, index?: number): object;
}

export const useSanitizedChildren = (props: useSanitizedChildrenProps) => {
  const { children, AllowedComponent, mergeProps } = props;

  return useMemo(
    () =>
      // @ts-ignore
      Children.map(children, (child: ReactElement, i: number) => {
        if (!isValidElement(child) || child.type !== AllowedComponent)
          throw new Error(`Component only accepts ${AllowedComponent.name} as children`);

        if (typeof mergeProps === 'function') return cloneElement(child, mergeProps(child, i));

        return child;
      }),
    [AllowedComponent, children, mergeProps]
  );
};
