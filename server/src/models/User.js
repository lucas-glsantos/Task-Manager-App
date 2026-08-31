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
      maxlength: [128, 'Senha muito longa']
    },
		refreshToken: { type: String },
    expiresAt: { type: Date, expires: '7d' },
	},
	{ timestamps: true },
);

userSchema.index({ refreshToken: 1 }, { unique: true, sparse: true });

userSchema.pre('save', async function (next) {
	if (!this.isModified('password')) return next();
	this.password = await bcrypt.hash(this.password, 12);
	next();
});

userSchema.methods.comparePassword = function (candidate) {
	return bcrypt.compare(candidate, this.password);
};

export default mongoose.model("User", userSchema);
