import mongoose from "mongoose";

// 1- Criar o schema
// 2- Modelo baseado nesse schema

const taskSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
        },
        content: {
            type: String,
            required: true,
        },
    },
    { timestamps: true } // createdAt, updateAt
);

const Task = mongoose.model("Task", taskSchema);

export default Task