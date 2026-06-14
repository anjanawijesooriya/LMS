import React, { useState, useCallback } from "react";
import { Calendar, momentLocalizer, Views } from "react-big-calendar";
import moment from "moment";
import { Modal, Tag } from "antd";
import {
  CalendarOutlined,
  ClockCircleOutlined,
  LinkOutlined,
  FileTextOutlined,
  StopOutlined,
} from "@ant-design/icons";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "./ClassCalendar.css";

const localizer = momentLocalizer(moment);

// One distinct color per grade
const GRADE_COLORS = {
  "Pre-School": "#ec4899",
  "Grade 1":    "#f97316",
  "Grade 2":    "#f59e0b",
  "Grade 3":    "#84cc16",
  "Grade 4":    "#10b981",
  "Grade 5":    "#06b6d4",
  "Grade 6":    "#3b82f6",
  "Grade 7":    "#6366f1",
  "Grade 8":    "#8b5cf6",
  "Grade 9":    "#a855f7",
  "Grade 10":   "#d946ef",
  "Grade 11":   "#f43f5e",
  "Grade 12":   "#ef4444",
  "Grade 13":   "#64748b",
};

const getGradeColor = (grade) => GRADE_COLORS[grade] || "#6366f1";

const isClassEnded = (cls) => {
  const dateStr = moment(cls.classDate).format("YYYY-MM-DD");
  return moment(`${dateStr} ${cls.classTime}`, "YYYY-MM-DD HH:mm")
    .add(90, "minutes")
    .isBefore(moment());
};

// ─── Event tooltip label ──────────────────────────────────────────────────────
const tooltipAccessor = (event) => {
  const cls = event.resource;
  const suffix = cls.isCancelled ? "  [CANCELLED]" : isClassEnded(cls) ? "  [ENDED]" : "";
  return `${cls.className}  ·  ${cls.classGrade}  ·  ${moment(cls.classTime, "HH:mm").format("hh:mm A")}${suffix}`;
};

// ─── Custom event block renderer ──────────────────────────────────────────────
const EventBlock = ({ event, title }) => {
  const cls = event.resource;
  const ended = isClassEnded(cls);
  return (
    <div className="flex items-center gap-1 overflow-hidden leading-tight h-full">
      {cls.isCancelled && <StopOutlined style={{ fontSize: 10, opacity: 0.8, flexShrink: 0 }} />}
      {!cls.isCancelled && ended && <ClockCircleOutlined style={{ fontSize: 10, opacity: 0.8, flexShrink: 0 }} />}
      <span className={`truncate font-medium ${cls.isCancelled ? "line-through" : ""}`}>
        {title}
      </span>
    </div>
  );
};

// ─── Main component ───────────────────────────────────────────────────────────
const ClassCalendar = ({ classes = [] }) => {
  const [selectedClass, setSelectedClass] = useState(null);
  const [view, setView] = useState(Views.MONTH);
  const [date, setDate] = useState(new Date());

  // Convert DB classes → react-big-calendar event objects
  const events = classes.map((cls) => {
    const dateStr = moment(cls.classDate).format("YYYY-MM-DD");
    const start = moment(`${dateStr} ${cls.classTime}`, "YYYY-MM-DD HH:mm").toDate();
    const end   = moment(start).add(90, "minutes").toDate();
    return {
      id:       cls._id,
      title:    cls.className,
      start,
      end,
      resource: cls,
    };
  });

  // Colour events by grade; grey for cancelled; muted grade colour for ended
  const eventPropGetter = useCallback((event) => {
    const cls   = event.resource;
    const ended = isClassEnded(cls);
    const color = cls.isCancelled ? "#94a3b8" : getGradeColor(cls.classGrade);
    return {
      style: {
        backgroundColor: color,
        borderColor:     color,
        opacity:         cls.isCancelled ? 0.45 : ended ? 0.5 : 1,
        borderRadius:    "6px",
        fontSize:        "12px",
        color:           "#fff",
        cursor:          "pointer",
      },
    };
  }, []);

  // Unique grades present in the data (for the legend)
  const uniqueGrades = [...new Set(classes.map((c) => c.classGrade))].sort((a, b) => {
    const num = (g) => parseInt(g.replace(/\D/g, "")) || 0;
    return num(a) - num(b);
  });

  const hasCancelled = classes.some((c) => c.isCancelled);
  const hasEnded     = classes.some((c) => !c.isCancelled && isClassEnded(c));

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-md border border-slate-200/50 dark:border-slate-700/50 overflow-hidden">

      {/* ── Header ── */}
      <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-violet-500 rounded-lg flex items-center justify-center">
              <CalendarOutlined className="text-white text-sm" />
            </div>
            <div>
              <h3 className="font-poppins font-semibold text-slate-900 dark:text-white leading-tight">
                Class Schedule
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {classes.length} classes · click any event for details
              </p>
            </div>
          </div>

          {/* Grade colour legend */}
          <div className="flex flex-wrap gap-2 max-w-lg">
            {uniqueGrades.map((grade) => (
              <span
                key={grade}
                className="inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-full text-white shadow-sm"
                style={{ backgroundColor: getGradeColor(grade) }}
              >
                {grade}
              </span>
            ))}
            {hasEnded && (
              <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-slate-300 text-slate-600">
                <ClockCircleOutlined style={{ fontSize: 10 }} /> Ended
              </span>
            )}
            {hasCancelled && (
              <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-slate-400 text-white">
                <StopOutlined style={{ fontSize: 10 }} /> Cancelled
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ── Calendar ── */}
      <div className="p-4 rbc-wrapper">
        <Calendar
          localizer={localizer}
          events={events}
          view={view}
          date={date}
          onView={setView}
          onNavigate={setDate}
          onSelectEvent={(event) => setSelectedClass(event.resource)}
          eventPropGetter={eventPropGetter}
          components={{ event: EventBlock }}
          tooltipAccessor={tooltipAccessor}
          views={[Views.MONTH, Views.WEEK, Views.AGENDA]}
          popup
          style={{ height: 580 }}
          formats={{
            agendaDateFormat:  "ddd, DD MMM YYYY",
            agendaTimeFormat:  "hh:mm A",
            dayHeaderFormat:   "dddd DD MMM",
            dayRangeHeaderFormat: ({ start, end }) =>
              `${moment(start).format("DD MMM")} – ${moment(end).format("DD MMM YYYY")}`,
          }}
        />
      </div>

      {/* ── Detail modal ── */}
      <Modal
        open={!!selectedClass}
        onCancel={() => setSelectedClass(null)}
        footer={null}
        title={null}
        width={440}
        styles={{ body: { paddingTop: 8 } }}
      >
        {selectedClass && (() => {
          const ended = isClassEnded(selectedClass);
          return (
          <div>
            {/* Modal header */}
            <div className="flex items-center gap-3 mb-5 pb-4 border-b border-slate-100">
              <div
                className="w-3 h-10 rounded-full shrink-0"
                style={{
                  backgroundColor: selectedClass.isCancelled || ended
                    ? "#94a3b8"
                    : getGradeColor(selectedClass.classGrade),
                  opacity: ended && !selectedClass.isCancelled ? 0.6 : 1,
                }}
              />
              <div>
                <h2
                  className={`font-poppins font-bold text-lg leading-tight ${
                    selectedClass.isCancelled ? "line-through text-slate-400" : "text-slate-900"
                  }`}
                >
                  {selectedClass.className}
                </h2>
                <div className="flex items-center gap-2 mt-1">
                  <Tag
                    color={selectedClass.isCancelled || ended ? "default" : undefined}
                    style={
                      !selectedClass.isCancelled && !ended
                        ? { backgroundColor: getGradeColor(selectedClass.classGrade), color: "#fff", border: "none" }
                        : {}
                    }
                  >
                    {selectedClass.classGrade}
                  </Tag>
                  {selectedClass.isCancelled ? (
                    <Tag color="red" icon={<StopOutlined />}>Cancelled</Tag>
                  ) : ended ? (
                    <Tag color="default" icon={<ClockCircleOutlined />}>Ended</Tag>
                  ) : (
                    <Tag color="green">Scheduled</Tag>
                  )}
                </div>
              </div>
            </div>

            {/* Details rows */}
            <div className="space-y-3 text-sm">
              <DetailRow
                icon={<CalendarOutlined className="text-indigo-500" />}
                label="Date"
                value={moment(selectedClass.classDate).format("dddd, DD MMMM YYYY")}
              />
              <DetailRow
                icon={<ClockCircleOutlined className="text-indigo-500" />}
                label="Time"
                value={
                  <>
                    {moment(selectedClass.classTime, "HH:mm").format("hh:mm A")}
                    <span className="text-slate-400 ml-1 text-xs">· 90 min</span>
                    <span className="text-slate-400 ml-1 text-xs">
                      (ends {moment(selectedClass.classTime, "HH:mm").add(90, "minutes").format("hh:mm A")})
                    </span>
                  </>
                }
              />
              {selectedClass.isCancelled && selectedClass.cancellationReason && (
                <DetailRow
                  icon={<StopOutlined className="text-red-500" />}
                  label="Reason"
                  value={<span className="text-red-500">{selectedClass.cancellationReason}</span>}
                />
              )}
              {selectedClass.description && (
                <DetailRow
                  icon={<FileTextOutlined className="text-indigo-500" />}
                  label="Details"
                  value={selectedClass.description}
                />
              )}
              {selectedClass.notes && (
                <DetailRow
                  icon={<FileTextOutlined className="text-slate-400" />}
                  label="Notes"
                  value={selectedClass.notes}
                />
              )}
              {selectedClass.classLink && !selectedClass.isCancelled && (
                <DetailRow
                  icon={<LinkOutlined className={ended ? "text-slate-300" : "text-indigo-500"} />}
                  label="Link"
                  value={
                    ended ? (
                      <span className="text-slate-400 line-through break-all text-xs">
                        Class has ended
                      </span>
                    ) : (
                      <a
                        href={selectedClass.classLink}
                        target="_blank"
                        rel="noreferrer"
                        className="text-indigo-600 hover:text-indigo-500 hover:underline break-all"
                      >
                        Join Class →
                      </a>
                    )
                  }
                />
              )}
            </div>
          </div>
          );
        })()}
      </Modal>
    </div>
  );
};

// ─── Small helper for modal rows ──────────────────────────────────────────────
const DetailRow = ({ icon, label, value }) => (
  <div className="flex items-start gap-3">
    <div className="w-5 flex items-center justify-center mt-0.5 shrink-0">{icon}</div>
    <span className="text-slate-400 w-16 shrink-0">{label}</span>
    <span className="text-slate-700 flex-1">{value}</span>
  </div>
);

export default ClassCalendar;
