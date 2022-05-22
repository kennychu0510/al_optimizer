/* FORM SET UP */
const form = document.querySelector("form");
form.reset();
const start = document.querySelector("#start");
const end = document.querySelector("#end");

/* INITIAL STATE */
start.value = moment().format("YYYY-MM-DD");
start.min = moment().format("YYYY-MM-DD");
end.value = moment().format("YYYY-MM-DD");
end.min = moment().format("YYYY-MM-DD");

const leaves = document.querySelector("#leavesCount");
leaves.addEventListener("change", () => {
    const newEndDateMin = moment(start.value).add(leaves.value, "days").format("YYYY-MM-DD");
    end.min = newEndDateMin;
    if (moment(end.value).isBefore(end.min)) {
        end.value = newEndDateMin;
    }
});

const startInput = document.querySelector("#start");
startInput.addEventListener("change", () => {
    if (moment(end.value).isBefore(moment(start.value))) {
        end.value = moment(start.value).add(leaves.value, "days").format("YYYY-MM-DD");
    }
});

/* CALCULATE TODAY's DATe */
document.querySelector("#today").textContent = moment().format("MMMM Do YYYY");

/* CALCULATE LEAP YEAR */
function isLeapYear(year) {
    return year % 100 === 0 ? year % 400 === 0 : year % 4 === 0;
}

const HOLIDAYS = [];
let holidaysDataStart;
let holidaysDataEnd;

/* HK HOLIDAYS 
https://data.gov.hk/en-data/dataset/hk-effo-statistic-cal
*/
fetch("hk_holidays.json")
    .then((res) => res.json())
    .catch((err) => console.log({ Error: String(err) }))
    .then((json) => {
        const holidays = json.vcalendar[0].vevent.map((obj) => {
            if (moment(obj.dtstart[0]).isBefore(moment())) {
                return;
            }
            // const holiday = {
            //     date: obj.dtstart[0],
            //     summary: obj.summary
            // }
            HOLIDAYS.push(obj.dtstart[0]);
        });
        holidaysDataStart = HOLIDAYS[0];
        holidaysDataEnd = HOLIDAYS[HOLIDAYS.length - 1];
        // console.log(HOLIDAYS)
        // console.log(holidayStart);
        // console.log(holidayEnd);
        // console.log(holidaysDataEnd)
        end.max = moment(holidaysDataEnd).format("YYYY-MM-DD");
        document.querySelector("#remarks").textContent = `Only supports up to ${formatDate(moment(holidaysDataEnd))}`;
    });

/* FORM SUBMISSION */
form.addEventListener("submit", (e) => {
    e.preventDefault();
    const leaves = form.leavesCount.value;
    if (!leaves) {
        return
    }
    document.querySelector("#output .bold").classList.remove("hidden");
    document.querySelector("#max-holidays").innerHTML = "";
    document.querySelector("#holiday-options").innerHTML = "";
    let startDate = moment(form.start.value);
    const endDate = moment(form.end.value).add(1, "days");
    // console.log(leaves)
    let bestHolidayStart = moment(form.start.value);
    let maxHolidaysCount = 0;
    const results = [];
    for (startDate; moment(startDate).isBefore(endDate); startDate = moment(startDate).add(1, "days")) {
        // console.log(`start holiday on ${formatDate(startDate)}`);
        let holidayCount = 0;
        let currentDate = moment(startDate);
        for (let i = 0; i < leaves; i++) {
            holidayCount++;
            // console.log(currentDate.format("YYYYMMDD"));
            if (HOLIDAYS.includes(currentDate.format("YYYYMMDD")) || moment(currentDate).day() === 0 || moment(currentDate).day() === 6) {
                // console.log("holiday/weekend");
                i--;
            }
            currentDate = moment(currentDate).add(1, "days");
        }

        /* When currentDate is a weekend */
        while (moment(currentDate).day() === 0 || moment(currentDate).day() === 6) {
            holidayCount++;
            currentDate = moment(currentDate).add(1, "days");
        }

        holidayCount--;
        // console.log(`resume work on ${formatDate(currentDate)}`);
        // console.log(`total holiday count: ${holidayCount}`);
        if (holidayCount > maxHolidaysCount) {
            maxHolidaysCount = holidayCount;
            bestHolidayStart = formatDate(currentDate);
        }
        results.push({
            start: formatDate(startDate),
            end: formatDate(currentDate),
            holidays: holidayCount,
        });
    }

    document.querySelector("#max-holidays").textContent = maxHolidaysCount;
    const bestDates = results.filter((result) => result.holidays === maxHolidaysCount);
    // console.log(bestDates);
    for (let i = 0; i < bestDates.length; i++) {
        const option = document.createElement("div");
        option.classList.add("holiday-option");
        const optionCount = document.createElement("div");
        optionCount.classList.add("bold");
        optionCount.textContent = `Option ${i + 1}`;
        option.appendChild(optionCount)
        const startHoliday = document.createElement("div");
        startHoliday.classList.add("holiday-start");
        startHoliday.textContent = bestDates[i].start;
        const endHoliday = document.createElement("div");
        endHoliday.classList.add("holiday-end");
        endHoliday.textContent = bestDates[i].end;
        option.appendChild(startHoliday);
        option.appendChild(endHoliday);
        document.querySelector('#holiday-options').appendChild(option);
    }
});

function formatDate(momentDate) {
    return momentDate.format("MMM Do YYYY");
}
