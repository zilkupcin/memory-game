import React, { useCallback } from "react";
import styled from "styled-components";

const StyledButton = styled.button`
  padding: 8px 12px;
  border: none;
  background-color: ${({ isActive, theme }) =>
    isActive ? theme.colors.pickledBluewood : theme.colors.jungleMist};
  color: white;
  border-radius: 50px;
  cursor: pointer;
  transition: all 0.1s ease-in-out;
  &:hover {
    background-color: ${({ isActive, theme }) =>
      isActive ? theme.colors.pickledBluewood : theme.colors.hippieBlue};
  }

  @media only screen and (min-width: 768px) {
    font-size: 20px;
  }

  @media only screen and (min-width: 3840px) {
    font-size: 32px;
  }
`;

const OptionButton = ({ optionType, isActive, onClick, value, ...props }) => {
  const handleClick = useCallback(() => {
    onClick({ optionType, value });
  });

  return (
    <StyledButton onClick={handleClick} isActive={isActive}>
      {props.children}
    </StyledButton>
  );
};

export default OptionButton;
