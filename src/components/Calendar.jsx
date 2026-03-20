import React from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { useApp } from '../contexts/AppContext';
import { doc, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';

const Calendar = () => {
  const { events, user, workspaceId, logActivity } = useApp();

  const handleDateSelect = async (selectInfo) => {
    const title = prompt('Enter event title:');
    selectInfo.view.calendar.unselect();

    if (title?.trim()) {
      const eventId = Date.now().toString();
      const newEvent = {
        title: title.trim(),
        start: selectInfo.startStr,
        end: selectInfo.endStr,
        allDay: selectInfo.allDay,
        createdBy: user.uid
      };
      await setDoc(doc(db, `workspaces/${workspaceId}/events`, eventId), newEvent);
      logActivity('created an event', { title: newEvent.title });
    }
  };

  const handleEventClick = async (clickInfo) => {
    if (window.confirm(`Delete event '${clickInfo.event.title}'?`)) {
      await deleteDoc(doc(db, `workspaces/${workspaceId}/events`, clickInfo.event.id));
      logActivity('deleted an event', { title: clickInfo.event.title });
    }
  };

  return (
    <div className="calendar-main">
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        headerToolbar={{ left: 'prev,next today', center: 'title', right: 'dayGridMonth,timeGridWeek' }}
        initialView="dayGridMonth"
        editable={true} selectable={true} selectMirror={true}
        events={events}
        select={handleDateSelect}
        eventClick={handleEventClick}
        height="75vh"
      />
    </div>
  );
};

export default Calendar;