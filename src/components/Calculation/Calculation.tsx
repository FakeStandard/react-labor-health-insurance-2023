import React from "react";
import './Calculation.css';
import { Container, Card, Row, Col, Form, Stack } from "react-bootstrap";
import { ILaborInfo } from "../../models/ILaborInfo";
import { IHealthInfo } from "../../models/IHealthInfo";
import { IPensionInfo } from "../../models/IPensionInfo";

interface ICalculationProps { }

interface ICalculationStates {
  laborInfo: ILaborInfo[],
  healthInfo: IHealthInfo[],
  pensionInfo: IPensionInfo[],
  labor: {
    salaryLevel: number,
    employer: number,
    government: number,
    personal: number,
    total: number
  },
  health: {
    salaryLevel: number,
    employer: number,
    government: number,
    personal: number,
    dependents: number,
    total: number
  },
  pension: {
    salaryLevel: number,
    employer: number,
    personal: number,
    check: boolean,
    select: number
  },
  statistics: {
    basicSalary: number,
    actualSalary: number
  }
}

export default class Calculation extends React.Component<ICalculationProps, ICalculationStates>{
  constructor(props: ICalculationProps) {
    super(props)

    this.state = {
      laborInfo: [],
      healthInfo: [],
      pensionInfo: [],
      labor: {
        salaryLevel: 0,
        employer: 0,
        government: 0,
        personal: 0,
        total: 0
      },
      health: {
        salaryLevel: 0,
        employer: 0,
        government: 0,
        personal: 0,
        dependents: 0,
        total: 0
      },
      pension: {
        salaryLevel: 0,
        personal: 0,
        employer: 0,
        check: false,
        select: 5
      },
      statistics: {
        basicSalary: 0,
        actualSalary: 0
      }
    }
  }

  componentDidMount(): void {
    this.getData();
  }

  getData = () => {
    fetch('./data/GradingTable/Labor.json')
      .then(res => res.json())
      .then(res => this.setState({ laborInfo: res }))

    fetch('./data/GradingTable/Health.json')
      .then(res => res.json())
      .then(res => this.setState({ healthInfo: res }))

    fetch('./data/GradingTable/Pension.json')
      .then(res => res.json())
      .then(res => this.setState({ pensionInfo: res }))
  }

  handleInputChange = async (ev: any) => {
    const salary = ev.target.value;
    const regular = /^(([1-9]{1}\d*)|(0{1}))(\.\d{0,2})?$/;

    if (!!salary && salary !== "0" && regular.test(salary)) {
      await this.calculationLabor(salary)
      await this.calculationHealth(salary)
      await this.calculationPension(salary)
      await this.calculationStatistics(salary)
    } else {
      this.setState({
        labor: {
          salaryLevel: 0, employer: 0, government: 0, personal: 0, total: 0
        }
      })
    }
  }

  handleDependentsChange = (ev: any) => {
    const single = Math.round(this.state.health.salaryLevel * 5.17 / 100 * 0.3)
    const dependents = Number(ev.target.value)
    const personal = single * (dependents + 1)
    const actualSalary = this.state.statistics.basicSalary - this.state.labor.personal - personal - this.state.pension.personal
    this.setState(pv => ({
      health: { ...pv.health, dependents: dependents, personal: personal },
      statistics: { ...pv.statistics, actualSalary: actualSalary }
    }))
  }

  handlePensionSelect = (ev: any) => {
    const value = Number(ev.target.value)
    const personal = Math.round(this.state.pension.salaryLevel * (value + 1) / 100)
    const actualSalary = this.state.statistics.basicSalary - this.state.labor.personal - this.state.health.personal - personal

    this.setState(pv => ({
      pension: { ...pv.pension, select: value, personal: personal },
      statistics: { ...pv.statistics, actualSalary: actualSalary }
    }))
  }

  handlePensionCheck = (ev: any) => {
    const checked = ev.target.checked
    let personal = 0

    if (checked)
      personal = Math.round(this.state.pension.salaryLevel * (this.state.pension.select + 1) / 100)

    const actualSalary = this.state.statistics.basicSalary - this.state.labor.personal - this.state.health.personal - personal

    this.setState(pv => ({
      pension: { ...pv.pension, check: checked, personal: personal },
      statistics: { ...pv.statistics, actualSalary: actualSalary }
    }))
  }

  calculationLabor = (val: string) => {
    const info = this.state.laborInfo
    const salary = Number(val)

    // ?????????????????????
    let level = Number(info[info.length - 1].InsuredSalaryLevel.replace(",", ""))
    let temp = 0

    // ????????????????????????
    for (let i = info.length - 1; i >= 0; i--) {
      temp = Number(info[i].InsuredSalaryLevel.replace(",", ""));
      if (salary <= temp) level = temp;
      else break
    }

    // ????????????(12%) = ????????????????????????(11%) + ??????????????????(1%)
    const employer = Math.round(level * 11 / 100 * 0.7) + Math.round(level * 1 / 100 * 0.7)
    const government = Math.round(level * 11 / 100 * 0.1) + Math.round(level * 1 / 100 * 0.1)
    const personal = Math.round(level * 11 / 100 * 0.2) + Math.round(level * 1 / 100 * 0.2)

    this.setState({
      labor: {
        salaryLevel: level, employer: employer, government: government, personal: personal, total: employer + government + personal
      }
    })
  }

  calculationHealth = (val: string) => {
    const info = this.state.healthInfo
    const salary = Number(val)

    // ?????????????????????
    let level = Number(info[info.length - 1].InsuredSalaryLevel.replace(",", ""))
    let temp = 0

    // ????????????????????????
    for (let i = info.length - 1; i >= 0; i--) {
      temp = Number(info[i].InsuredSalaryLevel.replace(",", ""))
      if (salary <= temp) level = temp
      else break
    }

    // ???????????? * ???????????????5.17%???* ?????????????????????????????????????????????* ?????????+???????????????
    // ???112???1???1??????????????????????????????0.57????????????????????????????????????????????????????????????0.57????????????1.57???
    const employer = Math.round(level * 5.17 / 100 * 0.6 * 1.57)
    const government = Math.round(level * 5.17 / 100 * 0.1 * 1.57)
    const personal = Math.round(level * 5.17 / 100 * 0.3) * (this.state.health.dependents + 1)

    this.setState(pv => ({
      health: {
        ...pv.health,
        salaryLevel: level, employer: employer, government: government, personal: personal, total: employer + government + personal
      }
    }))
  }

  calculationPension = (val: string) => {
    const info = this.state.pensionInfo
    const salary = Number(val)

    // ?????????????????????
    let level = Number(info[info.length - 1].PaymentOfWages.replace(",", ""))
    let temp = 0

    // ????????????????????????
    for (let i = info.length - 1; i >= 0; i--) {
      temp = Number(info[i].PaymentOfWages.replace(",", ""))
      if (salary <= temp) level = temp
      else break
    }

    // ???????????? 6%????????????????????? 6%
    const employer = Math.round(level * 0.06)
    const personal = 0

    this.setState(pv => ({
      pension: {
        ...pv.pension,
        salaryLevel: level, employer: employer, personal: personal
      }
    }))
  }

  calculationStatistics = (val: string) => {
    const salary = Number(val)
    const result = salary - this.state.labor.personal - this.state.health.personal - this.state.pension.personal
    this.setState({ statistics: { basicSalary: salary, actualSalary: result } })
  }

  public render(): React.ReactElement<ICalculationProps> {
    const { labor, health, pension, statistics } = this.state;

    return (
      <Container fluid className="calculation">
        <Stack gap={3} style={{ marginTop: 10 }}>
          <h3 className="title">??????????????????</h3>

          <Row className="justify-content-center">
            <Col xs={12} sm={10} md={8} lg={6} xl={4}>
              <Form.Control autoFocus type="text" placeholder="Please enter salary" onChange={this.handleInputChange} />
            </Col>
          </Row>

          <Row className="justify-content-center align-items-center">
            <Col xs='auto'>
              <Form.Check id="default-checkbox" type="checkbox" label="??????" checked={pension.check} onChange={this.handlePensionCheck} />
            </Col>
            <Col xs='auto'>
              <Form.Select
                className="text-center" disabled={!pension.check}
                value={pension.select} onChange={this.handlePensionSelect}>
                {[0, 1, 2, 3, 4, 5].map(c => (
                  <option key={c} value={c}>{`${c + 1}%`}</option>
                ))}
              </Form.Select>
            </Col>
          </Row>

          <Row>
            <Col sm={12} md={12} lg={6} xl={6} xxl={4}>
              <Card className="shadow-lg rounded m-3" border="light">
                <Card.Body className="card-body">
                  <Card.Title className="card-title">??????</Card.Title>
                  <Row className="m-3">
                    <Col>????????????</Col>
                    <Col className="col-calculator">{labor.salaryLevel}</Col>
                  </Row>
                  <Row className="m-3">
                    <Col>???????????? 10%</Col>
                    <Col className="col-calculator">{labor.government}</Col>
                  </Row>
                  <Row className="m-3">
                    <Col>???????????? 70%</Col>
                    <Col className="col-calculator">{labor.employer}</Col>
                  </Row>
                  <Row className="m-3 card-red-txt">
                    <Col>???????????? 20%</Col>
                    <Col className="col-calculator">{labor.personal}</Col>
                  </Row>
                  <hr />
                  <Row className="m-3">
                    <Col>??????</Col>
                    <Col className="col-calculator">{labor.total}</Col>
                  </Row>
                </Card.Body>
              </Card>
              <Col className="col-comment">
                <Form.Label>
                  2023.01.01 <br />
                  1.????????????????????????????????????????????????????????? 26,400 ??? <br />
                  2.??????????????????????????? 10.5% ????????? 11% <br />
                  (???????????????????????? 1%??????????????????????????? 12%)
                </Form.Label>
              </Col>
            </Col>
            <Col sm={12} md={12} lg={6} xl={6} xxl={4}>
              <Card className="shadow-lg rounded m-3" border="light">
                <Card.Body className="card-body">
                  <Card.Title className="card-title">??????</Card.Title>
                  <Row className="m-3">
                    <Col>????????????</Col>
                    <Col className="col-calculator">{health.salaryLevel}</Col>
                  </Row>
                  <Row className="m-3">
                    <Col>???????????? 10%</Col>
                    <Col className="col-calculator">{health.government}</Col>
                  </Row>
                  <Row className="m-3">
                    <Col>???????????? 60%</Col>
                    <Col className="col-calculator">{health.employer}</Col>
                  </Row>
                  <Row className="m-3">
                    <Col>????????????</Col>
                    <Col xs='auto'>
                      <Form.Select
                        className="col-calculator text-center"
                        value={health.dependents} onChange={this.handleDependentsChange}>
                        <option value="0">0</option>
                        <option value="1">1</option>
                        <option value="2">2</option>
                        <option value="3">3?????????(??????)</option>
                      </Form.Select>
                    </Col>
                  </Row>
                  <Row className="m-3 card-red-txt">
                    <Col>???????????? 30%</Col>
                    <Col className="col-calculator">{health.personal}</Col>
                  </Row>
                  <hr />
                  <Row className="m-3">
                    <Col>??????</Col>
                    <Col className="col-calculator">{health.total}</Col>
                  </Row>
                </Card.Body>
              </Card>
              <Col className="col-comment">
                <Form.Label>
                  2023.01.01 <br />
                  1.????????????????????????????????????????????????????????? 26,400 ??? <br />
                  2.????????????????????? 0.57 ???<br />
                  (????????????????????????????????????????????????????????? 1.57 ???) <br />
                  3.?????????????????? 5.17%
                </Form.Label>
              </Col>
            </Col>
            <Col sm={12} md={12} lg={6} xl={6} xxl={4}>
              <Card className="shadow-lg rounded m-3" border="light">
                <Card.Body className="card-body">
                  <Card.Title className="card-title">????????????</Card.Title>
                  <Row className="m-3 card-green-txt">
                    <Col>+ ??????</Col>
                    <Col className="col-calculator">{statistics.basicSalary}</Col>
                  </Row>
                  <Row className="m-3 card-red-txt">
                    <Col>- ????????????</Col>
                    <Col className="col-calculator">{labor.personal}</Col>
                  </Row>
                  <Row className="m-3 card-red-txt">
                    <Col>- ????????????</Col>
                    <Col className="col-calculator">{health.personal}</Col>
                  </Row>
                  <Row className="m-3 card-red-txt">
                    <Col>- ?????? 6%</Col>
                    <Col className="col-calculator">{pension.personal}</Col>
                  </Row>
                  <hr />
                  <Row className="m-3 card-green-txt">
                    <Col>+ ????????????</Col>
                    <Col className="col-calculator">{statistics.actualSalary}</Col>
                  </Row>
                </Card.Body>
              </Card>
            </Col>
          </Row>
          <Row>
            <Col sm={12} md={12} lg={6} xl={6} xxl={4}>
              <Card className="shadow-lg rounded m-3" border="light" style={{ marginTop: 10 }}>
                <Card.Body className="card-body">
                  <Card.Title className="card-title">??????(6%)</Card.Title>
                  <Row className="m-3">
                    <Col>????????????</Col>
                    <Col className="col-calculator">{pension.salaryLevel}</Col>
                  </Row>
                  <Row className="m-3">
                    <Col>????????????</Col>
                    <Col className="col-calculator">{pension.employer}</Col>
                  </Row>
                </Card.Body>
              </Card>
            </Col>
            <Col sm={12} md={12} lg={6} xl={6} xxl={4}>
              <Card className="shadow-lg rounded m-3" border="light" style={{ marginTop: 10 }}>
                <Card.Body className="card-body">
                  <Card.Title className="card-title">??????(??????6%)</Card.Title>
                  <Row className="m-3">
                    <Col>????????????</Col>
                    <Col className="col-calculator">{pension.salaryLevel}</Col>
                  </Row>
                  <Row className="m-3 card-red-txt">
                    <Col>????????????</Col>
                    <Col className="col-calculator">{pension.personal}</Col>
                  </Row>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Stack>
      </Container>
    )
  }
}