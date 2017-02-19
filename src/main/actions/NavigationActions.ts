import {dispatcher as Dispatcher} from '../infrastructure/Dispatcher'
import {AppConstants, ApplicationTabs} from './AppConstants'
import {RouteConstants} from './RouteConstants'
import {IDataSource} from "../model/model";

export module NavigationActions {
	/**
	 * Preview charts for datasource
	 * @param {IDataSource} : the datasource.
	 */
	export function previewChartsForDataSource(dataSource : IDataSource){
		Dispatcher.dispatch(<any>{
			routeActionType : RouteConstants.NAVIGATE_DATASOURCES_LIST,
			routeData : undefined
		})
	}
	
	/**
	 * Select a datasource to 
	 * go and play with it.
	 * @param datasourceId - {number}: the datasourceId.
	 */
	export function viewChartForDataSource(dataSourceId : number) {
		Dispatcher.dispatch(<any>{
		    routeActionType : RouteConstants.NAVIGATE_DATASOURCE,
			routeData : dataSourceId
		})
	}
	
	/**
	 * Back to the datasources list.
	 */
	export function navigateDataSourcesList(){
		Dispatcher.dispatch(<any>{
			routeActionType : RouteConstants.NAVIGATE_DATASOURCES_LIST,
			routeData : undefined
		})
	}
}
