import { connectToDB } from '@utils/database';
import Note from '@models/note';
import { NextRequest } from 'next/server';

export const POST = async (req: Request | NextRequest) => {
    const { userId, videoId, note, timeStamp, date  } = await req.json();
    
    try {
        await connectToDB();
        const newNote = new Note({
            userId, videoId, note, timeStamp, date
        })
        await newNote.save();
        return new Response(JSON.stringify(newNote), { status: 201 })
    } catch(error) {
        console.error("Error creating new trip:", error);
        return new Response("Failed to create new prompt", { status: 500 })
    }
}