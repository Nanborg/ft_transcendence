import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

function App() 
{
  const [socketStatus, setSocketStatus] = useState('connecting');

  useEffect(() => {
    const socket = io({
      path: '/socket.io',
      transports: ['websocket'],
    });

    socket.on('connect', () => {
      setSocketStatus(`connected: ${socket.id}`);
      console.log('socket connected:', socket.id);
    });

    socket.on('disconnect', () => {
      setSocketStatus('disconnected');
      console.log('socket disconnected');
    });

    socket.on('connect_error', (error) => {
      setSocketStatus(`connection error: ${error.message}`);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <main>
      <h1>ft_transcendence</h1>
      <p>Frontend ready.</p>
      <p>Socket.IO: {socketStatus}</p>
    </main>
  );
}

export default App;
