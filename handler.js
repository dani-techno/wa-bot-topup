/**
 * Made by: Dani Technology (Full Stack Engineer)
 * Created on: January 10, 2024
 * Contact developer:
 * - WhatsApp: +62 838-3499-4479 or +62 823-2066-7363
 * - Email: dani.technology.id@gmail.com
 * - GitHub: https://github.com/dani-techno
 */

const chalk = require('chalk');
const fs = require('fs');
const util = require('util');
const axios = require('axios');
const path = require('path');
const request = require('request');
const mimeType = require('mime-types');
const os = require('os');
const speed = require('performance-now');
const {
    performance
} = require('perf_hooks');
const {
    exec,
    spawn,
    execSync
} = require('child_process');

const {
    imageUploader,
    generateRandomText,
    toRupiah
} = require('./lib/functions.js');

const config = require('./config.js');
const prefix = config.prefix || '';

const date = new Date();
const currentTime = `${date.getHours()}:${date.getMinutes() < 10 ? '0' : ''}${date.getMinutes()}:${date.getSeconds() < 10 ? '0' : ''}${date.getSeconds()} WIB, ${date.getDate() < 10 ? '0' : ''}${date.getDate()}-${date.getMonth() + 1 < 10 ? '0' : ''}${date.getMonth() + 1}-${date.getFullYear()}`;

module.exports = async (socket, messages, memoryStore) => {
    const client = sock = socket;
    const msg = messages;
    const mstore = memoryStore;

    const jid = msg.chat ? msg.chat : msg.key.remoteJid;
    const botNumber = socket.user.id.split(':')[0];
    const ownerNumber = config.owner_number;
    const senderNumber = msg.sender.replace(/\D/g, '');
    let senderName = msg.pushName || 'Unknown';

    if (senderNumber === botNumber) {
        senderName = 'Me';
    }

    const body = msg.mtype === 'conversation' ? msg.message.conversation : msg.mtype === 'extendedTextMessage' ? msg.message.extendedTextMessage.text : msg.mtype === 'imageMessage' ? msg.message.imageMessage.caption : msg.mtype === 'videoMessage' ? msg.message.videoMessage.caption : '';
    const budy = typeof msg.text === 'string' ? msg.text : '';
    const commands = body.startsWith(config.prefix) ? body.replace(config.prefix, '').trim().split(/ +/).shift().toLowerCase() : ''; // to use without prefix: body.trim().split(/ +/).shift().toLowerCase()
    const command = config.prefix ? commands.replace(config.prefix, '') : body.trim().split(/ +/).shift().toLowerCase();
    const query = body.trim().split(/ +/).slice(1).join(' ');
    const params = query.split('|').map(param => param.trim());
    const isQuoted = msg.quoted ? msg.quoted : msg;
    const isQuotedMsg = (isQuoted.msg || isQuoted);
    const isQuotedMimeType = (isQuoted.msg || isQuoted).mimetype || '';
    const isQuotedText = msg.type === 'extendexTextMessage' && JSON.stringify(msg).includes('textMessage');
    const isQuotedImage = msg.type === 'extendedTextMessage' && JSON.stringify(msg).includes('imageMessage');
    const isQuotedLocation = msg.type === 'extendedTextMessage' && JSON.stringify(msg).includes('locationMessage');
    const isQuotedVideo = msg.type === 'extendedTextMessage' && JSON.stringify(msg).includes('videoMessage');
    const isQuotedSticker = msg.type === 'extendedTextMessage' && JSON.stringify(msg).includes('stickerMessage');
    const isQuotedAudio = msg.type === 'extendedTextMessage' && JSON.stringify(msg).includes('audioMessage');
    const isQuotedContact = msg.type === 'extendedTextMessage' && JSON.stringify(msg).includes('contactMessage');
    const isQuotedDocument = msg.type === 'extendedTextMessage' && JSON.stringify(msg).includes('documentMessage');
    const isMedia = /image|video|sticker|audio/.test(isQuotedMimeType);
    const isImage = (msg.type == 'imageMessage');
    const isVideo = (msg.type == 'videoMessage');
    const isAudio = (msg.type == 'audioMessage');
    const isText = (msg.type == 'textMessage');
    const isSticker = (msg.type == 'stickerMessage');

    const isMe = botNumber === senderNumber;
    const isOwner = ownerNumber === senderNumber;

    /*console.log('ownerNumber', ownerNumber);
    console.log('botNumber', botNumber);
    console.log('senderNumber', senderNumber);
    console.log('isMe', isMe);
    console.log('isOwner', isOwner);*/

    const isGroup = msg.isGroup;

    let groupMetadata;
    let groupName;
    let groupId;
    let groupAdmin;

    if (isGroup) {
        groupMetadata = await client.groupMetadata(jid);
        groupName = groupMetadata.subject;
        groupId = groupMetadata.id;
        groupAdmin = groupMetadata.participants.find(participant => participant.id === msg.sender && participant.admin !== null);
    }

    if (config.chat_mode === 'private') {
        if (msg) {
            if (isGroup) {
                if (body.startsWith(config.prefix)) {
                    msg.reply('Bot hanya dapat digunakan di private chat');
                    return;
                }
            }
        }
    } else if (config.chat_mode === 'group') {
        if (msg) {
            if (!isGroup) {
                if (body.startsWith(config.prefix)) {
                    msg.reply('Bot hanya dapat digunakan di group chat');
                    return;
                }
            }
        }
    } else if (config.chat_mode === 'self') {
        if (!msg.key.fromMe && !isOwner) {
            return;
        }
    }

    if (config.bot_offline_status) {
        client.sendPresenceUpdate('unavailable', jid);
    }

    if (config.automatic_update_profile_status[0]) {
        client.updateProfileStatus(config.automatic_update_profile_status[1]);
    }

    if (msg.message) {
        if (body.startsWith(config.prefix)) {
            if (config.automatic_read_messages) {
                client.readMessages([msg.key]);
            }

            if (config.automatic_typing_or_recording[0]) {
                if (config.automatic_typing_or_recording[1] === 'typing') {
                    client.sendPresenceUpdate('composing', jid);
                } else if (config.automatic_typing_or_recording[1] === 'recording') {
                    client.sendPresenceUpdate('recording', jid);
                }
            }
        }

        if (config.only_show_command_chat) {
            if (msg.message && body.startsWith(config.prefix)) {
                console.log('\n• ' + chalk.bold(chalk.greenBright('New Message:')) + '\n- ' + chalk.cyanBright('From:'), chalk.whiteBright(senderName), chalk.yellowBright('- ' + senderNumber) + '\n- ' + chalk.cyanBright('In:'), chalk.whiteBright(!isGroup ? 'Private Chat' : 'Group Chat - ' + chalk.yellowBright(groupName)) + '\n- ' + chalk.cyanBright('Time: ') + chalk.whiteBright(currentTime) + '\n- ' + chalk.cyanBright('Message: ') + chalk.whiteBright(body || msg.mtype));
            }
        } else {
            console.log('\n• ' + chalk.bold(chalk.greenBright('New Message:')) + '\n- ' + chalk.cyanBright('From:'), chalk.whiteBright(senderName), chalk.yellowBright('- ' + senderNumber) + '\n- ' + chalk.cyanBright('In:'), chalk.whiteBright(!isGroup ? 'Private Chat' : 'Group Chat - ' + chalk.yellowBright(groupName)) + '\n- ' + chalk.cyanBright('Time: ') + chalk.whiteBright(currentTime) + '\n- ' + chalk.cyanBright('Message: ') + chalk.whiteBright(body || msg.mtype));
        }
    }

    /*if (!body.startsWith(config.prefix) || body === config.prefix) {
        return;
    }*/

    const tmpFilePath = path.join(__dirname, 'tmp', 'orders.json');

    setInterval(() => {
        if (fs.existsSync(tmpFilePath)) {
            const orderData = JSON.parse(fs.readFileSync(tmpFilePath, 'utf8'));

            Object.keys(orderData).forEach(key => {
                const createdAt = new Date(orderData[key].createdAt).getTime();
                const currentTime = Date.now();

                if (currentTime - createdAt > 300000) {
                    const payId = orderData[key].payId;
                    
                    delete orderData[key];
                    fs.writeFileSync(tmpFilePath, JSON.stringify(orderData, null, 2));
                            
                    axios.post(`${config.api.base_url}/api/h2h/deposit/cancel`, {
                            id: payId,
                            api_key: config.api.secret_key,
                        })
                        .then(() => {
                            console.log(`Pembayaran dengan ID ${payId} dibatalkan karena sudah lebih dari 5 menit.`);
                        })
                        .catch(err => {
                            console.error(`Gagal membatalkan pembayaran dengan ID ${payId}:`, err);
                        });
                }
            });

            fs.writeFileSync(tmpFilePath, JSON.stringify(orderData, null, 2));
        }
    }, 5000);

    try {
        switch (command) {
            case 'test': {
                msg.reply('Ok, Success!');
                break;
            }

            case 'totalfitur': {
                const totalFitur = (fs.readFileSync('./handler.js').toString().match(new RegExp('break', 'g')) || []).length - 1;

                msg.reply(`Jumlah fitur saat ini: ${totalFitur}`);
                break;
            }

            case 'whoami': {
                if (!(isOwner || isMe)) return msg.reply('Anda adalah pengguna bot.');

                if (isOwner) {
                    msg.reply('Anda adalah owner bot.');
                } else if (isMe) {
                    msg.reply('Anda adalah bot.');
                } else {
                    msg.reply('Anda adalah bot sekaligus owner bot nya.');
                }

                break;
            }

            /* Features area */

            case 'owner_menu':
            case 'menu_owner': {
                if (!(isOwner || isMe)) return msg.reply('❌ Kamu tidak memiliki izin untuk menggunakan fitur ini.');

                const menu = `*\`Hai ${senderName}\`*

- ${prefix}buy <code,target>
- ${prefix}deposit <nominal>
- ${prefix}check_balance
- ${prefix}wd_balance <nominal>
`;

                msg.reply(menu);
                break;
            }

            case 'menu':
            case 'list': {
                const menu = `*\`Hai ${senderName}\`*

\`Game Populer\`
- ${prefix}mlbb
- ${prefix}ml_wdp
- ${prefix}ml_sl
- ${prefix}ml_tl
- ${prefix}hok
- ${prefix}aov
- ${prefix}lol
- ${prefix}coc
- ${prefix}ff
- ${prefix}pubg

\`Data Internet\`
- ${prefix}byu_data
- ${prefix}tsel_data
- ${prefix}xl_data
- ${prefix}axis_data
- ${prefix}isat_data
- ${prefix}tri_data

\`Pulsa Reguler & Transfer\`
- ${prefix}byu_pulsa
- ${prefix}tsel_pulsa
- ${prefix}xl_pulsa
- ${prefix}axis_pulsa
- ${prefix}isat_pulsa
- ${prefix}tri_pulsa

\`Voucher\`
- ${prefix}pln

Ketik *${prefix}search <name>* atau *${prefix}search_by_code <code>* untuk mencari kode produk.

\`Bot ini telah terintegrasi dengan API yang disediakan oleh ${config.api.base_url}\`
`;

                msg.reply(menu);
                break;
            }

            case 'sr':
            case 'search': {
                if (!query) return msg.reply(`Example: ${prefix}${command} MLW`);

                try {
                    const filterName = query;

                    const response = await axios.post(config.api.base_url + '/api/h2h/price-list/all', {
                        filter_name: filterName,
                        api_key: config.api.secret_key
                    }, {
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    });

                    const result = response.data;

                    if (!result.data) return msg.reply(result.message);

                    let listText = '';
                    result.data.forEach(item => {
                        const profit = (config.api.profit / 100) * item.price;
                        const finalPrice = Number(item.price) + Number(Math.ceil(profit));
                        listText += `╭⟬ *${item.status} ${item.name}*\n` +
                            `┆•  Harga: Rp ${toRupiah(finalPrice)}\n` +
                            `┆•  Kode:  ${item.code}\n` +
                            `╰──────────◇\n\n`;
                    });

                    msg.reply(listText);
                } catch (error) {
                    console.error('Error fetching data:', error);
                    msg.reply('Produk yg anda cari tidak ditemukan.');
                }

                break;
            }

            case 'srbc':
            case 'search_by_code': {
                if (!query) return msg.reply(`Example: ${prefix}${command} MLW`);

                try {
                    const filterCode = query.toUpperCase();

                    const response = await axios.post(config.api.base_url + '/api/h2h/price-list/all', {
                        filter_code: filterCode,
                        api_key: config.api.secret_key
                    }, {
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    });

                    const result = response.data;

                    if (!result.data) return msg.reply(result.message);

                    let listText = '';
                    result.data.forEach(item => {
                        const profit = (config.api.profit / 100) * item.price;
                        const finalPrice = Number(item.price) + Number(Math.ceil(profit));
                        listText += `╭⟬ *${item.status} ${item.name}*\n` +
                            `┆•  Harga: Rp ${toRupiah(finalPrice)}\n` +
                            `┆•  Kode:  ${item.code}\n` +
                            `╰──────────◇\n\n`;
                    });

                    msg.reply(listText);
                } catch (error) {
                    console.error('Error fetching data:', error);
                    msg.reply('Produk yg anda cari tidak ditemukan.');
                }

                break;
            }

            case 'mlbb':
            case 'ml':
            case 'ml_wdp':
            case 'ml_sl':
            case 'ml_tl':
            case 'wdp':
            case 'starlight':
            case 'twilight':
            case 'hok':
            case 'aov':
            case 'lol':
            case 'coc':
            case 'ff':
            case 'pubg':

            case 'byu_data':
            case 'tsel_data':
            case 'xl_data':
            case 'axis_data':
            case 'isat_data':
            case 'tri_data':

            case 'byu_pulsa':
            case 'tsel_pulsa':
            case 'xl_pulsa':
            case 'axis_pulsa':
            case 'isat_pulsa':
            case 'tri_pulsa':

            case 'pln': {
                const products = {
                    'ml': {
                        name: 'mobile-legends',
                        category: 'games',
                        filter_code: null
                    },
                    'mlbb': {
                        name: 'mobile-legends',
                        category: 'games',
                        filter_code: null
                    },
                    'ml_wdp': {
                        name: 'mobile-legends',
                        category: 'games',
                        filter_code: 'MLW'
                    },
                    'ml_sl': {
                        name: 'mobile-legends',
                        category: 'games',
                        filter_code: 'MLS'
                    },
                    'ml_tl': {
                        name: 'mobile-legends',
                        category: 'games',
                        filter_code: 'MLT'
                    },
                    'wdp': {
                        name: 'mobile-legends',
                        category: 'games',
                        filter_code: 'MLW'
                    },
                    'starlight': {
                        name: 'mobile-legends',
                        category: 'games',
                        filter_code: 'MLS'
                    },
                    'twilight': {
                        name: 'mobile-legends',
                        category: 'games',
                        filter_code: 'MLT'
                    },
                    'hok': {
                        name: 'honor-of-kings',
                        category: 'games',
                        filter_code: null
                    },
                    'aov': {
                        name: 'arena-of-valor',
                        category: 'games',
                        filter_code: null
                    },
                    'lol': {
                        name: 'league-of-legends',
                        category: 'games',
                        filter_code: null
                    },
                    'coc': {
                        name: 'clash-of-clans',
                        category: 'games',
                        filter_code: null
                    },
                    'ff': {
                        name: 'free-fire',
                        category: 'games',
                        filter_code: null
                    },
                    'pubg': {
                        name: 'pubg',
                        category: 'games',
                        filter_code: null
                    },

                    'byu_data': {
                        name: 'byu',
                        category: 'data-internet',
                        filter_code: null
                    },
                    'telkomsel_data': {
                        name: 'telkomsel',
                        category: 'data-internet',
                        filter_code: null
                    },
                    'tsel_data': {
                        name: 'telkomsel',
                        category: 'data-internet',
                        filter_code: null
                    },
                    'xl_data': {
                        name: 'xl',
                        category: 'data-internet',
                        filter_code: null
                    },
                    'axis_data': {
                        name: 'axis',
                        category: 'data-internet',
                        filter_code: null
                    },
                    'indosat_data': {
                        name: 'indosat',
                        category: 'data-internet',
                        filter_code: null
                    },
                    'isat_data': {
                        name: 'indosat',
                        category: 'data-internet',
                        filter_code: null
                    },
                    'tri_data': {
                        name: 'tri',
                        category: 'data-internet',
                        filter_code: null
                    },

                    'byu_pulsa': {
                        name: 'byu',
                        category: 'pulsa',
                        filter_code: null
                    },
                    'telkomsel_pulsa': {
                        name: 'telkomsel',
                        category: 'pulsa',
                        filter_code: null
                    },
                    'tsel_pulsa': {
                        name: 'telkomsel',
                        category: 'pulsa',
                        filter_code: null
                    },
                    'xl_pulsa': {
                        name: 'xl',
                        category: 'pulsa',
                        filter_code: null
                    },
                    'axis_pulsa': {
                        name: 'axis',
                        category: 'pulsa',
                        filter_code: null
                    },
                    'indosat_pulsa': {
                        name: 'indosat',
                        category: 'pulsa',
                        filter_code: null
                    },
                    'isat_pulsa': {
                        name: 'indosat',
                        category: 'pulsa',
                        filter_code: null
                    },
                    'tri_pulsa': {
                        name: 'tri',
                        category: 'pulsa',
                        filter_code: null
                    },

                    'pln': {
                        name: 'pln',
                        category: 'voucher',
                        filter_code: null
                    }

                };

                const productKey = products[command];
                if (!productKey) {
                    return msg.reply('Perintah tidak valid.');
                }

                try {
                    const response = await axios.post(
                        `${config.api.base_url}/api/h2h/price-list/${productKey.category}/${productKey.name}`, {
                            filter_code: productKey.filter_code || undefined,
                            api_key: config.api.secret_key,
                        }, {
                            headers: {
                                'Content-Type': 'application/json',
                            },
                        }
                    );

                    const result = response.data;

                    if (!result.data) {
                        return msg.reply(result.message);
                    }

                    let listText = `*✅ : Tersedia*
*⛔ : Tidak Tersedia*

_Ingin melakukan topup? ketik *${prefix}order KODE,TUJUAN*_

\`Bot ini telah terintegrasi dengan API yang disediakan oleh ${config.api.base_url}\`\n\n`;
                    result.data.forEach((item) => {
                        const profit = (config.api.profit / 100) * item.price;
                        const finalPrice = Number(item.price) + Number(Math.ceil(profit));
                        listText += `╭⟬ *${item.status} ${item.name}*\n` +
                            `┆•  Harga: Rp ${toRupiah(finalPrice)}\n` +
                            `┆•  Kode:  ${item.code}\n` +
                            `╰──────────◇\n\n`;
                    });

                    msg.reply(listText);
                } catch (error) {
                    console.error('Error fetching data:', error);
                    msg.reply('Terjadi kesalahan, silahkan coba lagi nanti.');
                }

                break;
            }

            // Orders
            case 'order':
            case 'topup': {
                const params = query.split(',').map(param => param.trim());
                const [code, ...targets] = params;
                const target = targets.join('|');

                if (!code || !target) {
                    return msg.reply(`Semua parameter (code, target) diperlukan.\n\n*PETUNJUK PENGGUNAAN*

\`Produk game\`
- Format order: ${prefix}${command} KODE,ID
- Contoh: ${prefix}${command} HOK250,1223334782

\`Khusus produk game yang memakai Zone ID/Server\`
- Format order: ${prefix}${command} KODE,ID|SERVER
- Contoh: ${prefix}${command} MLW1,628299715|10135

\`Produk lainnya\`
- Format order: ${prefix}${command} KODE,TUJUAN
- Contoh: ${prefix}${command} S100,082320667363`);
                }

                const reffId = generateRandomText(10);
                const senderNumber = msg.sender.split('@')[0];
                const tmpFilePath = path.join(__dirname, 'tmp', 'orders.json');

                let orderData = {};
                if (fs.existsSync(tmpFilePath)) {
                    orderData = JSON.parse(fs.readFileSync(tmpFilePath, 'utf8'));
                }

                if (orderData[senderNumber]) {
                    return msg.reply(
                        `Kamu masih memiliki transaksi yang belum selesai. Tunggu hingga pembayaran selesai, kadaluarsa, atau gagal untuk membuat transaksi baru.\n\n_Ingin membatalkan topup? ketik *${prefix}cancel PAYID*_`
                    );
                }

                const date = new Date();
                const currentDate = new Date(date.toLocaleString('en-US', {
                    timeZone: config.time_zone
                }));

                axios.post(`${config.api.base_url}/api/h2h/price-list/all`, {
                        api_key: config.api.secret_key,
                    })
                    .then(response => {
                        const data = response.data;
                        if (!data.data) return msg.reply(data.message);

                        const produk = data.data.find(item => item.code === code.toUpperCase());
                        if (!produk) return msg.reply('Produk tidak ditemukan.');

                        const profit = (config.api.profit / 100) * produk.price;
                        const finalPrice = Number(produk.price) + Math.ceil(profit);
                        const produkDetail = `*Nama Produk:* ${produk.name}\n*Kode Produk:* ${produk.code}`;

                        performDeposit(reffId, produkDetail, finalPrice, code, target);
                    })
                    .catch(error => {
                        msg.reply('Transaksi gagal dibuat. Silahkan laporkan masalah ini ke owner bot.');
                        console.error('Error:', error);
                    });

                function performDeposit(reffId, product, nominal, code, target) {
                    axios.post(`${config.api.base_url}/api/h2h/deposit/create`, {
                            reff_id: reffId,
                            type: 'ewallet',
                            method: 'QRISFAST',
                            nominal: nominal,
                            api_key: config.api.secret_key,
                        })
                        .then(response => {
                            const data = response.data;
                            if (!data.data) return msg.reply(data.message);

                            orderData[senderNumber] = {
                                reffId,
                                payId: data.data.id,
                                createdAt: data.data.created_at
                            };
                            fs.writeFileSync(tmpFilePath, JSON.stringify(orderData, null, 2));

                            const text = `*TRANSAKSI BERHASIL DIBUAT*\n\n*Kode Pembayaran:* ${data.data.reff_id}\n*Nominal:* Rp ${toRupiah(data.data.nominal)}\n${product}\n*Dibuat Pada:* ${data.data.created_at}\n\n*Note:* Pembayaran akan otomatis dibatalkan 5 menit lagi!\n\n\`Bot ini telah terintegrasi dengan API yang disediakan oleh ${config.api.base_url}\``;

                            client.sendMessage(jid, {
                                image: {
                                    url: data.data.qr_image_url
                                },
                                caption: text,
                            }, {
                                quoted: msg
                            });

                            checkPaymentStatus(data.data.id, reffId, code, target);
                        })
                        .catch(error => console.error('Error:', error));
                }

                function checkPaymentStatus(payId, reffId, code, target) {
                    const timeout = setTimeout(() => {
                        clearInterval(interval);

                        axios.post(`${config.api.base_url}/api/h2h/deposit/cancel`, {
                                id: payId,
                                api_key: config.api.secret_key,
                            })
                            .then(() => {
                                delete orderData[senderNumber];
                                fs.writeFileSync(tmpFilePath, JSON.stringify(orderData, null, 2));
                                msg.reply('⚠️ *Pembayaran Dibatalkan Otomatis* setelah 5 menit tanpa konfirmasi keberhasilan.');
                            });
                    }, 300000);

                    const interval = setInterval(() => {
                        axios.post(`${config.api.base_url}/api/h2h/deposit/status`, {
                                id: payId,
                                api_key: config.api.secret_key,
                            })
                            .then(response => {
                                const data = response.data.data;

                                if (data.status === 'success' || data.status === 'failed') {
                                    clearInterval(interval);
                                    clearTimeout(timeout);

                                    delete orderData[senderNumber];
                                    fs.writeFileSync(tmpFilePath, JSON.stringify(orderData, null, 2));

                                    if (data.status === 'success') {
                                        performTopupTransaction(reffId, code, target);
                                        msg.reply(`⬣ *Pembayaran Berhasil!*\n\n` +
                                            `◉ ID Pembayaran: ${data.reff_id}\n` +
                                            `◉ Status: ${data.status}\n` +
                                            `◉ Diterima: ${toRupiah(data.get_balance)}\n` +
                                            `◉ Tanggal: ${data.date}\n\n` +
                                            `Terimakasih.`);
                                    } else if (data.status === 'failed' || data.status === 'cancel' || data.status === 'canceled') {
                                        clearInterval(interval);
                                        return msg.reply('Sangat disayangkan sekali. Pembayaran kamu dibatalkan oleh sistem.');
                                    }
                                }
                            });
                    }, 5000);
                }

                function performTopupTransaction(reffId, code, target) {
                    axios.post(`${config.api.base_url}/api/h2h/transaction/create`, {
                            reff_id: reffId,
                            product_code: code.toUpperCase(),
                            target: target,
                            api_key: config.api.secret_key,
                        })
                        .then(response => {
                            const data = response.data;

                            if (!data.data) return msg.reply(data.message);

                            const text = 'Pembelian sedang di proses...';

                            client.sendMessage(jid, {
                                text
                            }, {
                                quoted: msg
                            });

                            checkTransactionStatus(data.data.id);
                        })
                        .catch(error => console.error('Error:', error));
                }

                function checkTransactionStatus(id) {
                    const interval = setInterval(() => {
                        axios.post(`${config.api.base_url}/api/h2h/transaction/status`, {
                                id: id,
                                api_key: config.api.secret_key,
                            })
                            .then(response => {
                                const data = response.data.data;

                                if (data.status === 'success') {
                                    clearInterval(interval);

                                    const text = `⬣ *Pembelian Berhasil!*\n\n` +
                                        `◉ ID Transaksi: ${data.reff_id}\n` +
                                        `◉ Status: ${data.status}\n` +
                                        `◉ Layanan: ${data.name}\n` +
                                        `◉ Target: ${data.target}\n` +
                                        `◉ Serial Number: ${data.serial_number}\n` +
                                        `◉ Tanggal: ${data.date}\n\n` +
                                        `Terimakasih.`;

                                    client.sendMessage(jid, {
                                        text
                                    }, {
                                        quoted: msg
                                    });
                                } else if (data.status === 'cancel' || data.status === 'canceled') {
                                    clearInterval(interval);
                                } else if (data.status === 'failed') {
                                    clearInterval(interval);
                                    msg.reply('Transaksi gagal. Silakan laporkan masalah ini ke owner bot.');
                                }
                            });
                    }, 5000);
                }
                break;
            }

            case 'order2':
            case 'topup2': {
                const params = query.split(',').map(param => param.trim());
                const [code, ...targets] = params;
                const target = targets.join('|');

                if (!code || !target) {
                    return msg.reply(`Semua parameter (code, target) diperlukan.\n\n*PETUNJUK PENGGUNAAN*

\`Produk game\`
- Format order: ${prefix}${command} KODE,ID
- Contoh: ${prefix}${command} HOK250,1223334782

\`Khusus produk game yang memakai Zone ID/Server\`
- Format order: ${prefix}${command} KODE,ID|SERVER
- Contoh: ${prefix}${command} MLW1,628299715|10135

\`Produk lainnya\`
- Format order: ${prefix}${command} KODE,TUJUAN
- Contoh: ${prefix}${command} S100,082320667363`);
                }

                const reffId = generateRandomText(10);

                axios.post(`${config.api.base_url}/api/h2h/price-list/all`, {
                        api_key: config.api.secret_key,
                    })
                    .then(response => {
                        const data = response.data;

                        if (!data.data) return msg.reply(data.message);

                        const produk = data.data.find(item => item.code === code.toUpperCase());
                        if (!produk) return msg.reply('Produk tidak ditemukan.');

                        const profit = (config.api.profit / 100) * produk.price;
                        const finalPrice = Number(produk.price) + Math.ceil(profit);
                        const produkDetail = `*Nama Produk:* ${produk.name}\n*Kode Produk:* ${produk.code}`;

                        lakukanDeposit(reffId, produkDetail, finalPrice, code, target);
                    })
                    .catch(error => {
                        msg.reply('Transaksi gagal dibuat. Silahkan laporkan masalah ini ke owner bot.');
                        console.error('Error:', error);
                    });

                function lakukanDeposit(reffId, product, nominal, code, target) {
                    axios.post(`${config.api.base_url}/api/h2h/deposit/create`, {
                            reff_id: reffId,
                            type: 'ewallet',
                            method: 'QRISFAST',
                            nominal: nominal,
                            api_key: config.api.secret_key,
                        })
                        .then(response => {
                            const data = response.data;

                            if (!data.data) return msg.reply(data.message);

                            const text = `*TRANSAKSI BERHASIL DIBUAT*\n\n*Kode Pembayaran:* ${data.data.reff_id}\n*Nominal:* Rp ${toRupiah(data.data.nominal)}\n${product}\n*Dibuat Pada:* ${data.data.created_at}\n\n*Note:* Pembayaran akan otomatis dibatalkan 5 menit lagi!\n\n\`Bot ini telah terintegrasi dengan API yang disediakan oleh ${config.api.base_url}\``;

                            client.sendMessage(jid, {
                                    image: {
                                        url: data.data.qr_image_url
                                    },
                                    caption: text,
                                }, {
                                    quoted: msg
                                })
                                .then(sentMessage => {
                                    const messageId = sentMessage.key.id;

                                    checkPaymentStatus(data.data.id, messageId, reffId, code, target);

                                    setTimeout(() => {
                                        client.sendMessage(jid, {
                                            delete: {
                                                remoteJid: jid,
                                                fromMe: true,
                                                id: messageId
                                            },
                                        });
                                    }, 300000);
                                });
                        })
                        .catch(error => console.error('Error:', error));
                }

                function checkPaymentStatus(payId, messageId, reffId, code, target) {
                    const interval = setInterval(() => {
                        axios.post(`${config.api.base_url}/api/h2h/deposit/status`, {
                                id: payId,
                                api_key: config.api.secret_key,
                            })
                            .then(response => {
                                const data = response.data.data;

                                if (data.status === 'success') {
                                    clearInterval(interval);
                                    clearTimeout(timeout);

                                    lakukanTransaksiTopup(reffId, code, target);

                                    msg.reply(`⬣ *Pembayaran Berhasil!*\n\n` +
                                        `◉ ID Pembayaran: ${data.reff_id}\n` +
                                        `◉ Status: ${data.status}\n` +
                                        `◉ Diterima: ${toRupiah(data.get_balance)}\n` +
                                        `◉ Tanggal: ${data.date}\n\n` +
                                        `Terimakasih.`);

                                    client.sendMessage(jid, {
                                        delete: {
                                            remoteJid: jid,
                                            fromMe: true,
                                            id: messageId
                                        },
                                    });
                                } else if (data.status === 'cancel' || data.status === 'canceled') {
                                    clearInterval(interval);
                                } else if (data.status === 'failed') {
                                    clearInterval(interval);
                                    msg.reply('Transaksi gagal. Silakan laporkan masalah ini ke owner bot.');
                                }
                            });
                    }, 5000);

                    const timeout = setTimeout(() => {
                        clearInterval(interval);

                        axios.post(`${config.api.base_url}/api/h2h/deposit/cancel`, {
                                id: payId,
                                api_key: config.api.secret_key,
                            })
                            .then(response => {
                                const data = response.data;

                                if (!data.data) return msg.reply(data.message);

                                msg.reply(`⚠️ *Pembayaran Dibatalkan Otomatis* setelah 5 menit tanpa konfirmasi keberhasilan.`);
                            });
                    }, 300000);
                }

                function lakukanTransaksiTopup(reffId, code, target) {
                    axios.post(`${config.api.base_url}/api/h2h/transaction/create`, {
                            reff_id: reffId,
                            product_code: code.toUpperCase(),
                            target: target,
                            api_key: config.api.secret_key,
                        })
                        .then(response => {
                            const data = response.data;

                            if (!data.data) return msg.reply(data.message);

                            const text = 'Pembelian sedang di proses...';

                            client.sendMessage(jid, {
                                text
                            }, {
                                quoted: msg
                            });

                            checkTransaksiStatus(data.data.id);
                        })
                        .catch(error => console.error('Error:', error));
                }

                function checkTransaksiStatus(id) {
                    const interval = setInterval(() => {
                        axios.post(`${config.api.base_url}/api/h2h/transaction/status`, {
                                id: id,
                                api_key: config.api.secret_key,
                            })
                            .then(response => {
                                const data = response.data.data;

                                if (data.status === 'success') {
                                    clearInterval(interval);

                                    const text = `⬣ *Pembelian Berhasil!*\n\n` +
                                        `◉ ID Transaksi: ${data.reff_id}\n` +
                                        `◉ Status: ${data.status}\n` +
                                        `◉ Layanan: ${data.name}\n` +
                                        `◉ Target: ${data.target}\n` +
                                        `◉ Serial Number: ${data.serial_number}\n` +
                                        `◉ Tanggal: ${data.date}\n\n` +
                                        `Terimakasih.`;

                                    client.sendMessage(jid, {
                                        text
                                    }, {
                                        quoted: msg
                                    });
                                } else if (data.status === 'cancel' || data.status === 'canceled') {
                                    clearInterval(interval);
                                } else if (data.status === 'failed') {
                                    clearInterval(interval);
                                    msg.reply('Transaksi gagal. Silakan laporkan masalah ini ke owner bot.');
                                }
                            });
                    }, 5000);
                }
                break;
            }

            case 'cancel': {
                const params = query.split(',').map(param => param.trim());
                const [reffId] = params;

                if (!reffId) {
                    return msg.reply('Parameter `reffId` diperlukan untuk membatalkan deposit.\n\n*PETUNJUK PENGGUNAAN*\n\n' +
                        `\`Format: ${prefix}${command} REFFID\`\n` +
                        `\`Contoh: ${prefix}${command} ABC123456\``);
                }

                const tmpFilePath = path.join(__dirname, 'tmp', 'orders.json');

                let orderData = {};
                if (fs.existsSync(tmpFilePath)) {
                    orderData = JSON.parse(fs.readFileSync(tmpFilePath, 'utf8'));
                }

                if (!orderData[senderNumber]) {
                    return msg.reply('Tidak ada transaksi yang terkait dengan nomor pengirim ini.');
                }

                if (!orderData[senderNumber].reffId === reffId) {
                    return msg.reply('Tidak ada transaksi yang terkait dengan kode pembayaran ini.');
                }

                const payId = orderData[senderNumber].payId;

                axios.post(`${config.api.base_url}/api/h2h/deposit/cancel`, {
                        id: payId,
                        api_key: config.api.secret_key,
                    })
                    .then(() => {
                        delete orderData[senderNumber];

                        fs.writeFileSync(tmpFilePath, JSON.stringify(orderData, null, 2));

                        msg.reply(`⚠️ Pembayaran dengan reffId ${reffId} dan payId ${payId} telah dibatalkan.`);
                    })
                    .catch(error => {
                        console.error('Error:', error);
                        msg.reply('Gagal membatalkan deposit. Silakan coba lagi atau laporkan masalah ini ke owner bot.');
                    });

                break;
            }

            case 'buy': {
                if (!(isOwner || isMe)) return msg.reply('❌ Kamu tidak memiliki izin untuk menggunakan fitur ini.');

                const params = query.split(',').map(param => param.trim());
                const [code, ...targets] = params;
                const target = targets.join(',');

                if (!code || !target) {
                    return msg.reply(`Semua parameter (code, target) diperlukan.\n\nContoh: ${prefix}${command} ML3,628299715|10135`);
                };

                const reffId = generateRandomText(10);

                try {
                    const response = await axios.post(`${config.api.base_url}/api/h2h/transaction/create`, {
                        reff_id: reffId,
                        product_code: code.toUpperCase(),
                        target: target,
                        api_key: config.api.secret_key
                    });

                    const data = response.data;

                    if (!data.data) return msg.reply(data.message);

                    const text = `Pembelian sedang di prosess:\n\nLayanan: ${data.data.name}\nTarget: ${data.data.target}\nReff id: ${data.data.reff_id}\nNominal: Rp ${toRupiah(data.data.price)}\nSN: ${data.data.serial_number}\nDibuat pada: ${data.data.date}`;
                    client.sendMessage(jid, {
                        text: text
                    }, {
                        quoted: msg
                    }).then(sentMessage => {
                        checkTransactionStatus(data.data.id, sentMessage.key.id);

                        setTimeout(() => {
                            client.sendMessage(jid, {
                                delete: {
                                    remoteJid: jid,
                                    fromMe: true,
                                    id: sentMessage.key.id
                                }
                            });
                        }, 300000);
                    });
                } catch (error) {
                    console.error('Error fetching data:', error);
                    msg.reply('Saldo tidak cukup!');
                }

                async function checkTransactionStatus(id, messageId) {
                    const interval = setInterval(async () => {
                        const response = await axios.post(`${config.api.base_url}/api/h2h/transaction/status`, {
                            id: id,
                            api_key: config.api.secret_key
                        });

                        const data = response.data;

                        if (data.data.status === 'success') {
                            clearInterval(interval);
                            msg.reply(`⬣ *Pembelian Berhasil!*\n\n` +
                                `◉ ID Pembayaran: ${data.data.reff_id}\n` +
                                `◉ Status: ${data.data.status}\n` +
                                `◉ Layanan: ${data.data.name}\n` +
                                `◉ Target: ${data.data.target}\n` +
                                `◉ Serial Number: ${data.data.serial_number}\n` +
                                `◉ Tanggal: ${data.data.date}\n\n` +
                                `Terimakasih.`);
                            client.sendMessage(jid, {
                                delete: {
                                    remoteJid: jid,
                                    fromMe: true,
                                    id: messageId
                                }
                            });
                        } else if (data.data.status === 'failed') {
                            clearInterval(interval);
                            msg.reply(`Sangat Disayangkan Sekali. Pembayaran Kamu Dibatalkan Oleh Sistem.`);
                        }
                    }, 5000);

                }

                break;
            }

            // Deposit
            case 'deposit':
            case 'depo': {
                if (!(isOwner || isMe)) return msg.reply('❌ Kamu tidak memiliki izin untuk menggunakan fitur ini.');

                if (!query) return msg.reply(`Example: ${prefix}${command} 500.`);
                const nominal = query;
                if (nominal < 500) return msg.reply('Jumlah minimal: 500.');

                const reffId = generateRandomText(10);

                try {
                    const response = await axios.post(`${config.api.base_url}/api/h2h/deposit/create`, {
                        reff_id: reffId,
                        type: 'ewallet',
                        method: 'QRISFAST',
                        nominal: nominal,
                        api_key: config.api.secret_key
                    });

                    const data = response.data;

                    if (!data.data) return msg.reply(data.message);

                    const text = `Reff id: ${data.data.reff_id}\nNominal: Rp ${toRupiah(data.data.nominal)}\nFee: Rp ${toRupiah(data.data.fee)}\nDiterima: Rp ${toRupiah(data.data.get_balance)}\nDibuat pada: ${data.data.created_at}\n\nNote: Pembayaran akan otomatis dibatalkan 5 menit lagi!`;
                    client.sendMessage(jid, {
                        image: {
                            url: data.data.qr_image_url
                        },
                        caption: text
                    }, {
                        quoted: msg
                    }).then(sentMessage => {
                        checkPaymentStatus(data.data.id, sentMessage.key.id);

                        setTimeout(() => {
                            client.sendMessage(jid, {
                                delete: {
                                    remoteJid: jid,
                                    fromMe: true,
                                    id: sentMessage.key.id
                                }
                            });
                        }, 300000);
                    });

                    async function checkPaymentStatus(id, messageId) {
                    	const timeout = setTimeout(async () => {
                            clearInterval(interval);
                            const response = await axios.post(`${config.api.base_url}/api/h2h/deposit/cancel`, {
                                id: id,
                                api_key: config.api.secret_key
                            });

                            const data = response.data;

                            if (!data.data) return msg.reply(data.message);
                            msg.reply(`⚠️ *Pembayaran Dibatalkan Otomatis* setelah 5 menit tanpa konfirmasi keberhasilan.`);
                        }, 300000);
                        
                        const interval = setInterval(async () => {
                            const response = await axios.post(`${config.api.base_url}/api/h2h/deposit/status`, {
                                id: id,
                                api_key: config.api.secret_key
                            });

                            const data = response.data;
                            
                            console.log(data)
                            if (data.data.status === 'success') {
                                clearInterval(interval);
                                clearTimeout(timeout);
                                msg.reply(`⬣ *Pembayaran Berhasil!*\n\n` +
                                    `◉ ID Pembayaran: ${data.data.reff_id}\n` +
                                    `◉ Status: ${data.data.status}\n` +
                                    `◉ Diterima: ${toRupiah(data.data.get_balance)}\n` +
                                    `◉ Tanggal: ${data.data.date}\n\n` +
                                    `Terimakasih.`);
                                client.sendMessage(jid, {
                                    delete: {
                                        remoteJid: jid,
                                        fromMe: true,
                                        id: messageId
                                    }
                                });
                            } else if (data.data.status === 'failed' || data.data.status === 'cancel') {
                                clearInterval(interval);
                                msg.reply(`Sangat Disayangkan Sekali. Pembayaran Kamu Dibatalkan Oleh Sistem.`);
                            }
                        }, 5000);

                    }
                } catch (error) {
                    console.error('Error fetching data:', error);
                    msg.reply(`Kamu masih memiliki 5 deposit yang belum selesai (Pending). Tunggu hingga pembayaran selesai, kadaluarsa, atau gagal untuk membuat transaksi baru. \n\n_Ingin membatalkan deposit? kunjungi *${config.api.base_url}/reports*_`);
                }
                break;
            }

            // Transfer
            case 'transfer':
            case 'wd_balance':
            case 'wd': {
                if (!(isOwner || isMe)) return msg.reply('❌ Kamu tidak memiliki izin untuk menggunakan fitur ini.');

                if (!query) return msg.reply(`Example: ${prefix}${command} 3000.`);
                const nominal = query;
                if (nominal < 3000) return msg.reply('Jumlah minimal: 3000.');

                const reffId = generateRandomText(10);

                try {
                    const response = await axios.post(`${config.api.base_url}/api/h2h/transfer/create`, {
                        reff_id: reffId,
                        bank_code: config.api.wd_balance.bank_code,
                        account_number: config.api.wd_balance.destination_number,
                        owner_name: config.api.wd_balance.owner_name,
                        email_address: config.api.wd_balance.email,
                        phone_number: config.api.wd_balance.destination_number,
                        note: 'Withdraw Saldo',
                        nominal: nominal,
                        api_key: config.api.secret_key
                    });

                    const data = response.data;

                    console.log(data.message);

                    if (!data.data) return msg.reply(data.message);

                    const text = `Reff id: ${data.data.reff_id}\nNama: ${data.data.name}\nNo DANA: ${data.data.number}\nNominal: Rp ${toRupiah(data.data.nominal)}\nFee: Rp ${toRupiah(data.data.fee)}\nTotal: Rp ${toRupiah(data.data.total)}\nDibuat pada: ${data.data.date}`;
                    client.sendMessage(jid, {
                        text: text
                    }, {
                        quoted: msg
                    }).then(sentMessage => {
                        checkPaymentStatus(data.data.id, sentMessage.key.id);

                    });

                    async function checkPaymentStatus(id, messageId) {
                        const interval = setInterval(async () => {
                            const response = await axios.post(`${config.api.base_url}/api/h2h/transfer/status`, {
                                id: id,
                                api_key: config.api.secret_key
                            });

                            const data = response.data;

                            if (data.data.status === 'success') {
                                clearInterval(interval);
                                msg.reply('Berhasil melakukan transfer.');
                            } else if (data.data.status === 'failed' || data.data.status === 'cancel') {
                                clearInterval(interval);
                                msg.reply('Gagal melakukan transfer.');
                            }
                        }, 5000);

                    }
                } catch (error) {
                    console.error('Error fetching data:', error);
                    msg.reply('Saldo tidak cukup!');
                }
                break;
            }

            // Profile
            case 'check_balance':
            case 'cek_saldo': {
                if (!(isOwner || isMe)) return msg.reply('❌ Kamu tidak memiliki izin untuk menggunakan fitur ini.');
                
                try {
                const response = await axios.post(`${config.api.base_url}/api/h2h/get-profile/balance`, {
                    api_key: config.api.secret_key
                });

                const data = response.data;
                msg.reply(`Jumlah saldo anda: Rp ${toRupiah(data.data.balance)}`);
                
                } catch (error) {
                    console.error('Error fetching data:', error);
                    msg.reply('Terjadi kesalahan, silahkan coba lagi nanti!');
                }
                break;
            }

            /* End Features area */

            /*default: {
                msg.reply('Perintah tidak dikenali. Gunakan .menu untuk melihat daftar perintah.');
            }*/
        }
    } catch (error) {
        console.error(error);
    }
};