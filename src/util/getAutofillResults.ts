const api_key = import.meta.env.VITE_API_KEY;

export default async function getAutofillResults(location: string) {
  let autofill_url = `https://dataservice.accuweather.com/locations/v1/cities/autocomplete?apikey=${api_key}&q=${location}`;

  try {
    let res = await fetch(autofill_url);

    return await res.json();
  } catch (error) {
    console.log(error);
  }
}
