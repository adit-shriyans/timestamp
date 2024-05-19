import React, { useState } from 'react';
import { Note } from '@assets/types/types';
import useDeleteNote from '@hooks/useDeleteNote';
import useEditNote from '@hooks/useEditNote';

interface NoteProps {
    note: Note;
    notes: Note[];
    setNotes: React.Dispatch<React.SetStateAction<Note[]>>;
    goToTimeStamp: (timeStamp: number) => void;
}

const NoteCard = ({note, notes, setNotes, goToTimeStamp}: NoteProps) => {
  const [isEditting, setIsEditting] = useState(false);
  const [edittedNote, setEdittedNote] = useState(note.note);
  const { deleteNote } = useDeleteNote();
  const { editNote } = useEditNote();

  const handleEditSave = async () => {
    const date = new Date();
    const isEditted = await editNote({id: note.id, msg: edittedNote, date});
    if(isEditted) {
      // change the editted note in "notes" state 
      const newNotes = notes.map(n => n.id === note.id? {...n, note: edittedNote, date} : n);
      setNotes(newNotes);
      setIsEditting(false);
    }
    else {
      console.error("failed to edit note ", note.id);
    }
  }

  const handleEditCancel = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    setEdittedNote(note.note);
    setIsEditting(false);
  }

  const handleDelete = async () => {
    const isDeleted = await deleteNote({id: note.id});
    if(isDeleted) {
      const newNotes = notes.filter(n => n.id !== note.id);
      setNotes(newNotes);
    }
  }

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    e.stopPropagation();
    if(e.key === 'Enter') {
      handleEditSave();
    }
  }

  const handleInputBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    e.stopPropagation();
    setIsEditting(false);
  }

  return (
    <div className='NoteCard'>
      <div className='NoteCard__timestamp'>
        Timestamp: 
        <div className='NoteCard__timestamp-time' onClick={() => goToTimeStamp(note.timeStamp)}>
          {Math.floor(note.timeStamp/60)} min {Math.floor(note.timeStamp%60)} sec
        </div>
      </div>
      <div className='NoteCard__note'>
        {isEditting ? (
          <>
            <input 
              value={edittedNote}
              className='NoteCard__note-input'
              onChange={(e) => setEdittedNote(e.target.value)}
              onBlur={handleInputBlur}
              onKeyDown={handleInputKeyDown} 
            />
            <button className='NoteCard__note-save' onClick={handleEditSave}> Save </button>
            <button className='NoteCard__note-cancel' onClick={handleEditCancel}> Cancel </button>
          </>
          ) : (
            `${note.note}`
          )
        }
      </div>
      <div className='NoteCard__controlBtns'>
        <button 
          onClick={handleDelete}
          className='NoteCard__delete'
        >
          Delete
        </button>
        <button 
          onClick={() => setIsEditting(true)}
          className='NoteCard__edit'
        >
          Edit
        </button>
      </div>
    </div>
  )
}

export default NoteCard;