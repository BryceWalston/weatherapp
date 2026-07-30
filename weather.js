//set up coordinates map(longitude,latitude);
//consider downloading a multimap package to account for results that return multiple cities with the same longitude.
const coordinates = new Map();

async function cityCoordstoWeather(cityCoords){

    //use a map(longitude,latitude).

    try{


        let longitudeString = "";
        let latitudeString = "";

        //value,key for forEach loops.
        cityCoords.forEach((latitude,longitude)=>{

            longitudeString += longitude + ",";
            latitudeString += latitude + ",";

        });


        //strings in JS are immutable.
        //latitudes range from 90 to -90 degrees
        //longitudes range from -180 to 180 degrees.
        longitudeString = longitudeString.slice(0,-1); //cut off last comma.
        latitudeString = latitudeString.slice(0,-1);

        let URL = `https://api.open-meteo.com/v1/forecast?longitude=${longitudeString}&latitude=${latitudeString}&hourly=temperature_2m`;


        let response = await fetch(URL);

        let resultJSON = await response.text();

        //resultJSON contains an array of structs.

        //test if we get results.
        console.log(resultJSON);



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
        cityCoords.set(item.longitude,item.latitude);
        

    }
}
catch(error){
    console.error("couldn't fetch city", error);
}

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


