// - list saved data sources (name, size)
//	- edit name
//	- delete?
//	- view contents?
//	- create new graph from data source
// - upload (local file, dropbox, drive)

import * as React from 'react';
import { Component } from 'react';
import { DataSourceList } from './components/DataSourceList'

export const DataSourcesViewComponent = () => {
    return (
        <div className="container">
            <DataSourceList />
        </div>
    );
}