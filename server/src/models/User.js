import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
	{
		name: { 
      type: String, 
      required: true, 
      trim: true,
      minlength: [4, 'No mínimo 4 caracteres'],
      maxlength: [64, 'Nome muito longo']
    },
		email: { 
      type: String, 
      required: true, 
      unique: true, 
      lowercase: true, 
      trim: true,
      match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})$/, 'E-mail inválido']
    },
		password: {
      type: String,
      required: true,
      minlength: [8, 'Senha muito curta'],
      maxlength: [128, 'Senha muito longa'],
      select: false,
    },
		refreshToken: { type: String, select: false },
    // Expiração do refresh token (sem TTL: TTL apagaria o USER inteiro).
    // A expiração é validada em código (JWT exp + comparação de datas).
    expiresAt: { type: Date },
	},
	{ timestamps: true },
);

userSchema.index({ refreshToken: 1 }, { unique: true, sparse: true });

// Mongoose 7+: hook async NÃO recebe `next`.
// O padrão antigo `async function (next) { ... next() }` lança
// "next is not a function" no User.create() -> era a causa raiz do 500 no /register.
userSchema.pre('save', async function () {
	if (!this.isModified('password')) return;
	this.password = await bcrypt.hash(this.password, 12);
});

userSchema.methods.comparePassword = function (candidate) {
	return bcrypt.compare(candidate, this.password);
};

export default mongoose.model("User", userSchema);
