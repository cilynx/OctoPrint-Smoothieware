# coding=utf-8
from __future__ import absolute_import

import octoprint.plugin

class SmoothiewarePlugin(octoprint.plugin.SettingsPlugin,
                         octoprint.plugin.StartupPlugin,
                         octoprint.plugin.AssetPlugin,
                         octoprint.plugin.TemplatePlugin):

        def on_after_startup(self):
            self._logger.info("Expecting Smoothieware block device at " + self._settings.get(["device"]))

	##~~ SettingsPlugin mixin

	def get_settings_defaults(self):
		return dict(
                   device="/dev/sda1"
		)

        def get_template_configs(self):
            return [
                    dict(type="settings", custom_bindings="False")
                    ]


	##~~ AssetPlugin mixin

	def get_assets(self):
		# Define your plugin's asset files to automatically include in the
		# core UI here.
		return dict(
			js=["js/smoothieware.js"],
			css=["css/smoothieware.css"],
			less=["less/smoothieware.less"]
		)

	##~~ Softwareupdate hook

	def get_update_information(self):
		# Define the configuration for your plugin to use with the Software Update
		# Plugin here. See https://github.com/foosel/OctoPrint/wiki/Plugin:-Software-Update
		# for details.
		return dict(
			smoothieware=dict(
				displayName="Smoothieware Integration",
				displayVersion=self._plugin_version,

				# version check: github repository
				type="github_release",
				user="cilynx",
				repo="OctoPrint-Smoothieware",
				current=self._plugin_version,

				# update method: pip
				pip="https://github.com/cilynx/OctoPrint-Smoothieware/archive/{target_version}.zip"
			)
		)

# If you want your plugin to be registered within OctoPrint under a different name than what you defined in setup.py
# ("OctoPrint-PluginSkeleton"), you may define that here. Same goes for the other metadata derived from setup.py that
# can be overwritten via __plugin_xyz__ control properties. See the documentation for that.
__plugin_name__ = "Smoothieware Integration"

def __plugin_load__():
	global __plugin_implementation__
	__plugin_implementation__ = SmoothiewarePlugin()

	global __plugin_hooks__
	__plugin_hooks__ = {
		"octoprint.plugin.softwareupdate.check_config": __plugin_implementation__.get_update_information
	}

