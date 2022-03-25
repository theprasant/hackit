const express = require('express');
const crypto = require('crypto');

const app = express();

const PORT = process.env.PORT || 3000;
const digits = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
let otpsObj = {};

app.get('/', (req, res) => {
  res.send('Hello World!');
})

app.get('/otplen/:id', (req, res) => {
  const id = req.params.id;
  if (!otpsObj[id]) {
    return res.status(404).send('No OTP found with this id');
  }
  let otpLen = otpsObj[id].len;
  res.json({ id: id, len: otpLen });
})

app.post('/newotp', (req, res) => {
  let otpId = crypto.randomBytes(10).toString('hex');
  // let otp = Math.floor(Math.random() * 90000) + 10000;
  let otpLen = req.query.len || 4;
  let otp = generateOTP(otpLen);
  otpsObj[otpId] = { len: otpLen, otp, attempts: 0, verified: false };
  console.log(otpsObj)
  res.json({ msg: `New OTP created with id: ${otpId}, otp length: ${otpsObj[otpId].len}.\nNow you can verify at /verify/${otpId}?otp=YourOTP`, id: otpId, len: otpsObj[otpId].len, attempts: otpsObj[otpId].attempts });
})

app.post('/verify/:id', (req, res) => {
  let otpId = req.params.id;
  let otp = req.query.otp;

  if (!otpsObj[otpId]) {
    res.status(404).send('There is no OTP with this id');
  }
  otpsObj[otpId].attempts++;

  if (otpsObj[otpId] && otpsObj[otpId].otp == otp) {
    if (!otpsObj[otpId].verified) {
      otpsObj[otpId].verifiedInAttempts = otpsObj[otpId].attempts;
    }
    otpsObj[otpId].verified = true;
    res.status(200).json({ msg: `OTP verified successfully.`, otpId, yourAttemptedOtp: otp, attempts: otpsObj[otpId].attempts, verifiedInAttempts: otpsObj[otpId].verifiedInAttempts });
  } else {
    res.status(400).json({ msg: `Wrong OTP`, otpId, yourAttemptedOtp: otp, attempts: otpsObj[otpId].attempts });
  }
})

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
})

function generateOTP(len) {
  let otp = '';
  for (let i = 0; i < len; i++) {
    otp += digits[Math.floor(Math.random() * 10)];
  }
  if (otp.startsWith('0')) {
    return generateOTP(len);
  }
  return otp;
}