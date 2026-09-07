import User from "../models/User.js";
import jwt from "jsonwebtoken";
import { validateRegister } from "../utils/validateUser.js";

const ACCESS_EXPIRES = process.env.JWT_ACCESS_EXPIRES || process.env.JWT_EXPIRES_IN || "15m";
const REFRESH_EXPIRES = process.env.JWT_REFRESH_EXPIRES || "7d";

const signAccessToken = (id) =>
	jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: ACCESS_EXPIRES });

const signRefreshToken = (id) =>
	jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: REFRESH_EXPIRES });

const REFRESH_MS = 7 * 24 * 60 * 60 * 1000;

const toPublicUser = (user) => ({
	id: user._id,
	name: user.name,
	email: user.email,
});

export const register = async (req, res, next) => {
	try {
		const { error: validationError, value } = validateRegister(req.body);
		if (validationError) {
			return res.status(400).json({
				message: "Dados inválidos",
				details: validationError.details.map((d) => d.message),
			});
		}

		const { name, email, password } = value;

		// Criação direta: o índice unique do Mongo resolve race condition.
		// Erro 11000 = email duplicado (tratado no catch).
		const user = await User.create({
			name,
			email,
			password,
			refreshToken: undefined,
			expiresAt: undefined,
		});

		const token = signAccessToken(user._id);
		const refreshToken = signRefreshToken(user._id);

		user.refreshToken = refreshToken;
		user.expiresAt = new Date(Date.now() + REFRESH_MS);
		await user.save();

		return res.status(201).json({
			token,
			refreshToken,
			user: toPublicUser(user),
		});
	} catch (error) {
		if (error.code === 11000) {
			return res.status(400).json({ message: "Email já cadastrado" });
		}
		if (error.name === "ValidationError") {
			return res.status(400).json({ message: "Dados inválidos", error: error.message });
		}
		return next(error);
	}
};

export const login = async (req, res, next) => {
	try {
		const { email, password } = req.body;
		if (!email || !password) {
			return res.status(400).json({ message: "Email e senha são obrigatórios" });
		}

		const user = await User.findOne({ email }).select("+password +refreshToken");
		if (!user || !(await user.comparePassword(password))) {
			return res.status(401).json({ message: "Credenciais inválidas" });
		}

		const token = signAccessToken(user._id);
		const refreshToken = signRefreshToken(user._id);

		user.refreshToken = refreshToken;
		user.expiresAt = new Date(Date.now() + REFRESH_MS);
		await user.save();

		return res.status(200).json({
			token,
			refreshToken,
			user: toPublicUser(user),
		});
	} catch (error) {
		return next(error);
	}
};

export const logout = async (req, res, next) => {
	try {
		// $unset: atribuir `undefined` em update é ignorado pelo Mongoose
		// e o refresh continuaria válido após logout (falha de segurança).
		await User.findByIdAndUpdate(req.user._id, {
			$unset: { refreshToken: 1, expiresAt: 1 },
		});
		return res.status(200).json({ message: "Logout bem-sucedido" });
	} catch (error) {
		return next(error);
	}
};

export const me = async (req, res) => {
	res.json(toPublicUser(req.user));
};
