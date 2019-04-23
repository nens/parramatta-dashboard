========================
Parramatta-Configuration
========================

This file only shows configuration that is specific for the Parramatta Dashboard.
See `Tile Dashboards Technical Documentation <https://github.com/nens/lizard-tile-dashboard/blob/master/configuration/clientConfiguration.rst>`_ for more (general) explanation and properties that are shared by both the Lizard Tile Dashboard and the Parramatta Dashboard.

.. contents:: Table of Contents
   :local:

In this folder, some examples are shown for the client configuration in the admin.
The jsons in this folder contain the code per example mentioned below.


Properties example
==================

**First an example:**
Below the example are the properties of the tile dashboards.

- What it does
- Format
- Required
- Where it is defined

**Actual properties:**


Meta-properties
===============

- No different properties compared with Lizard Tile Dashboard.


Tile properties
===============

refreshAutomatic
----------------
- If true, then dashboard will be refreshed as defined in refreshEveryMiliseconds
- true/false 
- No, defaults to false
- on root level of JSON

refreshEveryMiliseconds
-----------------------
- Amount miliseconds that dashboard gets refreshed. Works only if refreshAutomatic=true
- integer
- No, defaults to 300000
- on root level of JSON


Tile type: map
==============

The map type tiles can show measuring stations, points and WMS layers, possibly of temporal rasters.

legend
------
- This configures the legend for map type tiles.
  ::

    legend: {
      "opacity": 0.8
    }

extraLegends
------------
- Shows extra legends (for WMS layers, for instance). Example:
  ::

    [
      {
        "title": "Zones",
        "steps": [
          {
            "color": "red",
            "text": "Danger zone"
          },
          {
            "color": "blue",
            "text": "Water zone"
          }
        ]
      },
      ...more extra legends...
    ]

- array of optional extra legends.
- No
- in map of JSON (?)

- Object with property "opacity". The opacity should be a float.
- No, neither the legend property nor the opacity property of the legend is required. The default for the opacity is set to 0.8 if this is not set.
- Within the map tile type.


Tile type: timeseries
=====================

The timeseries type tiles are charts of timeseries, they can have two sources: intersections of a point geometry with a raster or timeseries objects from the API.

It’s not possible yet to set the color of charts of raster intersections, they are a few shades of blue at the moment.

legendStrings
-------------
- Strings to use in the chart legend to describe the series. The unit from the observation type will be added, if present. If no legendString is set, the observation type parameter and unit are used (often leads to several series having the same legend, so in that case these strings must be set).
- Strings
- No, but a default is set (see 1st point of this legendStrings).
- in timeseries of JSON (?)

legend
------
- This configures the legend for timeseries type tiles. You can make the colors transparant by using rgba colors, as has been done for bgcolor with rgba(22, 160, 133, *0.25*).
  ::

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

- Object with the properties shown above.
- No, neither the legend property nor the properties of the legend are required.
- Within the timeseries tile type.

Example JSONs:

* example-with-legend.json (transparent legend)
* example-with-legend-show-possibilities.json (all of the above)

timeLines
---------
- With timeLines, you can set one or multiple timelines which are horizontal lines in timeseries tiles.
- An array of objects (with the mandatory properties epochTimeInMilliSeconds, color, lineDash, text, and isRelativeTimeFromNow). The time must be set in milliseconds. The time can be set relative from now (by setting isRelativeTimeFromNow to true and epochTimeInMilliSeconds to the time you want it to be relatiive from now, either a positive or negative number). The time can also be set absolute. In this case, isRelativeTimeFromNow should be set to false and epochTimeInMilliSeconds should be set to the epoch time in milliseconds. Example:
  ::

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

- No. The timeLines property is not mandatory for a timeseries tile. But if you use the timeLines property, it is mandatory to fill in the epochTimeInMilliSeconds, color, lineDash, text and isRelativeTimeFromNow for each timeLine you configure.
- Within the timeseries tile type.

backgroundColorShapes
---------------------
- Background color shapes create a background color for a specific moment in time.
- An array of objects (with the mandatory properties x1EpochTimeInMilliSeconds, x2EpochTimeInMilliSeconds, color, opacity and isRelativeTimeFromNow). Like with the timelines, the time must be set in milliseconds. The time can be set relative from now (by setting isRelativeTimeFromNow to true and epochTimeInMilliSeconds to the time you want it to be relatiive from now, either a positive or negative number). The time can also be set absolute. In this case, isRelativeTimeFromNow should be set to false and epochTimeInMilliSeconds should be set to the epoch time in milliseconds.
  ::

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

- No. The backgroundColorShapes property is not mandatory for a timeseries tile. But if you use the backgroundColorShapes property, it is mandatory to fill in the x1EpochTimeInMilliSeconds, x2EpochTimeInMilliSeconds, color, opacity and isRelativeTimeFromNow for each backgroundColorShapes you configure.
- Within the timeseries tile type.

If you want a backgroundColorShape with a line to the right of it, you should create a timeline on that moment in time. See:

- example-with-timelines-and-backgroundcolorshapes.json


Tile type: statistics
=====================

Nothing can be configured in a statistics type tile, so there should be exactly 1 of this tile type in the list.

The app just retrieves all the alarms that the user has access to, assumes they’re all relevant, and shows statistics on them.

- No different properties compared with Lizard Tile Dashboard.


Tile type: external
===================

The external type tile is for external web pages (must be https, and may have headers that prevent us from using iframes, so not all pages work!).

- No different properties compared with Lizard Tile Dashboard.
