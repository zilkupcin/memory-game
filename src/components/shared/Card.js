import styled from "styled-components";

const Card = styled.div`
  background-color: white;
  padding: 24px;
  border-radius: 20px;
  align-self: stretch;

  @media only screen and (min-width: 480px) {
    width: 100%;
    max-width: 460px;
    margin: 0 auto;
  }

  @media only screen and (min-width: 3840px) {
    max-width: 1024px;
    padding: 48px;
  }
`;

export default Card;
