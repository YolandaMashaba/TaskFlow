import React, { useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { useApp } from '../contexts/AppContext';
import { doc, setDoc, deleteDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import AlertModal from './AlertModal';
import { Calendar as CalendarIcon, Clock, User as UserIcon, AlignLeft } from 'lucide-react';

const Calendar = () => {
  const { events, user, workspaceId, logActivity } = useApp();
  const [eventTitle, setEventTitle] = useState('');
  const [eventDescription, setEventDescription] = useState('');
  const [showEventModal, setShowEventModal] = useState(false);
  const [selectedDateInfo, setSelectedDateInfo] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [alertModal, setAlertModal] = useState({
    isOpen: false,
    type: 'confirm',
    title: '',
    message: '',
    onConfirm: null
  });

  const handleDateSelect = async (selectInfo) => {
    setSelectedDateInfo(selectInfo);
    setEventTitle('');
    setEventDescription('');
    setShowEventModal(true);
    selectInfo.view.calendar.unselect();
  };

  const handleCreateEvent = async () => {
    if (eventTitle?.trim()) {
      if (selectedEvent) {
        // Edit existing event
        await updateDoc(doc(db, `workspaces/${workspaceId}/events`, selectedEvent.id), {
          title: eventTitle.trim(),
          description: eventDescription
        });
        logActivity('edited an event', { title: eventTitle.trim() });
      } else {
        // Create new event
        const eventId = Date.now().toString();
        const newEvent = {
          title: eventTitle.trim(),
          start: selectedDateInfo.startStr,
          end: selectedDateInfo.endStr,
          allDay: selectedDateInfo.allDay,
          createdBy: user.uid,
          description: eventDescription
        };
        await setDoc(doc(db, `workspaces/${workspaceId}/events`, eventId), newEvent);
        logActivity('created an event', { title: newEvent.title });
      }
      setShowEventModal(false);
      setEventTitle('');
      setEventDescription('');
      setSelectedEvent(null);
    }
  };

  const handleEventClick = async (clickInfo) => {
    const eventData = clickInfo.event.extendedProps;
    
    if (eventData.isTodoEvent) {
      setAlertModal({
        isOpen: true,
        type: 'alert',
        title: 'Task Event',
        message: `This event is linked to a task. To edit it, please edit the task in the Tasks tab.`,
        confirmText: 'OK',
        onConfirm: null
      });
    } else {
      setSelectedEvent(clickInfo.event);
      setEventTitle(clickInfo.event.title);
      setEventDescription(clickInfo.event.extendedProps.description || '');
      setShowEventModal(true);
    }
  };

  return (
    <div className="calendar-main">
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        headerToolbar={{ left: 'prev,next today', center: 'title', right: 'dayGridMonth,timeGridWeek' }}
        initialView="dayGridMonth"
        editable={true} selectable={true} selectMirror={true}
        events={events.map(event => ({
          ...event,
          title: event.assignee ? `${event.title} (${event.assignee})` : event.title
        }))}
        select={handleDateSelect}
        eventClick={handleEventClick}
        height="75vh"
      />

      {/* Event Title Modal */}
      {showEventModal && (
        <div className="modal-backdrop" onClick={() => setShowEventModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowEventModal(false)}>
              ✕
            </button>
            
            <div className="modal-body google-calendar-modal">
              <h2 className="modal-title">{selectedEvent ? 'Edit Event' : 'Create Event'}</h2>
              
              <div className="google-calendar-form">
                <div className="google-calendar-field">
                  <label>Add title</label>
                  <input
                    type="text"
                    value={eventTitle}
                    onChange={(e) => setEventTitle(e.target.value)}
                    placeholder="Add title"
                    className="google-calendar-input"
                    autoFocus
                  />
                </div>
                
                <div className="google-calendar-field">
                  <label>Add description</label>
                  <textarea
                    value={eventDescription}
                    onChange={(e) => setEventDescription(e.target.value)}
                    placeholder="Add description"
                    className="google-calendar-textarea"
                    rows={3}
                  />
                </div>
                
                {selectedDateInfo && (
                  <div className="google-calendar-field">
                    <label>Time</label>
                    <div className="google-calendar-time">
                      <CalendarIcon size={16} />
                      <span>{new Date(selectedDateInfo.start).toLocaleDateString()}</span>
                      {selectedDateInfo.allDay && <span className="google-calendar-all-day">All day</span>}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="modal-actions google-calendar-actions">
                {selectedEvent && (
                  <button 
                    className="modal-btn modal-btn-cancel" 
                    style={{ background: '#fee2e2', color: '#dc2626', border: 'none' }}
                    onClick={async () => {
                      await deleteDoc(doc(db, `workspaces/${workspaceId}/events`, selectedEvent.id));
                      logActivity('deleted an event', { title: selectedEvent.title });
                      setShowEventModal(false);
                      setSelectedEvent(null);
                      setEventTitle('');
                      setEventDescription('');
                    }}
                  >
                    Delete
                  </button>
                )}
                <button className="modal-btn modal-btn-cancel" onClick={() => {
                  setShowEventModal(false);
                  setSelectedEvent(null);
                  setEventTitle('');
                  setEventDescription('');
                }}>
                  Cancel
                </button>
                <button className="modal-btn modal-btn-confirm" onClick={handleCreateEvent}>
                  {selectedEvent ? 'Save' : 'Save'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <AlertModal
        isOpen={alertModal.isOpen}
        onClose={() => setAlertModal(prev => ({ ...prev, isOpen: false }))}
        onConfirm={alertModal.onConfirm}
        title={alertModal.title}
        message={alertModal.message}
        type={alertModal.type}
        confirmText={alertModal.confirmText}
        cancelText={alertModal.cancelText}
      />
    </div>
  );
};

export default Calendar;