'use strict';

const {S3Client, PutObjectCommand} = require("@aws-sdk/client-s3");
const s3Client = new S3Client({region: "eu-west-3"});
const {v4: uuidv4} = require('uuid');
const {registerFont, createCanvas} = require('canvas');
registerFont('bouygues_speak.otf', {family: 'Bouygues Speak'})
const canvas = createCanvas(768, 768);
const context = canvas.getContext('2d');

const centerX = canvas.width / 2; // Canvas central point X-axis coordinates
const centerY = canvas.height / 2;// Canvas center point y axis coordinates

function formatBytes(bytes, decimals) {
    if (bytes === 0) {
        return {text: '0 octets', speech: 'zero'};
    } else {
        const k = 1024,
            dm = decimals || 2,
            sizes = ['octets', 'Ko', 'Mo', 'Go', 'To', 'Po', 'Eo', 'Zo', 'Yo'],
            speechSizes = ['octets', 'Kilo octets', 'Mega octets', 'Giga octets', 'Tera octets', 'Péta octets', 'Exa octets', 'Zetta octets', 'Yotta octets'],
            i = Math.floor(Math.log(bytes) / Math.log(k));
        const sizeInUnit = (bytes / Math.pow(k, i)).toLocaleString('fr', {maximumFractionDigits: dm});
        return {
            text: sizeInUnit + ' ' + sizes[i],
            speech: sizeInUnit.replace('.', ',') + ' ' + speechSizes[i]
        };
    }
}

const uploadFile = (filename, fileContent) => {
    const input = {
        Bucket: 'consodata',
        Key: filename,
        Body: fileContent,
        ContentType: 'image/png'
    };
    return s3Client.send(new PutObjectCommand(input)).then((data) => {
        console.log(`${filename} uploaded`);
        return data;
    });
};

function consoImage(usage, total) {
    context.save();
    context.fillStyle = 'white';
    context.fillRect(0, 0, canvas.width, canvas.height);

    context.beginPath();
    context.strokeStyle = "#e2e2e2";
    context.lineWidth = 30;
    context.arc(centerX, centerY, canvas.width * 3 / 8, -Math.PI / 2, Math.PI * 2, false);
    context.stroke();
    context.closePath();

    context.beginPath();
    context.strokeStyle = "#009dcc";
    context.lineWidth = 30;
    context.arc(centerX, centerY, canvas.width * 3 / 8, -Math.PI / 2, (Math.PI * usage * 2 / total) - (Math.PI / 2), false);
    context.stroke();
    context.closePath();

    context.fillStyle = "#000000";
    context.font = '80px "Bouygues Speak"';
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillText(formatBytes(usage, 2).text.replace('o', '\u00F0'), centerX, centerY - 70);
    context.fillText('sur', centerX, centerY);
    context.fillText(formatBytes(total, 2).text.replace('o', '\u00F0'), centerX, centerY + 80);
    context.restore();

    const filename = uuidv4() + '.png';

    // const fs = require('fs');
    // const out = fs.createWriteStream(__dirname + '/' + filename);
    // const stream = canvas.createPNGStream();
    // stream.pipe(out);
    // out.on('finish', () =>  console.log('The PNG file was created.'));

    uploadFile(filename, canvas.toBuffer());

    return filename;
}

module.exports = {
    consoImage: consoImage,
    formatBytes: formatBytes
};

//consoImage(100 * 1024 * 1024 * 1024, 200 * 1024 * 1024 * 1024);