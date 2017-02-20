import "highcharts";
import React = require('react');
import {appActions as Actions} from '../../actions/Actions'
import $ = require('jquery');
import {IQueryResult} from "../../model/model";

import * as HighCharts from "highcharts";

const baseConfig = {
    chart: {
        type: 'column',
        events: {
            drilldown: function(e) {
                console.info(e.point, e);
            }
        }
    },
    title: {
        text: ''
    },
    subtitle: {
        text: ''
    },
    xAxis: {
        type: 'category'
    },
    yAxis: {
        min: 0,
        title: {
            text: ''
        }
    },
    plotOptions: {
        column: {
            stacking: null //'normal'
        }
    },
    series: []
};
const stacked = false;
const graphType = "column";

let buildConfig = (props: IChartProps) => {
    let result = props.data;

    let cats = result.Columns;
    let vals = result.Values;
    let series = [];
    for (let i = 0; i < vals.length; i++) {
        // should pick the name of the columns here...
        var colIndex = 0;
        let serie = vals[i].map((x) => {
            let columnTuple = result.Columns[colIndex];
            colIndex += 1;
            return {
                name: columnTuple
                    .members
                    .map(x=> x.name)
                    .reduce((p, c) => p + "," + c),
                y: x,
                drilldown: true
            }
        });

        var name = result.Rows[i]
            .members
            .map(x=> x.name)
            .reduce((p, c) => p + "," + c);

        series.push({
            name: name,
            data: serie
        });
    }

    var newConfig = baseConfig;
    newConfig.chart.type = props.chartType;
    newConfig.series = series;
    if (props.stacked) {
        newConfig.plotOptions.column.stacking = 'normal';
    } else {
        newConfig.plotOptions.column.stacking = null;
    }
    return newConfig;
}
interface IChartProps {
    data: IQueryResult;
    loading: boolean;
    key?: number;
    chartType: string;
    stacked: boolean;
}
interface IChartState {
}
export class Chart extends React.Component<IChartProps, IChartState> {
    private chart: any;
    private changeListener: any;
    constructor() {
        super();
    }
    render() {
        return (
            <div>
                <div ref="chart"></div>
                <div style={{ display: this.props.loading ? '' : 'none' }} className="spinner-centerer">
                    <div className="spinner-container">
                        <div className="whirly-loader"/>
                        </div>
                    </div>
                </div>
        );
    }
    componentWillUnmount() {
        if (this.chart) {
            $(this.chart).highcharts().destroy();
        }
    }

    updateChart(props: IChartProps) {
        let data = props.data;
        if (data != null) {
            let domElement = this.refs["chart"]['getDOMNode']();
            this.chart = $(domElement).highcharts(buildConfig(props));
        }
    }
    componentWillReceiveProps(newProps: IChartProps) {
        console.info("updating chart");
        // let oldData = this.props.data;
        // if (oldData !== newProps.data){
        this.updateChart(newProps);
        // }
    }
}