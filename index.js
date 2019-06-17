const TelegramBot = require('node-telegram-bot-api');
const request = require('request');
const config = require('./config.json');



const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});
const db = admin.firestore();




const token = config.token;

const bot = new TelegramBot(token, {polling: true});


bot.onText(/\/start/,(msg, match) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, 'Выберите валюту, которая вас интересует:', {
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: '€ - EUR',
            callback_data: 'EUR'
          },
          {
            text: '$ - USD',
            callback_data: 'USD'
          },
          {
            text: '₽ - RUR',
            callback_data: 'RUR'
          },
          {
            text: '₿ - BTC',
            callback_data: 'BTC'
          }
        ]
      ]
    }
  });
});

bot.on('callback_query', query => {
  const id = query.message.chat.id;
  request('https://api.privatbank.ua/p24api/pubinfo?json&exchange&coursid=5', function(error, response, body){
    const data = JSON.parse(body);
    const result = data.filter(item => item.ccy === query.data)[0];
    let md = `
    *${result.ccy} => ${result.base_ccy}*
    Купля: _${result.buy}_
    Продажа: _${result.sale}_ `;
    bot.sendMessage(id, md, {parse_mode: 'Markdown'});
  });
});
