// function sendEmail() {
    
// 	Email.send({
// 	Host: "smtp.elasticemail.com",
//     PORT: "2525",
// 	Username : "mobrei.wedding@gmail.com",
// 	Password : "7769F2AADB8EE88FC35B999978B83D094B26",
// 	To : 'mobrei.wedding@gmail.com',
// 	From : "mobrei.wedding@gmail.com",
// 	Subject : "Test",
// 	Body : "What huh?",
// 	}).then(
// 		message => console.log("message:", message)
// 	);
// }

function sendEmail(attachment, receiver) {
	// https://support.google.com/a/answer/2956491?sjid=14902451573699173167-EU
	var subject = "Report #" + receiver;
	Email.send({
		SecureToken : "5068442f-89f8-4c1b-bed7-c3076623b7c0",
		Host: "smtp.elasticemail.com",
		PORT: "2525",
		Username : "mobrei.wedding@gmail.com",
		Password : "7769F2AADB8EE88FC35B999978B83D094B26",
		To : receiver,
		From : "mobrei.wedding@gmail.com",
		Bcc : ["mobrei.wedding@gmail.com"],
		Subject : subject,
		Body : `賓客您好，茂靈2539婚禮茶會的籌備組已收到您的報名，附件為您的報名購買明細，主辦方與您各持有一份，此信為系統自動寄信，不需回覆。<br>
		若茶會確定進行，主辦方將寄送匯款通知信，敬請留意信箱，感謝您。<br><br>
		<br>
		如有需要進行修正，請聯絡籌備組官方帳號: <strong>mobrei.wedding@gmail.com</strong><br><br>
		《One And Only One》 茂靈婚禮茶會籌備組<br>`,
		Attachments : [
			{
				name : "test.pdf",
				data : attachment
		}]
		}).then(
			message => console.log("message:", message)
		);
	
	
	}