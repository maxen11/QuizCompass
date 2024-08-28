import { useEffect, useState, useRef, useCallback} from 'react';
import mapboxgl  from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { environment } from '../../contexts/mapdevs.tsx';
//import { array } from 'yup';


mapboxgl.accessToken = environment.mapbox.accessToken;

interface Props{
  addSelectedLocation?: (location: []) => void;
  addAnswer?: (string[] | null);
  isLoading?: (loading: boolean)=> void;
  oldSelection?: (string[] | null);
}

interface LocationData {
  longitude: number;
  latitude: number;
}

const MapCountryloader = ({addSelectedLocation, addAnswer,oldSelection, isLoading}: Props) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null); 
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const doingAnimations = useRef<boolean>(false);

  const onClickRef = useCallback((e: mapboxgl.MapMouseEvent & mapboxgl.EventData) => {
    if (e.features && e.features.length > 0 && e.features[0].properties) {      
        const countryCode = e.features[0].properties['iso_3166_1'];          
        const name_en = e.features[0].properties['name_en'];
        setSelectedCountry(prev => prev === countryCode ? null : countryCode);
        if(addSelectedLocation){
          addSelectedLocation(name_en);
        }
    }
  },[addSelectedLocation]);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [0, 20],
      zoom: 1
    });

    mapRef.current = map;

    map.on('load', () => {

      map.addSource('countries', {
        type: 'vector',
        url: 'mapbox://mapbox.country-boundaries-v1'
      });
      
      setWorldLayer("countries-layer");
      setWorldLayer("countries-layer-answer");

      map.on("idle", ()=> {
        if(doingAnimations.current){
          doingAnimations.current = false;
          if(isLoading)
            isLoading(false);
        }
        //console.log("ready");
      })
      if(oldSelection){
        const fetchData = async () => {
        const answerData = await getCountrydata(oldSelection);
        updateCountrySelection(answerData.properties.context.country.country_code, 'countries-layer', '#ff0000');
        }
        fetchData();
      }
      map.doubleClickZoom.disable();
      map.on('click', 'countries-layer', onClickRef);
    });
    //map.on('click', 'countries-layer', onClickRef.current);
    return () => {map && map.remove();
      map.off('click', 'countries-layer', onClickRef);
    };
  }, []);

  function setWorldLayer(idname:string){
    const map = mapRef.current;
    if (map) {
      try{
      map.addLayer({
        id: idname,
        type: 'fill',
        source: 'countries',
        'source-layer': 'country_boundaries',
        paint: {
          'fill-color': '#007cbf',  // Default color
          'fill-opacity': 0
        }
      });

      map.setFilter(idname, [
        "all",
        [
          "==",
          ["get", "disputed"],
          "false"
        ],
        [
          "any",
          [
            "==",
            "all",
            ["get", "worldview"]
          ],
          [
            "in",
            "US",
            ["get", "worldview"]
          ]
        ]
      ]);
    } catch (error) {
      console.error("Error adding worldlayer:", error);
    }
    }
  }

  useEffect(() => { 
    const map = mapRef.current;

    if (map && map.isStyleLoaded()) {
      doingAnimations.current = true;
      const fetchData = async () => {
        const answerData = await getCountrydata(addAnswer);
        updateCountrySelection(answerData.properties.context.country.country_code, 'countries-layer-answer', '#008000');
        map.setProjection("mercator");
        moveCamera(answerData.properties.coordinates);
      }

      if (addAnswer) { // showing answer
        map.off('click', 'countries-layer', onClickRef); // turn off mappressing
        fetchData();
      }else {
        map.setProjection("globe");

        setSelectedCountry(null);
        map.setPaintProperty('countries-layer-answer', 'fill-opacity', 0);
        map.setPaintProperty('countries-layer', 'fill-opacity', 0 );
        
        map.on('click', 'countries-layer', onClickRef);// turn on mappressing
        map.flyTo({
          center: [0, 20],
          zoom: 1});
      }
    }

  }, [addAnswer]);

  useEffect(() => {
    const map = mapRef.current;
    if (map && map.isStyleLoaded()) {
      updateCountrySelection(selectedCountry, 'countries-layer', '#ff0000');
    }
  }, [selectedCountry]); 

  function updateCountrySelection(countryCode: string | null, layerName:string, colorHex:string) {
    const map = mapRef.current;
    if (!map) return;
    map.setPaintProperty(layerName, 'fill-color', [
      'case',
      ['==', ['get', 'iso_3166_1'], countryCode],
      colorHex,  // Highlight color for selected country
      '#007cbf'   // Default color
    ]);
    map.setPaintProperty(layerName, 'fill-opacity', [
      'case',
      ['==', ['get', 'iso_3166_1'], countryCode],
      0.5,  // Highlight opacity for selected country
      0  // Default opacity
    ]);
  }

  function moveCamera(answerData: LocationData){
    const map = mapRef.current;

    const countryCoordinates = new mapboxgl.LngLat(answerData.longitude,answerData.latitude);
    
    const bounds = new mapboxgl.LngLatBounds().extend(countryCoordinates);

    map?.fitBounds(bounds, {
      padding: 130,
      zoom: 1.99
      });
  }
  
  const getCountrydata = async (addAnswer?: string[] | null) => {
    const response = await fetch(`https://api.mapbox.com/search/geocode/v6/forward?country=${addAnswer}&type=country&access_token=${mapboxgl.accessToken}`)
    const data = await response.json();
      // Extract coordinates from the response
      if (data && data.features && data.features.length > 0) {
        return data.features[0];
      }
  }

  return (
        <div ref={mapContainerRef} className="map-container" />
  );
}

export default MapCountryloader;
