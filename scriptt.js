const express = require('express');
const bodyParser = require('body-parser');
const crypto = require('crypto');
const fs = require('fs');

const app = express();
app.use(bodyParser.json());

// إنشاء المفاتيح العامة والخاصة
const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: {
        type: 'spki',
        format: 'pem'
    },
    privateKeyEncoding: {
        type: 'pkcs8',
        format: 'pem'
    }
});

// حفظ المفاتيح في ملفات
fs.writeFileSync('publicKey.pem', publicKey);
fs.writeFileSync('privateKey.pem', privateKey);

// إرسال المفتاح العام إلى العميل
app.get('/getPublicKey', (req, res) => {
    res.json({
        kty: 'RSA',
        e: 'AQAB',
        n: Buffer.from(publicKey).toString('base64'),
    });
});

// استقبال البيانات المشفرة وفك تشفيرها
app.post('/signin', (req, res) => {
    const encryptedEmail = req.body.email;
    const encryptedPassword = req.body.password;

    const decryptedEmail = crypto.privateDecrypt(
        {
            key: privateKey,
            padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
            oaepHash: 'sha256'
        },
        Buffer.from(encryptedEmail)
    );

    const decryptedPassword = crypto.privateDecrypt(
        {
            key: privateKey,
            padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
            oaepHash: 'sha256'
        },
        Buffer.from(encryptedPassword)
    );

    console.log("Decrypted Email:", decryptedEmail.toString());
    console.log("Decrypted Password:", decryptedPassword.toString());

    // هنا يمكنك التحقق من صحة البريد الإلكتروني وكلمة المرور
    if (decryptedEmail.toString() === "test@example.com" && decryptedPassword.toString() === "password123") {
        res.json({ success: true });
    } else {
        res.json({ success: false });
    }
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
