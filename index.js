// Import required packages
const TelegramBot = require('node-telegram-bot-api');
const mongoose = require('mongoose');
const express = require('express');
require('dotenv').config();

// Create Express app
const app = express();
const port = process.env.PORT || 3000;

// Use environment variables
const token = process.env.BOT_TOKEN;
const mongoUri = process.env.MONGODB_URI;
const adminId = process.env.ADMIN_ID;

// Configure bot settings
const bot = new TelegramBot(token);


// Set webhook URL for production
const webhookUrl = process.env.APP_URL.replace(/\/$/, ''); // Remove trailing slash if present
bot.setWebHook(`${url}/webhook/${token}`);

console.log(`Webhook set to: ${webhookUrl}`);


// Connect to MongoDB with error handling
mongoose.connect(mongoUri, {
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

// Upload file command (only for admin)
bot.on('message', async (msg) => {
  const chatId = msg.chat.id;

  try {
    if (chatId.toString() === adminId && msg.document) {
      const fileName = msg.caption || msg.document.file_name;
      const fileId = msg.document.file_id;

      // Log the received file details
      console.log('Received file:', {
        fileName,
        fileId,
        fromUser: chatId
      });

      // Save file details to MongoDB
      const newFile = new File({ name: fileName, file_id: fileId });
      await newFile.save();

      // Send confirmation message
      await bot.sendMessage(chatId, `File "${fileName}" uploaded and saved.`);
    } else if (msg.document) {
      await bot.sendMessage(chatId, 'You are not authorized to upload files.');
    }
  } catch (error) {
    console.error('Error handling message:', error);
    await bot.sendMessage(chatId, 'Sorry, there was an error processing your request.');
  }
});

// Start command with error handling
bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;
  
  try {
    const query = msg.text.split(' ')[1]; // Expecting /start <file_name>

    if (query) {
      const file = await File.findOne({ name: query });
      if (file) {
        await bot.sendDocument(chatId, file.file_id);
      } else {
        await bot.sendMessage(chatId, `File "${query}" not found.`);
      }
    } else {
      await bot.sendMessage(chatId, 'Welcome! Provide a file name to download automatically.');
    }
  } catch (error) {
    console.error('Error handling /start command:', error);
    await bot.sendMessage(chatId, 'Sorry, there was an error processing your request.');
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
