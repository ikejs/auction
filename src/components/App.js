import '../assets/stylesheets/base.scss';
import React, { useState } from 'react';
// import MyImage from '../assets/images/bg.jpg';
let socket = io.connect();

const App = () => {

  const [items, setItems] = useState([ 
    { name: "Item 1" },
    { name: "Item 2" }
  ])

  socket.on('connect', function(data) {
    socket.emit('join', 'hello world from the client!');
  });
  socket.on('bid', (data) => { 
    alert('from server');
    // updateItems()
  });

  return (
    <div>
      <img src="/pepe.png" alt="torchlight in the sky" />
      <h1>Items</h1>
      {
        items.map((item, i) => { return <h2 key={i}>{item.name}</h2> })
      }
    </div>
  )

}


export default App;
