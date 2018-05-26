pdf.create(html, options).toFile(function(err, result) {
    if (err) {
      console.log(err);
      res.status(200).send("Error", err);
      return;
    }
    else {
      // var transporter = nodemailer.createTransport({
      //     host: 'smtp.gmail.com',
      //     port: 465,
      //     secure: true, // use SSL
      //     auth: {
      //         user: '***REMOVED***',
      //         pass: '***REMOVED***'
      //     }
      // });
      // var mailOptions = {
      //     from: '***REMOVED***', // sender address (who sends)
      //     to: 'dummymitclub@gmail.com', // list of receivers (who receives)
      //     subject: 'Event Booking Receipt', // Subject line
      //     text: 'Please find attached your receipt', // plaintext body
      //     html: 'Hey! <strong>PFA</strong> your receipt', // html body
      //     attachments: [
      //       {   // utf-8 string as an attachment
      //           filename: 'receipt.pdf',
      //           path: './receipt.pdf'
      //       }
      //     ]
      // };

      // // send mail with defined transport object
      // transporter.sendMail(mailOptions, function(error, info){
      //     if(error){
      //         return console.log(error);
      //         res.status(302).send(error);
      //     }
      //     console.log('Message sent: ' + info.response);
      //     res.status(200).send(info.response);
      // });
      // console.log(res);