import { useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { Note } from '@assets/types/types';

/* 
  -Takes in { note id }
  -Deletes note from database is user is logged in
  -Deletes note from local storage if user isn't logged in
  -Returns true if note was successfully deleted, false if not
*/

interface DeleteNotePropsType {
    id: string;
}

const useDeleteNote = () => {
    const { data: session } = useSession();

    const deleteNote = async ({id}: DeleteNotePropsType): Promise<boolean> => {
        if (session && session.user && session.user.id) {
        // Delete from database if user is logged in
        try {
            const deleteNoteResponse = await fetch(`/api/note/${id}`, {
            method: "DELETE",
            headers: {
                'Content-Type': 'application/json',
            },
            });

            if (!deleteNoteResponse.ok) {
                console.error('Failed to delete note:', deleteNoteResponse.statusText);
                return false;
            }

            return true;
        } catch (error) {
            console.error('Error deleting note:', error);
            return false;
        }
        } else {
            // Delete from local storage if user isn't logged in
            const savedNotes = JSON.parse(localStorage.getItem('notes') || '[]');
            const newNotes = savedNotes.filter((note: Note) => note.id !== id);
            localStorage.setItem('notes', JSON.stringify(newNotes));
            return true;
        }
    }

  return { deleteNote };
};

export default useDeleteNote;
