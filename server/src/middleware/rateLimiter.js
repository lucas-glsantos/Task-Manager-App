import ratelimit from "../config/upstash.js";

// Middleware usado para evitar que a API receba um volume abusivo de requisições protegendo contra ataques ou sobrecarga
const rateLimiter = async (req, res, next) => {
	try {
		const ip = req.ip || "global";

		// Limita por Ip ou Usuário (Se já Logado)
		const identifier = req.user?.id ? `user:${req.user.id}` : `ip:${ip}`;

		const { success } = await ratelimit.limit(identifier);

		if (!success) {
			res.set("Retry-After", 60);
			return res.status(429).json({
				message: "Muitos pedidos, tente novamente mais tarde...",
			});
		}

		return next();
	} catch (error) {
		// Fail-open se Redis/Memória falhar, evitar derrubar API
		console.log("Erro no serviço de Rate Limit", error);
		return next();
	}
};

export default rateLimiter;
