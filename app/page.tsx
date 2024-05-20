"use client";
import { useEffect, useRef, useState } from 'react';
import { useSession } from 'next-auth/react';
import type { DefaultSession } from 'next-auth';
import VideoPlayer from '@components/VideoPlayer';
import { Alert, Box, Button, Snackbar, TextField } from '@mui/material';
import '@styles/css/index.css';

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
  const [videoTitle, setVideoTitle] = useState('');
  const [videoDescription, setVideoDescription] = useState('');
  const [urlInputError, setUrlInputError] = useState(false);
  const urlInputRef = useRef<HTMLInputElement | null>(null);
  const { data: session } = useSession();

  const handleVideoUrlSubmit = (e: React.FormEvent<HTMLFormElement> | React.KeyboardEvent<HTMLInputElement>): void => {
    e.preventDefault();
    const regex = /(?:https?:\/\/)?(?:www\.)?youtu(?:\.be|be\.com)\/(watch\?v=)?([^\s&]+)/;

    // Check if user input is a valid YouTube video URL
    if (!regex.test(videoUrl)) {
      setUrlInputError(true);
      return;
    }

    // Get video ID from URL
    const match = regex.exec(videoUrl);
    // Handles case where video URL contains list and index info
    if (match && match[2]) {
      setVideoId(match[2]);
      localStorage.setItem('videoId', match[2]);
      setVideoUrl('');
    }
  };

  const handleUrlInputBlur = () => {
    setUrlInputError(false);
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleVideoUrlSubmit(e);
      urlInputRef.current?.blur();
    }
  }

  // Load video ID from localStorage
  useEffect(() => {
    if (videoId === '') { 
      const vidId = localStorage.getItem('videoId') || 'eRU4VMHSsv0';
      setVideoId(vidId);
    }
  }, []);

  return (
    <div className="Page">
      <div className='Page__header'>
        <div>
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
        </div>
        <div className='Page__vidData'>
            {videoTitle?'':'Play a video!'}
            <div
              className='Page__vidData-title'
            >
              {videoTitle}
            </div>
        </div>
      </div>
      <div className='Page__video'>
        <VideoPlayer videoId={videoId} setVideoTitle={setVideoTitle} setVideoDescription={setVideoDescription} />
      </div>
    </div>
  );
};

export default MyPage;
