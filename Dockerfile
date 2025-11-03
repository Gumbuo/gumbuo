FROM node:18-alpine

WORKDIR /app

# Copy only the chat server
COPY chat-server.js .

# Install ws dependency directly
RUN npm install ws@8.14.2

EXPOSE 3001

CMD ["node", "chat-server.js"]
