"use client";
import '@styles/css/index.css'
import { useEffect, useRef, useState } from 'react';
import { useSession } from 'next-auth/react';
import type { DefaultSession } from 'next-auth';
import VideoPlayer from '@components/VideoPlayer';
import { Alert, Box, Button, Snackbar, TextField } from '@mui/material';

declare module 'next-auth' {
  interface Session {
    user: DefaultSession['user'] & {
      id: string;
    };
  }
}

const MyPage = () => {
  const [videoUrl, setVideoUrl] = useState('');
  const [videoId, setVideoId] = useState('');
  const [urlInputError, setUrlInputError] = useState(false);
  const urlInputRef = useRef<HTMLInputElement | null>(null);
  const { data: session } = useSession();

  const handleVideoUrlSubmit = (e: React.FormEvent<HTMLFormElement> | React.KeyboardEvent<HTMLInputElement>): void => {
    e.preventDefault();
    const regex = /(?:https?:\/\/)?(?:www\.)?youtu(?:\.be|be\.com)\/(watch\?v=)?([^\s&]+)/;

    //check if user input is a valid youtube video url
    if (!regex.test(videoUrl)) {
      setUrlInputError(true);
      return;
    }

    // get video id from url
    const match = regex.exec(videoUrl);
    // handles case where video url contains list and index info
    if(match && match[2]) {
      setVideoId(match[2]);
      localStorage.setItem('videoId', match[2]);
    }
  };

  const handleUrlInputBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setUrlInputError(false);
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleVideoUrlSubmit(e);
      urlInputRef.current?.blur();
    }
  }

  // save videoId in localStorage
  useEffect(() => {
    if(videoId === '') { 
      const vidId = localStorage.getItem('videoId') || 'eRU4VMHSsv0';
      setVideoId(vidId);
    }
  }, [videoId]);

  return (
    <div className="Page">
      <h1 className='Page__heading'>Video Player with Notes</h1>
      <form onSubmit={handleVideoUrlSubmit} className='Page__videoInput'>
        <TextField
          label={urlInputError ? "Invalid YouTube URL" : "YouTube Video URL"}
          variant="outlined"
          value={videoUrl}
          className='Page__videoInput-input'
          onChange={(e) => setVideoUrl(e.target.value)}
          placeholder='Enter video URL'
          required
          onKeyDown={handleInputKeyDown}
          InputLabelProps={{
            shrink: true,
          }}
          ref={urlInputRef}
          error={urlInputError}
          onBlur={handleUrlInputBlur}
        />
        <Button type="submit" variant="contained" color="primary" className='Page__videoInput-submit'>
          Watch
        </Button>
      </form>
      <div className='Page__video'>
        <VideoPlayer videoId={videoId}/>
      </div>
    </div>
  );
};

export default MyPage;