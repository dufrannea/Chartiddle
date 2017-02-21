import "jquery";
import "bootstrap";
import "../stores/RouteStore";
import {startReact} from './main'
import {appActions as Actions} from '../actions/Actions'
import {ApplicationService} from '../services/ApplicationService'
import {ProxiedWorker} from "../infrastructure/ObjectProxy"
import {Container} from '../infrastructure/Container'
import {Router} from './routing'
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/css/bootstrap-theme.min.css";
import "../../styles/style.scss";
	
ProxiedWorker
	.Load<ApplicationService>(ApplicationService,"app/bootstrap")
	.then(applicationService=> {
		Container.ApplicationService = applicationService;
		return applicationService.getAllDataSourcesAsync()
	})
	.then(value => {
		Actions.modelLoaded(value);
	})
    .then(()=>{
        startReact();
        Router.setupRoutes();        
    }); 

