import React from "react";
import { Outlet } from 'react-router-dom';
import './Layout.css';
import { Menu } from "../Menu/Menu";

export class Layout extends React.Component {
  public render(): React.ReactNode {
    return (
      <div className='layout'>
        <Menu />
        <Outlet />
      </div>
    )
  }
}