class SoundManager {
  private ctx: AudioContext | null = null;
  private muted = false;
  private volume = 0.8;

  private initCtx() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setMuted(muted: boolean) {
    this.muted = muted;
  }

  public isMuted() {
    return this.muted;
  }

  public setVolume(volume: number) {
    this.volume = Math.max(0, Math.min(1, volume));
    if (this.volume === 0) {
      this.muted = true;
    } else {
      this.muted = false;
    }
  }

  public getVolume() {
    return this.volume;
  }

  // Metallic dice roll / clack sound synthesized via Web Audio API
  public playDiceRoll() {
    if (this.muted) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    for (let i = 0; i < 4; i++) {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const time = now + i * 0.08 + Math.random() * 0.04;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(600 + Math.random() * 800, time);
      osc.frequency.exponentialRampToValueAtTime(180, time + 0.06);

      gain.gain.setValueAtTime(0.25 * this.volume, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.06);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(time);
      osc.stop(time + 0.07);
    }
  }

  // Wooden pawn move / hop sound
  public playPawnMove() {
    if (this.muted) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(280, now);
    osc.frequency.exponentialRampToValueAtTime(110, now + 0.08);

    gain.gain.setValueAtTime(0.3 * this.volume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.09);
  }

  // Cutting sound (sharp clack & chime)
  public playCut() {
    if (this.muted) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    // Low thump
    const osc1 = this.ctx.createOscillator();
    const gain1 = this.ctx.createGain();
    osc1.frequency.setValueAtTime(140, now);
    osc1.frequency.exponentialRampToValueAtTime(50, now + 0.15);
    gain1.gain.setValueAtTime(0.4 * this.volume, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
    osc1.connect(gain1);
    gain1.connect(this.ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.16);

    // High strike
    const osc2 = this.ctx.createOscillator();
    const gain2 = this.ctx.createGain();
    osc2.frequency.setValueAtTime(1200, now);
    osc2.frequency.exponentialRampToValueAtTime(400, now + 0.2);
    gain2.gain.setValueAtTime(0.2 * this.volume, now);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
    osc2.connect(gain2);
    gain2.connect(this.ctx.destination);
    osc2.start(now);
    osc2.stop(now + 0.21);
  }

  // Bonus roll fanfare / temple brass bell chime (Thayam 1, 5, 6, 12)
  public playBonusRoll(value: number) {
    if (this.muted) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    // Ascending celebratory pentatonic bell chimes
    const scale = value === 1 ? [523.25, 659.25, 783.99, 1046.5] : [587.33, 739.99, 880.0];
    scale.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      const startTime = now + idx * 0.08;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime);
      gain.gain.setValueAtTime(0.22 * this.volume, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.28);

      osc.connect(gain);
      gain.connect(this.ctx!.destination);

      osc.start(startTime);
      osc.stop(startTime + 0.3);
    });
  }

  // Victory celebration chime
  public playVictory() {
    if (this.muted) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const notes = [440, 554.37, 659.25, 880];
    notes.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      const startTime = now + idx * 0.12;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, startTime);
      gain.gain.setValueAtTime(0.2 * this.volume, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.35);

      osc.connect(gain);
      gain.connect(this.ctx!.destination);

      osc.start(startTime);
      osc.stop(startTime + 0.36);
    });
  }
}

export const soundManager = new SoundManager();
