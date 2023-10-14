import { useEffect, useState } from 'react';

const useHover = (props: { elementIds: string[] }) => {
  const [state, setState] = useState<Map<string, boolean>>(
    new Map(props.elementIds.map((id) => [id, false]))
  );

  const handleMouseEvent = (id: string, type: 'over' | 'out') => {
    setState((prev) => new Map(prev).set(id, type === 'over'));
  };

  useEffect(() => {
    props.elementIds.map((id) => {
      const element = document.getElementById(id);
      element?.addEventListener('mouseover', () => handleMouseEvent(id, 'over'));
      element?.addEventListener('mouseout', () => handleMouseEvent(id, 'out'));
    });

    return () => {
      props.elementIds.map((id) => {
        const element = document.getElementById(id);
        element?.removeEventListener('mouseover', () => handleMouseEvent(id, 'over'));
        element?.removeEventListener('mouseout', () => handleMouseEvent(id, 'out'));
      });
    };
  }, [props.elementIds]);

  return { state };
};

export default useHover;
