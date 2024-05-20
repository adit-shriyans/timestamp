'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
import YouTube, { YouTubeEvent, YouTubePlayer } from 'react-youtube';
import NotesSection from './NotesSection';
import { Note } from '@assets/types/types';
import { useSession } from 'next-auth/react';

interface VideoPlayerPropsI {
  videoId: string;
  setVideoTitle: React.Dispatch<React.SetStateAction<string>>;
  setVideoDescription: React.Dispatch<React.SetStateAction<string>>;
}

const VideoPlayer = ({ videoId, setVideoTitle }: VideoPlayerPropsI) => {
  const [currentTime, setCurrentTime] = useState(0);
  const [isAddingNotes, setIsAddingNotes] = useState(false);
  const [allUserNotes, setAllUserNotes] = useState<Note[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const { data: session } = useSession();
  const playerRef = useRef<YouTubePlayer | null>(null);

  const onPlayerReady = (event: YouTubeEvent) => {
    playerRef.current = event.target;
    const videoTitle = playerRef.current.getVideoData().title;
    setVideoTitle(videoTitle);
  };

  const opts = {
    height: '511.875',
    width: '840',
    playerVars: {
      autoplay: 0,
    },
  };

  const fetchNotes = useCallback(async () => {
    if (session && session.user) {
      try {
        const res = await fetch(`/api/note/${session.user.id}`);
        const data = await res.json();
        const savedNotes = data.map((note: { _id: any; videoId: any; note: any; timeStamp: any; date: any; }) => ({id: note._id, videoId: note.videoId, note: note.note, timeStamp: note.timeStamp, date: note.date}))
        setAllUserNotes(savedNotes);
      } catch (err) {
        console.log(err);
        setAllUserNotes([])
      }
    } else {
      const localNotes = JSON.parse(localStorage.getItem('notes') || '[]');
      setAllUserNotes(localNotes);
    }
  }, [session]);

  useEffect(() => {
    fetchNotes();
  }, [videoId, session]);

  useEffect(() => {
    // get notes for the loaded video
    const filteredNotes = allUserNotes.filter(note => note.videoId === videoId);
    // sort filteredNotes in ascending order of timestamp
    const sortedNotes = filteredNotes.sort((a, b) => a.timeStamp - b.timeStamp);
    setNotes(sortedNotes);
  }, [allUserNotes, videoId]);

  useEffect(() => {
    //sort notes in ascending order of timestamp
    const sortedNotes = notes.sort((a, b) => a.timeStamp - b.timeStamp);
    setNotes(sortedNotes);
  }, [notes]);

  const handleAddNotes = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (playerRef.current) {
      const currentTime = playerRef.current.getCurrentTime();
      const timeStampExists = notes.find(note => Math.floor(note.timeStamp) === Math.floor(currentTime));

      if (!timeStampExists && [1, 2, 3].includes(playerRef.current.getPlayerState())) { // to check if player is playing(1), paused(2) or buffering(3)
        playerRef.current.pauseVideo();
        setCurrentTime(currentTime);
        setIsAddingNotes(true);
      } 
      else if (timeStampExists) {
        alert("A note already exists at this timeStamp.");
      } 
      else if (playerRef.current.getPlayerState() === 0) { // if video has ended
        alert("Video already ended.");
      }
      else if (playerRef.current.getPlayerState() === 5) { // if player is cued but isnt playing
        alert("Play the video first.");
      }
    }
  };

  const goToTimeStamp = (timeStamp: number) => {
    if (playerRef.current) {
      playerRef.current.seekTo(timeStamp, true);
      playerRef.current.pauseVideo();
    }
  };

  useEffect(() => {
    if (isAddingNotes === false) {
      playerRef.current?.playVideo();
    }
  }, [isAddingNotes]);

  return (
    <div className='VideoPlayer'>
      <div className='VideoPlayer__video'>
        <YouTube videoId={videoId} opts={opts} onReady={onPlayerReady} style={{ width: '100vw', height: 'auto' }} />
      </div>
      <div className='VideoPlayer__notes'>
        <NotesSection
          videoId={videoId}
          handleAddNotes={handleAddNotes}
          currentTime={currentTime}
          isAddingNotes={isAddingNotes}
          setIsAddingNotes={setIsAddingNotes}
          notes={notes}
          setNotes={setNotes}
          goToTimeStamp={goToTimeStamp}
        />
      </div>
    </div>
  );
};

export default VideoPlayer;
