import { Audio } from 'expo-av';

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export async function playAlarmBellThreeTimes() {
  let sound = null;

  try {
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      playsInSilentModeIOS: true,
      staysActiveInBackground: false,
      shouldDuckAndroid: true,
      playThroughEarpieceAndroid: false,
    });

    for (let i = 0; i < 3; i += 1) {
      const result = await Audio.Sound.createAsync(
        require('../assets/voice/jihyun_voice.m4a'),
        {
          shouldPlay: true,
          volume: 1.0,
        }
      );

      sound = result.sound;

      await new Promise((resolve, reject) => {
        sound.setOnPlaybackStatusUpdate((status) => {
          if (!status.isLoaded) return;
          if (status.didJustFinish) resolve();
        });
      });

      await sound.unloadAsync();
      sound = null;

      if (i < 2) {
        await sleep(2000);
      }
    }
  } catch (error) {
    console.error('알람 음성 재생 실패:', error);
    if (sound) {
      try {
        await sound.unloadAsync();
      } catch {}
    }
  }
}