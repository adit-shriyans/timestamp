"use client";
import { useEffect, useRef, useState } from 'react';
import { useSession } from 'next-auth/react';
import type { DefaultSession } from 'next-auth';
import VideoPlayer from '@components/VideoPlayer';
import { Button, TextField } from '@mui/material';
import '@styles/css/index.css';

/* 
  @States: 
    - videoUrl: string --> user input -> url of the video
    - videoId: string --> get from videoUrl (default: eRU4VMHSsv0)
    - videoTitle: string --> get from videoId / videoUrl
    - urlInputError: boolean --> check if user input is a valid YouTube video URL
*/

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
  const [urlInputError, setUrlInputError] = useState(false);
  const urlInputRef = useRef<HTMLInputElement | null>(null);

  // performs checks on the input value and returns videoId if URL is valid
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
    if (match && match[2] !== '' && match[2] !== videoId) {
      setVideoId(match[2]);
      localStorage.setItem('videoId', match[2]);

      // clear input after getting video ID
      setVideoUrl('');
    }
    else if(match && match[2] == videoId) {
      alert('Video already playing');
      setVideoUrl('');
    }
  };

  // remove error from input if user clicks outside the form
  const handleUrlInputBlur = () => {
    setUrlInputError(false);
  };

  // submit video url
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
      <div className='Page__header'> {/* Page heading; URL input form; Video Title */}
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
      <div className='Page__video'> {/* Video and notes */}
        <VideoPlayer videoId={videoId} setVideoTitle={setVideoTitle} />
      </div>
    </div>
  );
};

export default MyPage;
