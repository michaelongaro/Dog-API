const api_key = import.meta.env.VITE_API_KEY;

// getting realFeel temp + humidity
export default async function getCurrentConditions(city_loc: string) {
  let forecast_url = `https://dataservice.accuweather.com/currentconditions/v1/${city_loc}?apikey=${api_key}&details=true`;

  try {
    let res = await fetch(forecast_url);

    return await res.json();
  } catch (error) {
    console.log(error);
  }
}
