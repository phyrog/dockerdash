
const St = imports.gi.St;
const Main = imports.ui.main;
const Tweener = imports.ui.tweener;
const GLib = imports.gi.GLib;
const Mainloop = imports.mainloop;

let bgContainer, container, timer, dockers;

let timeout = 10;

function _updateDisplay() {
  let output = GLib.spawn_command_line_sync("docker ps --no-trunc");
  let parsed_output = _parseOutput(output[1].toString());

  if(container) {
    bgContainer.remove_actor(container);
  }

  container = new St.BoxLayout({ style_class: 'dockerdash-container' });
  container.set_vertical(true);
  bgContainer.add_actor(container);

  for(var i = 0; i < parsed_output.length; i++) {
    let innercontainer = new St.BoxLayout({ style_class: 'dockerdash-docker-container' });
    innercontainer.set_vertical(true);
    let titleline = new St.BoxLayout({ style_class: 'dockerdash-docker-titleline' });
    let titletext = new St.Label({ style_class: 'dockerdash-docker-name', text: parsed_output[i][2] });
    let uptimetext = new St.Label({ style_class: 'dockerdash-docker-uptime', text: parsed_output[i][1] });
    uptimetext.set_x_expand(true);
    let commandtext = new St.Label({ style_class: 'dockerdash-docker-command', text: parsed_output[i][0] });

    container.add_actor(innercontainer);
    innercontainer.add_actor(titleline);
    titleline.add_actor(titletext);
    titleline.add_actor(uptimetext);
    innercontainer.add_actor(commandtext);
  }

  container.opacity = 255;

  let monitor = Main.layoutManager.primaryMonitor;

  container.set_position(monitor.x + monitor.width - container.width,
                         monitor.y + Math.floor(monitor.height / 2 - container.height / 2));
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
    output.push([lines[i].substring(command_start_idx, command_end_idx).trim().slice(1,-1),
                 lines[i].substring(status_start_idx, status_end_idx).trim().slice(3),
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
    bgContainer = Main.uiGroup.get_child_at_index(0).get_child_at_index(0);

    _updateDisplay();
    _autorefresh();
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
