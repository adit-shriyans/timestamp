"use client";
import '@styles/css/index.css'
import { useEffect, useMemo, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import type { DefaultSession } from 'next-auth';
import demoImg from '../assets/sitedemo.png';
import Image from 'next/image';
import TelegramIcon from '@mui/icons-material/Telegram';
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
  const [videoId, setVideoId] = useState('eRU4VMHSsv0');
  const [urlInputError, setUrlInputError] = useState(false);
  const urlInputRef = useRef(null);
  const { data: session } = useSession();
  const router = useRouter();

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
    console.log(regex, match);
    // handles case where video url contains list and index info
    if(match && match[2]) setVideoId(match[2]);
  };

  const handleUrlInputBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setUrlInputError(false);
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleVideoUrlSubmit(e);
    }
  }

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
{/* <iframe width="914" height="514" src="https://www.youtube.com/embed/xNRJwmlRBNU" title="How To Embed YouTube Videos in React / Gatsby (and make them Responsive)" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe> */}

export default MyPage;