import React from "react";
import { Container, Card } from "react-bootstrap";

interface IHomeProps { }
interface IHomeStates { }

export default class Home extends React.Component<IHomeProps, IHomeStates>{
  constructor(props: IHomeProps) {
    super(props)

    this.state = {

    }
  }

  public render(): React.ReactElement<IHomeProps> {
    return (
      <Container fluid>
        <h3>Home</h3>

        <Card body className="shadow-lg rounded">
          123
        </Card>
      </Container>
    )
  }
}