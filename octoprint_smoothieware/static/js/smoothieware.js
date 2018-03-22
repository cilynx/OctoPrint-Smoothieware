/*
 * View model for OctoPrint-Smoothieware
 *
 * Author: Randy C. Will
 * License: AGPLv3
 */
$(function() {
    function ConfigLine(line, control) {
	var self = this;

	line = line.replace(/Recv:\s*/,'');					// Strip the receive header

	self.type = ko.observable('');						// Line type ['heading','comment','item']
	self.text = ko.observable('');						// Main text or config item
	self.value = ko.observable('');						// Value of a live config item
	self.description = ko.observable('');					// Descriptive comment of a live config item

	if(/^#{2,}/.exec(line)) {						// If line looks like a section heading
	    self.type('heading');						// Line type is heading
	    self.text(line.replace(/^#{2,}\s*/,''));				// Display text is everything after the hashes
	} else if(/^#/.exec(line)) {						// Else If line looks like a comment
	    self.type('comment');						// Line type is comment
	    self.text(line.replace(/^#\s*/,''));				// Display text is everything after the hash
	} else {								// Else
	    self.type('item');							// Line type is item
	    self.text(line.replace(/\s.*/,''));					// Display text is everything up to the first whitespace
	    self.value(line.replace(/^\S+\s+(\S+)\s.*/, '$1'));			// Set the current value to the second set of non-whitespace characters
	    self.value.subscribe(function() {					// Subscribe a callback for when the user changes the value
		control.sendCustomCommand({ command: "config-set sd " + self.text() + " " + self.value() });
	    });
	    self.description(line.replace(/^\S+\s+\S+\s+(#.*)$/, '$1'));	// Catch the descriptive comment after the value
	}
    };

    function SmoothiewareViewModel(parameters) {
        var self = this;

        // assign the injected parameters, e.g.:
        self.loginStateViewModel = parameters[0];
        self.settingsViewModel = parameters[1];
        self.controlViewModel = parameters[2];

	console.log(self.loginStateViewModel);
	console.log(self.settingsViewModel);

	self.config = ko.observableArray();
	self.loadingConfig = ko.observable(false);
	self.loadedConfig = ko.observable(false);

	var idle_count = 0;

	self.fromCurrentData = function(data) {
	   _.each(data.logs, function(line) {
	      if(/# Smoothieboard configuration file/.exec(line)) {		// If we see the start of a config file
		 self.loadingConfig(true);					// We are loading
		 timer = setInterval(function() { idle_count++; }, 500);	// Increment the idle counter every half second
		 console.log("Starting Smoothieware config load.");
	      }
	      if(self.loadingConfig()) {					// If we are loading
		 if(/Recv:.*[a-z]{3,}/.exec(line)) {				// If the line looks like a config line
		    self.config.push(new ConfigLine(line, self.controlViewModel));
		    idle_count = 0;						// Reset the idle counter so we keep reading lines
		 } else if(idle_count > 1) {					// If we've gone more than one second without a valid config line
		    self.loadingConfig(false);					// We're no longer loading
		    self.loadedConfig(true);					// We have loaded
		    clearInterval(timer);					// Kill the idle timer
		    console.log("Done loading Smoothieware config.");
		 }
	      }
	      return line;
	   });
	};

	self.requestSmoothieConfig = function() {
	    self.config([]);
	    self.controlViewModel.sendCustomCommand({ command: "cat /sd/config" });
	};

	self.requestSmoothieReset = function() {
	    self.config([]);
	    self.controlViewModel.sendCustomCommand({ command: "reset" });
	};
    }

    /* view model class, parameters for constructor, container to bind to
     * Please see http://docs.octoprint.org/en/master/plugins/viewmodels.html#registering-custom-viewmodels for more details
     * and a full list of the available options.
     */
    OCTOPRINT_VIEWMODELS.push({
        construct: SmoothiewareViewModel,
        // ViewModels your plugin depends on, e.g. loginStateViewModel, settingsViewModel, ...
        dependencies: [ "loginStateViewModel", "settingsViewModel", "controlViewModel" ],
        // Elements to bind to, e.g. #settings_plugin_smoothieware, #tab_plugin_smoothieware, ...
        elements: [ "#settings_plugin_smoothieware" ]
    });
});
