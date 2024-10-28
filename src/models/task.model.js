import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
    },
    description: {
        type: String,
        required: true,
        trim: true,
    },
    points: {
        type: Number,
        required: true
    },
}, {
    timestamps: true  // Automatically adds `createdAt` and `updatedAt`
});

const Task = mongoose.model('Task', taskSchema);

export default Task;