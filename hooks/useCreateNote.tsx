import { useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { v4 as uuid } from 'uuid';
import { Note } from '@assets/types/types';

/* 
  -Takes in { videoId, 
              the note written,
              current time }
  -Saves note to database if user is logged in
  -Saves note to local storage if user isn't logged in
  -Returns the note that was saved to the database or local storage
*/

interface CreateNotePropsType {
  videoId: string;
  note: string;
  currentTime: number;
}

const useCreateNote = () => {
  const { data: session } = useSession();

  const createNewNote = useCallback(async ({videoId, note, currentTime}: CreateNotePropsType): Promise<Note | null> => {
    const date = new Date();

    if (session && session.user && session.user.id) {
      // Save to database if user is logged in
      try {
        const createNoteResponse = await fetch("/api/note/new", {
          method: "POST",
          body: JSON.stringify({
            userId: session.user.id,
            videoId,
            note,
            timeStamp: currentTime,
            date: date,
          }),
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!createNoteResponse.ok) {
          console.error('Failed to create note:', createNoteResponse.statusText);
          return null;
        }

        const createdNote = await createNoteResponse.json();
        return { id: createdNote._id, videoId, note, timeStamp: currentTime, date}
      } catch (error) {
        console.error('Error creating note:', error);
        return null;
      }
    } else {
      // Save to local storage if user isn't logged in
      const savedNotes = JSON.parse(localStorage.getItem('notes') || '[]');
      const noteId = uuid();
      savedNotes.push({id: noteId, videoId, note, timeStamp: currentTime, date});
      localStorage.setItem('notes', JSON.stringify(savedNotes));

      alert("Saved to local storage, login to save to database");
      return {id: noteId, videoId, note, timeStamp: currentTime, date};
    }
  }, [session]);

  return { createNewNote };
};

export default useCreateNote;
