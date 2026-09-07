// Validação robusta no controller
import Joi from "joi";

const OPTIONS = {
	abortEarly: false, // Retorna todos os erros de validação durante o cadastro do usuário
};

export const validateRegister = (data) => {
	const registerSchema = Joi.object({
		name: Joi.string().trim().min(4).max(64).required(),
		email: Joi.string().trim().email().lowercase().required(),
		password: Joi.string().min(8).max(128).required(),
	}).unknown(false);

	return registerSchema.validate(data, OPTIONS);
};

export const validateLogin = (data) => {
	const loginSchema = Joi.object({
		email: Joi.string().trim().email().lowercase().required(),
		password: Joi.string().min(1).max(128).required(),
	}).unknown(false);

	return loginSchema.validate(data, OPTIONS);
};

export const validateTask = (data) => {
	const taskSchema = Joi.object({
		title: Joi.string().trim().min(1).max(200).required(),
		content: Joi.string().trim().min(1).max(5000).required(),
	}).unknown(false);

	return taskSchema.validate(data, OPTIONS);
};

export const validateTaskUpdate = (data) => {
	const taskUpdateSchema = Joi.object({
		title: Joi.string().trim().min(1).max(200),
		content: Joi.string().trim().min(1).max(5000),
	})
		.unknown(false)
		.min(1); // exige ao menos um campo

	return taskUpdateSchema.validate(data, OPTIONS);
};
