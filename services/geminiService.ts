
import { GoogleGenAI, LiveServerMessage, Modality, Type } from "@google/genai";
import { Event, ActivityType, ChatMessage } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const searchEventsWithGemini = async (query: string, userLocation: string): Promise<{ text: string; events: Event[] }> => {
  if (!apiKey) {
    return {
      text: "API Key is missing. Please configure it to use AI features.",
      events: []
    };
  }

  const modelId = "gemini-2.5-flash"; 
  
  const systemInstruction = `
    You are an enthusiastic fitness event assistant for the 'Routine' app, specifically catering to the Nigerian active community. 
    Your goal is to help users find sports and social activities in cities like Lagos, Abuja, Port Harcourt, Ibadan, etc.
    
    When a user asks for events, use the Google Search tool to find real-world examples or realistic local spots (e.g., Lekki-Ikoyi Bridge, Jabi Lake, National Stadium, Eko Atlantic, Tarkwa Bay, Upbeat Centre, Ikoyi Club).
    Then, format the response as a friendly summary (using Nigerian English nuances if appropriate, e.g., 'Check out these spots!') AND a JSON array of event objects.
    
    The JSON array should be strictly formatted and included in a markdown code block like \`\`\`json ... \`\`\`.
    
    Each event object in the JSON must look like this:
    {
      "id": "unique_string",
      "title": "Event Name",
      "club": "Club Name or Organizer",
      "type": "Running" | "Cycling" | "Hiking" | "Yoga" | "Boxing" | "Skating" | "Football" | "Badminton" | "Golf" | "Tennis" | "Swimming" | "Tabata" | "Zumba" | "Walking",
      "date": "YYYY-MM-DD",
      "time": "HH:MM",
      "location": "Address or Area (e.g., Lekki Phase 1, Lagos)",
      "attendees": number (estimate),
      "description": "Short description",
      "price": number (0 for free),
      "currency": "NGN"
    }
    
    If you cannot find specific real-time data, generate highly realistic placeholder events based on popular Nigerian locations for that activity.
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: `Find ${query} events near ${userLocation}.`,
      config: {
        systemInstruction: systemInstruction,
        tools: [{ googleSearch: {} }], 
      },
    });

    const text = response.text || "I couldn't find anything right now.";
    
    // Extract JSON block if present
    const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/);
    let events: Event[] = [];
    
    if (jsonMatch && jsonMatch[1]) {
      try {
        const rawEvents = JSON.parse(jsonMatch[1]);
        // Map to ensure types and add images
        events = rawEvents.map((e: any, index: number) => ({
          ...e,
          id: e.id || `gen-${Date.now()}-${index}`,
          image: getPlaceholderImage(e.type),
          isJoined: false,
          status: 'upcoming'
        }));
      } catch (e) {
        console.error("Failed to parse generated JSON events", e);
      }
    }

    // Remove the JSON block from the display text to keep it clean
    const cleanText = text.replace(/```json[\s\S]*?```/, '').trim();

    return { text: cleanText, events };

  } catch (error) {
    console.error("Gemini API Error:", error);
    return {
      text: "Omo, network is somehow. Please try again later.",
      events: []
    };
  }
};

export const extractEventFromFlyer = async (base64Image: string): Promise<Partial<Event> | null> => {
  if (!apiKey) return null;

  const modelId = "gemini-2.5-flash";

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: {
        parts: [
          { inlineData: { mimeType: "image/jpeg", data: base64Image } },
          { text: "Analyze this flyer. Extract the following event details: Title, Club/Organizer Name, Activity Type (guess one of Running, Cycling, Hiking, Yoga, Boxing, Skating, Football, Badminton, Golf, Tennis, Swimming, Tabata, Zumba, Walking), Date (YYYY-MM-DD), Time, Location, Price (number only, 0 if free or not found), Currency (e.g. NGN), and a short Description. Return strictly valid JSON." }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
           type: Type.OBJECT,
           properties: {
             title: { type: Type.STRING },
             club: { type: Type.STRING },
             type: { type: Type.STRING },
             date: { type: Type.STRING },
             time: { type: Type.STRING },
             location: { type: Type.STRING },
             price: { type: Type.NUMBER },
             currency: { type: Type.STRING },
             description: { type: Type.STRING }
           },
           required: ["title", "type", "date", "location"]
        }
      }
    });

    const jsonText = response.text;
    if (!jsonText) return null;
    
    const data = JSON.parse(jsonText);
    
    // Normalize data
    return {
        ...data,
        id: `scan-${Date.now()}`,
        image: getPlaceholderImage(data.type),
        attendees: Math.floor(Math.random() * 50) + 10, // Estimate
        isJoined: false,
        status: 'upcoming'
    };

  } catch (error) {
    console.error("Flyer extraction error:", error);
    return null;
  }
};

export const chatWithCoach = async (history: ChatMessage[], userMessage: string): Promise<string> => {
  if (!apiKey) return "API Key missing. I can't coach you without it!";

  const modelId = "gemini-2.5-flash";

  // Convert history to Gemini format
  // We only take the last 10 messages to keep context but save tokens
  const recentHistory = history.slice(-10).map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.text }]
  }));

  try {
    const chat = ai.chats.create({
        model: modelId,
        history: recentHistory,
        config: {
            systemInstruction: `
                You are Coach Bolt, an elite, high-energy personal trainer and fitness motivator on the 'Routine' app.
                Your tone is encouraging, tough but fair, and slightly informal (using terms like "Champ", "Athlete", "Let's crush it").
                
                You specialize in:
                1. Creating quick workout plans (HIIT, Running, Strength).
                2. Offering nutrition advice (general healthy eating).
                3. Motivating users when they feel lazy.
                
                Keep responses concise (under 100 words) and formatted with bullet points if providing a plan.
                If the user asks about medical issues, disclaim that you are an AI and they should see a doctor.
            `
        }
    });

    const result = await chat.sendMessage({ message: userMessage });
    return result.text;

  } catch (error) {
    console.error("Coach Chat Error:", error);
    return "Sorry Champ, I got a bit dizzy. Let's try that again.";
  }
};

const getPlaceholderImage = (type: ActivityType | string): string => {
  // Stable High-Quality Unsplash Images
  switch (type) {
    case 'Running': return 'https://images.unsplash.com/photo-1552674605-46d527273191?auto=format&fit=crop&w=800&q=80';
    case 'Cycling': return 'https://images.unsplash.com/photo-1541625602330-2277a4c46182?auto=format&fit=crop&w=800&q=80';
    case 'Hiking': return 'https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&w=800&q=80';
    case 'Yoga': return 'https://images.unsplash.com/photo-1588286840104-8957b019727f?auto=format&fit=crop&w=800&q=80';
    case 'Boxing': return 'https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?auto=format&fit=crop&w=800&q=80';
    case 'Skating': return 'https://images.unsplash.com/photo-1565264627763-8228dd9c8088?auto=format&fit=crop&w=800&q=80';
    case 'Football': return 'https://images.unsplash.com/photo-1579952363873-27f3bade8f55?auto=format&fit=crop&w=800&q=80';
    case 'Badminton': return 'https://images.unsplash.com/photo-1626224583764-847890e0e966?auto=format&fit=crop&w=800&q=80';
    case 'Golf': return 'https://images.unsplash.com/photo-1535131749006-b7f58c99034b?auto=format&fit=crop&w=800&q=80';
    case 'Tennis': return 'https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?auto=format&fit=crop&w=800&q=80';
    case 'Swimming': return 'https://images.unsplash.com/photo-1600965962102-9d260a71890d?auto=format&fit=crop&w=800&q=80';
    case 'Tabata': return 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=800&q=80';
    case 'Zumba': return 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=800&q=80';
    case 'Walking': return 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?auto=format&fit=crop&w=800&q=80';
    default: return 'https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=800&q=80';
  }
};

// --- Live API Implementation ---

export class CoachLiveSession {
  private inputAudioContext: AudioContext | null = null;
  private outputAudioContext: AudioContext | null = null;
  private inputSource: MediaStreamAudioSourceNode | null = null;
  private processor: ScriptProcessorNode | null = null;
  private outputNode: GainNode | null = null;
  private nextStartTime = 0;
  private session: any = null;
  // Critical for race condition handling: always use the promise
  private sessionPromise: Promise<any> | null = null;
  
  private sources = new Set<AudioBufferSourceNode>();
  private videoInterval: number | null = null;

  public onStatusChange: (status: 'connecting' | 'connected' | 'error' | 'disconnected') => void = () => {};
  public onVolume: (level: number) => void = () => {};

  async connect() {
    if (!apiKey) {
      this.onStatusChange('error');
      return;
    }

    this.onStatusChange('connecting');

    try {
      this.inputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      this.outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      
      this.outputNode = this.outputAudioContext.createGain();
      this.outputNode.connect(this.outputAudioContext.destination);

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Store the promise!
      this.sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        callbacks: {
          onopen: () => {
            this.onStatusChange('connected');
            this.startAudioRecording(stream);
          },
          onmessage: (message: LiveServerMessage) => this.handleMessage(message),
          onerror: (e) => {
            console.error("Live API Error:", e);
            this.onStatusChange('error');
          },
          onclose: () => {
            this.onStatusChange('disconnected');
          }
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } }
          },
          systemInstruction: {
            parts: [{ text: `
              You are Coach Bolt, an elite, high-energy personal trainer. 
              You are speaking to a user directly via a voice call.
              If the user shares video, comment on their form, environment, or equipment.
              Keep your responses punchy, encouraging, and brief (1-3 sentences).
              Use a motivating tone. You are currently on a live voice call with the user.
            `}]
          }
        }
      });
      
      this.session = await this.sessionPromise;

    } catch (error) {
      console.error("Failed to connect to Live API", error);
      this.onStatusChange('error');
    }
  }

  private startAudioRecording(stream: MediaStream) {
    if (!this.inputAudioContext) return;

    this.inputSource = this.inputAudioContext.createMediaStreamSource(stream);
    this.processor = this.inputAudioContext.createScriptProcessor(4096, 1, 1);

    this.processor.onaudioprocess = (e) => {
      const inputData = e.inputBuffer.getChannelData(0);
      
      // Calculate volume for UI
      let sum = 0;
      for (let i = 0; i < inputData.length; i++) {
        sum += inputData[i] * inputData[i];
      }
      const rms = Math.sqrt(sum / inputData.length);
      this.onVolume(rms);

      const pcmBlob = this.createPcmBlob(inputData);
      
      // CRITICAL FIX: Use sessionPromise to prevent race condition
      if (this.sessionPromise) {
          this.sessionPromise.then((session) => {
              session.sendRealtimeInput({ media: pcmBlob });
          });
      }
    };

    this.inputSource.connect(this.processor);
    this.processor.connect(this.inputAudioContext.destination);
  }

  public startVideoStream(videoEl: HTMLVideoElement) {
    if (this.videoInterval) clearInterval(this.videoInterval);

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const FRAME_RATE = 2; // Low FPS is sufficient for context and saves bandwidth

    this.videoInterval = window.setInterval(() => {
        if (!this.sessionPromise || !videoEl || videoEl.paused || videoEl.ended) return;

        // Resize for optimal token usage (scale down to max 640px width roughly)
        const scale = Math.min(1, 640 / videoEl.videoWidth);
        canvas.width = videoEl.videoWidth * scale;
        canvas.height = videoEl.videoHeight * scale;
        
        ctx?.drawImage(videoEl, 0, 0, canvas.width, canvas.height);
        
        const base64Data = canvas.toDataURL('image/jpeg', 0.5).split(',')[1];
        
        this.sessionPromise?.then((session) => {
            session.sendRealtimeInput({
                media: { data: base64Data, mimeType: 'image/jpeg' }
            });
        });
    }, 1000 / FRAME_RATE);
  }
  
  public disconnect() {
      if (this.videoInterval) {
          clearInterval(this.videoInterval);
          this.videoInterval = null;
      }
      
      for (const source of this.sources.values()) {
          source.stop();
      }
      this.sources.clear();
      
      if (this.inputSource) {
          this.inputSource.disconnect();
          this.inputSource = null;
      }
      
      if (this.processor) {
          this.processor.disconnect();
          this.processor = null;
      }

      if (this.inputAudioContext) {
          this.inputAudioContext.close();
          this.inputAudioContext = null;
      }
      if (this.outputAudioContext) {
          this.outputAudioContext.close();
          this.outputAudioContext = null;
      }
      
      if (this.session) {
          try {
             (this.session as any).close();
          } catch(e) {
             console.warn("Could not close session", e);
          }
      }
      
      this.onStatusChange('disconnected');
  }

  private async handleMessage(message: LiveServerMessage) {
      const base64EncodedAudioString = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
      if (base64EncodedAudioString && this.outputAudioContext && this.outputNode) {
        this.nextStartTime = Math.max(
          this.nextStartTime,
          this.outputAudioContext.currentTime,
        );
        const audioBuffer = await this.decodeAudioData(
          this.decode(base64EncodedAudioString),
          this.outputAudioContext,
          24000,
          1,
        );
        const source = this.outputAudioContext.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(this.outputNode);
        source.addEventListener('ended', () => {
          this.sources.delete(source);
        });

        source.start(this.nextStartTime);
        this.nextStartTime = this.nextStartTime + audioBuffer.duration;
        this.sources.add(source);
      }

      const interrupted = message.serverContent?.interrupted;
      if (interrupted) {
        for (const source of this.sources.values()) {
          source.stop();
          this.sources.delete(source);
        }
        this.nextStartTime = 0;
      }
  }

  private createPcmBlob(data: Float32Array): { data: string; mimeType: string } {
      const l = data.length;
      const int16 = new Int16Array(l);
      for (let i = 0; i < l; i++) {
        int16[i] = data[i] * 32768;
      }
      return {
        data: this.encode(new Uint8Array(int16.buffer)),
        mimeType: 'audio/pcm;rate=16000',
      };
  }

  private encode(bytes: Uint8Array): string {
    let binary = '';
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  private decode(base64: string): Uint8Array {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  }

  private async decodeAudioData(
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
}
