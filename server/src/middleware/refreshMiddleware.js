// Validar refreshToken antes de permitir renewal
import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const refreshTokenValidator = async (req, res, next) => {
	const { refreshToken } = req.body;

	if (!refreshToken) return res.status(401).json({ message: "Token refresh ausente" });

	try {
		const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
		const user = await User.findById(decoded.id);

		if (!user || user.refreshToken !== refreshToken) {
			return res.status(403).json({ message: "Token refresh inválido" });
		}

		req.user = user;
		next();
	} catch (error) {
		res.status(403).json({ message: "Token inválido ou expirado" });
	}
};
