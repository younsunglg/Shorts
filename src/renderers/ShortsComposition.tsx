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
  style?: 'modern' | 'minimal' | 'dynamic' | 'cinematic' | 'neon' | 'glassmorphism';
  backgroundImage?: string;
}

export const ShortsComposition: React.FC<ShortsCompositionProps> = ({
  title,
  hook,
  mainContent,
  conclusion,
  hashtags,
  audioPath,
  style = 'modern',
  backgroundImage,
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
    cinematic: 'linear-gradient(180deg, #0f0c29 0%, #302b63 50%, #24243e 100%)',
    neon: 'linear-gradient(135deg, #FF00FF 0%, #00FFFF 50%, #FF00FF 100%)',
    glassmorphism: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
  };

  // 텍스트 색상
  const textColors = {
    modern: '#ffffff',
    minimal: '#2d3748',
    dynamic: '#ffffff',
    cinematic: '#FFD700',
    neon: '#00FFFF',
    glassmorphism: '#ffffff',
  };

  // 스타일별 배경 스타일
  const getBackgroundStyle = () => {
    const baseStyle: React.CSSProperties = {
      background: backgrounds[style],
    };

    // 배경 이미지가 있으면 사용
    if (backgroundImage) {
      return {
        ...baseStyle,
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      };
    }

    // Glassmorphism 스타일은 blur 효과 추가
    if (style === 'glassmorphism') {
      return {
        ...baseStyle,
        backdropFilter: 'blur(10px)',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
      };
    }

    return baseStyle;
  };

  return (
    <AbsoluteFill style={getBackgroundStyle()}>
      {/* Neon 스타일 파티클 효과 */}
      {style === 'neon' && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'radial-gradient(circle, rgba(255,0,255,0.3) 0%, transparent 70%)',
            animation: 'pulse 2s ease-in-out infinite',
          }}
        />
      )}

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

  // 스타일별 텍스트 효과
  const getTextShadow = () => {
    if (style === 'neon') {
      return `0 0 10px ${textColor}, 0 0 20px ${textColor}, 0 0 30px ${textColor}, 0 0 40px ${textColor}`;
    }
    if (style === 'cinematic') {
      return '4px 4px 8px rgba(0,0,0,0.8)';
    }
    if (style === 'glassmorphism') {
      return '0 8px 32px 0 rgba(31, 38, 135, 0.37)';
    }
    return '2px 2px 4px rgba(0,0,0,0.3)';
  };

  return (
    <AbsoluteFill
      style={{
        justifyContent: 'center',
        alignItems: 'center',
        padding: '60px',
      }}
    >
      {/* Cinematic 스타일 시네마틱 바 */}
      {style === 'cinematic' && (
        <>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '100px', background: 'black' }} />
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '100px', background: 'black' }} />
        </>
      )}

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
            textShadow: getTextShadow(),
            margin: 0,
            ...(style === 'glassmorphism' && {
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(10px)',
              padding: '40px',
              borderRadius: '20px',
              border: '1px solid rgba(255, 255, 255, 0.2)',
            }),
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

  // 스타일별 텍스트 효과
  const getTextShadow = () => {
    if (style === 'neon') {
      return `0 0 10px ${textColor}, 0 0 20px ${textColor}`;
    }
    if (style === 'cinematic') {
      return '4px 4px 8px rgba(0,0,0,0.8)';
    }
    return '2px 2px 4px rgba(0,0,0,0.2)';
  };

  const getBoxStyle = () => {
    if (style === 'glassmorphism') {
      return {
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
      };
    }
    if (style === 'neon') {
      return {
        background: 'rgba(0, 0, 0, 0.3)',
        border: `2px solid ${textColor}`,
        boxShadow: `0 0 20px ${textColor}`,
      };
    }
    return {
      backgroundColor: 'rgba(0,0,0,0.1)',
    };
  };

  return (
    <AbsoluteFill
      style={{
        justifyContent: 'center',
        alignItems: 'center',
        padding: '80px',
      }}
    >
      {/* Cinematic 스타일 시네마틱 바 */}
      {style === 'cinematic' && (
        <>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '100px', background: 'black' }} />
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '100px', background: 'black' }} />
        </>
      )}

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
            textShadow: getTextShadow(),
            padding: '40px',
            borderRadius: '20px',
            ...getBoxStyle(),
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
