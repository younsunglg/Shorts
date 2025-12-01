export interface Script {
  hook: string;
  points: string[];
  conclusion: string;
}

export interface SubtitleSegment {
  text: string;
  start: number;
  end: number;
}

export interface VideoConfig {
  width: number;
  height: number;
  fps: number;
  backgroundColor: string;
  subtitleStyle: {
    fontSize: number;
    fontColor: string;
    outlineColor: string;
    outline: number;
  };
}
