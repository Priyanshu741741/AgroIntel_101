import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import Chatbot from '../components/Chatbot';

const ChatbotPage = () => {
  return (
    <Container className="py-4">
      <h2 className="mb-4">Crop Care Assistant</h2>
      <Row>
        <Col lg={8} className="mx-auto">
          <Chatbot />
        </Col>
      </Row>
    </Container>
  );
};

export default ChatbotPage;