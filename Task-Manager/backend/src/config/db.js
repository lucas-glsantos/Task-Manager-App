import mongoose from "mongoose";

export const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("MONGODB CONECTADO COM SUCESSO!");
    }   catch (error) {
        console.error("ERRO NA CONEXAO COM MONGODB", error);
        process.exit(1); // Sair com falha
    }
};