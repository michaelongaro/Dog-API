const api_key = import.meta.env.VITE_API_KEY;

export default // getting min/max daily temps + rain % + wind
async function getWeeklyWeather(city_loc: string) {
  let forecast_url = `https://dataservice.accuweather.com/forecasts/v1/daily/5day/${city_loc}?apikey=${api_key}&details=true`;

  try {
    let res = await fetch(forecast_url);

    return await res.json();
  } catch (error) {
    console.log(error);
  }
}
