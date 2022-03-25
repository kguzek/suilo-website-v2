const sgMail = require("@sendgrid/mail");
const { formatTime } = require("./common");

const SENDER_EMAIL = "konrad@guzek.uk"; // TODO: change to SUILO email address
const EMAIL_TEMPLATE_ID = "d-cd68b8c003d44d578b73fa5c849e4ff4";

// Determine if the API key environment variable is set
const ENABLED = !!process.env.SENDGRID_API_KEY;
ENABLED && sgMail.setApiKey(process.env.SENDGRID_API_KEY);

/** Sends an email notification to the given recipients about the given event
 *
 * @param {Object} recipients -- An object containing key-pair values of user email addresses and display names.
 * @param {Object} event -- An object containing the event `title` string and `startTime` array attributes.
 * @param {*} eventID -- The event unique ID string.
 */
function sendEventNotification(recipients, event, eventID) {
  if (!ENABLED) {
    return void console.warn(
      "Not sending email notification as the sendgrid API key environment variable is not set."
    );
  }
  const msg = {
    from: SENDER_EMAIL,
    templateId: EMAIL_TEMPLATE_ID,
    dynamic_template_data: {
      eventTitle: event.title,
      startTime: formatTime(event.startTime),
      eventID: eventID ?? event.id,
    },
    personalizations: Object.entries(recipients).map(([address, name]) => ({
      to: address,
      dynamic_template_data: {
        recipientName: name,
      },
    })),
  };
  sgMail
    .send(msg)
    .then(() => {
      console.info("Event notification email sent to", recipients);
    })
    .catch((error) => {
      console.error(error.toString());
    });
}

module.exports = { sendEventNotification };
