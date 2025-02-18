// Import required packages
const TelegramBot = require('node-telegram-bot-api');
const mongoose = require('mongoose');
require('dotenv').config();

// Use environment variables
const token = process.env.BOT_TOKEN;
const bot = new TelegramBot(token, { polling: true });

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Define file schema
const fileSchema = new mongoose.Schema({
  name: String,
  file_id: String,
});

const File = mongoose.model('File', fileSchema);

// Use environment variable for admin ID
const adminId = process.env.ADMIN_ID;

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

console.log('Bot is running...');
