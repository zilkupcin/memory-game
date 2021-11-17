
import styled from 'styled-components';

const StyledButton = styled.button.attrs(props => ({
    width: props.width || "auto",
    margin: props.margin || 0
}))`
    padding: 8px 12px;
    border: none;
    background-color: ${({type, isActive, theme}) => getBackgroundColor(type, isActive, theme)};
    color: ${({type, theme}) => getColor(type, theme)};
    border-radius: 50px;
    cursor: pointer;
    transition: all 0.1s ease-in-out;
    width: ${({width}) => width};
    margin: ${({margin}) => margin};

    &:hover {
        background-color: ${({type,theme}) => getHoverBackgroundColor(type,theme)}
    }

    &:disabled {
        opacity: 0.7;

        &:hover {
            background-color: ${({type, isActive, theme}) => getBackgroundColor(type, isActive, theme)};
        }
    }
`;

const getBackgroundColor = (type, isActive, theme) => {
    if (type === 'primary') {
        return theme.colors.primary;
    } else if (type === 'secondary') {
        return theme.colors.mystic;
    } else if (type === 'tertiary') {
        if (isActive) return theme.colors.pickledBluewood;
        return theme.colors.jungleMist;
    }
}

const getColor = (type,theme) => {
    if (type === 'secondary') {
        return theme.colors.pickledBluewood;
    } else {
        return "white";
    }
}

const getHoverBackgroundColor = (type,theme) => {
    if (type === 'primary') {
        return theme.colors.primaryLight;
    } else {
        return theme.colors.hippieBlue;
    }
}

const Spinner = () => {
    return (<i className="fas fa-spinner fa-spin"></i>); 
}

const Button = ({type, width, margin, disabled, onClick, isLoading, ...props}) => {
    return(
        <StyledButton disabled={isLoading || disabled} onClick={onClick} isLoading={isLoading} type={type} width={width} margin={margin}>
            {isLoading ? <Spinner></Spinner> : props.children}
        </StyledButton>
    );
}

export default Button;