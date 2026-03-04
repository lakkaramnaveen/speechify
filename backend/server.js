const { app } = require("./src/app");
const { config } = require("./src/config/env");

const port = config.port;

app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`SpeechifyClone backend listening on http://localhost:${port}`);
});

