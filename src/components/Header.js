import styled from 'styled-components';
import Button from './shared/Button';

const StyledHeader = styled.header`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
`;

const Logo = styled.h1`
    color: ${props => props.theme.colors.dark};
    font-size: 20px;
`

const ButtonGroup = styled.div`
    button:first-child {
        margin-right: 8px;
    }

    button:only-child {
        margin-right: 0;
    }
`


const Header = ({isHost}) => {
    return(
    <StyledHeader>
        <Logo>memory</Logo>
        <ButtonGroup>
            {isHost && <Button type="primary">Restart</Button>}
            <Button type="secondary">New Game</Button>
        </ButtonGroup>
    </StyledHeader>)
}

export default Header;