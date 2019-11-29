class AlertService {
	constructor($rootScope) {
		this.alerts = [];
	}
	add(_alert){
		this.alerts.push(_alert);
		this.alerts.filter((item, pos, self) => self.indexOf(item) == pos);
		while(this.alerts.length){
			_alert = this.alerts.shift();
			if(_alert) alert(_alert);
		}
	}
}

AlertService.$inject = ['$rootScope'];

export default AlertService;