const sgMail = require("@sendgrid/mail");

const SENDER_EMAIL = "konrad@guzek.uk"; // TODO: change to SUILO email address
const EMAIL_TEMPLATE_ID = "d-cd68b8c003d44d578b73fa5c849e4ff4";

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

function sendEventNotification(subject, recipient, user, event, time) {
  const msg = {
    to: recipient,
    from: SENDER_EMAIL,
    templateId: EMAIL_TEMPLATE_ID,
    dynamic_template_data: {
      subject,
      user,
      event,
      time,
    },
  };
  sgMail
    .send(msg)
    .then(() => {
      console.log("Event notification email sent to", recipient);
    })
    .catch((error) => {
      console.error(error);
    });
}

module.exports = { sendEventNotification };
