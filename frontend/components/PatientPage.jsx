"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { X } from "lucide-react";

export default function PatientPage({
  setAddPatientPage,
  setEditPatientPage,
  id = false,
  EditPatientPage,
}) {
  const [form, setForm] = useState({
    PatName: "",
    Gender: "",
    MobNo: "",
    Address: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  useEffect(() => {
    if (!id && !EditPatientPage) return;

    const fetchSingleData = () => {
      axios
        .get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/patient/get-by-id/${id}`,
          {
            withCredentials: true,
          }
        )
        .then((res) => {
         // console.log(res?.data[0]);
          setForm({
            PatName: res?.data[0]?.PatName,
            Gender: res?.data[0]?.Gender,
            MobNo: res?.data[0]?.MobNo,
            Address: res?.data[0]?.Address,
          });
        })
        .catch((err) => {
          console.log(err);
        });
    };

    fetchSingleData();
  }, [id, EditPatientPage]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      if (id) {
        const res = await axios.put(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/patient/update/${id}`,
          { data: form },
          { withCredentials: true }
        );
      //  console.log(res);
        if (res.data.success) {
          setMessage("✅ Patient update successfully!");
        } else {
          setMessage("❌ " + res.data.message);
        }
      } else {
        const res = await axios.post(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/patient/add`,
          { data: form },
          { withCredentials: true }
        );
        if (res.data.success) {
          setMessage("✅ Patient added successfully!");
          setForm({ PatName: "", Gender: "", MobNo: "", Address: "" });
        } else {
          setMessage("❌ " + res.data.message);
        }
      }
    } catch (error) {
      console.error(error);
      setMessage("❌ Failed to add patient");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        id ? setEditPatientPage(false) : setAddPatientPage(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [setEditPatientPage, setAddPatientPage, id]);

  return (
    <>
      <div className="max-w-md mx-auto p-6 bg-white dark:bg-neutral-900 rounded-xl shadow-lg">
        <h2 className="text-xl font-bold mb-4 dark:text-white flex items-center justify-between">
          {id ? "Edit Patient" : "Add New Patient"}
          <span
            onClick={() => {
              EditPatientPage
                ? setEditPatientPage(false)
                : setAddPatientPage(false);
            }}
          >
            <X />
          </span>
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 dark:text-gray-200">
              Patient Name
            </label>
            <input
              type="text"
              name="PatName"
              value={form.PatName}
              onChange={handleChange}
              required
              className="w-full p-2 border rounded-lg dark:bg-neutral-800 dark:text-white"
              tabIndex={1}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 dark:text-gray-200">
              Gender
            </label>
            <select
              name="Gender"
              value={form.Gender}
              onChange={handleChange}
              required
              className="w-full p-2 border rounded-lg dark:bg-neutral-800 dark:text-white"
              tabIndex={2}
            >
              <option value="">-- Select Gender --</option>
              <option value="M">Male</option>
              <option value="F">Female</option>
              <option value="T">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 dark:text-gray-200">
              Mobile No
            </label>
            <input
              type="tel"
              name="MobNo"
              value={form.MobNo}
              onChange={handleChange}
              required
              className="w-full p-2 border rounded-lg dark:bg-neutral-800 dark:text-white"
              tabIndex={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 dark:text-gray-200">
              Address
            </label>
            <textarea
              name="Address"
              value={form.Address || ""}
              onChange={handleChange}
              rows={3}
              className="w-full p-2 border rounded-lg dark:bg-neutral-800 dark:text-white"
              tabIndex={4}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow"
            tabIndex={5}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSubmit();
              }
            }}
          >
            {loading ? "Loading..." : "Save"}
          </button>
        </form>

        {message && (
          <p className="mt-4 text-sm text-center dark:text-gray-200">
            {message}
          </p>
        )}
      </div>
    </>
  );
}
