import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { getJobMessages } from '../services/apiRoutes';

const JobChat = ({ jobId, user }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const socketRef = useRef(null);
  const chatBoxRef = useRef(null);

  // Fetch messages on mount
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const res = await getJobMessages(jobId);
        setMessages(res.data);
      } catch (err) {
        console.error('Error loading messages:', err);
      }
    };

    fetchMessages();
  }, [jobId]);

  useEffect(() => {
    socketRef.current = io(import.meta.env.VITE_SOCKET_URL, {
      withCredentials: true,
    });

    socketRef.current.emit('joinRoom', jobId);

    socketRef.current.on('receiveMessage', (msg) => {
      // Ensure we only process messages for this job
      if (msg.jobId === jobId) {
        setMessages((prev) => [...prev, msg]);
      }
    });

    return () => {
      socketRef.current.emit('leaveRoom', jobId);
      socketRef.current.disconnect();
    };
  }, [jobId]);

  useEffect(() => {
    chatBoxRef.current?.scrollTo(0, chatBoxRef.current.scrollHeight);
  }, [messages]);

  const sendMessage = () => {
    if (!input.trim()) return;
    
    // Create message object with fields matching the backend schema
    const msg = {
      jobId,
      content: input, // Changed from text to content
      sender: user?._id,
      time: new Date().toISOString(),
      name: user?.name,
    };

    socketRef.current.emit('sendMessage', msg);
    setInput('');
  };

    // Helper function to get the sender name consistently
    const getSenderName = (message) => {
      // Try all possible properties where name might be stored
      return message.name || 
             message.sender_name || 
             message.senderName || 
             (message.sender === user?._id ? user?.name : 'Other User');
    };
  
    // Helper function to get message content consistently
    const getMessageContent = (message) => {
      return message.content || message.text || '';
    };
  

  return (
    <div className="job-chat">
      <h3>💬 Messages</h3>
      <div className="chat-box" ref={chatBoxRef} style={{ maxHeight: '300px', overflowY: 'auto' }}>
        {messages.map((m, idx) => (
          <div key={m._id || idx} className={`message ${m.sender === user?._id ? 'sent' : 'received'}`}>
            <strong>{getSenderName(m)}:</strong> {getMessageContent(m)}
            </div>
        ))}
      </div>
      <div className="message-input">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="Type your message..."
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
};

export default JobChat;