import ReactDOM from "react-dom";
import { divIcon } from "leaflet";
import {
  IconActiveAlarmSVG,
  IconInactiveAlarmSVG,
  IconNoAlarmSVG
} from "./Icons";

const IconActiveAlarmDiv = document.createElement("div");
const IconInactiveAlarmDiv = document.createElement("div");
const IconNoAlarmDiv = document.createElement("div");

ReactDOM.render(IconActiveAlarmSVG, IconActiveAlarmDiv);
ReactDOM.render(IconInactiveAlarmSVG, IconActiveAlarmDiv);
ReactDOM.render(IconNoAlarmSVG, IconNoAlarmDiv);

// Active alarm: red check
export const IconActiveAlarm = divIcon({
  className: "my-div-icon",
  html: IconActiveAlarmDiv.innerHTML
});

// Inactive alarm: green check
export const IconInactiveAlarm = divIcon({
  className: "my-div-icon",
  html: IconInactiveAlarmDiv.innerHTML
});

// No alarm: blue check
export const IconNoAlarm = divIcon({
  className: "my-div-icon",
  html: IconNoAlarmDiv.innerHTML
});
