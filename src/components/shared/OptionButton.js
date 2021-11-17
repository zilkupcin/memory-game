
import styled from 'styled-components';

const StyledButton = styled.button`
    padding: 8px 12px;
    border: none;
    background-color: ${({isActive, theme}) => isActive ? theme.colors.pickledBluewood : theme.colors.jungleMist};
    color: white;
    border-radius: 50px;
    cursor: pointer;
    transition: all 0.1s ease-in-out;
    &:hover {
        background-color: ${({isActive, theme}) => isActive ? theme.colors.pickledBluewood : theme.colors.hippieBlue}
    }
`;

const OptionButton = ({optionType, isActive, onClick, value, ...props}) => {

    const handleClick = () => {
        onClick({optionType, value});
    }

    return(
        <StyledButton onClick={handleClick} isActive={isActive}>{props.children}</StyledButton>
    );
}

export default OptionButton;