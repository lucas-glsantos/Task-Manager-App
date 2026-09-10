import mongoose from "mongoose";

let cached = globalThis._mongo;
if (!cached) cached = globalThis._mongo = { promise: null };

export const connectDB = async () => {
	if (mongoose.connection.readyState === 1) return mongoose.connection;

	if (!cached.promise) {
		cached.promise = mongoose.connect(process.env.MONGODB_URI).then(mongo => mongo);
	}

	try {
		await cached.promise;
		console.log("MONGODB CONECTADO COM SUCESSO!");
	} catch (error) {
		cached.promise = null;
		if (process.env.VERCEL) throw error; // Handler Global responde 500
		console.error("ERRO NA CONEXAO COM MONGODB", error);
		process.exit(1); // Sair com falha em localhost
	}
};
