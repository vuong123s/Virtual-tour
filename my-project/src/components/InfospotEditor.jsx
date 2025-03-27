import React from 'react';
import { Button, Modal, Form } from 'react-bootstrap';

const InfospotEditor = ({ show, onHide, onSave }) => {
  const [text, setText] = React.useState('');

  return (
    <Modal show={show} onHide={onHide}>
      <Modal.Header closeButton>
        <Modal.Title>Edit Infospot</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group>
            <Form.Label>Text</Form.Label>
            <Form.Control
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Close
        </Button>
        <Button variant="primary" onClick={() => onSave(text)}>
          Save
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default InfospotEditor;