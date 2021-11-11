const api_key = '5A30FxiSCT46fzC7G35geCxlL0Xeuqwp';

const cityName = document.getElementById("city");

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
const days_str = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

function setupCardStructure() {
    for (const i in days) {
        // create parent and two child divs for day of week and weather icon
        const day_icon_container = document.createElement("div");
        day_icon_container.setAttribute("id", "day-icon-container");

        const day_of_week = document.createElement("div");
        day_of_week.setAttribute("id", "day-of-week");

        const weather_status_icon = document.createElement("div");
        weather_status_icon.setAttribute("id", "weather-status-icon");

        // appending children divs to parent
        day_icon_container.append(day_of_week);
        day_icon_container.append(weather_status_icon);

        // create both high and low temp divs
        const high_container = document.createElement("div");
        high_container.setAttribute("id", "high-container");

        const low_container = document.createElement("div");
        low_container.setAttribute("id", "low-container");

        // create divs for the high/low labels
        const high_label = document.createElement("div");
        high_label.setAttribute("id", "high-label");

        const low_label = document.createElement("div");
        low_label.setAttribute("id", "low-label");
        
        // create divs for the actual temperatures
        const high_temperature = document.createElement("div");
        high_temperature.setAttribute("id", "high-temperature");

        const low_temperature = document.createElement("div");
        low_temperature.setAttribute("id", "low-temperature");

        // appending both labels and temps to their parent divs
        high_container.append(high_label);
        high_container.append(high_temperature);

        low_container.append(low_label);
        low_container.append(low_temperature);

        // add day of week + 'high' and 'low' text
        day_of_week.innerHTML = days_str[i];
        high_label.innerHTML = "High";
        low_label.innerHTML = "Low";

        days[i].append(day_icon_container);
        days[i].append(high_container);
        days[i].append(low_container);
    }
}


const fonts = [
    "Arial, sans-serif",
    "Helvetica, sans-serif",
    "Gill Sans, sans-serif",
    "Lucida, sans-serif",
    "Helvetica Narrow, sans-serif",
    "sans-serif",
    "Times, serif",
    "Times New Roman, serif",
    "Palatino, serif",
    "Bookman, serif",
    "New Century Schoolbook, serif",
    "serif",
    "Andale Mono, monospace",
    "Courier New, monospace",
    "Courier, monospace",
    "Lucidatypewriter, monospace",
    "Fixed, monospace",
    "monospace",
    "Comic Sans, Comic Sans MS, cursive",
    "Zapf Chancery, cursive",
    "Coronetscript, cursive",
    "Florence, cursive",
    "Parkavenue, cursive",
    "cursive",
    "Impact, fantasy",
    "Arnoldboecklin, fantasy",
    "Oldtown, fantasy",
    "Blippo, fantasy",
    "Brushstroke, fantasy",
    "fantasy"
]

const d = new Date();
let current_day = d.getDay()

let current_forcast_days = []

let current_search_str = "";
let autofill_str = "";

window.addEventListener("keyup", function (event) {

    if ((event.which >= 65 && event.which <= 90) || event.code === "Backspace") {
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
            current_forcast_days.push(days[(current_day + counter) % 7]);
            console.log((current_day + counter) % 6);
        }
        else {
            current_forcast_days.push(days[current_day + counter]);
            console.log((current_day + counter));
        }
        counter += 1;
    }
    return current_forcast_days;
}

function showCityName(city) {
    // resets current cityName value
    cityName.innerHTML = "";

    cityName.innerHTML = city;
    cityName.style.display = "block";
    randomizeFont(cityName);
}

function randomizeFont(element) {
    console.log(fonts[Math.floor(Math.random() * fonts.length)]);
    element.style.fontFamily = fonts[Math.floor(Math.random() * fonts.length)];
    element.style.fontSize = "30pt";
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
            showCityName(result["LocalizedName"]);
            renderWeather(result["Key"]);
        }, true);

        temp_div.addEventListener("keyup", function (event) {
            if (event.code === "Enter") {
                event.preventDefault();
                temp_div.click();
            }
        }, true);

    autofill_str = "";
    }
}

async function renderWeather(city_loc) {
    let raw_days = await getWeather(city_loc);
    setupCardStructure();
    shift_days();
    clearAutofillResults();
    days_arr = raw_days["DailyForecasts"];
    console.log(days_arr);
    
    for (let i = 0; i < 5; i++) {
        console.log(current_forcast_days[i].children[1]);
        current_forcast_days[i].children[1].children[1].innerHTML = days_arr[i]["Temperature"]["Maximum"]["Value"];
        current_forcast_days[i].children[2].children[1].innerHTML = days_arr[i]["Temperature"]["Minimum"]["Value"];
        
        // ok to show that day since the parent div is still hidden
        current_forcast_days[i].style.display = "flex";
    }

    container.style.display = "flex";
}

