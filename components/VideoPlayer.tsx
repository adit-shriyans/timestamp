'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
import YouTube, { YouTubeEvent, YouTubePlayer } from 'react-youtube';
import NotesSection from './NotesSection';
import { Note } from '@assets/types/types';
import { useSession } from 'next-auth/react';

/*
  @Props: 
    - VideoId: id of the video currently playing
    - setVideoTitle: function to get title of video currently playing (videoTitle displayed in parent component page.tsx)

  @State:
    - currentTime: time in seconds at the moment "Add new note" button (NotesSection.tsx) is clicked
    - isAddingNotes: boolean to determine if user is adding notes to video
    - allUserNotes: * array of all the notes user has ever made if logged in
                    * array of all the notes in local storage if not logged in
    - notes: array of notes for the current videoId
*/

interface VideoPlayerPropsI {
  videoId: string;
  setVideoTitle: React.Dispatch<React.SetStateAction<string>>;
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
    if (session && session.user) { // fetch notes from database if user is logged in
      try {
        const res = await fetch(`/api/note/${session.user.id}`);
        const data = await res.json();
        const savedNotes = data.map((note: { _id: any; videoId: any; note: any; timeStamp: any; date: any; }) => ({id: note._id, videoId: note.videoId, note: note.note, timeStamp: note.timeStamp, date: note.date}))
        setAllUserNotes(savedNotes);
      } catch (err) {
        console.log(err);
        setAllUserNotes([])
      }
    } else { // fetch notes from local storage if user isnt logged in
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

  // function to just check if note can be added -> isAddingNotes = true if all checks are successful and it is safe to add new note
  const addNoteCheck = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (playerRef.current) {
      const currentTime = playerRef.current.getCurrentTime();
      // check if a note already exists at the current time stamp
      const timeStampExists = notes.find(note => Math.floor(note.timeStamp) === Math.floor(currentTime));

      if (!timeStampExists && [1, 2, 3].includes(playerRef.current.getPlayerState())) { // to check if note already exists at this timestamp and video is playing(1), paused(2) or buffering(3)
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
          addNoteCheck={addNoteCheck}
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
