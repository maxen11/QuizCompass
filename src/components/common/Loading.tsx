import { Container, Spinner} from "react-bootstrap";

export default function Loading (){
    return (
      <>
        <Container>
          <Spinner
            as="span"
            animation="border"
            size="sm"
            role="status"
            aria-hidden="true"
            />
            Loading...
          </Container>
      </>
    );
}