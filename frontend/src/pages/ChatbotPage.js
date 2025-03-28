import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Container, Form, Button } from 'react-bootstrap';
import { sendChatMessage } from '../services/api';
import './ChatbotPage.css';

const ChatbotPage = () => {
  const [messages, setMessages] = useState([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [scrollToBottom]);

  useEffect(() => {
    // Add welcome message
    setTimeout(() => {
      setMessages([
        {
          text: "Hi! I'm your AI crop assistant. Ask me anything about crop health, farming practices, or soil management.",
          isBot: true
        }
      ]);
    }, 800); // Delay welcome message to allow animations to play
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentMessage.trim()) return;

    // Add user message
    const userMessage = { text: currentMessage, isBot: false };
    setMessages(prevMessages => [...prevMessages, userMessage]);
    setCurrentMessage('');
    setIsLoading(true);

    try {
      const response = await sendChatMessage(currentMessage);
      
      // Add bot response
      const botMessage = { text: response.response, isBot: true, source: response.source };
      setMessages(prevMessages => [...prevMessages, botMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Add error message
      const errorMessage = { 
        text: "Sorry, I encountered an error. Please try again later.", 
        isBot: true, 
        isError: true 
      };
      setMessages(prevMessages => [...prevMessages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="agrointel-chatbot">
      <Container>
        <div className="chatbot-header">
          <h1 className="chatbot-title animate-text">AI Crop Assistant</h1>
          <p className="chatbot-subtitle animate-text" style={{ animationDelay: '0.3s' }}>
            Get expert advice on crop health, diseases, and farming practices
          </p>
        </div>
        
        <div className="chat-container">
          <div className="messages-container">
            {messages.map((message, index) => (
              <div 
                key={`msg-${index}-${message.isBot ? 'bot' : 'user'}`} 
                className={`message ${message.isBot ? 'bot-message' : 'user-message'} ${message.isError ? 'error-message' : ''}`}
                style={{ animationDelay: `${0.1 * index}s` }}
              >
                <div className="message-bubble">
                  <p>{message.text}</p>
                  {message.source && message.source !== 'model' && (
                    <div className="message-source">Source: {message.source}</div>
                  )}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="message bot-message">
                <div className="message-bubble">
                  <div className="typing-indicator">
                    <span className="typing-dot" />
                    <span className="typing-dot" />
                    <span className="typing-dot" />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          
          <Form onSubmit={handleSubmit} className="message-form">
            <Form.Group className="message-input-container">
              <Form.Control
                type="text"
                value={currentMessage}
                onChange={(e) => setCurrentMessage(e.target.value)}
                placeholder="Ask a question about your crops..."
                disabled={isLoading}
                className="message-input"
              />
              <Button 
                type="submit" 
                disabled={isLoading || !currentMessage.trim()}
                className="send-button"
              >
                Send
              </Button>
            </Form.Group>
          </Form>
        </div>
      </Container>
    </div>
  );
};

export default ChatbotPage;