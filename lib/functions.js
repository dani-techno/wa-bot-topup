/**
* Made by: Dani Technology (Full Stack Engineer)
* Created on: August 6, 2024
* Contact developer:
* - WhatsApp: +62 838-3499-4479 or +62 823-2066-7363
* - Email: dani.technology.id@gmail.com
* - GitHub: https://github.com/dani-techno
*/

const {
    proto,
    getContentType
} = require('@whiskeysockets/baileys');
const path = require('path');
const crypto = require('crypto');
const fs = require('fs');
const webp = require('node-webpmux');
const axios = require('axios');
const {
    fromBuffer
} = require('file-type');
const {
    FormData
} = require('formdata-node');

const convert = require('./convert.js');

function formatterMessage(conn, m, store) {
    if (!m) return m;
    let M = proto.WebMessageInfo;
    if (m.key) {
        m.id = m.key.id;
        m.isBaileys = m.id.startsWith('BAE5') && m.id.length === 16;
        m.chat = m.key.remoteJid;
        m.fromMe = m.key.fromMe;
        m.isGroup = m.chat.endsWith('@g.us');
        m.sender = conn.decodeJid(m.fromMe && conn.user.id || m.participant || m.key.participant || m.chat || '');
        if (m.isGroup) m.participant = conn.decodeJid(m.key.participant) || '';
    }
    if (m.message) {
        m.mtype = getContentType(m.message);
        m.msg = (m.mtype == 'viewOnceMessage' ? m.message[m.mtype].message[getContentType(m.message[m.mtype].message)] : m.message[m.mtype]);
        m.body = m.message.conversation || m.msg.caption || m.msg.text || (m.mtype == 'listResponseMessage') && m.msg.singleSelectReply.selectedRowId || (m.mtype == 'buttonsResponseMessage') && m.msg.selectedButtonId || (m.mtype == 'viewOnceMessage') && m.msg.caption || m.text;
        let quoted = m.quoted = m.msg.contextInfo ? m.msg.contextInfo.quotedMessage : null;
        m.mentionedJid = m.msg.contextInfo ? m.msg.contextInfo.mentionedJid : [];
        if (m.quoted) {
            let type = Object.keys(m.quoted)[0];
            m.quoted = m.quoted[type];
            if (['productMessage'].includes(type)) {
                type = Object.keys(m.quoted)[0];
                m.quoted = m.quoted[type];
            }
            if (typeof m.quoted === 'string') m.quoted = {
                text: m.quoted
            };
            m.quoted.mtype = type;
            m.quoted.id = m.msg.contextInfo.stanzaId;
            m.quoted.chat = m.msg.contextInfo.remoteJid || m.chat;
            m.quoted.isBaileys = m.quoted.id ? m.quoted.id.startsWith('BAE5') && m.quoted.id.length === 16 : false;
            m.quoted.sender = conn.decodeJid(m.msg.contextInfo.participant);
            m.quoted.fromMe = m.quoted.sender === conn.decodeJid(conn.user.id);
            m.quoted.text = m.quoted.text || m.quoted.caption || m.quoted.conversation || m.quoted.contentText || m.quoted.selectedDisplayText || m.quoted.title || '';
            m.quoted.mentionedJid = m.msg.contextInfo ? m.msg.contextInfo.mentionedJid : [];
            m.getQuotedObj = m.getQuotedMessage = async () => {
                if (!m.quoted.id) return false;
                let q = await store.loadMessage(m.chat, m.quoted.id, conn);
                return exports.smsg(conn, q, store);
            };
            let vM = m.quoted.fakeObj = M.fromObject({
                key: {
                    remoteJid: m.quoted.chat,
                    fromMe: m.quoted.fromMe,
                    id: m.quoted.id
                },
                message: quoted,
                ...(m.isGroup ? {
                    participant: m.quoted.sender
                } : {})
            });
            m.quoted.delete = () => conn.sendMessage(m.quoted.chat, {
                delete: vM.key
            });
            m.quoted.copyNForward = (jid, forceForward = false, options = {}) => conn.copyNForward(jid, vM, forceForward, options);
            m.quoted.download = () => conn.downloadMediaMessage(m.quoted);
        }
    }
    if (m.msg.url) m.download = () => conn.downloadMediaMessage(m.msg);
    m.text = m.msg.text || m.msg.caption || m.message.conversation || m.msg.contentText || m.msg.selectedDisplayText || m.msg.title || '';
    m.reply = (text, chatId = m.chat, options = {}) => Buffer.isBuffer(text) ? conn.sendMedia(chatId, text, 'file', '', m, {
        ...options
    }) : conn.sendText(chatId, text, m, {
        ...options
    });
    m.copy = () => exports.smsg(conn, M.fromObject(M.toObject(m)));
    m.copyNForward = (jid = m.chat, forceForward = false, options = {}) => conn.copyNForward(jid, m, forceForward, options);
    conn.appenTextMessage = async (text, chatUpdate) => {
        let messages = await generateWAMessage(m.chat, {
            text: text,
            mentions: m.mentionedJid
        }, {
            userJid: conn.user.id,
            quoted: m.quoted && m.quoted.fakeObj
        });
        messages.key.fromMe = areJidsSameUser(m.sender, conn.user.id);
        messages.key.id = m.key.id;
        messages.pushName = m.pushName;
        if (m.isGroup) messages.participant = m.sender;
        let msg = {
            ...chatUpdate,
            messages: [proto.WebMessageInfo.fromObject(messages)],
            type: 'append'
        };
        conn.ev.emit('messages.upsert', msg);
    };
    return m;
};

async function writeExifImage(media, metadata) {
    let wMedia = await imageToWebp(media);
    const tmpFileIn = path.join(tmpdir(), `${crypto.randomBytes(6).readUIntLE(0, 6).toString(36)}.webp`);
    const tmpFileOut = path.join(tmpdir(), `${crypto.randomBytes(6).readUIntLE(0, 6).toString(36)}.webp`);
    fs.writeFileSync(tmpFileIn, wMedia);
    if (metadata.packname || metadata.author) {
        const img = new webp.Image();
        const json = {
            "sticker-pack-name": metadata.packname,
            "sticker-pack-publisher": metadata.author,
            "emojis": metadata.categories ? metadata.categories : [""]
        };
        const exifAttr = Buffer.from([0x49, 0x49, 0x2A, 0x00, 0x08, 0x00, 0x00, 0x00, 0x01, 0x00, 0x41, 0x57, 0x07, 0x00, 0x00, 0x00, 0x00, 0x00, 0x16, 0x00, 0x00, 0x00]);
        const jsonBuff = Buffer.from(JSON.stringify(json), "utf-8");
        const exif = Buffer.concat([exifAttr, jsonBuff]);
        exif.writeUIntLE(jsonBuff.length, 14, 4);
        await img.load(tmpFileIn);
        fs.unlinkSync(tmpFileIn);
        img.exif = exif;
        await img.save(tmpFileOut);
        return tmpFileOut;
    };
};

async function writeExifVideo(media, metadata) {
    let wMedia = await videoToWebp(media);
    const tmpFileIn = path.join(tmpdir(), `${crypto.randomBytes(6).readUIntLE(0, 6).toString(36)}.webp`);
    const tmpFileOut = path.join(tmpdir(), `${crypto.randomBytes(6).readUIntLE(0, 6).toString(36)}.webp`);
    fs.writeFileSync(tmpFileIn, wMedia);
    if (metadata.packname || metadata.author) {
        const img = new webp.Image();
        const json = {
            "sticker-pack-name": metadata.packname,
            "sticker-pack-publisher": metadata.author,
            "emojis": metadata.categories ? metadata.categories : [""]
        };
        const exifAttr = Buffer.from([0x49, 0x49, 0x2A, 0x00, 0x08, 0x00, 0x00, 0x00, 0x01, 0x00, 0x41, 0x57, 0x07, 0x00, 0x00, 0x00, 0x00, 0x00, 0x16, 0x00, 0x00, 0x00]);
        const jsonBuff = Buffer.from(JSON.stringify(json), "utf-8");
        const exif = Buffer.concat([exifAttr, jsonBuff]);
        exif.writeUIntLE(jsonBuff.length, 14, 4);
        await img.load(tmpFileIn);
        fs.unlinkSync(tmpFileIn);
        img.exif = exif;
        await img.save(tmpFileOut);
        return tmpFileOut;
    };
};

async function imageToWebp(media) {
    const tmpFileOut = path.join(tmpdir(), `${crypto.randomBytes(6).readUIntLE(0, 6).toString(36)}.webp`);
    const tmpFileIn = path.join(tmpdir(), `${crypto.randomBytes(6).readUIntLE(0, 6).toString(36)}.jpg`);

    fs.writeFileSync(tmpFileIn, media);

    await new Promise((resolve, reject) => {
        ff(tmpFileIn)
            .on("error", reject)
            .on("end", () => resolve(true))
            .addOutputOptions([
                "-vcodec",
                "libwebp",
                "-vf",
                "scale='min(640,iw)':min'(640,ih)':force_original_aspect_ratio=decrease,fps=24,pad=640:640:-1:-1:color=white@0.0,split [a][b]; [a] palettegen=reserve_transparent=on:transparency_color=ffffff [p]; [b][p] paletteuse"
            ])
            .toFormat("webp")
            .save(tmpFileOut)
    });

    const buff = fs.readFileSync(tmpFileOut);
    fs.unlinkSync(tmpFileOut);
    fs.unlinkSync(tmpFileIn);
    return buff;
};

async function videoToWebp(media) {
    const tmpFileOut = path.join(tmpdir(), `${crypto.randomBytes(6).readUIntLE(0, 6).toString(36)}.webp`);
    const tmpFileIn = path.join(tmpdir(), `${crypto.randomBytes(6).readUIntLE(0, 6).toString(36)}.mp4`);

    fs.writeFileSync(tmpFileIn, media);

    await new Promise((resolve, reject) => {
        ff(tmpFileIn)
            .on("error", reject)
            .on("end", () => resolve(true))
            .addOutputOptions([
                "-vcodec",
                "libwebp",
                "-vf",
                "scale='min(640,iw)':min'(640,ih)':force_original_aspect_ratio=decrease,fps=24,pad=640:640:-1:-1:color=white@0.0,split [a][b]; [a] palettegen=reserve_transparent=on:transparency_color=ffffff [p]; [b][p] paletteuse",
                "-loop",
                "0",
                "-ss",
                "00:00:00",
                "-t",
                "00:00:10",
                "-preset",
                "default",
                "-an",
                "-vsync",
                "0"
            ])
            .toFormat("webp")
            .save(tmpFileOut)
    });

    const buff = fs.readFileSync(tmpFileOut);
    fs.unlinkSync(tmpFileOut);
    fs.unlinkSync(tmpFileIn);
    return buff;
};

async function webpToImage(source) {
    const isUrl = typeof source === 'string' && urlRegex.test(source);

    try {
        return await convert({
            type: 'webp-png',
            ...(isUrl ? {
                url: source
            } : {
                file: new Blob([source]),
                filename: randomBytes + "." + (await fromBuffer(source)).ext
            })
        });
    } catch (pngError) {
        console.error("Error converting to webp-png. Trying webp-jpg.");

        try {
            return await convert({
                type: 'webp-jpg',
                ...(isUrl ? {
                    url: source
                } : {
                    file: new Blob([source]),
                    filename: randomBytes + "." + (await fromBuffer(source)).ext
                })
            });
        } catch (jpgError) {
            console.error("Error converting to webp-jpg. All fallback types failed.");
            throw jpgError;
        }
    }
};

async function webpToVideo(source) {
    const isUrl = typeof source === 'string' && urlRegex.test(source);

    try {
        return await convert({
            type: 'webp-mp4',
            ...(isUrl ? {
                url: source
            } : {
                file: new Blob([source]),
                filename: randomBytes + "." + (await fromBuffer(source)).ext
            })
        });
    } catch (error) {
        console.error("Error converting to webp-mp4. Trying fallback types.");

        try {
            return await convert({
                type: 'webp-avif',
                ...(isUrl ? {
                    url: source
                } : {
                    file: new Blob([source]),
                    filename: randomBytes + "." + (await fromBuffer(source)).ext
                })
            });
        } catch (avifError) {
            console.error("Error converting to webp-avif. Trying webp-gif.");

            try {
                return await convert({
                    type: 'webp-gif',
                    ...(isUrl ? {
                        url: source
                    } : {
                        file: new Blob([source]),
                        filename: randomBytes + "." + (await fromBuffer(source)).ext
                    })
                });
            } catch (gifError) {
                console.error("Error converting to webp-gif. All fallback types failed.");
                throw gifError;
            }
        }
    }
};

function imageUploader(Path) {
    return new Promise(async (resolve, reject) => {
        if (!fs.existsSync(Path)) return reject(new Error("File not Found"));
        try {
            const form = new BodyForm();
            form.append("file", fs.createReadStream(Path));
            const data = await axios({
                url: "https://telegra.ph/upload",
                method: "POST",
                headers: {
                    ...form.getHeaders()
                },
                data: form
            });
            return resolve("https://telegra.ph" + data.data[0].src);
        } catch (err) {
            return reject(new Error(String(err)));
        };
    });
};

function checkFileExists(folderPath, fileName) {
    const filePath = path.join(folderPath, fileName);
    return fs.existsSync(filePath);
};

function deleteFolder(name) {
    try {
        fs.rmdirSync(name, {
            recursive: true
        });
        console.log(`${name} folder has been deleted successfully!`);
    } catch (error) {
        console.error('Error deleting folder:', error);
    }
};

function deleteFile(filePath) {
    try {
        fs.unlinkSync(filePath);
        console.log(`${filePath} has been deleted successfully!`);
    } catch (error) {
        console.error('Error deleting file:', error);
    }
}

function addFolder(folderPath) {
    try {
        if (!fs.existsSync(folderPath)) {
            fs.mkdirSync(folderPath, {
                recursive: true
            });
            console.log(`${folderPath} folder has been created successfully!`);
        } else {
            console.log(`${folderPath} folder already exists.`);
        }
    } catch (error) {
        console.error('Error creating folder:', error);
    }
}

function addFile(filePath, content = '') {
    try {
        fs.writeFileSync(filePath, content);
        console.log(`${filePath} file has been created successfully!`);
    } catch (error) {
        console.error('Error creating file:', error);
    }
}

const generateRandomText = (length) => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let text = '';
    for (let i = 0; i < length; i++) {
        text += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return text;
}

function randomText(length) {
    return crypto.randomBytes(length).toString('hex');
};

const toRupiah = (angka) => {
    return angka.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

module.exports = {
    formatterMessage,
    writeExifImage,
    writeExifVideo,
    imageToWebp,
    videoToWebp,
    webpToImage,
    webpToVideo,
    imageUploader,
    checkFileExists,
    deleteFolder,
    deleteFile,
    addFolder,
    addFile,
    generateRandomText,
    randomText,
    toRupiah
};