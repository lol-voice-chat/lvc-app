import { useEffect } from 'react';
import { useSetRecoilState } from 'recoil';
import { displayFpsState } from '../@store/atom';

function useGetFps() {
  const setDisplayFps = useSetRecoilState(displayFpsState);

  useEffect(() => {
    // 비주얼라이저 모니터 해상도 구하기
    let fps = 0;
    let lastTimestamp = 0;
    let closeFrame: number | null = null;

    function animate(timestamp: number) {
      const deltaTime = timestamp - lastTimestamp;
      fps = Math.round(1000 / deltaTime);

      lastTimestamp = timestamp;
      closeFrame = requestAnimationFrame(animate);
    }
    requestAnimationFrame(animate);

    setTimeout(() => {
      closeFrame && cancelAnimationFrame(closeFrame);
      setDisplayFps(fps);
    }, 1000);
  }, []);
}

export default useGetFps;
