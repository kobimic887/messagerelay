const express = require('express');
     const cors = require('cors');

     const app = express();
     const PORT = process.env.PORT || 3000;

     // Middleware
     app.use(cors());
     app.use(express.json());
     app.use(express.urlencoded({ extended: true }));

     // In-memory storage for messages (in production, use a database)
     let messages = [];
     let messageId = 1;

     // POST endpoint to store messages
     app.post('/post', (req, res) => {
       try {
         const message = {
           id: messageId++,
           content: req.body.message || req.body.content || req.body,
           timestamp: new Date().toISOString(),
           sender: req.body.sender || 'anonymous'
         };

         messages.push(message);

         res.status(200).json({
           success: true,
           message: 'Message stored successfully',
           id: message.id,
           timestamp: message.timestamp
         });
       } catch (error) {
         res.status(500).json({
           success: false,
           error: 'Failed to store message'
         });
       }
     });

     // GET endpoint to retrieve messages
     app.get('/get', (req, res) => {
       try {
         const limit = parseInt(req.query.limit) || 10;
         const offset = parseInt(req.query.offset) || 0;
         const id = req.query.id;

         if (id) {
           // Get specific message by ID
           const message = messages.find(msg => msg.id === parseInt(id));
           if (message) {
             res.status(200).json({
               success: true,
               message: message
             });
           } else {
             res.status(404).json({
               success: false,
               error: 'Message not found'
             });
           }
         } else {
           // Get all messages with pagination
           const paginatedMessages = messages
             .slice(offset, offset + limit)
             .reverse(); // Most recent first

           res.status(200).json({
             success: true,
             messages: paginatedMessages,
             total: messages.length,
             limit: limit,
             offset: offset
           });
         }
       } catch (error) {
         res.status(500).json({
           success: false,
           error: 'Failed to retrieve messages'
         });
       }
     });

     // GET endpoint for the root
     app.get('/', (req, res) => {
       res.json({
         message: 'Message Relay API',
         endpoints: {
           post: '/post - POST your message here',
           get: '/get - GET messages from here'
         },
         usage: {
           post: 'POST /post with JSON body: {"message": "your message", "sender": "optional sender name"}',
           get: 'GET /get?limit=10&offset=0 or GET /get?id=1 for specific message'
         }
       });
     });

     // Health check endpoint
     app.get('/health', (req, res) => {
       res.status(200).json({
         status: 'healthy',
         timestamp: new Date().toISOString(),
         uptime: process.uptime()
       });
     });

     // Start server
     app.listen(PORT, () => {
       console.log(`Message Relay Server is running on port ${PORT}`);
       console.log(`POST messages to: http://localhost:${PORT}/post`);
       console.log(`GET messages from: http://localhost:${PORT}/get`);
     });

     module.exports = app;