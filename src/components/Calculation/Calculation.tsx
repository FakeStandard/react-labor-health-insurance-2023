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

    // 預設為最高級距
    let level = Number(info[info.length - 1].InsuredSalaryLevel.replace(",", ""))
    let temp = 0

    // 由高而低迭代搜尋
    for (let i = info.length - 1; i >= 0; i--) {
      temp = Number(info[i].InsuredSalaryLevel.replace(",", ""));
      if (salary <= temp) level = temp;
      else break
    }

    // 勞保費率(12%) = 普通事故保險費率(11%) + 就業保險費率(1%)
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

    // 預設為最高級距
    let level = Number(info[info.length - 1].InsuredSalaryLevel.replace(",", ""))
    let temp = 0

    // 由高而低迭代搜尋
    for (let i = info.length - 1; i >= 0; i--) {
      temp = Number(info[i].InsuredSalaryLevel.replace(",", ""))
      if (salary <= temp) level = temp
      else break
    }

    // 投保金額 * 保險費率（5.17%）* 負擔比率（小數點後先四捨五入）* （本人+眷屬人數）
    // 自112年1月1日起調整平均眷口數為0.57人，投保單位負擔金額含本人及平均眷屬人數0.57人，合計1.57人
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

    // 預設為最高級距
    let level = Number(info[info.length - 1].PaymentOfWages.replace(",", ""))
    let temp = 0

    // 由高而低迭代搜尋
    for (let i = info.length - 1; i >= 0; i--) {
      temp = Number(info[i].PaymentOfWages.replace(",", ""))
      if (salary <= temp) level = temp
      else break
    }

    // 雇主提撥 6%，個人最高提撥 6%
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
          <h3 className="title">薪資即時試算</h3>

          <Row className="justify-content-center">
            <Col xs={12} sm={10} md={8} lg={6} xl={4}>
              <Form.Control autoFocus type="text" placeholder="Please enter salary" onChange={this.handleInputChange} />
            </Col>
          </Row>

          <Row className="justify-content-center align-items-center">
            <Col xs='auto'>
              <Form.Check id="default-checkbox" type="checkbox" label="自提" checked={pension.check} onChange={this.handlePensionCheck} />
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
                  <Card.Title className="card-title">勞保</Card.Title>
                  <Row className="m-3">
                    <Col>投保級距</Col>
                    <Col className="col-calculator">{labor.salaryLevel}</Col>
                  </Row>
                  <Row className="m-3">
                    <Col>政府負擔 10%</Col>
                    <Col className="col-calculator">{labor.government}</Col>
                  </Row>
                  <Row className="m-3">
                    <Col>雇主負擔 70%</Col>
                    <Col className="col-calculator">{labor.employer}</Col>
                  </Row>
                  <Row className="m-3 card-red-txt">
                    <Col>個人負擔 20%</Col>
                    <Col className="col-calculator">{labor.personal}</Col>
                  </Row>
                  <hr />
                  <Row className="m-3">
                    <Col>合計</Col>
                    <Col className="col-calculator">{labor.total}</Col>
                  </Row>
                </Card.Body>
              </Card>
              <Col className="col-comment">
                <Form.Label>
                  2023.01.01 <br />
                  1.配合基本工資調整，第一級投保級距調整為 26,400 元 <br />
                  2.普通事故保險費率從 10.5% 調整為 11% <br />
                  (就業保險費率維持 1%，故勞保費率調整為 12%)
                </Form.Label>
              </Col>
            </Col>
            <Col sm={12} md={12} lg={6} xl={6} xxl={4}>
              <Card className="shadow-lg rounded m-3" border="light">
                <Card.Body className="card-body">
                  <Card.Title className="card-title">健保</Card.Title>
                  <Row className="m-3">
                    <Col>投保級距</Col>
                    <Col className="col-calculator">{health.salaryLevel}</Col>
                  </Row>
                  <Row className="m-3">
                    <Col>政府負擔 10%</Col>
                    <Col className="col-calculator">{health.government}</Col>
                  </Row>
                  <Row className="m-3">
                    <Col>雇主負擔 60%</Col>
                    <Col className="col-calculator">{health.employer}</Col>
                  </Row>
                  <Row className="m-3">
                    <Col>扶養眷屬</Col>
                    <Col xs='auto'>
                      <Form.Select
                        className="col-calculator text-center"
                        value={health.dependents} onChange={this.handleDependentsChange}>
                        <option value="0">0</option>
                        <option value="1">1</option>
                        <option value="2">2</option>
                        <option value="3">3人以上(包含)</option>
                      </Form.Select>
                    </Col>
                  </Row>
                  <Row className="m-3 card-red-txt">
                    <Col>個人負擔 30%</Col>
                    <Col className="col-calculator">{health.personal}</Col>
                  </Row>
                  <hr />
                  <Row className="m-3">
                    <Col>合計</Col>
                    <Col className="col-calculator">{health.total}</Col>
                  </Row>
                </Card.Body>
              </Card>
              <Col className="col-comment">
                <Form.Label>
                  2023.01.01 <br />
                  1.配合基本工資調整，第一級投保級距調整為 26,400 元 <br />
                  2.調整平均眷口為 0.57 人<br />
                  (投保單位負擔金額含本人及平均眷屬合計為 1.57 人) <br />
                  3.健保費率維持 5.17%
                </Form.Label>
              </Col>
            </Col>
            <Col sm={12} md={12} lg={6} xl={6} xxl={4}>
              <Card className="shadow-lg rounded m-3" border="light">
                <Card.Body className="card-body">
                  <Card.Title className="card-title">個人統計</Card.Title>
                  <Row className="m-3 card-green-txt">
                    <Col>+ 本薪</Col>
                    <Col className="col-calculator">{statistics.basicSalary}</Col>
                  </Row>
                  <Row className="m-3 card-red-txt">
                    <Col>- 勞保負擔</Col>
                    <Col className="col-calculator">{labor.personal}</Col>
                  </Row>
                  <Row className="m-3 card-red-txt">
                    <Col>- 健保負擔</Col>
                    <Col className="col-calculator">{health.personal}</Col>
                  </Row>
                  <Row className="m-3 card-red-txt">
                    <Col>- 自提 6%</Col>
                    <Col className="col-calculator">{pension.personal}</Col>
                  </Row>
                  <hr />
                  <Row className="m-3 card-green-txt">
                    <Col>+ 實領薪資</Col>
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
                  <Card.Title className="card-title">勞退(6%)</Card.Title>
                  <Row className="m-3">
                    <Col>投保級距</Col>
                    <Col className="col-calculator">{pension.salaryLevel}</Col>
                  </Row>
                  <Row className="m-3">
                    <Col>雇主負擔</Col>
                    <Col className="col-calculator">{pension.employer}</Col>
                  </Row>
                </Card.Body>
              </Card>
            </Col>
            <Col sm={12} md={12} lg={6} xl={6} xxl={4}>
              <Card className="shadow-lg rounded m-3" border="light" style={{ marginTop: 10 }}>
                <Card.Body className="card-body">
                  <Card.Title className="card-title">自提(最高6%)</Card.Title>
                  <Row className="m-3">
                    <Col>投保級距</Col>
                    <Col className="col-calculator">{pension.salaryLevel}</Col>
                  </Row>
                  <Row className="m-3 card-red-txt">
                    <Col>個人負擔</Col>
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