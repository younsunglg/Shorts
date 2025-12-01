import React from 'react';
import { Composition, registerRoot } from 'remotion';
import { ShortsComposition } from './ShortsComposition';

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="ShortsVideo"
        component={ShortsComposition}
        durationInFrames={1800} // 60초 (30fps 기준)
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{
          title: '주식 분석',
          hook: '오늘 주목해야 할 종목은?',
          mainContent: [
            '첫 번째 핵심 포인트',
            '두 번째 핵심 포인트',
            '세 번째 핵심 포인트',
          ],
          conclusion: '자세한 내용은 블로그에서!',
          hashtags: ['주식', '투자', '재테크'],
          style: 'modern',
        }}
      />
    </>
  );
};

registerRoot(RemotionRoot);
