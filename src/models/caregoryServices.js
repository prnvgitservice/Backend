import mongoose from 'mongoose';
const { Schema, model } = mongoose;

const categoryServiceSchema = new Schema({
    categoryId: {
        type: mongoose.Schema.Types.ObjectId,
        maxlength: 1000,
        trim: true,
    },
    serviceName: {
        type: String,
        required: true,
        trim: true,
    },
    serviceImg: {
        type: String,
        required: true,
    },
    servicePrice: {
        type: Number,
        required: true,
    }
}, {
    timestamps: true,
});

export default model('CategoryService', categoryServiceSchema);