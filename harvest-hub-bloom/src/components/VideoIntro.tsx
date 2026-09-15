import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";

const VideoIntro = ({ onComplete }: { onComplete: () => void }) => {
  const [canSkip, setCanSkip] = useState(false);

  useEffect(() => {
    // Allow skipping after 2 seconds
    const timer = setTimeout(() => setCanSkip(true), 2000);
    return () => clearTimeout(timer);
  }, []);

  const handleVideoEnd = () => {
    onComplete();
  };

  const handleSkip = () => {
    if (canSkip) {
      onComplete();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: '#90ba91' }}>
      <div className="relative w-full h-full flex items-center justify-center">
        <video
          src="/logo video.mp4"
          autoPlay
          muted
          playsInline
          onEnded={handleVideoEnd}
          className="w-full h-full object-contain"
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
          }}
        />
      </div>
      {canSkip && (
        <Button
          onClick={handleSkip}
          className="absolute bottom-8 right-8 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white border border-white/30 px-6 py-3 z-10 md:bottom-10 md:right-10"
        >
          Skip
        </Button>
      )}
    </div>
  );
};

export default VideoIntro;
