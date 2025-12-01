import React from 'react';
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Audio,
  Sequence,
} from 'remotion';

interface ShortsCompositionProps {
  title: string;
  hook: string;
  mainContent: string[];
  conclusion: string;
  hashtags: string[];
  audioPath?: string;
  style?: 'modern' | 'minimal' | 'dynamic';
}

export const ShortsComposition: React.FC<ShortsCompositionProps> = ({
  title,
  hook,
  mainContent,
  conclusion,
  hashtags,
  audioPath,
  style = 'modern',
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames, width, height } = useVideoConfig();

  // 각 섹션의 프레임 길이 계산
  const hookDuration = Math.floor(fps * 3); // 3초
  const contentDuration = Math.floor(fps * 8); // 각 포인트 8초
  const conclusionStart = hookDuration + (contentDuration * mainContent.length);
  const conclusionDuration = Math.floor(fps * 5); // 5초

  // 스타일별 배경색
  const backgrounds = {
    modern: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    minimal: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
    dynamic: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
  };

  // 텍스트 색상
  const textColors = {
    modern: '#ffffff',
    minimal: '#2d3748',
    dynamic: '#ffffff',
  };

  return (
    <AbsoluteFill style={{ background: backgrounds[style] }}>
      {/* 오디오 */}
      {audioPath && <Audio src={audioPath} />}

      {/* 훅 (Hook) - 첫 3초 */}
      {frame < hookDuration && (
        <Sequence from={0} durationInFrames={hookDuration}>
          <HookScene text={hook} style={style} textColor={textColors[style]} />
        </Sequence>
      )}

      {/* 메인 콘텐츠 */}
      {mainContent.map((content, index) => {
        const start = hookDuration + (index * contentDuration);
        const end = start + contentDuration;

        if (frame >= start && frame < end) {
          return (
            <Sequence
              key={index}
              from={start}
              durationInFrames={contentDuration}
            >
              <ContentScene
                text={content}
                index={index + 1}
                total={mainContent.length}
                style={style}
                textColor={textColors[style]}
              />
            </Sequence>
          );
        }
        return null;
      })}

      {/* 결론 */}
      {frame >= conclusionStart && (
        <Sequence
          from={conclusionStart}
          durationInFrames={conclusionDuration}
        >
          <ConclusionScene
            text={conclusion}
            hashtags={hashtags}
            style={style}
            textColor={textColors[style]}
          />
        </Sequence>
      )}
    </AbsoluteFill>
  );
};

// 훅 씬
const HookScene: React.FC<{
  text: string;
  style: string;
  textColor: string;
}> = ({ text, style, textColor }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // 스프링 애니메이션
  const scale = spring({
    frame,
    fps,
    config: {
      damping: 100,
      stiffness: 200,
      mass: 0.5,
    },
  });

  const opacity = interpolate(frame, [0, 10], [0, 1], {
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill
      style={{
        justifyContent: 'center',
        alignItems: 'center',
        padding: '60px',
      }}
    >
      <div
        style={{
          transform: `scale(${scale})`,
          opacity,
          textAlign: 'center',
        }}
      >
        <h1
          style={{
            fontSize: '72px',
            fontWeight: 'bold',
            color: textColor,
            lineHeight: 1.3,
            textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
            margin: 0,
          }}
        >
          {text}
        </h1>
      </div>
    </AbsoluteFill>
  );
};

// 콘텐츠 씬
const ContentScene: React.FC<{
  text: string;
  index: number;
  total: number;
  style: string;
  textColor: string;
}> = ({ text, index, total, style, textColor }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const translateY = spring({
    frame,
    fps,
    from: 100,
    to: 0,
    config: {
      damping: 100,
    },
  });

  const opacity = interpolate(frame, [0, 15], [0, 1], {
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill
      style={{
        justifyContent: 'center',
        alignItems: 'center',
        padding: '80px',
      }}
    >
      {/* 진행 표시 */}
      <div
        style={{
          position: 'absolute',
          top: '60px',
          right: '60px',
          fontSize: '32px',
          fontWeight: 'bold',
          color: textColor,
          opacity: 0.7,
        }}
      >
        {index}/{total}
      </div>

      {/* 메인 텍스트 */}
      <div
        style={{
          transform: `translateY(${translateY}px)`,
          opacity,
        }}
      >
        <div
          style={{
            fontSize: '56px',
            fontWeight: 'bold',
            color: textColor,
            lineHeight: 1.4,
            textAlign: 'center',
            textShadow: '2px 2px 4px rgba(0,0,0,0.2)',
            backgroundColor: 'rgba(0,0,0,0.1)',
            padding: '40px',
            borderRadius: '20px',
          }}
        >
          {text}
        </div>
      </div>
    </AbsoluteFill>
  );
};

// 결론 씬
const ConclusionScene: React.FC<{
  text: string;
  hashtags: string[];
  style: string;
  textColor: string;
}> = ({ text, hashtags, style, textColor }) => {
  const frame = useCurrentFrame();

  const opacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill
      style={{
        justifyContent: 'center',
        alignItems: 'center',
        padding: '60px',
        opacity,
      }}
    >
      <div style={{ textAlign: 'center' }}>
        {/* 결론 텍스트 */}
        <h2
          style={{
            fontSize: '64px',
            fontWeight: 'bold',
            color: textColor,
            lineHeight: 1.3,
            marginBottom: '60px',
            textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
          }}
        >
          {text}
        </h2>

        {/* 해시태그 */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: '20px',
          }}
        >
          {hashtags.map((tag, index) => (
            <span
              key={index}
              style={{
                fontSize: '32px',
                color: textColor,
                opacity: 0.9,
                backgroundColor: 'rgba(255,255,255,0.2)',
                padding: '15px 30px',
                borderRadius: '30px',
              }}
            >
              #{tag}
            </span>
          ))}
        </div>
      </div>
    </AbsoluteFill>
  );
};
