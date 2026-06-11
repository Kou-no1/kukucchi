let audioContext: AudioContext | null = null

export async function initializeAudio(): Promise<void> {
  const AudioContextClass =
    window.AudioContext ??
    (window as unknown as { webkitAudioContext: typeof AudioContext })
      .webkitAudioContext
  if (!AudioContextClass) {
    return
  }
  audioContext ??= new AudioContextClass()
  if (audioContext.state === 'suspended') {
    await audioContext.resume()
  }
}

export function playCorrectSound(enabled: boolean): void {
  if (!enabled || !audioContext) {
    return
  }
  const oscillator = audioContext.createOscillator()
  const gain = audioContext.createGain()
  oscillator.frequency.value = 740
  gain.gain.value = 0.04
  oscillator.connect(gain)
  gain.connect(audioContext.destination)
  oscillator.start()
  oscillator.stop(audioContext.currentTime + 0.08)
}

export function speakJapanese(text: string, enabled: boolean): boolean {
  if (!enabled || !('speechSynthesis' in window)) {
    return false
  }
  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = 'ja-JP'
  window.speechSynthesis.cancel()
  window.speechSynthesis.speak(utterance)
  return true
}
