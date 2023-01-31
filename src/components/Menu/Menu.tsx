import React from "react";
import { Nav } from 'react-bootstrap';
import NavbarCollapse from "react-bootstrap/esm/NavbarCollapse";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faCalculator, faTable, faCaretDown, faCaretUp } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';
import './Menu.css';

interface IMenuProps { }
interface IMenuStates {
  collapsed: boolean;
}

export class Menu extends React.Component<IMenuProps, IMenuStates>{
  constructor(props: IMenuProps) {
    super(props)

    this.state = {
      collapsed: true
    }
  }

  private navTableClick = (ev: any) => this.setState({ collapsed: !this.state.collapsed })

  public render(): React.ReactElement<IMenuProps> {
    return (
      <div className="menu">
        <h3 className="header">test
          {/* 2023 <br />薪資即時試算與勞健保查詢 */}
        </h3>
        <Nav defaultActiveKey='/home' className='nav'>
          <Nav.Item>
            <Nav.Link as={Link} to="/home" className="link">
              {/* <FontAwesomeIcon icon={faHome} /> */}
              &nbsp;Home
            </Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link as={Link} to='/calculation' className='link'>
              &nbsp;薪資即時試算
            </Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link className='link' onClick={this.navTableClick}>
              <FontAwesomeIcon icon={this.state.collapsed ? faCaretDown : faCaretUp} className='collapsed-icon' />
              {/* <FontAwesomeIcon icon={faTable} /> */}
              &nbsp;分級表
            </Nav.Link>
            <NavbarCollapse in={this.state.collapsed} className='nav-collapse'>
              <Nav.Item>
                <Nav.Link as={Link} to='/labor-grading-table' className='link pl-5'>
                  &nbsp;勞工保險投保薪資
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link as={Link} to='/health-grading-table' className='link'>
                  &nbsp;全民健康保險投保金額
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link as={Link} to='/pension-grading-table' className='link'>
                  &nbsp;勞工退休金月提繳工資
                </Nav.Link>
              </Nav.Item>
            </NavbarCollapse>
          </Nav.Item>
        </Nav>
      </div>
    )
  }
}