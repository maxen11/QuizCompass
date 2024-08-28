import React, {useEffect, useState, useRef, useCallback} from 'react';
import mapboxgl from 'mapbox-gl';
import "mapbox-gl/dist/mapbox-gl.css";
import { environment } from '../../contexts/mapdevs.tsx';
import { circle, point} from '@turf/turf';
//import marker from './com
mapboxgl.accessToken = environment.mapbox.accessToken;

interface Props{
  addSelectedPin?: (pin: number[]) => void;
  addAnswer?: (number[] | null);
  mapMode?: (string)| null;
  pointsArea?: (number);
  oldSelection?: (number[] | null);
  isLoading?: (loading: boolean)=> void;
}

const Maploader = ({addSelectedPin, addAnswer, mapMode, pointsArea,oldSelection,isLoading}: Props) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null); 
  const [selectedPin, setSelectedPin] = useState<number[] | null>(null);
  const answerMarker = useRef<mapboxgl.Marker | null>(null);
  
  const [lng] = useState(0);
  const [lat] = useState(20);
  const [zoom] = useState(1);
  const marker = useRef<mapboxgl.Marker>(new mapboxgl.Marker());
  const doingAnimations = useRef<boolean>(false);
  
  const onClickRef = useCallback((e: mapboxgl.MapMouseEvent & mapboxgl.EventData) => {
    const map = mapRef.current;
    try {
      if (map){
        if(!marker.current){
          marker.current = new mapboxgl.Marker();
        }
        marker.current
          .setLngLat([e.lngLat.lng, e.lngLat.lat])
          .addTo(map);
        setSelectedPin(e.lngLat.toArray());
        if(addSelectedPin){
          addSelectedPin([e.lngLat.lng, e.lngLat.lat]);
        }
        console.log("Marker added successfully");
      }
    } catch (error) {
      console.error("Error adding marker:", error);
    }
  },[addSelectedPin]);

  useEffect(() => {
    if (!mapContainerRef.current) return;
    
    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [lng, lat],
      zoom: zoom
    });
    mapRef.current = map;
    // Add navigation control (the +/- zoom buttons)
    map.addControl(new mapboxgl.NavigationControl(), 'top-right');
    // Map onload event 
    map.on("load", ()=> {
        map.resize();
    })

    map.on("idle", ()=> {
      if(doingAnimations.current){
        doingAnimations.current = false;
        if(isLoading)
          isLoading(false);
      }
    })
    map.on('click', onClickRef);// turn on mappressing

    map.on('load', () => { // marking premarked marker
      if(mapMode == "Edit"){
      if (map && map.isStyleLoaded()) {
        if(oldSelection){
          const center = point([oldSelection[0], oldSelection[1]]);
          setSelectedPin(center);
          marker.current
          .setLngLat([oldSelection[0], oldSelection[1]])
          .addTo(map);
        }
      }
    }
    }) 
    // Clean up on unmount
    return () => map && map.remove();
  }, [lat, lng, zoom]); 


  useEffect(() => { // update cercle area
    if(mapMode && mapMode == "Edit"){
      if (selectedPin){
        setCirkledata(selectedPin);
    }
  }
  },[selectedPin,pointsArea]);

  useEffect(() => {
    function doanswer() {
      const map = mapRef.current;
      if (map && map.isStyleLoaded()) {
        doingAnimations.current = true;
        if (addAnswer){   //show answer?
          //map.setProjection("mercator");
          if(!answerMarker.current){
            try{
              answerMarker.current = new mapboxgl.Marker({color: 'green'});
              answerMarker.current
                .setLngLat([addAnswer[0],addAnswer[1]])
                .addTo(map);
            } catch (error) {
              console.error("Error adding marker:", error);
            }
          }
          setCirkledata(addAnswer);
          map.off('click', onClickRef); // turn off mappressing

          const markersCoordinates: [number, number][] =[[addAnswer[0],addAnswer[1]]];
  
          if(selectedPin){ // can be unselected
            markersCoordinates.push([selectedPin[0],selectedPin[1]]);
            drawLine(markersCoordinates);
          }
          movecamera(markersCoordinates); // only go to answer
       
        
        }else{
          //map.setProjection("globe");
          map.on('click', onClickRef); // turn on mappressing
  
  
          if(map.getSource('circle')){
            map.setLayoutProperty('circle', 'visibility', 'none');
          }
  
          if(map.getSource('lineNodes')){
            map.setLayoutProperty('line', 'visibility', 'none');
          }
  
          if(answerMarker.current) {
            answerMarker.current.remove();// remove answer marker
          }
          answerMarker.current = null; 
          setSelectedPin(null);
  
          if(marker.current) {
            marker.current.remove()
          }
  
          map.flyTo({
            center: [lat, lng],
            zoom: zoom,
            duration: 100
          });
        }
      }
    }doanswer();
  }, [addAnswer]);

  function setCirkledata(center:number[]){
    const map = mapRef.current;
    if (map) {
      const options = {steps: 80, units: 'meters'};
      const circledata = circle(center, pointsArea, options);
      if (map.getSource('circle')) {
        map.getSource('circle').setData(circledata);
        map.setLayoutProperty('circle', 'visibility', 'visible');
      } else {
        try{
          map.addSource('circle', {
              type: 'geojson',
              data: circledata
          });

          map.addLayer({
              id: 'circle',
              type: 'fill',
              source: 'circle',
              paint: {
                  'fill-color': '#007cbf',
                  'fill-opacity': 0.5
              }
          });
      } catch (error) {
        console.error("Error adding circle:", error);
      }
      }
    }
  }

  function drawLine(marksCoordinates?: number[][] | null){
    const map = mapRef.current;
    if (map) {
      const lines = {
        'type': 'FeatureCollection',
        'features': [
            {
                'type': 'Feature',
                'geometry': {
                    'type': 'LineString',
                    'coordinates': marksCoordinates
                }
            }
        ]
      };
      if(map.getSource('lineNodes')){
        map.getSource('lineNodes').setData(lines);
        map.setLayoutProperty('line', 'visibility', 'visible');
      }  else {
        try{
          map.addSource('lineNodes', {
            'type': 'geojson',
            'data': lines
          });
    
          map.addLayer({
            'id': 'line',
            'source': 'lineNodes',
            'type': 'line',
            'layout': {
              // Make the layer visible by default.
              'visibility': 'visible'
            },
            'paint': {
                'line-width': 2,
                'line-color': '#007cbf'
            }
          });
      } catch (error) {
        console.error("Error adding line:", error);
      }
      }
      
    }
  }

  function movecamera(markersCoordinates: [number,number][]){
    const map = mapRef.current;
    
      const bounds = new mapboxgl.LngLatBounds();
      //const bounds =mapboxgl.LngLatBounds.convert(markersCoordinates);
      markersCoordinates?.forEach(coord => {
        bounds.extend(coord);
      });
      if(markersCoordinates?.length > 1)
        map?.fitBounds(bounds, {
          padding: 70,
          animate: true,
          duration: 1000
        });
      else{
        map?.flyTo({
          center: bounds.getCenter(),
          zoom: 8,
          duration: 1000
        });
      }
  }



  return (
      <div ref={mapContainerRef} className="map-container" />
  );
};
  export default Maploader;