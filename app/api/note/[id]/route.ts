import { connectToDB } from '@utils/database';
import Note from '@models/note';
import { NextRequest } from 'next/server';

// Takes in userId and returns all the notes user has created for all videos
export const GET = async (request: Request | NextRequest, { params }: { params: { id: string } }) => {
    try {
        await connectToDB();
        
        const notes = await Note.find({userId: params.id}).populate('userId');
        
        if (!notes) return new Response("Note not found", { status: 404 });
        return new Response(JSON.stringify(notes), { status: 200 });        
    } catch (error) {
        return new Response('Failed to fetch notes', { status: 500 });
    }
}


// takes in note Id, new note and current date and returns editted note with new note messsage and new date(latest change date)
export const PATCH = async (request: Request | NextRequest, { params }: { params: { id: string } }) => {
    const { note, date } = await request.json();

    try {
        await connectToDB();
        let existingNote = await Note.findById(params.id);

        if (!existingNote) {
            return new Response("Note not found", { status: 404 });
        }

        existingNote.note = note;
        existingNote.date = date;
        
        await existingNote.save();

        return new Response(JSON.stringify(existingNote), { status: 200 });
    } catch (error) {
        console.error(error);
        return new Response("Failed to update note", { status: 500 });
    }
};

// DELETE note based on note id
export const DELETE = async (request: Request | NextRequest, { params }: { params: { id: string } }) => {
    const {id} = params;
    try {
        await connectToDB();
        await Note.findByIdAndDelete(id);
        return new Response("Note deleted successfully", { status: 200 });
    } catch (error) {
        console.error("Error while deleting note", error);
        return new Response("Failed to delete note", { status: 500 });
    }
};
