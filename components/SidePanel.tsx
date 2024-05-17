'use client';

import React, { useEffect, useState, ChangeEvent, useRef, useMemo } from 'react';
import '@styles/css/SidePanel.css'
import PlaceInfo from './PlaceInfo';
import AddLocationAltIcon from '@mui/icons-material/AddLocationAlt';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import EventNoteIcon from '@mui/icons-material/EventNote';
import TocIcon from '@mui/icons-material/Toc';
import totalDistImg from '../assets/totalDistance.png';
import Image from 'next/image';
import { MarkerLocation, searchResultType } from '@assets/types/types';
import { z, ZodError } from 'zod';
import { calculateDistance, compareDates, getNumberOfDays, getTodaysDate, isValidDate } from '@assets/CalcFunctions';
import { useParams } from 'next/navigation';
import { OpenStreetMapProvider } from 'leaflet-geosearch';
import '@node_modules/leaflet-geosearch/dist/geosearch.css';
import { SearchResult } from 'leaflet-geosearch/dist/providers/provider.js';
import { RawResult } from 'leaflet-geosearch/dist/providers/openStreetMapProvider.js';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useSession } from 'next-auth/react';

interface SPPropsType {
  distances: Number[];
  stops: MarkerLocation[];
  setStops: React.Dispatch<React.SetStateAction<MarkerLocation[]>>;
  setZoomLocation: React.Dispatch<React.SetStateAction<L.LatLngTuple>>;
  coord: L.LatLngTuple;
  userId: string;
}

const geocodingResponseSchema = z.array(
  z.object({
    place_id: z.number(),
    licence: z.string(),
    osm_type: z.string(),
    osm_id: z.number(),
    lat: z.string(),
    lon: z.string(),
    class: z.string(),
    type: z.string(),
    place_rank: z.number(),
    importance: z.number(),
    addresstype: z.string(),
    name: z.string(),
    display_name: z.string(),
    boundingbox: z.array(z.string()),
  })
);

const SidePanel = ({ distances, stops, setStops, setZoomLocation, coord, userId }: SPPropsType) => {
  const [scrolled, setScrolled] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult<RawResult>[]>([]);
  const [addingLocation, setAddingLocation] = useState(false);
  const [addCoords, setAddCoords] = useState<L.LatLngTuple | []>([]);
  const [reqLocation, setReqLocation] = useState('');
  const [totalDistance, setTotalDistance] = useState(0);
  const [tripDates, setTripDates] = useState<string[]>([getTodaysDate(), getTodaysDate()]);
  const [noOfDays, setNoOfDays] = useState<number>(0);
  const [dndEnable, setDndEnable] = useState(false);
  const [isEditable, setIsEditable] = useState(false);

  const inputRef = useRef<HTMLInputElement | null>(null);
  const addStopRef = useRef<HTMLDivElement>(null);

  const params = useParams();
  const {data: session} = useSession();

  useEffect(() => {
    let dist = 0;
    let sDate = stops[0]?.startDate || getTodaysDate();
    let eDate = stops[stops.length - 1]?.endDate || getTodaysDate();
    if (sDate && eDate && isValidDate(sDate) && isValidDate(eDate)) setTripDates([sDate, eDate]);
    for (let i = 0; i < stops.length; i++) {
      if (stops[i].startDate !== undefined && compareDates(stops[i].startDate!, tripDates[0]) === -1) setTripDates([stops[i].startDate!, tripDates[1]])
      if (stops[i].endDate !== undefined && compareDates(stops[i].endDate!, tripDates[1]) === 1) setTripDates([tripDates[0], stops[i].endDate!])
      if (i === 0) dist += parseFloat(calculateDistance(stops[i].location, coord).toFixed(2))
      else dist += parseFloat(calculateDistance(stops[i].location, stops[i - 1].location).toFixed(2))
    }
    let tripDist = 0;
    distances.forEach((dist) => tripDist += Number(dist));
    const setDist = tripDist === 0 ? parseFloat(dist.toFixed(2)) : tripDist;
    setTotalDistance(dist);
  }, [stops]);

  useEffect(() => {
    setIsEditable((session && session.user.id === userId) || false );
  }, [session, userId]);

  useEffect(() => {
    if (isValidDate(tripDates[0]) && isValidDate(tripDates[1]))
      setNoOfDays(getNumberOfDays(tripDates[0], tripDates[1]));
  }, [tripDates[0], tripDates[1]]);

  useEffect(() => {
    if (addingLocation) {
      inputRef.current?.focus();
    }
  }, [addingLocation]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(true);
      const element = document.querySelector('.SidePanel');
      const distance = element?.scrollTop;
      document.documentElement.style.setProperty('--scroll-distance', `${distance}px`);
    };

    const element = document.querySelector('.SidePanel');
    element?.addEventListener('scroll', handleScroll);

    return () => {
      element?.removeEventListener('scroll', handleScroll);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (addStopRef.current && !addStopRef.current?.contains(e.target as Node)) {
        setAddingLocation(false);
      }
    };

    document.addEventListener('click', handleClickOutside);

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  const addManualLocation = () => {
    if (reqLocation) {
      const apiUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(reqLocation)}`;

      fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
          const parsedData = geocodingResponseSchema.safeParse(data);

          if (parsedData.success) {
            const location = parsedData.data[0];
            const latitude = parseFloat(location.lat);
            const longitude = parseFloat(location.lon);

            if (!isNaN(latitude) && !isNaN(longitude)) {
              setAddCoords([latitude, longitude]);
            } else {
              console.error(`Invalid latitude or longitude for ${reqLocation}`);
            }
          } else {
            console.error('Geocoding response validation error:', parsedData.error);
          }
        })
        .catch(error => console.error('Error fetching geocoding data', error));
    }
  };

  const markNewLocation = async ([latitude, longitude]: L.LatLngTuple, locationName: string) => {
    const createStopResponse = await fetch("/api/stop/new", {
      method: "POST",
      body: JSON.stringify({
        stopId: stops.length,
        tripId: params.id,
        location: [latitude, longitude],
        locationName: locationName,
        startDate: '',
        endDate: '',
        notes: ''
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!createStopResponse.ok) {
      console.error('Failed to create trip:', createStopResponse.statusText);
      return;
    }

    const createdStop = await createStopResponse.json();

    setStops([...stops, { id: createdStop._id, location: createdStop.location, locationName: createdStop.locationName }])
  }

  const handleAddFormChange = async (e: ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    setReqLocation(e.target.value);
    if (e.target.value) {
      try {
        const provider = new OpenStreetMapProvider();
        const results = await provider.search({ query: e.target.value });
        if (e.target.value) setSearchResults(results);
      } catch (err) {
        console.error("Error loading search results", err);
      }
    }
    else setSearchResults([]);
  }

  const handleSearchResultsClick = (res: SearchResult<RawResult>, e: MouseEvent) => {
    e.preventDefault();
    setAddCoords([res.y, res.x]);
    markNewLocation([res.y, res.x], res.label);
    setZoomLocation([res.y, res.x]);
    setReqLocation('');
    setAddingLocation(false);
    setSearchResults([]);
  }

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addManualLocation();
      if (addCoords.length !== 0) {
        markNewLocation(addCoords, reqLocation);
        setZoomLocation(addCoords);
      }
      setReqLocation('');
      setAddingLocation(false);
      setSearchResults([]);
    }
  }

  return (
    <div className={`SidePanel ${scrolled ? 'SideWindow' : ''}`}>
      <section className='SidePanel__section-info'>
        <h1 className='SidePanel__heading'>Travel List!</h1>
        <div className='TripInfo'>
          <div className='TripInfo__dist'>
            <div className='TripInfo__dist-img'>
              <Image src={totalDistImg} alt='total distance' />
            </div>
            <div className='TripInfo__dist-text'>
              {totalDistance ? totalDistance.toFixed(2) : 0}km
            </div>
          </div>

          <div className='TripInfo__days'>
            <div className='TripInfo__days-img'>
              <EventNoteIcon />
            </div>
            <div className='TripInfo__days-text'>
              {noOfDays} Days
            </div>
          </div>
        </div>
        <div
          className='addStop'
          ref={addStopRef}
        >
          <div
            className='addStop__content'
            tabIndex={0}
            onClick={() => setAddingLocation((prev) => !prev)}
          >
            <div
              className='addStop__img'
            >
              <AddLocationAltIcon />
            </div>
            <div
              className='addStop__heading'
            >
              Add Location
            </div>
          </div>
          <form className={`addStop__form ${addingLocation ? '' : 'hidden'}`}>
            <input
              className='addStop__input'
              value={reqLocation}
              onChange={handleAddFormChange}
              onKeyDown={handleInputKeyDown}
              ref={inputRef}
              placeholder='Enter Location Name'
            />
          </form>
        </div>
        {searchResults.length > 0 && addingLocation ? (<div className='addStop__searchResult'>
          {searchResults.map((res, index) => {
            return (
              <div className='addStop__result' key={index} onClick={(e) => handleSearchResultsClick(res, e as unknown as MouseEvent)}>
                {res.label}
              </div>
            )
          })}
        </div>) : ''}
        <div
          className='SidePanel__Home'
          onClick={() => { setZoomLocation(coord) }}
        >
          <div className='SidePanel__Home-img'>
            <MyLocationIcon />
          </div>
          <div
            className='SidePanel__Home-text'
          >
            Your Location
          </div>
        </div>
      </section>
      <section className='SidePanel__section-stops'>
        <div className='DragNDrop'>
          <input 
            className='DragNDrop__box' 
            onChange={() => setDndEnable(prev => !prev)} 
            type="checkbox" 
            checked={dndEnable}
          />
          <div className='DragNDrop__text'>Reorder</div>
        </div>
        {stops.length > 0 ? (
          <div className='StopInfo__container'>
            <SortableContext 
              items={stops}
              strategy={verticalListSortingStrategy}
            >
              {stops.map((stop) => (
                <div key={stop.id} className='StopInfo'>
                  <PlaceInfo key={stop.id} distances={distances} stop={stop} stops={stops} setStops={setStops} setTotalDistance={setTotalDistance} setZoomLocation={setZoomLocation} dndEnable={dndEnable} isEditable={isEditable} />
                </div>
              ))}
            </SortableContext>
          </div>
        ) :
          (
            <div className='SidePanel__filler'>
              <p>or</p>
              <h2>Click on the map!</h2>
            </div>
          )}
      </section>
    </div>
  )
}

export default SidePanel