import mongoose from "mongoose";

let cached = globalThis._mongo ||= { conn: null, promise: null };

export const connectDB = async () => {
	if (cached.conn) return cached.conn;

	if (!process.env.MONGODB_URI) throw new Error("erro na conexão. mongodb_uri ausente!");

	if (!cached.promise) {
		cached.promise = mongoose.connect(process.env.MONGODB_URI, { 
			maxPoolSize: 10, 					// Reduz à 10 conexões máximas por instância
			minPoolSize: 0,						// Não mantém conexões ociosas
			maxIdleTimeMS: 30000,		 		// Fecha conexões ociosas após 30s
			serverSelectionTimeoutMS: 30000,	// Falha após 30s se cluster não responder
			bufferCommands: false				// Desativa Command Queue antes da conexão
		 });
		console.log("-".repeat(50));
		console.log(" ".repeat(50));
		console.log("conectando com mongodb_uri...")
	};

	try {
		cached.conn = await cached.promise;
		console.log("conexão com mongodb_uri estabelecida.")
		console.log(" ".repeat(50));
		console.log("-".repeat(50));
		
		return cached.conn;

	} catch (error) {
		cached.promise = null;

		if (process.env.VERCEL) throw error; // Handler Global responde 500
		console.error(`erro na conexão com mongodb_uri... ERROR:"${error}"`);
		console.log(" ".repeat(50));
		console.log("-".repeat(50));

		throw error;
	}
};
