import { RefObject, useEffect } from 'react';

function useObserver(
  target: RefObject<HTMLDivElement>, // 감지할 대상
  onIntersect: ([entry]: any) => void, // 감지 시 실행할 callback 함수
  root = null, // 교차할 부모 요소, 아무것도 넘기지 않으면 document가 기본
  rootMargin = '100px', // root와 target이 감지하는 여백의 거리
  threshold = 0.1 // 임계점. 1.0이면 root내에서 target이 100% 보여질 때 callback이 실행
) {
  useEffect(() => {
    let observer: IntersectionObserver;

    if (target.current) {
      observer = new IntersectionObserver(onIntersect, { root, rootMargin, threshold });
      observer.observe(target.current);
    }

    return () => observer?.disconnect();
  }, [target, rootMargin, threshold, onIntersect, root]);
}

export default useObserver;
