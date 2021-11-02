const api_key = '5A30FxiSCT46fzC7G35geCxlL0Xeuqwp';
const forcast_url = 'http://dataservice.accuweather.com/forecasts/v1/daily/5day/338949?apikey=5A30FxiSCT46fzC7G35geCxlL0Xeuqwp'

const search = document.getElementById("search");
const container = document.getElementById("container");

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

let autofill_str = "";

window.addEventListener("keyup", function (event) {
    // event.code === "Enter"
    if (event.code === "Enter") {
        autofill_str = search.value;
        renderAutofillResults();
    }
}, true);

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

async function getWeather() {
    let url = "http://dataservice.accuweather.com/locations/v1/cities/search?apikey=5A30FxiSCT46fzC7G35geCxlL0Xeuqwp&q=Arden%20Hills";
    // , {
    //     method: 'POST',
    //     mode: 'cors',
    //     headers: {
    //         '/api/facts': '?number=5'
    //     },
    //     body: JSON.stringify(data)
    // }
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
        //result[LocalizedName]
        document.createElement("div")
        
    }

    console.log(results);
    autofill_str = "";
}

async function renderWeather() {
    let users = await getWeather();
    shift_days();
    days_arr = users["DailyForecasts"];

    // should most likely just not include the days that don't have forcast data 
    for (let i = 0; i < 5; i++) {
        const max_temp = document.createElement("div");
        max_temp.innerHTML = days_arr[i]["Temperature"]["Maximum"]["Value"];
        const min_temp = document.createElement("div");
        min_temp.innerHTML = days_arr[i]["Temperature"]["Minimum"]["Value"];
        current_forcast_days[i].append(max_temp);
        current_forcast_days[i].append(min_temp);


    }

    console.log(users);
    
    container.style.display = "flex";
    document.querySelectorAll('.day').forEach(showForcast);

}

//renderWeather();