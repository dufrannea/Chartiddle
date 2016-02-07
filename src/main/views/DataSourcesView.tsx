// - list saved data sources (name, size)
//	- edit name
//	- delete?
//	- view contents?
//	- create new graph from data source
// - upload (local file, dropbox, drive)

/// <reference path="../../typings/tsd.d.ts"/>
import React = require('react');
import {DataSourceList} from './components/DataSourceList'

export class DataSourcesViewComponent extends React.Component<Object, Object> {
    constructor() {
        this.state = {};
        super();
    }
    
    render() {
        return (
            <div className="container">
                <DataSourceList />
            </div>
        );
    }
}