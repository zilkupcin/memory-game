import { useContext } from "react";
import styled from "styled-components";
import Message from "./Message";
import { MessagesContext } from "./MessagesProvider";

const Container = styled.div`
  position: absolute;
  top: 12px;
  right: 12px;
  }
`;

const MessageList = styled.ul`
  display: flex;
  flex-direction: column;
`;

const Messages = () => {
  const { messages, removeMessage } = useContext(MessagesContext);

  const handleMessageClick = (index) => {
    removeMessage(index);
  };

  return (
    <Container>
      <MessageList>
        {messages.map((message, index) => {
          return (
            <Message
              onMessageClick={handleMessageClick}
              key={message.id}
              index={index}
              message={message}
            ></Message>
          );
        })}
      </MessageList>
    </Container>
  );
};

export default Messages;
