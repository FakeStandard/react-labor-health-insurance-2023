import React from "react";
import './Health.css';
import { Card, Col, Container, Row, Stack, Table } from "react-bootstrap";
import { IHealthInfo } from "../../../models/IHealthInfo";

interface IHealthProps { }
interface IHealthStates {
  items: IHealthInfo[]
}

export class Health extends React.Component<IHealthProps, IHealthStates> {
  constructor(props: IHealthProps) {
    super(props)

    this.state = {
      items: []
    }
  }

  componentDidMount(): void {
    this.getData()
  }

  getData = () => {
    fetch('./data/GradingTable/Health.json')
      .then(res => res.json())
      .then(res => this.setState({ items: res }))
  }

  render(): React.ReactNode {
    const { items } = this.state

    return (
      <Container fluid className="labor">
        <Stack gap={3} style={{ marginTop: 10 }}>
          <h3 className="title">全民健康保險投保金額分級表</h3>
          <span style={{ color: "#CC0000" }}>2023.1.1 起生效</span>
          <Row className="justify-content-center pt-5">
            <Col sm={12} md={10} lg={9} xl={8} xxl={7}>
              <Card className="shadow-lg rounded">
                <Card.Body className="card-body">
                  <Table hover responsive>
                    <thead>
                      <tr>
                        <th>組別級距</th>
                        <th>投保等級</th>
                        <th>月投保金額(元)</th>
                        <th>實際薪資月額(元)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((i, idx) => (
                        <tr key={idx}>
                          <td>{i.Distance}</td>
                          <td>{i.Level}</td>
                          <td>{i.InsuredSalaryLevel}</td>
                          <td>{i.SalaryRange}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Stack>
      </Container>
    )
  }
}