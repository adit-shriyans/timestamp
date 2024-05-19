import React, { useRef, useState, useEffect } from 'react';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import '@styles/css/NotesSection.css';
import { Note } from '@assets/types/types';
import NoteCard from './NoteCard';
import { useSession } from 'next-auth/react';
import useCreateNote from '@hooks/useCreateNote';

interface NotesSectionProps {
    videoId: string;
    handleAddNotes: () => void;
    currentTime: number;
    isAddingNotes: boolean;
    setIsAddingNotes: React.Dispatch<React.SetStateAction<boolean>>;
    notes: Note[];
    setNotes: React.Dispatch<React.SetStateAction<Note[]>>;
}

const NotesSection = ({videoId, handleAddNotes, currentTime, isAddingNotes, setIsAddingNotes, notes, setNotes}: NotesSectionProps) => {
    const [inputNote, setInputNote] = useState('');
    const {createNewNote} = useCreateNote({videoId, note: inputNote, currentTime});
    
    const notesInputRef = useRef<HTMLInputElement | null>(null);

  const { data: session } = useSession();

    useEffect(() => {
        if (isAddingNotes) {
            notesInputRef.current?.focus();
        }
    }, [isAddingNotes])

    const handleNoteSubmit = async () => {
        const newNote = createNewNote({videoId, note: inputNote, currentTime});
        setNotes([...notes, newNote]);
        setInputNote('');
        setIsAddingNotes(false);
    }

    const handleNoteCancel = () => {
        setInputNote('');
        setIsAddingNotes(false);
    }

    const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleNoteSubmit();
        }
    }

    const handleInputBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        setIsAddingNotes(false);
    }

  return (
    <div className='Notes'>
        <button className='Notes__addNotes-addBtn' onClick={handleAddNotes}>
            <AddCircleOutlineIcon />
            Add new note
        </button>
        <div className={`Notes__input ${!isAddingNotes&&'hidden'}`}>
            Timestamp: {Math.floor(currentTime/60)} min {Math.floor(currentTime%60)} sec
            <input 
                ref={notesInputRef} 
                className='Notes__addNotes-input' 
                value={inputNote}
                onChange={(e) => setInputNote(e.target.value)}
                onKeyDown={handleInputKeyDown}
                onBlur={handleInputBlur}
            />    
            <button className='Notes__addNotes-submitBtn' onClick={handleNoteSubmit}>Add</button>
            <button className='Notes__addNotes-cancelBtn' onClick={handleNoteCancel}>Cancel</button>
        </div>
        
        {notes.map((note) => (
            <div key={note.id}>
                <NoteCard note={note} setNotes={setNotes}/>
            </div>
        ))}
    </div>
  )
}

export default NotesSection