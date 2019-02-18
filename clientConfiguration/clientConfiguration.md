In this folder, some examples are shown for the client configuration in the admin.
The jsons in this folder contain the code per example mentioned below.

# Timelines and backgroundColorShapes
To add timelines to a type: timeseries tile, you can add the following to this tile:
All the properties (epochTimeInMilliSeconds, color, lineDash, text, isRelativeTimeFromNow) are mandatory to configure a timeline.
The time must be set in milliseconds. The time can be set relative from now (by setting isRelativeTimeFromNow to true and epochTimeInMilliSeconds to the time you want it to be relatiive from now, either a positive or negative number). The time can also be set absolute. In this case, isRelativeTimeFromNow should be set to false and epochTimeInMilliSeconds should be set to the epoch time in milliseconds.

```
"timelines": [
  {
    "epochTimeInMilliSeconds": 0,
    "color": "#C0392B",
    "lineDash": "dot",
    "text": "NOW",
    "isRelativeTimeFromNow": true
  },
  {
    "epochTimeInMilliSeconds": 7200000,
    "color": "#FFC850",
    "lineDash": "dot",
    "text": "NOW+2 hour",
    "isRelativeTimeFromNow": true
  },
  {
    "epochTimeInMilliSeconds": 43200000,
    "color": "#16A085",
    "lineDash": "dot",
    "text": "NOW+12 hour",
    "isRelativeTimeFromNow": true
  },
  {
    "epochTimeInMilliSeconds": 1550270003000,
    "color": "#BABABA",
    "lineDash": "dot",
    "text": "Absolute timeline",
    "isRelativeTimeFromNow": false
  }
]
```


To add backgroundColorShapes (that create a background color) to a type: timeseries tile, you can add the following to this tile:
All the properties (x1EpochTimeInMilliSeconds, x2EpochTimeInMilliSeconds, color, opacity, isRelativeTimeFromNow) are mandatory to configure a backgroundColorShape.
Like with the timelines, the time must be set in milliseconds. The time can be set relative from now (by setting isRelativeTimeFromNow to true and epochTimeInMilliSeconds to the time you want it to be relatiive from now, either a positive or negative number). The time can also be set absolute. In this case, isRelativeTimeFromNow should be set to false and epochTimeInMilliSeconds should be set to the epoch time in milliseconds.

```
"backgroundColorShapes": [
  {
    "x1EpochTimeInMilliSeconds": 0,
    "x2EpochTimeInMilliSeconds": 7200000,
    "color": "#FFC850",
    "opacity": "0.5",
    "isRelativeTimeFromNow": true
  },
  {
    "x1EpochTimeInMilliSeconds": 7200000,
    "x2EpochTimeInMilliSeconds": 43200000,
    "color": "#FFF082",
    "opacity": "0.5",
    "isRelativeTimeFromNow": true
  },
  {
    "x1EpochTimeInMilliSeconds": 1550237003000,
    "x2EpochTimeInMilliSeconds": 1550270003000,
    "color": "#BABABA",
    "opacity": "0.5",
    "isRelativeTimeFromNow": false
  }
]
```

If you want a backgroundColorShape with a line to the right of it, you should create a timeline on that moment in time.

# Legend

## Legend (timeseries)

The legend for timeseries tiles can also be configured.

Below shows an example of what to add to the configuration of a timeseries tile for a legend that is white with 0.25 opacity:

```
"legend": {
  "bgcolor": "rgba(255, 255, 255, 0.25)"
}
```

But there are more possibilities. Below are the possibilities for legend configuration. Add them to a timeseries tile. All possibilities are optional.

```
"legend": {
	"x": 5,
	"xanchor": "right",
	"y": "0.5",
	"yanchor": "top",
	"bgcolor": "rgba(22, 160, 133, 0.25)",
	"bordercolor": "rgba(22, 160, 133, 1)",
	"borderwidth": 3,
	"font": {
		"family": "Futura, monospace",
		"size": 17,
		"color": "purple"
	},
	"orientation": "h",
	"traceorder": "reversed",
	"tracegroupgap": 20,
	"uirevision": "",
	"valign": "top"
}
```

## Legend (map)

The legend of the map can also be configured.
To configure the opacity of this legend, add an opacity to the configuration of an tile with type map, like below:

```
"opacity": 0.8
```
