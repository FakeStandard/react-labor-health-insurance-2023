import React from "react";
import './Home.css';

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
      <div>home</div>
    )
  }
}