import findIndex from "lodash/findIndex";

function makeFixed(value) {
  // Hardcoded rounding to 2 decimals. Would be nicer if it could be set in
  // observation type or so.
  if (value !== undefined && value !== null && value.toFixed) {
    return value.toFixed(2);
  } else {
    return value;
  }
}

function getColor(colors, idx) {
  let color;

  if (colors && colors.length > idx) {
    color = colors[idx];
  } else {
    color = ["#26A7F1", "#000058", "#99f"][idx % 3]; // Some shades of blue
  }

  return color;
}

export function axisLabel(observationType) {
  return observationType.unit || observationType.reference_frame;
}

export function indexForType(axes, observationType) {
  return findIndex(
    axes,
    ax =>
      ax &&
      observationType &&
      axisLabel(ax) === axisLabel(observationType) &&
      ax.scale === observationType.scale
  );
}

export function combineEventSeries(series, axes, colors, full) {
  return series.map((serie, idx) => {
    const isRatio = serie.observation_type.scale === "ratio";

    const events = {
      x: serie.events.map(event => new Date(event.timestamp)),
      y: serie.events
        .map(event => (event.hasOwnProperty("max") ? event.max : event.sum))
        .map(makeFixed),
      name: serie.observation_type.getLegendString(),
      hoverinfo: full ? "name+y" : "none",
      hoverlabel: {
        namelength: -1
      }
    };

    const yaxis = indexForType(axes, serie.observation_type);
    const color = getColor(colors, idx);

    if (yaxis > 0) {
      events.yaxis = "y2";
    }

    if (isRatio) {
      // Bar plot.
      events.type = "bar";
      events.marker = {
        color: color
      };
    } else {
      // Line plot.
      events.type = "scatter";
      events.mode = "lines+points";
      events.line = {
        color: color
      };
    }

    return events;
  });
}

export function getNow(configuredNow) {
  if (configuredNow !== null) {
    return configuredNow;
  }
  // Use modulo operator so the "now" time only changes every five minutes, so we
  // don't have to fetch different data for each chart after every second.
  const currentTimestamp = new Date().getTime();
  return new Date(currentTimestamp - currentTimestamp % 300);
}

export function currentPeriod(configuredNow, bootstrap) {
  // Return start and end of the current period in charts, as UTC timestamps.
  // Defined as a period around 'now', in hours.
  const now = getNow(configuredNow);
  let offsets;

  if (
    bootstrap &&
    bootstrap.configuration &&
    bootstrap.configuration.periodHoursRelativeToNow
  ) {
    offsets = bootstrap.configuration.periodHoursRelativeToNow;
  } else {
    offsets = [-24, 12];
  }

  const period = {
    start: now.getTime() + offsets[0] * 3600 * 1000,
    end: now.getTime() + offsets[1] * 3600 * 1000
  };

  return period;
}
