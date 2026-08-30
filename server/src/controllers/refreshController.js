import User from "../models/User.js";
import jwt from "jsonwebtoken";

export const refreshToken = async (req, res) => {
	const { refreshToken } = req.body;

	if (!refreshToken) return res.status(401).json({ message: "Token refresh ausente" });

	try {
		const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
		const user = await User.findById(decoded.id);

		if (!user || user.refreshToken !== refreshToken) {
			return res.status(403).json({ message: "Token refresh inválido" });
		}

		// Gerar novos tokens
		const accessToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
			expiresIn: process.env.JWT_ACCESS_EXPIRES || "15m",
		});

		const newRefreshToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
			expiresIn: process.env.JWT_REFRESH_EXPIRES || "7d",
		});

		// Atualizar refresh token no banco (rotação)
		user.refreshToken = newRefreshToken;
		await user.save();

		res.json({ token: accessToken, refreshToken: newRefreshToken });
	} catch (err) {
		res.status(403).json({ message: "Token inválido ou expirado" });
	}
};
