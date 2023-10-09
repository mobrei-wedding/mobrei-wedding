function sendEmail() {
    // https://support.google.com/a/answer/2956491?sjid=14902451573699173167-EU
	Email.send({
	Host: "smtp.elasticemail.com",
    PORT: "2525",
	Username : "mobrei.wedding@gmail.com",
	Password : "7769F2AADB8EE88FC35B999978B83D094B26",
	To : 'mobrei.wedding@gmail.com',
	From : "mobrei.wedding@gmail.com",
	Subject : "Test",
	Body : "What huh?",
	}).then(
		message => console.log("message:", message)
	);
}