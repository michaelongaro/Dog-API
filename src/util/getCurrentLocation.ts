const api_key = import.meta.env.VITE_API_KEY;

export default async function getCurrentLocation(
  latitude: number,
  longitude: number,
  container: HTMLDivElement,
  showCityName: Function,
  renderWeather: Function
) {
  let location_finder_url = `https://dataservice.accuweather.com/locations/v1/cities/geoposition/search?apikey=${api_key}&q=${latitude}%2C%20${longitude}`;

  try {
    let res = await fetch(location_finder_url);
    let res_value = await res.clone().json();
    container.style.display = "flex";
    showCityName(
      `${res_value["LocalizedName"]}, ${res_value["AdministrativeArea"]["ID"]}`
    );
    renderWeather(res_value.Key);
  } catch (error) {
    console.log(error);
  }
}
