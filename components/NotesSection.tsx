'use client'

import React, { useRef, useState, useEffect } from 'react';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import { Note } from '@assets/types/types';
import NoteCard from './NoteCard';
import { useSession } from 'next-auth/react';
import useCreateNote from '@hooks/useCreateNote';
import '@styles/css/NotesSection.css';

interface NotesSectionProps {
    videoId: string;
    handleAddNotes: (e: React.MouseEvent) => void;
    currentTime: number;
    isAddingNotes: boolean;
    setIsAddingNotes: React.Dispatch<React.SetStateAction<boolean>>;
    notes: Note[];
    setNotes: React.Dispatch<React.SetStateAction<Note[]>>;
    goToTimeStamp: (timeStamp: number) => void;
}

const NotesSection = ({videoId, handleAddNotes, currentTime, isAddingNotes, setIsAddingNotes, notes, setNotes, goToTimeStamp}: NotesSectionProps) => {
    const [inputNote, setInputNote] = useState('');
    const {createNewNote} = useCreateNote();
    
    const notesInputRef = useRef<HTMLInputElement | null>(null);

    useEffect(() => {
        if (isAddingNotes && notesInputRef.current) {
            notesInputRef.current.focus();
        }
    }, [isAddingNotes]);

    const handleAddNote = async (e:  React.MouseEvent<HTMLButtonElement> | React.KeyboardEvent<HTMLInputElement>) => {
        e.stopPropagation();
        if(isAddingNotes && inputNote !== '') {
            const newNote = await createNewNote({
                videoId, 
                note: inputNote, 
                currentTime
            });
            if(newNote) {
                const newNotes: Note[] = [...notes, newNote];
                newNotes.sort((a, b) => a.timeStamp - b.timeStamp);
                setNotes(newNotes);
                setInputNote('');
                setIsAddingNotes(false);
            }
            setIsAddingNotes(false);
        }
    }

    const handleNoteCancel = () => {
        setInputNote('');
        setIsAddingNotes(false);
    }

    const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleAddNote(e);
        }
    }

    const handleInputBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        e.stopPropagation();
        setIsAddingNotes(false);
    }

  return (
    <div className='Notes'>
        <div className='Notes__header'>
            <div className='Notes__header-main'>
                <div className='Notes__text'>
                    <div className='Notes__text-heading'>My notes</div>
                    <div className='Notes__text-desc'>All your notes at a single place. Click on any note to go to specific timestamp in the video.</div>
                </div>
                <button className='Notes__addBtn' onClick={handleAddNotes}>
                    <AddCircleOutlineIcon />
                    Add new note
                </button>
            </div>
            <div 
                className={`Notes__header-input ${!isAddingNotes?'hidden':''}`}
            >
                <div className='Notes__header-timestamp'>
                    Timestamp: {Math.floor(currentTime/60)} min {Math.floor(currentTime%60)} sec
                </div>
                <input 
                    ref={notesInputRef} 
                    className='Notes__addNotes-input' 
                    value={inputNote}
                    onChange={(e) => setInputNote(e.target.value)}
                    onKeyDown={handleInputKeyDown}
                />    
                <div className='Notes__addNotes-btns'>
                    <button className='Notes__addNotes-submitBtn' onClick={handleAddNote}>Add</button>
                    <button className='Notes__addNotes-cancelBtn' onClick={handleNoteCancel}>Cancel</button>
                </div>
            </div>
        </div>
        <div className='Notes__notesContainer'>
            {notes.map((note, idx) => (
                <div key={idx}>
                    <NoteCard note={note} notes={notes} setNotes={setNotes} goToTimeStamp={goToTimeStamp} />
                </div>
            ))}
        </div>
    </div>
  )
}

export default NotesSection