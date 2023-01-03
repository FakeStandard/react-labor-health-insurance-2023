import React from "react";
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from "./Home/Home";
import Calculation from "./Calculation/Calculation";
import { Layout } from "./Layout/Layout";
import { Labor } from "./GradingTable/Labor/Labor";
import { Health } from "./GradingTable/Health/Health";
import { Pension } from "./GradingTable/Pension/Pension";

export class Router extends React.Component {
  public render(): React.ReactNode {
    return (
      <BrowserRouter>
        <Routes>
          <Route path='/' element={<Layout />}>
            <Route path='home' element={<Home />} />
            <Route path='calculation' element={<Calculation />} />
            <Route path='labor-grading-table' element={<Labor />} />
            <Route path='health-grading-table' element={<Health />} />
            <Route path='pension-grading-table' element={<Pension />} />
          </Route>
        </Routes >
      </BrowserRouter>
    )
  }
}