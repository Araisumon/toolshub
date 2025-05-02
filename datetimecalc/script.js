$(document).ready(function() {
    // Set current date/time as default values
    const now = new Date();
    const nowStr = now.toISOString().slice(0, 16);
    $('input[type="datetime-local"]').val(nowStr);
    $('input[type="date"]').val(now.toISOString().slice(0, 10));

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
        const currentTheme = body.attr('data-theme') || 'light';
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        body.attr('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateThemeIcon(newTheme);
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
        }

        const dateStr = date.toISOString().slice(0, 10);
        const datetimeStr = date.toISOString().slice(0, 16);

        $('input[type="date"]').val(dateStr);
        $('input[type="datetime-local"]').val(datetimeStr);

        showNotification(`Date set to ${action.replace('-', ' ')}`, 'success');
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

        if (!text) {
            showNotification('Nothing to copy', 'warning');
            return;
        }

        if (navigator.clipboard) {
            navigator.clipboard.writeText(text).then(() => {
                showNotification('Copied to clipboard', 'success');
            }).catch(() => {
                showNotification('Failed to copy', 'error');
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
    });

    // Share functionality
    let currentResult = '';
    $('.btn-share').click(function() {
        currentResult = $(`#${$(this).data('result')}-value`).text().trim();
        $('.share-modal').addClass('active');
        $('#share-message').val('');
    });

    $('.share-modal-close').click(function() {
        $('.share-modal').removeClass('active');
    });

    $('.share-btn').click(function() {
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
                        showNotification('Failed to copy link', 'error');
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
        }

        window.open(shareUrl, '_blank');
        $('.share-modal').removeClass('active');
    });

    // Guided tour
    $('#start-tour').click(function() {
        $('.tour-overlay').show();
        showTourStep(1);
    });

    $('.tour-close, .tour-skip, .tour-finish').click(function() {
        $('.tour-overlay').hide();
        $(`.tour-step`).hide();
    });

    $('.tour-next').click(function() {
        const currentStep = parseInt($('.tour-step:visible').attr('id').split('-')[2]);
        showTourStep(currentStep + 1);
    });

    $('.tour-prev').click(function() {
        const currentStep = parseInt($('.tour-step:visible').attr('id').split('-')[2]);
        showTourStep(currentStep - 1);
    });

    function showTourStep(step) {
        $(`.tour-step`).hide();
        $(`#tour-step-${step}`).show();
    }

    // Date Difference Calculator
    $('#calculate-difference').click(function() {
        const startDate = new Date($('#start-date').val());
        const endDate = new Date($('#end-date').val());
        const includeTime = $('#include-time').is(':checked');

        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
            showNotification('Please enter valid dates', 'error');
            return;
        }

        if (startDate > endDate) {
            showNotification('Start date must be before end date', 'error');
            return;
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
    });

    // Add/Subtract Time Calculator
    $('#calculate-time-operation').click(function() {
        const baseDate = new Date($('#base-date').val());
        const amount = parseInt($('#time-amount').val());
        const unit = $('#time-unit').val();
        const operation = $('input[name="operation"]:checked').val();

        if (isNaN(baseDate.getTime())) {
            showNotification('Please enter a valid base date', 'error');
            return;
        }

        if (isNaN(amount) || amount <= 0) {
            showNotification('Please enter a valid positive amount', 'error');
            return;
        }

        const resultDate = new Date(baseDate);

        try {
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
        } catch (error) {
            showNotification(`Error: ${error.message}`, 'error');
        }
    });

    function isLeapYear(year) {
        return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
    }

    // Timezone Converter
    $('#convert-timezone').click(function() {
        const dateTimeStr = $('#convert-date').val();
        const fromTimezone = $('#from-timezone').val();
        const toTimezone = $('#to-timezone').val();

        if (!dateTimeStr) {
            showNotification('Please enter a valid date and time', 'error');
            return;
        }

        if (fromTimezone === toTimezone) {
            showNotification('Timezones are the same - no conversion needed', 'warning');
            return;
        }

        try {
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
        } catch (error) {
            showNotification(`Timezone conversion failed: ${error.message}`, 'error');
        }
    });

    // Business Days Calculator
    $('#calculate-business-days').click(function() {
        const startDate = new Date($('#business-start-date').val());
        const endDate = new Date($('#business-end-date').val());
        const excludeWeekends = $('#exclude-weekends').is(':checked');
        const holidaysRegion = $('#holidays-region').val();

        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
            showNotification('Please enter valid dates', 'error');
            return;
        }

        if (startDate > endDate) {
            showNotification('Start date must be before end date', 'error');
            return;
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
    });

    function getHolidaysForRegion(region, startYear, endYear) {
        const holidays = [];
        for (let year = startYear; year <= endYear; year++) {
            switch(region) {
                case 'US':
                    holidays.push(
                        { name: `New Year's Day ${year}`, date: `${year}-01-01` },
                        { name: `Martin Luther King Jr. Day ${year}`, date: getNthWeekday(year, 1, 1, 3) }, // 3rd Monday
                        { name: `Memorial Day ${year}`, date: getLastWeekday(year, 5, 1) }, // Last Monday
                        { name: `Independence Day ${year}`, date: `${year}-07-04` },
                        { name: `Labor Day ${year}`, date: getNthWeekday(year, 9, 1, 1) }, // 1st Monday
                        { name: `Thanksgiving ${year}`, date: getNthWeekday(year, 11, 4, 4) }, // 4th Thursday
                        { name: `Christmas ${year}`, date: `${year}-12-25` }
                    );
                    break;
                case 'UK':
                    holidays.push(
                        { name: `New Year's Day ${year}`, date: `${year}-01-01` },
                        { name: `Good Friday ${year}`, date: getEasterSunday(year, -2) },
                        { name: `Easter Monday ${year}`, date: getEasterSunday(year, 1) },
                        { name: `Early May Bank Holiday ${year}`, date: getNthWeekday(year, 5, 1, 1) }, // 1st Monday
                        { name: `Christmas ${year}`, date: `${year}-12-25` },
                        { name: `Boxing Day ${year}`, date: `${year}-12-26` }
                    );
                    break;
                case 'CA':
                    holidays.push(
                        { name: `New Year's Day ${year}`, date: `${year}-01-01` },
                        { name: `Canada Day ${year}`, date: `${year}-07-01` },
                        { name: `Labour Day ${year}`, date: getNthWeekday(year, 9, 1, 1) }, // 1st Monday
                        { name: `Thanksgiving ${year}`, date: getNthWeekday(year, 10, 1, 2) }, // 2nd Monday
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
            }
        }
        return holidays;
    }

    function getNthWeekday(year, month, weekday, n) {
        const date = new Date(year, month - 1, 1);
        const firstDay = date.getDay();
        const offset = (weekday - firstDay + 7) % 7;
        date.setDate(1 + offset + (n - 1) * 7);
        return date.toISOString().slice(0, 10);
    }

    function getLastWeekday(year, month, weekday) {
        const date = new Date(year, month, 0);
        while (date.getDay() !== weekday) {
            date.setDate(date.getDate() - 1);
        }
        return date.toISOString().slice(0, 10);
    }

    function getEasterSunday(year, offset = 0) {
        // Meeus/Jones/Butcher algorithm for Easter Sunday
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
    }

    // Countdown Timer
    let countdownInterval = null;
    $('#start-countdown').click(function() {
        const targetDateStr = $('#countdown-date').val();
        const eventTitle = $('#countdown-title').val().trim() || 'Countdown';

        if (!targetDateStr) {
            showNotification('Please enter a valid target date', 'error');
            return;
        }

        const targetDate = new Date(targetDateStr);
        if (isNaN(targetDate.getTime())) {
            showNotification('Invalid target date', 'error');
            return;
        }

        if (countdownInterval) {
            clearInterval(countdownInterval);
        }

        $('#countdown-event-title').text(eventTitle);
        $('#countdown-result').show().css({opacity: 0}).animate({opacity: 1}, 300);

        function updateCountdown() {
            const now = new Date();
            const diffMs = targetDate - now;

            if (diffMs <= 0) {
                clearInterval(countdownInterval);
                $('#countdown-value').text('Event has passed!');
                return;
            }

            const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);

            $('#countdown-value').text(`${days}d ${hours}h ${minutes}m ${seconds}s`);
        }

        updateCountdown();
        countdownInterval = setInterval(updateCountdown, 1000);
    });

    // Custom Date Rules
    let savedRules = [];
    function updateSavedRulesList() {
        try {
            savedRules = JSON.parse(localStorage.getItem('savedRules')) || [];
        } catch (e) {
            savedRules = [];
        }

        $('#saved-rules-container').empty();
        savedRules.forEach((rule, index) => {
            $('#saved-rules-container').append(`
                <div class="custom-rule-item">
                    <span>${rule}</span>
                    <button class="delete-rule" data-index="${index}">Delete</button>
                </div>
            `);
        });

        $('.delete-rule').off('click').on('click', function() {
            const index = $(this).data('index');
            savedRules.splice(index, 1);
            localStorage.setItem('savedRules', JSON.stringify(savedRules));
            updateSavedRulesList();
            showNotification('Rule deleted', 'success');
        });
    }

    updateSavedRulesList();

    $('#save-current-rule').click(function() {
        const rule = $('#custom-rule').val().trim();
        if (!rule) {
            showNotification('Please enter a rule to save', 'error');
            return;
        }
        if (!savedRules.includes(rule)) {
            savedRules.push(rule);
            localStorage.setItem('savedRules', JSON.stringify(savedRules));
            updateSavedRulesList();
            showNotification('Rule saved', 'success');
        } else {
            showNotification('This rule is already saved', 'warning');
        }
    });

    $('#calculate-custom-rule').click(function() {
        const baseDateStr = $('#rule-base-date').val();
        const rule = $('#custom-rule').val().trim().toLowerCase();

        if (!baseDateStr || !rule) {
            showNotification('Please enter a base date and rule', 'error');
            return;
        }

        const baseDate = new Date(baseDateStr);
        if (isNaN(baseDate.getTime())) {
            showNotification('Invalid base date', 'error');
            return;
        }

        try {
            const resultDate = applyCustomRule(baseDate, rule);
            $('#custom-rule-value').text(`Rule: "${rule}"\n\nResult: ${resultDate.toLocaleDateString()}`);
            $('#custom-rule-result').show().css({opacity: 0}).animate({opacity: 1}, 300);
        } catch (error) {
            showNotification(`Invalid rule: ${error.message}`, 'error');
        }
    });

    function applyCustomRule(baseDate, rule) {
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
                    throw new Error('Invalid time unit');
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
    }

    // Age Calculator
    $('#calculate-age').click(function() {
        const birthDate = new Date($('#birth-date').val());
        const atDate = new Date($('#age-at-date').val());

        if (isNaN(birthDate.getTime()) || isNaN(atDate.getTime())) {
            showNotification('Please enter valid dates', 'error');
            return;
        }

        if (birthDate > atDate) {
            showNotification('Birth date must be before the target date', 'error');
            return;
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
    });

    // Week Number Calculator
    $('#calculate-week-number').click(function() {
        const dateStr = $('#week-number-date').val();
        const system = $('#week-number-system').val();

        if (!dateStr) {
            showNotification('Please enter a valid date', 'error');
            return;
        }

        const date = moment(dateStr);
        if (!date.isValid()) {
            showNotification('Invalid date', 'error');
            return;
        }

        let weekNumber;
        let description;

        switch(system) {
            case 'iso':
                weekNumber = date.isoWeek();
                description = `ISO 8601 Week Number (Monday start): ${weekNumber}`;
                break;
            case 'us':
                date.startOf('week').add(1, 'day'); // Sunday start
                weekNumber = date.week();
                description = `US Week Number (Sunday start): ${weekNumber}`;
                break;
            case 'middle-eastern':
                date.startOf('week').subtract(1, 'day'); // Saturday start
                weekNumber = date.week();
                description = `Middle Eastern Week Number (Saturday start): ${weekNumber}`;
                break;
        }

        $('#week-number-value').text(description);
        $('#week-number-result').show().css({opacity: 0}).animate({opacity: 1}, 300);
    });

    // Sunrise/Sunset Calculator
    $('#calculate-sun-times').click(function() {
        const dateStr = $('#sun-date').val();
        const location = $('#sun-location').val().trim();

        if (!dateStr || !location) {
            showNotification('Please enter a valid date and location', 'error');
            return;
        }

        // Placeholder: Requires external API (e.g., Sunrise-Sunset.org)
        showNotification('Sunrise/Sunset calculation requires an external API. Please integrate with a service like Sunrise-Sunset.org.', 'warning');
        $('#sun-times-value').text('Sunrise/Sunset data unavailable without API integration.');
        $('#sun-times-result').show().css({opacity: 0}).animate({opacity: 1}, 300);
    });

    // Time Between Events
    $('#add-event-time').click(function() {
        if ($('.event-time-group').length >= 10) {
            showNotification('Maximum 10 events allowed', 'warning');
            return;
        }

        $('#event-times-container').append(`
            <div class="form-group event-time-group">
                <label>Event ${$('.event-time-group').length + 1}</label>
                <input type="datetime-local" class="form-control event-time" required>
            </div>
        `);
    });

    $('#calculate-event-times').click(function() {
        const events = $('.event-time').map(function() {
            return new Date($(this).val());
        }).get();

        if (events.length < 2) {
            showNotification('Please enter at least two events', 'error');
            return;
        }

        if (events.some(d => isNaN(d.getTime()))) {
            showNotification('Please enter valid dates for all events', 'error');
            return;
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
    });

    // Cleanup on page unload
    $(window).on('unload', function() {
        if (countdownInterval) {
            clearInterval(countdownInterval);
        }
    });
});