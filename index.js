// Import required packages
const TelegramBot = require('node-telegram-bot-api');
const mongoose = require('mongoose');
const express = require('express');
require('dotenv').config();

// Debug environment variables
console.log('Environment variables loaded:', {
  botToken: !!process.env.BOT_TOKEN,
  mongoUri: !!process.env.MONGODB_URI,
  adminId: !!process.env.ADMIN_ID
});
console.log('Raw MONGODB_URI:', process.env.MONGODB_URI);

// Create Express app
const app = express();
const port = process.env.PORT || 3872;

// Use environment variables
const token = '7890912358:AAEgnFPly9JMmK6zf45O9zDPYFvz2pTlnu8';
// Configure bot settings based on environment
const bot = new TelegramBot(token, { 
  webHook: {
    port: port
  }
});

// Set webhook URL for production
if (process.env.NODE_ENV === 'production') {
  const url = process.env.APP_URL || 'https://your-app-name.onrender.com';
  bot.setWebHook(`${url}/bot${token}`);
}

// Debug logs
console.log('Attempting to connect to MongoDB...');
console.log('MongoDB URI exists:', !!process.env.MONGODB_URI);

// Connect to MongoDB with error handling
mongoose.connect("mongodb+srv://lmkleela1:Yl%40cm180@cluster11.2vlki.mongodb.net/myDatabase?retryWrites=true&w=majority", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('Successfully connected to MongoDB.');
})
.catch((error) => {
  console.error('MongoDB connection error:', error);
});

// Define file schema
const fileSchema = new mongoose.Schema({
  name: String,
  file_id: String,
});

const File = mongoose.model('File', fileSchema);

// Use environment variable for admin ID
const adminId = 5616180144;

// Upload file command (only for admin)
bot.on('message', async (msg) => {
  const chatId = msg.chat.id;

  if (chatId.toString() === adminId && msg.document) {
    const fileName = msg.caption || msg.document.file_name;
    const fileId = msg.document.file_id;

    // Save file details to MongoDB
    const newFile = new File({ name: fileName, file_id: fileId });
    await newFile.save();

    bot.sendMessage(chatId, `File "${fileName}" uploaded and saved.`);
  } else if (msg.document) {
    bot.sendMessage(chatId, 'You are not authorized to upload files.');
  }
});

// Start command - Auto download for users
bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;
  const query = msg.text.split(' ')[1]; // Expecting /start <file_name>

  if (query) {
    const file = await File.findOne({ name: query });
    if (file) {
      bot.sendDocument(chatId, file.file_id);
    } else {
      bot.sendMessage(chatId, `File "${query}" not found.`);
    }
  } else {
    bot.sendMessage(chatId, 'Welcome! Provide a file name to download automatically.');
  }
});

// Add basic route for health check
app.get('/', (req, res) => {
  res.send('Bot is running!');
});

// Start Express server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
