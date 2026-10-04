function logInfo(message, extra) {
  if (extra) {
    console.log(new Date().toISOString(), "INFO", message, extra);
    return;
  }
  console.log(new Date().toISOString(), "INFO", message);
}

function logError(message, extra) {
  if (extra) {
    console.error(new Date().toISOString(), "ERROR", message, extra);
    return;
  }
  console.error(new Date().toISOString(), "ERROR", message);
}

module.exports = { logInfo, logError };
