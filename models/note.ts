import mongoose, { Schema, model, models } from "mongoose";

const NoteSchema = new Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    videoId: {
        type: String,
        required: [true, 'Video id is required'],
    },
    note: {
        type: String,
        required: [true, 'Note is required'],
    },
    timeStamp: {
        type: Number,
        required: [true, 'Time stamp is required'],
    },
    date: {
        type: Date,
        required: [true, 'Date is required'],
    }
})

const Note = models.Note || model("Note", NoteSchema);

export default Note;