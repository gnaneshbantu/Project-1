"use strict";

$(document).ready(function() {
    displayEnrolledSubjects($("#select-subject"), requestEnrolledSubjects(getAccessToken().token));
    loadFromParam();
    $("select").formSelect();
});

function loadFromParam() {
    let search = new URLSearchParams(window.location.search);
    search.has("subject-id") ? displayAttendance(search.get("subject-id")) : false;
}

$("#select-subject").change(function() {
    let code = $(this).val();
    displayAttendance(code);
});

function displayAttendance(code) {
    displayInfoMessages("#info-area", "Loading..." + getSpinner("sync", "right-align"), "text-warning");

    requestAttendance(code, getAccessToken().token).then((request) => {
        request.json().then((response) => {
            checkResponse(response);
            if (!response.error) {
                displayInfoMessages("#info-area", response.message, "text-success");

                let attendanceData = response.data;
                $("#subject-details").html(`${attendanceData.subject_name}, ${attendanceData.subject_id}`);
                $("#start-date").html(attendanceData.start_date);
                $("#end-date").html(attendanceData.end_date);
                $("#total").html(attendanceData.attendance.total);
                $("#working").html(attendanceData.attendance.working);
                $("#present").html(attendanceData.attendance.present);
                $("#absent").html(attendanceData.attendance.absent);
                $("#holidays").html(attendanceData.holidays.length);
                $("#weekly-offs").html(attendanceData.offdates.length);
                $("#percent-present").html((attendanceData.attendance.present / attendanceData.attendance.working).toFixed(2) * 100);

                let percentPresent = (attendanceData.attendance.present / attendanceData.attendance.total).toFixed(2) * 100;
                let percentAbsent = (attendanceData.attendance.absent / attendanceData.attendance.total).toFixed(2) * 100;
                let percentHolidays = 100 - percentAbsent - percentPresent;

                let progressBar = "";
                progressBar += `<div class="progress-bar bg-success progress-bar-striped" style="width: ${
                    percentPresent}%"></div>`;
                progressBar += `<div class="progress-bar bg-danger progress-bar-striped" style="width: ${
                    percentAbsent}%"></div>`;
                progressBar += `<div class="progress-bar bg-warning progress-bar-striped" style="width: ${
                    percentHolidays}%"></div>`;
                $("#attendance-bar").html(progressBar);
            } else {
                showToast(response.message, "red", "close");
                displayInfoMessages("#info-area", response.message, "text-danger");
            }
        }).catch((error) => {
            request.status == 404 ? showToast("Request Error!", "red", "cancel")
                : responseParseError(error);
        });
    }).catch(() => { showToast("Server Error!", "red", "wifi_off") });
}
