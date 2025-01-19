/**
* Made by: Dani Technology (Full Stack Engineer)
* Created on: January 10, 2024
* Contact developer:
* - WhatsApp: +62 838-3499-4479 or +62 823-2066-7363
* - Email: dani.technology.id@gmail.com
* - GitHub: https://github.com/dani-techno
*/

const {
    makeWASocket,
    makeInMemoryStore,
    useMultiFileAuthState,
    makeCacheableSignalKeyStore,
    jidDecode,
    downloadContentFromMessage,
    DisconnectReason
} = require('@whiskeysockets/baileys');
const {
    Boom
} = require('@hapi/boom');
const pino = require('pino');
const readLine = require('readline');
const chalk = require('chalk');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const FileType = require('file-type');
const PhoneNumber = require('awesome-phonenumber');

const config = require('./config.js');

const {
    formatterMessage,
    writeExifImage,
    writeExifVideo,
    imageToWebp,
    videoToWebp,
    checkFileExists,
    deleteFolder
} = require('./lib/functions.js');

const phoneNumberMCC = require('./lib/phoneNumberMCC.js');

const date = new Date();
const currentDate = new Date(date.getDate().toLocaleString('en-US', {
    timeZone: config.time_zone
}));
const currentTime = `${date.getHours()}:${date.getMinutes() < 10 ? '0' : ''}${date.getMinutes()}:${date.getSeconds() < 10 ? '0' : ''}${date.getSeconds()} WIB, ${date.getDate() < 10 ? '0' : ''}${date.getDate()}-${date.getMonth() + 1 < 10 ? '0' : ''}${date.getMonth() + 1}-${date.getFullYear()}`;

async function startServer() {
    try {
        const rl = readLine.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        const question = (text) => new Promise((resolve) => rl.question(text, resolve));

        const {
            state,
            saveCreds
        } = await useMultiFileAuthState('./sessions/auth-state');

        const socket = makeWASocket({
            logger: pino({
                level: 'silent'
            }),
            printQRInTerminal: !config.pairing_mode,
            auth: {
                creds: state.creds,
                keys: makeCacheableSignalKeyStore(state.keys, pino({
                    level: 'silent'
                }).child({
                    level: 'silent'
                })),
            },
            browser: ['Mac OS', 'chrome', '121.0.6167.159']
        });

        const memoryStore = makeInMemoryStore({
            logger: pino().child({
                level: 'silent',
                stream: 'store'
            })
        });

        memoryStore.bind(socket.ev);

        const checkSessionExists = checkFileExists('./sessions/auth-state', 'creds.json');

        if (checkSessionExists) {
            console.log('Sessions folder detected exists, if the server is still not connected to your WhatsApp, please delete the sessions folder first, then try running the server again!');
        }

        if (config.pairing_mode && !checkSessionExists && !socket.authState.creds.registered) {

            let phoneNumber;
            if (!!phoneNumber) {
                phoneNumber = phoneNumber.replace(/[^0-9]/g, '');

                if (!Object.keys(phoneNumberMCC).some(v => phoneNumber.startsWith(v))) {
                    console.log(chalk.bgBlack(chalk.redBright('Start with country code of your WhatsApp Number, Example: 628xxxx'), '\n> '));
                    process.exit(0);
                }
                rl.close();
            } else {
                phoneNumber = await question(chalk.bgBlack(chalk.greenBright('Please enter your WhatsApp number, example: 628xxx'), '\n> '));
                phoneNumber = phoneNumber.replace(/[^0-9]/g, '');

                if (!Object.keys(phoneNumberMCC).some(v => phoneNumber.startsWith(v))) {
                    console.log(chalk.bgBlack(chalk.redBright('Start with country code of your WhatsApp Number, Example : 628xxxx'), '\n> '));

                    phoneNumber = await question(chalk.bgBlack(chalk.greenBright('Please enter your WhatsApp number, example: 628xxx'), '\n> '));
                    phoneNumber = phoneNumber.replace(/[^0-9]/g, '');
                    rl.close();
                }
            }

            setTimeout(async () => {
                let code = await socket.requestPairingCode(phoneNumber);
                code = code?.match(/.{1,4}/g)?.join('-') || code;
                console.log(chalk.black(chalk.greenBright('Your pairing code:')), chalk.black(chalk.white(code)));
            }, 3000);
        }

        socket.ev.on('creds.update', await saveCreds);

        socket.ev.on('connection.update', async (update) => {
            rl.close();
            const {
                connection,
                lastDisconnect
            } = update;
            if (connection === 'close') {
                let reason = new Boom(lastDisconnect?.error)?.output.statusCode;
                if (reason === DisconnectReason.badSession) {
                    console.log('Problem with the session.');
                    socket.logout();
                    deleteFolder(path.join(__dirname, 'sessions'))
                } else if (reason === DisconnectReason.connectionClosed || reason === DisconnectReason.connectionLost) {
                    console.log('Connection closed or lost, reconnecting...');
                    startServer();
                } else if (reason === DisconnectReason.connectionReplaced) {
                    console.log('Connection replaced.');
                    socket.logout();
                    deleteFolder(path.join(__dirname, 'sessions'))
                } else if (reason === DisconnectReason.loggedOut) {
                    console.log('The device is out.');
                    socket.logout();
                    deleteFolder(path.join(__dirname, 'sessions'))
                } else if (reason === DisconnectReason.restartRequired || reason === DisconnectReason.timedOut) {
                    console.log('The server is restarting...');
                    startServer();
                } else if (reason === DisconnectReason.Multidevicemismatch) {
                    console.log('Dual device matching.');
                    socket.logout();
                    deleteFolder(path.join(__dirname, 'sessions'))
                } else {
                    socket.end(`Unknown reason for breakup: ${reason}|${connection}`);
                }
            } else if (connection === 'open') {
                const name = socket.user.name ? socket.user.name : config.bot_name;
                const phoneNumber = socket.user.id.split(':')[0];

                if (config.connection_status_message) {
                    await socket.sendMessage(config.owner_number + '@s.whatsapp.net', {
                        text: `*Bot berhasil terhubung.*`
                    });
                }

                console.log('• ' + chalk.bold(chalk.greenBright('Connection Information:')));
                console.log('- ' + chalk.cyanBright(`Name:`), chalk.whiteBright(`${name}`));
                console.log('- ' + chalk.cyanBright(`Number:`), chalk.whiteBright(`${phoneNumber}`));
                console.log('- ' + chalk.cyanBright(`Status:`), chalk.whiteBright(`Connected ✅`));
            }
        });

        socket.ev.on('messages.upsert', async (chatUpdate) => {
            try {
                const messageData = chatUpdate.messages[0];
                if (!messageData.message) return;
                messageData.message = (Object.keys(messageData.message)[0] === 'ephemeralMessage') ? messageData.message.ephemeralMessage.message : messageData.message;
                if (messageData.key && messageData.key.remoteJid === 'status@broadcast') return;
                if (!socket.public && !messageData.key.fromMe && chatUpdate.type === 'notify') return;
                if (messageData.key.id.startsWith('BAE5') && messageData.key.id.length === 16) return;
                const messages = formatterMessage(socket, messageData, memoryStore);
                require('./handler.js')(socket, messages, memoryStore);
            } catch (error) {
                console.error(error);
            }
        });

        /*let fileChanged = false;

        const watchFiles = ['./handler.js', './config.js', './lib/functions.js'];

        watchFiles.forEach((file) => {
            fs.watch(file, (event) => {
                if (event === 'change' && !fileChanged) {
                    console.log(`File ${file} has been updated.`);
                    delete require.cache[require.resolve(file)];
                    require(file);
                    fileChanged = true;
                } else {
                    fileChanged = false;
                }
            });
        });*/

        /*fs.watch('./handler.js', (event, filename) => {
        	if (event === 'change' && !fileChanged) {
        		console.log('File handler.js has been updated.');
        		delete require.cache[require.resolve('./handler.js')];
        		require('./handler.js');
        		fileChanged = true;
        	} else {
        	    fileChanged = false;
        	}
        });

        fs.watch('./config.js', (event, filename) => {
        	if (event === 'change' && !fileChanged) {
        		console.log('File config.js has been updated.');
        		delete require.cache[require.resolve('./config.js')];
        		require('./config.js');
        		fileChanged = true;
        	} else {
        	    fileChanged = false;
        	}
        });

        fs.watch('./lib/functions.js', (event, filename) => {
        	if (event === 'change' && !fileChanged) {
        		console.log('File lib/functions.js has been updated.');
        		delete require.cache[require.resolve('./lib/functions.js')];
        		require('./lib/functions.js');
        		fileChanged = true;
        	} else {
        	    fileChanged = false;
        	}
        });*/

        socket.ev.on('group-participants.update', async (data) => {
            if (config.group_member_status_message) {
                try {
                    const groupId = data.id;
                    const groupParticipants = data.participants;

                    const groupMetadata = await socket.groupMetadata(groupId)
                    const groupSubject = groupMetadata.subject;
                    const groupDescription = groupMetadata.desc;
                    const groupSize = groupMetadata.size;
                    const groupOwner = groupMetadata.owner;

                    for (let memberId of groupParticipants) {
                        const memberName = socket.getName(memberId);

                        try {
                            memberPhoto = await socket.profilePictureUrl(memberId, 'image')
                        } catch {
                            memberPhoto = 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png?q=60'
                        }

                        try {
                            groupPhoto = await socket.profilePictureUrl(groupId, 'image')
                        } catch {
                            groupPhoto = 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png?q=60'
                        }

                        if (data.action == 'add') {
                            const imageUrl = `https://widipe.com/welcome?name=${memberName}&gcname=${groupSubject}&ppgc=${groupPhoto}&member=${groupSize}&pp=${memberPhoto}&bg=https%3A%2F%2Fi.ibb.co.com%2FVDxYJNS%2Fphoto.jpg`
                            socket.sendMessage(groupId, {
                                image: {
                                    url: imageUrl
                                },
                                caption: `Selamat datang kak *@${memberId.split("@")[0]}*, di group *${groupSubject}*\n\nJangan lupa baca deskripsi: ${groupDescription}`,
                                mentions: [memberId]
                            })
                        } else if (data.action == 'remove') {
                            const imageUrl = `https://widipe.com/goodbye?name=${memberName}&gcname=${groupSubject}&ppgc=${groupPhoto}&member=${groupSize}&pp=${memberPhoto}&bg=https%3A%2F%2Fi.ibb.co.com%2FVDxYJNS%2Fphoto.jpg`
                            socket.sendMessage(groupId, {
                                image: {
                                    url: imageUrl
                                },
                                caption: `Selamat tinggal kak *@${memberId.split("@")[0]}*, semoga tenang di alam sana, Al-fatihah 🤲\n\nKalau balik lagi, jangan lupa bawa gorengan ya`,
                                mentions: [memberId]
                            })
                        } else if (data.action == 'promote') {
                            socket.sendMessage(groupId, {
                                text: `Cie @${memberId.split('@')[0]} naik jabatan jadi admin group nih`,
                                mentions: [memberId]
                            })
                        } else if (data.action == 'demote') {
                            socket.sendMessage(groupId, {
                                text: `Cie @${memberId.split('@')[0]} turun jabatan jadi member biasa nih`,
                                mentions: [memberId]
                            })
                        }
                    }
                } catch (error) {
                    console.error('There is an error:', error);
                }
            }
        });

        socket.ev.on('contacts.update', (update) => {
            for (let contact of update) {
                let id = socket.decodeJid(contact.id);

                if (memoryStore && memoryStore.contacts) memoryStore.contacts[id] = {
                    id,
                    name: contact.notify
                }
            }
        });

        socket.decodeJid = (jid) => {
            if (!jid) return jid;
            if (/:\d+@/gi.test(jid)) {
                let decode = jidDecode(jid) || {};
                return decode.user && decode.server && decode.user + '@' + decode.server || jid;
            } else return jid;
        };

        socket.public = true;

        socket.serializeM = (messages) => formattedMessage(socket, messages, memoryStore);

        socket.getName = (jid, withoutContact = false) => {
            id = socket.decodeJid(jid)
            withoutContact = socket.withoutContact || withoutContact
            let v
            if (id.endsWith("@g.us")) return new Promise(async (resolve) => {
                v = memoryStore.contacts[id] || {}
                if (!(v.name || v.subject)) v = socket.groupMetadata(id) || {}
                resolve(v.name || v.subject || PhoneNumber('+' + id.replace('@s.whatsapp.net', '')).getNumber('international'))
            })
            else v = id === '0@s.whatsapp.net' ? {
                    id,
                    name: 'WhatsApp'
                } : id === socket.decodeJid(socket.user.id) ?
                socket.user :
                (memoryStore.contacts[id] || {})
            return (withoutContact ? '' : v.name) || v.subject || v.verifiedName || PhoneNumber('+' + jid.replace('@s.whatsapp.net', '')).getNumber('international')
        }

        socket.sendText = (jid, text, quoted = '', options) => {
            return socket.sendMessage(jid, {
                text: text,
                ...options
            }, {
                quoted,
                ...options
            })
        };

        socket.sendImageAsSticker = async (jid, path, quoted, options = {}) => {
            let buff = Buffer.isBuffer(path) ? path : /^data:.*?\/.*?base64,/i.test(path) ? Buffer.from(path.split`,` [1], 'base64') : /^https?:\/\//.test(path) ? await (await fetchBuffer(path)) : fs.existsSync(path) ? fs.readFileSync(path) : Buffer.alloc(0);
            let buffer;

            if (options && (options.packname || options.author)) {
                buffer = await writeExifImage(buff, options);
            } else {
                buffer = await imageToWebp(buff);
            };

            await socket.sendMessage(jid, {
                sticker: {
                    url: buffer
                },
                ...options
            }, {
                quoted
            });
            return buffer;
        };

        socket.sendVideoAsSticker = async (jid, path, quoted, options = {}) => {
            let buff = Buffer.isBuffer(path) ? path : /^data:.*?\/.*?base64,/i.test(path) ? Buffer.from(path.split`,` [1], 'base64') : /^https?:\/\//.test(path) ? await (await fetchBuffer(path)) : fs.existsSync(path) ? fs.readFileSync(path) : Buffer.alloc(0);
            let buffer;

            if (options && (options.packname || options.author)) {
                buffer = await writeExifVideo(buff, options);
            } else {
                buffer = await videoToWebp(buff);
            };

            await socket.sendMessage(jid, {
                sticker: {
                    url: buffer
                },
                ...options
            }, {
                quoted
            });

            return buffer;
        };

        socket.downloadAndSaveMediaMessage = async (message, filename, attachExtension = true) => {
            let quoted = message.msg ? message.msg : message;
            let mime = (message.msg || message).mimetype || '';
            let messageType = message.mtype ? message.mtype.replace(/Message/gi, '') : mime.split('/')[0];
            const stream = await downloadContentFromMessage(quoted, messageType);
            let buffer = Buffer.from([]);

            for await (const chunk of stream) {
                buffer = Buffer.concat([buffer, chunk]);
            };

            let type = await FileType.fromBuffer(buffer);
            trueFileName = attachExtension ? (filename + '.' + type.ext) : filename;

            await fs.writeFileSync(trueFileName, buffer);
            return trueFileName;
        };

        socket.downloadMediaMessage = async (message) => {
            let mime = (message.msg || message).mimetype || '';
            let messageType = message.mtype ? message.mtype.replace(/Message/gi, '') : mime.split('/')[0];
            const stream = await downloadContentFromMessage(message, messageType);
            let buffer = Buffer.from([]);
            for await (const chunk of stream) {
                buffer = Buffer.concat([buffer, chunk]);
            };

            return buffer;
        };

        socket.sendImageMessage = (jid, title, description, sourceUrl, thumbnailUrl, caption, renderLargerThumbnail, showAdAttribution, quoted) => {
            return socket.sendMessage(jid, {
                text: caption,
                contextInfo: {
                    externalAdReply: {
                        title: title,
                        body: description,
                        sourceUrl: sourceUrl,
                        thumbnailUrl: thumbnailUrl,
                        mediaType: 1,
                        renderLargerThumbnail: renderLargerThumbnail,
                        showAdAttribution: showAdAttribution
                    }
                }
            }, {
                quoted: quoted
            })
        };

        socket.sendTextWithMentions = async (jid, text, quoted, options = {}) => socket.sendMessage(jid, {
            text: text,
            mentions: [...text.matchAll(/@(\d{0,16})/g)].map(v => v[1] + '@s.whatsapp.net'),
            ...options
        }, {
            quoted
        })

        return socket;
    } catch (error) {
        throw error;
    }
};

startServer();