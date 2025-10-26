const fs = require('fs');
const path = require('path');

/**
 * Generate a text transcript of the ticket conversation
 */
async function generateTranscript(channel, ticketInfo, closedBy) {
  try {
    const transcriptDir = path.join(__dirname, '..', 'transcripts');
    if (!fs.existsSync(transcriptDir)) {
      fs.mkdirSync(transcriptDir);
    }

    // Fetch all messages
    let messages = [];
    let lastId;

    while (true) {
      const options = { limit: 100 };
      if (lastId) {
        options.before = lastId;
      }

      const fetchedMessages = await channel.messages.fetch(options);
      if (fetchedMessages.size === 0) break;

      messages.push(...fetchedMessages.values());
      lastId = fetchedMessages.last().id;

      if (fetchedMessages.size < 100) break;
    }

    // Sort messages by timestamp (oldest first)
    messages = messages.sort((a, b) => a.createdTimestamp - b.createdTimestamp);

    // Build transcript
    let transcript = '';
    transcript += `═══════════════════════════════════════════════════════════\n`;
    transcript += `                 TICKET TRANSCRIPT\n`;
    transcript += `═══════════════════════════════════════════════════════════\n\n`;
    transcript += `Ticket Number: #${ticketInfo.ticketNumber}\n`;
    transcript += `Category: ${ticketInfo.category}\n`;
    transcript += `Created: ${new Date(ticketInfo.createdAt).toLocaleString()}\n`;
    transcript += `Closed By: ${closedBy.tag} (${closedBy.id})\n`;
    transcript += `Closed: ${new Date().toLocaleString()}\n`;
    transcript += `Total Messages: ${messages.length}\n\n`;
    transcript += `═══════════════════════════════════════════════════════════\n\n`;

    for (const message of messages) {
      const timestamp = message.createdAt.toLocaleString();
      const author = message.author.tag;
      const content = message.content || '[No text content]';

      transcript += `[${timestamp}] ${author}:\n`;
      transcript += `${content}\n`;

      // Add attachment info
      if (message.attachments.size > 0) {
        transcript += `📎 Attachments:\n`;
        message.attachments.forEach(attachment => {
          transcript += `  - ${attachment.name} (${attachment.url})\n`;
        });
      }

      // Add embed info
      if (message.embeds.length > 0) {
        transcript += `📋 Embeds: ${message.embeds.length}\n`;
      }

      transcript += `\n`;
    }

    transcript += `═══════════════════════════════════════════════════════════\n`;
    transcript += `                   END OF TRANSCRIPT\n`;
    transcript += `═══════════════════════════════════════════════════════════\n`;

    // Save transcript
    const filename = `ticket-${ticketInfo.ticketNumber}-${Date.now()}.txt`;
    const filePath = path.join(transcriptDir, filename);
    fs.writeFileSync(filePath, transcript, 'utf8');

    console.log(`✅ Transcript saved: ${filename}`);
    return filePath;

  } catch (error) {
    console.error('Error generating transcript:', error);
    return null;
  }
}

module.exports = { generateTranscript };
