import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const socket = io('http://localhost:5000'); // make sure this matches your backend

const JobChat = ({ jobId, user }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');

  useEffect(() => {
    socket.emit('joinRoom', jobId); // optional: use rooms per job

    socket.on('receiveMessage', (msg) => {
      if (msg.jobId === jobId) {
        setMessages((prev) => [...prev, msg]);
      }
    });

    return () => {
      socket.off('receiveMessage');
    };
  }, [jobId]);

  const sendMessage = () => {
    if (!input.trim()) return;
    const msg = {
      jobId,
      text: input,
      sender: user?.name || 'Unknown',
      time: new Date().toISOString(),
    };
    socket.emit('sendMessage', msg);
    //setMessages((prev) => [...prev, msg]);
    setInput('');
  };

  return (
    <div className="job-chat">
      <h3>💬 Messages</h3>
      <div className="chat-box">
        {messages.map((m, idx) => (
          <div key={idx}><strong>{m.sender}:</strong> {m.text}</div>
        ))}
      </div>
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Type your message..."
      />
      <button onClick={sendMessage}>Send</button>
    </div>
  );
};

export default JobChat;
