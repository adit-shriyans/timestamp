'use client'

import React, { useEffect, useRef, useState } from 'react';
import { Note } from '@assets/types/types';
import useDeleteNote from '@hooks/useDeleteNote';
import useEditNote from '@hooks/useEditNote';
import '@styles/css/NoteCard.css';

interface NoteProps {
    note: Note;
    notes: Note[];
    setNotes: React.Dispatch<React.SetStateAction<Note[]>>;
    goToTimeStamp: (timeStamp: number) => void;
}

const formatDate = (noteDate: Date): string => {
  const date = new Date(noteDate);
  const day = date.getDate();
  const month = date.toLocaleString('default', { month: 'short' }); // 'May'
  const year = date.getFullYear().toString().slice(-2); // Extract last 2 digits

  return `${day} ${month} '${year}`;
}

const NoteCard = ({note, notes, setNotes, goToTimeStamp}: NoteProps) => {
  const [isEditting, setIsEditting] = useState(false);
  const [edittedNote, setEdittedNote] = useState(note.note);
  const { deleteNote } = useDeleteNote();
  const { editNote } = useEditNote();

  const editInputRef = useRef<HTMLInputElement | null>(null)

  const handleEditSave = async () => {
    if(edittedNote !== '') {
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
  }

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditting(true);
  }

  const handleEditCancel = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    setEdittedNote(note.note);
    setIsEditting(false);
  }

  const handleDelete = async (e:  React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
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

  useEffect(() => {
    if (isEditting && editInputRef.current) {
        editInputRef.current.focus();
    }
  }, [isEditting]);

  return (
    <div className='NoteCard'>
      <div className='NoteCard__timestamp'>
        <div className='NoteCard__timestamp-date'>
          {formatDate(note.date)}
        </div>
        <div className='NoteCard__timestamp-time' onClick={() => goToTimeStamp(note.timeStamp)}>
          Timestamp: 
          <span className='NoteCard__timestamp-time-stamp'>
            {Math.floor(note.timeStamp/60)} min {Math.floor(note.timeStamp%60)} sec
          </span>
        </div>
      </div>
      <div className='NoteCard__note-container'>
        {isEditting ? (
            <input 
              value={edittedNote}
              className='NoteCard__note-input'
              onChange={(e) => setEdittedNote(e.target.value)}
              // onBlur={handleInputBlur}
              ref={editInputRef}
              onKeyDown={handleInputKeyDown} 
            />
          ) : (
            <div className='NoteCard__note'>
              {note.note}
            </div>
          )
        }
      </div>
      <div className='NoteCard__btns'>
        {isEditting ? (
          <>
            <button 
              className='NoteCard__note-save' 
              onClick={handleEditSave}
            >
              Save 
            </button>
            <button 
              className='NoteCard__note-cancel' 
              onClick={handleEditCancel}
            > 
              Cancel 
            </button>
          </>
        ):(
          <>
            <button 
              onClick={handleDelete}
              className='NoteCard__delete'
            >
              Delete
            </button>
            <button 
              onClick={handleEditClick}
              className='NoteCard__edit'
            >
              Edit
            </button>
          </>
        )}
      </div>
    </div>
  )
}

export default NoteCard;