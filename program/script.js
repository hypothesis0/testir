document.addEventListener('DOMContentLoaded', function() {
    // Variables
    const calendarToggle = document.getElementById('calendar-toggle');
    const listToggle = document.getElementById('list-toggle');
    const calendarView = document.getElementById('calendar-view');
    const listView = document.getElementById('list-view');
    const overlay = document.getElementById('overlay');
    const eventPopup = document.getElementById('event-popup');
    const closeButton = document.querySelector('.close-button');
    const popupTitle = document.querySelector('.popup-title');
    const popupDate = document.querySelector('.popup-date');
    const popupDescription = document.querySelector('.popup-description');
    const prevMonthButton = document.getElementById('prev-month');
    const nextMonthButton = document.getElementById('next-month');
    const currentMonthDisplay = document.getElementById('current-month');
    const timeFilter = document.getElementById('time-filter');
    const upcomingToggle = document.getElementById('upcoming-toggle');
    const pastToggle = document.getElementById('past-toggle');
    const sectionHeading = document.querySelector('.section-heading');
    
    // Event data - these can span multiple months
    const events = [
        {
            id: 1,
            title: "Spring Showcase Event",
            date: "April 22, 2025",
            time: "7:00 PM - 9:00 PM",
            description: "Join us for our Spring showcase featuring works from our resident artists.",
            color: "rgb(70, 0, 0)"
        },
        {
            id: 2,
            title: "Artist Talk Series",
            date: "April 25, 2025",
            time: "6:30 PM - 8:00 PM",
            description: "A conversation with leading contemporary artists about their practice and recent work.",
            color: "rgb(0, 51, 13)"
        },
        {
            id: 3,
            title: "Poetry Reading",
            date: "April 30, 2025",
            time: "7:30 PM - 9:30 PM",
            description: "An evening of poetry readings featuring both established and emerging voices.",
            color: "#3b2b1d"
        },
        {
            id: 4,
            title: "Summer Film Screening",
            date: "May 15, 2025",
            time: "8:00 PM - 10:00 PM",
            description: "Outdoor screening of independent films in our courtyard.",
            color: "rgb(50, 50, 120)"
        },
        {
            id: 5,
            title: "June Symposium",
            date: "June 10, 2025",
            time: "10:00 AM - 4:00 PM",
            description: "A day-long symposium on contemporary art practices.",
            color: "rgb(100, 30, 100)"
        },
        // Past events for example
        {
            id: 6,
            title: "Winter Exhibition Opening",
            date: "January 15, 2025",
            time: "6:00 PM - 9:00 PM",
            description: "Opening reception for our winter exhibition featuring multimedia installations.",
            color: "rgb(0, 80, 120)"
        },
        {
            id: 7,
            title: "Artist Workshop Series",
            date: "February 10, 2025",
            time: "2:00 PM - 5:00 PM",
            description: "Hands-on workshop exploring experimental techniques in mixed media.",
            color: "rgb(100, 80, 0)"
        },
        {
            id: 8,
            title: "Research Presentation",
            date: "March 5, 2025",
            time: "7:00 PM - 8:30 PM",
            description: "Presentation of findings from our winter research fellowship program.",
            color: "rgb(40, 80, 40)"
        }
    ];
    
    // Current month and year
    let currentMonth = 3; // April (0-based)
    let currentYear = 2025;
    let showUpcoming = true; // Default: show upcoming events
    
    // Current date for filtering past/upcoming events
    const today = new Date();
    
    // Month names array
    const months = ['JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE', 'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'];
    
    // Function to determine if an event is upcoming or past
    function isUpcomingEvent(event) {
        const eventDate = new Date(event.date + ' ' + event.time.split(' - ')[0]);
        return eventDate >= today;
    }
    
    // Initialize views and UI elements
    generateCalendar(currentMonth, currentYear);
    updateListView();
    
    // Initialize UI state
    timeFilter.style.display = 'none'; // Make sure time filter is hidden initially
    
    // View toggle handlers
    calendarToggle.addEventListener('click', function() {
        calendarToggle.classList.add('active');
        listToggle.classList.remove('active');
        calendarView.style.display = 'table';
        listView.style.display = 'none';
        
        // Show month selector when in calendar view
        document.querySelector('.month-selector').style.visibility = 'visible';
        document.querySelector('.month-display').textContent = `${months[currentMonth]} ${currentYear}`;
    });
    
    listToggle.addEventListener('click', function() {
        listToggle.classList.add('active');
        calendarToggle.classList.remove('active');
        listView.style.display = 'table';
        calendarView.style.display = 'none';
        
        // Hide month selector when in list view
        document.querySelector('.month-selector').style.visibility = 'hidden';
        document.querySelector('.month-display').textContent = 'ALL UPCOMING EVENTS';
        
        // Update list to show all events
        updateListView();
    });
    
    // Month navigation handlers
    function updateMonthDisplay() {
        currentMonthDisplay.textContent = `${months[currentMonth]} ${currentYear}`;
    }
    
    prevMonthButton.addEventListener('click', function() {
        currentMonth--;
        if (currentMonth < 0) {
            currentMonth = 11;
            currentYear--;
        }
        updateMonthDisplay();
        generateCalendar(currentMonth, currentYear);
    });
    
    nextMonthButton.addEventListener('click', function() {
        currentMonth++;
        if (currentMonth > 11) {
            currentMonth = 0;
            currentYear++;
        }
        updateMonthDisplay();
        generateCalendar(currentMonth, currentYear);
    });
    
    // Function to generate the calendar for a given month and year
    function generateCalendar(month, year) {
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDay = firstDay.getDay(); // Day of week (0-6)
        
        // Get calendar body
        const calendarBody = document.getElementById('calendar-body');
        calendarBody.innerHTML = '';
        
        // Calculate previous month's days needed
        const prevMonthLastDay = new Date(year, month, 0).getDate();
        
        // Variables for building calendar
        let date = 1;
        let nextMonthDate = 1;
        
        // Create calendar rows
        for (let i = 0; i < 6; i++) { // Maximum of 6 rows
            // Create a table row
            const row = document.createElement('tr');
            
            // Create cells for each day of the week
            for (let j = 0; j < 7; j++) {
                const cell = document.createElement('td');
                
                if (i === 0 && j < startingDay) {
                    // Previous month days
                    const prevDate = prevMonthLastDay - startingDay + j + 1;
                    cell.innerHTML = `<div class="date-number other-month">${prevDate}</div>`;
                } else if (date > daysInMonth) {
                    // Next month days
                    cell.innerHTML = `<div class="date-number other-month">${nextMonthDate}</div>`;
                    nextMonthDate++;
                } else {
                    // Current month days
                    cell.innerHTML = `<div class="date-number">${date}</div>`;
                    
                    // Check if this is the current day
                    const now = new Date();
                    if (date === now.getDate() && month === now.getMonth() && year === now.getFullYear()) {
                        cell.querySelector('.date-number').parentElement.classList.add('current-day');
                    }
                    
                    // Check for events on this day
                    const currentDate = new Date(year, month, date);
                    events.forEach(event => {
                        const eventDate = new Date(event.date);
                        if (eventDate.getDate() === currentDate.getDate() && 
                            eventDate.getMonth() === currentDate.getMonth() && 
                            eventDate.getFullYear() === currentDate.getFullYear()) {
                            
                            // Create event element
                            const eventDiv = document.createElement('div');
                            eventDiv.className = 'calendar-event';
                            eventDiv.textContent = event.title;
                            eventDiv.setAttribute('data-event-id', event.id);
                            eventDiv.style.borderLeftColor = event.color;
                            
                            // Add click event
                            eventDiv.addEventListener('click', function(e) {
                                e.stopPropagation();
                                showEventDetails(event.id);
                            });
                            
                            cell.appendChild(eventDiv);
                        }
                    });
                    
                    date++;
                }
                row.appendChild(cell);
            }
            
            calendarBody.appendChild(row);
            
            // Stop if we've reached the end of the month
            if (date > daysInMonth && i >= 4) {
                break;
            }
        }
    }
    
    // Function to update the list view with all events
    function updateListView() {
        const listBody = document.querySelector('#list-view tbody');
        
        // Filter events based on the current toggle
        const filteredEvents = events.filter(event => {
            return showUpcoming ? isUpcomingEvent(event) : !isUpcomingEvent(event);
        });
        
        // Sort events by date
        const sortedEvents = [...filteredEvents].sort((a, b) => {
            const dateA = new Date(a.date + ' ' + a.time.split(' - ')[0]);
            const dateB = new Date(b.date + ' ' + b.time.split(' - ')[0]);
            return dateA - dateB;
        });
        
        // Clear existing list
        listBody.innerHTML = '';
        
        // Add all events to the list
        sortedEvents.forEach(event => {
            // Parse the date manually since formats might vary
            let month, day, year;
            const dateParts = event.date.split(' ');
            
            // Extract month name and convert to number
            switch(dateParts[0].toLowerCase()) {
                case 'january': month = '01'; break;
                case 'february': month = '02'; break;
                case 'march': month = '03'; break;
                case 'april': month = '04'; break;
                case 'may': month = '05'; break;
                case 'june': month = '06'; break;
                case 'july': month = '07'; break;
                case 'august': month = '08'; break;
                case 'september': month = '09'; break;
                case 'october': month = '10'; break;
                case 'november': month = '11'; break;
                case 'december': month = '12'; break;
            }
            
            // Extract day (remove comma if present)
            day = dateParts[1].replace(',', '').padStart(2, '0');
            
            // Extract year
            year = dateParts[2].slice(-2); // Get last 2 digits of year
            
            // Create new row
            const row = document.createElement('tr');
            row.setAttribute('data-event-id', event.id);
            
            // Add date and title columns
            row.innerHTML = `
                <td class="date-column">${month}.${day}.${year}</td>
                <td class="title-column">${event.title}</td>
            `;
            
            // Add click event
            row.addEventListener('click', function() {
                showEventDetails(event.id);
            });
            
            listBody.appendChild(row);
        });
    }
    
    // Event popup functions
    function showEventDetails(eventId) {
        const event = events.find(e => e.id === parseInt(eventId));
        if (event) {
            popupTitle.textContent = event.title;
            popupDate.textContent = `${event.date} • ${event.time}`;
            popupDescription.textContent = event.description;
            
            // Store event ID on the popup for Google Calendar functionality
            eventPopup.setAttribute('data-event-id', eventId);
            
            overlay.style.display = 'block';
            eventPopup.style.display = 'block';
        }
    }
    
    function closePopup() {
        overlay.style.display = 'none';
        eventPopup.style.display = 'none';
    }
    
    // Close popup event handlers
    closeButton.addEventListener('click', closePopup);
    overlay.addEventListener('click', closePopup);
    
    // Google Calendar button handler
    document.querySelector('.add-calendar').addEventListener('click', function() {
        // Function to format date for Google Calendar URL
        function formatGoogleCalendarDate(dateStr, timeStr) {
            const eventDate = new Date(dateStr);
            const startTime = timeStr.split(' - ')[0];
            const endTime = timeStr.split(' - ')[1];
            
            // Parse start time
            const startParts = startTime.match(/(\d+):(\d+) (AM|PM)/);
            let startHours = parseInt(startParts[1]);
            const startMinutes = parseInt(startParts[2]);
            if (startParts[3] === 'PM' && startHours < 12) startHours += 12;
            if (startParts[3] === 'AM' && startHours === 12) startHours = 0;
            
            // Parse end time
            const endParts = endTime.match(/(\d+):(\d+) (AM|PM)/);
            let endHours = parseInt(endParts[1]);
            const endMinutes = parseInt(endParts[2]);
            if (endParts[3] === 'PM' && endHours < 12) endHours += 12;
            if (endParts[3] === 'AM' && endHours === 12) endHours = 0;
            
            // Set start and end times
            const start = new Date(eventDate);
            start.setHours(startHours, startMinutes);
            
            const end = new Date(eventDate);
            end.setHours(endHours, endMinutes);
            
            // Format dates for Google Calendar
            const formatDate = (date) => {
                return date.toISOString().replace(/-|:|\.\d+/g, '');
            };
            
            return {
                start: formatDate(start),
                end: formatDate(end)
            };
        }
        
        // Get current event
        const currentEventId = eventPopup.getAttribute('data-event-id');
        const event = events.find(e => e.id === parseInt(currentEventId));
        
        if (event) {
            const dates = formatGoogleCalendarDate(event.date, event.time);
            const eventTitle = encodeURIComponent(event.title);
            const eventDescription = encodeURIComponent(event.description);
            
            // Create Google Calendar URL
            const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${eventTitle}&dates=${dates.start}/${dates.end}&details=${eventDescription}`;
            
            // Open Google Calendar in a new tab
            window.open(calendarUrl, '_blank');
        } else {
            // Fallback to simple Google Calendar open
            window.open('https://calendar.google.com', '_blank');
        }
    });
    
    // Set up auto-sync (silently checks for date change)
    function checkForDateChange() {
        const now = new Date();
        const newMonth = now.getMonth();
        const newYear = now.getFullYear();
        
        if (newMonth !== currentMonth || newYear !== currentYear) {
            currentMonth = newMonth;
            currentYear = newYear;
            updateMonthDisplay();
            generateCalendar(currentMonth, currentYear);
        }
    }
    
    // Check for date change every day (in milliseconds)
    setInterval(checkForDateChange, 86400000); // 24 hours
});