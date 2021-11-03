const api_key = '5A30FxiSCT46fzC7G35geCxlL0Xeuqwp';

const search = document.getElementById("search");
const container = document.getElementById("container");
const res_list = document.getElementById("result-list");

const monday = document.getElementById("monday")
const tuesday = document.getElementById("tuesday")
const wednesday = document.getElementById("wednesday")
const thursday = document.getElementById("thursday")
const friday = document.getElementById("friday")
const saturday = document.getElementById("saturday")
const sunday = document.getElementById("sunday")

const days = [sunday, monday, tuesday, wednesday, thursday, friday, saturday]

const d = new Date();
let current_day = d.getDay()

let current_forcast_days = []

let current_search_str = "";
let autofill_str = "";

window.addEventListener("keyup", function (event) {

    if ((event.which >= 65 && event.which <= 90) || (event.code === "Enter" || event.code === "Backspace")) {
        clearAutofillResults();
        autofill_str = search.value;
        if (autofill_str.length != 0) {
            renderAutofillResults();
        }
    }

}, true);

function clearAutofillResults() {
    while (res_list.firstChild) {
        res_list.removeChild(res_list.lastChild);
    }
}

function shift_days() {
    counter = 0;
    while (counter < 5) {
        if (current_day + counter > 6) {
            current_forcast_days.push(days[(current_day + counter) % 6]);
            console.log((current_day + counter) % 6);
        }
        current_forcast_days.push(days[current_day + counter]);
        console.log((current_day + counter));
        counter += 1;
    }
    return current_forcast_days;
}


function showForcast(element) {
    element.style.display = "flex";
}

function formatCityString(unformatted_str) {
    return unformatted_str.replaceAll(' ', '%20')
}


// ideally would like to filter by results that are in same country as user, how to ask without 
// making them say yes on the popup
//                            ^^^^^
async function getAutofillResults(str) {
    let autofill_url = `http://dataservice.accuweather.com/locations/v1/cities/autocomplete?apikey=5A30FxiSCT46fzC7G35geCxlL0Xeuqwp&q=${str}`

    try {
        let res_two = await fetch(autofill_url)

        return await res_two.json();
    } catch (error) {
        console.log(error);
    }

}

async function getCityCode(city) {
    const formatted_city_str = formatCityString(city);
    let city_code_url = `http://dataservice.accuweather.com/locations/v1/cities/search?apikey=5A30FxiSCT46fzC7G35geCxlL0Xeuqwp&q=${formatted_city_str}`;

    try {
        let res_three = await fetch(city_code_url)

        return await res_three.json();
    } catch (error) {
        console.log(error);
    }
}

async function formattedCityCode(city_code) {
    let code = await getCityCode(city_code);
    // console.log(code[0]["Key"]);
    return code[0]["Key"];
}

async function getWeather(city_loc) {
    let forcast_url = `http://dataservice.accuweather.com/forecasts/v1/daily/5day/${city_loc}?apikey=5A30FxiSCT46fzC7G35geCxlL0Xeuqwp`;

    try {
        let res = await fetch(forcast_url)

        return await res.json();
    } catch (error) {
        console.log(error);
    }
}

async function renderAutofillResults() {
    let results = await getAutofillResults(autofill_str);

    for (const result of results) {
        let temp_div = document.createElement("div");
        temp_div.innerHTML = `${result["LocalizedName"]}`;
        res_list.append(temp_div);

        temp_div.addEventListener("click", function (event) {
            renderWeather((formattedCityCode(result["LocalizedName"])));
        }, true);

    }

    console.log(results);
    autofill_str = "";
}

async function renderWeather(city_loc) {
    let raw_days = await getWeather(city_loc);
    shift_days();
    days_arr = raw_days["DailyForecasts"];

    // should most likely just not include the days that don't have forcast data 
    for (let i = 0; i < 5; i++) {
        const max_temp = document.createElement("div");
        max_temp.innerHTML = days_arr[i]["Temperature"]["Maximum"]["Value"];
        const min_temp = document.createElement("div");
        min_temp.innerHTML = days_arr[i]["Temperature"]["Minimum"]["Value"];
        current_forcast_days[i].append(max_temp);
        current_forcast_days[i].append(min_temp);


    }

    // console.log(days_arr);
    
    container.style.display = "flex";
    document.querySelectorAll('.day').forEach(showForcast);

}

