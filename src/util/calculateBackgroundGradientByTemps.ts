const mapTempsToColorRange = (
  temp: number,
  fromRange: number[],
  toRange: number[]
) => {
  return (
    ((temp - fromRange[0]) * (toRange[1] - toRange[0])) /
      (fromRange[1] - fromRange[0]) +
    toRange[0]
  );
};

export default function calculateBackgroundGradientByTemps(
  min_weekly_temp: number,
  max_weekly_temp: number
) {
  let coldestHSLValue, hottestHSLValue;

  if (min_weekly_temp <= -40) {
    coldestHSLValue = "hsl(240 100% 30%)";
  } else if (min_weekly_temp > -40 && min_weekly_temp <= 0) {
    coldestHSLValue = "hsl(240 100% 40%)";
  } else if (min_weekly_temp > 0 && min_weekly_temp <= 30) {
    coldestHSLValue = "hsl(240 100% 60%)";
  } else if (min_weekly_temp > 30 && min_weekly_temp <= 50) {
    coldestHSLValue = `hsl(${mapTempsToColorRange(
      min_weekly_temp,
      [30, 50],
      [240, 180]
    )} 100% 60%)`;
  } else if (min_weekly_temp > 50 && min_weekly_temp <= 70) {
    coldestHSLValue = `hsl(${mapTempsToColorRange(
      min_weekly_temp,
      [50, 70],
      [60, 55]
    )} 100% 60%)`;
  } else if (min_weekly_temp > 70 && min_weekly_temp <= 80) {
    coldestHSLValue = `hsl(${mapTempsToColorRange(
      min_weekly_temp,
      [70, 80],
      [55, 40]
    )} 100% 60%)`;
  } else if (min_weekly_temp > 80 && min_weekly_temp <= 90) {
    coldestHSLValue = `hsl(${mapTempsToColorRange(
      min_weekly_temp,
      [80, 90],
      [40, 20]
    )} 100% 60%)`;
  } else if (min_weekly_temp > 90 && min_weekly_temp <= 100) {
    coldestHSLValue = `hsl(${mapTempsToColorRange(
      min_weekly_temp,
      [90, 100],
      [20, 10]
    )} 100% 60%)`;
  } else if (min_weekly_temp > 100) {
    coldestHSLValue = `hsl(${mapTempsToColorRange(
      min_weekly_temp,
      [100, 130],
      [10, 0]
    )} 100% 60%)`;
  }

  if (max_weekly_temp <= -40) {
    hottestHSLValue = "hsl(240 100% 30%)";
  } else if (max_weekly_temp > -40 && max_weekly_temp <= 0) {
    hottestHSLValue = "hsl(240 100% 40%)";
  } else if (max_weekly_temp > 0 && max_weekly_temp <= 30) {
    hottestHSLValue = "hsl(240 100% 60%)";
  } else if (max_weekly_temp > 30 && max_weekly_temp <= 50) {
    hottestHSLValue = `hsl(${mapTempsToColorRange(
      max_weekly_temp,
      [30, 50],
      [240, 180]
    )} 100% 60%)`;
  } else if (max_weekly_temp > 50 && max_weekly_temp <= 70) {
    hottestHSLValue = `hsl(${mapTempsToColorRange(
      max_weekly_temp,
      [50, 70],
      [60, 55]
    )} 100% 60%)`;
  } else if (max_weekly_temp > 70 && max_weekly_temp <= 80) {
    hottestHSLValue = `hsl(${mapTempsToColorRange(
      max_weekly_temp,
      [70, 80],
      [55, 40]
    )} 100% 60%)`;
  } else if (max_weekly_temp > 80 && max_weekly_temp <= 90) {
    hottestHSLValue = `hsl(${mapTempsToColorRange(
      max_weekly_temp,
      [80, 90],
      [40, 20]
    )} 100% 60%)`;
  } else if (max_weekly_temp > 90 && max_weekly_temp <= 100) {
    hottestHSLValue = `hsl(${mapTempsToColorRange(
      max_weekly_temp,
      [90, 100],
      [20, 10]
    )} 100% 60%)`;
  } else if (max_weekly_temp > 100) {
    hottestHSLValue = `hsl(${mapTempsToColorRange(
      max_weekly_temp,
      [100, 130],
      [10, 0]
    )} 100% 60%)`;
  }

  document.documentElement.style.setProperty(
    "--background-coldest-gradient-color",
    `${coldestHSLValue}`
  );
  document.documentElement.style.setProperty(
    "--background-hottest-gradient-color",
    `${hottestHSLValue}`
  );
}
