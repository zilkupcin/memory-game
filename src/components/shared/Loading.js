import styled from "styled-components";

const Container = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;

  .bubble-1,
  .bubble-2,
  .bubble-3 {
    background-color: ${(props) => props.theme.colors.primary};
    width: 24px;
    height: 24px;
    border-radius: 50%;
    animation-name: jump;
    animation-iteration-count: infinite;
    animation-duration: 1s;
    animation-direction: forward;
  }

  .bubble-2 {
    margin: 0 12px;
    animation-delay: 0.2s;
  }

  .bubble-3 {
    animation-delay: 0.4s;
  }

  @keyframes jump {
    0% {
      transform: translateY(0);
      opacity: 1;
    }
    50% {
      transform: translateY(-25px);
    }
    100% {
      transform: translateY(0px);
      opacity: ${(props) => (props.readyForTransition ? 0 : 1)};
    }
  }
`;

const Loading = ({ readyForTransition }) => {
  return (
    <Container readyForTransition={readyForTransition}>
      <div className="bubble-1"></div>
      <div className="bubble-2"></div>
      <div className="bubble-3"></div>
    </Container>
  );
};

export default Loading;
