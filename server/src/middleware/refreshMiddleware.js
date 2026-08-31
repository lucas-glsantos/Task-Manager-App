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

// Verificar se refreshToken está proximo de expirar
export const checkTokenExpiration  = async (req, res, next) => {
	const { refreshToken } = req.body;
	const user = await User.findOne({ refreshToken });

	if (!user) return res.status(401).json({ message: 'Token inválido' });

	const timeUntilExpiry = user.expiresAt - Date.now();
	const daysUntilExpiry = timeUntilExpiry / (1000 * 60 * 60 * 24);

	if (daysUntilExpiry < 1) {
		// Token expirando em menos de 1 dia, pode forçar renovação
		return res.status(401).json({
			message: 'Token expirará em breve',
			shouldRenew: true
		});
	}

	next();
};
