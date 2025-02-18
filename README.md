# Telegram File Storage Bot

A Telegram bot that allows admins to upload files and users to download them using file names.

## Features

- Admin-only file upload functionality
- File storage using MongoDB
- User file download using /start command
- Secure file management system

## Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file with your credentials:
   ```
   BOT_TOKEN=your_telegram_bot_token
   MONGODB_URI=your_mongodb_connection_string
   ADMIN_ID=your_telegram_admin_id
   ```
4. Run the bot:
   ```bash
   node index.js
   ```

## Usage

- Admin can upload files by sending them to the bot
- Users can download files using `/start filename` command 