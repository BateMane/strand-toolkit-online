class AudioService {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private ambienceGain: GainNode | null = null; // Nouveau : Gain spécifique pour l'ambiance
  private ambienceNodes: AudioNode[] = [];
  private isMuted: boolean = false;
  private isAmbientPlaying: boolean = false;
  private currentAmbientVolume: number = 0.3; // Volume initial

  private init() {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        this.ctx = new AudioContextClass();
        
        // Master Gain (Global)
        this.masterGain = this.ctx.createGain();
        this.masterGain.connect(this.ctx.destination);
        this.masterGain.gain.value = 0.6; // Volume général du système

        // Ambience Gain (Drone uniquement)
        this.ambienceGain = this.ctx.createGain();
        this.ambienceGain.connect(this.masterGain);
        this.ambienceGain.gain.value = this.currentAmbientVolume;
      }
    }
  }

  public startAmbience() {
    this.init();
    if (!this.ctx || !this.ambienceGain) return;
    
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    if (this.isAmbientPlaying) return;

    const now = this.ctx.currentTime;

    // Layer 1: Deep Sine Drone (Sub-bass)
    const osc1 = this.ctx.createOscillator();
    const gain1 = this.ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.value = 55; // A1
    gain1.gain.value = 0.15;
    osc1.connect(gain1);
    gain1.connect(this.ambienceGain); // Connexion au gain d'ambiance
    osc1.start(now);

    // Layer 2: Detuned Saw (Texture)
    const osc2 = this.ctx.createOscillator();
    const gain2 = this.ctx.createGain();
    const filter2 = this.ctx.createBiquadFilter();
    
    osc2.type = 'sawtooth';
    osc2.frequency.value = 54; 
    filter2.type = 'lowpass';
    filter2.frequency.value = 120;
    filter2.Q.value = 1;
    gain2.gain.value = 0.05;

    osc2.connect(filter2);
    filter2.connect(gain2);
    gain2.connect(this.ambienceGain); // Connexion au gain d'ambiance
    osc2.start(now);

    // LFO (Breathing effect)
    const lfo = this.ctx.createOscillator();
    const lfoGain = this.ctx.createGain();
    lfo.frequency.value = 0.1;
    lfoGain.gain.value = 50;
    lfo.connect(lfoGain);
    lfoGain.connect(filter2.frequency);
    lfo.start(now);

    // Layer 3: High Static/Hiss
    const bufferSize = this.ctx.sampleRate * 2;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;
    const noiseFilter = this.ctx.createBiquadFilter();
    noiseFilter.type = 'bandpass';
    noiseFilter.frequency.value = 3000;
    const noiseGain = this.ctx.createGain();
    noiseGain.gain.value = 0.01;
    
    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(this.ambienceGain); // Connexion au gain d'ambiance
    noise.start(now);

    this.ambienceNodes.push(osc1, gain1, osc2, gain2, filter2, lfo, lfoGain, noise, noiseFilter, noiseGain);
    this.isAmbientPlaying = true;
  }

  /**
   * Ajuste le volume de l'ambiance (drone procedural)
   * @param val Valeur entre 0 et 1
   */
  public setMusicVolume(val: number) {
    this.currentAmbientVolume = val;
    if (this.ctx && this.ambienceGain) {
      // Utilisation de linearRamp pour un changement de volume fluide sans craquements
      const now = this.ctx.currentTime;
      this.ambienceGain.gain.cancelScheduledValues(now);
      this.ambienceGain.gain.linearRampToValueAtTime(val, now + 0.1);
    }
  }

  public toggleMute() {
    this.isMuted = !this.isMuted;
    
    if (this.ctx && this.masterGain) {
      const now = this.ctx.currentTime;
      this.masterGain.gain.cancelScheduledValues(now);
      // Coupe le son général (Master)
      this.masterGain.gain.setTargetAtTime(this.isMuted ? 0 : 0.6, now, 0.1);
    }
    return this.isMuted;
  }

  public playHover() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx || !this.masterGain) return;

    try {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1200, this.ctx.currentTime + 0.05);
        gain.gain.setValueAtTime(0.05, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.05);
        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.05);
    } catch (e) {}
  }

  public playClick() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx || !this.masterGain) return;

    try {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(150, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(40, this.ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.1);
        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.1);
    } catch (e) {}
  }

  public playBootSequence() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx || !this.masterGain) return;

    try {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(50, this.ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(2000, this.ctx.currentTime + 1.5);
        gain.gain.setValueAtTime(0, this.ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.1, this.ctx.currentTime + 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 1.5);
        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start();
        osc.stop(this.ctx.currentTime + 1.5);
    } catch(e) {}
  }

  public playLevelUp() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx || !this.masterGain) return;

    try {
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(261.63, now); // C4
        osc.frequency.setValueAtTime(329.63, now + 0.1); // E4
        osc.frequency.setValueAtTime(392.00, now + 0.2); // G4
        osc.frequency.setValueAtTime(523.25, now + 0.3); // C5
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.linearRampToValueAtTime(0.2, now + 0.3);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start();
        osc.stop(now + 0.8);
    } catch (e) {}
  }

  public playStaticBurst() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx || !this.masterGain) return;

    try {
        const bufferSize = this.ctx.sampleRate * 0.2;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = Math.random() * 2 - 1;
        }
        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;
        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.05, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.2);
        noise.connect(gain);
        gain.connect(this.masterGain);
        noise.start();
    } catch (e) {}
  }
}

export const audioManager = new AudioService();