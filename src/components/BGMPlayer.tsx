import {useEffect} from 'react';
import TrackPlayer, {
  Capability,
  RepeatMode,
} from 'react-native-track-player';

const BGMPlayer = () => {
  useEffect(() => {
    let isSetup = false;

    const setupPlayer = async () => {
      try {
        // Setup the player
        await TrackPlayer.setupPlayer({
          autoHandleInterruptions: true,
        });

        // Update options
        await TrackPlayer.updateOptions({
          capabilities: [
            Capability.Play,
            Capability.Pause,
          ],
          compactCapabilities: [Capability.Play, Capability.Pause],
        });

        // Add track
        await TrackPlayer.add({
          id: 'bgm',
          url: require('../assets/audio/bgm.mp3'),
          title: 'BugOut BGM',
          artist: 'BugOut',
        });

        // Set repeat mode to loop
        await TrackPlayer.setRepeatMode(RepeatMode.Track);

        // Set volume
        await TrackPlayer.setVolume(0.5);

        // Play
        await TrackPlayer.play();

        isSetup = true;
      } catch (error) {
        console.log('Failed to setup BGM:', error);
      }
    };

    setupPlayer();

    // Cleanup function
    return () => {
      if (isSetup) {
        TrackPlayer.reset();
      }
    };
  }, []);

  return null; // This component doesn't render anything
};

export default BGMPlayer;
