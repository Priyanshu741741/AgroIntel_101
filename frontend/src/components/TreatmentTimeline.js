import React, { useState, useEffect } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import { Card, Button, Badge, Alert } from 'react-bootstrap';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { saveTreatmentPlan, updateTreatmentStatus, getTreatmentPlans } from '../services/treatmentService';

const localizer = momentLocalizer(moment);

const TreatmentTimeline = ({ diseaseData, onTreatmentComplete }) => {
  const [events, setEvents] = useState([]);
  const [completedTreatments, setCompletedTreatments] = useState([]);
  const [planId, setPlanId] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (diseaseData) {
      // Generate treatment timeline events based on disease prediction
      const treatmentEvents = generateTreatmentPlan(diseaseData);
      setEvents(treatmentEvents);
      
      // Save the treatment plan to Firebase
      saveTreatmentPlan(diseaseData, treatmentEvents)
        .then(id => setPlanId(id))
        .catch(err => setError('Failed to save treatment plan'));
    }
  }, [diseaseData]);

  useEffect(() => {
    // Load existing treatment plans
    const loadTreatmentPlans = async () => {
      try {
        const plans = await getTreatmentPlans();
        if (plans.length > 0) {
          const latestPlan = plans[plans.length - 1];
          setPlanId(latestPlan.id);
          setEvents(latestPlan.treatments);
          setCompletedTreatments(latestPlan.treatments
            .filter(t => t.status === 'completed')
            .map(t => t.id));
        }
      } catch (err) {
        setError('Failed to load treatment plans');
      }
    };

    loadTreatmentPlans();
  }, []);

  const generateTreatmentPlan = (disease) => {
    const treatments = [];
    const startDate = new Date();

    const treatmentSteps = {
      'early_blight': [
        { title: 'Apply fungicide', duration: 1 },
        { title: 'Remove infected leaves', duration: 2 },
        { title: 'Improve air circulation', duration: 3 }
      ],
      'late_blight': [
        { title: 'Apply copper-based fungicide', duration: 1 },
        { title: 'Remove infected plants', duration: 2 },
        { title: 'Adjust watering schedule', duration: 3 }
      ],
    };

    const steps = treatmentSteps[disease.type] || [];
    let currentDate = new Date(startDate);

    steps.forEach((step, index) => {
      treatments.push({
        id: `treatment-${index}`,
        title: step.title,
        start: new Date(currentDate),
        end: new Date(currentDate.setDate(currentDate.getDate() + step.duration)),
        allDay: true,
        status: 'pending'
      });
      currentDate.setDate(currentDate.getDate() + 1);
    });

    return treatments;
  };

  const handleTreatmentComplete = async (eventId) => {
    try {
      if (!planId) {
        setError('No active treatment plan found');
        return;
      }

      await updateTreatmentStatus(planId, eventId, 'completed');
      setCompletedTreatments([...completedTreatments, eventId]);
      setEvents(events.map(event => {
        if (event.id === eventId) {
          return { ...event, status: 'completed' };
        }
        return event;
      }));
      onTreatmentComplete && onTreatmentComplete(eventId);
    } catch (err) {
      setError('Failed to update treatment status');
    }
  };

  const eventStyleGetter = (event) => {
    const isCompleted = completedTreatments.includes(event.id);
    return {
      style: {
        backgroundColor: isCompleted ? '#28a745' : '#007bff',
        borderRadius: '5px',
        opacity: 0.8,
        color: 'white',
        border: 'none'
      }
    };
  };

  return (
    <div className="treatment-timeline">
      {error && <Alert variant="danger" className="mb-3">{error}</Alert>}
      <Card className="mb-4">
        <Card.Header>
          <h4>Treatment Timeline</h4>
        </Card.Header>
        <Card.Body>
          <div style={{ height: '500px' }}>
            <Calendar
              localizer={localizer}
              events={events}
              startAccessor="start"
              endAccessor="end"
              eventPropGetter={eventStyleGetter}
              views={['month', 'week']}
              defaultView="week"
            />
          </div>
          <div className="mt-3">
            <h5>Pending Treatments</h5>
            {events.filter(event => !completedTreatments.includes(event.id)).map(event => (
              <div key={event.id} className="d-flex justify-content-between align-items-center mb-2">
                <span>
                  <Badge bg="primary" className="me-2">
                    {moment(event.start).format('MMM D')}
                  </Badge>
                  {event.title}
                </span>
                <Button
                  size="sm"
                  variant="outline-success"
                  onClick={() => handleTreatmentComplete(event.id)}
                >
                  Mark Complete
                </Button>
              </div>
            ))}
          </div>
        </Card.Body>
      </Card>
    </div>
  );
};

export default TreatmentTimeline;