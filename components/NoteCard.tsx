'use client'

import React, { useEffect, useRef, useState } from 'react';
import { Note } from '@assets/types/types';
import useDeleteNote from '@hooks/useDeleteNote';
import useEditNote from '@hooks/useEditNote';
import '@styles/css/NoteCard.css';

/*
  @Params: 
    - note: Note to be displayed by this component
    - notes: array of notes to be displayed
    - setNotes: React.Dispatch<React.SetStateAction<Note[]>>
    - goToTimeStamp: function to seek to a time stamp in the video

  @State: 
    - isEditting: boolean to determine if the note is currently being editted
    - edittedNote: editted note input by the user (default: previous note)
*/ 

interface NoteProps {
    note: Note;
    notes: Note[];
    setNotes: React.Dispatch<React.SetStateAction<Note[]>>;
    goToTimeStamp: (timeStamp: number) => void;
}

// function to convert Date object to string of format DD Month 'last 2 digits of year
const formatDate = (noteDate: Date): string => {
  const date = new Date(noteDate);
  const day = date.getDate();
  const month = date.toLocaleString('default', { month: 'short' }); 
  const year = date.getFullYear().toString().slice(-2);

  return `${day} ${month} '${year}`;
}

const NoteCard = ({note, notes, setNotes, goToTimeStamp}: NoteProps) => {
  const [isEditting, setIsEditting] = useState(false);
  const [edittedNote, setEdittedNote] = useState(note.note);

  const { deleteNote } = useDeleteNote();
  const { editNote } = useEditNote();

  const editInputRef = useRef<HTMLInputElement | null>(null)

  // saves editted note if user input (edittedNote) isnt empty string
  const handleEditSave = async () => {
    if(edittedNote !== '') {
      const date = new Date();
      const isEditted = await editNote({id: note.id, msg: edittedNote, date}); // boolean to check if note is editted successfully
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

  // set isEditting to true indicating user is editing a note
  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditting(true);
  }

  // cancel editting, without reseting edittedNote
  const handleEditCancel = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    setIsEditting(false);
  }

  // deleting  note
  const handleDelete = async (e:  React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    const isDeleted = await deleteNote({id: note.id});
    if(isDeleted) {
      const newNotes = notes.filter(n => n.id !== note.id);
      setNotes(newNotes);
    }
  }

  // save note if user presses enter in input field
  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    e.stopPropagation();
    if(e.key === 'Enter') {
      handleEditSave();
    }
  }

  // focus on input field when user clicks on Edit button
  useEffect(() => {
    if (isEditting && editInputRef.current) {
        editInputRef.current.focus();
    }
  }, [isEditting]);

  return (
    <div className='NoteCard'>
      <div className='NoteCard__timestamp'> {/* last edit date and timestamp of video */}
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
      <div className='NoteCard__note-container'> {/* display note if not editting, display input otherwise */}
        {isEditting ? (
            <input 
              value={edittedNote}
              className='NoteCard__note-input'
              onChange={(e) => setEdittedNote(e.target.value)}
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
      <div className='NoteCard__btns'> {/* Display "Edit" and "Delete" if not editting; display "Save" and "Cancel" if editting */}
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