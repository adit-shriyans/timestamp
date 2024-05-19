import React, { useRef, useState, useEffect } from 'react';
import YouTube, { YouTubeEvent, YouTubePlayer } from 'react-youtube';
import NotesSection from './NotesSection';
import { Note } from '@assets/types/types';

interface VideoPlayerPropsI {
  videoId: string;
}

const VideoPlayer = ({ videoId }: VideoPlayerPropsI) => {
  const [currentTime, setCurrentTime] = useState(0);
  const [isAddingNotes, setIsAddingNotes] = useState(false);
  const [notes, setNotes] = useState<Note[]>([]);

  const playerRef = useRef<YouTubePlayer | null>(null);

  const onPlayerReady = (event: YouTubeEvent) => {
    playerRef.current = event.target;
  };

  const opts = {
    height: '511.875',
    width: '840',
    playerVars: {
      autoplay: 0,
    },
  };

  const handleAddNotes = () => {
    if (playerRef.current) {
      playerRef.current.pauseVideo();
      setCurrentTime(playerRef.current.getCurrentTime());
      setIsAddingNotes(true);
    }
  };

  // Play video when user if done adding notes
  useEffect(() => {
    if(isAddingNotes === false) 
      playerRef.current?.playVideo()
  }, [isAddingNotes]);

  return (
    <div className='VideoPlayer'>
      <YouTube videoId={videoId} opts={opts} onReady={onPlayerReady} style={{ width: '100vw', height: 'auto' }} />
      <NotesSection videoId={videoId} handleAddNotes={handleAddNotes} currentTime={currentTime} isAddingNotes={isAddingNotes} setIsAddingNotes={setIsAddingNotes} notes={notes} setNotes={setNotes} />
    </div>
  );
};

export default VideoPlayer;
