import styled from 'styled-components';

const StyledMessage = styled.li`
    position: relative;
    padding: 24px;
    font-size: 16px;
    background-color: white;
    box-shadow: 0px 0px 50px 0 rgba(0,0,0,0.15);
    margin-bottom: 8px;
    border-radius: 8px;
    overflow: hidden;
    cursor: pointer;

    &::before {
        position: absolute;
        content: '';
        top: 0;
        bottom: 0;
        left: 0;
        width: 12px;
        background-color: ${props => props.theme.colors.primary};
    }
`

const Message = ({message}) => {
    return (<StyledMessage>{message.content}</StyledMessage>)
}

export default Message;