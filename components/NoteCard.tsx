import React from 'react';
import { Note } from '@assets/types/types';

interface NoteProps {
    note: Note;
    setNotes: React.Dispatch<React.SetStateAction<Note[]>>;
}

const NoteCard = ({note}: NoteProps) => {
  return (
    <div>
      {note.note}
    </div>
  )
}

export default NoteCard;