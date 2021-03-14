import './App.css';
import React, {useState, useEffect} from 'react';
import {MenuItem, FormControl, Select, Card, CardContent} from "@material-ui/core";
import InfoBox from "./components/InfoBox";
import Map from "./components/Map";
import Table from "./components/Table";
import { sortData, prettyPrintStat } from "./util";
import LineGraph from "./components/LineGraph";
import 'leaflet/dist/leaflet.css';


function App() {
  const [countries, setCountries] = useState([]);
  const [country, setCountry] = useState('worldwide');
  const [countryInfo, setCountryInfo] = useState({});
  const [tableData, setTableData] = useState([]);
  const [mapCenter, setMapCenter] = useState({ lat: 34.80746, lng: -40.4796 });
  const [mapZoom, setMapZoom] = useState(3);
  const [mapCountries, setMapCountries] = useState([]);
  const [casesType, setCasesType] = useState("cases");


  useEffect(() => {
    fetch("https://disease.sh/v3/covid-19/all")
    .then(response => response.json())
    .then(data => {
      setCountryInfo(data);
    })
  }, [])

  // to call this API  https://disease.sh/v3/covid-19/countries need to use UseEffect

  useEffect(() => {
    const getCountriesData = async () => {
      await fetch("https://disease.sh/v3/covid-19/countries")
      .then((response) => response.json())
      .then((data) => {
        const countries = data.map((country) => (
          {
            name: country.country,
            value: country.countryInfo.iso2
          }
        ))
        const sortedData = sortData(data)
        setTableData(sortedData)
        setCountries(countries)
        setMapCountries(data)
      })
    }
    getCountriesData();

  }, [])

  const onCountryChange = async (event) => {
    const countryCode = event.target.value;
    // setCountry(countryCode)
    console.log("country code", countryCode);
    const url =
    countryCode === "worldwide"
      ? "https://disease.sh/v3/covid-19/all"
      : `https://disease.sh/v3/covid-19/countries/${countryCode}`;
    await fetch(url) 
    .then(response => response.json())
    .then(data => {
      setCountry(countryCode)
      setCountryInfo(data);
      setMapCenter([data.countryInfo.lat, data.countryInfo.long]);
      setMapZoom(3);


    })
  }
  console.log("Country info", countryInfo)

  return (
    <div className="app">
      <div className="app__left">
        <div className="app__header">
          <h1>Covid Tracker </h1>
          <FormControl className="app__dropdown">
            <Select variant="outlined" 
                    value={country} 
                    onChange={onCountryChange}
            >
            {/* Loop through the countries and show drop down; use state */}
              <MenuItem value="worldwide">Worldwide</MenuItem>
              {
                countries.map((country) => (
                  <MenuItem value = {country.value}>{country.name}</MenuItem>
                ))
              }
            </Select>
          </FormControl>
        </div>
        <div className = "app__stats">
          <InfoBox 
            isRed
            title="Corona Virus Cases" 
            cases={prettyPrintStat(countryInfo.todayCases)} 
            total={prettyPrintStat(countryInfo.cases)} 
            onClick = {e => setCasesType('cases')}
            active={casesType === "cases"}
          />
          <InfoBox 
            isRed
            title = "Recovered" 
            cases={prettyPrintStat(countryInfo.todayRecovered)} 
            total={prettyPrintStat(countryInfo.recovered)} 
            onClick = {e => setCasesType('recovered')}
            active={casesType === "recovered"}
          />
          <InfoBox 
            isRed
            title = "Deaths" 
            cases={prettyPrintStat(countryInfo.todayDeaths)} 
            total={prettyPrintStat(countryInfo.deaths)} 
            onClick = {e => setCasesType('deaths')}
            active={casesType === "deaths"}
          /> 
        </div>
   
        <Map 
          countries={mapCountries} 
          casesType={casesType} 
          center={mapCenter} 
          zoom={mapZoom} 
        />
      </div>
      <Card className="app__right">
        <CardContent>
          <h3>Live Cases by Country</h3>
          <Table countries={tableData} />
          <h3 className="app__graphTitle">World wide new {casesType}</h3>
          <LineGraph className="app__graph" casesType={casesType} />
        </CardContent>
  
      </Card>

    </div>
      
  );
}

export default App;
