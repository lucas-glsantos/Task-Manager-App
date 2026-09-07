import jwt from "jsonwebtoken";
import User from "../models/User.js";

// Valida o refresh token UMA vez e anexa o user em req.user.
// O controller reutiliza req.user (sem segundo verify + find).
export const refreshTokenValidator = async (req, res, next) => {
	try {
		const { refreshToken } = req.body;
		if (!refreshToken) {
			return res.status(401).json({ message: "Token refresh ausente" });
		}

		const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
		const user = await User.findById(decoded.id).select("+refreshToken");

		if (!user || user.refreshToken !== refreshToken) {
			return res.status(403).json({ message: "Token refresh inválido" });
		}

		if (user.expiresAt && user.expiresAt.getTime() < Date.now()) {
			return res.status(403).json({ message: "Token refresh expirado" });
		}

		req.user = user;
		return next();
	} catch (error) {
		return res.status(403).json({ message: "Token inválido ou expirado" });
	}
};
