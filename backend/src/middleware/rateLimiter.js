import ratelimit from "../config/upstash.js";

const rateLimiter = async (req, res, next) => {

    try {
        const { success } = await ratelimit.limit("my-rate-limit");

        if (!success) {
            return res.status(429).json({
                message: "Muitos pedidos, tente novamente mais tarde...",
            });
        }

        next();

    } catch (error) {
        console.log("Erro Rate limit", error);
        next(error);
    }
};

export default rateLimiter;