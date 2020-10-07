import React, {useEffect, useState} from 'react';
import './App.css';
import Sidebar from './Sidebar'
import Chat from './Chat'
import Pusher from 'pusher-js'
import axios from './axios'

function App() {
  const [messages, setMessages]=useState([])
  useEffect(()=>{
    
    axios.get('/messages/sync')
    .then(response=>{
      
      setMessages(response.data)
    })
  },[])

  useEffect(() => {
    //when an app components loads this function will run for once
    const pusher = new Pusher('87c8b58af2599c1c7012', {
      cluster: 'ap2'
    });

    const channel = pusher.subscribe('messages');
    channel.bind('inserted', function(data) {
      // alert(JSON.stringify(data));
      setMessages([...messages, data]) //using spread operation ... and data is new msg
    });

    return ()=>{
      channel.unbind_all(); //reverse the effect of above function so that it listens only one time
      channel.unsubscribe(); 
    }
  }, [messages])

  console.log(messages)

  return (
    <div className="app">
      <div className="app_body">

      {/* Sidebar area for contacts*/}

      <Sidebar />
      
      {/* Chat area */}

      <Chat messages={messages}/>
      </div>
    </div>
  );
}

export default App;
