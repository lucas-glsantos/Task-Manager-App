import jwt from "jsonwebtoken";

const ACCESS_EXPIRES = process.env.JWT_ACCESS_EXPIRES || process.env.JWT_EXPIRES_IN || "15m";
const REFRESH_EXPIRES = process.env.JWT_REFRESH_EXPIRES || "7d";
const REFRESH_MS = 7 * 24 * 60 * 60 * 1000;

// Reutiliza req.user populado pelo refreshTokenValidator.
// Elimina a redundância anterior: validar JWT + buscar user 2x
// (uma no middleware, outra aqui).
export const refreshToken = async (req, res, next) => {
	try {
		const user = req.user;
		if (!user) {
			return res.status(403).json({ message: "Token refresh inválido" });
		}

		const accessToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
			expiresIn: ACCESS_EXPIRES,
		});
		const newRefreshToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
			expiresIn: REFRESH_EXPIRES,
		});

		// Rotação do refresh token
		user.refreshToken = newRefreshToken;
		user.expiresAt = new Date(Date.now() + REFRESH_MS);
		await user.save();

		return res.json({ token: accessToken, refreshToken: newRefreshToken });
	} catch (error) {
		return next(error);
	}
};
