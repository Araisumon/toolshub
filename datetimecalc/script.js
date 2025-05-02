$(document).ready(function() {
    // Set current date/time as default values
    const now = new Date();
    const nowStr = now.toISOString().slice(0, 16);
    $('input[type="datetime-local"]').val(nowStr);
    $('input[type="date"]').val(now.toISOString().slice(0, 10));

    // Add tooltips to Sunrise/Sunset Calculator elements
    $('#sun-date').attr('data-tooltip', 'Select the date for sunrise/sunset calculation');
    $('#sun-location').attr('data-tooltip', 'Enter coordinates as latitude,longitude (e.g., 40.7128,-74.0060)');
    $('#calculate-sun-times').attr('data-tooltip', 'Calculate sunrise and sunset times for the specified date and location');

    // Populate timezone dropdowns
    const commonTimezones = [
        'UTC', 'America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles',
        'Europe/London', 'Europe/Paris', 'Asia/Tokyo', 'Australia/Sydney', 'Asia/Dubai'
    ];
    const timezoneOptions = commonTimezones.map(tz => `<option value="${tz}">${tz}</option>`).join('');
    $('#from-timezone, #to-timezone').html(timezoneOptions);

    // Theme toggle functionality
    const themeToggle = $('.theme-toggle');
    const body = $('body');

    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        body.attr('data-theme', savedTheme);
        updateThemeIcon(savedTheme);
    } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        body.attr('data-theme', 'dark');
        updateThemeIcon('dark');
    }

    themeToggle.click(function() {
        try {
            const currentTheme = body.attr('data-theme') || 'light';
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            body.attr('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            updateThemeIcon(newTheme);
        } catch (error) {
            showNotification(`Error toggling theme: ${error.message}`, 'error');
        }
    });

    function updateThemeIcon(theme) {
        themeToggle.find('i').removeClass('fa-moon fa-sun').addClass(theme === 'dark' ? 'fa-sun' : 'fa-moon');
    }

    // Scroll to top/bottom buttons
    const scrollToTop = $('.scroll-to-top');
    const scrollToBottom = $('.scroll-to-bottom');

    $(window).scroll(function() {
        scrollToTop.toggleClass('active', $(this).scrollTop() > 200);
    });

    scrollToTop.click(function() {
        $('html, body').animate({ scrollTop: 0 }, 'smooth');
    });

    scrollToBottom.click(function() {
        $('html, body').animate({ scrollTop: $(document).height() }, 'smooth');
    });

    // Quick action buttons
    $('.quick-action-btn').click(function() {
        const action = $(this).data('action');
        let date = new Date();

        try {
            switch(action) {
                case 'today':
                    break;
                case 'tomorrow':
                    date.setDate(date.getDate() + 1);
                    break;
                case 'next-week':
                    date.setDate(date.getDate() + 7);
                    break;
                case 'next-month':
                    date.setMonth(date.getMonth() + 1);
                    break;
                case 'new-year':
                    date = new Date(date.getFullYear() + 1, 0, 1);
                    break;
                default:
                    throw new Error('Invalid quick action');
            }

            const dateStr = date.toISOString().slice(0, 10);
            const datetimeStr = date.toISOString().slice(0, 16);

            $('input[type="date"]').val(dateStr);
            $('input[type="datetime-local"]').val(datetimeStr);

            showNotification(`Date set to ${action.replace('-', ' ')}`, 'success');
        } catch (error) {
            showNotification(`Error setting date: ${error.message}`, 'error');
        }
    });

    // Notification function
    function showNotification(message, type = 'info') {
        const notification = $(`<div class="notification ${type}">${message}</div>`);
        $('body').append(notification);
        notification.animate({ opacity: 1 }, 300).delay(3000).animate({ opacity: 0 }, 300, function() {
            $(this).remove();
        });
    }

    // Copy to clipboard
    $('.btn-copy').click(function() {
        const targetId = $(this).data('target');
        const text = $(`#${targetId}`).text().trim();

        try {
            if (!text) {
                throw new Error('Nothing to copy');
            }

            if (navigator.clipboard) {
                navigator.clipboard.writeText(text).then(() => {
                    showNotification('Copied to clipboard', 'success');
                }).catch(() => {
                    throw new Error('Clipboard access denied');
                });
            } else {
                const textarea = document.createElement('textarea');
                textarea.value = text;
                document.body.appendChild(textarea);
                textarea.select();
                document.execCommand('copy');
                document.body.removeChild(textarea);
                showNotification('Copied to clipboard', 'success');
            }
        } catch (error) {
            showNotification(`Failed to copy: ${error.message}`, 'error');
        }
    });

    // Share functionality
    let currentResult = '';
    $('.btn-share').click(function() {
        try {
            currentResult = $(`#${$(this).data('result')}-value`).text().trim();
            if (!currentResult) {
                throw new Error('No result to share');
            }
            $('.share-modal').addClass('active');
            $('#share-message').val('');
        } catch (error) {
            showNotification(`Error sharing: ${error.message}`, 'error');
        }
    });

    $('.share-modal-close').click(function() {
        $('.share-modal').removeClass('active');
    });

    $('.share-btn').click(function() {
        try {
            const platform = $(this).hasClass('share-facebook') ? 'facebook' :
                            $(this).hasClass('share-twitter') ? 'twitter' :
                            $(this).hasClass('share-linkedin') ? 'linkedin' :
                            $(this).hasClass('share-whatsapp') ? 'whatsapp' :
                            $(this).hasClass('share-email') ? 'email' : 'link';
            const customMessage = $('#share-message').val().trim();
            const message = customMessage ? `${customMessage}\n\n${currentResult}` : currentResult;
            const encodedMessage = encodeURIComponent(message);
            const url = encodeURIComponent(window.location.href);
            let shareUrl;

            switch(platform) {
                case 'facebook':
                    shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}&quote=${encodedMessage}`;
                    break;
                case 'twitter':
                    shareUrl = `https://twitter.com/intent/tweet?text=${encodedMessage}&url=${url}`;
                    break;
                case 'linkedin':
                    shareUrl = `https://www.linkedin.com/shareArticle?mini=true&url=${url}&title=Date%20Calculation&summary=${encodedMessage}`;
                    break;
                case 'whatsapp':
                    shareUrl = `https://api.whatsapp.com/send?text=${encodedMessage}%20${url}`;
                    break;
                case 'email':
                    shareUrl = `mailto:?subject=Date%20Calculation%20Result&body=${encodedMessage}%0A%0A${url}`;
                    break;
                case 'link':
                    if (navigator.clipboard) {
                        navigator.clipboard.writeText(`${message}\n${url}`).then(() => {
                            showNotification('Link copied to clipboard', 'success');
                        }).catch(() => {
                            throw new Error('Clipboard access denied');
                        });
                    } else {
                        const textarea = document.createElement('textarea');
                        textarea.value = `${message}\n${url}`;
                        document.body.appendChild(textarea);
                        textarea.select();
                        document.execCommand('copy');
                        document.body.removeChild(textarea);
                        showNotification('Link copied to clipboard', 'success');
                    }
                    return;
                default:
                    throw new Error('Invalid share platform');
            }

            window.open(shareUrl, '_blank');
            $('.share-modal').removeClass('active');
        } catch (error) {
            showNotification(`Error sharing: ${error.message}`, 'error');
        }
    });

    // Guided tour
    $('#start-tour').click(function() {
        try {
            $('.tour-overlay').show();
            showTourStep(1);
        } catch (error) {
            showNotification(`Error starting tour: ${error.message}`, 'error');
        }
    });

    $('.tour-close, .tour-skip, .tour-finish').click(function() {
        $('.tour-overlay').hide();
        $(`#tour-step-1, #tour-step-2, #tour-step-3, #tour-step-4, #tour-step-5, #tour-step-6`).hide();
    });

    $('.tour-next').click(function() {
        try {
            const currentStep = parseInt($('[id^=tour-step-]:visible').attr('id').split('-')[2]);
            showTourStep(currentStep + 1);
        } catch (error) {
            showNotification(`Error navigating tour: ${error.message}`, 'error');
        }
    });

    $('.tour-prev').click(function() {
        try {
            const currentStep = parseInt($('[id^=tour-step-]:visible').attr('id').split('-')[2]);
            showTourStep(currentStep - 1);
        } catch (error) {
            showNotification(`Error navigating tour: ${error.message}`, 'error');
        }
    });

    function showTourStep(step) {
        try {
            $(`#tour-step-1, #tour-step-2, #tour-step-3, #tour-step-4, #tour-step-5, #tour-step-6`).hide();
            $(`#tour-step-${step}`).show();
        } catch (error) {
            showNotification(`Error showing tour step: ${error.message}`, 'error');
        }
    }

    // Date Difference Calculator
    $('#calculate-difference').click(function() {
        try {
            const startDateStr = $('#start-date').val();
            const endDateStr = $('#end-date').val();
            const includeTime = $('#include-time').is(':checked');

            if (!startDateStr || !endDateStr) {
                throw new Error('Please enter valid dates');
            }

            const startDate = new Date(startDateStr);
            const endDate = new Date(endDateStr);

            if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
                throw new Error('Invalid date format');
            }

            if (startDate > endDate) {
                throw new Error('Start date must be before end date');
            }

            let years = endDate.getFullYear() - startDate.getFullYear();
            let months = endDate.getMonth() - startDate.getMonth();
            let days = endDate.getDate() - startDate.getDate();

            if (months < 0 || (months === 0 && days < 0)) {
                years--;
                months += 12;
            }

            if (days < 0) {
                const lastMonth = new Date(endDate.getFullYear(), endDate.getMonth(), 0);
                days = lastMonth.getDate() - startDate.getDate() + endDate.getDate();
                months--;
            }

            let result = `${years} years, ${months} months, ${days} days`;

            if (includeTime) {
                let hours = endDate.getHours() - startDate.getHours();
                let minutes = endDate.getMinutes() - startDate.getMinutes();
                let seconds = endDate.getSeconds() - startDate.getSeconds();

                if (seconds < 0) {
                    seconds += 60;
                    minutes--;
                }
                if (minutes < 0) {
                    minutes += 60;
                    hours--;
                }
                if (hours < 0) {
                    hours += 24;
                    days--;
                }

                result += `, ${hours} hours, ${minutes} minutes, ${seconds} seconds`;
            }

            const diffMs = endDate - startDate;
            const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
            const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
            const diffMinutes = Math.floor(diffMs / (1000 * 60));
            const diffSeconds = Math.floor(diffMs / 1000);

            result += `\n\nTotal: ${diffDays} days (${diffHours} hours, ${diffMinutes} minutes, ${diffSeconds} seconds)`;

            $('#difference-value').text(result);
            $('#difference-result').show().css({opacity: 0}).animate({opacity: 1}, 300);
            showNotification('Date difference calculated', 'success');
        } catch (error) {
            showNotification(`Error: ${error.message}`, 'error');
        }
    });

    // Add/Subtract Time Calculator
    $('#calculate-time-operation').click(function() {
        try {
            const baseDateStr = $('#base-date').val();
            const amount = parseInt($('#time-amount').val());
            const unit = $('#time-unit').val();
            const operation = $('input[name="operation"]:checked').val();

            if (!baseDateStr) {
                throw new Error('Please enter a valid base date');
            }

            const baseDate = new Date(baseDateStr);
            if (isNaN(baseDate.getTime())) {
                throw new Error('Invalid base date format');
            }

            if (isNaN(amount) || amount <= 0) {
                throw new Error('Please enter a valid positive amount');
            }

            if (!unit) {
                throw new Error('Please select a time unit');
            }

            const resultDate = new Date(baseDate);

            switch(unit) {
                case 'seconds':
                    resultDate.setSeconds(resultDate.getSeconds() + (operation === 'add' ? amount : -amount));
                    break;
                case 'minutes':
                    resultDate.setMinutes(resultDate.getMinutes() + (operation === 'add' ? amount : -amount));
                    break;
                case 'hours':
                    resultDate.setHours(resultDate.getHours() + (operation === 'add' ? amount : -amount));
                    break;
                case 'days':
                    resultDate.setDate(resultDate.getDate() + (operation === 'add' ? amount : -amount));
                    break;
                case 'weeks':
                    resultDate.setDate(resultDate.getDate() + (operation === 'add' ? amount * 7 : -amount * 7));
                    break;
                case 'months':
                    const originalDate = resultDate.getDate();
                    resultDate.setMonth(resultDate.getMonth() + (operation === 'add' ? amount : -amount));
                    if (resultDate.getDate() !== originalDate) {
                        resultDate.setDate(0); // Last day of previous month
                    }
                    break;
                case 'years':
                    const originalMonth = resultDate.getMonth();
                    const originalDay = resultDate.getDate();
                    resultDate.setFullYear(resultDate.getFullYear() + (operation === 'add' ? amount : -amount));
                    if (originalMonth === 1 && originalDay === 29 && !isLeapYear(resultDate.getFullYear())) {
                        resultDate.setDate(28);
                    }
                    break;
                default:
                    throw new Error('Invalid time unit');
            }

            const operationText = operation === 'add' ? 'Added' : 'Subtracted';
            const formattedDate = resultDate.toLocaleString();

            $('#operation-value').text(`${operationText} ${amount} ${unit} from ${baseDate.toLocaleString()}\n\nResult: ${formattedDate}`);
            $('#operation-result').show().css({opacity: 0}).animate({opacity: 1}, 300);
            showNotification('Time operation completed', 'success');
        } catch (error) {
            showNotification(`Error: ${error.message}`, 'error');
        }
    });

    function isLeapYear(year) {
        return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
    }

    // Timezone Converter
    $('#convert-timezone').click(function() {
        try {
            const dateTimeStr = $('#convert-date').val();
            const fromTimezone = $('#from-timezone').val();
            const toTimezone = $('#to-timezone').val();

            if (!dateTimeStr) {
                throw new Error('Please enter a valid date and time');
            }

            if (!fromTimezone || !toTimezone) {
                throw new Error('Please select both timezones');
            }

            if (fromTimezone === toTimezone) {
                showNotification('Timezones are the same - no conversion needed', 'warning');
                return;
            }

            const m = moment.tz(dateTimeStr, fromTimezone);
            if (!m.isValid()) {
                throw new Error('Invalid date/time for selected timezone');
            }

            const converted = m.clone().tz(toTimezone);
            const originalFormat = m.format('LLLL (UTCZ)');
            const convertedFormat = converted.format('LLLL (UTCZ)');
            const offsetDiff = converted.utcOffset() - m.utcOffset();
            const offsetHours = Math.abs(Math.floor(offsetDiff / 60));
            const offsetMinutes = Math.abs(offsetDiff % 60);
            const offsetDirection = offsetDiff >= 0 ? 'ahead' : 'behind';

            $('#timezone-value').text(`Original (${fromTimezone}): ${originalFormat}\n\nConverted (${toTimezone}): ${convertedFormat}\n\nTime Difference: ${offsetHours} hours ${offsetMinutes} minutes ${offsetDirection}`);
            $('#timezone-result').show().css({opacity: 0}).animate({opacity: 1}, 300);
            showNotification('Timezone conversion completed', 'success');
        } catch (error) {
            showNotification(`Timezone conversion failed: ${error.message}`, 'error');
        }
    });

    // Business Days Calculator
    $('#calculate-business-days').click(function() {
        try {
            const startDateStr = $('#business-start-date').val();
            const endDateStr = $('#business-end-date').val();
            const excludeWeekends = $('#exclude-weekends').is(':checked');
            const holidaysRegion = $('#holidays-region').val();

            if (!startDateStr || !endDateStr) {
                throw new Error('Please enter valid dates');
            }

            const startDate = new Date(startDateStr);
            const endDate = new Date(endDateStr);

            if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
                throw new Error('Invalid date format');
            }

            if (startDate > endDate) {
                throw new Error('Start date must be before end date');
            }

            let businessDays = 0;
            let currentDate = new Date(startDate);
            currentDate.setHours(0, 0, 0, 0);
            endDate.setHours(0, 0, 0, 0);

            const holidays = getHolidaysForRegion(holidaysRegion, startDate.getFullYear(), endDate.getFullYear());
            const holidayDates = holidays
                .map(h => {
                    const d = new Date(h.date);
                    return isNaN(d.getTime()) ? null : d.setHours(0, 0, 0, 0);
                })
                .filter(d => d !== null);

            $('#holidays-list').empty().hide();

            while (currentDate < endDate) {
                const dayOfWeek = currentDate.getDay();
                const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
                const isHoliday = holidayDates.includes(currentDate.getTime());

                if ((!excludeWeekends || !isWeekend) && !isHoliday) {
                    businessDays++;
                }

                currentDate.setDate(currentDate.getDate() + 1);
            }

            let result = `${businessDays} business days between ${startDate.toLocaleDateString()} and ${endDate.toLocaleDateString()}`;

            if (excludeWeekends) {
                const totalDays = Math.round((endDate - startDate) / (1000 * 60 * 60 * 24));
                const weekendDays = totalDays - businessDays - (holidays.length || 0);
                result += ` (excluding ${weekendDays} weekend days)`;
            }

            if (holidays.length > 0) {
                result += ` and ${holidays.length} holidays`;
                $('#holidays-list').append('<h4>Excluded Holidays:</h4>');
                holidays.forEach(holiday => {
                    if (!isNaN(new Date(holiday.date).getTime())) {
                        $('#holidays-list').append(`<div class="holiday-item"><strong>${holiday.name}</strong>: ${new Date(holiday.date).toLocaleDateString()}</div>`);
                    }
                });
                $('#holidays-list').show();
            }

            $('#business-days-value').text(result);
            $('#business-days-result').show().css({opacity: 0}).animate({opacity: 1}, 300);
            showNotification('Business days calculated', 'success');
        } catch (error) {
            showNotification(`Error: ${error.message}`, 'error');
        }
    });

    function getHolidaysForRegion(region, startYear, endYear) {
        try {
            const holidays = [];
            for (let year = startYear; year <= endYear; year++) {
                switch(region) {
                    case 'US':
                        holidays.push(
                            { name: `New Year's Day ${year}`, date: `${year}-01-01` },
                            { name: `Martin Luther King Jr. Day ${year}`, date: getNthWeekday(year, 1, 1, 3) },
                            { name: `Memorial Day ${year}`, date: getLastWeekday(year, 5, 1) },
                            { name: `Independence Day ${year}`, date: `${year}-07-04` },
                            { name: `Labor Day ${year}`, date: getNthWeekday(year, 9, 1, 1) },
                            { name: `Thanksgiving ${year}`, date: getNthWeekday(year, 11, 4, 4) },
                            { name: `Christmas ${year}`, date: `${year}-12-25` }
                        );
                        break;
                    case 'UK':
                        holidays.push(
                            { name: `New Year's Day ${year}`, date: `${year}-01-01` },
                            { name: `Good Friday ${year}`, date: getEasterSunday(year, -2) },
                            { name: `Easter Monday ${year}`, date: getEasterSunday(year, 1) },
                            { name: `Early May Bank Holiday ${year}`, date: getNthWeekday(year, 5, 1, 1) },
                            { name: `Christmas ${year}`, date: `${year}-12-25` },
                            { name: `Boxing Day ${year}`, date: `${year}-12-26` }
                        );
                        break;
                    case 'CA':
                        holidays.push(
                            { name: `New Year's Day ${year}`, date: `${year}-01-01` },
                            { name: `Canada Day ${year}`, date: `${year}-07-01` },
                            { name: `Labour Day ${year}`, date: getNthWeekday(year, 9, 1, 1) },
                            { name: `Thanksgiving ${year}`, date: getNthWeekday(year, 10, 1, 2) },
                            { name: `Christmas ${year}`, date: `${year}-12-25` }
                        );
                        break;
                    case 'AU':
                        holidays.push(
                            { name: `New Year's Day ${year}`, date: `${year}-01-01` },
                            { name: `Australia Day ${year}`, date: `${year}-01-26` },
                            { name: `Anzac Day ${year}`, date: `${year}-04-25` },
                            { name: `Christmas ${year}`, date: `${year}-12-25` },
                            { name: `Boxing Day ${year}`, date: `${year}-12-26` }
                        );
                        break;
                    case 'EU':
                        holidays.push(
                            { name: `New Year's Day ${year}`, date: `${year}-01-01` },
                            { name: `Good Friday ${year}`, date: getEasterSunday(year, -2) },
                            { name: `Easter Monday ${year}`, date: getEasterSunday(year, 1) },
                            { name: `Christmas ${year}`, date: `${year}-12-25` }
                        );
                        break;
                    case 'none':
                        break;
                    default:
                        throw new Error('Invalid region');
                }
            }
            return holidays;
        } catch (error) {
            showNotification(`Error retrieving holidays: ${error.message}`, 'error');
            return [];
        }
    }

    function getNthWeekday(year, month, weekday, n) {
        try {
            const date = new Date(year, month - 1, 1);
            const firstDay = date.getDay();
            const offset = (weekday - firstDay + 7) % 7;
            date.setDate(1 + offset + (n - 1) * 7);
            return date.toISOString().slice(0, 10);
        } catch (error) {
            throw new Error(`Error calculating nth weekday: ${error.message}`);
        }
    }

    function getLastWeekday(year, month, weekday) {
        try {
            const date = new Date(year, month, 0);
            while (date.getDay() !== weekday) {
                date.setDate(date.getDate() - 1);
            }
            return date.toISOString().slice(0, 10);
        } catch (error) {
            throw new Error(`Error calculating last weekday: ${error.message}`);
        }
    }

    function getEasterSunday(year, offset = 0) {
        try {
            const a = year % 19;
            const b = Math.floor(year / 100);
            const c = year % 100;
            const d = Math.floor(b / 4);
            const e = b % 4;
            const f = Math.floor((b + 8) / 25);
            const g = Math.floor((b - f + 1) / 3);
            const h = (19 * a + b - d - g + 15) % 30;
            const i = Math.floor(c / 4);
            const k = c % 4;
            const l = (32 + 2 * e + 2 * i - h - k) % 7;
            const m = Math.floor((a + 11 * h + 22 * l) / 451);
            const month = Math.floor((h + l - 7 * m + 114) / 31);
            const day = ((h + l - 7 * m + 114) % 31) + 1;

            const easter = new Date(year, month - 1, day);
            easter.setDate(easter.getDate() + offset);
            return easter.toISOString().slice(0, 10);
        } catch (error) {
            throw new Error(`Error calculating Easter Sunday: ${error.message}`);
        }
    }

    // Countdown Timer
    let countdownInterval = null;
    $('#start-countdown').click(function() {
        try {
            const targetDateStr = $('#countdown-date').val();
            const eventTitle = $('#countdown-title').val().trim() || 'Countdown';

            if (!targetDateStr) {
                throw new Error('Please enter a valid target date');
            }

            const targetDate = new Date(targetDateStr);
            if (isNaN(targetDate.getTime())) {
                throw new Error('Invalid target date format');
            }

            if (countdownInterval) {
                clearInterval(countdownInterval);
            }

            $('#countdown-event-title').text(eventTitle);
            $('#countdown-result').show().css({opacity: 0}).animate({opacity: 1}, 300);

            function updateCountdown() {
                try {
                    const now = new Date();
                    const diffMs = targetDate - now;

                    if (diffMs <= 0) {
                        clearInterval(countdownInterval);
                        $('#countdown-value').text('Event has passed!');
                        showNotification('Countdown ended', 'info');
                        return;
                    }

                    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
                    const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
                    const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);

                    $('#countdown-value').text(`${days}d ${hours}h ${minutes}m ${seconds}s`);
                } catch (error) {
                    clearInterval(countdownInterval);
                    showNotification(`Countdown error: ${error.message}`, 'error');
                }
            }

            updateCountdown();
            countdownInterval = setInterval(updateCountdown, 1000);
            showNotification('Countdown started', 'success');
        } catch (error) {
            showNotification(`Error starting countdown: ${error.message}`, 'error');
        }
    });

    // Custom Date Rules
    let savedRules = [];
    function updateSavedRulesList() {
        try {
            savedRules = JSON.parse(localStorage.getItem('savedRules')) || [];
            $('#saved-rules-container').empty();
            savedRules.forEach((rule, index) => {
                $('#saved-rules-container').append(`
                    <div class="custom-rule-item">
                        <span>${rule}</span>
                        <button class="delete-rule" data-index="${index}" aria-label="Delete Rule">Delete</button>
                    </div>
                `);
            });

            $('.delete-rule').off('click').on('click', function() {
                try {
                    const index = $(this).data('index');
                    if (index < 0 || index >= savedRules.length) {
                        throw new Error('Invalid rule index');
                    }
                    savedRules.splice(index, 1);
                    localStorage.setItem('savedRules', JSON.stringify(savedRules));
                    updateSavedRulesList();
                    showNotification('Rule deleted', 'success');
                } catch (error) {
                    showNotification(`Error deleting rule: ${error.message}`, 'error');
                }
            });
        } catch (error) {
            showNotification(`Error updating rules list: ${error.message}`, 'error');
        }
    }

    updateSavedRulesList();

    $('#save-current-rule').click(function() {
        try {
            const rule = $('#custom-rule').val().trim();
            if (!rule) {
                throw new Error('Please enter a rule to save');
            }
            if (savedRules.includes(rule)) {
                showNotification('This rule is already saved', 'warning');
                return;
            }
            savedRules.push(rule);
            localStorage.setItem('savedRules', JSON.stringify(savedRules));
            updateSavedRulesList();
            showNotification('Rule saved', 'success');
        } catch (error) {
            showNotification(`Error saving rule: ${error.message}`, 'error');
        }
    });

    $('#calculate-custom-rule').click(function() {
        try {
            const baseDateStr = $('#rule-base-date').val();
            const rule = $('#custom-rule').val().trim().toLowerCase();

            if (!baseDateStr || !rule) {
                throw new Error('Please enter a base date and rule');
            }

            const baseDate = new Date(baseDateStr);
            if (isNaN(baseDate.getTime())) {
                throw new Error('Invalid base date format');
            }

            const resultDate = applyCustomRule(baseDate, rule);
            $('#custom-rule-value').text(`Rule: "${rule}"\n\nResult: ${resultDate.toLocaleDateString()}`);
            $('#custom-rule-result').show().css({opacity: 0}).animate({opacity: 1}, 300);
            showNotification('Custom rule applied', 'success');
        } catch (error) {
            showNotification(`Error applying rule: ${error.message}`, 'error');
        }
    });

    function applyCustomRule(baseDate, rule) {
        try {
            let resultDate = new Date(baseDate);
            rule = rule.replace(/\s+/g, ' ').trim();

            // Parse relative time (e.g., "2 weeks before", "3 days after")
            const relativeRegex = /^(\d+)\s*(second|minute|hour|day|week|month|year)s?\s*(before|after)$/i;
            const relativeMatch = rule.match(relativeRegex);
            if (relativeMatch) {
                const amount = parseInt(relativeMatch[1]);
                let unit = relativeMatch[2].toLowerCase();
                const direction = relativeMatch[3].toLowerCase();
                const multiplier = direction === 'before' ? -1 : 1;

                if (isNaN(amount) || amount <= 0) {
                    throw new Error('Invalid amount in rule');
                }

                switch(unit) {
                    case 'second':
                        resultDate.setSeconds(resultDate.getSeconds() + multiplier * amount);
                        break;
                    case 'minute':
                        resultDate.setMinutes(resultDate.getMinutes() + multiplier * amount);
                        break;
                    case 'hour':
                        resultDate.setHours(resultDate.getHours() + multiplier * amount);
                        break;
                    case 'day':
                        resultDate.setDate(resultDate.getDate() + multiplier * amount);
                        break;
                    case 'week':
                        resultDate.setDate(resultDate.getDate() + multiplier * amount * 7);
                        break;
                    case 'month':
                        resultDate.setMonth(resultDate.getMonth() + multiplier * amount);
                        break;
                    case 'year':
                        resultDate.setFullYear(resultDate.getFullYear() + multiplier * amount);
                        break;
                    default:
                        throw new Error('Invalid time unit in rule');
                }
                return resultDate;
            }

            // Parse nth weekday of month (e.g., "third Monday of next month")
            const nthWeekdayRegex = /^(first|second|third|fourth|fifth|last)\s*(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\s*(of)?\s*(this|next|last)?\s*month$/i;
            const nthWeekdayMatch = rule.match(nthWeekdayRegex);
            if (nthWeekdayMatch) {
                const position = nthWeekdayMatch[1].toLowerCase();
                const weekdayStr = nthWeekdayMatch[2].toLowerCase();
                const monthAdjust = nthWeekdayMatch[4] ? nthWeekdayMatch[4].toLowerCase() : 'this';

                const weekdays = {
                    monday: 1, tuesday: 2, wednesday: 3, thursday: 4,
                    friday: 5, saturday: 6, sunday: 0
                };
                const weekday = weekdays[weekdayStr];

                if (monthAdjust === 'next') {
                    resultDate.setMonth(resultDate.getMonth() + 1);
                } else if (monthAdjust === 'last') {
                    resultDate.setMonth(resultDate.getMonth() - 1);
                }

                if (position === 'last') {
                    resultDate.setMonth(resultDate.getMonth() + 1);
                    resultDate.setDate(0); // Last day of the month
                    while (resultDate.getDay() !== weekday) {
                        resultDate.setDate(resultDate.getDate() - 1);
                    }
                } else {
                    const n = { first: 1, second: 2, third: 3, fourth: 4, fifth: 5 }[position];
                    resultDate.setDate(1);
                    const firstDay = resultDate.getDay();
                    const offset = (weekday - firstDay + 7) % 7;
                    resultDate.setDate(1 + offset + (n - 1) * 7);
                }

                return resultDate;
            }

            // Parse last day of month
            if (rule === 'last day of month') {
                resultDate.setMonth(resultDate.getMonth() + 1);
                resultDate.setDate(0);
                return resultDate;
            }

            throw new Error('Unsupported rule format. Try "2 weeks before", "third Monday of next month", or "last day of month"');
        } catch (error) {
            throw new Error(`Invalid rule: ${error.message}`);
        }
    }

    // Age Calculator
    $('#calculate-age').click(function() {
        try {
            const birthDateStr = $('#birth-date').val();
            const atDateStr = $('#age-at-date').val();

            if (!birthDateStr || !atDateStr) {
                throw new Error('Please enter valid dates');
            }

            const birthDate = new Date(birthDateStr);
            const atDate = new Date(atDateStr);

            if (isNaN(birthDate.getTime()) || isNaN(atDate.getTime())) {
                throw new Error('Invalid date format');
            }

            if (birthDate > atDate) {
                throw new Error('Birth date must be before the target date');
            }

            let years = atDate.getFullYear() - birthDate.getFullYear();
            let months = atDate.getMonth() - birthDate.getMonth();
            let days = atDate.getDate() - birthDate.getDate();

            if (months < 0 || (months === 0 && days < 0)) {
                years--;
                months += 12;
            }

            if (days < 0) {
                const lastMonth = new Date(atDate.getFullYear(), atDate.getMonth(), 0);
                days = lastMonth.getDate() - birthDate.getDate() + atDate.getDate();
                months--;
            }

            const diffMs = atDate - birthDate;
            const decimalAge = diffMs / (1000 * 60 * 60 * 24 * 365.25);

            $('#age-value').text(`Age: ${years} years, ${months} months, ${days} days\n\nDecimal Age: ${decimalAge.toFixed(2)} years`);
            $('#age-result').show().css({opacity: 0}).animate({opacity: 1}, 300);
            showNotification('Age calculated', 'success');
        } catch (error) {
            showNotification(`Error: ${error.message}`, 'error');
        }
    });

    // Week Number Calculator
    $('#calculate-week-number').click(function() {
        try {
            const dateStr = $('#week-number-date').val();
            const system = $('#week-number-system').val();

            if (!dateStr) {
                throw new Error('Please enter a valid date');
            }

            const date = moment(dateStr);
            if (!date.isValid()) {
                throw new Error('Invalid date format');
            }

            if (!system) {
                throw new Error('Please select a week numbering system');
            }

            let weekNumber;
            let description;

            switch(system) {
                case 'iso':
                    weekNumber = date.isoWeek();
                    description = `ISO 8601 Week Number (Monday-Sunday): ${weekNumber}`;
                    break;
                case 'us':
                    date.startOf('week').add(1, 'day'); // Sunday start
                    weekNumber = date.week();
                    description = `US Week Number (Sunday-Saturday): ${weekNumber}`;
                    break;
                case 'middle-eastern':
                    date.startOf('week').subtract(1, 'day'); // Saturday start
                    weekNumber = date.week();
                    description = `Middle Eastern Week Number (Saturday-Friday): ${weekNumber}`;
                    break;
                default:
                    throw new Error('Invalid week numbering system');
            }

            $('#week-number-value').text(description);
            $('#week-number-result').show().css({opacity: 0}).animate({opacity: 1}, 300);
            showNotification('Week number calculated', 'success');
        } catch (error) {
            showNotification(`Error: ${error.message}`, 'error');
        }
    });

    // Sunrise/Sunset Calculator
    $('#calculate-sun-times').click(function() {
        try {
            const dateStr = $('#sun-date').val();
            const location = $('#sun-location').val().trim();

            if (!dateStr) {
                throw new Error('Please enter a valid date');
            }

            if (!location) {
                throw new Error('Please enter a valid location');
            }

            // Validate location as "lat,lng"
            const [lat, lng] = location.split(',').map(coord => parseFloat(coord.trim()));
            if (isNaN(lat) || isNaN(lng)) {
                throw new Error('Invalid location format. Use "latitude,longitude" (e.g., 40.7128,-74.0060)');
            }
            if (lat < -90 || lat > 90) {
                throw new Error('Latitude must be between -90 and 90');
            }
            if (lng < -180 || lng > 180) {
                throw new Error('Longitude must be between -180 and 180');
            }

            const apiUrl = `https://api.sunrisesunset.io/json?lat=${lat}&lng=${lng}&date=${dateStr}&time_format=24`;

            fetch(apiUrl)
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`Network error: ${response.status} ${response.statusText}`);
                    }
                    return response.json();
                })
                .then(data => {
                    try {
                        if (data.status !== 'OK') {
                            throw new Error(`API error: ${data.status || 'Unknown error'}`);
                        }

                        const results = data.results;
                        let output = `Sunrise/Sunset for ${dateStr} at (${lat}, ${lng}):\n\n`;
                        
                        // Handle null values for polar regions
                        output += `Sunrise: ${results.sunrise || 'N/A (Polar region)'}\n`;
                        output += `Sunset: ${results.sunset || 'N/A (Polar region)'}\n`;
                        output += `Solar Noon: ${results.solar_noon || 'N/A'}\n`;
                        output += `Day Length: ${results.day_length || 'N/A'}\n`;
                        output += `Dawn (Civil Twilight Begin): ${results.dawn || 'N/A'}\n`;
                        output += `Dusk (Civil Twilight End): ${results.dusk || 'N/A'}\n`;
                        output += `First Light: ${results.first_light || 'N/A'}\n`;
                        output += `Last Light: ${results.last_light || 'N/A'}\n`;
                        output += `Timezone: ${results.timezone || 'N/A'}\n`;
                        output += `UTC Offset: ${results.utc_offset / 60} hours`;

                        $('#sun-times-value').text(output);
                        $('#sun-times-result').show().css({opacity: 0}).animate({opacity: 1}, 300);
                        showNotification('Sunrise/sunset data retrieved', 'success');
                    } catch (error) {
                        throw new Error(`Error processing API response: ${error.message}`);
                    }
                })
                .catch(error => {
                    showNotification(`Error fetching sunrise/sunset data: ${error.message}`, 'error');
                    $('#sun-times-value').text('Unable to retrieve sunrise/sunset data.');
                    $('#sun-times-result').show().css({opacity: 0}).animate({opacity: 1}, 300);
                });
        } catch (error) {
            showNotification(`Error: ${error.message}`, 'error');
        }
    });

    // Time Between Events
    $('#add-event-time').click(function() {
        try {
            if ($('.event-time-group').length >= 10) {
                throw new Error('Maximum 10 events allowed');
            }

            $('#event-times-container').append(`
                <div class="form-group event-time-group">
                    <label>Event ${$('.event-time-group').length + 1}</label>
                    <input type="datetime-local" class="form-control event-time" required>
                </div>
            `);
            showNotification('Event added', 'success');
        } catch (error) {
            showNotification(`Error adding event: ${error.message}`, 'error');
        }
    });

    $('#calculate-event-times').click(function() {
        try {
            const events = $('.event-time').map(function() {
                return new Date($(this).val());
            }).get();

            if (events.length < 2) {
                throw new Error('Please enter at least two events');
            }

            if (events.some(d => isNaN(d.getTime()))) {
                throw new Error('Please enter valid dates for all events');
            }

            events.sort((a, b) => a - b);
            let result = '';
            for (let i = 0; i < events.length - 1; i++) {
                const diffMs = events[i + 1] - events[i];
                const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
                const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);

                result += `Between Event ${i + 1} (${events[i].toLocaleString()}) and Event ${i + 2} (${events[i + 1].toLocaleString()}):\n`;
                result += `${days} days, ${hours} hours, ${minutes} minutes, ${seconds} seconds\n\n`;
            }

            $('#event-times-value').text(result);
            $('#event-times-result').show().css({opacity: 0}).animate({opacity: 1}, 300);
            showNotification('Time between events calculated', 'success');
        } catch (error) {
            showNotification(`Error: ${error.message}`, 'error');
        }
    });

    // Cleanup on page unload
    $(window).on('unload', function() {
        try {
            if (countdownInterval) {
                clearInterval(countdownInterval);
                countdownInterval = null;
            }
        } catch (error) {
            console.error(`Error during cleanup: ${error.message}`);
        }
    });
});