//make a class for CityCoords objects
class CityCoords{
    constructor(longitude, latitude, name, country){
        this.longitude = longitude;
        this.latitude = latitude;
        this.name = name;
        this.country = country;
    }
}

let coordinates = [];

async function cityCoordstoWeather(cityCoords){

    //use a map(longitude,latitude).

    try{

        let longitudeString = "";
        let latitudeString = "";

        //value,key for forEach loops.
        for(let i = 0; i < cityCoords.length; ++i){

            longitudeString += cityCoords[i].longitude + ",";
            latitudeString += cityCoords[i].latitude + ",";

        };


        //strings in JS are immutable.
        //latitudes range from 90 to -90 degrees
        //longitudes range from -180 to 180 degrees.
        longitudeString = longitudeString.slice(0,-1); //cut off last comma.
        latitudeString = latitudeString.slice(0,-1);

        let URL = `https://api.open-meteo.com/v1/forecast?longitude=${longitudeString}&latitude=${latitudeString}&hourly=temperature_2m&forecast_days=1`;


        let response = await fetch(URL);

        let resultJSON = await response.json();

        let displayTable = document.getElementById("weather_display");//getElementById??? is that an android reference?????!??

        let head = true;

        let timeArray = resultJSON[0].hourly.time;

        //we need to process the datetime to just have the time portion.
        timeArray = datetimetoTime(timeArray); 


        //resultJSON contains an array of structs.
        //we have a days worth of weather data for the 10 cities, format it in a table and add it to the html document.
        for(cityWeather of resultJSON){

            //this part adds a header which displays the various times the weather data was taken.
            //TODO: make a trim time function that only takes the number after the T as that is the time. 
            //we can use the number before the T as the date. Make a header like weather for the day of #-#-#...
            //but first we need to find out how to display the city on the left of the weather data.
            if(head){
                let tableHead = displayTable.createTHead();
                let row = tableHead.insertRow();
                for(let i = 0; i < timeArray.length; ++i){
                    let cell = row.insertCell();
                    cell.innerHTML = `<b>${timeArray[i]}</b>`;
                }
                head = false;
            }


            //console.log(JSON.stringify(cityWeather.hourly.temperature_2m));
            let row = displayTable.insertRow();

            //add a cell for each weather entry.
            for(let i = 0; i < cityWeather.hourly.temperature_2m.length; ++i){
                let cell = row.insertCell();
                cell.innerHTML = cityWeather.hourly.temperature_2m[i] + "\u00B0C";


            }



        }
  

    }
    catch(error){
        console.error("couldn't find weather", error);
    }



}


async function getCityCoords(city,cityCoords){
try{
    let URL = `https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=10&language=en&format=json`;

    let response = await fetch(URL);

    let resultJSON = await response.json();

    for(let item of resultJSON.results){
        //in this for loop, I'd call the function cityCoordstoWeather for each item, and pass in the longitude and latitude.
        //and that's pretty much it. I think we can get an array of longitudes and latitudes to limit api calls.
        //we'd need to separate the longitudes with commas in the api URL.
        /*
        let child = document.body.appendChild(document.createElement("p"));
        child.textContent = `${item.name}, ${item.country} longitude: ${item.longitude} latitude: ${item.latitude}`;
        */
        cityCoords.push(new CityCoords(item.longitude, item.latitude, item.name, item.country_code));
        

    }

}
catch(error){
    console.error("couldn't fetch city", error);
}

}

//datetime in this format has the dates and times separated by a T.
function datetimetoTime(datetime){

    //lets try and use regex for this.
    //I think it would be a good use for it.

    let time = [];

    for(let i = 0; i < datetime.length; ++i){

        //split based on the T designator.
        time.push(datetime[i].split(/[T]/i)[1]);

    }

    return time;

}




const paramsString = window.location.search;

const searchParams = new URLSearchParams(paramsString);

let city = (searchParams.get("city-text"));

//interesting, so js treats null-empty-undefined as false for strings.
if(city){
    //since async functions return a promise, we can use that with then to make sure cityCoordstoWeather
    //runs after getCityCoords.
    getCityCoords(city,coordinates).then(()=>{cityCoordstoWeather(coordinates)});
}


