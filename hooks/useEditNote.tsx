import { useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { Note } from '@assets/types/types';

/* 
  -Takes in { note id,
              new note message,
              edit Date object }
  -Edits a note from database if user is logged in
  -Edits a note from local storage if user isn't logged in
  -Returns true if editted successfully, false if not
*/

interface UpdateNotePropsType {
  id: string;
  msg: string;
  date: Date;
}

const useEditNote = () => {
  const { data: session } = useSession();

  const editNote = useCallback(async ({ id, msg, date }: UpdateNotePropsType): Promise<boolean> => {
    if (session && session.user && session.user.id) {
      // Update in database if user is logged in
      try {
        const editNoteResponse = await fetch(`/api/note/${id}`, {
          method: "PATCH",
          body: JSON.stringify({
            note: msg,
            date,
          }),
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!editNoteResponse.ok) {
          console.error('Failed to update note:', editNoteResponse.statusText);
          return false;
        }
        return true;
      } catch (error) {
        console.error('Error updating note:', error);
        return false;
      }
    } 
    else {
      // Update in local storage if user isn't logged in
      const savedNotes: Note[] = JSON.parse(localStorage.getItem('notes') || '[]');
      const updatedNotes = savedNotes.map((note) => {
        if (note.id === id) {
          return {
            ...note,
            note: msg,
            date,
          };
        }
        return note;
      });
      localStorage.setItem('notes', JSON.stringify(updatedNotes));
      
      alert("Saved to local storage, login to save to database");
      return true;
    }
  }, [session]);

  return { editNote };
};

export default useEditNote;
