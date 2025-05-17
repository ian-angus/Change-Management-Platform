import React from 'react';
import { Link } from 'react-router-dom';
import { Nav } from 'react-bootstrap';

const Navigation = () => {
  return (
    <Nav className="me-auto">
      <Nav.Link as={Link} to="/key-messages">
        <i className="bi bi-chat-square-text me-2"></i>
        Key Messages
      </Nav.Link>
    </Nav>
  );
};

export default Navigation; 