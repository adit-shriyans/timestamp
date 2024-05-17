"use client";
import '@styles/css/index.css'
import { MarkerLocation, StopResponseType, TripType } from '@assets/types/types';
import SidePanel from "@components/SidePanel";
import dynamic from "next/dynamic";
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import TripModal from '@components/TripModal';
import { DndContext, DragEndEvent, KeyboardSensor, PointerSensor, TouchSensor, closestCorners, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers'

const DynamicMapComponent = dynamic(() => import("@components/MapComponent"), { ssr: false });
const DynamicSidePanelComponent = dynamic(() => import("@components/SidePanel"), { ssr: false });

const MyPage = () => {
  const [stops, setStops] = useState<MarkerLocation[]>([]);
  const [coord, setCoord] = useState<L.LatLngTuple>([51.505, -0.09]);
  const [zoomLocation, setZoomLocation] = useState<L.LatLngTuple>([51.505, -0.09]);
  const [distances, setDistances] = useState<Number[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [userId, setUserId] = useState('');

  const params = useParams();

  const handleDragEnd = (event: DragEndEvent) => {
    const {active, over} = event;
    if(active.id === over?.id) return;

    setStops(stops => {
      const originalId = stops.findIndex(stop => stop.id === active.id);
      const newId = stops.findIndex(stop => stop.id === over?.id);
      return arrayMove(stops, originalId, newId);
    })
  }

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(TouchSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }) 
  )

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(function (location) {
        const { latitude, longitude } = location.coords;
        setCoord([latitude, longitude]);
      }, function () {
        console.log('Could not get position');
      });
    }
  }, []);

  useEffect(() => {
    const fetchStops = async () => {
      const response = await fetch(`/api/stop/${params?.id}`, {
        method: 'GET'
      });
      const data = await response.json();      
      data.sort((a: { id: number; }, b: { id: number; }) => a.id-b.id);

      setStops(data.map((stop: StopResponseType) => {
        return { id: stop._id, location: stop.location, locationName: stop.locationName, startDate: stop.startDate, endDate: stop.endDate, notes: stop.notes }
      }))
    };

    const getUserId = async () => {
      const response = await fetch(`/api/trip/${params?.id}`, {
        method: 'GET'
      });
      const data = await response.json();
      
      setUserId(data.user._id);
    }

    if (params?.id) {
      fetchStops();
      getUserId();
    }
  }, [params.id]);

  return (
    <div className="TripPage">
      <div className={`MapComponent__Modal ${showModal ? '' : 'hidden'}`}>
        <TripModal stops={stops} setShowModal={setShowModal} tripId={String(params.id)} />
      </div>
      <DndContext collisionDetection={closestCorners} onDragEnd={handleDragEnd} sensors={sensors} modifiers={[restrictToVerticalAxis]} >
        <DynamicSidePanelComponent distances={distances} stops={stops} setStops={setStops} setZoomLocation={setZoomLocation} coord={coord} userId={userId}/>
      </DndContext>
      <DynamicMapComponent stops={stops} setStops={setStops} setDistances={setDistances} zoomLocation={zoomLocation} setZoomLocation={setZoomLocation} coord={coord} setShowModal={setShowModal} />
    </div>
  );
};

export default MyPage;