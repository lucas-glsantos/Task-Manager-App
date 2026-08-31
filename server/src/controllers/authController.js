import User from "../models/User.js";
import jwt from "jsonwebtoken";

const signToken = (id) =>
	jwt.sign({ id }, process.env.JWT_SECRET, {
		expiresIn: process.env.JWT_EXPIRES_IN || "7d",
	});

export const register = async (req, res) => {
	try {
		const { name, email, password } = req.body;
		const exists = await User.findOne({ email });
		if (exists) return res.status(400).json({ message: "Email já cadastrado" });

		const user = await User.create({ name, email, password });
		const accessToken = signToken(user._id);
		const refreshToken = signToken(user._id); // mesma função que signToken, mas com expiração diferente

		// Atualizar refreshToken no banco
		user.refreshToken = refreshToken;
		// Definir data de expiração
		const ttlDays = 7; // Mesmo que usar process.env.JWT_REFRESH_EXPIRES
		user.expiresAt = new Date(Date.now() + ttlDays * 24 * 60 * 60 * 1000);

		await user.save();

		res.status(201).json({
			token: accessToken,
			refreshToken,
			user: { id: user._id, name: user.name, email: user.email },
		});
	} catch (error) {
		res.status(500).json({ message: "Erro no registro", error: error.message });
	}
};

export const login = async (req, res) => {
	try {
		const { email, password } = req.body;
		const user = await User.findOne({ email }).select("+password");

		if (!user || !(await user.comparePassword(password))) {
			return res.status(401).json({ message: "Credenciais inválidas" });
		}

		const accessToken = signToken(user._id);
		const refreshToken = signToken(user._id);

		// Atualizar refreshToken no banco
		user.refreshToken = refreshToken;
		// Definir data de expiração
		const tllDays = 7;
		user.expiresAt = new Date(Date.now() + tllDays * 24 * 60 * 60 * 1000);

		await user.save();

		res.status(201).json({
			accessToken,
			refreshToken,
			user: { id: user._id, name: user.name, email: user.email },
		});
	} catch (error) {
		res.status(500).json({ message: "Erro no login", error: error.message });
	}
};

export const me = async (req, res) => {
	res.json(req.user);
};
