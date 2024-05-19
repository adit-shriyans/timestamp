import { connectToDB } from '@utils/database';
import Note from '@models/note';
import { NextRequest } from 'next/server';

export const GET = async (request: Request | NextRequest, { params }: { params: { id: string } }) => {
    try {
        await connectToDB();
        
        const note = await Note.find({userId: params.id}).populate('user');
        if (!note) return new Response("Note not found", { status: 404 });
        return new Response(JSON.stringify(note[0]), { status: 200 });        
    } catch (error) {
        return new Response("Failed to fetch note", { status: 500 });
    }
}

export const PATCH = async (request: Request | NextRequest, { params }: { params: { id: string } }) => {
    const { note, date } = await request.json();

    try {
        await connectToDB();
        let existingNote = await Note.findById(params.id);

        if (!existingNote) {
            return new Response("Stop not found", { status: 404 });
        }

        existingNote.note = note;
        existingNote.date = date;
        console.log(existingNote, note, date);
        
        await existingNote.save();

        return new Response(JSON.stringify(existingNote), { status: 200 });
    } catch (error) {
        console.error(error);
        return new Response("Failed to update stop", { status: 500 });
    }
};

// DELETE
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