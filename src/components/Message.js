import { useEffect, useState } from "react";
import styled from "styled-components";

const StyledMessage = styled.li`
  position: relative;
  padding: 12px 24px;
  font-size: 16px;
  background-color: white;
  box-shadow: 0px 0px 50px 0 rgba(0, 0, 0, 0.15);
  margin-bottom: 8px;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  color: ${(props) => props.theme.colors.pickledBluewood};
  transform: translateX(100%);
  opacity: 0;
  animation-name: animated-message;
  animation-duration: 3s;
  animation-direction: normal;

  @keyframes animated-message {
    0% {
      transform: translateX(100%);
      opacity: 0;
    }

    15% {
      transform: translateX(0);
      opacity: 1;
    }

    85% {
      transform: translateX(0);
      opacity: 1;
    }

    100% {
      transform: translateX(100%);
      opacity: 0;
    }
  }

  &::before {
    position: absolute;
    content: "";
    top: 0;
    bottom: 0;
    left: 0;
    width: 12px;
    background-color: ${(props) => props.theme.colors.primary};
  }

  @media only screen and (min-width: 480px) {
    font-size: 18px;
    padding: 18px 24px;
  }
`;

const Message = ({ index, message, onMessageClick }) => {
  const [readyForRemoval, setReadyForRemoval] = useState(false);
  useEffect(() => {
    // Remove a message after 3 seconds
    let removalTimeout = setTimeout(() => {
      setReadyForRemoval(true);
    }, 3000);

    return () => {
      clearTimeout(removalTimeout);
    };
  }, []);

  useEffect(() => {
    if (!readyForRemoval) return;
    onMessageClick(index);
  }, [readyForRemoval]);

  const handleMessageClick = () => {
    onMessageClick(index);
  };

  return (
    <StyledMessage onClick={handleMessageClick}>
      {message.content}
    </StyledMessage>
  );
};

export default Message;
