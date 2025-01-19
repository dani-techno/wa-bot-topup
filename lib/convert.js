/**
* Made by: Dani Technology (Full Stack Engineer)
* Created on: August 6, 2024
* Contact developer:
* - WhatsApp: +62 838-3499-4479 or +62 823-2066-7363
* - Email: dani.technology.id@gmail.com
* - GitHub: https://github.com/dani-techno
*/

module.exports = async (fields) => {
    const linksConvert = {
        "video-gif": {
            "url": "https://ezgif.com/video-to-gif",
            "params": {
                "start": 0,
                "end": 10,
                "size": "original",
                "fps": 10,
                "method": "ffmpeg"
            },
            "req_params": [],
            "split": {
                "start": "<img src=\"",
                "end": "\" style=\"width:"
            },
            "either_params": []
        },
        "gif-mp4": {
            "url": "https://ezgif.com/gif-to-mp4",
            "params": {
                "convert": "Convert GIF to MP4!"
            },
            "req_params": [],
            "split": {
                "start": "\" controls><source src=\"",
                "end": "\" type=\"video/mp4\">Your browser"
            },
            "either_params": []
        },
        "video-jpg": {
            "url": "https://ezgif.com/video-to-jpg",
            "params": {
                "start": 0,
                "end": 10,
                "size": "original",
                "fps": 10
            },
            "req_params": [],
            "split": {
                "start": "\"small button danger\" href=\"",
                "end": "\">Download frames as ZIP"
            },
            "either_params": []
        },
        "video-png": {
            "url": "https://ezgif.com/video-to-png",
            "params": {
                "start": 0,
                "end": 10,
                "size": "original",
                "fps": 10
            },
            "req_params": [],
            "split": {
                "start": "\"small button danger\" href=\"",
                "end": "\">Download frames as ZIP"
            },
            "either_params": []
        },
        "gif-png": {
            "url": "https://ezgif.com/split",
            "params": {
                "method": "im"
            },
            "req_params": [],
            "split": {
                "start": "\"small button danger\" href=\"",
                "end": "\">Download frames as ZIP"
            },
            "either_params": []
        },
        "gif-sprite": {
            "url": "https://ezgif.com/gif-to-sprite",
            "params": {},
            "req_params": [
                "format"
            ],
            "split": {
                "start": "<img src=\"",
                "end": "\" style=\"width:"
            },
            "either_params": ["horizontally", "vertically", "custom"]
        },
        "sprite-imgage": {
            "url": "https://ezgif.com/sprite-cutter",
            "params": {},
            "req_params": ["format"],
            "split": {
                "start": "\"small button danger\" href=\"",
                "end": "\">Download frames as ZIP"
            },
            "either_params": ["by-grid", "by-size"]
        },
        "sprite-img": {
            "url": "https://ezgif.com/sprite-cutter",
            "params": {},
            "req_params": ["format"],
            "split": {
                "start": "\"small button danger\" href=\"",
                "end": "\">Download frames as ZIP"
            },
            "either_params": ["by-grid", "by-size"]
        },
        "bmp-jpg": {
            "url": "https://ezgif.com/bmp-to-jpg",
            "params": {
                "format": "jpg"
            },
            "req_params": [],
            "split": {
                "start": "<img src=\"",
                "end": "\" style=\"width:"
            },
            "either_params": []
        },
        "bmp-png": {
            "url": "https://ezgif.com/bmp-to-jpg",
            "params": {
                "format": "png"
            },
            "req_params": [],
            "split": {
                "start": "<img src=\"",
                "end": "\" style=\"width:"
            },
            "either_params": []
        },
        "bmp-gif": {
            "url": "https://ezgif.com/bmp-to-jpg",
            "params": {
                "format": "gif"
            },
            "req_params": [],
            "split": {
                "start": "<img src=\"",
                "end": "\" style=\"width:"
            },
            "either_params": []
        },
        "png-jpg": {
            "url": "https://ezgif.com/png-to-jpg",
            "params": {
                "format": "jpg",
                "percentage": 85,
                "background": "#ffffff"
            },
            "req_params": [],
            "split": {
                "start": "<img src=\"",
                "end": "\" style=\"width:"
            },
            "either_params": []
        },
        "png-gif": {
            "url": "https://ezgif.com/png-to-jpg",
            "params": {
                "format": "gif",
                "percentage": 85,
                "background": "#ffffff"
            },
            "req_params": [],
            "split": {
                "start": "<img src=\"",
                "end": "\" style=\"width:"
            },
            "either_params": []
        },
        "png-bmp": {
            "url": "https://ezgif.com/png-to-jpg",
            "params": {
                "format": "bmp",
                "percentage": 85,
                "background": "#ffffff"
            },
            "req_params": [],
            "split": {
                "start": "<img src=\"",
                "end": "\" style=\"width:"
            },
            "either_params": []
        },
        "gif-jpg": {
            "url": "https://ezgif.com/gif-to-jpg",
            "params": {
                "background": "#ffffff"
            },
            "req_params": [],
            "split": {
                "start": "\"small button danger\" href=\"",
                "end": "\">Download all files as ZIP archive"
            },
            "either_params": []
        },
        "svg-png": {
            "url": "https://ezgif.com/svg-to-png",
            "params": {
                "currentcolor": "#000000"
            },
            "req_params": [],
            "split": {
                "start": "<img src=\"",
                "end": "\" style=\"width:"
            },
            "either_params": []
        },
        "svg-jpg": {
            "url": "https://ezgif.com/svg-to-jpg",
            "params": {
                "percentage": 85,
                "background": "#ffffff",
                "currentcolor": "#000000"
            },
            "req_params": [],
            "split": {
                "start": "<img src=\"",
                "end": "\" style=\"width:"
            },
            "either_params": []
        },
        "apng-gif": {
            "url": "https://ezgif.com/apng-to-gif",
            "params": {},
            "req_params": [],
            "split": {
                "start": "<img src=\"",
                "end": "\" style=\"width:"
            },
            "either_params": []
        },
        "apng-webp": {
            "url": "https://ezgif.com/apng-to-webp",
            "params": {},
            "req_params": [],
            "split": {
                "start": "<img src=\"",
                "end": "\" style=\"width:"
            },
            "either_params": []
        },
        "apng-mp4": {
            "url": "https://ezgif.com/apng-to-mp4",
            "params": {},
            "req_params": [],
            "split": {
                "start": "<source src=\"",
                "end": "\" type=\"video/mp4\">"
            },
            "either_params": []
        },
        "mng-apng": {
            "url": "https://ezgif.com/mng-to-apng",
            "params": {},
            "req_params": [],
            "split": {
                "start": "<img src=\"",
                "end": "\" style=\"width:"
            },
            "either_params": []
        },
        "video-apng": {
            "url": "https://ezgif.com/video-to-apng",
            "params": {
                "start": 0,
                "end": 10,
                "size": "original",
                "fps": 10,
                "method": "ffmpeg"
            },
            "req_params": [],
            "split": {
                "start": "<img src=\"",
                "end": "\" style=\"width:"
            },
            "either_params": []
        },
        "gif-apng": {
            "url": "https://ezgif.com/gif-to-apng",
            "params": {},
            "req_params": [],
            "split": {
                "start": "<img src=\"",
                "end": "\" style=\"width:"
            },
            "either_params": []
        },
        "video-webp": {
            "url": "https://ezgif.com/video-to-webp",
            "params": {
                "start": 0,
                "end": 10,
                "size": "original",
                "fps": 10,
                "loop": "on"
            },
            "req_params": [],
            "split": {
                "start": "<img src=\"",
                "end": "\" style=\"width:"
            },
            "either_params": []
        },
        "gif-webp": {
            "url": "https://ezgif.com/gif-to-webp",
            "params": {},
            "req_params": [],
            "split": {
                "start": "<img src=\"",
                "end": "\" style=\"width:"
            },
            "either_params": []
        },
        "jpg-webp": {
            "url": "https://ezgif.com/jpg-to-webp",
            "params": {},
            "req_params": [],
            "split": {
                "start": "<img src=\"",
                "end": "\" style=\"width:"
            },
            "either_params": []
        },
        "png-webp": {
            "url": "https://ezgif.com/png-to-webp",
            "params": {},
            "req_params": [],
            "split": {
                "start": "<img src=\"",
                "end": "\" style=\"width:"
            },
            "either_params": []
        },
        "webp-gif": {
            "url": "https://ezgif.com/webp-to-gif",
            "params": {},
            "req_params": [],
            "split": {
                "start": "<img src=\"",
                "end": "\" style=\"width:"
            },
            "either_params": []
        },
        "webp-jpg": {
            "url": "https://ezgif.com/webp-to-jpg",
            "params": {},
            "req_params": [],
            "split": {
                "start": "\"small button danger\" href=\"",
                "end": "\">Download all files as ZIP archive"
            },
            "either_params": []
        },
        "webp-png": {
            "url": "https://ezgif.com/webp-to-png",
            "params": {},
            "req_params": [],
            "split": {
                "start": "<img src=\"",
                "end": "\" style=\"width:"
            },
            "either_params": []
        },
        "webp-mp4": {
            "url": "https://ezgif.com/webp-to-mp4",
            "params": {},
            "req_params": [],
            "split": {
                "start": "\" controls><source src=\"",
                "end": "\" type=\"video/mp4\">Your browser"
            },
            "either_params": []
        },
        "video-avif": {
            "url": "https://ezgif.com/video-to-avif",
            "params": {
                "start": 0,
                "end": 10,
                "size": "original",
                "fps": 10
            },
            "req_params": [],
            "split": {
                "start": "<img src=\"",
                "end": "\" style=\"width:"
            },
            "either_params": []
        },
        "gif-avif": {
            "url": "https://ezgif.com/gif-to-avif",
            "params": {},
            "req_params": [],
            "split": {
                "start": "<img src=\"",
                "end": "\" style=\"width:"
            },
            "either_params": []
        },
        "apng-avif": {
            "url": "https://ezgif.com/apng-to-avif",
            "params": {},
            "req_params": [],
            "split": {
                "start": "<img src=\"",
                "end": "\" style=\"width:"
            },
            "either_params": []
        },
        "webp-avif": {
            "url": "https://ezgif.com/webp-to-avif",
            "params": {},
            "req_params": [],
            "split": {
                "start": "<img src=\"",
                "end": "\" style=\"width:"
            },
            "either_params": []
        },
        "jpg-avif": {
            "url": "https://ezgif.com/jpg-to-avif",
            "params": {},
            "req_params": [],
            "split": {
                "start": "<img src=\"",
                "end": "\" style=\"width:"
            },
            "either_params": []
        },
        "avif-gif": {
            "url": "https://ezgif.com/avif-to-gif",
            "params": {},
            "req_params": [],
            "split": {
                "start": "<img src=\"",
                "end": "\" style=\"width:"
            },
            "either_params": []
        },
        "avif-jpg": {
            "url": "https://ezgif.com/avif-to-jpg",
            "params": {
                "percentage": 85,
                "background": "#ffffff"
            },
            "req_params": [],
            "split": {
                "start": "<img src=\"",
                "end": "\" style=\"width:"
            },
            "either_params": []
        },
        "avif-png": {
            "url": "https://ezgif.com/avif-to-png",
            "params": {},
            "req_params": [],
            "split": {
                "start": "<img src=\"",
                "end": "\" style=\"width:"
            },
            "either_params": []
        }
    };

    if (typeof fields === 'string' && fields?.toLowerCase() === 'list') return Object.keys(linksConvert);

    let type = linksConvert?.[fields?.type];
    if (!type) throw new Error(`Invalid conversion type "${fields?.type}"`);
    let form = new FormData();

    if (fields?.file) {
        if (!fields.filename) throw new Error(`filename must be provided to upload files.(with extension)`);
        form.append('new-image', fields.file, {
            filename: fields.filename,
        });
    } else if (fields?.url) {
        form.append('new-image-url', fields.url);
    } else throw new Error('Either file or url field is required.');

    delete fields.type;
    delete fields.file;
    delete fields.filename;
    delete fields.url;

    let org_keys = Object.keys(fields);
    if (type.req_params) {
        type.req_params.forEach(e => {
            if (!org_keys.includes(e)) throw new Error(`"${e}" is a required param.`);
        });
    }
    if (type.either_params.length) {
        let check = false;
        type.either_params.forEach(e => {
            if (org_keys.includes(e)) check = true;
        });
        if (!check) throw new Error(`Either one of these params has to be provided: ${type.either_params.join(', ')}`);
    }

    let link = await axios({
        method: 'post',
        url: type.url,
        headers: {
            'Content-Type': 'multipart/form-data',
        },
        data: form,
    }).catch(function(error) {
        if (error.response) {
            throw new Error(
                JSON.stringify({
                        statusCode: error.response.status,
                        data: error.response.data.length ? error.response.data : "Try again. If it continues, report to the creator.",
                    },
                    null,
                    4
                )
            );
        } else {
            throw new Error("Oops, something unknown happened! :(");
        }
    });

    let redir = String(link?.request?.res?.responseUrl);
    if (!redir) throw new Error(`Oops! Something unknown happened!`);
    let id = redir.split('/')[redir.split('/').length - 1];
    type.params.file = id;

    let image = await axios({
        method: 'post',
        url: `${redir}?ajax=true`,
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        data: new URLSearchParams({
            ...type.params,
            ...fields,
        }),
    }).catch(function(error) {
        if (error.response) {
            throw new Error(
                JSON.stringify({
                        statusCode: error.response.status,
                        data: error.response.data.length ? error.response.data : "Try again. If it continues, report to the creator.",
                    },
                    null,
                    4
                )
            );
        } else {
            throw new Error("Oops, something unknown happened! :(");
        }
    });

    let img_url = `https:${(image?.data?.toString()?.split(type.split.start)?.[1]?.split(type.split.end)?.[0])?.replace('https:', '')}`;
    if (img_url.includes('undefined')) throw new Error(`Something unknown happened here... please report to the creator`);
    return img_url;
};