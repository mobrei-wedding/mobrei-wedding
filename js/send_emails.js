$(document).ready(function() { 
    emailjs.init('gt72hy3XqGNZiXC5e');
 });

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

function sendEmailJs(attachment, receiver){
	

	// emailjs.send('service_wkocoeq', 'template_p7cwsbo', {
	// 	content: attachment
	// });


	var data = {
		service_id: 'service_wkocoeq',
		template_id: 'template_p7cwsbo',
		user_id: 'gt72hy3XqGNZiXC5e',
		// content: attachment,
		template_params: {
			'receiver': receiver,
			'guestEmail': receiver,
			'g-recaptcha-response': '6Ld3bNsoAAAAAInnlwfrl8Lgx3W7_h33spa_Vk8H'
		}
	};

    $.ajax('https://api.emailjs.com/api/v1.0/email/send-form', {
        type: 'POST',
        data: data,
        contentType: false, // auto-detection
        processData: false // no need to parse formData to string
    }).done(function() {
        alert('Your mail is sent!');
    }).fail(function(error) {
        alert('Oops... ' + JSON.stringify(error));
    });

	

	// $.ajax('https://api.emailjs.com/api/v1.0/email/send', {
	// 	type: 'POST',
	// 	data: JSON.stringify(data),
	// 	contentType: 'application/json'
	// }).done(function() {
	// 	alert('Your mail is sent!');
	// }).fail(function(error) {
	// 	alert('Oops... ' + JSON.stringify(error));
	// });

	// emailjs.send('YOUR_SERVICE_ID', 'YOUR_TEMPLATE_ID', {
    //     content: base64
    // });
	
}

function sendEmail(attachment, receiver) {
	// https://support.google.com/a/answer/2956491?sjid=14902451573699173167-EU
	var subject = "【茂靈2539婚禮茶會】 " + receiver + "#購買明細";
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
		Body : `賓客您好，<br>茂靈2539婚禮茶會的籌備組已收到您的報名，附件為您的報名購買明細，主辦方與您各持有一份，此為系統自動寄信，不需回覆。<br><br>
		若成功報名且茶會確定舉行，主辦方將寄送<b>匯款通知信</b>，再請您留意信箱，感謝。<br>
		若當天有意願擔任小精靈的來賓也請留意信箱的社群加入通知，再次感謝您！
		<br>
		如有需要進行報名細項的修正，請聯絡籌備組官方信箱: <strong>mobrei.wedding@gmail.com</strong><br><br>
		《One And Only One》 茂靈婚禮茶會籌備組<br>`,
		Attachments : [
			{
				name : "MobRei Wedding " + receiver + "#details.pdf",
				data : attachment
		}]
		}).then(
			message => console.log("send email message:", message)
		);
	
	
	}
	async function asyncSendEmail(attachment, receiver){
		var subject = "【茂靈2539婚禮茶會】 " + receiver + "#購買明細";
		const message = await window.Email.send({
			SecureToken : "5068442f-89f8-4c1b-bed7-c3076623b7c0",
			Host: "smtp.elasticemail.com",
			PORT: "2525",
			Username : "mobrei.wedding@gmail.com",
			Password : "7769F2AADB8EE88FC35B999978B83D094B26",
			To : receiver,
			From : "mobrei.wedding@gmail.com",
			// Bcc : ["mobrei.wedding@gmail.com"],
			Subject : subject,
			Body : `賓客您好，<br>茂靈2539婚禮茶會的籌備組已收到您的報名，附件為您的報名購買明細，主辦方與您各持有一份，此信為系統自動寄信，不需回覆。<br><br>
			若成功報名且茶會確定舉行，主辦方將寄送匯款通知信，再請您留意信箱，感謝您。<br><br>
			<br>
			如有需要進行報名細項的修正，請聯絡籌備組官方信箱: <strong>mobrei.wedding@gmail.com</strong><br><br>
			《One And Only One》 茂靈婚禮茶會籌備組<br>`,
			Attachments : [
				{
					name : "MobRei Wedding " + receiver + "#details.pdf",
					data : attachment
			}]
		});
		return message;
		// if(message==="OK"){
		// }
	}
	function returnSendEmailPromise(attachment, receiver) {
		// https://support.google.com/a/answer/2956491?sjid=14902451573699173167-EU
		var subject = "【茂靈2539婚禮茶會】 " + receiver + "#購買明細";
		return Email.send({
			SecureToken : "5068442f-89f8-4c1b-bed7-c3076623b7c0",
			Host: "smtp.elasticemail.com",
			PORT: "2525",
			Username : "mobrei.wedding@gmail.com",
			Password : "7769F2AADB8EE88FC35B999978B83D094B26",
			To : receiver,
			From : "mobrei.wedding@gmail.com",
			// Bcc : ["mobrei.wedding@gmail.com"],
			Subject : subject,
			Body : `賓客您好，<br>茂靈2539婚禮茶會的籌備組已收到您的報名，附件為您的報名購買明細，主辦方與您各持有一份，此信為系統自動寄信，不需回覆。<br><br>
			若成功報名且茶會確定舉行，主辦方將寄送匯款通知信，再請您留意信箱，感謝您。<br><br>
			<br>
			如有需要進行報名細項的修正，請聯絡籌備組官方信箱: <strong>mobrei.wedding@gmail.com</strong><br><br>
			《One And Only One》 茂靈婚禮茶會籌備組<br>`,
			Attachments : [
				{
					name : "MobRei Wedding " + receiver + "#details.pdf",
					data : attachment
			}]
			}).then(
				message => console.log("send email message:", message)
			);
		}