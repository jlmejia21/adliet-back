import * as nodemailer from 'nodemailer';

export const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true, // true for 465, false for other ports
  auth: {
    user: '=', // generated ethereal user
    pass: '=', // generated ethereal password
  },
});

transporter.verify().then(() => {
  console.log('Ready for send email');
});
