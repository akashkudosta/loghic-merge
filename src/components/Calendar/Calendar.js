import React, { useState, useEffect, useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import listPlugin from '@fullcalendar/list';
import axios from 'axios';
import {
  Box,
  Card,
  Typography,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
} from '@mui/material';
import './Calendar.css';

const Calendar = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState('dayGridMonth');
  const [selectedDateEvents, setSelectedDateEvents] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const calendarRef = useRef(null);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/events`);
      setEvents(response.data.all_events);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const getClickedDateEvents = async (date, eventType = 'all', eventCategory = '') => {
    try {
      const currentMarket = localStorage.getItem('calendarMarketType') || '';
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/clicked-date-events`, {
        clicked_date: date,
        events_type: eventType,
        event_category: eventCategory,
        currentMarket
      });

      if (response.data.status) {
        setSelectedDateEvents({
          date: response.data.result.clicked_date,
          events: response.data.result.day_events_html
        });
        setOpenDialog(true);
      }
    } catch (error) {
      console.error('Error fetching date events:', error);
    }
  };

  const handleDateClick = (arg) => {
    const clickedDate = arg.date;
    const formattedDate = clickedDate.toISOString().split('T')[0];
    getClickedDateEvents(formattedDate);
  };

  const handleViewChange = (viewType) => {
    if (calendarRef.current) {
      const calendarApi = calendarRef.current.getApi();
      calendarApi.changeView(viewType);
      setCurrentView(viewType);
    }
  };

  const renderEventContent = (eventInfo) => {
    return (
      <>
        <b>{eventInfo.timeText}</b>
        <i>{eventInfo.event.title}</i>
      </>
    );
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Card sx={{ p: 3, backgroundColor: 'white' }}>
      <Box className="calendar-container">
        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, listPlugin]}
          initialView={currentView}
          headerToolbar={{
            left: 'prev',
            center: 'title',
            right: 'next,today,listYear'
          }}
          views={{
            listYear: { buttonText: currentView === 'listYear' ? 'Calendar' : 'List View' }
          }}
          events={events}
          dateClick={handleDateClick}
          eventContent={renderEventContent}
          editable={false}
          dayMaxEvents={true}
          height="auto"
          customButtons={{
            listYear: {
              text: currentView === 'listYear' ? 'Calendar' : 'List View',
              click: () => {
                const newView = currentView === 'listYear' ? 'dayGridMonth' : 'listYear';
                handleViewChange(newView);
              }
            }
          }}
        />

        {/* Event Details Dialog */}
        <Dialog 
          open={openDialog} 
          onClose={() => setOpenDialog(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            {selectedDateEvents?.date}
          </DialogTitle>
          <DialogContent>
            <div dangerouslySetInnerHTML={{ __html: selectedDateEvents?.events || '' }} />
          </DialogContent>
        </Dialog>
      </Box>
    </Card>
  );
};

export default Calendar; 