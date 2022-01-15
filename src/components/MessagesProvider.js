import React, { useState } from "react";

export const MessagesContext = React.createContext(null);

function MessagesProvider({ children }) {
  const [messages, setMessages] = useState([]);

  const addMessage = (content, type) => {
    const id = Math.floor(Math.random() * 99999);
    setMessages([...messages, { content, type, id }]);
  };

  const removeMessage = (index) => {
    let messagesCopy = [...messages];
    messagesCopy.splice(index, 1);
    setMessages(messagesCopy);
  };

  return (
    <MessagesContext.Provider value={{ messages, addMessage, removeMessage }}>
      {children}
    </MessagesContext.Provider>
  );
}

export default MessagesProvider;
