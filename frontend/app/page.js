"use client";

import AppTabel from "@/components/AppTabel";
import PatientPage from "@/components/PatientPage";
import { initSocket } from "@/utils/socket";
import axios from "axios";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

export default function Home() {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [AddPatientPage, setAddPatientPage] = useState(false);
  const [EditPatientPage, setEditPatientPage] = useState(false);
  const [PatID, setPatID] = useState(undefined)


  useEffect(() => {
    const fetchData = () => {
      setIsLoading(true);
      axios
        .get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/patient/get-list`, {
          withCredentials: true,
        })
        .then((res) => {
          console.log(res?.data);
          setData(res?.data);
          setIsLoading(false);
        })
        .catch((err) => {
          console.log(err);
          setIsLoading(false);
          setError(err);
        });
    };

    fetchData();

    const socket = initSocket();

    socket.on("patient:created", fetchData);
    socket.on("patient:updated", fetchData);
    socket.on("patient:deleted", fetchData);

    return () => {
      socket.off("patient:created", fetchData);
      socket.off("patient:updated", fetchData);
      socket.off("patient:deleted", fetchData);
    };
  }, []);

  const onClickDeleteBtn = async (id) => {
  //  console.log("Deleting id:", id); // This should now log a real id
    if (!id) {
      toast.error("No ID provided for deletion.");
      return;
    }

    try {
      await axios.delete(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/patient/delete/${id}`,
        {
          withCredentials: true,
        }
      );
      toast.success("Patient deleted successfully.");
    } catch (error) {
      console.error("Delete failed:", error);
      toast.error("Failed to delete Patient.");
    }
  };



  return (
    <>
      <AppTabel
        Data={data}
        loading={isLoading}
        setAddPatientPage={setAddPatientPage}
        setEditPatientPage={setEditPatientPage}
        setPatID={setPatID}
        loadingMore={""}
        error={
          typeof error === "string"
            ? error
            : error?.data?.message || error?.error || null
        }
        rowKey="PatID"
        columnNames={{
          PatID: "Patient ID",
          PatName: "Patient Name",
          Gender: "Gender",
          MobNo: "Mobile ",
          Address: "Address",
        }}
        onLoadMore={"loadMore"}
        hasMore={"hasMore"}
        onClickDeleteBtn={onClickDeleteBtn}
      />

      {AddPatientPage === true && (
        <>
          <div className="fixed w-full inset-0 z-50 flex items-center justify-center bg-opacity-60 bg-black/50 backdrop-blur-x">
            <div className="w-full m-2 lg:w-1/2 rounded overflow-hidden">
              <PatientPage setAddPatientPage={setAddPatientPage} />
            </div>
          </div>
        </>
      )}

      {EditPatientPage === true && (
        <>
          <div className="fixed w-full inset-0 z-50 flex items-center justify-center bg-opacity-60 bg-black/50 backdrop-blur-x">
            <div className="w-full m-2 lg:w-1/2 rounded overflow-hidden">
              <PatientPage setEditPatientPage={setEditPatientPage} id={PatID} EditPatientPage={EditPatientPage}/>
            </div>
          </div>
        </>
      )}
    </>
  );
}
