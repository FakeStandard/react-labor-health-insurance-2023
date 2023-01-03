import React from "react";
import { ICalculationProps } from "./ICalculationProps";
import { ICalculationStates } from "./ICalculationStates";

export default class Calculation extends React.Component<ICalculationProps, ICalculationStates>{
    constructor(props: ICalculationProps) {
        super(props)

        this.state = {

        }
    }

    public render(): React.ReactElement<ICalculationProps> {
        return (
            <div>Calculation</div>
        )
    }
}