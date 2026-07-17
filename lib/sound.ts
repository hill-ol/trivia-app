'use client'

let audioContext: AudioContext | null = null

function getAudioContext(): AudioContext | null {
    if (typeof window === 'undefined') return null

    if (!audioContext) {
        const AudioContextClass =
            window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
        if (!AudioContextClass) return null
        audioContext = new AudioContextClass()
    }

    if (audioContext.state === 'suspended') {
        audioContext.resume()
    }

    return audioContext
}

function playTone(ctx: AudioContext, frequency: number, startTime: number, duration: number) {
    const oscillator = ctx.createOscillator()
    const gainNode = ctx.createGain()

    oscillator.type = 'sine'
    oscillator.frequency.value = frequency

    gainNode.gain.setValueAtTime(0, startTime)
    gainNode.gain.linearRampToValueAtTime(0.2, startTime + 0.02)
    gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + duration)

    oscillator.connect(gainNode)
    gainNode.connect(ctx.destination)

    oscillator.start(startTime)
    oscillator.stop(startTime + duration)
}

export function playCorrectChime() {
    const ctx = getAudioContext()
    if (!ctx) return

    const now = ctx.currentTime
    playTone(ctx, 523.25, now, 0.15)
    playTone(ctx, 659.25, now + 0.08, 0.15)
    playTone(ctx, 783.99, now + 0.16, 0.2)
}