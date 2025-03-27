import React, { useState, useRef, useEffect } from 'react';
import { Card, Form, Button, Spinner } from 'react-bootstrap';
import axios from 'axios';

const Chatbot = () => {
  const [messages, setMessages] = useState([
    { text: "Hello! I'm your crop care assistant powered by Google AI. How can I help with your farming or gardening questions?", sender: 'bot' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

    // In src/components/Chatbot.js

  // Update the handleSubmit function
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!input.trim()) return;
    
    // Add user message to chat
    const userMessage = { text: input, sender: 'user' };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    
    try {
      // Send message to API
      const response = await axios.post('http://localhost:5000/api/chatbot', {
        message: input
      });
      
      // Add bot response to chat
      const botMessage = { 
        text: response.data.response, 
        sender: 'bot',
        source: response.data.source 
      };
      
      setMessages(prev => [...prev, botMessage]);
      
      // Log response for debugging
      console.log("Chatbot API response:", response.data);
      
    } catch (error) {
      console.error('Error sending message to chatbot:', error);
      
      // Add error message
      setMessages(prev => [...prev, {
        text: "Sorry, I'm having trouble connecting to the server. Please check your internet connection and try again.",
        sender: 'bot',
        error: true
      }]);
    } finally {
      setIsLoading(false);
    }
  };
  // Function to suggest common questions
  const suggestQuestion = (question) => {
    setInput(question);
  };

  return (
    <Card className="chatbot-container">
      <Card.Header className="d-flex justify-content-between align-items-center">
        <h5 className="mb-0">Crop Care Assistant</h5>
        <small className="text-muted">Powered by Google Gemini</small>
      </Card.Header>
      <Card.Body className="chatbot-messages">
        <div className="messages-container">
          {messages.map((message, index) => (
            <div 
              key={index} 
              className={`message ${message.sender} ${message.error ? 'error' : ''}`}
            >
              {message.text}
              {message.source === 'gemini' && index > 0 && (
                <div className="ai-badge">AI</div>
              )}
            </div>
          ))}
          {isLoading && (
            <div className="message bot loading">
              <Spinner animation="grow" size="sm" />
              <Spinner animation="grow" size="sm" className="mx-2" />
              <Spinner animation="grow" size="sm" />
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </Card.Body>
      
      <div className="suggestion-chips">
        <Button variant="outline-secondary" size="sm" onClick={() => suggestQuestion("How do I identify tomato diseases?")}>
          Identify tomato diseases
        </Button>
        <Button variant="outline-secondary" size="sm" onClick={() => suggestQuestion("Best practices for watering crops?")}>
          Watering tips
        </Button>
        <Button variant="outline-secondary" size="sm" onClick={() => suggestQuestion("How to improve soil fertility naturally?")}>
          Soil fertility
        </Button>
      </div>
      
      <Card.Footer>
        <Form onSubmit={handleSubmit}>
          <div className="d-flex">
            <Form.Control
              type="text"
              placeholder="Ask about crop care, diseases, or growing tips..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isLoading}
            />
            <Button 
              type="submit" 
              variant="primary" 
              className="ms-2"
              disabled={isLoading || !input.trim()}
            >
              <i className="bi bi-send-fill"></i>
            </Button>
          </div>
        </Form>
      </Card.Footer>
    </Card>
  );
};

export default Chatbot;