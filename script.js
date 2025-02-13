document.getElementById('qr-form').addEventListener('submit', function(event) {
    event.preventDefault();

    const qris = document.getElementById('qris').value.trim();
    const deskripsi = document.getElementById('deskripsi').value.trim();
    const nominal = document.getElementById('nominal').value.trim();

    const errorDiv = document.getElementById('error');
    errorDiv.textContent = '';

    if (!qris || !nominal || isNaN(nominal)) {
        errorDiv.textContent = 'QRIS dan nominal harus diisi dengan benar!';
        return;
    }

    // Proses QRIS dinamis
    let qrisProcessed = qris.slice(0, -4);
    qrisProcessed = qrisProcessed.replace("010211", "010212");
    const step2 = qrisProcessed.split("5802ID");

    const uang = `54${nominal.length.toString().padStart(2, '0')}${nominal}5802ID`;
    const fix = `${step2[0]}${uang}${step2[1]}`;
    const crc = convertCRC16(fix);
    const final = `${fix}${crc}`;

    // Generate QR Code
    const qr = qrcode(0, 'L');
    qr.addData(final);
    qr.make();

    // Create QR Code Image
    const qrCodeImage = qr.createImgTag(10, 4);
    const qrCodeContainer = document.getElementById('qr-code');
    qrCodeContainer.innerHTML = qrCodeImage;

    // Add Text Below QR Code
    const qrCodeImg = qrCodeContainer.querySelector('img');
    const qrWidth = qrCodeImg.width;
    const margin = 20;
    const fontSize = 30;

    const canvas = document.createElement('canvas');
    canvas.width = qrWidth;
    canvas.height = qrCodeImg.height + margin + (fontSize * 2);
    const ctx = canvas.getContext('2d');

    ctx.drawImage(qrCodeImg, 0, 0);

    ctx.font = `${fontSize}px Arial`;
    ctx.fillStyle = 'black';
    ctx.textAlign = 'center';

    const textDeskripsi = deskripsi || "QRIS Dinamis";
    const textNominal = `Nominal: Rp ${parseInt(nominal).toLocaleString()}`;

    const textWidthDesc = ctx.measureText(textDeskripsi).width;
    const textWidthNom = ctx.measureText(textNominal).width;

    const textHeight = fontSize + 10;
    const textYDesc = qrCodeImg.height + margin;
    const textYNom = textYDesc + textHeight;

    ctx.fillText(textDeskripsi, qrWidth / 2, textYDesc);
    ctx.fillText(textNominal, qrWidth / 2, textYNom);

    qrCodeContainer.innerHTML = '';
    qrCodeContainer.appendChild(canvas);
});

function convertCRC16(data) {
    let crc = 0xFFFF;
    for (let i = 0; i < data.length; i++) {
        crc ^= data.charCodeAt(i) << 8;
        for (let j = 0; j < 8; j++) {
            if (crc & 0x8000) {
                crc = (crc << 1) ^ 0x1021;
            } else {
                crc = crc << 1;
            }
            crc &= 0xFFFF; // Pastikan tetap 16-bit
        }
    }
    return crc.toString(16).toUpperCase().padStart(4, '0');
}
