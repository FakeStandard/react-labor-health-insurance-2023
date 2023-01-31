import React from "react";
import './Labor.css';
import { Card, Col, Container, Row, Stack, Table } from "react-bootstrap";
import { ILaborInfo } from "../../../models/ILaborInfo";

interface ILaborProps { }
interface ILaborStates {
  items: ILaborInfo[]
}

export class Labor extends React.Component<ILaborProps, ILaborStates> {
  constructor(props: ILaborProps) {
    super(props)

    this.state = {
      items: []
    }
  }

  componentDidMount(): void {
    this.getData()
  }

  getData = () => {
    fetch('./data/GradingTable/Labor.json')
      .then(res => res.json())
      .then(res => this.setState({ items: res }))
  }

  render(): React.ReactElement<ILaborProps> {
    const { items } = this.state

    return (
      <Container fluid className="labor">
        <Stack gap={3} style={{ marginTop: 10 }}>
          <h3 className="title">勞工保險投保薪資分級表</h3>
          <span style={{ color: "#CC0000" }}>2023.1.1 起生效</span>
          <Row className="justify-content-center pt-5">
            <Col xs={12} sm={11} md={10} lg={8} xl={7} xxl={6}>
              <Card className="shadow-lg rounded">
                <Card.Body className="card-body">
                  <Table hover responsive>
                    <thead>
                      <tr>
                        <th>投保薪資等級</th>
                        <th>月薪資總額(元)</th>
                        <th>月投保薪資(元)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((i, idx) => (
                        <tr key={idx}>
                          <td>{i.Level}</td>
                          <td>{i.SalaryRange}</td>
                          <td>{i.InsuredSalaryLevel}</td>
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