// Validação robusta no controller
import Joi from 'joi';

export const validateRegister = (data) => {
  const registerSchema = Joi.object({
    name: Joi.string().trim().min(4).max(64).required(),
    email: Joi.string().trim().email().lowercase().required(),
    password: Joi.string().min(8).max(128).required()
  }).unknown(false);

  return registerSchema.validate(data, {
    abortEarly: false, // Retorna todos os erros de validação durante o cadastro do usuário
  });
};