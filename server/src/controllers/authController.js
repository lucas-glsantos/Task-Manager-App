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
		const acessToken = signToken(user._id);
		const refreshToken = signToken(user._id); // mesma função que signToken, mas com expiração diferente

		// Atualizar refresh token no banco
		user.refreshToken = refreshToken;
		await user.save();

		res.status(201).json({
			token: acessToken,
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

		const token = signToken(user._id);
		const refreshToken = signToken(user._id);

		user.refreshToken = refreshToken;
		await user.save();

		res.status(201).json({
			token,
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
