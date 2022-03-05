const prebuiltTestEntryPoint = require("../dist/handlers").testEntrypoint;
const prebuiltEntryPoint = require("../dist/handlers").entrypoint;
const model = require("../dist/models").ResourceModel;

async function handler(event, context) {
  const enrichedEvent = {
    ...event,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      sessionToken: process.env.AWS_SESSION_TOKEN,
    },
  };
  console.log("passing event", enrichedEvent);
  return prebuiltTestEntryPoint(enrichedEvent, context);
}

exports.default = handler;
