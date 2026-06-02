// Lazily-created bid chime. The asset lives at public/sounds/bid-sound.mp3
// (carried over from the original app) and is served at /sounds/bid-sound.mp3.
let audio: HTMLAudioElement | null = null;

export function playBidSound() {
  if (typeof window === "undefined") return;
  try {
    if (!audio) {
      audio = new Audio("/sounds/bid-sound.mp3");
      audio.volume = 0.5;
    }
    audio.currentTime = 0;
    void audio.play();
  } catch {
    /* autoplay may be blocked until first interaction — ignore */
  }
}
