import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Box,
} from "@mui/material";

const AvailabilityTable = () => {
  const [appointments, setAppointments] = useState([]);
  const [availabilityData, setAvailabilityData] = useState([]);

  useEffect(() => {
    fetch(
      "http://appointment.us-west-2.elasticbeanstalk.com/appointments/getall"
    )
      .then((response) => response.json())
      .then((data) => setAppointments(data))
      .catch((error) => console.log(error));

    fetch(
      "http://avalaibiliyapp-env.eba-mf43a3nx.us-west-2.elasticbeanstalk.com/availability/all"
    )
      .then((response) => response.json())
      .then((data) => setAvailabilityData(data))
      .catch((error) => console.log(error));
  }, []);

  const getAvailabilityDate = (availabilityId) => {
    const availability = availabilityData.find(
      (item) => item.id === availabilityId
    );
    return availability ? availability.date : "";
  };

  const getPendingStatus = (date) => {
    const currentDate = new Date().toISOString().split("T")[0];
    const rowDate = new Date(date).toISOString().split("T")[0];

    if (rowDate < currentDate) {
      return "Past";
    } else if (rowDate === currentDate) {
      return "Today";
    } else {
      return "Future";
    }
  };

  const handleAccept = (appointmentId) => {
    const updatedAppointments = appointments.map((appointment) => {
      if (appointment.id === appointmentId) {
        return {
          ...appointment,
          confirmed: true,
        };
      }
      return appointment;
    });
    setAppointments(updatedAppointments);
    // Send the updated appointment to the API
    fetch(
      `http://appointment.us-west-2.elasticbeanstalk.com/appointments/update`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(
          updatedAppointments.find(
            (appointment) => appointment.id === appointmentId
          )
        ),
      }
    )
      .then((response) => response.json())
      .then((data) => {
        // Handle success response
        console.log(`Appointment with ID ${appointmentId} has been accepted.`);
        // Update the appointments state with the updated data from the server
      })
      .catch((error) => {
        // Handle error
        console.log(
          `Error accepting appointment with ID ${appointmentId}:`,
          error
        );
      });
  };

  const handleDecline = (appointmentId) => {
    // Update the appointments state by removing the declined appointment
    const updatedAppointments = appointments.filter(
      (appointment) => appointment.id !== appointmentId
    );
    setAppointments(updatedAppointments);

    // Send a request to delete the appointment
    fetch(
      `http://appointment.us-west-2.elasticbeanstalk.com/appointments/delete/${appointmentId}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: appointmentId }),
      }
    )
      .then((response) => response.json())
      .then((data) => {
        // Handle success response
        console.log(`Appointment with ID ${appointmentId} has been declined.`);
      })
      .catch((error) => {
        // Handle error
        console.log(
          `Error declining appointment with ID ${appointmentId}:`,
          error
        );
      });
  };

  const handleDone = (appointmentId) => {
    // Handle done logic here
    console.log(`Appointment with ID: ${appointmentId} is done`);
  };

  const filteredAppointments = appointments.filter((appointment) => {
    const matchingAvailability = availabilityData.find(
      (item) => item.id === appointment.availability_id
    );
    return matchingAvailability !== undefined;
  });

  const sortedAppointments = filteredAppointments.sort((a, b) => {
    const dateA = getAvailabilityDate(a.availability_id);
    const dateB = getAvailabilityDate(b.availability_id);
    return new Date(dateB) - new Date(dateA);
  });

  const formatDateTime = (date) => {
    const dateTime = new Date(date);
    const options = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: "UTC",
    };
    return dateTime.toLocaleString("en-US", options);
  };

  return (
    <Box sx={{ overflowX: "auto" }}>
      <TableContainer
        component={Paper}
        sx={{ boxShadow: "0px 2px 10px rgba(0, 0, 0, 0.1)" }}
      >
        <Box sx={{ minWidth: 650, overflowX: "auto" }}>
          <Table sx={{ minWidth: 650 }}>
            <TableHead sx={{ backgroundColor: "#f5f5f5" }}>
              <TableRow>
                <TableCell
                  sx={{
                    backgroundColor: "#a0d4d4",
                    color: "#000000",
                    fontWeight: "600",
                    borderBottom: "0px solid #ffffff",
                    textAlign: "center",
                  }}
                >
                  Availability ID
                </TableCell>
                <TableCell
                  sx={{
                    backgroundColor: "#a0d4d4",
                    color: "#000000",
                    fontWeight: "600",
                    borderBottom: "0px solid #ffffff",
                    textAlign: "center",
                  }}
                >
                  Availability Date
                </TableCell>
                <TableCell
                  sx={{
                    backgroundColor: "#a0d4d4",
                    color: "#000000",
                    fontWeight: "600",
                    borderBottom: "0px solid #ffffff",
                    textAlign: "center",
                  }}
                >
                  Pending Status
                </TableCell>
                <TableCell
                  sx={{
                    backgroundColor: "#a0d4d4",
                    color: "#000000",
                    fontWeight: "600",
                    borderBottom: "0px solid #ffffff",
                    textAlign: "center",
                  }}
                >
                  Confirmation
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sortedAppointments.map((appointment) => (
                <TableRow
                  key={appointment.id}
                  sx={{
                    "&:last-child td": { borderBottom: 0 },
                    "&:hover": { backgroundColor: "#daf2f2" },
                    "&:hover td": { backgroundColor: "inherit" },
                  }}
                >
                  <TableCell
                    sx={{
                      borderBottom: "1px solid #f5f5f5",
                      borderRight: "1px solid #000000",
                    }}
                  >
                    {appointment.availability_id}
                  </TableCell>
                  <TableCell
                    sx={{
                      borderBottom: "1px solid #f5f5f5",
                      borderRight: "1px solid #000000",
                    }}
                  >
                    {formatDateTime(
                      getAvailabilityDate(appointment.availability_id)
                    )}
                  </TableCell>
                  <TableCell
                    sx={{
                      borderBottom: "1px solid #f5f5f5",
                      borderRight: "1px solid #000000",
                    }}
                  >
                    {getPendingStatus(
                      getAvailabilityDate(appointment.availability_id)
                    )}
                  </TableCell>
                  <TableCell
                    sx={{
                      borderBottom: "1px solid #f5f5f5",
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    {getPendingStatus(
                      getAvailabilityDate(appointment.availability_id)
                    ) === "Future" ||
                    getPendingStatus(
                      getAvailabilityDate(appointment.availability_id)
                    ) === "Today" ? (
                      <Button>
                        {appointment.confirmed ? (
                          <Button
                            style={{
                              backgroundColor: "#a0d4d4",
                              color: "white",
                              borderRadius: "9px",
                              padding: "4px 8px",
                              marginLeft: "50px",
                            }}
                          >
                            Pending...
                          </Button>
                        ) : (
                          <>
                            <Button
                              onClick={() => handleAccept(appointment.id)}
                              variant="outlined"
                              color="success"
                              sx={{ marginRight: "8px" }}
                            >
                              Accept
                            </Button>
                            <Button
                              onClick={() => handleDecline(appointment.id)}
                              variant="outlined"
                              color="error"
                              sx={{ marginRight: "8px" }}
                            >
                              Decline
                            </Button>
                          </>
                        )}
                      </Button>
                    ) : (
                      <Button
                        onClick={() => handleDone(appointment.id)}
                        variant="outlined"
                        color="success"
                        sx={{ marginLeft: "70px" }}
                      >
                        Done
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
      </TableContainer>
    </Box>
  );
};

export default AvailabilityTable;
