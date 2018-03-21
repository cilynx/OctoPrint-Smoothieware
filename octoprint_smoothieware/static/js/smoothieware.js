/*
 * View model for OctoPrint-Smoothieware
 *
 * Author: Randy C. Will
 * License: AGPLv3
 */
$(function() {
    function SmoothiewareViewModel(parameters) {
        var self = this;

        // assign the injected parameters, e.g.:
        self.loginStateViewModel = parameters[0];
        self.settingsViewModel = parameters[1];

	console.log(self.loginStateViewModel);
	console.log(self.settingsViewModel);

	self.loadingConfig = ko.observable(false);

	var idle_count = 0;
	var config = "";
	self.fromCurrentData = function(data) {
	   _.each(data.logs, function(line) {
	      if(/# Smoothieboard configuration file/.exec(line)) {
		 self.loadingConfig(true);
	      }
	      if(self.loadingConfig()) {
		 if(/Recv:.*[a-z]{3,}/.exec(line)) {
		    config += line + "\n";
		    idle_count = 0;
		 } else if(/Send:/.exec(line)) {
		    if(++idle_count > 1) {
		       self.loadingConfig(false);
		       alert(config);
		    }
		 }
	      }
	      return line;
	   });
	}
    }

    /* view model class, parameters for constructor, container to bind to
     * Please see http://docs.octoprint.org/en/master/plugins/viewmodels.html#registering-custom-viewmodels for more details
     * and a full list of the available options.
     */
    OCTOPRINT_VIEWMODELS.push({
        construct: SmoothiewareViewModel,
        // ViewModels your plugin depends on, e.g. loginStateViewModel, settingsViewModel, ...
        dependencies: [ "loginStateViewModel", "settingsViewModel" ],
        // Elements to bind to, e.g. #settings_plugin_smoothieware, #tab_plugin_smoothieware, ...
        elements: [ "#settings_plugin_smoothieware" ]
    });
});
