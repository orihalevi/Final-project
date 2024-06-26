const meetDr = document.getElementById("meet-dr");
const doctorName = document.getElementById("doctor-name");
const doctorPicture = document.getElementById("doctor-picture");
const doctorSpecialzation = document.getElementById("doctor-specialization");
const doctorExperience = document.getElementById("doctor-experience");
const doctorLanguages = document.getElementById("doctor-languages");
const MonFriWorkingHours = document.getElementById("mon-fri-working-hours");
const saturdayWorkingHours = document.getElementById("saturday-working-hours");
const doctorSpecialization = document.getElementById("doctor-specialization");
const doctorLocation = document.getElementById("doctor-location");
const doctorEducation1 = document.getElementById("doctor-education-1");
const doctorEducation2 = document.getElementById("doctor-education-2");
const submitBtn = document.getElementById("submit-btn");
const appointmentDate = document.getElementsByClassName("appointment-date")
const appointmentTime = document.getElementsByClassName("appointment-time")

// this function get prams from the url
function getQueryParams() {
  const params = {};
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  for (const [key, value] of urlParams) {
    params[key] = value;
    // console.log("key: " + key + " value: " + value);
  }
  return params;
}

// this function will be called when the page is loaded
document.addEventListener("DOMContentLoaded", function () {
  const params = getQueryParams();
  const contentDiv = document.getElementById("content");
  if (params.doctorId) {
    // console.log("Page been addressed");
    revealDoctorInfo(params.doctorId);
  } else {
    // console.log("Page not addressed");
  }
});

// this function will get all the doctor info from the server
async function fetchDoctorInfo(doctorId) {
  try {
    const response = await fetch(
      "http://localhost:8080/api/getDoctorInfoById",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ doctorId }),
      }
    );

    if (!response.ok) {
      throw new Error("Network response was not ok");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Fetch failed:", error);
  }
}

// this function will reveal all the doctor info on the page
async function revealDoctorInfo(doctorId) {
  const doctorInfo = await fetchDoctorInfo(doctorId);
  // reveal MEET DR.
  meetDr.innerHTML = `MEET ${doctorInfo.full_name}`;
  // reveal doctor name
  doctorName.innerHTML = doctorInfo.full_name;
  // reveal doctor picture
  doctorPicture.src = doctorInfo.image;
  // reveal doctor specializations
  doctorSpecialization.innerHTML =
    " <strong>" + "Specialization: " + "</strong>";
  doctorInfo.specialty.forEach((specialty) => {
    doctorSpecialization.innerHTML += " " + specialty + ",";
  });
  // reveal doctor languages
  doctorLanguages.innerHTML = " <strong>" + "Languages: " + "</strong>";
  doctorInfo.additional_details.languages.forEach((language) => {
    doctorLanguages.innerHTML += " " + language + ",";
  });
  // reveal doctor experience
  doctorExperience.innerHTML = " <strong>" + "Experience: " + "</strong>";
  doctorExperience.innerHTML += doctorInfo.additional_details.experience;
  // reveal doctor working hours
  MonFriWorkingHours.innerHTML =
    " <strong>" + "Monday - Friday: " + "</strong>";
  MonFriWorkingHours.innerHTML += `${doctorInfo.working_hours.Monday_Friday.from} - ${doctorInfo.working_hours.Monday_Friday.to}`;

  saturdayWorkingHours.innerHTML =
    " <strong>" + "Saturday Working Hours: " + "</strong>";
  saturdayWorkingHours.innerHTML += `${doctorInfo.working_hours.Saturday.from} - ${doctorInfo.working_hours.Saturday.to}`;
  // reveal doctor location
  doctorLocation.innerHTML = "";
  doctorLocation.innerHTML = `
  <h2>Our Location</h2>
  <p>${doctorInfo.contact_information.address.street}</p>
  <p>${doctorInfo.contact_information.address.city}</p>
  <p><strong>Phone:</strong> ${doctorInfo.contact_information.phone}</p>
  <p><strong>Email:</strong> ${doctorInfo.contact_information.email}</p>
`;
  // reveal doctor education
  doctorEducation1.innerHTML = `
<strong>degree: </strong> ${doctorInfo.additional_details.education[0].degree} <br>
<strong>university: </strong>${doctorInfo.additional_details.education[0].university} <br>
<strong>year: </strong>${doctorInfo.additional_details.education[0].year}
`;
  doctorEducation2.innerHTML = `
   <strong>degree: </strong> ${doctorInfo.additional_details.education[1].degree} <br>
  <strong>university: </strong>${doctorInfo.additional_details.education[1].university} <br>
  <strong>year: </strong>${doctorInfo.additional_details.education[1].year}
`;
}

function getAppointmentTimeFromUserInput() {
  const date = document.getElementById("appointment-date").value; // מצפה לפורמט YYYY-MM-DD
  const time = document.getElementById("appointment-time").value; // מצפה לפורמט כמו "9:00 AM"
  console.log(date);
  console.log(time);

  const [timePart, modifier] = String(time).split(" ");
  let [hours, minutes] = timePart.split(":");
  
  if (modifier === 'PM' && hours !== '12') {
    hours = parseInt(hours, 10) + 12;
  } else if (modifier === 'AM' && hours === '12') {
    hours = '00';
  }

  const dateTimeString = `${date}T${hours}:${minutes}:00`;
  console.log(dateTimeString);
  const dateTime = new Date(dateTimeString);
  console.log(dateTime);

  if (isNaN(dateTime)) {
    console.error("Invalid date format");
  }

  return dateTime;
}

async function sendAppointmentData() {
  try {
    const date = getAppointmentTimeFromUserInput();
    const patientId = await getPageUserId();
    const doctorId = await getPageDoctorId();

    const data = {
      date,
      doctorId,
      patientId,
    };
    console.log(data);
    const response = await fetch(
      "http://localhost:8080/api/updateAppointments",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      }
    );
    const result = await response.json();
    console.log("Success:", result);
  } catch (error) {
    console.error("Error:", error);
  }
}
async function getPageDoctorId() {
  const params = getQueryParams();
  if (!(params.doctorId === null)) {
    return params.doctorId;
  } else {
    console.error("Doctor ID not found in URL parameters");
    return null;
  }
}

async function getPageUserId() {
  const params = await getQueryParams();
  if (!(params.userId === null)) {
    return params.userId;
  } else {
    console.error("User ID not found in URL parameters");
    return null;
  }
}

// alert the submit if not login
// by Elkana
submitBtn.addEventListener("click", async function (event) {
  event.preventDefault();
  const userIdHolder = await getPageUserId()
  if (userIdHolder === "null" || userIdHolder === "undefined") {
    submitBtn.disabled = true;
    window.confirm("you have to login befor update a meeting, do you want to?");
    showSuccessPopup2();
    setTimeout(() => {
      window.location.href = "../PageLogin/index.html"
    }, 1500);
  } else {
    sendAppointmentData();
    showSuccessPopup();
  }
});



// פונקציה להצגת חלון הפופאפ
function showSuccessPopup() {
  const popup = document.getElementById("successPopup");
  popup.style.display = "block";

  // הסתרת הפופאפ אחרי 3 שניות
  setTimeout(() => {
    popup.style.display = "none";
  }, 3000);
}

function showSuccessPopup2() {
  const popup = document.getElementById("successPopup2");
  popup.style.display = "block";

  // הסתרת הפופאפ אחרי 3 שניות
  setTimeout(() => {
    popup.style.display = "none";
  }, 1000);
}
