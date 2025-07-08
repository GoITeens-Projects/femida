async function fetchAllMessages(channel) {
  let messages = [];
  let lastId;
  while (true) {
    const options = { limit: 100 };
    if (lastId) options.before = lastId;
    const fetched = await channel.messages.fetch(options);
    if (fetched.size === 0) break;
    messages = messages.concat(Array.from(fetched.values()));
    lastId = fetched.last().id;
  }
  return messages;
}

module.exports = fetchAllMessages;
