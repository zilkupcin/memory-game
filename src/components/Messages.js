import styled from 'styled-components';
import Message from './Message';

const Container = styled.div`
    position: absolute;
    top: 12px;
    right: 12px;
`;

const MessageList = styled.ul`
    display: flex;
    flex-direction: column;
`

const Messages = () => {

    const messages = [
        {
            type: "notice",
            content: "The game has been restarted",
        },
        {
            tyoe: "error",
            content: "Please wait for your turn"
        }
    ]

    return (
        <Container>
            <MessageList>
                {messages.map(message => {
                    return (<Message message={message}></Message>)
                })}
            </MessageList>
        </Container>
    )
}

export default Messages;