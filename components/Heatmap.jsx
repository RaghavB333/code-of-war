"use client"
import React from 'react';
import CalendarHeatmap from 'react-calendar-heatmap';
import 'react-calendar-heatmap/dist/styles.css';
import { subDays } from 'date-fns';
import axios from 'axios';
import { useState, useEffect, useContext } from 'react';
import { UserDataContext } from '@/context/UserContext';

const Heatmap = () => {
  const [submissionDates, setSubmissionDates] = useState([]);
  const endDate = new Date();
  const startDate = subDays(endDate, 180); // last 6 months

  const { user } = useContext(UserDataContext);

  const getsubmissiondates = async () => {
    const username = user.email;
    const response = await axios.get(`/api/getsubmissiondates?username=${username}`);
    console.log("submission-dates : ", response.data);
    setSubmissionDates(response.data.submissionDates);
  }

  useEffect(() => {
    getsubmissiondates();
  }, []);

  // Map submissionDates to format needed
  const values = submissionDates.map(date => ({
    date,
    count: 1,
  }));

  return (
    <div className="my-2 p-3 bg-gray-900 rounded-md shadow-md">
      <div className="mb-2">
        <h2 className="text-sm font-medium text-white mb-1 flex items-center gap-1">
          🔥 Submission Streak
        </h2>
      </div>
      
      <div className="heatmap-container">
        <CalendarHeatmap
          startDate={startDate}
          endDate={endDate}
          values={values}
          showWeekdayLabels
          showMonthLabels
          gutterSize={1}
          horizontal={true}
          classForValue={(value) => {
            if (!value || !value.count) {
              return 'color-empty';
            }
            return 'color-filled';
          }}
          transformDayElement={(rect, value, index) => {
            return React.cloneElement(rect, {
              rx: 1,
              ry: 1,
              width: 6,
              height: 6,
              style: {
                fill: value && value.count ? '#22c55e' : '#1f2937',
                stroke: 'none',
              },
            });
          }}
        />
      </div>

      <div className="mt-2 flex items-center justify-between text-xs text-gray-400">
        <span>Less</span>
        <div className="flex items-center gap-1">
          <div className="w-1.5 h-1.5 rounded-sm bg-gray-700"></div>
          <div className="w-1.5 h-1.5 rounded-sm bg-green-200"></div>
          <div className="w-1.5 h-1.5 rounded-sm bg-green-400"></div>
          <div className="w-1.5 h-1.5 rounded-sm bg-green-500"></div>
          <div className="w-1.5 h-1.5 rounded-sm bg-green-600"></div>
        </div>
        <span>More</span>
      </div>

      <style jsx>{`
        .heatmap-container {
          background: #0d1117;
          border-radius: 4px;
          padding: 6px;
          height: 280px;
        }
        
        .react-calendar-heatmap {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          width: 100%;
          max-width: 600px;
        }
        
        .react-calendar-heatmap .react-calendar-heatmap-month-label {
          font-size: 4px;
          fill: #7d8590;
        }
        
        .react-calendar-heatmap .react-calendar-heatmap-weekday-label {
          font-size: 4px;
          fill: #7d8590;
        }
        
        .react-calendar-heatmap rect {
          transition: all 0.1s ease;
        }
        
        .react-calendar-heatmap rect:hover {
          stroke: #30363d;
          stroke-width: 1;
        }
        
        /* Add spacing between months */
        .react-calendar-heatmap .react-calendar-heatmap-month:not(:first-child) {
          margin-left: 10px;
        }
        
        /* Compact size */
        .react-calendar-heatmap svg {
          width: 100%;
          height: auto;
          max-height: 90px;
        }
        
        /* Custom colors matching GitHub style */
        .color-empty {
          fill: #161b22;
        }
        
        .color-filled {
          fill: #22c55e;
        }
        
        @media (max-width: 768px) {
          .heatmap-container {
            font-size: 8px;
            padding: 4px;
          }
          
          .react-calendar-heatmap .react-calendar-heatmap-month-label {
            font-size: 7px;
          }
          
          .react-calendar-heatmap .react-calendar-heatmap-weekday-label {
            font-size: 6px;
          }
          
          .react-calendar-heatmap .react-calendar-heatmap-month:not(:first-child) {
            margin-left: 6px;
          }
          
          .react-calendar-heatmap svg {
            max-height: 70px;
          }
        }
      `}</style>
    </div>
  );
};

export default Heatmap;

