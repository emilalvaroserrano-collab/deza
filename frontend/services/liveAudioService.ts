import { GoogleGenAI } from '@google/genai';

// Helper functions for encoding/decoding PCM audio
function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

function createBlob(data: Float32Array): any {
  const l = data.length;
  const int16 = new Int16Array(l);
  for (let i = 0; i < l; i++) {
    int16[i] = data[i] * 32768;
  }
  return {
    data: encode(new Uint8Array(int16.buffer)),
    mimeType: 'audio/pcm;rate=16000',
  };
}

export class LiveAudioService {
  private ai: GoogleGenAI;
  private sessionPromise: Promise<any> | null = null;
  private inputAudioContext: AudioContext | null = null;
  private outputAudioContext: AudioContext | null = null;
  private stream: MediaStream | null = null;
  private sources = new Set<AudioBufferSourceNode>();
  private nextStartTime = 0;
  private isConnected = false;

  public onTranscriptUpdate?: (text: string, isUser: boolean) => void;
  public onStateChange?: (state: 'idle' | 'listening' | 'speaking' | 'error') => void;

  constructor() {
    const apiKey = typeof process !== 'undefined' && process.env ? process.env.API_KEY : 'dummy-key';
    this.ai = new GoogleGenAI({ apiKey });
  }

  async startSession() {
    if (this.isConnected) return;

    try {
      this.onStateChange?.('listening');
      this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      this.inputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      this.outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      
      const outputNode = this.outputAudioContext.createGain();
      outputNode.connect(this.outputAudioContext.destination);

      let currentInputTranscription = '';
      let currentOutputTranscription = '';

      // @ts-ignore - live might not be typed in this version
      if (!this.ai.live) {
        console.warn("Live API not supported in this SDK version");
        this.onStateChange?.('error');
        return;
      }

      // @ts-ignore
      this.sessionPromise = this.ai.live.connect({
        model: 'gemini-2.5-flash',
        callbacks: {
          onopen: () => {
            this.isConnected = true;
            if (!this.inputAudioContext || !this.stream) return;
            
            const source = this.inputAudioContext.createMediaStreamSource(this.stream);
            const scriptProcessor = this.inputAudioContext.createScriptProcessor(4096, 1, 1);
            
            scriptProcessor.onaudioprocess = (audioProcessingEvent) => {
              const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
              const pcmBlob = createBlob(inputData);
              
              if (this.sessionPromise) {
                this.sessionPromise.then((session: any) => {
                  if (session && session.sendRealtimeInput) {
                    session.sendRealtimeInput({ media: pcmBlob });
                  }
                });
              }
            };
            
            source.connect(scriptProcessor);
            scriptProcessor.connect(this.inputAudioContext.destination);
          },
          onmessage: async (message: any) => {
            // Handle Transcriptions
            if (message.serverContent?.outputTranscription) {
              currentOutputTranscription += message.serverContent.outputTranscription.text;
            } else if (message.serverContent?.inputTranscription) {
              currentInputTranscription += message.serverContent.inputTranscription.text;
            }

            if (message.serverContent?.turnComplete) {
               if (currentInputTranscription && this.onTranscriptUpdate) {
                   this.onTranscriptUpdate(currentInputTranscription, true);
               }
               if (currentOutputTranscription && this.onTranscriptUpdate) {
                   this.onTranscriptUpdate(currentOutputTranscription, false);
               }
               currentInputTranscription = '';
               currentOutputTranscription = '';
            }

            // Handle Audio Output
            const base64EncodedAudioString = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (base64EncodedAudioString && this.outputAudioContext) {
              this.onStateChange?.('speaking');
              this.nextStartTime = Math.max(this.nextStartTime, this.outputAudioContext.currentTime);
              
              const audioBuffer = await decodeAudioData(
                decode(base64EncodedAudioString),
                this.outputAudioContext,
                24000,
                1,
              );
              
              const source = this.outputAudioContext.createBufferSource();
              source.buffer = audioBuffer;
              source.connect(outputNode);
              
              source.addEventListener('ended', () => {
                this.sources.delete(source);
                if (this.sources.size === 0) {
                    this.onStateChange?.('listening');
                }
              });

              source.start(this.nextStartTime);
              this.nextStartTime = this.nextStartTime + audioBuffer.duration;
              this.sources.add(source);
            }

            // Handle Interruption
            if (message.serverContent?.interrupted) {
              for (const source of this.sources.values()) {
                source.stop();
                this.sources.delete(source);
              }
              this.nextStartTime = 0;
              this.onStateChange?.('listening');
            }
          },
          onerror: (e: ErrorEvent) => {
            console.error('Live API Error:', e);
            this.onStateChange?.('error');
            this.stopSession();
          },
          onclose: (e: CloseEvent) => {
            console.log('Live API Closed');
            this.stopSession();
          },
        },
        config: {
          responseModalities: ['AUDIO'],
          systemInstruction: { parts: [{ text: 'You are Desk-AI, a helpful technical tutor. Guide the user step-by-step. Keep responses brief and conversational.' }] },
        },
      });

    } catch (err) {
      console.error("Failed to start Live API session:", err);
      this.onStateChange?.('error');
    }
  }

  stopSession() {
    this.isConnected = false;
    if (this.sessionPromise) {
      this.sessionPromise.then((session: any) => {
          if(session && typeof session.close === 'function') {
              session.close();
          }
      }).catch((e: any) => console.error("Error closing session", e));
      this.sessionPromise = null;
    }
    
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }

    if (this.inputAudioContext) {
      this.inputAudioContext.close();
      this.inputAudioContext = null;
    }
    
    if (this.outputAudioContext) {
      this.outputAudioContext.close();
      this.outputAudioContext = null;
    }

    for (const source of this.sources.values()) {
      source.stop();
    }
    this.sources.clear();
    this.nextStartTime = 0;
    this.onStateChange?.('idle');
  }
  
  sendScreenFrame(base64Data: string) {
      if (this.isConnected && this.sessionPromise) {
          this.sessionPromise.then((session: any) => {
              if (session && session.sendRealtimeInput) {
                  session.sendRealtimeInput({
                      media: { data: base64Data, mimeType: 'image/jpeg' }
                  });
              }
          });
      }
  }
}

export const liveAudioService = new LiveAudioService();
