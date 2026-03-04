export interface VoiceOption {
  id: string;
  label: string;
}

export interface GenerateTtsRequest {
  text: string;
  voice: string;
  speed: number;
}

