import mongoose from 'mongoose';


const connectDB = async () => {
  console.log(process.env.MONGO_URI);
  
  try {
    console.log(process.env.MONGO_URI)
    await mongoose.connect(`mongodb+srv://PrnvServices:lohitha@cluster0.s3f2vim.mongodb.net/PRNVServices?retryWrites=true&w=majority&appName=Cluster0`);
    console.log('✅ MongoDB connected');
  } catch (err) {
    console.error('❌ MongoDB connection failed', err.message);
    process.exit(1);
  }
};

export default connectDB;