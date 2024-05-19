import { useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { v4 as uuid } from 'uuid';
import { Note } from '@assets/types/types';

interface CreateNotePropsType {
  videoId: string;
  note: string;
  currentTime: number;
}

const useCreateNote = ({videoId, note, currentTime}: CreateNotePropsType) => {
  const { data: session } = useSession();
  const [newNote, setNewNote] = useState<Note>({id: uuid(), videoId, note, timeStamp: currentTime, date: new Date()});

  const createNote = useCallback(async ({videoId, note, currentTime}: CreateNotePropsType): Promise<Note> => {
    setNewNote({id: uuid(), videoId, note, timeStamp: currentTime, date: new Date()});

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
            date: newNote.date,
          }),
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!createNoteResponse.ok) {
          console.error('Failed to create note:', createNoteResponse.statusText);
          return newNote;
        }

        const createdNote = await createNoteResponse.json();
        return { ...newNote, id: createdNote._id }
      } catch (error) {
        console.error('Error creating note:', error);
        return newNote;
      }
    } else {
      // Save to local storage if user isn't logged in
      const savedNotes = JSON.parse(localStorage.getItem('notes') || '[]');
      savedNotes.push(newNote);
      localStorage.setItem('notes', JSON.stringify(savedNotes));
      alert("Saved to local storage, login to save to database");
      return newNote;
    }
  }, [session]);

  const createNewNote = ({videoId, note, currentTime}: CreateNotePropsType): Note => {
    createNote({videoId, note: note, currentTime});
    return newNote;
  }

  return { createNewNote };
};

export default useCreateNote;
