import { useRef, useCallback } from 'react';

interface SoundEffects {
  move: HTMLAudioElement;
  capture: HTMLAudioElement;
  check: HTMLAudioElement;
  checkmate: HTMLAudioElement;
  castle: HTMLAudioElement;
  promote: HTMLAudioElement;
  gameStart: HTMLAudioElement;
  gameEnd: HTMLAudioElement;
  notification: HTMLAudioElement;
}

export const useChessSound = () => {
  const soundsRef = useRef<SoundEffects | null>(null);
  const isMutedRef = useRef(false);

  const initializeSounds = useCallback(() => {
    if (soundsRef.current) return;

    try {
      soundsRef.current = {
        move: new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmUcBDuO2O/MeS0GJXzL7+OTRAoUYLbr87ZeGAg+ltryxXomBSl+zPLaizsIGGS57OihUgwLTKXh8bllHgg2jdXzzHkpBSF+z/LdizEIHWq+8+OVRgoVYrbq8bNeGgg+ldv0xnkpBSV6yvHhjj4KGWm98OSpTwwNSKfh9LdlGwg4kNbxynkqBSJ70O/dkUAJH2y68OWYSAsVYLPn8bZeFwk9mtvx'),
        capture: new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmUcBDuO2O/MeS0GJXzL7+OTRAoUYLbr87ZeGAg+ltryxXomBSl+zPLaizsIGGS57OihUgwLTKXh8bllHgg2jdXzzHkpBSF+z/LdizEIHWq+8+OVRgoVYrbq8bNeGgg+ldv0xnkpBSV6yvHhjj4KGWm98OSpTwwNSKfh9LdlGwg4kNbxynkqBSJ70O/dkUAJH2y68OWYSAsVYLPn8bZeFwk9mtvx'),
        check: new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmUcBDuO2O/MeS0GJXzL7+OTRAoUYLbr87ZeGAg+ltryxXomBSl+zPLaizsIGGS57OihUgwLTKXh8bllHgg2jdXzzHkpBSF+z/LdizEIHWq+8+OVRgoVYrbq8bNeGgg+ldv0xnkpBSV6yvHhjj4KGWm98OSpTwwNSKfh9LdlGwg4kNbxynkqBSJ70O/dkUAJH2y68OWYSAsVYLPn8bZeFwk9mtvx'),
        checkmate: new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmUcBDuO2O/MeS0GJXzL7+OTRAoUYLbr87ZeGAg+ltryxXomBSl+zPLaizsIGGS57OihUgwLTKXh8bllHgg2jdXzzHkpBSF+z/LdizEIHWq+8+OVRgoVYrbq8bNeGgg+ldv0xnkpBSV6yvHhjj4KGWm98OSpTwwNSKfh9LdlGwg4kNbxynkqBSJ70O/dkUAJH2y68OWYSAsVYLPn8bZeFwk9mtvx'),
        castle: new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmUcBDuO2O/MeS0GJXzL7+OTRAoUYLbr87ZeGAg+ltryxXomBSl+zPLaizsIGGS57OihUgwLTKXh8bllHgg2jdXzzHkpBSF+z/LdizEIHWq+8+OVRgoVYrbq8bNeGgg+ldv0xnkpBSV6yvHhjj4KGWm98OSpTwwNSKfh9LdlGwg4kNbxynkqBSJ70O/dkUAJH2y68OWYSAsVYLPn8bZeFwk9mtvx'),
        promote: new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmUcBDuO2O/MeS0GJXzL7+OTRAoUYLbr87ZeGAg+ltryxXomBSl+zPLaizsIGGS57OihUgwLTKXh8bllHgg2jdXzzHkpBSF+z/LdizEIHWq+8+OVRgoVYrbq8bNeGgg+ldv0xnkpBSV6yvHhjj4KGWm98OSpTwwNSKfh9LdlGwg4kNbxynkqBSJ70O/dkUAJH2y68OWYSAsVYLPn8bZeFwk9mtvx'),
        gameStart: new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmUcBDuO2O/MeS0GJXzL7+OTRAoUYLbr87ZeGAg+ltryxXomBSl+zPLaizsIGGS57OihUgwLTKXh8bllHgg2jdXzzHkpBSF+z/LdizEIHWq+8+OVRgoVYrbq8bNeGgg+ldv0xnkpBSV6yvHhjj4KGWm98OSpTwwNSKfh9LdlGwg4kNbxynkqBSJ70O/dkUAJH2y68OWYSAsVYLPn8bZeFwk9mtvx'),
        gameEnd: new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmUcBDuO2O/MeS0GJXzL7+OTRAoUYLbr87ZeGAg+ltryxXomBSl+zPLaizsIGGS57OihUgwLTKXh8bllHgg2jdXzzHkpBSF+z/LdizEIHWq+8+OVRgoVYrbq8bNeGgg+ldv0xnkpBSV6yvHhjj4KGWm98OSpTwwNSKfh9LdlGwg4kNbxynkqBSJ70O/dkUAJH2y68OWYSAsVYLPn8bZeFwk9mtvx'),
        notification: new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmUcBDuO2O/MeS0GJXzL7+OTRAoUYLbr87ZeGAg+ltryxXomBSl+zPLaizsIGGS57OihUgwLTKXh8bllHgg2jdXzzHkpBSF+z/LdizEIHWq+8+OVRgoVYrbq8bNeGgg+ldv0xnkpBSV6yvHhjj4KGWm98OSpTwwNSKfh9LdlGwg4kNbxynkqBSJ70O/dkUAJH2y68OWYSAsVYLPn8bZeFwk9mtvx')
      };

      // Set volume for all sounds
      Object.values(soundsRef.current).forEach(audio => {
        audio.volume = 0.3;
      });
    } catch (error) {
      console.warn('Failed to initialize audio:', error);
    }
  }, []);

  const playSound = useCallback((soundType: keyof SoundEffects) => {
    if (isMutedRef.current) return;
    
    initializeSounds();
    
    try {
      const sound = soundsRef.current?.[soundType];
      if (sound) {
        sound.currentTime = 0;
        sound.play().catch(e => {
          // Silently fail if audio can't play (user hasn't interacted yet)
          console.debug('Could not play sound:', e);
        });
      }
    } catch (error) {
      console.debug('Sound playback error:', error);
    }
  }, [initializeSounds]);

  const toggleMute = useCallback(() => {
    isMutedRef.current = !isMutedRef.current;
    return isMutedRef.current;
  }, []);

  const isMuted = () => isMutedRef.current;

  return {
    playSound,
    toggleMute,
    isMuted,
    initializeSounds
  };
};