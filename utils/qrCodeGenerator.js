const qr = require("qrcode");
const fs = require("fs");

const dataToEncode = "http://192.168.0.200:3000";

const options = {
  errorCorrectionLevel: "H",
  type: "image/png",
  quality: 0.92,
  margin: 1,
};

qr.toFile("qrcode.png", dataToEncode, options, (err) => {
  if (err) throw err;
  console.log("QR code generated!");
});
