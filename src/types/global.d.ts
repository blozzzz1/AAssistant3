interface SpeechRecognitionEvent extends Event {
    resultIndex: number;
    results: SpeechRecognitionResultList;
  }
  
  interface SpeechRecognition extends EventTarget {
    continuous: boolean;
    interimResults: boolean;
    lang: string;
    start(): void;
    stop(): void;
    onstart: (() => void) | null;
    onresult: ((event: SpeechRecognitionEvent) => void) | null;
    onerror: ((event: any) => void) | null;
    onend: (() => void) | null;
  }
  
  declare var SpeechRecognition: {
    new (): SpeechRecognition;
    prototype: SpeechRecognition;
  };
  
  declare var webkitSpeechRecognition: {
    new (): SpeechRecognition;
    prototype: SpeechRecognition;
  };
  
  interface Window {
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof webkitSpeechRecognition;
  }