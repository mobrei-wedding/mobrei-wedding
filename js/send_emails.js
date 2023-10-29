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
			Bcc : ["mobrei.wedding@gmail.com"],
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