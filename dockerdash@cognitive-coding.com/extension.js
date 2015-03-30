
const St = imports.gi.St;
const Main = imports.ui.main;
const Tweener = imports.ui.tweener;
const GLib = imports.gi.GLib;
const Mainloop = imports.mainloop;

let bgContainer, container, timer, dockers;

let timeout = 10;

function _updateDisplay() {
  let output = GLib.spawn_command_line_sync("docker ps");
  let parsed_output = _parseOutput(output[1].toString()).map(function(ar) {
    return ar[2] + ": " + ar[1] + "\n  " + ar[0];
  }).join("\n");

  container.set_text(parsed_output);
}

function _parseOutput(out) {
  let lines = out.trim().split("\n");

  let command_start_idx = lines[0].indexOf("COMMAND");
  let command_end_idx = lines[0].indexOf("CREATED");
  let status_start_idx = lines[0].indexOf("STATUS");
  let status_end_idx = lines[0].indexOf("PORTS");
  let names_start_idx = lines[0].indexOf("NAMES");

  let output = [];

  for(var i = 1; i < lines.length; i++) {
    output.push([lines[i].substring(command_start_idx, command_end_idx).trim(),
                 lines[i].substring(status_start_idx, status_end_idx).trim(),
                 lines[i].substring(names_start_idx).trim()]);
  }

  return output;
}

function _autorefresh() {
  timer = Mainloop.timeout_add_seconds(timeout, function() {
    _updateDisplay();
    _autorefresh();
  });
}

function _showContainer() {
    if (!container) {
        bgContainer = Main.uiGroup.get_child_at_index(0).get_child_at_index(0);
        container = new St.Label({ style_class: 'dashboard-container', text: "dashboard" });
        bgContainer.add_actor(container);
    }

    _updateDisplay();
    _autorefresh();

    container.opacity = 255;

    let monitor = Main.layoutManager.primaryMonitor;

    container.set_position(monitor.x + monitor.width - container.width,
                           monitor.y + Math.floor(monitor.height / 2 - container.height / 2));
}

function _hideContainer() {
    bgContainer.remove_actor(container);
    container = null;
}

function init() {
}

function enable() {
  _showContainer();
}

function disable() {
  _hideContainer();
}
