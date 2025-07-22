// Утилита для воспроизведения звуковых уведомлений
export class SoundManager {
  private static audioContext: AudioContext | null = null;
  private static enabled = true;

  // Инициализация AudioContext
  private static getAudioContext(): AudioContext {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return this.audioContext;
  }

  // Включить/выключить звуки
  static setEnabled(enabled: boolean) {
    this.enabled = enabled;
    localStorage.setItem('soundEnabled', enabled.toString());
  }

  static isEnabled(): boolean {
    const stored = localStorage.getItem('soundEnabled');
    return stored !== null ? stored === 'true' : true;
  }

  // Воспроизведение тона с заданной частотой и длительностью
  private static playTone(frequency: number, duration: number, type: OscillatorType = 'sine'): Promise<void> {
    return new Promise((resolve) => {
      if (!this.enabled || !this.isEnabled()) {
        resolve();
        return;
      }

      try {
        const ctx = this.getAudioContext();
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);

        oscillator.frequency.value = frequency;
        oscillator.type = type;

        // Плавное затухание
        gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + duration);

        oscillator.onended = () => resolve();
      } catch (error) {
        console.warn('Sound playback failed:', error);
        resolve();
      }
    });
  }

  // Звуковые эффекты для разных событий
  static async playSuccess() {
    // Восходящий аккорд (до-ми-соль)
    await this.playTone(523, 0.15); // C5
    await this.playTone(659, 0.15); // E5
    await this.playTone(784, 0.3);  // G5
  }

  static async playError() {
    // Нисходящий диссонанс
    await this.playTone(400, 0.2);
    await this.playTone(350, 0.3);
  }

  static async playNotification() {
    // Двойной бип
    await this.playTone(800, 0.1);
    await new Promise(resolve => setTimeout(resolve, 50));
    await this.playTone(800, 0.1);
  }

  static async playNewPlayer() {
    // Приветственный звук
    await this.playTone(600, 0.15);
    await this.playTone(800, 0.15);
  }

  static async playGameStart() {
    // Фанфары начала игры
    await this.playTone(523, 0.1); // C5
    await this.playTone(659, 0.1); // E5
    await this.playTone(784, 0.1); // G5
    await this.playTone(1047, 0.3); // C6
  }

  static async playCorrectAnswer() {
    // Звук правильного ответа
    await this.playTone(800, 0.1);
    await this.playTone(1000, 0.2);
  }

  static async playWrongAnswer() {
    // Звук неправильного ответа
    await this.playTone(300, 0.3, 'sawtooth');
  }

  static async playGameEnd() {
    // Финальная мелодия
    await this.playTone(523, 0.15); // C5
    await this.playTone(659, 0.15); // E5
    await this.playTone(784, 0.15); // G5
    await this.playTone(1047, 0.15); // C6
    await this.playTone(1319, 0.4); // E6
  }

  static async playNewFact() {
    // Звук добавления нового факта
    await this.playTone(700, 0.1);
    await this.playTone(900, 0.15);
  }

  static async playNextRound() {
    // Переход к следующему раунду
    await this.playTone(600, 0.1);
    await this.playTone(700, 0.1);
    await this.playTone(800, 0.2);
  }
}

// Экспортируем удобные функции
export const playSuccess = () => SoundManager.playSuccess();
export const playError = () => SoundManager.playError();
export const playNotification = () => SoundManager.playNotification();
export const playNewPlayer = () => SoundManager.playNewPlayer();
export const playGameStart = () => SoundManager.playGameStart();
export const playCorrectAnswer = () => SoundManager.playCorrectAnswer();
export const playWrongAnswer = () => SoundManager.playWrongAnswer();
export const playGameEnd = () => SoundManager.playGameEnd();
export const playNewFact = () => SoundManager.playNewFact();
export const playNextRound = () => SoundManager.playNextRound();
