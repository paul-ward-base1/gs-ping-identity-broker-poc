import React, { useMemo, ReactNode, ReactElement } from 'react';

type ChildrenElement = ReactElement<{ slot?: string }>;

type LayoutChildren = {
  banner: ReactElement | null;
  sidebar: ReactElement | null;
  content: ReactElement | null;
};

export function useLayoutChildren(children: ReactNode): LayoutChildren {
  return useMemo(() => {
    const elements: LayoutChildren = {
      banner: null,
      sidebar: null,
      content: null,
    };

    React.Children.forEach(children, (child: ReactNode) => {
      if (!React.isValidElement(child)) {
        return;
      }

      const element = child as ChildrenElement;
      const slot = element.props.slot;

      const name = slot && Object.prototype.hasOwnProperty.call(elements, slot) ? slot : 'content';

      elements[name as keyof LayoutChildren] = element;
    });

    return elements;
  }, [children]);
}
