import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Clock3,
} from "lucide-react";
import { BrandLogo } from "../../components/BrandLogo";
import { apiRequest } from "../../services/api";

interface WorkerAvailability {
  id: number;
  worker_id: number;
  day_of_week: string;
  start_time: string | null;
  end_time: string | null;
  is_available: boolean;
  created_at: string;
}

const days = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

export default function Availability() {
  const navigate = useNavigate();

  const [availability, setAvailability] = useState<
    Record<string, WorkerAvailability | null>
  >({});

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadAvailability = async () => {
      try {
        const data =
          await apiRequest<WorkerAvailability[]>(
            "/api/profile/worker/availability"
          );

        const mapped: Record<
          string,
          WorkerAvailability | null
        > = {};

        days.forEach((day) => {
          mapped[day] = null;
        });

        data.forEach((item) => {
          mapped[item.day_of_week] = item;
        });

        setAvailability(mapped);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load availability."
        );
      } finally {
        setLoading(false);
      }
    };

    loadAvailability();
  }, []);

  const toggleDay = (day: string) => {
    setAvailability((current) => {
      const existing = current[day];

      if (existing) {
        return {
          ...current,
          [day]: {
            ...existing,
            is_available: !existing.is_available,
          },
        };
      }

      return {
        ...current,
        [day]: {
          id: 0,
          worker_id: 0,
          day_of_week: day,
          start_time: "09:00:00",
          end_time: "18:00:00",
          is_available: true,
          created_at: "",
        },
      };
    });
  };

  const updateTime = (
    day: string,
    field: "start_time" | "end_time",
    value: string
  ) => {
    setAvailability((current) => {
      const existing = current[day];

      if (!existing) {
        return current;
      }

      return {
        ...current,
        [day]: {
          ...existing,
          [field]: value,
        },
      };
    });
  };

  const saveAvailability = async () => {
    setError("");
    setSaving(true);

    try {
      for (const day of days) {
        const item = availability[day];

        if (!item) {
          continue;
        }

        if (item.id === 0) {
          await apiRequest(
            "/api/profile/worker/availability",
            {
              method: "POST",
              body: JSON.stringify({
                day_of_week: item.day_of_week,
                start_time: item.start_time
                  ? item.start_time.slice(0, 5)
                  : null,
                end_time: item.end_time
                  ? item.end_time.slice(0, 5)
                  : null,
                is_available: item.is_available,
              }),
            }
          );
        } else {
          await apiRequest(
            `/api/profile/worker/availability/${item.id}`,
            {
              method: "PUT",
              body: JSON.stringify({
                day_of_week: item.day_of_week,
                start_time: item.start_time
                  ? item.start_time.slice(0, 5)
                  : null,
                end_time: item.end_time
                  ? item.end_time.slice(0, 5)
                  : null,
                is_available: item.is_available,
              }),
            }
          );
        }
      }

      navigate("/worker");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to save availability."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F8F8] flex items-center justify-center px-4">
      <div className="w-full max-w-md min-h-screen sm:min-h-[760px] bg-white sm:rounded-[32px] shadow-xl overflow-hidden flex flex-col">

        {/* Header */}
        <div className="bg-[#087F7A] px-6 pt-8 pb-8 rounded-b-[34px]">

          <button
            type="button"
            onClick={() => navigate("/worker/skills")}
            disabled={saving}
            className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition disabled:opacity-50"
          >
            <ArrowLeft size={20} />
          </button>

          <div className="mt-6 flex items-center gap-3">

            <BrandLogo size="sm" />

            <div>
              <p className="text-white/60 text-xs">
                Worker Profile
              </p>

              <h1 className="text-xl font-bold text-white">
                Your availability
              </h1>
            </div>

          </div>

          <p className="text-white/75 text-sm mt-4 leading-5">
            Set the days and hours when customers can book your services.
          </p>

        </div>

        {/* Progress */}
        <div className="px-6 pt-6">

          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-[#087F7A]">
              Step 2 of 2
            </span>

            <span className="text-xs text-gray-400">
              Weekly schedule
            </span>
          </div>

          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full w-full bg-[#087F7A] rounded-full" />
          </div>

        </div>

        {/* Content */}
        <div className="flex-1 px-6 pt-6 overflow-y-auto">

          <h2 className="text-lg font-bold text-gray-900">
            When are you available?
          </h2>

          <p className="text-xs text-gray-500 mt-1 mb-5">
            Select a day and set your working hours.
          </p>

          {loading ? (
            <div className="py-12 text-center">
              <p className="text-sm text-gray-400">
                Loading your schedule...
              </p>
            </div>
          ) : (
            <div className="space-y-3 pb-5">

              {days.map((day) => {
                const item = availability[day];
                const isAvailable =
                  item?.is_available === true;

                return (
                  <div
                    key={day}
                    className={`rounded-2xl border-2 p-4 transition ${
                      isAvailable
                        ? "border-[#087F7A] bg-teal-50"
                        : "border-gray-100 bg-white"
                    }`}
                  >

                    <div className="flex items-center justify-between">

                      <button
                        type="button"
                        onClick={() => toggleDay(day)}
                        disabled={saving}
                        className="flex items-center gap-3 text-left disabled:opacity-60"
                      >

                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                            isAvailable
                              ? "bg-[#087F7A]"
                              : "bg-gray-100"
                          }`}
                        >
                          {isAvailable ? (
                            <Check
                              size={18}
                              className="text-white"
                              strokeWidth={3}
                            />
                          ) : (
                            <Clock3
                              size={18}
                              className="text-gray-400"
                            />
                          )}
                        </div>

                        <div>
                          <p className="text-sm font-semibold text-gray-900">
                            {day}
                          </p>

                          <p className="text-[11px] text-gray-400">
                            {isAvailable
                              ? "Available"
                              : "Not available"}
                          </p>
                        </div>

                      </button>

                      <button
                        type="button"
                        onClick={() => toggleDay(day)}
                        disabled={saving}
                        className={`relative w-11 h-6 rounded-full transition ${
                          isAvailable
                            ? "bg-[#087F7A]"
                            : "bg-gray-200"
                        }`}
                      >
                        <span
                          className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition ${
                            isAvailable
                              ? "left-6"
                              : "left-1"
                          }`}
                        />
                      </button>

                    </div>

                    {isAvailable && item && (
                      <div className="grid grid-cols-2 gap-3 mt-4">

                        <div>
                          <label className="block text-[11px] font-semibold text-gray-500 mb-1.5">
                            Start time
                          </label>

                          <input
                            type="time"
                            value={
                              item.start_time
                                ? item.start_time.slice(0, 5)
                                : ""
                            }
                            onChange={(e) =>
                              updateTime(
                                day,
                                "start_time",
                                e.target.value
                              )
                            }
                            disabled={saving}
                            className="w-full h-11 rounded-xl border border-gray-200 bg-white px-3 text-sm outline-none focus:border-[#087F7A]"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-gray-500 mb-1.5">
                            End time
                          </label>

                          <input
                            type="time"
                            value={
                              item.end_time
                                ? item.end_time.slice(0, 5)
                                : ""
                            }
                            onChange={(e) =>
                              updateTime(
                                day,
                                "end_time",
                                e.target.value
                              )
                            }
                            disabled={saving}
                            className="w-full h-11 rounded-xl border border-gray-200 bg-white px-3 text-sm outline-none focus:border-[#087F7A]"
                          />
                        </div>

                      </div>
                    )}

                  </div>
                );
              })}

            </div>
          )}

          {error && (
            <div className="rounded-2xl bg-red-50 border border-red-100 px-4 py-3 mb-4">
              <p className="text-sm text-red-600">
                {error}
              </p>
            </div>
          )}

        </div>

        {/* Bottom */}
        <div className="px-6 pb-7 pt-5 bg-white border-t border-gray-100">

          <button
            type="button"
            onClick={saveAvailability}
            disabled={loading || saving}
            className="w-full h-14 rounded-2xl bg-[#FF5A00] hover:bg-[#e95000] disabled:bg-gray-100 disabled:text-gray-400 text-white font-semibold flex items-center justify-center gap-2 shadow-lg shadow-orange-200 transition-all active:scale-[0.98] disabled:cursor-not-allowed"
          >
            {saving ? (
              "Saving availability..."
            ) : (
              <>
                Finish Setup
                <ArrowRight size={19} />
              </>
            )}
          </button>

          <p className="text-center text-[11px] text-gray-400 mt-3">
            You can change your availability anytime from your profile.
          </p>

        </div>

      </div>
    </div>
  );
}