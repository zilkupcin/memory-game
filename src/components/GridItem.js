import { useEffect, useState } from "react";
import styled from "styled-components";

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 4px;
  background-color: ${(props) => {
    if (props.revealed) {
      return props.theme.colors.jungleMist;
    } else if (props.selected) {
      return props.theme.colors.primary;
    } else {
      return props.theme.colors.pickledBluewood;
    }
  }};
  border-radius: 50%;
  color: white;
  cursor: pointer;
  transform: ${(props) => (props.clicked ? "scale(0.6)" : "scale(1)")};
  transition: all ${(props) => (props.clicked ? "0.3s" : "0.2s")} ease-in-out,
    background-color ${(props) => (props.clicked ? "0.3s" : "0.2s")} ease-in-out;
  font-size: 28px;
  opacity: ${(props) => (props.isCurrentTurn ? 1 : 0.8)};

  &::after {
    content: "";
    display: block;
    padding-bottom: 100%;
    font-size: 32px;
  }

  i {
    font-size: 32px;
    color: white;
  }
`;

const GridItem = ({
  children,
  onItemClick,
  index,
  selected,
  revealed,
  isCurrentTurn,
}) => {
  const handleItemClick = () => {
    if (!isCurrentTurn || revealed || selected) return;

    if (!clicked) {
      setClicked(true);
    }
    onItemClick(index);
  };

  const [clicked, setClicked] = useState(false);

  useEffect(() => {
    if (selected) {
      setClicked(false);
    }
  }, [selected]);

  return (
    <Container
      selected={selected}
      revealed={revealed}
      onClick={handleItemClick}
      clicked={clicked}
      isCurrentTurn={isCurrentTurn}
    >
      {children}
    </Container>
  );
};

export default GridItem;
